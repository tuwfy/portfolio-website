import React, { useState } from 'react';

const BootScreen = ({ onBoot }) => {
  const [booting, setBooting] = useState(false);

  const handleClick = () => {
    if (booting) return;
    setBooting(true);

    const audio = new window.Audio('/Mac Startup Sound.mp3');
    audio.play().catch(e => console.log('Audio blocked', e));
    
    // Critical: wait for the audio to ring out before transitioning
    setTimeout(() => {
      onBoot();
    }, 1800);
  };

  return (
    <div className="boot-screen" style={{ opacity: booting ? 0 : 1 }} onClick={handleClick}>
      <img src="/apple-logo.svg" alt="" className="boot-apple-logo" />
      <h2>Welcome to Mac OS.</h2>
      <p style={{ marginTop: '20px', color: '#aaaaaa' }}>{booting ? 'Booting...' : '(Click anywhere to Startup)'}</p>
    </div>
  );
};

export default BootScreen;
