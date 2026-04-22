import React, { useState, useEffect, useRef } from 'react';
import FinderLogo from './FinderLogo';

const MenuDropdown = ({ label, items }) => {
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setActive(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [active]);

  return (
    <div
      ref={ref}
      className={`mac-menu-item menu-dropdown-container ${active ? 'active' : ''}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onClick={() => setActive((v) => !v)}
      style={{ cursor: 'pointer' }}
    >
      {label}
      <div className="menu-dropdown">
        {items.map((item, i) => {
          if (item.divider) return <div key={`d-${i}`} className="menu-dropdown-divider" />;
          const disabled = !!item.disabled;
          return (
            <div
              key={item.label + i}
              className={`menu-dropdown-item${disabled ? ' disabled' : ''}${item.checked ? ' checked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                setActive(false);
                if (typeof item.onClick === 'function') item.onClick();
              }}
            >
              <span className="menu-dropdown-check">{item.checked ? '✓' : ''}</span>
              <span className="menu-dropdown-label">{item.label}</span>
              {item.shortcut && <span className="menu-dropdown-shortcut">{item.shortcut}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MenuBar = ({ onOpenHelp, onOpenFinder, menuActions = {} }) => {
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

  const fileItems = menuActions.File || [];
  const editItems = menuActions.Edit || [];
  const viewItems = menuActions.View || [];
  const windowItems = menuActions.Window || [];

  return (
    <div className="mac-menubar">
      <div className="mac-menu-item" style={{ padding: '0 8px' }}>
        <img src="/apple-logo.svg" alt="Apple" style={{ height: '18px', marginRight: '8px' }} />
      </div>
      <MenuDropdown label="File" items={fileItems} />
      <MenuDropdown label="Edit" items={editItems} />
      <MenuDropdown label="View" items={viewItems} />
      <MenuDropdown label="Window" items={windowItems} />
      <div className="mac-menu-item" onClick={onOpenHelp} style={{ cursor: 'pointer' }}>Help</div>
      <div style={{ flexGrow: 1 }}></div>
      <div className="mac-menu-item" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{time}</div>
      <div
        className="mac-menu-item finder-launcher"
        onClick={onOpenFinder}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-label="Open Finder"
      >
        <FinderLogo className="finder-logo finder-logo--menubar" />
        <span className="finder-label">Finder</span>
      </div>
    </div>
  );
};
export default MenuBar;
