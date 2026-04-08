import React from 'react';
import FinderLogo from './FinderLogo';

const AboutWindow = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <div className="about-logo-container">
          <FinderLogo className="finder-logo finder-logo--about" />
        </div>
        <div className="about-info">
          <h1>Mac OS 9.2</h1>
          <p>Version: Mac OS 9.2.2</p>
          <p>Built-in Memory: 672 MB</p>
          <p>Virtual Memory: Off</p>
          <p>Largest Unused Block: 612.6 MB</p>
        </div>
      </div>
      <div className="about-details" style={{ padding: '15px' }}>
        <div className="memory-row">
          <div className="memory-icon" style={{ backgroundColor: '#fff', border: '1px solid #000', fontSize: '0.8rem', fontWeight: 'bold' }}>IE</div>
          <div className="memory-label" style={{ fontSize: '1rem' }}>Internet Explorer</div>
          <div className="memory-bar-container">
            <div className="memory-bar-fill" style={{ width: '30%', backgroundColor: '#4A90E2' }}></div>
          </div>
          <div className="memory-text">13.9 MB</div>
        </div>
        <div className="memory-row">
          <div className="memory-icon" style={{ backgroundColor: '#fff', border: '1px solid #000', fontSize: '0.8rem', fontWeight: 'bold' }}>OS</div>
          <div className="memory-label" style={{ fontSize: '1rem' }}>Mac OS</div>
          <div className="memory-bar-container">
            <div className="memory-bar-fill" style={{ width: '85%', backgroundColor: '#4A90E2' }}></div>
          </div>
          <div className="memory-text">43 MB</div>
        </div>
      </div>
      <div className="about-footer">
        ™ & © Apple Computer, Inc. 1983-2001
      </div>
    </div>
  );
};

export default AboutWindow;
