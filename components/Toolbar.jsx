'use client';

import { useState, useRef, useEffect } from 'react';
import {
  toBold, toItalic, toUnderline, toStrikethrough,
  toBulletPoints, toNumberedList, toChecklist,
  toBoldSans, toScript, toDoublestruck
} from '@/lib/unicode';

const EMOJIS = {
  'Hands':    ['👋','🤝','👏','🙌','💪','👍','👎','✌️','🤞','🫶','🙏','👀','✅','❌'],
  'Arrows':   ['→','←','↑','↓','➡️','⬅️','⬆️','⬇️','↗️','↙️','🔼','🔽','▶️','◀️'],
  'Symbols':  ['💡','🔥','⚡','✨','💥','🎯','🚀','💯','📌','📍','🔑','💎','⭐','🌟'],
  'Business': ['📈','📉','📊','💼','🏆','🎖️','🥇','💰','💸','🤑','📣','📢','🗣️','👔'],
  'Nature':   ['🌱','🌿','🍀','🌊','🌸','🌺','🌻','☀️','🌙','⭐','🌈','❄️','🔵','🟢'],
  'Faces':    ['😊','😄','🤔','😅','😎','🥳','🤩','😍','🙈','😤','💪','🫡','🤯','🥹'],
};

const tools = [
  {
    group: 'history',
    items: [
      { key: 'undo',  title: 'Undo',      icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M3 13C5.5 6.5 14 4 20 8"/></svg>) },
      { key: 'redo',  title: 'Redo',      icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M21 13C18.5 6.5 10 4 4 8"/></svg>) },
      { key: 'clear', title: 'Clear all', icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>) },
    ]
  },
  {
    group: 'format',
    items: [
      { key: 'bold',      title: 'Bold',          fn: toBold,          icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>) },
      { key: 'italic',    title: 'Italic',        fn: toItalic,        icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>) },
      { key: 'underline', title: 'Underline',     fn: toUnderline,     icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>) },
      { key: 'strike',    title: 'Strikethrough', fn: toStrikethrough, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4c-2.5 0-4 1.5-4 3 0 1.5 1 2.5 4 3"/><path d="M8 18c0 0 1.5 2 4 2 2.5 0 4-1.5 4-3 0-1.5-1-2.5-4-3"/></svg>) },
    ]
  },
  {
    group: 'lists',
    items: [
      { key: 'bullet',    title: 'Bullet list',   fn: toBulletPoints, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/></svg>) },
      { key: 'numbered',  title: 'Numbered list', fn: toNumberedList, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>) },
      { key: 'checklist', title: 'Checklist',     fn: toChecklist,    icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>) },
    ]
  },
  {
    group: 'unicode',
    items: [
      { key: 'boldsans', title: 'Bold Sans',    fn: toBoldSans,    icon: (<span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>𝗔𝗮</span>) },
      { key: 'script',   title: 'Script',       fn: toScript,      icon: (<span style={{ fontSize: 13, lineHeight: 1 }}>𝒜𝒶</span>) },
      { key: 'double',   title: 'Doublestruck', fn: toDoublestruck, icon: (<span style={{ fontSize: 11, lineHeight: 1 }}>𝔸𝕒</span>) },
    ]
  }
];

function getReadabilityScore(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const syllables = words.reduce((acc, word) => acc + Math.max(1, word.toLowerCase().replace(/[^aeiou]/g, '').length), 0);
  if (words.length === 0 || sentences.length === 0) return null;
  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  if (score >= 70) return { label: 'Easy', color: 'var(--success)' };
  if (score >= 50) return { label: 'Medium', color: 'var(--warning)' };
  return { label: 'Hard', color: 'var(--danger)' };
}

