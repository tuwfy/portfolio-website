import React from 'react';

const FinderLogo = ({ className = '', size }) => (
  <img
    src="/finder-logo-classic.png"
    alt=""
    aria-hidden="true"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  />
);

export default FinderLogo;
