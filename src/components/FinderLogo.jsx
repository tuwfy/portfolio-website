import React from 'react';

const FinderLogo = ({ className = '', size = 64 }) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    aria-hidden="true"
    className={className}
  >
    <rect x="0" y="0" width="64" height="64" fill="#d7d7d7" />
    <rect x="11" y="11" width="42" height="42" fill="#6d8fd7" />
    <path d="M32 11v42" stroke="#0f0f0f" strokeWidth="1.6" />

    {/* left eye */}
    <rect x="18.5" y="18.8" width="2.6" height="7.2" fill="#0f0f0f" />

    {/* right eye */}
    <circle cx="39.8" cy="22.8" r="1.5" fill="#0f0f0f" />

    {/* left face smile */}
    <path
      d="M16.8 40.8C20.8 44.4 27.4 44.7 31.3 40.8"
      stroke="#0f0f0f"
      strokeWidth="1.9"
      fill="none"
      strokeLinecap="round"
    />

    {/* top left finder curl */}
    <path
      d="M28.4 13.8c-4.9 3.3-7.1 8.2-6.7 12.6 3.6-.1 6.7-1.6 8.8-4.1 2.1-2.4 3.1-5.8 2.7-9.4-1.8.2-3.4.6-4.8.9z"
      fill="#0f0f0f"
    />

    {/* right profile outline */}
    <path
      d="M39.4 15.4C37.2 18.6 36 24 36.8 29.7c1 6.3.8 12.3-.3 18.1-0.4 2.2-0.9 3.9-1.5 5.2"
      stroke="#0f0f0f"
      strokeWidth="2.1"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default FinderLogo;
