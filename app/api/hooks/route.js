import OpenAI from 'openai';
import { LINKEDIN_SYSTEM_PROMPT, buildHooksPrompt, parseHooksJson } from '@/lib/ai-prompts';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { text } = await request.json();
    const trimmed = text?.trim();

    if (!trimmed || trimmed.length < 20) {
      return Response.json(
        { error: 'Write at least a few sentences in the editor so hooks can match your post.' },
        { status: 400 }
      );
    }

    const lines = trimmed.split('\n');
    const currentHook = lines[0].trim();

    if (!currentHook) {
      return Response.json(
        { error: 'Your post needs an opening line to generate hook alternatives.' },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      temperature: 0.75,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: LINKEDIN_SYSTEM_PROMPT },
        { role: 'user', content: buildHooksPrompt(trimmed, currentHook) },
      ],
      stream: false,
    });

    const raw = response.choices[0]?.message?.content || '';
    const hooks = parseHooksJson(raw);

    if (hooks.length === 0) {
      return Response.json(
        { error: 'Could not parse hook suggestions. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json({ hooks, currentHook });

  } catch (error) {
    console.error('Hooks generation failed:', error);
    return Response.json(
      { error: 'Failed to generate hooks. Check your OpenAI API key and try again.' },
      { status: 500 }
    );
  }
}

