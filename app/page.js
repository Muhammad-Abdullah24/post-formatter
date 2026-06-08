'use client';

import { useState, useRef } from 'react';
import { getFoldAnalysis } from '@/lib/foldline';
import Toolbar from '@/components/Toolbar';

const GW_MODES = [
  { key: 'topic',      label: 'From Topic' },
  { key: 'refine',     label: 'Refine Draft' },
  { key: 'transcript', label: 'From Transcript' },
];

export default function Home() {
  const [text, setText] = useState('');
  const [gwMode, setGwMode] = useState('topic');
  const [gwInput, setGwInput] = useState('');
  const [gwLoading, setGwLoading] = useState(false);
  const [gwOutput, setGwOutput] = useState('');
  const [transcript, setTranscript] = useState('');
  const [ytUrl, setYtUrl] = useState('');
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  function handleApply(fn) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) {
      setText(fn(text));
    } else {
      setText(text.slice(0, start) + fn(text.slice(start, end)) + text.slice(end));
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleTranscript() {
    if (!ytUrl.trim()) return;
    setYtLoading(true);
    setYtError('');
    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ytUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setYtError(data.error || 'Failed.'); setYtLoading(false); return; }
      setTranscript(data.transcript);
      // Summarize via ghostwriter
      setGwMode('transcript');
      setGwInput('');
      const sumRes = await fetch('/api/ghostwriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'transcript', content: '', transcript: data.transcript }),
      });
      if (!sumRes.ok) { setText(data.transcript.slice(0, 500)); setYtLoading(false); return; }
      const reader = sumRes.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setText(result);
      }
      setYtLoading(false);
    } catch {
      setYtError('Request failed.');
      setYtLoading(false);
    }
  }

  async function handleGenerate() {
    const content = gwInput.trim();
    if (!content && gwMode !== 'transcript') return;
    if (gwMode === 'transcript' && !transcript && !content) return;
    setGwLoading(true);
    setGwOutput('');
    try {
      const res = await fetch('/api/ghostwriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: gwMode,
          content: gwMode === 'refine' ? (content || text) : content,
          transcript: transcript || content,
        }),
      });
      if (!res.ok) { setGwLoading(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setGwOutput(result);
      }
      setGwLoading(false);
    } catch {
      setGwLoading(false);
    }
  }

  function useGenerated() {
    if (gwOutput) { setText(gwOutput); setGwOutput(''); setGwInput(''); }
  }

  const analysis = text ? getFoldAnalysis(text) : null;

  const renderPreviewBody = () => {
    if (!text) return (
      <div style={{ fontSize: 13, lineHeight: 1.6, color: '#666' }}>
        <p style={{ marginBottom: 8 }}>Start writing and your post will appear here..</p>
        <p style={{ marginBottom: 8 }}>You can add <span style={{ color: '#0a66c2' }}>#hashtags</span> and emojis 🤩 <span style={{ float: 'right', color: '#0a66c2', cursor: 'pointer' }}>...more</span></p>
        <p style={{ color: '#aaa' }}>This line will appear below the more...</p>
      </div>
    );
    if (!analysis?.desktopFolded) return (
      <p style={{ fontSize: 13, lineHeight: 1.6, color: '#1a1a1a', whiteSpace: 'pre-wrap', margin: 0 }}>{text}</p>
    );
    return (
      <div style={{ fontSize: 13, lineHeight: 1.6, color: '#1a1a1a' }}>
        <span style={{ whiteSpace: 'pre-wrap' }}>{analysis.desktopPreview}</span>
        <span style={{ color: '#0a66c2', cursor: 'pointer' }}> ...more</span>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(10,102,194,0.25)' }}>
          <span style={{ fontSize: 10, color: '#0a66c2', fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: '0.08em' }}>FOLD LINE</span>
          <p style={{ whiteSpace: 'pre-wrap', color: '#999', margin: 0 }}>{analysis.desktopRemainder}</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>

      <nav className="animate-fade-up" style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 28px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="font-display" style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Hirenum</span>
          <span style={{ width: 1, height: 16, background: 'var(--border)', display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Post Formatter</span>
          <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 100, fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em' }}>FREE</span>
        </div>
        <a href="https://hirenum.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Hirenum.com
        </a>
      </nav>

      <div className="animate-fade-up-1" style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>LinkedIn Post Formatter</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0', fontWeight: 400 }}>Write. Format. Ghost-write. All in one workspace.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {analysis && (
            <>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: analysis.desktopFolded ? '#fff8ed' : '#edf7f2', color: analysis.desktopFolded ? '#b45309' : 'var(--success)', border: `1px solid ${analysis.desktopFolded ? '#fde68a' : '#a7f3d0'}`, fontFamily: 'Syne, sans-serif' }}>
                {analysis.desktopFolded ? 'Desktop fold' : 'Desktop OK'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: analysis.mobileFolded ? '#fff8ed' : '#edf7f2', color: analysis.mobileFolded ? '#b45309' : 'var(--success)', border: `1px solid ${analysis.mobileFolded ? '#fde68a' : '#a7f3d0'}`, fontFamily: 'Syne, sans-serif' }}>
                {analysis.mobileFolded ? 'Mobile fold' : 'Mobile OK'}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="animate-fade-up-2" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, padding: '16px 20px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Transcript puller */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-label">YouTube Transcript Puller</span>
              {transcript && <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em' }}>LOADED</span>}
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={ytUrl}
                onChange={e => setYtUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTranscript()}
                placeholder="Paste YouTube URL — AI will summarize the transcript into your editor"
                style={{ flex: 1, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: 'var(--ink)', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
              />
              <button onClick={handleTranscript} disabled={ytLoading || !ytUrl.trim()} className="btn-accent">
                {ytLoading ? 'Working...' : 'Pull'}
              </button>
            </div>
            {ytError && <div style={{ padding: '0 14px 10px', fontSize: 11, color: '#dc2626' }}>{ytError}</div>}
          </div>

          {/* Editor */}
          <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 300 }}>
            <Toolbar
  text={text}
  onApply={handleApply}
  onUndo={() => {}}
  onRedo={() => {}}
  onClear={() => setText('')}
  onEmoji={(emoji) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    setText(text.slice(0, start) + emoji + text.slice(start));
  }}
  onFormat={(newText) => setText(newText)}
/>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write your LinkedIn post here. Select text and click toolbar to format specific words..."
              style={{ flex: 1, resize: 'none', border: 'none', outline: 'none', padding: '16px', fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', background: 'white', fontFamily: 'DM Sans, sans-serif', minHeight: 260 }}
            />
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={handleCopy} disabled={!text} className="btn-ghost">{copied ? 'Copied!' : 'Copy text'}</button>
              <div style={{ flex: 1 }} />
              {analysis && (
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'Syne, sans-serif', letterSpacing: '0.04em', color: analysis.hookStrength.score === 'strong' ? 'var(--success)' : analysis.hookStrength.score === 'bad' ? '#dc2626' : 'var(--muted)' }}>
                  {analysis.hookStrength.message}
                </span>
              )}
            </div>
          </div>

          {/* Ghostwriter */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-label">AI Ghostwriter</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {GW_MODES.map(m => (
                  <button key={m.key} onClick={() => { setGwMode(m.key); setGwInput(''); setGwOutput(''); }} className={`mode-pill${gwMode === m.key ? ' active' : ''}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {gwMode === 'transcript' && transcript ? (
                <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'var(--muted)', maxHeight: 60, overflow: 'hidden' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontFamily: 'Syne, sans-serif', fontSize: 10, letterSpacing: '0.06em' }}>TRANSCRIPT READY — </span>
                  {transcript.slice(0, 120)}...
                </div>
              ) : (
                <textarea
                  value={gwInput}
                  onChange={e => setGwInput(e.target.value)}
                  placeholder={
                    gwMode === 'topic' ? 'Enter a topic or idea...' :
                    gwMode === 'refine' ? 'Paste a draft to refine, or leave empty to refine the current post...' :
                    'Paste a transcript here, or pull one from YouTube above...'
                  }
                  rows={3}
                  style={{ resize: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--ink)', background: 'var(--paper)', outline: 'none', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}
                />
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={handleGenerate} disabled={gwLoading} className="btn-accent">
                  {gwLoading ? 'Writing...' : 'Generate Post'}
                </button>
                {gwOutput && <button onClick={useGenerated} className="btn-ghost">Use this post</button>}
              </div>
              {gwOutput && (
                <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--ink)', lineHeight: 1.7, maxHeight: 140, overflowY: 'auto', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'pre-wrap' }}>
                  {gwOutput}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ position: 'sticky', top: 16, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-label">Post Preview</span>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>LinkedIn</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #0a66c2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>H</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', margin: 0 }}>Your Name</p>
                  <p style={{ fontSize: 11, color: '#666', margin: '1px 0' }}>Your Headline • 1st</p>
                  <p style={{ fontSize: 10, color: '#999', margin: 0 }}>12h • 🌐</p>
                </div>
              </div>
              {renderPreviewBody()}
            </div>
            <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12 }}>👍❤️ <span style={{ fontSize: 11, color: '#666' }}>57</span></span>
                <span style={{ fontSize: 11, color: '#999' }}>24 comments · 6 reposts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 4, borderTop: '1px solid #f0f0f0' }}>
                {['👍 Like', '💬 Comment', '🔁 Repost', '📤 Send'].map(a => (
                  <button key={a} style={{ fontSize: 11, fontWeight: 600, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 4 }}>{a}</button>
                ))}
              </div>
            </div>
          </div>

          {analysis && (
            <div style={{ padding: '10px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, color: 'var(--ink)', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>HOOK ANALYSIS</span>
              {analysis.hookStrength.message}
            </div>
          )}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '14px 28px', textAlign: 'center', background: 'white' }}>
        <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>
          A free tool by <a href="https://hirenum.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none' }}>Hirenum</a> — LinkedIn Personal Branding for Founders and Leaders
        </p>
      </footer>
    </div>
  );
}