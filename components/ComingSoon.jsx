'use client';

import { useState, useEffect } from 'react';

// Rotating teaser lines under the heading — keeps the screen feeling alive
// while people wait. Cycled on a timer below.
const TEASERS = [
  'Tired of hunting for a formatter that actually works? We got you.',
  'Hooks that stop the scroll. Formatting that survives the feed.',
  'We\'re putting the final polish on something good.',
  'Hold on just a little longer. It\'s almost here.',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [teaser, setTeaser] = useState(0);

  // Cycle the teaser line every few seconds for a bit of movement.
  useEffect(() => {
    const id = setInterval(() => setTeaser((t) => (t + 1) % TEASERS.length), 3800);
    return () => clearInterval(id);
  }, []);

  // Lock background scroll while the overlay is up.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      setMessage('That email doesn\'t look right. Mind checking it?');
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Try again in a moment.');
        return;
      }
      setStatus('success');
      setMessage('You\'re on the list. We\'ll ping you the moment we go live.');
    } catch {
      setStatus('error');
      setMessage('Network hiccup. Check your connection and try again.');
    }
  }

  return (
    <div className="cs-overlay" role="dialog" aria-modal="true" aria-label="Coming soon">
      <div className="cs-backdrop" aria-hidden="true" />

      {/* Floating glow orbs to match the rest of the site */}
      <div className="cs-orb cs-orb-a" aria-hidden="true" />
      <div className="cs-orb cs-orb-b" aria-hidden="true" />

      <div className="cs-card">
        <span className="cs-badge">
          <span className="cs-badge-dot" />
          Launching soon
        </span>

        <h1 className="cs-title">
          Coming <span className="cs-title-accent">Soon</span>
        </h1>

        <div className="cs-teaser-wrap">
          {TEASERS.map((line, i) => (
            <p key={i} className={`cs-teaser ${i === teaser ? 'is-active' : ''}`}>
              {line}
            </p>
          ))}
        </div>

        {status === 'success' ? (
          <div className="cs-success">
            <div className="cs-success-check" aria-hidden="true">✓</div>
            <p className="cs-success-text">{message}</p>
          </div>
        ) : (
          <form className="cs-form" onSubmit={handleSubmit} noValidate>
            <div className="cs-field">
              <input
                type="email"
                className="cs-input"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                disabled={status === 'loading'}
                aria-label="Email address"
                autoComplete="email"
              />
              <button type="submit" className="cs-submit" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <span className="cs-spinner" aria-hidden="true" />
                ) : (
                  <>
                    Notify me
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            <p className={`cs-hint ${status === 'error' ? 'is-error' : ''}`}>
              {status === 'error' ? message : 'Be the first in line. No spam, just the launch.'}
            </p>
          </form>
        )}

        <p className="cs-footnote">
          A tool by <span className="cs-footnote-brand">HIRENUM</span>
        </p>
      </div>
    </div>
  );
}
