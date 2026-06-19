'use client';

import { useState, useEffect, useRef } from 'react';

// We only *reformat* the user's own words — never generate content. Copy is
// written to make that explicit ("your words stay yours").
//
// The coach stays hidden until there's real content to act on, then surfaces
// one nudge per available AI tool and rotates between them:
//   • hooks  needs ≥ 20 chars
//   • format needs ≥ 30 chars
function getCards(len) {
  const cards = [];
  if (len >= 30) {
    cards.push({
      action: 'format',
      title: 'Make it land in the feed.',
      body: 'Let AI restructure the spacing, line breaks, and rhythm for LinkedIn — your words stay exactly yours.',
      cta: 'Let AI Format It',
    });
  }
  if (len >= 20) {
    cards.push({
      action: 'hooks',
      title: 'Not happy with how it starts?',
      body: 'Your first line decides who keeps reading. Let AI reshape your opening into sharper hooks — same message, stronger delivery.',
      cta: 'Fix my hook',
    });
  }
  return cards;
}

export default function AiCoach({ text, onFormat, onHooks }) {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const rootRef = useRef(null);

  const len = text.trim().length;
  const cards = getCards(len);
  const hasContent = cards.length > 0;

  // Layered parallax: track the pointer and expose it as CSS custom properties
  // the orb and bubble lean into. rAF-throttled.
  useEffect(() => {
    let raf = 0;
    function onMove(e) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = rootRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        el.style.setProperty('--px', Math.max(-0.6, Math.min(0.6, dx)).toFixed(3));
        el.style.setProperty('--py', Math.max(-0.6, Math.min(0.6, dy)).toFixed(3));
      });
    }
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Gently rotate between the available nudges so each AI tool gets its moment.
  useEffect(() => {
    if (!open || cards.length < 2) return;
    const id = setInterval(() => setIndex(i => (i + 1) % cards.length), 6500);
    return () => clearInterval(id);
  }, [open, cards.length]);

  if (!hasContent) return null;

  const card = cards[Math.min(index, cards.length - 1)];

  function run(action) {
    if (action === 'format') onFormat?.();
    else if (action === 'hooks') onHooks?.();
  }

  const Orb = (
    <span className="ai-coach-orb" aria-hidden="true">
      <span className="ai-coach-orb-ring" />
      <span className="ai-coach-orb-core" />
      <span className="ai-coach-orb-spark">✦</span>
    </span>
  );

  return (
    <div className="ai-coach" ref={rootRef}>
      <div className="ai-coach-parallax">
        {open ? (
          <div className="ai-coach-bubble anim-slide-down" role="status">
            <button
              type="button"
              className="ai-coach-close"
              onClick={() => setOpen(false)}
              aria-label="Collapse AI assistant"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="ai-coach-head">
              {Orb}
              <span className="ai-coach-eyebrow">Hirenum&nbsp;AI</span>
            </div>

            {/* keyed so each rotation replays the fade */}
            <div className="ai-coach-card ai-coach-fade" key={card.action}>
              <p className="ai-coach-title">{card.title}</p>
              <p className="ai-coach-body">{card.body}</p>
              <div className="ai-coach-actions">
                <button
                  type="button"
                  className="ai-coach-cta is-primary"
                  onClick={() => run(card.action)}
                >
                  {card.cta}
                </button>
              </div>
            </div>

            {cards.length > 1 && (
              <div className="ai-coach-dots" role="tablist" aria-label="AI suggestions">
                {cards.map((c, i) => (
                  <button
                    key={c.action}
                    type="button"
                    className={`ai-coach-dot ${i === Math.min(index, cards.length - 1) ? 'is-on' : ''}`}
                    onClick={() => setIndex(i)}
                    aria-label={c.action === 'format' ? 'Formatting tip' : 'Hook tip'}
                    aria-selected={i === Math.min(index, cards.length - 1)}
                  />
                ))}
              </div>
            )}

            <span className="ai-coach-tail" aria-hidden="true" />
          </div>
        ) : (
          <button
            type="button"
            className="ai-coach-fab"
            onClick={() => setOpen(true)}
            aria-label="Open Hirenum AI assistant"
            title="Hirenum AI — formatting & hook help"
          >
            {Orb}
          </button>
        )}
      </div>
    </div>
  );
}
