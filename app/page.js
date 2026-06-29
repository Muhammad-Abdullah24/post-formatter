'use client';

import { useState, useRef, useEffect } from 'react';
import { getFoldAnalysis } from '@/lib/foldline';
import { toggleBold, toggleItalic, toggleUnderline } from '@/lib/unicode';
import Toolbar from '@/components/Toolbar';
import StylePreviews from '@/components/StylePreviews';
import AiFormatPanel from '@/components/AiFormatPanel';
import AiCoach from '@/components/AiCoach';
import LinkedInPreview from '@/components/LinkedInPreview';
import SmartToast from '@/components/SmartToast';
import FaqAccordion from '@/components/FaqAccordion';

const MARQUEE_ITEMS = [
  'Fold-line preview',
  'Unicode formatting',
  'Hook suggestions',
  'Readability scoring',
  'One-click copy',
  'Keyboard shortcuts',
  'Rich text editing',
  'Ideal length check',
];

const NAV_LINKS = [
  { href: '#editor',  label: 'Editor' },
  { href: '#styles',  label: 'Styles' },
  { href: '#preview', label: 'Preview' },
];

// Where the "Book a free audit" CTA points. Swap for your booking/calendar link.
const AUDIT_URL = 'https://hirenum.com/#linkedin-audit';

// Official brand glyphs + colors for the footer social links.
const SOCIAL_ICONS = {
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
  whatsapp: 'M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.929-1.03zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z',
  email: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
};

function SocialIcon({ name, color }) {
  const path = SOCIAL_ICONS[name];
  if (!path) return null;
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={path} />
    </svg>
  );
}

