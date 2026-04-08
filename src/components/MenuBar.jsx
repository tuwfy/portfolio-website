import React, { useState, useEffect } from 'react';
import FinderLogo from './FinderLogo';

const MenuDropdown = ({ label, items }) => {
  const [active, setActive] = useState(false);
  return (
    <div 
      className={`mac-menu-item menu-dropdown-container ${active ? 'active' : ''}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onClick={() => setActive(!active)}
      style={{ cursor: 'pointer' }}
    >
      {label}
      <div className="menu-dropdown">
        {items.map((item, i) => (
          <div key={i} className="menu-dropdown-item" onClick={(e) => { e.stopPropagation(); setActive(false); }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

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
      <MenuDropdown label="File" items={['New Folder', 'Open', 'Print', 'Close Window']} />
      <MenuDropdown label="Edit" items={['Undo', 'Cut', 'Copy', 'Paste', 'Clear']} />
      <MenuDropdown label="View" items={['as Icons', 'as List', 'Clean Up']} />
      <MenuDropdown label="Window" items={['Minimize Window', 'Bring All to Front']} />
      <div className="mac-menu-item" onClick={onOpenHelp} style={{ cursor: 'pointer' }}>Help</div>
      <div style={{ flexGrow: 1 }}></div>
      <div className="mac-menu-item" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{time}</div>
      <div className="mac-menu-item">
        <FinderLogo className="finder-logo finder-logo--menubar" />
        <span className="finder-label">Finder</span>
      </div>
    </div>
  );
};
export default MenuBar;
