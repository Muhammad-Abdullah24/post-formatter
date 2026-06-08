'use client';

import { useRef } from 'react';
import { toBold, toItalic, toUnderline, toStrikethrough, toBulletPoints, toNumberedList, toDescendingList } from '@/lib/unicode';

const TOOLBAR = [
  { key: 'bold',       icon: 'B',  fn: toBold },
  { key: 'italic',     icon: 'I',  fn: toItalic },
  { key: 'underline',  icon: 'U',  fn: toUnderline },
  { key: 'strike',     icon: 'S',  fn: toStrikethrough },
  { key: 'bullet',     icon: '≡',  fn: toBulletPoints },
  { key: 'numbered',   icon: '⁼',  fn: toNumberedList },
  { key: 'descending', icon: '⇩',  fn: toDescendingList },
];

export default function Editor({ value, onChange }) {
  const ref = useRef(null);

  function applyStyle(fn) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) {
      onChange(fn(value));
    } else {
      const before = value.slice(0, start);
      const selected = value.slice(start, end);
      const after = value.slice(end);
      onChange(before + fn(selected) + after);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-200">
        {TOOLBAR.map((item, i) => (
          <button
            key={item.key}
            onClick={() => applyStyle(item.fn)}
            title={item.key}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm text-zinc-600 hover:bg-zinc-100 transition-colors ${i === 3 ? 'mr-3' : ''}`}
            style={{
              fontStyle: item.key === 'italic' ? 'italic' : 'normal',
              fontWeight: item.key === 'bold' ? 'bold' : 'normal',
              textDecoration: item.key === 'underline' ? 'underline' : item.key === 'strike' ? 'line-through' : 'none'
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write here..."
        className="flex-1 resize-none border-none outline-none text-zinc-800 text-sm leading-relaxed placeholder-zinc-400 px-4 py-4 min-h-64"
      />

      <div className="flex items-center gap-3 px-4 py-3 border-t border-zinc-200">
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          disabled={!value}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-all"
        >
          Copy text
        </button>
        <button className="px-4 py-2 rounded-lg bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold transition-all">
          Schedule
        </button>
        <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-all">
          Post now
        </button>
      </div>
    </div>
  );
}