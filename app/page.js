'use client';

import { useState, useRef, useEffect } from 'react';
import { getFoldAnalysis } from '@/lib/foldline';
import { toggleBold, toggleItalic, toggleUnderline } from '@/lib/unicode';
import Toolbar from '@/components/Toolbar';
import StylePreviews from '@/components/StylePreviews';
import AiFormatPanel from '@/components/AiFormatPanel';
import LinkedInPreview from '@/components/LinkedInPreview';

const GW_MODES = [
  { key: 'topic',  label: 'From Topic' },
  { key: 'refine', label: 'Refine Draft' },
];

const MARQUEE_ITEMS = [
  'Fold-line preview',
  'Unicode formatting',
  'Hirenum AI Writer',
  'Hook suggestions',
  'Readability scoring',
  'One-click copy',
];

const NAV_LINKS = [
  { href: '#editor',      label: 'Editor' },
  { href: '#styles',      label: 'Styles' },
  { href: '#ghostwriter', label: 'AI Writer' },
  { href: '#preview',     label: 'Preview' },
];

// Where the "Book a free audit" CTA points. Swap for your booking/calendar link.
const AUDIT_URL = 'https://hirenum.com';

const FOOTER_COLS = [
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: 'https://hirenum.com' },
      { label: 'Post Formatter', href: '#' },
      { label: 'Hook Generator', href: '#ghostwriter' },
    ],
  },
  {
    title: 'Socials',
    links: [
      { label: 'LinkedIn', href: 'https://hirenum.com' },
      { label: 'WhatsApp', href: 'https://hirenum.com' },
      { label: 'Email', href: 'mailto:info@hirenum.com' },
    ],
  },
  {
    title: 'Info',
    links: [
      { label: 'About Us', href: 'https://hirenum.com' },
      { label: 'Contact', href: 'mailto:info@hirenum.com' },
      { label: 'Careers', href: 'https://hirenum.com' },
      { label: 'Privacy Policy' },
    ],
  },
];

