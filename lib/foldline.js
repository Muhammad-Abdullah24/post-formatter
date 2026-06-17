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
  const lower = firstLine.toLowerCase();

  if (!firstLine || len < 10) {
    return { score: 'weak', numericScore: 0, message: 'Write your opening line to see hook analysis.', points: [], color: 'var(--ink-tertiary)' };
  }

  let points = 0;
  const feedback = [];

  // --- LENGTH SCORING ---
  if (len >= 40 && len <= 150) {
    points += 2;
    feedback.push({ type: 'good', text: `Hook is ${len} chars — ideal length for the preview window.` });
  } else if (len > 150 && len <= 200) {
    points += 1;
    feedback.push({ type: 'ok', text: `Hook is ${len} chars — close to the fold. Consider tightening.` });
  } else if (len > 200) {
    feedback.push({ type: 'bad', text: `Hook is ${len} chars — gets cut off on desktop. Shorten it.` });
  } else {
    feedback.push({ type: 'ok', text: `Hook is only ${len} chars — could be more substantial.` });
  }

  // --- PATTERN SCORING ---
  // Question hook
  if (firstLine.endsWith('?')) {
    points += 2;
    feedback.push({ type: 'good', text: 'Question hook — drives comments and curiosity.' });
  }

  // Starts with a number / data
  if (/^\d/.test(firstLine) || /\b\d{2,}[%+xX]?\b/.test(firstLine)) {
    points += 2;
    feedback.push({ type: 'good', text: 'Leads with data or a number — high-CTR pattern.' });
  }

  // Pattern interrupt ("Stop X. Start Y.", "Most X do Y. I did Z.")
  if (/^(stop|most|everyone|nobody|never|don.t|the problem)/i.test(firstLine)) {
    points += 1;
    feedback.push({ type: 'good', text: 'Pattern interrupt opener — grabs attention fast.' });
  }

  // Vulnerable / confession opener
  if (/^i (failed|was wrong|lost|quit|got fired|almost|didn.t|made a mistake|struggled|screwed)/i.test(firstLine)) {
    points += 2;
    feedback.push({ type: 'good', text: 'Vulnerable opener — builds trust and drives engagement.' });
  }

  // Contrarian / bold claim
  if (/\b(myth|wrong|lie|unpopular|overrated|underrated|hot take|controversial|disagree)\b/i.test(firstLine)) {
    points += 1;
    feedback.push({ type: 'good', text: 'Contrarian framing — sparks debate in comments.' });
  }

  // --- PENALTY SCORING ---
  // Weak / generic openers
  const weakOpeners = [
    /^i.m (excited|thrilled|happy|proud|honored|pleased|delighted) to/i,
    /^(here.s what|here are|let me share|in today.s|i wanted to)/i,
    /^(i recently|i just|just wanted|i think that|i believe that)/i,
    /^(excited to announce|thrilled to share|happy to share)/i,
  ];
  for (const pattern of weakOpeners) {
    if (pattern.test(firstLine)) {
      points -= 2;
      feedback.push({ type: 'bad', text: 'Starts with a weak/generic opener — replace it with something specific.' });
      break;
    }
  }

  // All caps (shouting)
  if (firstLine === firstLine.toUpperCase() && len > 20) {
    points -= 1;
    feedback.push({ type: 'bad', text: 'All-caps hook feels like shouting. Use mixed case.' });
  }

  // Too many emojis
  const emojiCount = (firstLine.match(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
  if (emojiCount > 2) {
    points -= 1;
    feedback.push({ type: 'bad', text: `${emojiCount} emojis in the hook — keep it to 1 max.` });
  }

  // Starts with hashtag
  if (firstLine.startsWith('#')) {
    points -= 1;
    feedback.push({ type: 'bad', text: 'Starting with a hashtag wastes prime hook real estate.' });
  }

  // --- SPECIFICITY BONUS ---
  // Contains specifics (names, numbers, timeframes)
  if (/\b(\d+ (years?|months?|weeks?|days?|hours?|minutes?|people|clients?|companies|%))\b/i.test(firstLine)) {
    points += 1;
    feedback.push({ type: 'good', text: 'Includes specific details — makes the hook concrete and credible.' });
  }

  // If no strong patterns detected and no penalties, give neutral feedback
  if (feedback.length <= 1) {
    feedback.push({ type: 'ok', text: 'Hook is functional but generic. Try a question, number, or bold claim.' });
  }

  // Clamp score
  const finalScore = Math.max(0, Math.min(10, points));
  
  // Determine color and label
  let color, scoreLabel;
  if (finalScore >= 7) {
    color = 'var(--success)';
    scoreLabel = 'strong';
  } else if (finalScore >= 4) {
    color = 'var(--warning)';
    scoreLabel = 'ok';
  } else {
    color = 'var(--danger)';
    scoreLabel = 'weak';
  }

  return {
    score: scoreLabel,
    numericScore: finalScore,
    message: feedback[0]?.text || 'Hook is functional but generic.',
    points: feedback,
    color,
  };
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