import React, { useState, useEffect, useRef } from 'react';

const MusicBar = ({ isMuted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log(e));
      setIsPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/niche.mp3" loop onEnded={() => setIsPlaying(false)} />
      <button onClick={togglePlay} className="control-strip-btn" title="Play/Pause">
        {isPlaying ? '⏸' : '▶'}
      </button>
      <div className="control-strip-module">
        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', overflow: 'hidden', maxWidth: '80px', textOverflow: 'ellipsis' }}>
          {isPlaying ? 'niche.mp3' : 'Ready'}
        </span>
      </div>
    </>
  );
};

export default MusicBar;
