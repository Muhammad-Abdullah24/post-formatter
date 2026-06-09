'use client';

import { useState, useRef, useEffect } from 'react';
import { getFoldAnalysis } from '@/lib/foldline';
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
  'AI ghostwriter',
  'Hook suggestions',
  'Readability scoring',
  'One-click copy',
  'Free forever',
];

const NAV_LINKS = [
  { href: '#editor',      label: 'Editor' },
  { href: '#styles',      label: 'Styles' },
  { href: '#ghostwriter', label: 'AI Writer' },
  { href: '#preview',     label: 'Preview' },
];

const FOOTER_COLS = [
  {
    title: 'Services',
    links: [
      { label: 'Ghostwriting', href: 'https://hirenum.com' },
      { label: 'Executive Branding', href: 'https://hirenum.com' },
      { label: 'Profile Strategy', href: 'https://hirenum.com' },
      { label: 'Content Systems', href: 'https://hirenum.com' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: 'https://hirenum.com' },
      { label: 'Post Formatter', href: '#' },
      { label: 'Hook Generator', href: '#ghostwriter' },
      { label: 'LinkedIn Playbook', href: 'https://hirenum.com' },
    ],
  },
  {
    title: 'Socials',
    links: [
      { label: 'LinkedIn', href: 'https://hirenum.com' },
      { label: 'Twitter / X', href: 'https://hirenum.com' },
      { label: 'Threads', href: 'https://hirenum.com' },
      { label: 'Instagram', href: 'https://hirenum.com' },
    ],
  },
  {
    title: 'Info',
    links: [
      { label: 'About Us', href: 'https://hirenum.com' },
      { label: 'Contact', href: 'mailto:info@hirenum.com' },
      { label: 'Careers', href: 'https://hirenum.com' },
      { label: 'Privacy Policy', href: 'https://hirenum.com' },
    ],
  },
];

export default function Home() {
  const [text, setText] = useState('');
  const [gwMode, setGwMode] = useState('topic');
  const [gwInput, setGwInput] = useState('');
  const [gwLoading, setGwLoading] = useState(false);
  const [gwOutput, setGwOutput] = useState('');
  const [gwError, setGwError] = useState('');
  const [copied, setCopied] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [scrolled, setScrolled] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
    if (start === end) setText(fn(text));
    else setText(text.slice(0, start) + fn(text.slice(start, end)) + text.slice(end));
  }

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
                H<span className="nav-logo-i-wrap">&#x131;<span className="nav-logo-dot" /></span>renum
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
            {analysis && (
              <div style={{ display: 'flex', gap: 6 }}>
                <span className={`badge ${analysis.desktopFolded ? 'badge-warn' : 'badge-ok'}`}>
                  {analysis.desktopFolded ? '⚠ Desktop' : '✓ Desktop'}
                </span>
                <span className={`badge ${analysis.mobileFolded ? 'badge-warn' : 'badge-ok'}`}>
                  {analysis.mobileFolded ? '⚠ Mobile' : '✓ Mobile'}
                </span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-icon"
              title="Toggle theme"
              aria-label="Toggle theme"
              style={{ borderRadius: '10px', width: '36px', height: '36px' }}
            >
              {theme === 'light' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Free tool by Hirenum
          </div>
          <h1 className="hero-title">
            LinkedIn Post{' '}
            <span className="hero-title-accent">Formatter</span>
          </h1>
          <p className="hero-sub">
            Write, format, and preview your posts — before you publish.
            See exactly where your content folds, score your hook, and publish with confidence.
          </p>
          <div className="hero-meta">
            <span className="badge badge-neutral">Free</span>
            <span className="badge badge-neutral">No login needed</span>
            {analysis && (
              <span
                className="badge"
                style={{
                  background: analysis.hookStrength.score === 'strong' ? 'rgba(16,185,129,0.1)'
                    : analysis.hookStrength.score === 'bad' ? 'rgba(239,68,68,0.1)'
                    : 'rgba(245,158,11,0.1)',
                  color: analysis.hookStrength.score === 'strong' ? 'var(--success)'
                    : analysis.hookStrength.score === 'bad' ? 'var(--danger)'
                    : 'var(--warning)',
                  border: `1px solid ${analysis.hookStrength.score === 'strong' ? 'rgba(16,185,129,0.25)' : analysis.hookStrength.score === 'bad' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                }}
              >
                {analysis.hookStrength.message}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Workspace ── */}
      <main className="workspace anim-fade-up-3" style={{ flex: 1, paddingBottom: 'var(--section-pad)', position: 'relative', zIndex: 1 }}>
        <div className="container workspace-grid">

          {/* Left column */}
          <div className="editor-stack">

            {/* Editor */}
            <section id="editor" className="section-card hover-lift">
              <div className="section-card-header">
                <span className="card-label" style={{ color: '#1BB8BD' }}>✦ Post Editor</span>
              </div>
              <div className="section-card-body-flush" style={{ display: 'flex', flexDirection: 'column' }}>
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
                  onFormatOpen={() => setFormatOpen(true)}
                />
                <textarea
                  ref={textareaRef}
                  className="editor-area"
                  value={text}
                  onChange={e => setText(e.target.value)}
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
                    title="Restructure spacing, rhythm, and emphasis for LinkedIn"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    AI Format
                  </button>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={() => setText('')}
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
                <span className="card-label" style={{ color: '#1BB8BD' }}>✦ AI Ghostwriter</span>
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
                      onClick={() => { setText(gwOutput); setGwOutput(''); setGwInput(''); }}
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
                    <p className="card-label" style={{ marginBottom: 8, color: '#1BB8BD' }}>Hook analysis</p>
                    <p style={{
                      color: analysis.hookStrength.score === 'strong' ? 'var(--success)'
                        : analysis.hookStrength.score === 'bad' ? 'var(--danger)'
                        : 'var(--warning)',
                      fontSize: 13,
                      fontFamily: 'Roboto, sans-serif',
                      lineHeight: 1.6,
                    }}>
                      {analysis.hookStrength.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        <StylePreviews text={text} />
      </main>

      <AiFormatPanel
        text={text}
        open={formatOpen}
        onClose={() => setFormatOpen(false)}
        onApply={setText}
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
                    H<span className="footer-logo-i-wrap">&#x131;<span className="footer-logo-dot" /></span>renum
                  </div>
              </a>
              <p className="footer-tagline">
                LinkedIn personal branding for founders and executive leaders.
              </p>
            </div>

            {/* 4 link columns */}
            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <p className="footer-col-title">{col.title}</p>
                <div className="footer-col-links">
                  {col.links.map(link => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="footer-col-link"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer bottom bar */}
          <div className="footer-bottom">
            <p className="footer-text">
              A free tool by{' '}
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
