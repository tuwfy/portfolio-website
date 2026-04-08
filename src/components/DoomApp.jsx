import React from 'react';

const DoomApp = () => {
  return (
    <div className="mac-content-inner doom-app">
      <div className="doom-header">
        <img src="/doom-icon.png" alt="Doom icon" className="doom-badge" />
        <p className="doom-note">Real Doom embed. Tap to focus then play inside the app window.</p>
      </div>
      <iframe
        className="doom-iframe"
        src="https://dos.zone/player/?bundleUrl=https://cdn.dos.zone/original/DOOM.jsdos"
        title="Doom game"
        allow="autoplay; fullscreen; gamepad"
      />
      <p className="doom-status">
        If your browser blocks embedded controls, open <a href="https://dos.zone/player/?bundleUrl=https://cdn.dos.zone/original/DOOM.jsdos" target="_blank" rel="noreferrer">Doom player</a>.
      </p>
    </div>
  );
};

export default DoomApp;
