import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

const CHROME_WIDTH = 8;
const CHROME_HEIGHT = 32;
const VIEWPORT_PADDING = 20;
const MIN_WIDTH = 240;
const MIN_HEIGHT = 150;
const MAX_WIDTH_RATIO = 0.88;

const Window = ({ title, children, onClose, zIndex, onClick }) => {
  const nodeRef = useRef(null);
  const isResizing = useRef(false);
  const contentRef = useRef(null);
  const hasUserMovedRef = useRef(false);
  const [size, setSize] = useState({ width: 420, height: 280 });
  const [position, setPosition] = useState({ x: 100, y: 80 });

  const getViewportLimits = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 28; // account for menu bar
    return {
      maxWidth: Math.max(MIN_WIDTH, Math.min(viewportWidth - VIEWPORT_PADDING * 2, viewportWidth * MAX_WIDTH_RATIO)),
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
    const contentRoot = contentRef.current.firstElementChild || contentRef.current;
    const { maxWidth, maxHeight } = getViewportLimits();
    const measuredWidth = Math.max(contentRoot.scrollWidth, contentRoot.clientWidth) + CHROME_WIDTH;
    const measuredHeight = Math.max(contentRoot.scrollHeight, contentRoot.clientHeight) + CHROME_HEIGHT;
    const fittedSize = {
      width: Math.min(maxWidth, Math.max(MIN_WIDTH, measuredWidth)),
      height: Math.min(maxHeight, Math.max(MIN_HEIGHT, measuredHeight))
    };
    setSize(fittedSize);
    if (!hasUserMovedRef.current) {
      setPosition(getCenteredPosition(fittedSize));
    }
  };

  useEffect(() => {
    hasUserMovedRef.current = false;
    const raf1 = requestAnimationFrame(measureAndFit);
    const raf2 = requestAnimationFrame(measureAndFit);
    const delayed = setTimeout(measureAndFit, 120);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(delayed);
    };
  }, [children]);

  useEffect(() => {
    const handleViewportResize = () => {
      measureAndFit();
    };

    let observer = null;
    if (contentRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        measureAndFit();
      });
      observer.observe(contentRef.current);
      if (contentRef.current.firstElementChild) {
        observer.observe(contentRef.current.firstElementChild);
      }
    }

    window.addEventListener('resize', handleViewportResize);
    return () => {
      window.removeEventListener('resize', handleViewportResize);
      if (observer) observer.disconnect();
    };
  }, [children]);

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
      bounds="parent"
      onStart={() => {
        hasUserMovedRef.current = true;
      }}
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
