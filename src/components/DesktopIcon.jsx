import React, { useRef } from 'react';
import Draggable from 'react-draggable';

const DesktopIcon = ({ label, icon, selected, onClick, onDoubleClick, defaultPosition }) => {
  const nodeRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const dragStartPos = useRef(null);

  const handleDragStart = (e, data) => {
    dragStartPos.current = { x: data.x, y: data.y };
  };

  const handleDragStop = (e, data) => {
    if (!dragStartPos.current) return;
    const dx = data.x - dragStartPos.current.x;
    const dy = data.y - dragStartPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If it barely moved, treat it as a tap
    if (dist < 5) {
      onClick();
      // On mobile we simulate double click instantly upon tap
      if (isMobile && onDoubleClick) {
        onDoubleClick();
      }
    }
    dragStartPos.current = null;
  };

  return (
    <Draggable 
      nodeRef={nodeRef} 
      bounds="parent" 
      grid={[20, 20]} 
      defaultPosition={defaultPosition}
      onStart={handleDragStart}
      onStop={handleDragStop}
    >
      <div 
        ref={nodeRef}
        className={`icon-container ${selected ? 'selected' : ''}`}
        onDoubleClick={onDoubleClick}
      >
        <div className="icon-box">{icon}</div>
        <div className="icon-label">{label}</div>
      </div>
    </Draggable>
  );
};
export default DesktopIcon;
