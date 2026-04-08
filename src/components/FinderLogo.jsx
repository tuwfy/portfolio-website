import React from 'react';

const FinderLogo = ({ className = '', size = 64 }) => (
  <img
    src="/finder-logo-classic.png"
    alt=""
    aria-hidden="true"
    className={className}
    style={{ width: size, height: size }}
  />
);

export default FinderLogo;
