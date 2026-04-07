import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

const CHROME_WIDTH = 8;
const CHROME_HEIGHT = 32;
const VIEWPORT_PADDING = 20;
const MIN_WIDTH = 240;
const MIN_HEIGHT = 150;

const Window = ({ title, children, onClose, zIndex, onClick }) => {
  const nodeRef = useRef(null);
  const isResizing = useRef(false);
  const contentRef = useRef(null);
  const [size, setSize] = useState({ width: 420, height: 280 });
  const [position, setPosition] = useState({ x: 100, y: 80 });

  const getViewportLimits = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 28; // account for menu bar
    return {
      maxWidth: Math.max(MIN_WIDTH, viewportWidth - VIEWPORT_PADDING * 2),
      maxHeight: Math.max(MIN_HEIGHT, viewportHeight - VIEWPORT_PADDING * 2)
    };
  };

  const getCenteredPosition = (targetSize) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 28;
    return {
      x: Math.max(VIEWPORT_PADDING, Math.floor((viewportWidth - targetSize.width) / 2)),
      y: Math.max(VIEWPORT_PADDING, Math.floor((viewportHeight - targetSize.height) / 2))
    };
  };

  const measureAndFit = () => {
    if (!contentRef.current) return;
    const { maxWidth, maxHeight } = getViewportLimits();
    const measuredWidth = contentRef.current.scrollWidth + CHROME_WIDTH;
    const measuredHeight = contentRef.current.scrollHeight + CHROME_HEIGHT;
    const fittedSize = {
      width: Math.min(maxWidth, Math.max(MIN_WIDTH, measuredWidth)),
      height: Math.min(maxHeight, Math.max(MIN_HEIGHT, measuredHeight))
    };
    setSize(fittedSize);
    setPosition(getCenteredPosition(fittedSize));
  };

  useEffect(() => {
    const raf = requestAnimationFrame(measureAndFit);
    return () => cancelAnimationFrame(raf);
  }, [children]);

  useEffect(() => {
    const handleViewportResize = () => {
      measureAndFit();
    };
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
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

      const { maxWidth, maxHeight } = getViewportLimits();
      const newWidth = Math.min(maxWidth, Math.max(MIN_WIDTH, startWidth + (currentX - startX)));
      const newHeight = Math.min(maxHeight, Math.max(MIN_HEIGHT, startHeight + (currentY - startY)));

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
      position={position}
      onDrag={(_, data) => {
        setPosition({ x: data.x, y: data.y });
      }}
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
