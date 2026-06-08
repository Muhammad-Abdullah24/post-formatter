import Groq from 'groq-sdk';

const client = new Groq();

export async function POST(request) {
  try {
    const { firstLine } = await request.json();

    const prompt = `You are a LinkedIn hook expert. Given this opening line, generate exactly 3 alternative hooks that are punchier and more engaging.

Current hook: "${firstLine}"

Rules:
- Each hook must be under 15 words
- Use one of these patterns: bold statement, contrarian take, specific number, provocative question
- No generic advice
- Return ONLY a JSON array of 3 strings, no other text, no markdown, no explanation

Example output: ["Hook one here", "Hook two here", "Hook three here"]`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    });

    const raw = response.choices[0]?.message?.content || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const hooks = JSON.parse(clean);

    return Response.json({ hooks });

  } catch (error) {
    return Response.json({ error: 'Failed to generate hooks.' }, { status: 500 });
  }
}