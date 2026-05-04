import React from 'react';

const HelpWindow = () => {
  return (
    <div className="wiz">
      <div className="wiz-banner">
        <div className="wiz-banner-icon" aria-hidden="true">
          <span className="wiz-banner-hat">
            <span className="wiz-banner-hat-brim" />
            <span className="wiz-banner-hat-cone" />
            <span className="wiz-banner-hat-star wiz-banner-hat-star--1">✦</span>
            <span className="wiz-banner-hat-star wiz-banner-hat-star--2">✧</span>
            <span className="wiz-banner-hat-star wiz-banner-hat-star--3">✦</span>
          </span>
        </div>
        <div className="wiz-banner-text">
          <div className="wiz-banner-title">Wiz Tree</div>
          <div className="wiz-banner-sub">Welcome — here&rsquo;s how to get around.</div>
        </div>
      </div>

      <div className="wiz-body">
        <div className="wiz-note">
          <span className="wiz-note-badge" aria-hidden="true">i</span>
          <span>
            This is an interactive Mac&nbsp;OS&nbsp;9 desktop. Everything is clickable —
            poke around, drag windows, open icons.
          </span>
        </div>

        <div className="wiz-section">
          <div className="wiz-section-title">Getting Started</div>
          <ul className="wiz-list">
            <li>
              <span className="wiz-bullet">▸</span>
              <span><strong>Open icons</strong> &mdash; double&#8209;click any icon on the desktop.</span>
            </li>
            <li>
              <span className="wiz-bullet">▸</span>
              <span><strong>Move windows</strong> &mdash; click and drag the striped title bar.</span>
            </li>
            <li>
              <span className="wiz-bullet">▸</span>
              <span><strong>Close windows</strong> &mdash; click the small square in the top-left corner.</span>
            </li>
            <li>
              <span className="wiz-bullet">▸</span>
              <span><strong>Collapse</strong> &mdash; click the square on the top-right (or double&#8209;click the title bar).</span>
            </li>
            <li>
              <span className="wiz-bullet">▸</span>
              <span><strong>Rearrange</strong> &mdash; desktop icons can be dragged anywhere.</span>
            </li>
          </ul>
        </div>

        <div className="wiz-section">
          <div className="wiz-section-title">What&rsquo;s on the Desktop</div>
          <ul className="wiz-list wiz-list--apps">
            <li><span className="wiz-app-ico">📝</span><span><strong>readme.txt</strong> &mdash; downloads my résumé.</span></li>
            <li><span className="wiz-app-ico">👤</span><span><strong>About Me</strong> &mdash; a few words on who I am.</span></li>
            <li><span className="wiz-app-ico">📂</span><span><strong>Work</strong> &mdash; projects I&rsquo;ve built.</span></li>
            <li><span className="wiz-app-ico">📄</span><span><strong>CV</strong> &mdash; full résumé in window form.</span></li>
            <li><span className="wiz-app-ico">🎵</span><span><strong>spotify.exe</strong> &mdash; tunes for browsing.</span></li>
            <li><span className="wiz-app-ico">🎮</span><span><strong>Doom</strong> &mdash; a small portfolio mini-game.</span></li>
            <li><span className="wiz-app-ico">✉️</span><span><strong>Contact</strong> &mdash; how to reach me.</span></li>
            <li><span className="wiz-app-ico">🔗</span><span><strong>LinkedIn</strong> &mdash; opens my profile in a new tab.</span></li>
          </ul>
        </div>

        <div className="wiz-tip">
          <strong>Tip:</strong> the menu bar up top works too &mdash; <em>File</em>, <em>Edit</em>, <em>View</em>, and <em>Window</em> all do something.
        </div>

        <div className="wiz-footer">Enjoy your stay in the retro web.</div>
      </div>
    </div>
  );
};

export default HelpWindow;
