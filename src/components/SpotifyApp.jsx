import React, { useState, useRef, useEffect, useContext } from 'react';
import { MuteContext } from '../MuteContext';

const SpotifyApp = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const audioRef = useRef(null);
  const isMuted = useContext(MuteContext);

  useEffect(() => {
    // Attempt to auto play, or just load the audio
    if (!audioRef.current) {
      audioRef.current = new Audio('/Joey Bada$$ - Show Me (SPOTISAVER).mp3');
      audioRef.current.addEventListener('timeupdate', () => {
        setTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback failed", err);
      });
    }
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="spotify-player">
      <div className="spotify-screen">
        <div style={{ fontSize: '1.2rem', marginBottom: '5px', wordWrap: 'break-word', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {isPlaying ? '▶ ' : '⏸ '} SHOW ME - JOEY BADA$$
        </div>
        <div style={{ fontSize: '1rem', color: '#0a0' }}>
          [{formatTime(time)}]
        </div>
      </div>
      <div className="spotify-controls">
        <button className="spotify-btn" onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button className="spotify-btn" onClick={stopAudio}>Stop</button>
        <button className="spotify-btn" onClick={() => { if(audioRef.current){ audioRef.current.currentTime = 0; } }}>Rewind</button>
      </div>
    </div>
  );
};

export default SpotifyApp;
