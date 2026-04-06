import React, { useRef } from 'react';
import Draggable from 'react-draggable';

const Window = ({ id, title, children, onClose, defaultPosition, zIndex, onClick }) => {
  const nodeRef = useRef(null);

  return (
    <Draggable 
      nodeRef={nodeRef}
      defaultPosition={defaultPosition} 
      onMouseDown={onClick} 
      handle=".mac-titlebar"
      cancel=".mac-close-btn, .mac-content"
    >
      <div 
        ref={nodeRef}
        className="mac-window" 
        style={{ zIndex }}
      >
        <div className="mac-titlebar">
          <button 
            className="mac-close-btn" 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          ></button>
          
          <div className="mac-titlebar-stripes"></div>
          <div className="mac-titlebar-text">{title}</div>
          
          <button className="mac-zoom-btn"></button>
        </div>
        
        <div className="mac-content">
          {children}
        </div>
      </div>
    </Draggable>
  );
};

export default Window;
