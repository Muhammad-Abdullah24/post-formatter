'use client';

import { useState } from 'react';

const FAQ_DATA = [
  {
    question: 'Does LinkedIn support bold and italic text natively?',
    answer: "No. LinkedIn's post editor has no formatting toolbar. Bold, italic, and other styles work by substituting standard characters with Unicode equivalents that visually appear bold or italic. This formatter handles that conversion instantly."
  },
  {
    question: 'Will formatted text copy correctly into LinkedIn?',
    answer: "Yes. Copy the text from this tool and paste it directly into LinkedIn's post editor: desktop or mobile. The Unicode characters paste as-is and render exactly as you see them in the preview."
  },
  {
    question: 'What is the LinkedIn fold line?',
    answer: 'The fold line is the point at which LinkedIn truncates your post in the feed, replacing the rest with a "...more" link. On mobile it\'s roughly 210 characters. On desktop it\'s approximately 3 lines. Content below the fold line gets significantly less exposure because most readers don\'t tap to expand. This tool shows you exactly where that cutoff lands in real time.'
  },
  {
    question: 'What makes a strong LinkedIn hook?',
    answer: 'A strong hook gives the reader a specific reason to keep reading: a concrete claim, a recognizable tension, an unexpected result, or a clear payoff for continuing. Generic openers ("Excited to share," "I want to talk about," "Hot take:") rarely stop the scroll because they defer the actual point instead of leading with it.'
  },
  {
    question: 'How is this different from other LinkedIn formatters?',
    answer: "Most LinkedIn formatters are Unicode converters with a copy button. This tool adds a real-time fold-line preview, a hook strength analyzer, and an AI formatting layer that applies bold and emphasis based on editorial judgment, not just wherever you click. It's built for people who take LinkedIn seriously as a distribution channel."
  }
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0); // First one open by default

  return (
    <div className="faq-accordion">
      {FAQ_DATA.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div 
            key={idx} 
            className={`faq-item hover-glow ${isOpen ? 'is-open' : ''}`}
          >
            <button 
              className="faq-question-btn"
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
              aria-expanded={isOpen}
            >
              <h3 className="faq-question-text">{faq.question}</h3>
              <span className="faq-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </span>
            </button>
            <div 
              className="faq-answer-wrap"
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <p className="faq-answer-text">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
