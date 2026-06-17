import { toBoldSans, toItalicSans, toUnderline, toStrikethrough, stripStyling } from './unicode.js';

// Tokenize to plain lowercase words, ignoring styling and punctuation, so we
// can verify the AI didn't invent new content.
function wordTokens(text) {
  return stripStyling(text).toLowerCase().match(/[a-z0-9']+/g) || [];
}

function hashtagSet(text) {
  const tags = text.match(/#[\wÀ-ɏ]+/g) || [];
  return new Set(tags.map(t => t.toLowerCase()));
}

/**
 * Removes whole blocks the model invented (e.g. an appended CTA/question that
 * wasn't in the original). A block is considered invented if more than half its
 * words don't appear anywhere in the original. Blocks that merely reorder or
 * tighten original wording are kept, as are hashtag lines.
 */
export function removeInventedBlocks(formatted, original) {
  const originalWords = new Set(wordTokens(original));
  const blocks = formatted.split(/\n{2,}/);

  const kept = blocks.filter(block => {
    const tokens = wordTokens(block);
    if (tokens.length === 0) return true;           // emoji/symbol-only block
    if (/^[\s#\wÀ-ɏ]+$/.test(block.trim()) && block.trim().startsWith('#')) return true; // hashtag line
    const novel = tokens.filter(w => !originalWords.has(w)).length;
    return novel / tokens.length <= 0.5;
  });

  return kept.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Removes any hashtag from `formatted` that wasn't present in `original`.
 * The model occasionally invents hashtags; stripping them lets us keep the
 * otherwise-faithful bold formatting instead of discarding the whole result.
 */
export function stripForeignHashtags(formatted, original) {
  const originalTags = hashtagSet(original);
  let result = formatted.replace(/#[\wÀ-ɏ]+/g, (tag) =>
    originalTags.has(tag.toLowerCase()) ? tag : ''
  );
  // Tidy up whitespace left behind by removed tags.
  result = result
    .split('\n')
    .map(line => line.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return result;
}

/**
 * Guards the feature's core promise: "your words stay the same."
 * Rejects AI output that introduces substantial new vocabulary or adds
 * hashtags that weren't in the original (e.g. content bleeding in from the
 * prompt's few-shot example).
 */
export function preservesOriginalContent(original, formatted) {
  const formattedTokens = wordTokens(formatted);
  if (formattedTokens.length === 0) return false;

  const originalWords = new Set(wordTokens(original));
  let novel = 0;
  for (const w of formattedTokens) {
    if (!originalWords.has(w)) novel++;
  }
  if (novel / formattedTokens.length > 0.12) return false;

  // No hashtag may appear that wasn't in the original.
  const originalTags = hashtagSet(original);
  for (const tag of hashtagSet(formatted)) {
    if (!originalTags.has(tag)) return false;
  }

  return true;
}

const FILLER_WORDS = /\b(just|really|very|actually|basically|literally|honestly|simply|quite|perhaps|maybe)\b/gi;

export function analyzePostStructure(text) {
  const trimmed = text.trim();
  const lines = trimmed.split('\n');
  const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim());
  const words = trimmed.split(/\s+/).filter(Boolean);
  const firstLine = lines[0]?.trim() || '';
  const hashtags = trimmed.match(/#[\w\u00C0-\u024F]+/g) || [];
  const lastLine = lines[lines.length - 1]?.trim() || '';
  const hashtagsOnlyOnLastLine = hashtags.length === 0 || hashtags.every(tag => lastLine.includes(tag));

  const longParagraphs = paragraphs.filter(p => {
    const pLines = p.split('\n').filter(l => l.trim());
    return pLines.length > 2 || [...p].length > 200;
  });

  const wallOfText = paragraphs.some(p => !p.includes('\n') && [...p].length > 220);
  const hasListContent = paragraphs.some(p => {
    const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 8);
    return sentences.length >= 3 && !/^[•\-\d]/.test(p.trim());
  });

  const fillerMatches = trimmed.match(FILLER_WORDS) || [];
  const issues = [];

  if ([...firstLine].length > 210) issues.push('Opening line exceeds LinkedIn desktop fold (~210 chars)');
  if (wallOfText) issues.push('Contains a wall-of-text paragraph with no line breaks');
  if (longParagraphs.length > 0) issues.push(`${longParagraphs.length} paragraph(s) exceed 2 lines`);
  if (!hashtagsOnlyOnLastLine && hashtags.length > 0) issues.push('Hashtags appear mid-post instead of at the end');
  if (hasListContent) issues.push('List-like content could be formatted as bullets');
  if (fillerMatches.length >= 3) issues.push(`${fillerMatches.length} filler words detected`);
  if (paragraphs.length === 1 && words.length > 60) issues.push('Single dense block — needs visual rhythm');

  return {
    wordCount: words.length,
    charCount: trimmed.length,
    lineCount: lines.length,
    paragraphCount: paragraphs.length,
    firstLineLength: firstLine.length,
    longParagraphs: longParagraphs.length,
    wallOfText,
    hasListContent,
    fillerCount: fillerMatches.length,
    hashtagCount: hashtags.length,
    issues,
  };
}

export function buildFormatSummary(before, after) {
  const beforeAnalysis = analyzePostStructure(before);
  const afterAnalysis = analyzePostStructure(after);
  const changes = [];

  if (beforeAnalysis.paragraphCount < afterAnalysis.paragraphCount) {
    changes.push(`Split into ${afterAnalysis.paragraphCount} readable blocks`);
  }
  if (beforeAnalysis.wallOfText && !afterAnalysis.wallOfText) {
    changes.push('Broke up wall-of-text for mobile scrolling');
  }
  if (beforeAnalysis.longParagraphs > afterAnalysis.longParagraphs) {
    changes.push('Shortened long paragraphs to 1–2 lines each');
  }
  if (beforeAnalysis.firstLineLength > 210 && afterAnalysis.firstLineLength <= 210) {
    changes.push('Optimized opening line for desktop fold');
  }
  if (beforeAnalysis.hasListContent) {
    changes.push('Structured list content with bullets');
  }
  if (beforeAnalysis.fillerCount > afterAnalysis.fillerCount) {
    changes.push('Tightened filler language');
  }
  const boldRe = /[\u{1D400}-\u{1D7FF}]/gu;
  const beforeBold = (before.match(boldRe) || []).length;
  const afterBold = (after.match(boldRe) || []).length;
  if (afterBold > beforeBold + 2) {
    changes.push('Added bold emphasis to key phrases');
  }
  if (beforeAnalysis.issues.some(i => i.includes('Hashtags')) && afterAnalysis.hashtagCount > 0) {
    changes.push('Moved hashtags to the final line');
  }

  if (changes.length === 0) {
    if (before.trim() === after.trim()) {
      changes.push('Post is already well-structured for LinkedIn — no changes needed');
    } else {
      changes.push('Improved spacing and visual rhythm');
    }
  }

  return { before: beforeAnalysis, after: afterAnalysis, changes };
}

export function preFormatPost(text) {
  let result = text.replace(/\r\n/g, '\n').trim();

  // Move inline hashtags to the end
  const hashtagMatches = result.match(/#[\w\u00C0-\u024F]+/g) || [];
  if (hashtagMatches.length > 0) {
    const uniqueTags = [...new Set(hashtagMatches)];
    result = result.replace(/#[\w\u00C0-\u024F]+/g, '').replace(/  +/g, ' ').trim();
    result = result.replace(/\n{3,}/g, '\n\n');
    result = `${result}\n\n${uniqueTags.join(' ')}`.trim();
  }

  // Break wall-of-text paragraphs at sentence boundaries
  const paragraphs = result.split(/\n\s*\n/);
  const broken = paragraphs.map(paragraph => {
    const p = paragraph.trim();
    if (!p || p.includes('\n') || [...p].length < 180) return p;

    const sentences = p.split(/(?<=[.!?])\s+(?=[A-Z"“])/);
    if (sentences.length < 2) return p;

    const chunks = [];
    let current = '';

    for (const sentence of sentences) {
      const next = current ? `${current} ${sentence}` : sentence;
      if (next.length > 120 && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = next;
      }
    }
    if (current) chunks.push(current.trim());

    return chunks.length > 1 ? chunks.join('\n\n') : p;
  });

  return broken.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function convertMarkdownBoldToUnicode(text) {
  return text.replace(/\*\*(.*?)\*\*/g, (_, p1) => toBoldSans(p1));
}

// Convert all four typographic markers to their Unicode equivalents.
// Order matters: process ** before _ to avoid partial-match conflicts.
export function convertAllMarkdownToUnicode(text) {
  return text
    .replace(/\*\*(.+?)\*\*/gs, (_, p1) => toBoldSans(p1))
    .replace(/__(.+?)__/gs, (_, p1) => toUnderline(p1))
    .replace(/_([^_\n]+?)_/g, (_, p1) => toItalicSans(p1))
    .replace(/~~(.+?)~~/gs, (_, p1) => toStrikethrough(p1));
}

export function sanitizeFormattedOutput(raw, original) {
  let result = raw
    .replace(/^```[\w]*\n?|```$/g, '')
    .replace(/^["']|["']$/g, '')
    .replace(/^(here(?:'s| is) the (?:re)?formatted(?: post)?[:\s]*)/i, '')
    .replace(/^(formatted (?:post|version)[:\s]*)/i, '')
    .trim();

  // If model wrapped in quotes block
  const quoteMatch = result.match(/^"""\n?([\s\S]*?)\n?"""$/);
  if (quoteMatch) result = quoteMatch[1].trim();

  result = result.replace(/\n{3,}/g, '\n\n');

  // Convert markdown markers to Unicode equivalents
  result = convertAllMarkdownToUnicode(result);

  const originalWords = original.split(/\s+/).filter(Boolean).length;
  const resultWords = result.split(/\s+/).filter(Boolean).length;

  // Reject if model rewrote too aggressively (lost >40% of words)
  if (resultWords < originalWords * 0.60) {
    console.warn(`[Format API] Rejected formatted output due to excessive shortening. Original: ${originalWords} words, Formatted: ${resultWords} words.`);
    return null;
  }

  return result;
}
