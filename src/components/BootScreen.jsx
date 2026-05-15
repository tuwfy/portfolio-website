import React, { useState, useRef, useEffect } from 'react';

const FinderFace = () => (
  <svg
    viewBox="0 0 64 64"
    className="finder-face"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Frame */}
    <rect
      x="4.5"
      y="4.5"
      width="55"
      height="55"
      rx="4"
      ry="4"
      fill="#ffffff"
      stroke="#000"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Diagonal split */}
    <line
      x1="58"
      y1="14"
      x2="14"
      y2="58"
      stroke="#000"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Upper-right face: smile + eye */}
    <path
      d="M 33 31 Q 42 38 51 30"
      stroke="#000"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <rect className="finder-eye" x="40" y="17" width="5" height="7" />
    {/* Lower-left face: smile + eye */}
    <path
      d="M 13 33 Q 22 27 31 33"
      stroke="#000"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <rect className="finder-eye" x="19" y="40" width="5" height="7" />
  </svg>
);

const PHASE = {
  IDLE: 'idle',
  LOADING: 'loading',
  FACE: 'face',
  EXIT: 'exit',
};

// Sequence (after user click):
//   loading splash:  0    -> 1700ms
//   finder face:     1700 -> 4400ms  (zoom-in then ~2 eye blinks)
//   exit fade:       4400 -> 5000ms
const LOADING_MS = 1700;
const FACE_MS = 2700;
const EXIT_MS = 600;

const BootScreen = ({ onBoot }) => {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const startedRef = useRef(false);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleBoot = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const audio = new window.Audio('/Mac Startup Sound.mp3');
    audio.play().catch(() => {});

    setPhase(PHASE.LOADING);
    timersRef.current.push(
      setTimeout(() => setPhase(PHASE.FACE), LOADING_MS),
      setTimeout(() => setPhase(PHASE.EXIT), LOADING_MS + FACE_MS),
      setTimeout(() => onBoot(), LOADING_MS + FACE_MS + EXIT_MS)
    );
  };

  const idleHandlers =
    phase === PHASE.IDLE
      ? {
          onClick: handleBoot,
          onPointerDown: (e) => {
            if (e.pointerType === 'touch') {
              e.preventDefault();
              handleBoot();
            }
          },
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBoot();
            }
          },
        }
      : {};

  return (
    <div
      className={`boot-screen boot-screen--${phase}`}
      role={phase === PHASE.IDLE ? 'button' : undefined}
      tabIndex={phase === PHASE.IDLE ? 0 : -1}
      aria-label={phase === PHASE.IDLE ? 'Start system' : undefined}
      {...idleHandlers}
    >
      {phase === PHASE.IDLE && (
        <div className="boot-idle">
          <img src="/apple-logo.svg" alt="" className="boot-apple-logo" />
          <h2>Welcome to Mac OS.</h2>
        </div>
      )}

      {phase === PHASE.LOADING && (
        <div className="boot-loading">
          <div className="boot-loading-splash">
            <div className="boot-loading-title">Welcome to Mac&nbsp;OS</div>
            <div className="boot-loading-bar" aria-hidden="true">
              <div className="boot-loading-bar-fill" />
            </div>
            <div className="boot-loading-status">Starting up…</div>
          </div>
        </div>
      )}

      {(phase === PHASE.FACE || phase === PHASE.EXIT) && (
        <div className="boot-face-stage">
          <div className="boot-face-wrap">
            <FinderFace />
          </div>
        </div>
      )}
    </div>
  );
};

export default BootScreen;
