'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  toggleBold, toggleItalic, toggleUnderline, toggleStrikethrough,
  toBulletPoints, toNumberedList, toChecklist,
  toggleBoldSans, toggleScript, toggleDoublestruck
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
      { key: 'bold',      title: 'Bold',          fn: toggleBold,          icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>) },
      { key: 'italic',    title: 'Italic',        fn: toggleItalic,        icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>) },
      { key: 'underline', title: 'Underline',     fn: toggleUnderline,     icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>) },
      { key: 'strike',    title: 'Strikethrough', fn: toggleStrikethrough, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4c-2.5 0-4 1.5-4 3 0 1.5 1 2.5 4 3"/><path d="M8 18c0 0 1.5 2 4 2 2.5 0 4-1.5 4-3 0-1.5-1-2.5-4-3"/></svg>) },
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
      { key: 'boldsans', title: 'Bold Sans',    fn: toggleBoldSans,    icon: (<span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>𝗔𝗮</span>) },
      { key: 'script',   title: 'Script',       fn: toggleScript,      icon: (<span style={{ fontSize: 13, lineHeight: 1 }}>𝒜𝒶</span>) },
      { key: 'double',   title: 'Doublestruck', fn: toggleDoublestruck, icon: (<span style={{ fontSize: 11, lineHeight: 1 }}>𝔸𝕒</span>) },
    ]
  }
];

