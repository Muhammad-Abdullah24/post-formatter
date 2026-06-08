// LinkedIn shows "...see more" after ~210 chars on desktop (3 lines)
// and after ~280 chars on mobile (5 lines)
const DESKTOP_FOLD = 210;
const MOBILE_FOLD = 280;

export function getFoldAnalysis(text) {
  const len = text.length;

  return {
    charCount: len,
    desktopFolded: len > DESKTOP_FOLD,
    mobileFolded: len > MOBILE_FOLD,
    desktopPreview: text.slice(0, DESKTOP_FOLD),
    mobilePreview: text.slice(0, MOBILE_FOLD),
    desktopRemainder: text.slice(DESKTOP_FOLD),
    mobileRemainder: text.slice(MOBILE_FOLD),
    hookStrength: getHookStrength(text),
  };
}

function getHookStrength(text) {
  const firstLine = text.split('\n')[0].trim();
  const len = firstLine.length;

  // Too short — no hook
  if (len < 30) return { score: 'weak', message: 'First line too short to hook anyone.' };

  // Ends mid-sentence at fold — bad cut
  if (len > DESKTOP_FOLD) return { score: 'bad', message: 'Hook is cut off on desktop. Shorten your first line.' };

  // Question hooks perform well
  if (firstLine.endsWith('?')) return { score: 'strong', message: 'Question hook — good for engagement.' };

  // Number hooks
  if (/^\d/.test(firstLine)) return { score: 'strong', message: 'Starts with a number — high CTR pattern.' };

  // Default
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