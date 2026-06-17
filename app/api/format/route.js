import OpenAI from 'openai';
import { FORMAT_SYSTEM_PROMPT, buildFormatPrompt } from '@/lib/ai-prompts';
import { analyzePostStructure, preFormatPost, sanitizeFormattedOutput, preservesOriginalContent, stripForeignHashtags, removeInventedBlocks } from '@/lib/format-utils';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BOLD_RE = /[\u{1D400}-\u{1D7FF}]/u;

function issueCount(text) {
  return analyzePostStructure(text).issues.length;
}

export async function POST(request) {
  let trimmed = '';
  try {
    const body = await request.json();
    trimmed = body?.text?.trim() || '';
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!trimmed || trimmed.length < 30) {
    return Response.json(
      { error: 'Write at least a few sentences before using Let AI Format It.' },
      { status: 400 }
    );
  }

  // 1) Deterministic baseline — always structurally sound, instant, and reliable.
  //    This guarantees the feature does something useful even if the AI is
  //    unavailable or returns the post nearly unchanged.
  const baseline = preFormatPost(trimmed);
  const baselineIssues = issueCount(baseline);

  let finalText = baseline;
  let source = 'deterministic';

  // Short-circuit: the post is already perfectly structured AND already has
  // emphasis. There is genuinely nothing to add — skip the AI call entirely
  // and let the UI show the honest "already optimized" state.
  const alreadyPerfect = baseline.trim() === trimmed && baselineIssues === 0 && BOLD_RE.test(baseline);

  // 2) AI enhancement layer — adds bold emphasis and lifts a strong hook.
  //    Best-effort: any failure falls back to the deterministic baseline.
  if (!alreadyPerfect && process.env.OPENAI_API_KEY) {
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 2048,
        temperature: 0.3,
        messages: [
          { role: 'system', content: FORMAT_SYSTEM_PROMPT },
          { role: 'user', content: buildFormatPrompt(baseline) },
        ],
      });

      const aiRaw = completion.choices[0]?.message?.content || '';
      const sanitized = sanitizeFormattedOutput(aiRaw, trimmed);

      if (sanitized) {
        // Strip invented blocks (e.g. an appended CTA) and invented hashtags,
        // then re-apply the structural guarantee so a wall-of-text can never
        // slip through.
        const faithful = removeInventedBlocks(stripForeignHashtags(sanitized, trimmed), trimmed);
        const enhanced = preFormatPost(faithful);
        // Accept the AI version only if it (a) is not structurally worse than
        // the deterministic baseline and (b) didn't invent words or hashtags.
        if (issueCount(enhanced) <= baselineIssues && preservesOriginalContent(trimmed, enhanced)) {
          finalText = enhanced;
          source = 'ai';
        }
      }
    } catch (error) {
      console.error('[Format API] AI enhancement failed, serving deterministic baseline:', error?.message || error);
    }
  }

  return new Response(finalText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Format-Source': source,
      'X-Format-Changed': finalText.trim() === trimmed ? '0' : '1',
    },
  });
}
