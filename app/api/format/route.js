import OpenAI from 'openai';
import { FORMAT_SYSTEM_PROMPT, buildFormatPrompt } from '@/lib/ai-prompts';
import { analyzePostStructure, preFormatPost, sanitizeFormattedOutput } from '@/lib/format-utils';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { text } = await request.json();
    const trimmed = text?.trim();

    if (!trimmed || trimmed.length < 30) {
      return Response.json(
        { error: 'Write at least a few sentences before using AI Format.' },
        { status: 400 }
      );
    }

    const analysis = analyzePostStructure(trimmed);
    const preFormatted = preFormatPost(trimmed);
    const preAnalysis = analyzePostStructure(preFormatted);

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      temperature: 0.15,
      messages: [
        { role: 'system', content: FORMAT_SYSTEM_PROMPT },
        { role: 'user', content: buildFormatPrompt(preFormatted, preAnalysis) },
      ],
      stream: true,
    });

    let fullResult = '';
    for await (const chunk of stream) {
      fullResult += chunk.choices[0]?.delta?.content || '';
    }

    const sanitized = sanitizeFormattedOutput(fullResult, trimmed);
    const finalText = sanitized || preFormatted;

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(finalText));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Format-Issues': String(analysis.issues.length),
        'X-Format-Fallback': sanitized ? '0' : '1',
      },
    });

  } catch (error) {
    console.error('Format failed:', error);
    return Response.json({ error: 'AI Format failed. Check your OpenAI API key.' }, { status: 500 });
  }
}

