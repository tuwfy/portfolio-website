import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

const Window = ({ id, title, children, onClose, defaultPosition, zIndex, onClick }) => {
  const nodeRef = useRef(null);
  const [size, setSize] = useState({ width: 300, height: 200 });
  const isResizing = useRef(false);

  // Initialize size from props or defaults
  useEffect(() => {
    // If we want specific initial sizes for certain windows, we can pass them in
    // For now, let's keep defaults
  }, []);

  const handleResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    
    const startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const onMove = (moveEvent) => {
      if (!isResizing.current) return;
      
      const currentX = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const newWidth = Math.max(200, startWidth + (currentX - startX));
      const newHeight = Math.max(150, startHeight + (currentY - startY));
      
      setSize({ width: newWidth, height: newHeight });
    };

    const onEnd = () => {
      isResizing.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  return (
    <Draggable 
      nodeRef={nodeRef}
      defaultPosition={defaultPosition} 
      onMouseDown={onClick} 
      handle=".mac-titlebar"
      cancel=".mac-close-btn, .mac-content, .mac-resize-handle"
    >
      <div 
        ref={nodeRef}
        className="mac-window" 
        style={{ 
          zIndex, 
          width: size.width, 
          height: size.height,
          resize: 'none' // Disable native resize
        }}
      >
        <div className="mac-titlebar">
          <button 
            className="mac-close-btn" 
            onClick={(e) => { 
              e.stopPropagation(); 
              // Optimize: Close immediately
              onClose(); 
            }}
          ></button>
          
          <div className="mac-titlebar-stripes"></div>
          <div className="mac-titlebar-text">{title}</div>
          
          <button className="mac-zoom-btn"></button>
        </div>
        
        <div className="mac-content">
          {children}
        </div>

        <div 
          className="mac-resize-handle" 
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        ></div>
      </div>
    </Draggable>
  );
};

export default Window;
