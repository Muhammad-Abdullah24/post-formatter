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
    return pLines.length > 2 || p.length > 200;
  });

  const wallOfText = paragraphs.some(p => !p.includes('\n') && p.length > 220);
  const hasListContent = paragraphs.some(p => {
    const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 8);
    return sentences.length >= 3 && !/^[•\-\d]/.test(p.trim());
  });

  const fillerMatches = trimmed.match(FILLER_WORDS) || [];
  const issues = [];

  if (firstLine.length > 210) issues.push('Opening line exceeds LinkedIn desktop fold (~210 chars)');
  if (firstLine.length < 20 && words.length > 40) issues.push('Opening line is too short for the post length');
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
  if (before !== after && /[\u{1D400}-\u{1D7FF}]/u.test(after) && !/[\u{1D400}-\u{1D7FF}]/u.test(before)) {
    changes.push('Added Unicode emphasis to key phrases');
  }
  if (beforeAnalysis.issues.some(i => i.includes('Hashtags')) && afterAnalysis.hashtagCount > 0) {
    changes.push('Moved hashtags to the final line');
  }

  if (changes.length === 0) {
    changes.push('Improved spacing and visual rhythm');
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
    if (!p || p.includes('\n') || p.length < 180) return p;

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

  const originalWords = original.split(/\s+/).filter(Boolean).length;
  const resultWords = result.split(/\s+/).filter(Boolean).length;

  // Reject if model rewrote too aggressively (lost >35% of words)
  if (resultWords < originalWords * 0.65) {
    return null;
  }

  return result;
}
