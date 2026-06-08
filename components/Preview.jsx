'use client';

import { getFoldAnalysis } from '@/lib/foldline';

export default function Preview({ text }) {
  const analysis = text ? getFoldAnalysis(text) : null;

  const renderBody = () => {
    if (!text) {
      return (
        <div className="text-sm text-zinc-700 leading-relaxed space-y-2">
          <p>Start writing and your post will appear here..</p>
          <p>You can add images, links, <span className="text-blue-600 font-medium">#hashtags</span> and emojis 🤩 <span className="float-right text-blue-600 cursor-pointer">...more</span></p>
          <p className="text-zinc-400">This line will appear below the more...</p>
        </div>
      );
    }
    if (!analysis?.desktopFolded) {
      return <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">{text}</p>;
    }
    return (
      <div className="text-sm text-zinc-800 leading-relaxed">
        <span className="whitespace-pre-wrap">{analysis.desktopPreview}</span>
        <span className="text-blue-500 cursor-pointer font-medium"> ...more</span>
        <div className="mt-2 pt-2 border-t border-dashed border-blue-200">
          <span className="text-xs text-blue-400 font-medium block mb-1">fold line</span>
          <p className="whitespace-pre-wrap text-zinc-400">{analysis.desktopRemainder}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
        <span className="text-sm font-semibold text-zinc-700">Post Preview</span>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded hover:bg-zinc-100 transition-colors text-zinc-400">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </button>
          <button className="p-1.5 rounded hover:bg-zinc-100 transition-colors text-zinc-500">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-zinc-50 p-6 flex flex-col items-center gap-4 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">H</div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 leading-tight">Your Name</p>
                <p className="text-xs text-zinc-500 leading-tight">Your Headline • 1st</p>
                <p className="text-xs text-zinc-400">12h • 🌐</p>
              </div>
            </div>
            {renderBody()}
          </div>
          <div className="px-4 py-2 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-base">👍❤️</span>
                <span className="text-xs text-zinc-500 ml-1">57</span>
              </div>
              <span className="text-xs text-zinc-400">24 comments · 6 reposts</span>
            </div>
            <div className="flex items-center justify-around pt-2 border-t border-zinc-100">
              {['👍 Like', '💬 Comment', '🔁 Repost', '📤 Send'].map(a => (
                <button key={a} className="text-xs font-semibold text-zinc-500 hover:text-zinc-700 py-1 px-2 rounded transition-colors">{a}</button>
              ))}
            </div>
          </div>
        </div>

        {analysis && (
          <div className="w-full max-w-md flex gap-2">
            <div className={`flex-1 text-center text-xs font-medium py-1.5 rounded-lg ${analysis.desktopFolded ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              {analysis.desktopFolded ? 'Desktop fold' : 'Desktop OK'}
            </div>
            <div className={`flex-1 text-center text-xs font-medium py-1.5 rounded-lg ${analysis.mobileFolded ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              {analysis.mobileFolded ? 'Mobile fold' : 'Mobile OK'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}