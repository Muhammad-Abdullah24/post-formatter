const TRANSFORMS = {
  bold: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    upperOut: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙',
    lowerOut: '𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳',
    digitsOut: '𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗',
  },
  italic: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upperOut: '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝐌𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍',
    lowerOut: '𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧',
  },
  boldItalic: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upperOut: '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁',
    lowerOut: '𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛',
  },
  sans: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    upperOut: '𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹',
    lowerOut: '𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓',
    digitsOut: '𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫',
  },
  boldSans: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    upperOut: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭',
    lowerOut: '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇',
    digitsOut: '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵',
  },
  italicSans: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upperOut: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡',
    lowerOut: '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻',
  },
  boldItalicSans: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upperOut: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉',
    lowerOut: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣',
  },
  script: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upperOut: '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵',
    lowerOut: '𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏',
  },
  doublestruck: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    upperOut: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ',
    lowerOut: '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫',
    digitsOut: '𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡',
  },
};

function applyTransform(text, transform) {
  return [...text].map(char => {
    const uIdx = transform.upper?.indexOf(char);
    const lIdx = transform.lower?.indexOf(char);
    const dIdx = transform.digits?.indexOf(char);
    if (uIdx !== undefined && uIdx > -1) return [...transform.upperOut][uIdx];
    if (lIdx !== undefined && lIdx > -1) return [...transform.lowerOut][lIdx];
    if (dIdx !== undefined && dIdx > -1) return [...transform.digitsOut][dIdx];
    return char;
  }).join('');
}

export function toBold(text) { return applyTransform(text, TRANSFORMS.bold); }
export function toItalic(text) { return applyTransform(text, TRANSFORMS.italic); }
export function toBoldItalic(text) { return applyTransform(text, TRANSFORMS.boldItalic); }
export function toSans(text) { return applyTransform(text, TRANSFORMS.sans); }
export function toBoldSans(text) { return applyTransform(text, TRANSFORMS.boldSans); }
export function toItalicSans(text) { return applyTransform(text, TRANSFORMS.italicSans); }
export function toBoldItalicSans(text) { return applyTransform(text, TRANSFORMS.boldItalicSans); }
export function toScript(text) { return applyTransform(text, TRANSFORMS.script); }
export function toDoublestruck(text) { return applyTransform(text, TRANSFORMS.doublestruck); }

// Reverse map: every styled glyph -> its plain ASCII source. Built once from
// the TRANSFORMS table so we can compare formatted text against the original
// regardless of which Unicode style was applied.
const STYLE_REVERSE_MAP = (() => {
  const map = new Map();
  for (const t of Object.values(TRANSFORMS)) {
    for (const [src, out] of [['upper', 'upperOut'], ['lower', 'lowerOut'], ['digits', 'digitsOut']]) {
      if (!t[src] || !t[out]) continue;
      const srcArr = [...t[src]];
      const outArr = [...t[out]];
      outArr.forEach((glyph, i) => { if (!map.has(glyph)) map.set(glyph, srcArr[i]); });
    }
  }
  return map;
})();

// Strip all Unicode styling (bold/italic/script/etc. + combining underline /
// strikethrough) back to plain ASCII. Used for word-preservation checks.
export function stripStyling(text) {
  return [...text.replace(/[\u0332\u0336]/g, '')]
    .map(c => STYLE_REVERSE_MAP.get(c) || c)
    .join('');
}

export function toUnderline(text) {
  return [...text].map(c => c + '\u0332').join('');
}

export function toStrikethrough(text) {
  return [...text].map(c => c + '\u0336').join('');
}

export function toFullwidth(text) {
  return [...text].map(c => {
    const code = c.charCodeAt(0);
    if (code >= 33 && code <= 126) return String.fromCharCode(code + 65248);
    if (code === 32) return '\u3000';
    return c;
  }).join('');
}

export function toUppercase(text) { return text.toUpperCase(); }
export function toLowercase(text) { return text.toLowerCase(); }

const LIST_PREFIX_RE = /^(?:[•☐]\s*|\d+\.\s+|\d+→\s*)/;

function toggleList(text, prefixFn, testRe) {
  const lines = text.split('\n');
  const contentLines = lines.filter(l => l.trim());
  if (contentLines.length === 0) return text;
  
  const allMatch = contentLines.every(l => testRe.test(l));
  
  if (allMatch) {
    return lines.map(l => l.replace(testRe, '')).join('\n');
  } else {
    const strippedLines = lines.map(l => l.replace(LIST_PREFIX_RE, ''));
    let i = 0;
    return strippedLines.map(l => {
      if (!l.trim()) return l;
      return prefixFn(l, i++, strippedLines);
    }).join('\n');
  }
}

