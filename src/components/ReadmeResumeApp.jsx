import React, { useMemo } from 'react';

const PDF_PATH = '/TylerRiccardiResume.pdf';

const getPdfUrl = () =>
  typeof window !== 'undefined' ? new URL(PDF_PATH, window.location.href).href : PDF_PATH;

const ReadmeResumeApp = () => {
  const pdfUrl = useMemo(() => getPdfUrl(), []);

  return (
    <div className="mac-content-inner readme-resume word95">
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
        <a className="retro-mac-btn word95-icon-btn" href={PDF_PATH} download="TylerRiccardiResume.pdf">
          Save
        </a>
        <a className="retro-mac-btn word95-icon-btn" href={pdfUrl} target="_blank" rel="noopener noreferrer">
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
        <iframe className="word95-resume-frame" src={pdfUrl} title="Tyler Riccardi resume PDF" />
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

export default ReadmeResumeApp;
