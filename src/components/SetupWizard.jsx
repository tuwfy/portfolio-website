import React, { useState, useCallback } from 'react';
import AboutWindow from './AboutWindow';

// Mini SVG arrow cursor used inside the preview panels
const PreviewCursor = ({ className = '' }) => (
  <svg
    className={`wiz9-cursor ${className}`}
    viewBox="0 0 16 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1 1 L1 14 L4.5 11 L7 17 L9.5 16 L7 10 L12 10 Z"
      fill="#fff"
      stroke="#000"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const MiniWindow = ({ title, children, className = '', showResize = false }) => (
  <div className={`wiz9-mini-window ${className}`}>
    <div className="wiz9-mini-titlebar">
      <span className="wiz9-mini-close" />
      <span className="wiz9-mini-stripes" />
      <span className="wiz9-mini-title">{title}</span>
    </div>
    <div className="wiz9-mini-body">{children}</div>
    {showResize && <span className="wiz9-mini-resize" aria-hidden="true" />}
  </div>
);

// --- Preview animations -----------------------------------------------------

const PreviewWelcome = () => (
  <div className="wiz9-prev wiz9-prev--welcome">
    <div className="wiz9-prev-about">
      <AboutWindow />
    </div>
  </div>
);

const PreviewOpenIcon = () => (
  <div className="wiz9-prev wiz9-prev--open">
    <div className="wiz9-prev-desk">
      <div className="wiz9-prev-icon wiz9-prev-icon--anim">
        <div className="wiz9-prev-icon-glyph">📂</div>
        <div className="wiz9-prev-icon-label">Work</div>
      </div>
      <div className="wiz9-prev-window-anim">
        <MiniWindow title="Work" showResize>
          <div className="wiz9-mini-row" />
          <div className="wiz9-mini-row wiz9-mini-row--short" />
          <div className="wiz9-mini-row" />
          <div className="wiz9-mini-row wiz9-mini-row--short" />
        </MiniWindow>
      </div>
      <PreviewCursor className="wiz9-cursor--open" />
    </div>
  </div>
);

const PreviewMoveWindow = () => (
  <div className="wiz9-prev wiz9-prev--move">
    <div className="wiz9-prev-desk">
      <div className="wiz9-prev-drag-window">
        <MiniWindow title="About Me" showResize>
          <div className="wiz9-mini-row" />
          <div className="wiz9-mini-row wiz9-mini-row--short" />
          <div className="wiz9-mini-row" />
        </MiniWindow>
      </div>
      <PreviewCursor className="wiz9-cursor--drag" />
    </div>
  </div>
);

const PreviewApps = () => (
  <div className="wiz9-prev wiz9-prev--apps">
    <div className="wiz9-prev-desk">
      <div className="wiz9-prev-app-grid">
        <div className="wiz9-prev-app wiz9-prev-app--1">
          <span className="wiz9-prev-app-ico">📝</span>
          <span className="wiz9-prev-app-lab">readme.txt</span>
        </div>
        <div className="wiz9-prev-app wiz9-prev-app--2">
          <span className="wiz9-prev-app-ico">💾</span>
          <span className="wiz9-prev-app-lab">Mac&nbsp;HD</span>
        </div>
        <div className="wiz9-prev-app wiz9-prev-app--3">
          <span className="wiz9-prev-app-ico">🎵</span>
          <span className="wiz9-prev-app-lab">spotify.exe</span>
        </div>
        <div className="wiz9-prev-app wiz9-prev-app--4">
          <span className="wiz9-prev-app-ico">🔗</span>
          <span className="wiz9-prev-app-lab">LinkedIn</span>
        </div>
        <div className="wiz9-prev-app wiz9-prev-app--5">
          <span className="wiz9-prev-app-ico">👤</span>
          <span className="wiz9-prev-app-lab">About&nbsp;Me</span>
        </div>
        <div className="wiz9-prev-app wiz9-prev-app--6">
          <span className="wiz9-prev-app-ico">✉️</span>
          <span className="wiz9-prev-app-lab">Contact</span>
        </div>
        <div className="wiz9-prev-app wiz9-prev-app--7">
          <img
            src="/doom-icon.png"
            alt=""
            className="wiz9-prev-app-ico wiz9-prev-app-ico--img"
            aria-hidden="true"
          />
          <span className="wiz9-prev-app-lab">Doom</span>
        </div>
        <div className="wiz9-prev-app wiz9-prev-app--8">
          <span className="wiz9-prev-app-ico">📂</span>
          <span className="wiz9-prev-app-lab">Work</span>
        </div>
        <div className="wiz9-prev-app wiz9-prev-app--9">
          <span className="wiz9-prev-app-ico">📄</span>
          <span className="wiz9-prev-app-lab">CV</span>
        </div>
      </div>
    </div>
  </div>
);

const PreviewComplete = () => (
  <div className="wiz9-prev wiz9-prev--complete">
    <div className="wiz9-prev-desk">
      <div className="wiz9-prev-stack wiz9-prev-stack--back">
        <MiniWindow title="Work" showResize>
          <div className="wiz9-mini-row" />
          <div className="wiz9-mini-row wiz9-mini-row--short" />
        </MiniWindow>
      </div>
      <div className="wiz9-prev-stack wiz9-prev-stack--front">
        <MiniWindow title="About Me" showResize>
          <div className="wiz9-mini-row" />
          <div className="wiz9-mini-row wiz9-mini-row--short" />
          <div className="wiz9-mini-row" />
        </MiniWindow>
      </div>
      <div className="wiz9-prev-complete-badge">✓</div>
    </div>
  </div>
);

// --- Step content -----------------------------------------------------------

const STEPS = [
  {
    title: "Welcome to ty's Portfolio",
    preview: PreviewWelcome,
    body: (current) => (
      <>
        <p>
          This Setup Assistant will guide you through the site. Each step shows
          a quick preview of how it works.
        </p>
        <p className="wiz9-italic">To begin exploring, click Next.</p>
        <p className="wiz9-section-label">The next sections of the tour are:</p>
        <ul className="wiz9-tour-list">
          <li className={current === 1 ? 'wiz9-tour-item--active' : ''}>
            <span className="wiz9-tour-marker">▸</span>
            1) Open icons
          </li>
          <li className={current === 2 ? 'wiz9-tour-item--active' : ''}>
            2) Move &amp; resize windows
          </li>
          <li className={current === 3 ? 'wiz9-tour-item--active' : ''}>
            3) Try the apps
          </li>
          <li className={current === 4 ? 'wiz9-tour-item--active' : ''}>
            4) Setup Complete!
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Open icons',
    preview: PreviewOpenIcon,
    body: () => (
      <>
        <p>
          <strong>Double-click any icon</strong> on the desktop to open it.
          Try <em>Work</em> to browse projects, <em>readme.txt</em> for my
          résumé, or <em>About Me</em> for a quick intro.
        </p>
        <p>
          On a phone, a single tap opens icons.
        </p>
        <p className="wiz9-italic">Click Next to learn how to move windows around.</p>
      </>
    ),
  },
  {
    title: 'Move & resize windows',
    preview: PreviewMoveWindow,
    body: () => (
      <>
        <p>
          Grab the <strong>striped title bar</strong> to drag a window anywhere
          on the desktop. Drag the small triangle at the bottom-right corner to
          resize.
        </p>
        <p>
          Click the small square in the top-left to <strong>close</strong>, or
          the square in the top-right to <strong>collapse</strong>.
        </p>
      </>
    ),
  },
  {
    title: 'Try the apps',
    preview: PreviewApps,
    body: () => (
      <>
        <p>
          Everything on the desktop is interactive:
        </p>
        <ul className="wiz9-bullets">
          <li><strong>spotify.exe</strong> &mdash; play music while you browse.</li>
          <li><strong>Doom</strong> &mdash; a small portfolio mini-game.</li>
          <li><strong>Work / CV</strong> &mdash; projects and résumé.</li>
          <li><strong>LinkedIn / Contact</strong> &mdash; get in touch.</li>
        </ul>
        <p className="wiz9-italic">One more step — almost there!</p>
      </>
    ),
  },
  {
    title: 'Setup Complete!',
    preview: PreviewComplete,
    body: () => (
      <>
        <p>
          That's the tour. Have fun poking around — windows drag, icons stack,
          and the menu bar at the top actually works.
        </p>
        <p>
          Thanks for stopping by!
        </p>
        <p className="wiz9-italic">Click Finish to start exploring the desktop.</p>
      </>
    ),
  },
];

