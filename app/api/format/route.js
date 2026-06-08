import Groq from 'groq-sdk';

const client = new Groq();

export async function POST(request) {
  try {
    const { text } = await request.json();

    const prompt = `You are a LinkedIn formatting expert. Reformat this post for maximum readability and engagement on LinkedIn.

POST:
${text}

Rules:
- Break long paragraphs into 1-2 line chunks with blank lines between
- Convert dense lists into bullet points using •
- Bold key phrases using unicode bold (𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀) — only 2-3 most important phrases
- Tighten sentences — cut filler words ruthlessly
- Keep the author's voice and core message intact
- Do NOT add new content or change facts
- Return ONLY the reformatted post text, nothing else`;

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
    return Response.json({ error: 'Formatting failed.' }, { status: 500 });
  }
}