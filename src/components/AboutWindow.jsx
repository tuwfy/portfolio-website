import React from 'react';

const FinderLogoClassic = () => (
  <svg viewBox="0 0 90 90" width="88" height="88" aria-hidden="true">
    <defs>
      <linearGradient id="finderBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#9ec6ff" />
        <stop offset="45%" stopColor="#6d95e2" />
        <stop offset="100%" stopColor="#426cbf" />
      </linearGradient>
      <linearGradient id="finderLight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f6f8ff" />
        <stop offset="100%" stopColor="#d4dcf4" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="86" height="86" fill="#f2f2f2" stroke="#8c8c8c" strokeWidth="2" />
    <rect x="8" y="8" width="37" height="74" fill="url(#finderBlue)" />
    <rect x="45" y="8" width="37" height="74" fill="url(#finderLight)" />
    <path d="M45 8v74" stroke="#000" strokeWidth="1.6" />
    <path d="M27 17c-5.5 4.8-9.1 12.6-8.8 20.1 4.7.3 9.4-1.4 12.6-4.6 3.1-3.1 5.4-8.7 4.7-13.2-3 .1-6 .9-8.5 2.7z" fill="#000" />
    <rect x="25.5" y="28" width="4.8" height="8.5" fill="#000" />
    <circle cx="57" cy="34" r="2.1" fill="#000" />
    <path d="M50 56c3.8 6.1 8.6 9.9 14.1 10.2" stroke="#000" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <path d="M30 42c0 14.4 5.1 24.3 14 30.5" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M53 40c2.6 0 5 1.2 6.5 3.2" stroke="#000" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </svg>
);

const AboutWindow = () => {
  return (
    <div className="about92">
      <div className="about92-panel">
        <div className="about92-headline">
          <div className="about92-logo">
            <FinderLogoClassic />
          </div>
          <div className="about92-title">Mac OS 9.2</div>
        </div>
        <table className="about92-stats">
          <tbody>
            <tr><td className="about92-key">Version:</td><td>Mac OS 9.2.2</td></tr>
            <tr><td className="about92-key">Built-in Memory:</td><td>672 MB</td></tr>
            <tr><td className="about92-key">Virtual Memory:</td><td>Off</td></tr>
            <tr><td className="about92-key">Largest Unused Block:</td><td>612.6 MB</td></tr>
          </tbody>
        </table>
        <div className="about92-copy">™ &amp; © Apple Computer, Inc. 1983-2001</div>
      </div>

      <div className="about92-bottom">
        <div className="about92-memory-row">
          <div className="about92-icon about92-icon-ie">e</div>
          <div className="about92-name">Internet Explorer</div>
          <div className="about92-size">13.9 MB</div>
          <div className="about92-track">
            <div className="about92-fill" style={{ width: '24%' }} />
          </div>
        </div>
        <div className="about92-memory-row">
          <div className="about92-icon about92-icon-os">OS</div>
          <div className="about92-name">Mac OS</div>
          <div className="about92-size">43 MB</div>
          <div className="about92-track">
            <div className="about92-fill" style={{ width: '72%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutWindow;