export default function Home() {
  const [text, setText] = useState('');
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyTimeoutRef = useRef(null);

  const saveToHistory = (newVal) => {
    setHistory(prev => {
      const activeHistory = prev.slice(0, historyIndex + 1);
      if (activeHistory[activeHistory.length - 1] === newVal) return prev;
      setHistoryIndex(activeHistory.length);
      return [...activeHistory, newVal];
    });
  };

  const handleTextChange = (newVal) => {
    setText(newVal);
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => {
      saveToHistory(newVal);
    }, 500);
  };

  const handleInstantTextUpdate = (newVal) => {
    setText(newVal);
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    saveToHistory(newVal);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setText(history[nextIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setText(history[nextIndex]);
    }
  };

  const [gwMode, setGwMode] = useState('topic');
  const [gwInput, setGwInput] = useState('');
  const [gwLoading, setGwLoading] = useState(false);
  const [gwOutput, setGwOutput] = useState('');
  const [gwError, setGwError] = useState('');
  const [copied, setCopied] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', next);
  }

  function handleApply(fn) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const scrollTop = el.scrollTop; // Save scroll position
    let newText = '';
    if (start === end) {
      newText = fn(text);
      handleInstantTextUpdate(newText);
      setTimeout(() => {
        el.focus();
        // Since unicode bold conversion can increase text length, we keep cursor position
        el.setSelectionRange(start, start);
        el.scrollTop = scrollTop; // Restore scroll position
      }, 0);
    } else {
      const selectedText = text.slice(start, end);
      const transformed = fn(selectedText);
      newText = text.slice(0, start) + transformed + text.slice(end);
      handleInstantTextUpdate(newText);
      
      // Restore focus and selection after state update
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + transformed.length);
        el.scrollTop = scrollTop; // Restore scroll position
      }, 0);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        handleApply(toggleBold);
      } else if (key === 'i') {
        e.preventDefault();
        handleApply(toggleItalic);
      } else if (key === 'u') {
        e.preventDefault();
        handleApply(toggleUnderline);
      }
    }
  };

  async function handleGenerate() {
    const content = gwInput.trim();
    if (!content && gwMode !== 'refine') return;
    if (gwMode === 'refine' && !content && !text) return;
    setGwLoading(true);
    setGwOutput('');
    setGwError('');
    try {
      const res = await fetch('/api/ghostwriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: gwMode,
          content: gwMode === 'refine' ? (content || text) : content,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGwError(data.error || 'Generation failed. Please try again.');
        setGwLoading(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setGwOutput(result);
      }
      setGwLoading(false);
    } catch {
      setGwError('Request failed. Check your connection and try again.');
      setGwLoading(false);
    }
  }

  const analysis = text ? getFoldAnalysis(text) : null;
  const marqueeContent = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflowX: 'hidden' }}>

      {/* ── Ambient background glow orbs ── */}
      <div className="glow-orb" style={{ top: '-200px', left: '-200px' }} aria-hidden="true" />
      <div className="glow-orb" style={{ bottom: '10%', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(220,0,120,0.1) 0%, rgba(27,184,189,0.05) 50%, transparent 70%)' }} aria-hidden="true" />
      <div className="glow-orb" style={{ top: '30%', right: '-150px', width: '500px', height: '500px' }} aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className="nav anim-fade-up" style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.2)' : 'none' }}>
        <div className="container nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="https://hirenum.com" target="_blank" rel="noopener noreferrer" className="nav-brand">
              {/* Hirenum logo: H + dotless-ı-with-magenta-dot + renum */}
              <div className="nav-logo-wrap">
                H<span className="nav-logo-i-wrap"><span className="nav-logo-i-stem" /><span className="nav-logo-dot" /></span>renum
              </div>
              <span className="nav-divider" />
              <span className="nav-product">Post Formatter</span>
            </a>
            <div className="nav-links">
              {NAV_LINKS.map(link => (
                <a key={link.href} href={link.href} className="nav-link">{link.label}</a>
              ))}
            </div>
          </div>
          <div className="nav-actions">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-icon"
              title="Toggle theme"
              aria-label="Toggle theme"
              style={{ borderRadius: '10px', width: '36px', height: '36px' }}
            >
              {!mounted || theme === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Marquee ── */}
      <div className="marquee-wrap anim-fade-up-1" aria-hidden="true">
        <div className="marquee-track">
          {marqueeContent.map((item, i) => (
            <span key={i} className="marquee-item">
              {item}
              <span className="marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <header className="hero anim-fade-up-2">
        <div className="container">
          <div className="hero-floating-badge anim-float">
            <span className="hero-badge-text">
              Built by <strong>Hirenum</strong> for LinkedIn creators
            </span>
          </div>
          <h1 className="hero-title">
            LinkedIn Post{' '}
            <span className="hero-title-accent">Formatter</span>
          </h1>
          <p className="hero-sub">
            Write, format, and preview your posts before you publish.
            See exactly where your content folds, score your hook, and publish with confidence.
          </p>
        </div>
      </header>

      {/* ── Workspace ── */}
      <main className="workspace anim-fade-up-3" style={{ flex: 1, paddingBottom: 'var(--section-pad)', position: 'relative', zIndex: 1 }}>
        <div className="container workspace-grid">

          {/* Left column */}
          <div className="editor-stack">

            {/* Editor */}
            <section id="editor" className="section-card hover-lift" style={{ overflow: 'visible', zIndex: 10 }}>
              <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-label" style={{ color: '#1BB8BD' }}>✦ Post Editor</span>
              </div>
              <div className="section-card-body-flush" style={{ display: 'flex', flexDirection: 'column' }}>
                <Toolbar
                  text={text}
                  onApply={handleApply}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onClear={() => handleInstantTextUpdate('')}
                  onEmoji={(emoji) => {
                    const el = textareaRef.current;
                    if (!el) return;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const newText = text.slice(0, start) + emoji + text.slice(end);
                    handleInstantTextUpdate(newText);
                    setTimeout(() => {
                      el.focus();
                      el.setSelectionRange(start + emoji.length, start + emoji.length);
                    }, 0);
                  }}
                  onFormat={handleInstantTextUpdate}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                />
                <textarea
                  ref={textareaRef}
                  className="editor-area"
                  value={text}
                  onChange={e => handleTextChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={"Write your LinkedIn post here.\n\nSelect text and use the toolbar to apply formatting to specific words or lines."}
                />
                <div className="editor-footer">
                  <button onClick={handleCopy} disabled={!text} className="btn btn-primary btn-sm">
                    {copied ? '✓ Copied!' : 'Copy post'}
                  </button>
                  <button
                    onClick={() => setFormatOpen(true)}
                    disabled={!text.trim() || text.trim().length < 30}
                    className="btn btn-format btn-sm"
                    title="Let AI Format It — restructure spacing, rhythm, and emphasis for LinkedIn"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Let AI Format It
                  </button>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={() => handleInstantTextUpdate('')}
                    disabled={!text}
                    className="btn btn-ghost btn-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </section>

            {/* Ghostwriter */}
            <section id="ghostwriter" className="section-card hover-lift">
              <div className="section-card-header">
                <span className="card-label" style={{ color: '#1BB8BD' }}>✦ Hirenum AI Writer</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {GW_MODES.map(m => (
                    <button
                      key={m.key}
                      onClick={() => { setGwMode(m.key); setGwInput(''); setGwOutput(''); setGwError(''); }}
                      className={`mode-pill${gwMode === m.key ? ' active' : ''}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="section-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <textarea
                  className="textarea-inline"
                  value={gwInput}
                  onChange={e => setGwInput(e.target.value)}
                  placeholder={
                    gwMode === 'topic'
                      ? 'Enter a topic or idea to write about...'
                      : 'Paste a draft to refine, or leave empty to refine the current post...'
                  }
                  rows={4}
                />
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={handleGenerate} disabled={gwLoading} className={`btn btn-primary btn-md${gwLoading ? ' animate-pulse-glow' : ''}`}>
                    {gwLoading ? <><span className="pulse-dot">●</span> Writing…</> : 'Generate post'}
                  </button>
                  {gwOutput && (
                    <button
                      onClick={() => { handleInstantTextUpdate(gwOutput); setGwOutput(''); setGwInput(''); }}
                      className="btn btn-ghost btn-sm"
                    >
                      Use this post
                    </button>
                  )}
                </div>
                {gwError && (
                  <p style={{ fontSize: 13, color: 'var(--danger)', lineHeight: 1.5 }}>{gwError}</p>
                )}
                {gwOutput && (
                  <div className="output-box">{gwOutput}</div>
                )}
              </div>
            </section>
          </div>

          {/* Right column — Preview */}
          <aside id="preview" className="preview-panel">
            <div className="section-card" style={{ border: '1px solid rgba(27,184,189,0.15)' }}>
              <div className="section-card-header">
                <span className="card-label" style={{ color: '#1BB8BD' }}>✦ Live Preview</span>
                <span className="card-label" style={{ color: '#0a66c2', letterSpacing: '0.1em' }}>LinkedIn</span>
              </div>
              <div className="preview-scroll">
                <LinkedInPreview text={text} />
                {analysis && (
                  <div className="analysis-card">
                    <p className="card-label" style={{ marginBottom: 12, color: '#1BB8BD' }}>Hook analysis</p>
                    {analysis.hookStrength.points && analysis.hookStrength.points.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {analysis.hookStrength.points.map((point, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                            <span style={{ flexShrink: 0, marginTop: 2 }}>
                              {point.type === 'good' ? '✅' : point.type === 'bad' ? '⚠️' : '💡'}
                            </span>
                            <span style={{ color: point.type === 'good' ? 'var(--success)' : point.type === 'bad' ? 'var(--danger)' : 'var(--warning)' }}>
                              {point.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: analysis.hookStrength.color || 'var(--ink-tertiary)', fontSize: 13, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                        {analysis.hookStrength.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* ── Audit CTA ── */}
        <section id="audit" className="audit-cta-section">
          <div className="container">
            <div className="audit-card hover-lift">
              <div className="audit-card-glow" aria-hidden="true" />
              <div className="audit-card-content">
                <span className="audit-card-eyebrow">✦ Hirenum Strategy</span>
                <h2 className="audit-card-title">Still don&apos;t know what to post?</h2>
                <p className="audit-card-sub">
                  Book a free audit and we&apos;ll map out the content strategy to escalate
                  your presence — sharper hooks, the right themes, and a posting rhythm
                  built around your goals.
                </p>
              </div>
              <div className="audit-card-action">
                <a
                  href={AUDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg audit-card-btn"
                >
                  Book a free audit
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </a>
                <span className="audit-card-note">No commitment · 30-minute call</span>
              </div>
            </div>
          </div>
        </section>

        <StylePreviews text={text} />
      </main>

      <AiFormatPanel
        text={text}
        open={formatOpen}
        onClose={() => setFormatOpen(false)}
        onApply={handleInstantTextUpdate}
      />

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-top-border" />
        <div className="container footer-inner">
          <div className="footer-grid">
            {/* Brand column */}
            <div className="footer-brand-col">
              <a href="https://hirenum.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <div className="footer-logo-wrap">
                    H<span className="footer-logo-i-wrap"><span className="footer-logo-i-stem" /><span className="footer-logo-dot" /></span>renum
                  </div>
              </a>
              <p className="footer-tagline">
                LinkedIn personal branding for founders and executive leaders.
              </p>
            </div>

            {/* 3 link columns */}
            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <p className="footer-col-title">{col.title}</p>
                <div className="footer-col-links">
                  {col.links.map(link => (
                    link.href ? (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="footer-col-link"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span key={link.label} className="footer-col-text">
                        {link.label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer bottom bar */}
          <div className="footer-bottom">
            <p className="footer-text">
              A tool by{' '}
              <a href="https://hirenum.com" target="_blank" rel="noopener noreferrer" className="footer-link">Hirenum</a>
              {' '}— LinkedIn personal branding for founders and leaders.
            </p>
            <a href="mailto:info@hirenum.com" className="footer-email">info@hirenum.com</a>
          </div>
        </div>

        {/* Massive HIRENUM backplate text */}
        <div className="footer-backplate" aria-hidden="true">HIRENUM</div>
      </footer>
    </div>
  );
}
