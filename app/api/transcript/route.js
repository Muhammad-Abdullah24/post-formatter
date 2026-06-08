import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return Response.json({ error: 'No URL provided' }, { status: 400 });
    }

    const transcript = await YoutubeTranscript.fetchTranscript(url);

    // Combine all transcript chunks into one clean string
    const fullText = transcript
      .map(chunk => chunk.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return Response.json({ transcript: fullText });

  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch transcript. Make sure the video has captions enabled.' },
      { status: 500 }
    );
  }
}