const FOOTER_COLS = [
  {
    title: 'Socials',
    centered: true,
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/hirenum/posts/?feedView=all', icon: 'linkedin', color: '#0A66C2' },
      { label: 'WhatsApp', href: 'https://wa.me/923063624299?text=Hey%2C%20Checked%20your%20website%20and%20wanted%20to%20know%20about', icon: 'whatsapp', color: '#25D366' },
      { label: 'Email', href: 'mailto:hello@hirenum.com', icon: 'email', color: '#EA4335' },
    ],
  },
  {
    title: 'Info',
    links: [
      { label: 'About Us', href: 'https://hirenum.com' },
      { label: 'Contact', href: 'mailto:hello@hirenum.com' },
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
  // Lets the AI coach trigger the Toolbar's hook generator (which owns the
  // popover positioned next to its button).
  const triggerHooksRef = useRef(null);

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
      // Apply to the current line if nothing is selected
      let lineStart = text.lastIndexOf('\n', start - 1);
      lineStart = lineStart === -1 ? 0 : lineStart + 1;
      let lineEnd = text.indexOf('\n', start);
      if (lineEnd === -1) lineEnd = text.length;

      const currentLine = text.slice(lineStart, lineEnd);
      const transformedLine = fn(currentLine);
      
      newText = text.slice(0, lineStart) + transformedLine + text.slice(lineEnd);
      handleInstantTextUpdate(newText);
      
      const lengthDiff = transformedLine.length - currentLine.length;
      const newCursor = Math.max(lineStart, start + lengthDiff);
      
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(newCursor, newCursor);
        el.scrollTop = scrollTop;
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

  const trimmedText = text.trim();
  const analysis = trimmedText ? getFoldAnalysis(trimmedText) : null;
  // Repeat enough times to guarantee it wraps around ultra-wide monitors without a gap
  const marqueeContent = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

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
              <img src="/hirenum-logo.png" alt="Hirenum" style={{ width: '140px', height: 'auto', objectFit: 'contain' }} />
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
              className={`btn btn-ghost btn-icon theme-toggle ${mounted && theme === 'light' ? 'is-light' : 'is-dark'}`}
              title={mounted && theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label="Toggle theme"
              aria-pressed={mounted && theme === 'light'}
              style={{ borderRadius: '10px', width: '36px', height: '36px' }}
            >
              <svg className="sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg className="moon-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
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
              Built by{' '}
              <a href="https://hirenum.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <span className="brand-logo">HIRENUM</span>
              </a>
              {' '}for LinkedIn creators
            </span>
          </div>
          <h1 className="hero-title anim-fade-up" style={{ animationDelay: '0.1s', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0a66c2" width="1em" height="1em" aria-label="LinkedIn" style={{ transform: 'translateY(-2px)' }}>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Post <span className="hero-title-accent text-shimmer">Formatter</span>
          </h1>
          <p className="hero-sub">
            Write, format, and preview your LinkedIn posts before you publish.
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
            <section id="editor" className="section-card hover-lift" style={{ overflow: 'visible', zIndex: 10, position: 'relative' }}>
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
                  onRegisterHooks={(fn) => { triggerHooksRef.current = fn; }}
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
                    title="Let AI Format It: restructure spacing, rhythm, and emphasis for LinkedIn"
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

              <AiCoach
                text={text}
                onFormat={() => setFormatOpen(true)}
                onHooks={() => triggerHooksRef.current?.()}
              />
            </section>

          </div>

          {/* Right column: Preview */}
          <aside id="preview" className="preview-panel">
            <div className="section-card preview-card" style={{ border: '1px solid var(--card-edge)' }}>
              <div className="section-card-header">
                <span className="card-label" style={{ color: '#1BB8BD' }}>✦ Live Preview</span>
                <span style={{ display: 'flex', alignItems: 'center' }} title="LinkedIn">
                  <svg viewBox="-1 -1 26 26" width="22" height="22" fill="#0a66c2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </span>
              </div>
              <div className="preview-scroll">
                <LinkedInPreview text={trimmedText} />
              </div>
              {analysis && (
                <div className="preview-analysis">
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
                </div>
              )}
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
                  your presence: sharper hooks, the right themes, and a posting rhythm
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

        {/* ── Section 1 — Hook Headline ── */}
        <section className="content-section" style={{ paddingBottom: 'clamp(30px, 5vw, 60px)' }}>
          <div className="container">
            <div className="content-hero anim-fade-up">
              <h2 className="content-hero-headline text-shimmer">
                Most LinkedIn posts die in the first line.
              </h2>
              <p className="content-hero-sub">
                Not because the writing is bad. Because the hook doesn&apos;t stop the scroll, the formatting buries the point, or the post gets cut off before anyone reaches the good part. This tool fixes all three before you hit publish.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 2 — Fold Line Explainer ── */}
        <section className="content-section">
          <div className="container">
            <div className="content-grid-split">
              <div className="content-sticky-side">
                <span className="content-eyebrow">✦ The Fold Line</span>
                <h2 className="content-section-title">
                  The fold line is the most important line in your post. Most people don&apos;t know where it is.
                </h2>
              </div>
              <div className="glass-panel hover-glow">
                <div className="content-body">
                  <p>
                    LinkedIn cuts your post off after roughly 210 characters on mobile and 3 lines on desktop. Everything after that sits behind a &ldquo;...more&rdquo; button that most readers never tap. That means your second sentence (not your hook) is often the last thing a casual scroller actually reads.
                  </p>
                  <p>
                    The fold line preview in this tool shows you exactly where LinkedIn draws that line, on both mobile and desktop, in real time as you type. Move your strongest idea above it. Let the rest breathe below.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3 — Hook Scoring (Reversed + Bento Box) ── */}
        <section className="content-section" style={{ position: 'relative' }}>
          {/* Ambient Glow */}
          <div className="glow-orb" style={{ top: '10%', right: '-150px', background: 'radial-gradient(circle, rgba(220,0,120,0.1) 0%, rgba(27,184,189,0.05) 50%, transparent 70%)' }} aria-hidden="true" />
          
          <div className="container">
            <div className="content-grid-split is-reversed">
              <div className="content-sticky-side">
                <span className="content-eyebrow">✦ Hook Analysis</span>
                <h2 className="content-section-title">
                  A strong hook isn&apos;t a question mark. It&apos;s a reason to keep reading.
                </h2>
                <div className="content-body">
                  <p>
                    The oldest advice on LinkedIn hooks: &ldquo;end your first line with a question&rdquo; or &ldquo;start with a number&rdquo;. This isn&apos;t wrong, but it&apos;s incomplete. A question that&apos;s vague stops nobody. A number with no stakes doesn&apos;t either.
                  </p>
                  <p>
                    The hook analyzer in this tool scores your first line against these signals, not as a gimmick, but as a fast gut-check before you publish to 3,000 connections.
                  </p>
                </div>
              </div>
              
              <div className="bento-grid">
                <div className="bento-card">
                  <div className="bento-icon">💡</div>
                  <p className="bento-text">A specific claim they haven&apos;t heard before.</p>
                </div>
                <div className="bento-card">
                  <div className="bento-icon">⚡️</div>
                  <p className="bento-text">A tension they recognize from their own work.</p>
                </div>
                <div className="bento-card">
                  <div className="bento-icon">📈</div>
                  <p className="bento-text">A concrete result with a named context, not &ldquo;I increased revenue&rdquo; but &ldquo;we hit 4x pipeline in 6 weeks.&rdquo;</p>
                </div>
                <div className="bento-card">
                  <div className="bento-icon">🎁</div>
                  <p className="bento-text">An opener that tells them exactly what they&apos;ll get if they keep reading.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4 — Formatting Philosophy ── */}
        <section className="content-section">
          <div className="container">
            <div className="content-grid-split">
              <div className="content-sticky-side">
                <span className="content-eyebrow">✦ Formatting</span>
                <h2 className="content-section-title">
                  Bold everything and nothing stands out.
                </h2>
              </div>
              <div className="glass-panel hover-glow">
                <div className="content-body">
                  <p>
                    Unicode bold on LinkedIn is not Microsoft Word bold. It doesn&apos;t inherit a font; it substitutes a different Unicode character that looks heavier. That means it works everywhere LinkedIn renders text: feed, notifications, DMs, mobile, desktop.
                  </p>
                  <p>
                    But most people bold too much. When everything is emphasized, nothing is. The posts that perform best treat bold the way good design treats white space: sparingly, deliberately, with a clear purpose for every mark.
                  </p>
                  <p>
                    The rule that actually works: read your bolded words alone, top to bottom, like a headline. If they don&apos;t tell a coherent story on their own, you&apos;ve bolded the wrong things.
                  </p>
                  <p>
                    This formatter gives you every Unicode style LinkedIn supports (bold, italic, sans-serif variants, script, strikethrough, and more) along with a live preview that shows you exactly how each one renders in the feed before anyone else sees it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5 — Hirenum Positioning ── */}
        <section className="content-section" style={{ position: 'relative' }}>
          <div className="glow-orb" style={{ bottom: '0', left: '-20%', width: '800px', height: '800px' }} aria-hidden="true" />
          <div className="container">
            <div className="audit-card hover-lift" style={{ margin: '0 auto', maxWidth: '1000px' }}>
              <div className="audit-card-glow" aria-hidden="true" />
              <div className="audit-card-content">
                <span className="audit-card-eyebrow">✦ About The Creators</span>
                <h2 className="audit-card-title">
                  Built by people who think about LinkedIn for a living.
                </h2>
                <div className="content-body" style={{ marginTop: '16px' }}>
                  <p className="audit-card-sub" style={{ marginBottom: '12px' }}>
                    Hirenum works with founders and executive leaders who treat LinkedIn as a serious distribution channel, not a place to post company updates and hope for the best.
                  </p>
                  <p className="audit-card-sub" style={{ marginBottom: '12px' }}>
                    This tool is what we built for ourselves before we made it public. Every feature in it comes from a real problem we kept running into while producing content for clients.
                  </p>
                  <p className="audit-card-sub">
                    If you&apos;re getting value from the tool and want to go deeper with a sharper content strategy, a consistent publishing rhythm, and a personal brand that actually generates pipeline, that&apos;s what we do.
                  </p>
                </div>
              </div>
              <div className="audit-card-action">
                <a
                  href={AUDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg audit-card-btn"
                >
                  Book a free audit
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: '4px' }}>
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 6 — FAQ ── */}
        <section className="content-section">
          <div className="container">
            <div className="content-grid-split">
              <div className="content-sticky-side">
                <span className="content-eyebrow">✦ FAQ</span>
                <h2 className="content-section-title">
                  Frequently asked questions
                </h2>
                <p className="content-hero-sub" style={{ marginLeft: 0 }}>
                  Everything you need to know about how the tool works and how LinkedIn processes formatting.
                </p>
              </div>
              <div style={{ marginTop: '20px' }}>
                <FaqAccordion />
              </div>
            </div>
          </div>
        </section>
      </main>

      <AiFormatPanel
        text={text}
        open={formatOpen}
        onClose={() => setFormatOpen(false)}
        onApply={handleInstantTextUpdate}
      />

      <SmartToast text={text} />

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-top-border" />
        <div className="container footer-inner">
          <div className="footer-grid">
            {/* Brand column */}
            <div className="footer-brand-col">
              <a href="https://hirenum.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <div>
                  <img src="/hirenum-logo.png" alt="Hirenum" style={{ width: '140px', height: 'auto', objectFit: 'contain' }} />
                </div>
              </a>
              <p className="footer-tagline">
                LinkedIn personal branding for founders and executive leaders.
              </p>
            </div>

            {/* 3 link columns */}
            {FOOTER_COLS.map(col => (
              <div key={col.title} className={col.centered ? 'footer-col footer-col--centered' : 'footer-col'}>
                <p className="footer-col-title">{col.title}</p>
                <div className="footer-col-links">
                  {col.links.map(link => {
                    const inner = link.icon ? (
                      <SocialIcon name={link.icon} color={link.color} />
                    ) : link.label;
                    const linkClass = link.icon ? 'footer-col-link footer-col-link--icon' : 'footer-col-link';
                    return link.href ? (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className={linkClass}
                        aria-label={link.icon ? link.label : undefined}
                        title={link.icon ? link.label : undefined}
                      >
                        {inner}
                      </a>
                    ) : (
                      <span key={link.label} className="footer-col-text">
                        {inner}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer bottom bar */}
          <div className="footer-bottom">
            <p className="footer-text">
              A tool by{' '}
              <a href="https://hirenum.com" target="_blank" rel="noopener noreferrer" className="footer-link">Hirenum</a>
              . LinkedIn personal branding for founders and leaders.
            </p>
            <a href="mailto:hello@hirenum.com" className="footer-email">hello@hirenum.com</a>
          </div>
        </div>

        {/* Massive HIRENUM backplate text */}
        <div className="footer-backplate" aria-hidden="true">HIRENUM</div>
      </footer>
    </div>
  );
}
