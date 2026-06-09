'use client';

import { useState, useEffect } from 'react';
import { getFoldAnalysis } from '@/lib/foldline';

const DESKTOP_FOLD = 210;

function getFoldPreview(text) {
  if (text.length <= DESKTOP_FOLD) return text;
  let cut = text.slice(0, DESKTOP_FOLD);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > DESKTOP_FOLD * 0.65) cut = cut.slice(0, lastSpace);
  return cut.trimEnd();
}

function renderFormattedText(text) {
  const parts = text.split(/(#[\w\u00C0-\u024F]+)/g);
  return parts.map((part, i) =>
    part.startsWith('#')
      ? <span key={i} className="li-hashtag">{part}</span>
      : <span key={i}>{part}</span>
  );
}

function GlobeIcon() {
  return (
    <svg className="li-globe-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        fill="#fff"
        d="M5.8 2.8C4.5 3.2 3.5 4.2 3.2 5.5 2.9 6.8 3.1 8.2 3.8 9.4 4.3 10.2 5.2 10.8 6.2 11.1 7 11.3 7.8 11 8.3 10.3 8.8 9.6 9 8.6 8.9 7.6 8.7 6.2 8.2 5 7.3 4.1 6.6 3.5 5.8 2.8Z"
      />
      <path
        fill="#fff"
        d="M9.9 4.4C10.5 4.2 11.1 4.5 11.5 5 11.9 5.5 11.9 6.2 11.6 6.7 11.3 7.2 10.7 7.5 10.1 7.6 9.6 7.7 9.1 7.4 8.8 6.9 8.5 6.3 8.6 5.6 8.9 5.1 9.2 4.6 9.5 4.4 9.9 4.4Z"
      />
    </svg>
  );
}

function ReactionStack() {
  return (
    <div className="li-reaction-stack">
      <span className="li-reaction-bubble li-reaction-like" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
          <path
            fill="#fff"
            d="M12.78 5.25h-1.5c-.4 0-.73-.28-.82-.66l-.35-1.58A1.25 1.25 0 009.28 2h-.03A1.25 1.25 0 007 3.25v2.5H5.22A1.22 1.22 0 004 6.97v.03l.66 4.08A1.22 1.22 0 005.85 12h6.03a1.5 1.5 0 001.47-1.23l.58-3.27a1.25 1.25 0 00-1.15-1.25z"
          />
        </svg>
      </span>
      <span className="li-reaction-bubble li-reaction-love" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
          <path
            fill="#fff"
            d="M11.63 3.5c-1.15 0-2.08.58-2.63 1.43-.55-.85-1.48-1.43-2.63-1.43-1.72 0-3.12 1.4-3.12 3.12 0 3.08 5.12 6.08 5.38 6.28.1.08.22.12.37.12s.27-.04.37-.12c.26-.2 5.38-3.2 5.38-6.28 0-1.72-1.4-3.12-3.12-3.12z"
          />
        </svg>
      </span>
    </div>
  );
}

function LikeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );
}

function RepostIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
    </svg>
  );
}

function PostBody({ text, expanded, onExpand }) {
  if (!text.trim()) {
    return (
      <div className="li-post-text li-post-text-empty">
        <p>Start writing and your post will appear here.</p>
      </div>
    );
  }

  const isFolded = text.length > DESKTOP_FOLD;

  if (!isFolded || expanded) {
    return (
      <div className="li-post-text">
        {renderFormattedText(text)}
      </div>
    );
  }

  const preview = getFoldPreview(text);

  return (
    <div className="li-post-text">
      {renderFormattedText(preview)}
      <button type="button" className="li-more-btn" onClick={onExpand}>…more</button>
    </div>
  );
}

export default function LinkedInPreview({ text }) {
  const [expanded, setExpanded] = useState(false);
  const analysis = text ? getFoldAnalysis(text) : null;

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  return (
    <div className="li-feed-wrap">
      <div className="li-post-card">
        {/* Header */}
        <div className="li-post-header">
          <div className="li-avatar" aria-hidden="true">
            <span>MB</span>
          </div>
          <div className="li-post-author">
            <div className="li-name-row">
              <span className="li-post-name">Muhammad Bin Aslam</span>
            </div>
            <p className="li-post-headline">Founder &amp; Operator · Building in public</p>
            <div className="li-post-meta">
              <span>1h</span>
              <span className="li-meta-dot">•</span>
              <GlobeIcon />
            </div>
          </div>
          <div className="li-post-menu">
            <button type="button" className="li-menu-btn" aria-label="More options">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
              </svg>
            </button>
            <button type="button" className="li-menu-btn" aria-label="Dismiss">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="li-post-body">
          <PostBody
            text={text}
            expanded={expanded}
            onExpand={() => setExpanded(true)}
          />
        </div>

        {/* Social counts */}
        <div className="li-social-counts">
          <div className="li-reactions-row">
            <ReactionStack />
            <span className="li-reactions-text">Noor-ul-Ain Javaid and 10 others</span>
          </div>
          <div className="li-counts-row">
            <span>40 comments</span>
            <span className="li-meta-dot">•</span>
            <span>3 reposts</span>
          </div>
        </div>

        <div className="li-divider" />

        {/* Action bar */}
        <div className="li-action-bar">
          <div className="li-action-viewer">
            <div className="li-viewer-avatar" aria-hidden="true">
              <span>Y</span>
            </div>
            <svg className="li-chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4H4z"/>
            </svg>
          </div>
          <button type="button" className="li-action-btn">
            <LikeIcon />
            <span>Like</span>
          </button>
          <button type="button" className="li-action-btn">
            <CommentIcon />
            <span>Comment</span>
          </button>
          <button type="button" className="li-action-btn">
            <RepostIcon />
            <span>Repost</span>
          </button>
          <button type="button" className="li-action-btn">
            <SendIcon />
            <span>Send</span>
          </button>
        </div>
      </div>

      {analysis && (
        <div className="li-analysis-wrap">
          <div className={`li-analysis-badge ${analysis.desktopFolded ? 'li-analysis-warn' : 'li-analysis-ok'}`}>
            {analysis.desktopFolded ? 'Desktop fold' : 'Desktop ok'}
          </div>
          <div className={`li-analysis-badge ${analysis.mobileFolded ? 'li-analysis-warn' : 'li-analysis-ok'}`}>
            {analysis.mobileFolded ? 'Mobile fold' : 'Mobile ok'}
          </div>
        </div>
      )}
    </div>
  );
}
