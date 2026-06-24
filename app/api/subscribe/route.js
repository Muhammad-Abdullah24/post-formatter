import { appendFile, mkdir } from 'fs/promises';
import path from 'path';

// Light-touch email validation. We're not trying to RFC-5322 this, just keep
// out obvious junk before we store/log it.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let email = '';
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email.trim() : '';
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const entry = { email: email.toLowerCase(), at: new Date().toISOString() };

  // For now we just log every signup so they show up in the server output.
  console.log('[Subscribe] new waitlist signup:', entry.email);

  // Best-effort durable record: append to a local file so signups survive a
  // restart in development. Swap this for a real DB / email provider later.
  try {
    const dir = path.join(process.cwd(), 'data');
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, 'subscribers.jsonl'), JSON.stringify(entry) + '\n', 'utf8');
  } catch (err) {
    // A read-only filesystem (e.g. some serverless hosts) shouldn't fail the
    // signup — the console log above is still captured.
    console.warn('[Subscribe] could not persist to file:', err?.message || err);
  }

  return Response.json({ ok: true });
}