export default function Toolbar({ text, onApply, onUndo, onRedo, onClear, onEmoji, onFormat, onFormatOpen }) {
  const [emojiOpen, setEmojiOpen]   = useState(false);
  const [activeCategory, setActiveCategory] = useState('Hands');
  const [hookOpen, setHookOpen]     = useState(false);
  const [hooks, setHooks]           = useState([]);
  const [hooksLoading, setHooksLoading] = useState(false);
  const [hooksError, setHooksError] = useState('');
  const emojiRef = useRef(null);
  const hookRef  = useRef(null);

  const readability = text.length > 20 ? getReadabilityScore(text) : null;
  const words       = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime    = Math.max(1, Math.ceil(words / 200));

  useEffect(() => {
    function handler(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false);
      if (hookRef.current  && !hookRef.current.contains(e.target))  setHookOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function fetchHooks() {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 20) return;
    setHookOpen(true);
    setHooksLoading(true);
    setHooks([]);
    setHooksError('');
    try {
      const res = await fetch('/api/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHooksError(data.error || 'Failed to generate hooks.');
        setHooksLoading(false);
        return;
      }
      setHooks(data.hooks || []);
      if (!data.hooks?.length) {
        setHooksError('No hooks were generated. Try adding more detail to your post.');
      }
    } catch {
      setHooksError('Request failed. Check your connection and try again.');
      setHooks([]);
    }
    setHooksLoading(false);
  }

  function applyHook(hookText) {
    const lines = text.split('\n');
    lines[0] = hookText;
    onFormat(lines.join('\n'));
    setHookOpen(false);
  }

  return (
    <div style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(27,184,189,0.02)' }}>

      {/* Tool row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '10px 20px', flexWrap: 'wrap' }}>

        {tools.map((group, gi) => (
          <div key={group.group} style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {gi > 0 && <div className="divider" />}
            {group.items.map(item => (
              <button
                key={item.key}
                title={item.title}
                className="tb-btn"
                onClick={() => {
                  if (item.key === 'undo')  onUndo();
                  else if (item.key === 'redo')  onRedo();
                  else if (item.key === 'clear') onClear();
                  else if (item.fn) onApply(item.fn);
                }}
              >
                {item.icon}
              </button>
            ))}
          </div>
        ))}

        <div className="divider" />

        {/* AI Format */}
        <button
          title="AI Format — restructure spacing, rhythm, and emphasis for LinkedIn"
          onClick={onFormatOpen}
          disabled={!text.trim() || text.trim().length < 30}
          className="tb-btn tb-btn-format"
          style={{ width: 'auto', padding: '0 10px', gap: 6, fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.08em' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          AI Format
        </button>

        <div className="divider" />

        {/* Hook suggestions */}
        <div ref={hookRef} style={{ position: 'relative' }}>
          <button
            title="Generate hook suggestions based on your full post"
            onClick={fetchHooks}
            disabled={!text.trim() || text.trim().length < 20}
            className="tb-btn"
            style={{ width: 'auto', padding: '0 10px', gap: 6, fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.08em' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Hooks
          </button>

          {hookOpen && (
            <div className="popover anim-slide-down" style={{ top: 36, left: 0, width: 380, maxWidth: 'calc(100vw - 40px)' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(27,184,189,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 9, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.18em', color: '#1BB8BD', textTransform: 'uppercase' }}>Hook Suggestions</span>
                {!hooksLoading && (
                  <button
                    onClick={fetchHooks}
                    style={{ fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1BB8BD', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}
                  >
                    Regenerate
                  </button>
                )}
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto' }}>
                {hooksLoading ? (
                  <div style={{ padding: '14px 0', textAlign: 'center', fontSize: 12, color: 'var(--ink-secondary)' }}>
                    <span className="pulse-dot" style={{ marginRight: 6 }}>●</span>Analyzing your post and writing hooks...
                  </div>
                ) : hooksError ? (
                  <p style={{ padding: '8px 4px', fontSize: 12, color: 'var(--danger)', lineHeight: 1.5 }}>{hooksError}</p>
                ) : hooks.length > 0 ? hooks.map((hook, i) => (
                  <button
                    key={i}
                    onClick={() => applyHook(hook.text)}
                    style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', cursor: 'pointer', fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, fontFamily: 'Roboto, sans-serif', transition: 'all 0.15s', width: '100%' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(27,184,189,0.08)'; e.currentTarget.style.borderColor = 'rgba(27,184,189,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    <span className="card-label" style={{ display: 'block', marginBottom: 4 }}>
                      {hook.pattern || `Option ${i + 1}`}
                    </span>
                    {hook.text}
                  </button>
                )) : (
                  <p style={{ padding: '8px 0', textAlign: 'center', fontSize: 12, color: 'var(--ink-tertiary)' }}>No hooks generated.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="divider" />

        {/* Emoji picker */}
        <div ref={emojiRef} style={{ position: 'relative' }}>
          <button
            title="Insert emoji"
            onClick={() => setEmojiOpen(p => !p)}
            className="tb-btn"
            style={{ fontSize: 15, background: emojiOpen ? 'rgba(27,184,189,0.1)' : 'transparent' }}
          >
            🙂
          </button>

          {emojiOpen && (
            <div className="popover anim-slide-down" style={{ top: 36, right: 0, width: 272 }}>
              <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--glass-border)', padding: '6px 8px', overflowX: 'auto', background: 'rgba(27,184,189,0.03)' }}>
                {Object.keys(EMOJIS).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{ padding: '3px 10px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap', background: activeCategory === cat ? 'linear-gradient(135deg, #1BB8BD, #DC0078)' : 'transparent', color: activeCategory === cat ? '#fff' : 'var(--ink-tertiary)', transition: 'all 0.15s' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, padding: 8 }}>
                {EMOJIS[activeCategory].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { onEmoji(emoji); setEmojiOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(27,184,189,0.1)'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 20px 12px', borderTop: '1px solid var(--border)' }}>
          {[
            { label: `${text.length} chars` },
            { label: `${words} words` },
            { label: `${readTime} min read` },
          ].map(s => (
            <span key={s.label} style={{ fontSize: 10, color: 'var(--ink-tertiary)', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>
              {s.label}
            </span>
          ))}
          {readability && (
            <span style={{ fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.1em', color: readability.color }}>
              {readability.label.toUpperCase()} READ
            </span>
          )}
        </div>
      )}
    </div>
  );
}