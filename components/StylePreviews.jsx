'use client';

import { useState } from 'react';
import { STYLES } from '@/lib/unicode';

export default function StylePreviews({ text }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const hasText = text.trim().length > 0;

  async function handleCopy(key, fn) {
    if (!hasText) return;
    const result = fn(text);
    await navigator.clipboard.writeText(result);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <section id="styles" className="style-previews-section">
      <div className="container">
      <h2 className="style-previews-title">Style Previews</h2>
      <div className="style-previews-grid">
        {STYLES.map(style => {
          const preview = hasText ? style.fn(text) : null;
          const isCopied = copiedKey === style.key;

          return (
            <div key={style.key} className="style-preview-card">
              <div className="style-preview-card-header">
                <span className="style-preview-label">{style.label}</span>
              </div>
              <div className="style-preview-card-body">
                {hasText ? (
                  <span className="style-preview-text">{preview}</span>
                ) : (
                  <span className="style-preview-placeholder">Your text will appear here</span>
                )}
              </div>
              <button
                type="button"
                className="style-preview-copy"
                onClick={() => handleCopy(style.key, style.fn)}
                disabled={!hasText}
                aria-label={`Copy ${style.label} text`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                {isCopied ? 'Copied' : 'Copy text'}
              </button>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
