import React, { useContext } from 'react';
import { AudioContext } from '../AudioProvider';

const MusicBar = () => {
  const { currentTrack, isPlaying, togglePlay, isMuted, toggleMute } = useContext(AudioContext);

  return (
    <div className="control-strip" onClick={(e) => e.stopPropagation()}>
      <div className="control-strip-handle"></div>
      <button 
        onClick={toggleMute}
        className="control-strip-btn"
        title="Toggle Mute"
      >
        {isMuted ? '🔇' : '🔉'}
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
        className="control-strip-btn" 
        title="Play/Pause"
        style={{ width: '40px', fontSize: '10px', fontWeight: 'bold' }}
      >
        {isPlaying ? 'PAUSE' : 'PLAY'}
      </button>
      <div className="control-strip-module">
        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', overflow: 'hidden', maxWidth: '80px', textOverflow: 'ellipsis' }}>
          {currentTrack ? currentTrack.name : 'Ready'}
        </span>
      </div>
    </div>
  );
};

export default MusicBar;
