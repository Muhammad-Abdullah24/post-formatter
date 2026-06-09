import Groq from 'groq-sdk';
import { LINKEDIN_SYSTEM_PROMPT, buildTopicPrompt, buildRefinePrompt } from '@/lib/ai-prompts';

const client = new Groq();

export async function POST(request) {
  try {
    const { mode, content } = await request.json();
    const trimmed = content?.trim();

    if (!trimmed) {
      return Response.json({ error: 'Content is required.' }, { status: 400 });
    }

    if (mode === 'topic' && trimmed.length < 10) {
      return Response.json(
        { error: 'Please provide a more detailed topic or brief (at least 10 characters).' },
        { status: 400 }
      );
    }

    if (mode === 'refine' && trimmed.length < 30) {
      return Response.json(
        { error: 'Please write more content in the editor before refining.' },
        { status: 400 }
      );
    }

    let userPrompt = '';
    let temperature = 0.7;

    if (mode === 'topic') {
      userPrompt = buildTopicPrompt(trimmed);
      temperature = 0.8;
    } else if (mode === 'refine') {
      userPrompt = buildRefinePrompt(trimmed);
      temperature = 0.55;
    } else {
      return Response.json({ error: 'Invalid mode.' }, { status: 400 });
    }

    const stream = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1536,
      temperature,
      messages: [
        { role: 'system', content: LINKEDIN_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Ghostwriter failed:', error);
    return Response.json(
      { error: 'Ghostwriter failed. Check your Groq API key.' },
      { status: 500 }
    );
  }
}
