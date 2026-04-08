import React from 'react';

const FinderLogo = ({ className = '', size = 64 }) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    aria-hidden="true"
    className={className}
  >
    <rect x="0" y="0" width="64" height="64" fill="#d9d9d9" />
    <rect x="10" y="10" width="44" height="44" fill="#6f8fd9" />
    <path d="M32 10v44" stroke="#111" strokeWidth="1.5" />
    <rect x="18.2" y="19.5" width="2.3" height="7" fill="#111" />
    <rect x="39.2" y="22.5" width="2.3" height="2.3" fill="#111" />
    <path
      d="M16.8 42.2c4.9 4.8 15.7 5.4 20.4-.6"
      stroke="#111"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M27.5 13.5c-4.6 3.4-6.8 8.5-6.6 13.2 3.6.2 7-1.3 9.2-4 2.2-2.7 3.4-6.4 3-10-2 .2-3.9.6-5.6 1.6z"
      fill="#111"
    />
    <path
      d="M40 15.5c-1.6 2.8-2.5 7.5-1.7 12.4m-.1.1c1.7 10.5 1.2 20.2-1.7 29.6"
      stroke="#111"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export default FinderLogo;
