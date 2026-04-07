import React, { useContext } from 'react';
import { AudioContext } from '../AudioProvider';

const SpotifyApp = () => {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    seek 
  } = useContext(AudioContext);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSliderChange = (e) => {
    seek(Number(e.target.value));
  };

  return (
    <div className="winamp-player">
      <div className="winamp-menu">
        <span><span className="ul">D</span>isc</span>
        <span><span className="ul">V</span>iew</span>
        <span><span className="ul">O</span>ptions</span>
        <span><span className="ul">H</span>elp</span>
      </div>
      
      <div className="winamp-main">
        <div className="winamp-visualizer"></div>
        
        <div className="winamp-controls-wrapper">
          <div className="winamp-top-row">
            <div className="winamp-toggles">
              <button className="winamp-btn" title="Shuffle">🔀</button>
              <button className="winamp-btn" title="Repeat">🔁</button>
            </div>
            <div className="winamp-format">MP3 | 48 khz</div>
          </div>
          
          <div className="winamp-playback-row">
            <button className="winamp-btn winamp-nav" onClick={prevTrack} title="Previous Track">|&lt;&lt;</button>
            <button className="winamp-btn winamp-nav" onClick={() => seek(Math.max(0, currentTime - 5))} title="Rewind">&lt;&lt;</button>
            <button className="winamp-btn winamp-play" onClick={togglePlay} title="Play/Pause">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="winamp-btn winamp-nav" onClick={() => seek(Math.min(duration, currentTime + 5))} title="Fast Forward">&gt;&gt;</button>
            <button className="winamp-btn winamp-nav" onClick={nextTrack} title="Next Track">&gt;&gt;|</button>
          </div>
          
          <div className="winamp-info-blocks">
            <div className="winamp-info-field">{currentTrack ? currentTrack.name : 'No track'}</div>
            <div className="winamp-info-field">Local Audio Player</div>
          </div>
        </div>
      </div>

      <div className="winamp-bottom-row">
        <span className="winamp-time">{formatTime(currentTime)}</span>
        <input 
          type="range" 
          className="winamp-slider" 
          min="0" 
          max={duration || 100} 
          value={currentTime || 0} 
          onChange={handleSliderChange} 
        />
        <span className="winamp-time">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default SpotifyApp;
