'use client';

import { useState, useEffect } from 'react';
import { getFoldAnalysis } from '@/lib/foldline';

/* ─── Text renderer — hashtag highlighting ─── */
function renderFormattedText(text) {
  const parts = text.split(/(#[\w\u00C0-\u024F]+)/g);
  return parts.map((part, i) =>
    part.startsWith('#')
      ? <span key={i} className="li-hashtag">{part}</span>
      : <span key={i}>{part}</span>
  );
}

/* ─── Mobile outline icon ─── */
function MobileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

/* ─── Desktop outline icon ─── */
function DesktopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

/* ─── LinkedIn Premium gold "in" logo ─── */
function LinkedInLogo() {
  return (
    <svg
      className="li-in-logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-label="LinkedIn"
    >
      <rect width="24" height="24" rx="4" fill="#A37C27" />
      <rect x="0.5" y="0.5" width="23" height="23" rx="3.5"
        fill="url(#liGold)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <defs>
        <linearGradient id="liGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0C040" />
          <stop offset="50%" stopColor="#C89B2A" />
          <stop offset="100%" stopColor="#A37C27" />
        </linearGradient>
      </defs>
      {/* "i" */}
      <rect x="5" y="10" width="3" height="9" rx="0.5" fill="#fff" />
      <rect x="5" y="6.5" width="3" height="2.5" rx="0.5" fill="#fff" />
      {/* "n" */}
      <rect x="10" y="10" width="2.8" height="9" rx="0.5" fill="#fff" />
      <path
        d="M12.8 13.2 C12.8 11.4 13.9 10 15.6 10 C17.2 10 18 11.2 18 13V19 H15.2 V13.5 C15.2 12.8 14.8 12.3 14.2 12.3 C13.5 12.3 12.8 12.8 12.8 13.6 Z"
        fill="#fff"
      />
    </svg>
  );
}

/* ─── LinkedIn Verification Shield Badge ─── */
function VerificationBadge() {
  return (
    <svg
      className="li-verified-badge"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-label="Verified"
    >
      <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
      <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
    </svg>
  );
}

/* ─── Globe icon (public) ─── */
function GlobeIcon() {
  return (
    <svg className="li-globe-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm5.44 4.496h-2.074c-.225-1.082-.57-1.998-1.006-2.64A6.444 6.444 0 0113.44 4.496zM8 1.6c.603.706 1.078 1.822 1.35 3.13H6.65C6.922 3.423 7.397 2.306 8 1.6zM1.648 9.6A6.476 6.476 0 011.6 8c0-.55.074-1.085.213-1.6h2.361A13.49 13.49 0 004.1 8c0 .544.027 1.077.075 1.6H1.648zm.913 1.6h2.073c.225 1.082.57 1.998 1.006 2.64A6.444 6.444 0 012.56 11.2zm2.073-6.704H2.56a6.444 6.444 0 013.08-2.64c-.436.642-.781 1.558-1.006 2.64zM8 14.4c-.603-.706-1.078-1.822-1.35-3.13h2.7C9.078 12.577 8.603 13.694 8 14.4zM6.524 9.6A11.84 11.84 0 016.45 8c0-.546.027-1.08.074-1.6h2.951A11.84 11.84 0 019.55 8c0 .544-.025 1.077-.074 1.6H6.524zm.127 1.6h2.698c-.272 1.307-.747 2.424-1.35 3.13-.602-.706-1.077-1.823-1.348-3.13zm3.716 2.64c.436-.642.78-1.558 1.006-2.64h2.073a6.444 6.444 0 01-3.08 2.64zM11.826 9.6A13.49 13.49 0 0011.9 8a13.49 13.49 0 00-.075-1.6h2.362c.138.515.213 1.05.213 1.6 0 .55-.075 1.085-.213 1.6h-2.362z"/>
    </svg>
  );
}

/* ─── Reaction emoji bubbles ─── */
function ReactionStack() {
  return (
    <div className="li-reaction-stack">
      {/* Like */}
      <span className="li-reaction-bubble li-reaction-like" title="Like">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="11" height="11">
          <path fill="#fff" d="M21.2 10.3c-.4-.5-1-.8-1.7-.8h-4.8l.8-3.4c.1-.6-.1-1.3-.5-1.7-.4-.5-1-.7-1.7-.7h-.3c-.6 0-1.2.4-1.5.9l-3.3 6.6H4c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h2.5c.8 0 1.5-.5 1.8-1.2h6.9c1 0 1.9-.6 2.3-1.5l2.4-6.4c.3-.8.2-1.9-.3-2.7z"/>
        </svg>
      </span>
      {/* Love */}
      <span className="li-reaction-bubble li-reaction-love" title="Love">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10">
          <path fill="#fff" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </span>
      {/* Insightful */}
      <span className="li-reaction-bubble li-reaction-insight" title="Insightful">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="11" height="11">
          <path fill="#fff" d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7zm1 18h-2v1h2v-1zm1 2h-4v1h4v-1z"/>
        </svg>
      </span>
    </div>
  );
}

/* ─── Action bar icons (pixel-matched to LinkedIn) ─── */
function InsightfulActionIcon() {
  return (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill="#F5C518" />
      <path
        fill="#fff"
        d="M8 2a3.5 3.5 0 0 0-3.5 3.5c0 1.4.9 2.6 2.2 3.2V10c0 .4.3.8.8.8h1c.5 0 .8-.4.8-.8V8.7c1.3-.6 2.2-1.8 2.2-3.2A3.5 3.5 0 0 0 8 2zm1.5 10.5H6.5v0.8h3v-0.8zM9 13.8H7v0.8h2v-0.8z"
      />
    </svg>
  );
}

function LikeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );
}

function RepostIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
    </svg>
  );
}

/* ─── Post body with fold ─── */
function PostBody({ text, analysis, expanded, onExpand, viewMode }) {
  if (!text || !text.trim()) {
    return (
      <p className="li-post-text li-post-text-empty">
        Start writing and your post will appear here.
      </p>
    );
  }

  const isMobile = viewMode === 'mobile';
  const folded = isMobile ? analysis.mobileFolded : analysis.desktopFolded;
  const previewText = isMobile ? analysis.mobilePreview : analysis.desktopPreview;

  if (!folded || expanded) {
    return (
      <div className="li-post-text">
        {renderFormattedText(text)}
      </div>
    );
  }

  return (
    <div className="li-post-text">
      {renderFormattedText(previewText)}<button
        type="button"
        className="li-more-btn"
        onClick={onExpand}
      >…see more</button>
    </div>
  );
}

/* ─── Main export ─── */
export default function LinkedInPreview({ text }) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'
  const analysis = getFoldAnalysis(text || '');

  const [prevText, setPrevText] = useState(text);
  const [prevViewMode, setPrevViewMode] = useState(viewMode);
  if (text !== prevText || viewMode !== prevViewMode) {
    setPrevText(text);
    setPrevViewMode(viewMode);
    setExpanded(false);
  }

  return (
    <div className="li-preview-container">
      {/* View Switcher */}
      <div className="li-view-switcher">
        <button
          type="button"
          className={`li-switch-btn ${viewMode === 'mobile' ? 'active' : ''}`}
          onClick={() => setViewMode('mobile')}
          aria-label="Switch to Mobile View"
        >
          <MobileIcon />
          <span>Mobile</span>
        </button>
        <button
          type="button"
          className={`li-switch-btn ${viewMode === 'desktop' ? 'active' : ''}`}
          onClick={() => setViewMode('desktop')}
          aria-label="Switch to Desktop View"
        >
          <DesktopIcon />
          <span>Desktop</span>
        </button>
      </div>

      {/* Preview Card */}
      <div className={`li-feed-wrap ${viewMode}`}>
        {/* ── Post card ── */}
        <article className="li-post-card">

          {/* Header */}
          <div className="li-post-header">

            {/* Avatar with fallback */}
            <div className="li-avatar-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/muhammad_bin_aslam.jpg"
                alt="Muhammad Bin Aslam"
                className="li-avatar-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const sibling = e.target.nextSibling;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
              <div className="li-avatar" aria-hidden="true" style={{ display: 'none' }}>
                MB
              </div>
            </div>

            {/* Author info */}
            <div className="li-post-author">
              <div className="li-name-row">
                <a
                  href="https://www.linkedin.com/in/mbinaslam/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="li-post-name"
                >
                  Muhammad Bin Aslam
                </a>
                <VerificationBadge />
                <div className="li-premium-badge-inline" title="LinkedIn Premium">
                  <LinkedInLogo />
                </div>
                <span className="li-degree">• 1st</span>
              </div>
              <p className="li-post-headline">Co-founder Hirenum | LinkedIn Lead Gen...</p>
              <div className="li-post-meta">
                <span>10h</span>
                <span className="li-meta-dot" aria-hidden="true">•</span>
                <GlobeIcon />
              </div>
            </div>

            {/* Menu button */}
            <div className="li-post-menu">
              <button type="button" className="li-menu-btn" aria-label="More options">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M14 12a2 2 0 11-2-2 2 2 0 012 2zM4 10a2 2 0 102 2 2 2 0 00-2-2zm16 0a2 2 0 102 2 2 2 0 00-2-2z"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="li-post-body">
            <PostBody
              text={text}
              analysis={analysis}
              expanded={expanded}
              onExpand={() => setExpanded(true)}
              viewMode={viewMode}
            />
          </div>

          {/* Social counts */}
          <div className="li-social-counts">
            <div className="li-reactions-row">
              <ReactionStack />
              <span className="li-reactions-text">Noor and 10 others</span>
            </div>
            <div className="li-counts-row">
              <span>40 comments</span>
              <span className="li-meta-dot" aria-hidden="true">•</span>
              <span>3 reposts</span>
            </div>
          </div>

          {/* Divider */}
          <div className="li-divider" role="separator" />

          {/* Action bar */}
          <div className="li-action-bar">
            {/* Viewer avatar */}
            <div className="li-action-viewer">
              <div className="li-viewer-avatar-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/muhammad_bin_aslam.jpg"
                  alt="Viewer Avatar"
                  className="li-viewer-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const sibling = e.target.nextSibling;
                    if (sibling) sibling.style.display = 'flex';
                  }}
                />
                <div className="li-viewer-avatar" aria-hidden="true" style={{ display: 'none' }}>
                  Y
                </div>
              </div>
              <svg className="li-chevron" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 9l6 6 6-6H6z"/>
              </svg>
            </div>

            <button type="button" className="li-action-btn li-action-insightful-active" aria-label="Insightful">
              <InsightfulActionIcon /><span>Insightful</span>
            </button>
            <button type="button" className="li-action-btn" aria-label="Comment">
              <CommentIcon /><span>Comment</span>
            </button>
            <button type="button" className="li-action-btn" aria-label="Repost">
              <RepostIcon /><span>Repost</span>
            </button>
            <button type="button" className="li-action-btn" aria-label="Send">
              <SendIcon /><span>Send</span>
            </button>
          </div>
        </article>
      </div>


    </div>
  );
}
