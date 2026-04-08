import React from 'react';
import FinderLogo from './FinderLogo';

const AboutWindow = () => {
  return (
    <div className="about9">
      <div className="about9-top">
        <div className="about9-top-inner">
          <div className="about9-logo">
            <FinderLogo className="finder-logo finder-logo--about" />
          </div>
          <div className="about9-info">
            <div className="about9-title">Mac OS 9.2</div>
            <table className="about9-stats">
              <tbody>
                <tr><td className="about9-stat-label">Version:</td><td>Mac OS 9.2.2</td></tr>
                <tr><td className="about9-stat-label">Built-in Memory:</td><td>672 MB</td></tr>
                <tr><td className="about9-stat-label">Virtual Memory:</td><td>Off</td></tr>
                <tr><td className="about9-stat-label">Largest Unused Block:</td><td>612.6 MB</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="about9-copyright">
          ™ &amp; © Apple Computer, Inc. 1983-2001
        </div>
      </div>

      <div className="about9-bottom">
        <div className="about9-mem-row">
          <div className="about9-mem-icon about9-mem-icon-ie">e</div>
          <div className="about9-mem-name">Internet Explorer</div>
          <div className="about9-mem-size">13.9 MB</div>
          <div className="about9-mem-bar-track">
            <div className="about9-mem-bar-fill" style={{ width: '24%' }} />
          </div>
        </div>
        <div className="about9-mem-row">
          <div className="about9-mem-icon about9-mem-icon-os">
            <span style={{ fontSize: '9px', fontWeight: 800 }}>OS</span>
          </div>
          <div className="about9-mem-name">Mac OS</div>
          <div className="about9-mem-size">43 MB</div>
          <div className="about9-mem-bar-track">
            <div className="about9-mem-bar-fill" style={{ width: '72%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutWindow;
