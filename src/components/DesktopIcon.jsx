import React, { useRef } from 'react';
import Draggable from 'react-draggable';

const DesktopIcon = ({ label, icon, selected, onClick, onDoubleClick, defaultPosition }) => {
  const nodeRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
    if (isMobile && onDoubleClick) {
      onDoubleClick();
    }
  };

  return (
    <Draggable nodeRef={nodeRef} bounds="parent" grid={[20, 20]} defaultPosition={defaultPosition}>
      <div 
        ref={nodeRef}
        className={`icon-container ${selected ? 'selected' : ''}`}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
      >
        <div className="icon-box">{icon}</div>
        <div className="icon-label">{label}</div>
      </div>
    </Draggable>
  );
};
export default DesktopIcon;
