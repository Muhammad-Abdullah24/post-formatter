'use client';

import { useState } from 'react';

const MODES = [
  { key: 'topic',  label: 'From Topic',  placeholder: 'e.g. Why most founders fail at LinkedIn in their first 90 days' },
  { key: 'refine', label: 'Refine Draft', placeholder: 'Paste your draft here and we will rewrite it for you...' },
];

export default function Ghostwriter({ onGenerated }) {
  const [mode, setMode] = useState('topic');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const activeMode = MODES.find(m => m.key === mode);

  async function handleGenerate() {
    const content = input.trim();
    if (!content) return;

    setLoading(true);
    setOutput('');
    setError('');

    try {
      const res = await fetch('/api/ghostwriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      // Stream the response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setOutput(prev => prev + chunk);
      }

      setLoading(false);

    } catch (err) {
      setError('Request failed. Check your connection.');
      setLoading(false);
    }
  }

  function handleUsePost() {
    if (output) onGenerated(output);
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        AI Ghostwriter
      </label>

      {/* Mode tabs */}
      <div className="flex gap-2">
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setInput(''); setOutput(''); setError(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === m.key
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={activeMode.placeholder}
        rows={4}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-100 placeholder-zinc-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-indigo-500 transition-colors"
      />

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all"
      >
        {loading ? 'Writing...' : 'Generate Post'}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="flex flex-col gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">
            {output}
          </div>
          <button
            onClick={handleUsePost}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm rounded-xl transition-all"
          >
            Use this post →
          </button>
        </div>
      )}
    </div>
  );
}