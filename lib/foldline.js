/**
 * LinkedIn "see more" fold logic
 *
 * LinkedIn truncates after 3 RENDERED lines on desktop.
 * Rules:
 *   - Every \n starts a new rendered line
 *   - Blank lines (empty or whitespace-only) count as a full line
 *   - Long text lines wrap based on the column width of the preview card
 *
 * Desktop preview card inner width ≈ 516px at 14px system font → ~72 chars per line
 * Mobile preview width ≈ 320px                                   → ~44 chars per line
 */

const DESKTOP_CHARS_PER_LINE = 72;
const MOBILE_CHARS_PER_LINE  = 44;
const DESKTOP_MAX_LINES      = 3;
const MOBILE_MAX_LINES       = 3;

/**
 * Given a raw text string, walk through each \n-separated paragraph
 * and count how many rendered lines are consumed, accounting for word-wrap.
 *
 * Returns:
 *   { folded: bool, preview: string, remainder: string }
 *
 * The `preview` is the exact slice of text visible before the fold.
 * The `remainder` is everything after.
 */
function computeFold(text, charsPerLine, maxLines) {
  if (!text) return { folded: false, preview: text, remainder: '' };

  const paragraphs = text.split('\n');
  let linesUsed = 0;
  let charsCounted = 0; // total chars consumed so far (including \n)

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];

    // How many rendered lines does this paragraph occupy?
    const paraLines = para.length === 0
      ? 1                                            // blank line → 1 line
      : Math.ceil(para.length / charsPerLine) || 1; // text → wraps

    if (linesUsed + paraLines <= maxLines) {
      // This paragraph fits entirely within the budget
      linesUsed   += paraLines;
      charsCounted += para.length + (pIdx < paragraphs.length - 1 ? 1 : 0); // +1 for \n

      if (linesUsed === maxLines && pIdx < paragraphs.length - 1) {
        // We've used all lines but there is more content — fold here
        return {
          folded: true,
          preview: text.slice(0, charsCounted).trimEnd(),
          remainder: text.slice(charsCounted),
        };
      }
    } else {
      // This paragraph would overflow — we need to cut inside it
      const remainingLines = maxLines - linesUsed;
      const charsToShow    = remainingLines * charsPerLine;

      // Find a clean word boundary near the cut point
      let cut = para.slice(0, charsToShow);
      const lastSpace = cut.lastIndexOf(' ');
      if (lastSpace > charsToShow * 0.5) {
        cut = cut.slice(0, lastSpace);
      }

      const previewText = text.slice(0, charsCounted + cut.length).trimEnd();
      return {
        folded: true,
        preview: previewText,
        remainder: text.slice(charsCounted + cut.length),
      };
    }
  }

  // All content fit within maxLines
  return { folded: false, preview: text, remainder: '' };
}

export function getFoldAnalysis(text) {
  if (!text) {
    return {
      charCount: 0,
      desktopFolded: false,
      mobileFolded: false,
      desktopPreview: '',
      mobilePreview: '',
      desktopRemainder: '',
      mobileRemainder: '',
      hookStrength: getHookStrength(''),
    };
  }

  const desktop = computeFold(text, DESKTOP_CHARS_PER_LINE, DESKTOP_MAX_LINES);
  const mobile  = computeFold(text, MOBILE_CHARS_PER_LINE,  MOBILE_MAX_LINES);

  return {
    charCount: text.length,
    desktopFolded: desktop.folded,
    mobileFolded:  mobile.folded,
    desktopPreview: desktop.preview,
    mobilePreview:  mobile.preview,
    desktopRemainder: desktop.remainder,
    mobileRemainder:  mobile.remainder,
    hookStrength: getHookStrength(text),
  };
}

function getHookStrength(text) {
  const firstLine = text.split('\n')[0].trim();
  const len = firstLine.length;

  if (!firstLine || len < 20) {
    return { score: 'weak', message: 'First line too short to hook anyone.' };
  }

  if (len > DESKTOP_CHARS_PER_LINE * 2) {
    return { score: 'bad', message: 'Hook is cut off on desktop. Shorten your first line.' };
  }

  if (firstLine.endsWith('?')) {
    return { score: 'strong', message: 'Question hook — good for engagement.' };
  }

  if (/^\d/.test(firstLine)) {
    return { score: 'strong', message: 'Starts with a number — high CTR pattern.' };
  }

  return { score: 'ok', message: 'Hook looks fine. Could be punchier.' };
}

export function getSeoWarnings(text, boldedWords = []) {
  const warnings = [];
  boldedWords.forEach(word => {
    warnings.push({
      word,
      message: `"${word}" is bolded via Unicode — LinkedIn can't index it as a keyword.`,
    });
  });
  return warnings;
}