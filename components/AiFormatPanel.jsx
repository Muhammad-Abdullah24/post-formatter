'use client';

import { useState, useEffect } from 'react';
import { analyzePostStructure, buildFormatSummary } from '@/lib/format-utils';

export default function AiFormatPanel({ text, open, onClose, onApply }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formatted, setFormatted] = useState('');
  const [changes, setChanges] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    if (!open) return;
    runFormat();
  }, [open]);

  async function runFormat() {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 30) {
      setError('Write at least a few sentences before using AI Format.');
      return;
    }

    setLoading(true);
    setError('');
    setFormatted('');
    setChanges([]);
    setIssues(analyzePostStructure(trimmed).issues);

    try {
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Formatting failed.');
        setLoading(false);
        return;
      }

      const result = await res.text();
      const summary = buildFormatSummary(trimmed, result);

      setFormatted(result);
      setChanges(summary.changes);
      setIssues(summary.before.issues);
      setLoading(false);
    } catch {
      setError('Request failed. Check your connection and try again.');
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="ai-format-overlay" onClick={onClose}>
      <div className="ai-format-panel anim-slide-down" onClick={e => e.stopPropagation()}>
        <div className="ai-format-header">
          <div>
            <h3 className="ai-format-title">AI Format</h3>
            <p className="ai-format-subtitle">
              Restructures your post for LinkedIn readability — spacing, rhythm, emphasis, and fold-line optimization. Your words stay the same.
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {issues.length > 0 && !loading && (
          <div className="ai-format-issues">
            <span className="card-label" style={{ display: 'block', marginBottom: 8 }}>Issues detected</span>
            <ul>
              {issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {loading ? (
          <div className="ai-format-loading">
            <span className="pulse-dot">●</span>
            Analyzing structure, spacing, and fold-line…
          </div>
        ) : error ? (
          <p className="ai-format-error">{error}</p>
        ) : (
          <>
            <div className="ai-format-compare">
              <div className="ai-format-col">
                <span className="card-label">Original</span>
                <div className="ai-format-preview">{text}</div>
              </div>
              <div className="ai-format-col ai-format-col-highlight">
                <span className="card-label" style={{ color: 'var(--linkedin)' }}>Formatted</span>
                <div className="ai-format-preview">{formatted}</div>
              </div>
            </div>

            {changes.length > 0 && (
              <div className="ai-format-changes">
                <span className="card-label" style={{ display: 'block', marginBottom: 8 }}>What changed</span>
                <ul>
                  {changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="ai-format-actions">
          {!loading && !error && formatted && (
            <>
              <button type="button" className="btn btn-primary btn-md" onClick={() => { onApply(formatted); onClose(); }}>
                Apply formatting
              </button>
              <button type="button" className="btn btn-ghost btn-md" onClick={runFormat}>
                Regenerate
              </button>
            </>
          )}
          <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
