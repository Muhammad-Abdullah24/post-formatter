'use client';

import { useState, useRef, useEffect } from 'react';
import {
  toBold, toItalic, toUnderline, toStrikethrough,
  toBulletPoints, toNumberedList, toChecklist,
  toBoldSans, toScript, toDoublestruck
} from '@/lib/unicode';

const EMOJIS = {
  'Hands': ['👋','🤝','👏','🙌','💪','👍','👎','✌️','🤞','🫶','🙏','👀','✅','❌'],
  'Arrows': ['→','←','↑','↓','➡️','⬅️','⬆️','⬇️','↗️','↙️','🔼','🔽','▶️','◀️'],
  'Symbols': ['💡','🔥','⚡','✨','💥','🎯','🚀','💯','📌','📍','🔑','💎','⭐','🌟'],
  'Business': ['📈','📉','📊','💼','🏆','🎖️','🥇','💰','💸','🤑','📣','📢','🗣️','👔'],
  'Nature': ['🌱','🌿','🍀','🌊','🌸','🌺','🌻','☀️','🌙','⭐','🌈','❄️','🔵','🟢'],
  'Faces': ['😊','😄','🤔','😅','😎','🥳','🤩','😍','🙈','😤','💪','🫡','🤯','🥹'],
};

const tools = [
  {
    group: 'history',
    items: [
      { key: 'undo', title: 'Undo', icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M3 13C5.5 6.5 14 4 20 8"/></svg>) },
      { key: 'redo', title: 'Redo', icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M21 13C18.5 6.5 10 4 4 8"/></svg>) },
      { key: 'clear', title: 'Clear all', icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>) },
    ]
  },
  {
    group: 'format',
    items: [
      { key: 'bold', title: 'Bold', fn: toBold, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>) },
      { key: 'italic', title: 'Italic', fn: toItalic, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>) },
      { key: 'underline', title: 'Underline', fn: toUnderline, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>) },
      { key: 'strike', title: 'Strikethrough', fn: toStrikethrough, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4c-2.5 0-4 1.5-4 3 0 1.5 1 2.5 4 3"/><path d="M8 18c0 0 1.5 2 4 2 2.5 0 4-1.5 4-3 0-1.5-1-2.5-4-3"/></svg>) },
    ]
  },
  {
    group: 'lists',
    items: [
      { key: 'bullet', title: 'Bullet list', fn: toBulletPoints, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/></svg>) },
      { key: 'numbered', title: 'Numbered list', fn: toNumberedList, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>) },
      { key: 'checklist', title: 'Checklist', fn: toChecklist, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>) },
    ]
  },
  {
    group: 'unicode',
    items: [
      { key: 'boldsans', title: 'Bold Sans', fn: toBoldSans, icon: (<span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>𝗔𝗮</span>) },
      { key: 'script', title: 'Script', fn: toScript, icon: (<span style={{ fontSize: 13, lineHeight: 1 }}>𝒜𝒶</span>) },
      { key: 'double', title: 'Doublestruck', fn: toDoublestruck, icon: (<span style={{ fontSize: 11, lineHeight: 1 }}>𝔸𝕒</span>) },
    ]
  }
];

function getReadabilityScore(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const syllables = words.reduce((acc, word) => acc + Math.max(1, word.toLowerCase().replace(/[^aeiou]/g, '').length), 0);
  if (words.length === 0 || sentences.length === 0) return null;
  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  if (score >= 70) return { label: 'Easy', color: '#2d7d4f' };
  if (score >= 50) return { label: 'Medium', color: '#b45309' };
  return { label: 'Hard', color: '#dc2626' };
}

