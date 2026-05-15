import React, { useEffect, useState } from 'react';
import { CVSections } from './CVApp';

const PDF_PATH = '/TylerRiccardiResume.pdf';

const ReadmeCvApp = () => {
  const [frameSrc, setFrameSrc] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const blobUrlRef = { current: null };

    const load = async () => {
      try {
        const response = await fetch(PDF_PATH, { credentials: 'same-origin' });
        if (!response.ok) throw new Error('bad status');
        const blob = await response.blob();
        if (cancelled) return;
        blobUrlRef.current = URL.createObjectURL(blob);
        setFrameSrc(blobUrlRef.current);
      } catch {
        if (!cancelled) setLoadError(true);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  return (
    <div className="mac-content-inner readme-cv readme-resume word95">
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
        <a className="retro-mac-btn word95-icon-btn" href={PDF_PATH} target="_blank" rel="noopener noreferrer">
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

      <div className="word95-document-shell word95-document-shell--pdf">
        {loadError && (
          <div className="word95-pdf-fallback">
            <p>Could not load the PDF in this window.</p>
            <p>
              <a href={PDF_PATH} download="TylerRiccardiResume.pdf">
                Download
              </a>
              {' · '}
              <a href={PDF_PATH} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </p>
          </div>
        )}
        {!loadError && frameSrc && (
          <iframe className="word95-resume-frame" src={frameSrc} title="Tyler Riccardi resume PDF" />
        )}
        {!loadError && !frameSrc && <div className="word95-pdf-loading">Loading document…</div>}
      </div>

      <div className="readme-cv-body">
        <div className="readme-cv-heading">CV (plain text)</div>
        <div className="cv-content readme-cv-text">
          <CVSections />
        </div>
      </div>

      <div className="word95-statusbar">
        <span>Page 1</span>
        <span>Sec 1</span>
        <span>Words: Resume + CV</span>
        <span>Zoom: 100%</span>
      </div>
    </div>
  );
};

export default ReadmeCvApp;
