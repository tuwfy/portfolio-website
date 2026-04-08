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
    <div style={{
      width: '100%', height: '100%', backgroundColor: '#000', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', opacity: booting ? 0 : 1, transition: 'opacity 1.5s ease-in-out'
    }} onClick={handleClick}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}></div>
      <h2>Welcome to Mac OS.</h2>
      <p style={{ marginTop: '20px', color: '#aaaaaa' }}>{booting ? 'Booting...' : '(Click anywhere to Startup)'}</p>
    </div>
  );
};

export default BootScreen;
