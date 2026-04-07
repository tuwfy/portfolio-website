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
    seek,
    volume,
    setVolume
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
        <span className="winamp-menu-item"><span className="ul">D</span>isc</span>
        <span className="winamp-menu-item"><span className="ul">V</span>iew</span>
        <span className="winamp-menu-item"><span className="ul">O</span>ptions</span>
        <span className="winamp-menu-item"><span className="ul">H</span>elp</span>
      </div>
      
      <div className="winamp-main">
        <div className="winamp-visualizer" style={{ backgroundColor: currentTrack?.color || '#9fae48' }}></div>
        
        <div className="winamp-controls-wrapper">
          <div className="winamp-top-row">
            <div className="winamp-toggles">
              <button className="winamp-btn" title="Shuffle">🔀</button>
              <button className="winamp-btn" title="Repeat">🔁</button>
            </div>
            <div className="winamp-volume-container">
              <span style={{ fontSize: '9px', marginRight: '4px' }}>VOL</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="winamp-volume-slider"
              />
            </div>
            <div className="winamp-format">MP3 | 48 khz</div>
          </div>
          
          <div className="winamp-playback-row">
            <button className="winamp-btn winamp-nav" onClick={prevTrack} title="Previous Track">|&lt;&lt;</button>
            <button className="winamp-btn winamp-play" onClick={togglePlay} title="Play/Pause">
              {isPlaying ? '⏸' : '▶'}
            </button>
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
