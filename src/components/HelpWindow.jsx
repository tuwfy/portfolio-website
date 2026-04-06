import React from 'react';

const HelpWindow = () => {
  return (
    <div style={{ padding: '20px', fontSize: '1.4rem' }}>
      <h2 style={{ borderBottom: '2px solid black', paddingBottom: '10px', marginTop: 0 }}>Wiz Tree</h2>
      <p style={{ marginTop: '20px' }}>Welcome to the interactive portfolio!</p>
      
      <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>How to Navigate:</h3>
      <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
        <li><strong>Icons:</strong> Double-click the icons on the desktop (like "About Me" or "Work") to open folders and applications.</li>
        <li><strong>Moving Things:</strong> You can click and hold the title bar of any window to drag it around the screen. You can also drag the desktop icons!</li>
        <li><strong>Closing:</strong> Single-click the red "X" button in the top left corner of any window to close it.</li>
        <li><strong>Music:</strong> Open "spotify.exe" to play some tunes while you browse.</li>
        <li><strong>Resume:</strong> Double-click the "readme.txt" file on the desktop to download a copy of my resume.</li>
      </ul>
      <p style={{ marginTop: '30px', fontWeight: 'bold' }}>Enjoy your stay in the retro web!</p>
    </div>
  );
};

export default HelpWindow;
