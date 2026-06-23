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
];

const NAV_LINKS = [
  { href: '#editor',  label: 'Editor' },
  { href: '#styles',  label: 'Styles' },
  { href: '#preview', label: 'Preview' },
];

// Where the "Book a free audit" CTA points. Swap for your booking/calendar link.
const AUDIT_URL = 'https://hirenum.com';

const FOOTER_COLS = [
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: 'https://hirenum.com' },
      { label: 'Post Formatter', href: '#' },
      { label: 'Hook Generator', href: '#editor' },
    ],
  },
  {
    title: 'Socials',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/hirenum/posts/?feedView=all' },
      { label: 'WhatsApp', href: 'https://api.whatsapp.com/' },
      { label: 'Email', href: 'mailto:hello@hirenum.com' },
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
              className={`btn btn-ghost btn-icon bulb-toggle ${mounted && theme === 'light' ? 'is-on' : 'is-off'}`}
              title={mounted && theme === 'light' ? 'Turn off the lights (dark mode)' : 'Turn on the lights (light mode)'}
              aria-label="Toggle theme"
              aria-pressed={mounted && theme === 'light'}
              style={{ borderRadius: '10px', width: '36px', height: '36px' }}
            >
              {/* Yellow orb that jumps up into the bulb when the light turns on */}
              <span className="bulb-orb" aria-hidden="true" />
              <svg className="bulb-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                <path d="M9 18h6"/>
                <path d="M10 22h4"/>
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
              <span className="brand-logo">HIRENUM</span>
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
            <div className="section-card preview-card" style={{ border: '1px solid rgba(27,184,189,0.15)' }}>
              <div className="section-card-header">
                <span className="card-label" style={{ color: '#1BB8BD' }}>✦ Live Preview</span>
                <span className="card-label" style={{ color: '#0a66c2', letterSpacing: '0.1em' }}>LinkedIn</span>
              </div>
              <div className="preview-scroll">
                <LinkedInPreview text={text} />
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
              . LinkedIn personal branding for founders and leaders.
            </p>
            <span className="footer-email">hello@hirenum.com</span>
          </div>
        </div>

        {/* Massive HIRENUM backplate text */}
        <div className="footer-backplate" aria-hidden="true">HIRENUM</div>
      </footer>
    </div>
  );
}
