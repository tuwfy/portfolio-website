import React from 'react';

const FinderFaceSVG = () => (
  <svg viewBox="0 0 100 100" width="88" height="88" style={{ display: 'block' }}>
    <rect x="2" y="2" width="96" height="96" rx="4" fill="#e8e8e8" stroke="#888" strokeWidth="2" />
    <rect x="6" y="6" width="88" height="88" rx="2" fill="#d0d0d0" />
    <rect x="10" y="10" width="80" height="80" rx="1" fill="#f0f0f0" stroke="#aaa" strokeWidth="1" />
    {/* Face background - pixelated blue gradient */}
    <rect x="22" y="18" width="56" height="64" rx="6" fill="url(#faceGrad)" />
    <defs>
      <linearGradient id="faceGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8ab8e8" />
        <stop offset="50%" stopColor="#4a82c8" />
        <stop offset="100%" stopColor="#2a5aa0" />
      </linearGradient>
    </defs>
    {/* Face shape - lighter inner */}
    <rect x="28" y="24" width="44" height="52" rx="4" fill="url(#innerFace)" />
    <defs>
      <linearGradient id="innerFace" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a8d0f0" />
        <stop offset="100%" stopColor="#5888c0" />
      </linearGradient>
    </defs>
    {/* Pixel grid lines for retro look */}
    <line x1="50" y1="18" x2="50" y2="82" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    <line x1="22" y1="50" x2="78" y2="50" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    {/* Eyes */}
    <rect x="34" y="38" width="8" height="10" rx="1" fill="#1a2a40" />
    <rect x="56" y="38" width="8" height="10" rx="1" fill="#1a2a40" />
    {/* Nose */}
    <rect x="47" y="50" width="6" height="8" rx="1" fill="rgba(20,50,90,0.5)" />
    {/* Smile */}
    <path d="M38 62 Q50 72 62 62" stroke="#1a2a40" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const AboutWindow = () => {
  return (
    <div className="about9">
      {/* Top section - white bg with logo + info */}
      <div className="about9-top">
        <div className="about9-top-inner">
          <div className="about9-logo">
            <FinderFaceSVG />
          </div>
          <div className="about9-info">
            <div className="about9-title">Mac OS 9.2</div>
            <table className="about9-stats">
              <tbody>
                <tr><td className="about9-stat-label">Version:</td><td>Mac OS 9.2.2</td></tr>
                <tr><td className="about9-stat-label">Built-in Memory:</td><td>672 MB</td></tr>
                <tr><td className="about9-stat-label">Virtual Memory:</td><td>Off</td></tr>
                <tr><td className="about9-stat-label">Largest Unused Block:</td><td>612.6 MB</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="about9-copyright">
          ™ &amp; © Apple Computer, Inc. 1983–2001
        </div>
      </div>

      {/* Bottom section - gray bg with memory bars */}
      <div className="about9-bottom">
        <div className="about9-mem-row">
          <div className="about9-mem-icon about9-mem-icon-ie">e</div>
          <div className="about9-mem-name">Internet Explorer</div>
          <div className="about9-mem-size">13.9 MB</div>
          <div className="about9-mem-bar-track">
            <div className="about9-mem-bar-fill" style={{ width: '24%' }} />
          </div>
        </div>
        <div className="about9-mem-row">
          <div className="about9-mem-icon about9-mem-icon-os">
            <span style={{ fontSize: '9px', fontWeight: 800 }}>OS</span>
          </div>
          <div className="about9-mem-name">Mac OS</div>
          <div className="about9-mem-size">43 MB</div>
          <div className="about9-mem-bar-track">
            <div className="about9-mem-bar-fill" style={{ width: '72%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutWindow;
