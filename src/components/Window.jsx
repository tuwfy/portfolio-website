import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

const Window = ({ id, title, children, onClose, defaultPosition, zIndex, onClick, isCentered = false }) => {
  const nodeRef = useRef(null);
  const isResizing = useRef(false);
  const contentRef = useRef(null);

  // Calculate content size on mount and when content changes
  useEffect(() => {
    const measureContent = () => {
      if (contentRef.current) {
        const content = contentRef.current;
        const scrollWidth = content.scrollWidth;
        const scrollHeight = content.scrollHeight;

        const chromeHeight = 35;
        const chromeWidth = 35;

        const desiredWidth = Math.max(450, scrollWidth + chromeWidth);
        const desiredHeight = Math.max(400, scrollHeight + chromeHeight);

        return { width: desiredWidth, height: desiredHeight };
      }
      return { width: 450, height: 400 };
    };

    const timeoutId = setTimeout(() => {
      setSize(measureContent());
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [children]);

  const [size, setSize] = useState(() => measureContent());

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
    window.addEventListener('touchmove', onMove);
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
          resize: 'none'
        }}
      >
        <div className="mac-titlebar">
          <button
            className="mac-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          ></button>

          <div className="mac-titlebar-stripes"></div>
          <div className="mac-titlebar-text">{title}</div>

          <button className="mac-zoom-btn"></button>
        </div>

        <div className="mac-content" ref={contentRef}>
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
