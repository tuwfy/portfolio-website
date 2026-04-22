import React from 'react';

const FinderApp = ({ apps = [], viewMode = 'icons' }) => {
  const diskSizeKB = apps.length * 42 + 128;

  const handleActivate = (app) => {
    if (app && app.action) app.action();
  };

  const renderIcon = (app) => {
    const isImage =
      typeof app.icon === 'string' &&
      (app.icon.startsWith('/') || app.icon.startsWith('./') || app.icon.startsWith('../'));
    if (isImage) {
      return <img src={app.icon} alt="" aria-hidden="true" className="finder-app-icon-img" />;
    }
    return <span className="finder-app-icon-glyph">{app.icon}</span>;
  };

  return (
    <div className="finder-app">
      <div className="finder-app-header">
        <div className="finder-app-header-row">
          <span className="finder-app-count">{apps.length} items</span>
          <span className="finder-app-disk">{diskSizeKB.toLocaleString()} K in disk</span>
          <span className="finder-app-available">2.3 GB available</span>
        </div>
        <div className="finder-app-path">Macintosh HD : Desktop : Applications</div>
      </div>

      {viewMode === 'list' ? (
        <div className="finder-app-list-wrap">
          <div className="finder-app-list-head">
            <span className="finder-col finder-col-name">Name</span>
            <span className="finder-col finder-col-kind">Kind</span>
            <span className="finder-col finder-col-size">Size</span>
          </div>
          <ul className="finder-app-list">
            {apps.map((app) => (
              <li
                key={app.id}
                className="finder-app-list-row"
                onDoubleClick={() => handleActivate(app)}
                onClick={(e) => {
                  if (e.detail >= 2) return;
                  e.currentTarget.classList.toggle('selected');
                }}
              >
                <span className="finder-col finder-col-name">
                  <span className="finder-app-list-icon">{renderIcon(app)}</span>
                  <span className="finder-app-list-label">{app.shortName}</span>
                </span>
                <span className="finder-col finder-col-kind">{app.kind || 'application'}</span>
                <span className="finder-col finder-col-size">{app.size || '38 K'}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="finder-app-grid">
          {apps.map((app) => (
            <li
              key={app.id}
              className="finder-app-tile"
              onDoubleClick={() => handleActivate(app)}
              onClick={(e) => {
                e.currentTarget.classList.toggle('selected');
              }}
              title={app.label}
            >
              <div className="finder-app-tile-icon">{renderIcon(app)}</div>
              <div className="finder-app-tile-label">{app.shortName}</div>
            </li>
          ))}
        </ul>
      )}

      <div className="finder-app-footer">
        <span>Double-click any item to launch it.</span>
      </div>
    </div>
  );
};

export default FinderApp;
