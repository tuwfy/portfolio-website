import React from 'react';

const PROFILE_URL = 'https://www.linkedin.com/in/tylerriccardi/';

const LinkedInApp = () => (
  <div className="mac-content-inner linkedin-macos">
    <div className="linkedin-macos-chrome">
      <div className="linkedin-macos-chrome-title">Macintosh Internet</div>
      <div className="linkedin-macos-chrome-sub">Profile preview (not affiliated with LinkedIn)</div>
    </div>

    <a
      className="linkedin-macos-card"
      href={PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="linkedin-macos-avatar" aria-hidden="true">
        TR
      </div>
      <div className="linkedin-macos-body">
        <div className="linkedin-macos-name">Tyler Riccardi</div>
        <div className="linkedin-macos-handle">/in/tylerriccardi</div>
        <p className="linkedin-macos-tagline">
          Finance at UCF, creative projects, and this retro desktop portfolio.
        </p>
        <div className="linkedin-macos-cta">Click anywhere here to open my real LinkedIn profile</div>
      </div>
    </a>

    <div className="linkedin-macos-toolbar">
      <a
        className="retro-mac-btn linkedin-macos-btn"
        href={PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open linkedin.com
      </a>
    </div>

    <p className="linkedin-macos-note">
      Opens <span className="linkedin-macos-url-mono">{PROFILE_URL}</span> in a new browser tab.
    </p>
  </div>
);

export default LinkedInApp;
