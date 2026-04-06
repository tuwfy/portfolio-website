import React, { useState, useEffect } from 'react';

const MenuBar = ({ onOpenHelp }) => {
  const [time, setTime] = useState('11:11 AM');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
      });
      setTime(timeString);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mac-menubar">
      <div className="mac-menu-item" style={{ padding: '0 8px' }}>
        <img src="/apple-logo.svg" alt="Apple" style={{ height: '18px', marginRight: '8px' }} />
      </div>
      <div className="mac-menu-item">File</div>
      <div className="mac-menu-item">Edit</div>
      <div className="mac-menu-item">View</div>
      <div className="mac-menu-item">Window</div>
      <div className="mac-menu-item">Special</div>
      <div className="mac-menu-item" onClick={onOpenHelp} style={{ cursor: 'pointer' }}>Help</div>
      <div style={{ flexGrow: 1 }}></div>
      <div className="mac-menu-item" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{time}</div>
      <div className="mac-menu-item">
        <span style={{ marginRight: '6px' }}>Finder</span>
        <div style={{ width: '16px', height: '16px', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'black' }}></div>
        </div>
      </div>
    </div>
  );
};
export default MenuBar;