export function toNumberedList(text) {
  return toggleList(text, (l, i) => `${i + 1}. ${l}`, /^\d+\.\s+/);
}

export function toBulletPoints(text) {
  return toggleList(text, l => `• ${l}`, /^•\s*/);
}

export function toChecklist(text) {
  return toggleList(text, l => `☐ ${l}`, /^☐\s*/);
}

export function toAscendingList(text) {
  return toggleList(text, (l, i) => `${i + 1}→ ${l}`, /^\d+→\s*/);
}

export function toDescendingList(text) {
  return toggleList(text, (l, i, arr) => {
    const total = arr.filter(x => x.trim()).length;
    return `${total - i}→ ${l}`;
  }, /^\d+→\s*/);
}

export const STYLES = [
  { key: 'normal',         label: 'Normal',           fn: t => t },
  { key: 'bold',           label: 'Bold',             fn: toBold },
  { key: 'italic',         label: 'Italic',           fn: toItalic },
  { key: 'boldItalic',     label: 'Bold Italic',      fn: toBoldItalic },
  { key: 'sans',           label: 'Sans',             fn: toSans },
  { key: 'boldSans',       label: 'Bold Sans',        fn: toBoldSans },
  { key: 'italicSans',     label: 'Italic Sans',      fn: toItalicSans },
  { key: 'boldItalicSans', label: 'Bold Italic Sans', fn: toBoldItalicSans },
  { key: 'script',         label: 'Script',           fn: toScript },
  { key: 'doublestruck',   label: 'Doublestruck',     fn: toDoublestruck },
  { key: 'underline',      label: 'Underline',        fn: toUnderline },
  { key: 'strikethrough',  label: 'Strikethrough',    fn: toStrikethrough },
  { key: 'fullwidth',      label: 'Fullwidth',        fn: toFullwidth },
  { key: 'uppercase',      label: 'Uppercase',        fn: toUppercase },
  { key: 'lowercase',      label: 'Lowercase',        fn: toLowercase },
  { key: 'numberedList',   label: 'Numbered List',    fn: toNumberedList },
  { key: 'bulletPoints',   label: 'Bullet Points',    fn: toBulletPoints },
  { key: 'checklist',      label: 'Checklist',        fn: toChecklist },
  { key: 'ascendingList',  label: 'Ascending List',   fn: toAscendingList },
  { key: 'descendingList', label: 'Descending List',  fn: toDescendingList },
];

export function stripFontStyling(text) {
  return [...text]
    .map(c => STYLE_REVERSE_MAP.get(c) || c)
    .join('');
}

export function toggleStyle(text, styleKey) {
  if (styleKey === 'underline') {
    const stripped = text.replace(/\u0332/g, '');
    return stripped !== text ? stripped : toUnderline(text);
  }
  if (styleKey === 'strike') {
    const stripped = text.replace(/\u0336/g, '');
    return stripped !== text ? stripped : toStrikethrough(text);
  }

  const transform = TRANSFORMS[styleKey];
  if (!transform) return text;

  // First, normalize the text by stripping ANY existing unicode font styles back to ASCII.
  // This allows us to cleanly jump from "Bold Sans" directly to "Script".
  // (Underlines and strikethroughs are preserved as they are combining characters).
  const normalized = stripFontStyling(text);
  const targetText = applyTransform(normalized, transform);

  // If the original text was ALREADY completely styled in the target style, toggle it off.
  if (text === targetText) {
    return normalized;
  }
  
  // Otherwise, apply the new style to the normalized text.
  return targetText;
}

export function toggleBold(text) { return toggleStyle(text, 'bold'); }
export function toggleItalic(text) { return toggleStyle(text, 'italic'); }
export function toggleUnderline(text) { return toggleStyle(text, 'underline'); }
export function toggleStrikethrough(text) { return toggleStyle(text, 'strike'); }
export function toggleBoldSans(text) { return toggleStyle(text, 'boldSans'); }
export function toggleScript(text) { return toggleStyle(text, 'script'); }
export function toggleDoublestruck(text) { return toggleStyle(text, 'doublestruck'); }