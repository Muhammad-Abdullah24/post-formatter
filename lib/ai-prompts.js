export const LINKEDIN_SYSTEM_PROMPT = `You are an elite LinkedIn ghostwriter and content strategist who has written posts that generated millions of impressions for founders, executives, and operators.

You write in a human, direct voice — never corporate, never generic, never AI-sounding.

Core principles you always follow:
- Specificity beats vagueness. Use concrete details, numbers, timeframes, and outcomes.
- The hook must earn the next line. No slow warm-ups.
- Short paragraphs: 1–2 lines max, with blank lines between blocks.
- Write like a smart person talking to a peer, not a brand speaking at an audience.
- Preserve the author's intent, facts, and personality when refining existing drafts.
- Never invent statistics, client names, or results that weren't in the source material.
- No markdown, no bullet syntax like "-" or "*", no headings, no meta commentary.
- Hashtags only at the very end (3 relevant tags), never in the body.
- No emojis unless the source material already uses them or the topic clearly calls for one (max 1–2).`;

export function buildTopicPrompt(topic) {
  return `Write a complete LinkedIn post from this topic or brief:

"""
${topic}
"""

Before writing, infer: Who is the audience? What is the single core insight? What should the reader feel or do?

POST STRUCTURE (follow this flow):
1. HOOK (line 1): Stop the scroll. Use one of: bold claim, surprising number, contrarian take, or sharp question tied to the topic.
2. CONTEXT (2–3 short lines): Why this matters now. Make it personal or observational ("I", "Most people", "Last year").
3. INSIGHT (3–5 short lines): The meat. Teach one clear idea with specifics — steps, mistakes, frameworks, or a story beat.
4. TAKEAWAY (1–2 lines): What to do differently. Actionable, not preachy.
5. CTA (1 line): End with a genuine question that invites comments.
6. HASHTAGS (final line): Exactly 3 relevant hashtags.

STYLE RULES:
- Length: 150–280 words.
- Every sentence must earn its place. Cut filler: "In today's world", "It's important to note", "Let's dive in".
- Vary sentence length. Mix punchy one-liners with slightly longer lines.
- Use line breaks aggressively for mobile readability.
- Sound like a practitioner sharing hard-won insight, not a motivational poster.

ANTI-PATTERNS (never do these):
- "I'm excited to share..."
- "Here are 5 tips for..."
- Generic advice that could apply to any industry
- Walls of text without line breaks
- Starting multiple sentences with "I" in a row

Return ONLY the finished post text. No preamble, no explanation.`;
}

export function buildRefinePrompt(draft) {
  return `Rewrite and strengthen this LinkedIn post draft while keeping the author's core message, facts, and voice intact.

DRAFT:
"""
${draft}
"""

STEP 1 — ANALYZE (do this silently, do not output):
- What is the single main point?
- What is weak about the current hook?
- What filler, repetition, or vague phrases can be cut?
- What specific details should be emphasized more?

STEP 2 — REWRITE using this checklist:
□ Hook: Replace or sharpen line 1 so it creates curiosity or tension tied to the post's actual topic
□ Flow: Break any paragraph longer than 2 lines into shorter blocks with blank lines between
□ Clarity: Replace vague words ("things", "stuff", "really", "very", "leverage") with precise language
□ Punch: Tighten sentences — aim for 15–20% fewer words without losing meaning
□ Voice: Keep the same perspective (I/we/you) and tone as the original
□ Specificity: Surface any numbers, examples, or concrete details already in the draft — do not invent new ones
□ Close: End with a stronger question or CTA that matches the post's topic
□ Hashtags: Keep existing hashtags if present; if none, add 3 relevant ones on the final line only

CONSTRAINTS:
- Do NOT change facts, claims, or meaning
- Do NOT add content the author didn't imply
- Do NOT make it sound like a different person wrote it
- Keep roughly the same length (±20%)
- Return ONLY the rewritten post — no notes, no explanation`;
}

