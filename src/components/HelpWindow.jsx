import React from 'react';

const HelpWindow = () => {
  return (
    <div className="wiz">
      <h2 className="wiz-title">Wiz Tree</h2>
      <p className="wiz-intro">Welcome to the interactive portfolio.</p>

      <h3 className="wiz-section-title">Getting Started</h3>
      <ul className="wiz-list">
        <li><strong>Open icons</strong> — double-click any icon on the desktop.</li>
        <li><strong>Move windows</strong> — click and drag the striped title bar.</li>
        <li><strong>Close windows</strong> — click the small square in the top-left corner.</li>
        <li><strong>Collapse</strong> — click the square on the top-right (or double-click the title bar).</li>
        <li><strong>Rearrange</strong> — desktop icons can be dragged anywhere.</li>
      </ul>

      <h3 className="wiz-section-title">What's on the Desktop</h3>
      <ul className="wiz-list">
        <li><strong>readme.txt</strong> — downloads my résumé.</li>
        <li><strong>About Me</strong> — a few words on who I am.</li>
        <li><strong>Work</strong> — projects I've built.</li>
        <li><strong>CV</strong> — full résumé in window form.</li>
        <li><strong>spotify.exe</strong> — tunes for browsing.</li>
        <li><strong>Doom</strong> — a small portfolio mini-game.</li>
        <li><strong>Contact</strong> — how to reach me.</li>
        <li><strong>LinkedIn</strong> — opens my profile in a new tab.</li>
      </ul>

      <p className="wiz-footer">Enjoy your stay in the retro web.</p>
    </div>
  );
};

export default HelpWindow;
