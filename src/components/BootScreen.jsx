import React, { useState, useRef } from 'react';

const BootScreen = ({ onBoot }) => {
  const [booting, setBooting] = useState(false);
  const startedRef = useRef(false);

  const handleBoot = () => {
    if (booting || startedRef.current) return;
    startedRef.current = true;
    setBooting(true);

    const audio = new window.Audio('/Mac Startup Sound.mp3');
    audio.play().catch(() => {});

    // Critical: wait for the audio to ring out before transitioning
    setTimeout(() => {
      onBoot();
    }, 1800);
  };

  return (
    <div
      className="boot-screen"
      style={{ opacity: booting ? 0 : 1 }}
      role="button"
      tabIndex={0}
      aria-label="Start system"
      onClick={handleBoot}
      onPointerDown={(e) => {
        if (e.pointerType === 'touch') {
          e.preventDefault();
          handleBoot();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleBoot();
        }
      }}
    >
      <img src="/apple-logo.svg" alt="" className="boot-apple-logo" />
      <h2>Welcome to Mac OS.</h2>
      <p style={{ marginTop: '20px', color: '#aaaaaa' }}>{booting ? 'Booting...' : '(Click anywhere to Startup)'}</p>
    </div>
  );
};

export default BootScreen;