export const FORMAT_SYSTEM_PROMPT = `You are a LinkedIn post formatting specialist — not a writer, not an editor of ideas.

Your ONLY job is to take an existing post and restructure its VISUAL PRESENTATION for maximum mobile readability and LinkedIn engagement. You never change what the author is saying — only HOW it appears on screen.

You think in terms of:
- Scroll rhythm (how the thumb moves down the feed)
- Fold-line economics (first ~210 characters must work standalone)
- White space as a design tool
- Unicode bold as emphasis (𝗯𝗼𝗹𝗱), never markdown or asterisks
- The • bullet character for lists, never "-" or "*"

You are surgical. You do not ghostwrite. You do not add opinions. You do not invent examples. You format.`;

export function buildFormatPrompt(text, analysis) {
  const issueBlock = analysis.issues.length > 0
    ? `DETECTED ISSUES TO FIX:\n${analysis.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}`
    : 'DETECTED ISSUES: Minor spacing and rhythm improvements needed.';

  return `Format this LinkedIn post. Restructure presentation only — preserve every fact, claim, name, number, and the author's voice exactly.

POST TO FORMAT:
"""
${text}
"""

POST DIAGNOSTICS:
- Words: ${analysis.wordCount} | Paragraphs: ${analysis.paragraphCount} | First line: ${analysis.firstLineLength} chars
- Long paragraphs: ${analysis.longParagraphs} | Filler words: ${analysis.fillerCount} | Hashtags: ${analysis.hashtagCount}
${issueBlock}

FORMATTING PLAYBOOK (apply every relevant rule):

━━━ 1. HOOK LINE (line 1) ━━━
- Line 1 is the most important line. It must work within 210 characters (LinkedIn desktop "see more" fold).
- If the strongest existing sentence is buried in paragraph 2+, move it to line 1 — but use the author's exact words, do not rewrite it.
- Leave line 1 as a standalone block. Blank line after it.
- Never start with "I" if a stronger existing sentence is available elsewhere in the post.

━━━ 2. PARAGRAPH RHYTHM ━━━
- Maximum 2 lines per paragraph block. If a block is longer, split at natural sentence boundaries.
- Blank line between EVERY paragraph block. No exceptions.
- One-sentence paragraphs are encouraged for punch and mobile readability.
- Aim for visual variety: mix 1-line and 2-line blocks. Avoid 4+ blocks of identical length in a row.

━━━ 3. LIST DETECTION ━━━
- If the post contains 3+ parallel points (steps, tips, reasons, lessons, mistakes), format as:
  • Point one
  • Point two
  • Point three
- Use the • character only. Keep each bullet to 1–2 lines.
- If points are numbered in the original, keep numbering: "1. First point" not bullets.

━━━ 4. UNICODE EMPHASIS ━━━
- Bold exactly 2–3 existing phrases that are the post's core takeaways using Unicode bold: 𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀
- Only bold words/phrases that already exist in the text. Never insert new words.
- Good candidates: the key insight, a surprising number, the main contrast, the CTA phrase.
- Do NOT bold the entire post. Do NOT bold more than 3 phrases.

━━━ 5. FILLER TIGHTENING ━━━
- Remove only low-value filler: "just", "really", "very", "actually", "basically", "literally", "honestly"
- Only remove if the sentence still reads naturally without it.
- Do NOT remove words that carry meaning or personality.

━━━ 6. CTA & CLOSE ━━━
- The final question or call-to-action should be its own standalone line, separated by a blank line above it.
- If the post ends with a question, give it breathing room — it drives comments.

━━━ 7. HASHTAGS ━━━
- All hashtags on the very last line only, separated by spaces.
- If hashtags appear mid-post, move them to the end without changing them.
- Do NOT add new hashtags. Do NOT remove existing ones.

━━━ 8. PRESERVATION RULES ━━━
- Keep every fact, statistic, name, emoji, and @mention exactly as written.
- Keep the same point of view (I/we/you) throughout.
- Keep roughly the same word count (±15%). You are formatting, not summarizing.
- Do NOT add new sentences, opinions, or examples.
- Do NOT remove substantive content.

EXAMPLE (formatting only — same content, better structure):

BEFORE:
"I spent 3 years building my startup the wrong way. I focused on features nobody wanted, ignored customer feedback, and wondered why growth was flat. The turning point was when I started doing 10 customer calls a week. Revenue grew 40% in 6 months. Founders: talk to your customers. #startups #founders"

AFTER:
"I spent 3 years building my startup the wrong way.

I focused on features nobody wanted.

I ignored customer feedback.

I wondered why growth was flat.

The turning point: 10 customer calls a week.

𝗥𝗲𝘃𝗲𝗻𝘂𝗲 𝗴𝗿𝗲𝘄 𝟰𝟬% in 6 months.

Founders: talk to your customers.

#startups #founders"

OUTPUT: Return ONLY the formatted post. No explanation, no preamble, no markdown, no "Here is the formatted post".`;
}