export default function Toolbar({ text, onApply, onUndo, onRedo, onClear, onEmoji, onFormat, canUndo, canRedo, onRegisterHooks }) {
  const [emojiOpen, setEmojiOpen]   = useState(false);
  const [activeCategory, setActiveCategory] = useState('Hands');
  const [hookOpen, setHookOpen]     = useState(false);
  const [hooks, setHooks]           = useState([]);
  const [diagnosis, setDiagnosis]   = useState('');
  const [strongestIndex, setStrongestIndex] = useState(-1);
  const [hooksLoading, setHooksLoading] = useState(false);
  const [hooksError, setHooksError] = useState('');
  // Fixed-viewport coordinates for the portaled popovers.
  const [emojiPos, setEmojiPos]     = useState(null);
  const [hookPos, setHookPos]       = useState(null);

  const emojiBtnRef = useRef(null); // anchor button
  const hookBtnRef  = useRef(null);
  const emojiPopRef = useRef(null); // portaled panel (for outside-click)
  const hookPopRef  = useRef(null);
  const hookReqRef  = useRef(0);    // guards against stale responses

  const EMOJI_W = 272;
  const HOOK_W = 380;
  // LinkedIn truncates the mobile feed preview around here; a longer hook risks
  // being cut off before the "see more" tap.
  const PREVIEW_LIMIT = 210;

  const words       = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime    = Math.max(1, Math.ceil(words / 200));

  // Ideal LinkedIn post length is ~1,200–1,500 characters. The meter below the
  // stats row visualizes progress toward that band and lights up inside it.
  const IDEAL_MIN = 1200;
  const IDEAL_MAX = 1500;
  const len = text.length;
  const idealFillPct = Math.min(len / IDEAL_MAX, 1) * 100;
  let idealColor = '#1BB8BD';
  let idealLabel = `${(IDEAL_MIN - len).toLocaleString()} TO IDEAL`;
  if (len >= IDEAL_MIN && len <= IDEAL_MAX) {
    idealColor = 'var(--success)';
    idealLabel = '✓ IDEAL LENGTH';
  } else if (len > IDEAL_MAX) {
    idealColor = 'var(--warning)';
    idealLabel = 'PAST IDEAL';
  }

  // Position a popover just below its anchor button, clamped to the viewport
  // so it can never overflow the screen edges.
  const positionFor = useCallback((btn, width, align = 'left') => {
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    const top = r.bottom + 6;
    let left = align === 'right' ? r.right - width : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    return { top, left };
  }, []);

  // Close on outside click. Because the panels are portaled to <body>, we check
  // both the anchor button and the panel itself.
  useEffect(() => {
    function handler(e) {
      if (
        emojiBtnRef.current && !emojiBtnRef.current.contains(e.target) &&
        emojiPopRef.current && !emojiPopRef.current.contains(e.target)
      ) setEmojiOpen(false);
      if (
        hookBtnRef.current && !hookBtnRef.current.contains(e.target) &&
        hookPopRef.current && !hookPopRef.current.contains(e.target)
      ) setHookOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keep popovers glued to their buttons while the page scrolls or resizes.
  useEffect(() => {
    if (!emojiOpen && !hookOpen) return;
    function reposition() {
      if (emojiOpen) setEmojiPos(positionFor(emojiBtnRef.current, EMOJI_W, 'right'));
      if (hookOpen)  setHookPos(positionFor(hookBtnRef.current, HOOK_W, 'right'));
    }
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [emojiOpen, hookOpen, positionFor]);

  // Expose the hook generator so the AI coach can trigger it from outside the
  // toolbar. No dep array: keep the latest closure (current text) registered.
  useEffect(() => {
    onRegisterHooks?.(fetchHooks);
  });

  function toggleEmoji() {
    setEmojiOpen(prev => {
      const next = !prev;
      if (next) setEmojiPos(positionFor(emojiBtnRef.current, EMOJI_W, 'right'));
      return next;
    });
  }

  async function fetchHooks() {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 20) return;
    const reqId = ++hookReqRef.current;
    setHookOpen(true);
    setHookPos(positionFor(hookBtnRef.current, HOOK_W, 'right'));
    setHooksLoading(true);
    setHooks([]);
    setDiagnosis('');
    setStrongestIndex(-1);
    setHooksError('');
    try {
      const res = await fetch('/api/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json().catch(() => ({}));

      // Ignore a response that a newer request has superseded.
      if (reqId !== hookReqRef.current) return;

      if (!res.ok) {
        setHooksError(data.error || 'Failed to generate hooks.');
        setHooksLoading(false);
        return;
      }

      const list = Array.isArray(data.hooks) ? [...data.hooks] : [];
      // Append the optional refined original as a final, clearly-labelled card.
      if (data.refined) {
        list.push({ text: data.refined, pattern: 'Refined Original', why: 'A tighter take on the hook you already wrote.' });
      }

      setHooks(list);
      setDiagnosis(data.diagnosis || '');
      setStrongestIndex(Number.isInteger(data.strongestIndex) ? data.strongestIndex : -1);
      if (!list.length) {
        setHooksError('No hooks were generated. Try adding more detail to your post.');
      }
    } catch {
      if (reqId !== hookReqRef.current) return;
      setHooksError('Request failed. Check your connection and try again.');
      setHooks([]);
    }
    if (reqId === hookReqRef.current) setHooksLoading(false);
  }

  function applyHook(hookText) {
    // Replace the first non-empty line, the hook the reader actually sees,
    // and exactly what the API analyzed.
    const lines = text.split('\n');
    const idx = lines.findIndex(l => l.trim().length > 0);
    lines[idx === -1 ? 0 : idx] = hookText;
    onFormat(lines.join('\n'));
    setHookOpen(false);
  }

  return (
    <div style={{ borderBottom: '1px solid var(--glass-border)' }}>

      {/* Tool row */}
      <div
        className="toolbar-row"
        style={{ display: 'flex', alignItems: 'center', gap: '8px 2px', padding: '10px 20px', flexWrap: 'wrap' }}
      >

        {tools.map((group, gi) => (
          <div key={group.group} style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {gi > 0 && <div className="divider" />}
            {group.items.map(item => (
              <button
                key={item.key}
                title={item.title}
                className="tb-btn"
                disabled={
                  (item.key === 'undo' && !canUndo) ||
                  (item.key === 'redo' && !canRedo) ||
                  (item.key === 'clear' && !text)
                }
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

        {/* Hook suggestions */}
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <button
            ref={hookBtnRef}
            title="Generate hook suggestions based on your full post"
            onClick={fetchHooks}
            disabled={!text.trim() || text.trim().length < 20}
            className="tb-btn"
            style={{ width: 'auto', padding: '0 10px', gap: 6, fontSize: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.08em' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Hooks
          </button>

          {hookOpen && hookPos && createPortal(
            <div ref={hookPopRef} className="popover anim-slide-down" style={{ position: 'fixed', top: hookPos.top, left: hookPos.left, width: HOOK_W, maxWidth: 'calc(100vw - 16px)', zIndex: 1000 }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(27,184,189,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 9, fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.18em', color: '#1BB8BD', textTransform: 'uppercase' }}>Hook Suggestions</span>
                {!hooksLoading && (
                  <button
                    onClick={fetchHooks}
                    style={{ fontSize: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#1BB8BD', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}
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
                ) : hooks.length > 0 ? (
                  <>
                    {diagnosis && (
                      <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 9, fontFamily: 'Outfit, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--warning)' }}>💡 Current hook diagnosis</span>
                        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--ink-secondary)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>{diagnosis}</p>
                      </div>
                    )}
                    {hooks.map((hook, i) => {
                      const isStrongest = i === strongestIndex;
                      const tooLong = hook.text.length > PREVIEW_LIMIT;
                      return (
                        <div
                          key={i}
                          style={{ padding: '10px 12px', borderRadius: 8, border: isStrongest ? '1px solid rgba(16,185,129,0.35)' : '1px solid var(--glass-border)', background: isStrongest ? 'rgba(16,185,129,0.04)' : 'var(--glass-bg)', display: 'flex', flexDirection: 'column', gap: 6 }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <span className="card-label" style={{ fontSize: 10, color: '#1BB8BD', fontWeight: 800, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {hook.pattern || `Option ${i + 1}`}
                            </span>
                            {isStrongest && (
                              <span style={{ fontSize: 9, fontFamily: 'Outfit, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(16,185,129,0.2)' }}>
                                Strongest pick
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>{hook.text}</p>
                          {hook.why && (
                            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--ink-tertiary)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                              <span style={{ color: '#1BB8BD', fontWeight: 700 }}>Why: </span>{hook.why}
                            </p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                            <span
                              title={tooLong ? 'May be cut off before "see more" in the mobile feed' : 'Fits inside the feed preview'}
                              style={{ fontSize: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.04em', color: tooLong ? 'var(--warning)' : 'var(--ink-tertiary)' }}
                            >
                              {tooLong ? `⚠ ${hook.text.length} chars · may truncate` : `${hook.text.length} chars`}
                            </span>
                            <button
                              onClick={() => applyHook(hook.text)}
                              style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#fff', background: isStrongest ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #1BB8BD, #DC0078)', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.04em', transition: 'opacity 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.opacity = 0.9; }}
                              onMouseLeave={e => { e.currentTarget.style.opacity = 1; }}
                            >
                              Use this hook
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p style={{ padding: '8px 0', textAlign: 'center', fontSize: 12, color: 'var(--ink-tertiary)' }}>No hooks generated.</p>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>

        <div className="divider" />

        {/* Emoji picker */}
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <button
            ref={emojiBtnRef}
            title="Insert emoji"
            onClick={toggleEmoji}
            className="tb-btn"
            style={{ fontSize: 15, background: emojiOpen ? 'rgba(27,184,189,0.1)' : 'transparent' }}
          >
            🙂
          </button>

          {emojiOpen && emojiPos && createPortal(
            <div ref={emojiPopRef} className="popover anim-slide-down" style={{ position: 'fixed', top: emojiPos.top, left: emojiPos.left, width: EMOJI_W, maxWidth: 'calc(100vw - 16px)', zIndex: 1000 }}>
              <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--glass-border)', padding: '6px 8px', overflowX: 'auto', background: 'rgba(27,184,189,0.03)' }}>
                {Object.keys(EMOJIS).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{ padding: '3px 10px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap', background: activeCategory === cat ? 'linear-gradient(135deg, #1BB8BD, #DC0078)' : 'transparent', color: activeCategory === cat ? '#fff' : 'var(--ink-tertiary)', transition: 'all 0.15s' }}
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
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Stats row */}
      {text.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 20px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {[
                { label: `${text.length} chars` },
                { label: `${words} words` },
                { label: `${readTime} min read` },
              ].map(s => (
                <span key={s.label} style={{ fontSize: 10, color: 'var(--ink-tertiary)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>
                  {s.label}
                </span>
              ))}
            </div>
            <span style={{
              fontSize: 10,
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: (3000 - text.length) < 0 ? 'var(--danger)' : 'var(--ink-tertiary)'
            }}>
              {3000 - text.length >= 0
                ? `${3000 - text.length} CHARS REMAINING`
                : `${text.length - 3000} CHARS OVER LIMIT`}
            </span>
          </div>

          {/* Ideal-length meter (1,200–1,500 characters) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              title="Ideal LinkedIn post length is 1,200–1,500 characters"
              style={{ position: 'relative', flex: 1, height: 5, borderRadius: 99, background: 'var(--bg-secondary)', overflow: 'hidden' }}
            >
              {/* Highlighted ideal band: 1,200–1,500 maps to 80%–100% of the 0–1,500 track */}
              <div style={{ position: 'absolute', left: '80%', right: 0, top: 0, bottom: 0, background: 'rgba(16,185,129,0.22)' }} />
              {/* Live fill */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${idealFillPct}%`, background: idealColor, borderRadius: 99, transition: 'width 0.25s ease, background 0.25s ease' }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.08em', color: idealColor, whiteSpace: 'nowrap' }}>
              {idealLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}