// --- Wizard shell -----------------------------------------------------------

const SetupWizard = ({ onFinish, onCancel }) => {
  const [step, setStep] = useState(0);
  const last = STEPS.length - 1;
  const isLast = step === last;
  const isFirst = step === 0;

  const next = useCallback(() => {
    if (isLast) {
      onFinish?.();
    } else {
      setStep((s) => Math.min(s + 1, last));
    }
  }, [isLast, onFinish, last]);

  const back = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const cancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const Preview = STEPS[step].preview;

  return (
    <div className="wiz9" key={step}>
      <div className="wiz9-body">
        <div className="wiz9-preview">
          <Preview />
        </div>
        <div className="wiz9-content">
          <h2 className="wiz9-step-title">{STEPS[step].title}</h2>
          <div className="wiz9-step-body">{STEPS[step].body(step + 1)}</div>
        </div>
      </div>
      <div className="wiz9-footer">
        <div className="wiz9-footer-rule" />
        <div className="wiz9-footer-buttons">
          <button
            className="wiz9-btn"
            onClick={back}
            disabled={isFirst}
            type="button"
          >
            &lt; Back
          </button>
          <button
            className={`wiz9-btn wiz9-btn--default ${isLast ? 'wiz9-btn--finish' : ''}`}
            onClick={next}
            type="button"
          >
            {isLast ? 'Finish' : 'Next >'}
          </button>
          <button className="wiz9-btn" onClick={cancel} type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
