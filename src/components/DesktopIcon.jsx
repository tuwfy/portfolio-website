import React, { useRef } from 'react';
import Draggable from 'react-draggable';

const DesktopIcon = ({ label, icon, selected, onClick, onDoubleClick, defaultPosition }) => {
  const nodeRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const touchStartPos = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
    // Allow synthetic double clicks on mobile if touch tracking fails
    if (isMobile && onDoubleClick && e.type === 'click') {
      onDoubleClick();
    }
  };

  const handleTouchStart = (e) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartPos.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dist = Math.sqrt(Math.pow(endX - touchStartPos.current.x, 2) + Math.pow(endY - touchStartPos.current.y, 2));
    
    // If finger moved less than 10 pixels, treat it as a tap opening
    if (dist < 10) {
      e.stopPropagation();
      onClick();
      if (onDoubleClick) onDoubleClick();
    }
    touchStartPos.current = null;
  };

  return (
    <Draggable nodeRef={nodeRef} bounds="parent" grid={[20, 20]} defaultPosition={defaultPosition}>
      <div 
        ref={nodeRef}
        className={`icon-container ${selected ? 'selected' : ''}`}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="icon-box">{icon}</div>
        <div className="icon-label">{label}</div>
      </div>
    </Draggable>
  );
};
export default DesktopIcon;