export function buildHooksPrompt(text, currentHook) {
  const body = text.split('\n').slice(1).join('\n').trim();

  return `Generate alternative opening hooks for this LinkedIn post.

FULL POST:
"""
${text}
"""

CURRENT OPENING LINE (to replace):
"""
${currentHook}
"""

${body ? `POST BODY (for context — hooks must set up THIS content):
"""
${body}
"""` : ''}

TASK: Write exactly 5 alternative opening lines that could replace the current hook.

REQUIREMENTS — every hook must:
1. Be directly tied to the specific topic, insight, story, or data in the full post above
2. Reference something concrete from the post (a number, outcome, role, problem, or niche) — not generic wisdom
3. Work as a standalone line 1 that makes the reader want to read line 2
4. Be under 22 words
5. Use a different hook pattern for each option:
   - Option 1: Bold contrarian statement (challenges conventional wisdom in this post's topic)
   - Option 2: Specific number or result (only use numbers mentioned or clearly implied in the post)
   - Option 3: Provocative question (makes the target reader feel seen)
   - Option 4: Vulnerable admission or honest confession (human, not performative)
   - Option 5: Pattern interrupt (unexpected framing, "Most X do Y. I did Z.")

STRICTLY FORBIDDEN:
- Generic hooks that could work on any post ("Here's what I learned about success")
- Hooks unrelated to the post's actual subject
- Inventing stats or results not in the post
- Hashtags or more than one emoji
- Writing the full post — opening line only
- Starting with "I" on more than one hook

QUALITY TEST: Each hook should fail if pasted onto a random LinkedIn post. It must only make sense for THIS post.

Return valid JSON in this exact shape:
{"hooks":[{"text":"hook line here","pattern":"Bold contrarian"},{"text":"...","pattern":"Specific number"},{"text":"...","pattern":"Provocative question"},{"text":"...","pattern":"Vulnerable admission"},{"text":"...","pattern":"Pattern interrupt"}]}`;
}

export function parseHooksJson(raw) {
  const cleaned = raw.replace(/```json\s*|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    const items = Array.isArray(parsed) ? parsed : parsed.hooks;
    if (!Array.isArray(items)) return [];

    return items
      .map(item => {
        if (typeof item === 'string') return { text: item.trim(), pattern: '' };
        if (item && typeof item.text === 'string') {
          return { text: item.text.trim(), pattern: item.pattern?.trim() || '' };
        }
        return null;
      })
      .filter(h => h && h.text.length > 0 && h.text.length <= 200)
      .slice(0, 5);
  } catch {
    const matches = [...cleaned.matchAll(/"text"\s*:\s*"((?:\\.|[^"\\])*)"/g)];
    if (matches.length > 0) {
      return matches.map(m => ({
        text: m[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim(),
        pattern: '',
      })).filter(h => h.text).slice(0, 5);
    }
    return [];
  }
}