export default function Toolbar({ text, onApply, onUndo, onRedo, onClear, onEmoji, onFormat }) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Hands');
  const [hookOpen, setHookOpen] = useState(false);
  const [hooks, setHooks] = useState([]);
  const [hooksLoading, setHooksLoading] = useState(false);
  const [formatLoading, setFormatLoading] = useState(false);
  const emojiRef = useRef(null);
  const hookRef = useRef(null);

  const readability = text.length > 20 ? getReadabilityScore(text) : null;
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  useEffect(() => {
    function handleClick(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false);
      if (hookRef.current && !hookRef.current.contains(e.target)) setHookOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function fetchHooks() {
    const firstLine = text.split('\n')[0].trim();
    if (!firstLine) return;
    setHookOpen(true);
    setHooksLoading(true);
    setHooks([]);
    try {
      const res = await fetch('/api/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstLine }),
      });
      const data = await res.json();
      setHooks(data.hooks || []);
    } catch {
      setHooks([]);
    }
    setHooksLoading(false);
  }

  async function handleFormat() {
    if (!text || formatLoading) return;
    setFormatLoading(true);
    try {
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) { setFormatLoading(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        onFormat(result);
      }
    } catch {}
    setFormatLoading(false);
  }

  const btnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.12s ease' };

  return (
    <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--paper)', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 14px', flexWrap: 'wrap' }}>

        {/* Regular tools */}
        {tools.map((group, gi) => (
          <div key={group.group} style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {gi > 0 && <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 6px' }} />}
            {group.items.map(item => (
              <button
                key={item.key}
                title={item.title}
                onClick={() => {
                  if (item.key === 'undo') onUndo();
                  else if (item.key === 'redo') onRedo();
                  else if (item.key === 'clear') onClear();
                  else if (item.fn) onApply(item.fn);
                }}
                style={btnStyle}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-dark)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
              >
                {item.icon}
              </button>
            ))}
          </div>
        ))}

        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 6px' }} />

        {/* AI Format button */}
        <button
          title="AI Format"
          onClick={handleFormat}
          disabled={!text || formatLoading}
          style={{ ...btnStyle, width: 'auto', padding: '0 8px', gap: 4, fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.05em', color: formatLoading ? 'var(--accent)' : 'var(--muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = formatLoading ? 'var(--accent)' : 'var(--muted)'; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {formatLoading ? 'Formatting...' : 'AI Format'}
        </button>

        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 6px' }} />

        {/* Hook suggestions */}
        <div ref={hookRef} style={{ position: 'relative' }}>
          <button
            title="Hook suggestions"
            onClick={fetchHooks}
            disabled={!text}
            style={{ ...btnStyle, width: 'auto', padding: '0 8px', gap: 4, fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-dark)'; e.currentTarget.style.color = 'var(--ink)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Hooks
          </button>

          {hookOpen && (
            <div style={{ position: 'absolute', top: 36, left: 0, zIndex: 100, background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: 320, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--paper)' }}>
                <span style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)' }}>HOOK SUGGESTIONS</span>
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {hooksLoading ? (
                  <div style={{ padding: '12px 0', textAlign: 'center', fontSize: 12, color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}>
                    Generating hooks...
                  </div>
                ) : hooks.length > 0 ? hooks.map((hook, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const lines = text.split('\n');
                      lines[0] = hook;
                      onFormat(lines.join('\n'));
                      setHookOpen(false);
                    }}
                    style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--paper)', cursor: 'pointer', fontSize: 12, color: 'var(--ink)', lineHeight: 1.5, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <span style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em', display: 'block', marginBottom: 3 }}>OPTION {i + 1}</span>
                    {hook}
                  </button>
                )) : (
                  <div style={{ padding: '8px 0', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>No hooks generated.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 6px' }} />

        {/* Emoji picker */}
        <div ref={emojiRef} style={{ position: 'relative' }}>
          <button
            title="Insert emoji"
            onClick={() => setEmojiOpen(p => !p)}
            style={{ ...btnStyle, fontSize: 15, background: emojiOpen ? 'var(--paper-dark)' : 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-dark)'}
            onMouseLeave={e => { if (!emojiOpen) e.currentTarget.style.background = 'transparent'; }}
          >
            🙂
          </button>

          {emojiOpen && (
            <div style={{ position: 'absolute', top: 36, right: 0, zIndex: 100, background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: 280, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', padding: '6px 8px', overflowX: 'auto' }}>
                {Object.keys(EMOJIS).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{ padding: '3px 10px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '0.04em', whiteSpace: 'nowrap', background: activeCategory === cat ? 'var(--ink)' : 'transparent', color: activeCategory === cat ? 'var(--paper)' : 'var(--muted)', transition: 'all 0.12s' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, padding: 10 }}>
                {EMOJIS[activeCategory].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { onEmoji(emoji); setEmojiOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, transition: 'all 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-dark)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      {text.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 14px 6px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, letterSpacing: '0.06em' }}>{text.length} CHARS</span>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, letterSpacing: '0.06em' }}>{words} WORDS</span>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, letterSpacing: '0.06em' }}>{readTime} MIN READ</span>
          {readability && (
            <span style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.06em', color: readability.color }}>
              {readability.label.toUpperCase()} READ
            </span>
          )}
        </div>
      )}
    </div>
  );
}