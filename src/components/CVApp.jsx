import React from 'react';

const RESUME_URL = '/TylerRiccardiResume.pdf';

const CVApp = () => {
  return (
    <div className="mac-content-inner cv-content word95">
      <div className="word95-menu-row" aria-label="Word menu bar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Insert</span>
        <span>Format</span>
        <span>Tools</span>
        <span>Table</span>
        <span className="word95-menu-active">Window</span>
        <span>Help</span>
      </div>

      <div className="word95-toolbar" aria-label="Resume actions">
        <a className="retro-mac-btn word95-icon-btn" href={RESUME_URL} download>
          Save
        </a>
        <a className="retro-mac-btn word95-icon-btn" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
          Open
        </a>
        <span className="word95-toolbar-separator"></span>
        <span className="word95-select">Normal</span>
        <span className="word95-select word95-font-select">Times New Roman</span>
        <span className="word95-select">12</span>
      </div>

      <div className="word95-ruler" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index}>{index}</span>
        ))}
      </div>

      <div className="word95-document-shell">
        <iframe className="word95-resume-frame" src={`${RESUME_URL}#view=FitH`} title="Tyler Riccardi resume PDF" />
        <div className="word95-pdf-fallback">
          PDF preview unavailable.
          <a href={RESUME_URL} download>
            Download the resume
          </a>
        </div>
      </div>

      <div className="word95-statusbar">
        <span>Page 1</span>
        <span>Sec 1</span>
        <span>Words: Resume</span>
        <span>Zoom: 100%</span>
      </div>
    </div>
  );
};

export default CVApp;
