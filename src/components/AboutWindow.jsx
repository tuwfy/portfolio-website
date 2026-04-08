import React from 'react';

/** Mac OS 9.2–style “About This Computer” content (reference: classic Platinum dialog). */
const AboutWindow = () => {
  return (
    <div className="about-container about-macos9">
      <div className="about-hero">
        <div className="about-hero-logo" aria-hidden="true">
          <svg viewBox="0 0 88 88" className="about-macos-logo-svg">
            <defs>
              <linearGradient id="faceL" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7eb8ff" />
                <stop offset="100%" stopColor="#3d7dcc" />
              </linearGradient>
              <linearGradient id="faceR" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9ec8ff" />
                <stop offset="100%" stopColor="#4a85d4" />
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="80" height="80" fill="#f5f5f5" stroke="#000" strokeWidth="2" />
            <path
              d="M12 44c0-14 10-26 22-26 8 0 14 4 18 10-4 10-12 16-22 16-10 0-18-6-18-16z"
              fill="url(#faceL)"
              stroke="#1a4a8a"
              strokeWidth="1.2"
            />
            <path
              d="M48 44c0-14 10-26 22-26 8 0 14 4 18 10-4 10-12 16-22 16-10 0-18-6-18-16z"
              fill="url(#faceR)"
              stroke="#1a4a8a"
              strokeWidth="1.2"
            />
            <circle cx="30" cy="38" r="3.5" fill="#0a1a30" />
            <circle cx="58" cy="38" r="3.5" fill="#0a1a30" />
            <path d="M36 52 Q44 58 52 52" stroke="#0a1a30" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="about-hero-copy">
          <h1 className="about-product-title">Mac&nbsp;OS&nbsp;9.2</h1>
          <p className="about-version-line">Version: Mac OS 9.2.2</p>
          <p className="about-stat-line">Built-in Memory: 672 MB</p>
          <p className="about-stat-line">Virtual Memory: Off</p>
          <p className="about-stat-line">Largest Unused Block: 612.6 MB</p>
        </div>
      </div>

      <div className="about-memory-panel">
        <div className="memory-row about-memory-row">
          <div className="memory-icon about-memory-icon" aria-hidden="true">
            IE
          </div>
          <div className="memory-label about-memory-label">Internet Explorer</div>
          <div className="memory-bar-wrap">
            <div className="memory-bar-track">
              <div className="memory-bar-fill about-memory-fill" style={{ width: '30%' }} />
            </div>
          </div>
          <div className="memory-text about-memory-mb">13.9 MB</div>
        </div>
        <div className="memory-row about-memory-row">
          <div className="memory-icon about-memory-icon" aria-hidden="true">
            OS
          </div>
          <div className="memory-label about-memory-label">Mac OS</div>
          <div className="memory-bar-wrap">
            <div className="memory-bar-track">
              <div className="memory-bar-fill about-memory-fill" style={{ width: '85%' }} />
            </div>
          </div>
          <div className="memory-text about-memory-mb">43 MB</div>
        </div>
      </div>

      <div className="about-footer about-footer-macos9">
        ™ &amp; © Apple Computer, Inc. 1983–2001
      </div>
    </div>
  );
};

export default AboutWindow;
