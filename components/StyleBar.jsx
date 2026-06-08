'use client';

import { STYLES } from '@/lib/unicode';

export default function StyleBar({ text, onStyleApply }) {
  function handleCopy(fn) {
    const result = fn(text);
    navigator.clipboard.writeText(result);
    onStyleApply(result);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STYLES.map(style => (
        <button
          key={style.key}
          onClick={() => handleCopy(style.fn)}
          disabled={!text}
          className="px-3 py-1.5 text-sm bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-zinc-700"
        >
          {style.label}
        </button>
      ))}
    </div>
  );
}