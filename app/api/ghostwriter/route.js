import Groq from 'groq-sdk';

const client = new Groq();

export async function POST(request) {
  try {
    const { mode, content, transcript } = await request.json();

    let prompt = '';

    if (mode === 'topic') {
      prompt = `Write a high-performing LinkedIn post about this topic: "${content}"

Rules:
- Start with a strong hook (question, bold statement, or number)
- No hashtags in the body — put 3 relevant hashtags at the very end
- Use short paragraphs (1-2 lines max)
- No generic advice — be specific and direct
- End with a clear call to action or question
- Length: 150-250 words`;

    } else if (mode === 'refine') {
      prompt = `Rewrite and improve this LinkedIn post draft:

"${content}"

Rules:
- Keep the core idea but make it punchier
- Strengthen the opening hook
- Tighten every sentence — cut filler words
- Short paragraphs (1-2 lines max)
- End with a stronger CTA or question
- Keep roughly the same length`;

    } else if (mode === 'transcript') {
      prompt = `Convert this YouTube video transcript into a LinkedIn post:

TRANSCRIPT:
${transcript}

Rules:
- Extract the single most valuable insight from the transcript
- Start with a strong hook based on that insight
- Write in first person as if you watched the video and are sharing what you learned
- No hashtags in the body — put 3 relevant hashtags at the very end
- Short paragraphs (1-2 lines max)
- Length: 150-250 words
- Do NOT start with "I watched a video about..."`;
    }

    const stream = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
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
    return Response.json(
      { error: 'Ghostwriter failed. Check your Groq API key.' },
      { status: 500 }
    );
  }
}