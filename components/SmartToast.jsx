'use client';

import { useState, useEffect, useRef } from 'react';

/* LinkedIn caps posts at 3,000 characters. The 1,200–1,500 band is the
   engagement sweet spot most LinkedIn data points to. */
const MAX_CHARS = 3000;
const LIMIT_WARN_AT = 2800; // start nudging ~200 chars before the cap
const IDEAL_MIN = 1200;
const IDEAL_MAX = 1500;
const NEAR_IDEAL_AT = 1100; // "almost in the sweet spot" lead-in

const nf = new Intl.NumberFormat('en-US');

/* Map the current character count to a single, stable notice "zone". Returning
   the same key while the user lingers in a zone is what keeps the toast from
   re-firing on every keystroke. */
function getNotice(len) {
  if (len >= MAX_CHARS) {
    return {
      key: 'over',
      tone: 'danger',
      icon: '🛑',
      title: 'Over the limit',
      msg: `You're past LinkedIn's ${nf.format(MAX_CHARS)}-character limit. Trim it down to post.`,
    };
  }
  if (len >= LIMIT_WARN_AT) {
    return {
      key: 'limit',
      tone: 'warn',
      icon: '⚠️',
      title: 'Almost at the limit',
      msg: `Only ${nf.format(MAX_CHARS - len)} characters left before the ${nf.format(MAX_CHARS)} cap.`,
    };
  }
  if (len >= IDEAL_MIN && len <= IDEAL_MAX) {
    return {
      key: 'ideal',
      tone: 'success',
      icon: '🎯',
      title: 'Sweet spot!',
      msg: `You're in the ideal ${nf.format(IDEAL_MIN)}–${nf.format(IDEAL_MAX)} character range.`,
    };
  }
  if (len >= NEAR_IDEAL_AT && len < IDEAL_MIN) {
    return {
      key: 'near-ideal',
      tone: 'accent',
      icon: '✨',
      title: 'Almost there',
      msg: `A little more to reach the ideal ${nf.format(IDEAL_MIN)}–${nf.format(IDEAL_MAX)} range.`,
    };
  }
  return null;
}

export default function SmartToast({ text }) {
  const len = text ? text.length : 0;
  const notice = getNotice(len);
  const key = notice ? notice.key : null;

  const [active, setActive] = useState(null);
  const lastKeyRef = useRef(null);
  const timerRef = useRef(null);

  // Show the toast only when the user *enters* a new zone, not while they sit
  // in one. The notice object is captured fresh from this render's closure.
  useEffect(() => {
    if (key && key !== lastKeyRef.current) {
      setActive(notice);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setActive(null), 5000);
    }
    lastKeyRef.current = key;
    // notice is derived from key; depending on key alone is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!active) return null;

  return (
    <div className={`smart-toast smart-toast-${active.tone}`} role="status" aria-live="polite">
      <span className="smart-toast-icon">{active.icon}</span>
      <div className="smart-toast-body">
        <span className="smart-toast-title">{active.title}</span>
        <span className="smart-toast-msg">{active.msg}</span>
      </div>
      <button
        type="button"
        className="smart-toast-close"
        onClick={() => setActive(null)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
