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
              <button className="retro-mac-btn" title="Shuffle" style={{fontSize: '11px'}}>SHF</button>
              <button className="retro-mac-btn" title="Repeat" style={{fontSize: '11px'}}>RPT</button>
            </div>
            <div className="winamp-volume-container">
              <div className="winamp-volume-icon">🔉</div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="winamp-volume-slider"
              />
              <div className="winamp-volume-icon">🔊</div>
            </div>
          </div>
          
          <div className="winamp-playback-row">
            <button className="retro-mac-btn" onClick={prevTrack} title="Previous Track">|&lt;</button>
            <button className="retro-mac-btn" style={{ flexGrow: 1 }} onClick={togglePlay} title="Play/Pause">
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <button className="retro-mac-btn" onClick={nextTrack} title="Next Track">&gt;|</button>
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
