'use client';

import { useState } from 'react';

export default function TranscriptPanel({ onTranscriptReady }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleFetch() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setTranscript('');
    setError('');

    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch transcript.');
        setLoading(false);
        return;
      }

      setTranscript(data.transcript);
      onTranscriptReady(data.transcript);
      setLoading(false);

    } catch (err) {
      setError('Request failed. Check your connection.');
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        YouTube Transcript Puller
      </label>

      {/* URL input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          placeholder="Paste YouTube URL..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all whitespace-nowrap"
        >
          {loading ? 'Fetching...' : 'Pull Transcript'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Transcript output */}
      {transcript && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold">
              ✓ Transcript fetched — {transcript.length} chars
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy raw'}
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
            {transcript}
          </div>
          <p className="text-xs text-zinc-600">
            Transcript is ready — switch to AI Ghostwriter → From Transcript to generate a post.
          </p>
        </div>
      )}
    </div>
  );
}