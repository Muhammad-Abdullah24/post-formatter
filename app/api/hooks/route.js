import OpenAI from 'openai';
import { HOOKS_SYSTEM_PROMPT, buildHooksPrompt, parseHooksResponse } from '@/lib/ai-prompts';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// LinkedIn truncates the mobile feed preview around here. The hook strategist
// works on the first line, so we cap what we analyze to a sane length.
const MAX_HOOK_INPUT = 250;

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: 'Hook suggestions are unavailable: the server is missing its OpenAI API key.' },
        { status: 503 }
      );
    }

    let text = '';
    try {
      const body = await request.json();
      text = typeof body?.text === 'string' ? body.text : '';
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const trimmed = text.trim();

    if (trimmed.length < 20) {
      return Response.json(
        { error: 'Write at least a few sentences in the editor so hooks can match your post.' },
        { status: 400 }
      );
    }

    // The hook is the first line a reader actually sees. Use the first
    // non-empty line so a post that opens with a blank line still works, and
    // so this matches exactly what the editor replaces when a hook is applied.
    const firstLine = trimmed.split('\n').map(l => l.trim()).find(Boolean) || '';
    let currentHook = firstLine;
    if (currentHook.length > MAX_HOOK_INPUT) {
      currentHook = currentHook.substring(0, MAX_HOOK_INPUT) + '…';
    }

    if (!currentHook) {
      return Response.json(
        { error: 'Your post needs an opening line to generate hook alternatives.' },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      temperature: 0.75,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: HOOKS_SYSTEM_PROMPT },
        { role: 'user', content: buildHooksPrompt(trimmed, currentHook) },
      ],
    });

    const choice = response.choices[0];
    const raw = choice?.message?.content || '';

    // If the model hit the token ceiling, the JSON is almost certainly
    // truncated and unparseable. Tell the user to retry rather than failing
    // with a confusing parse error.
    if (choice?.finish_reason === 'length') {
      return Response.json(
        { error: 'The response was cut off. Try again, or shorten your post a little.' },
        { status: 502 }
      );
    }

    const { hooks, diagnosis, strongestIndex, refined } = parseHooksResponse(raw);

    if (hooks.length === 0) {
      return Response.json(
        { error: 'Could not generate hook suggestions this time. Please try again.' },
        { status: 502 }
      );
    }

    return Response.json({
      hooks,
      currentHook,
      diagnosis,
      strongestIndex,
      refined,
    });
  } catch (error) {
    console.error('[Hooks API] generation failed:', error?.message || error);
    return Response.json(
      { error: 'Failed to generate hooks. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
