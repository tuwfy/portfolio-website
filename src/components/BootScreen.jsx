import React, { useState } from 'react';

const BootScreen = ({ onBoot }) => {
  const [booting, setBooting] = useState(false);

  const handleClick = () => {
    if (booting) return;
    setBooting(true);

    const audio = new window.Audio('/Mac Startup Sound.mp3');
    audio.play().catch(e => console.log('Audio blocked', e));

    setTimeout(() => {
      onBoot();
    }, 1800);
  };

  return (
    <div
      className="boot-screen"
      style={{ opacity: booting ? 0 : 1 }}
      onClick={handleClick}
    >
      <svg viewBox="0 0 100 100" width="64" height="64" style={{ marginBottom: 20 }}>
        <rect x="10" y="10" width="80" height="80" rx="6" fill="#333" stroke="#555" strokeWidth="2" />
        <defs>
          <linearGradient id="bootFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8ab8e8" />
            <stop offset="100%" stopColor="#4a82c8" />
          </linearGradient>
        </defs>
        <rect x="22" y="20" width="56" height="60" rx="4" fill="url(#bootFace)" />
        <rect x="28" y="26" width="44" height="48" rx="3" fill="#a0cce8" />
        <rect x="34" y="36" width="8" height="10" rx="1" fill="#1a2a40" />
        <rect x="56" y="36" width="8" height="10" rx="1" fill="#1a2a40" />
        <path d="M38 60 Q50 70 62 60" stroke="#1a2a40" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <h2>Welcome to Mac OS</h2>
      <p>{booting ? 'Starting up…' : 'Click anywhere to start up'}</p>
    </div>
  );
};

export default BootScreen;
