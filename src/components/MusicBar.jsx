import React, { useState, useEffect, useRef } from 'react';

const SheetMusic = ({ isPlaying }) => {
  return (
    <div style={{
      overflow: 'hidden',
      height: '40px',
      width: '250px',
      background: '#fff',
      border: '1px solid var(--mac-black)',
      position: 'relative',
      marginLeft: '15px',
      fontFamily: 'sans-serif'
    }}>
      {/* 5 pink staff lines */}
      <div style={{position:'absolute', top:'8px', width:'100%', borderBottom:'1px solid #ffb6c1'}} />
      <div style={{position:'absolute', top:'14px', width:'100%', borderBottom:'1px solid #ffb6c1'}} />
      <div style={{position:'absolute', top:'20px', width:'100%', borderBottom:'1px solid #ffb6c1'}} />
      <div style={{position:'absolute', top:'26px', width:'100%', borderBottom:'1px solid #ffb6c1'}} />
      <div style={{position:'absolute', top:'32px', width:'100%', borderBottom:'1px solid #ffb6c1'}} />

      {/* Playhead */}
      <div style={{ position:'absolute', top:0, bottom:0, left:'40px', width:'2px', background:'rgba(0,0,0,0.5)', zIndex:5 }} />

      {/* Scrolling container */}
      <div style={{
        position: 'absolute',
        top: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '40px',
        animation: 'scroll-staff 6s linear infinite',
        animationPlayState: isPlaying ? 'running' : 'paused'
      }}>
        {/* Repeating sequence of standard notes */}
        {[...Array(15)].map((_, i) => (
          <div key={i} style={{ display: 'flex', fontSize: '24px', color: 'black', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <span style={{ margin: '0 6px', transform: 'translateY(1px)' }}>♪</span>
            <span style={{ margin: '0 6px', transform: 'translateY(-5px)' }}>♩</span>
            <span style={{ margin: '0 6px', transform: 'translateY(8px)' }}>♫</span>
            <span style={{ margin: '0 6px', transform: 'translateY(-2px)' }}>♩</span>
            <span style={{ margin: '0 6px', transform: 'translateY(6px)' }}>♬</span>
            <span style={{ margin: '0 6px', transform: 'translateY(-4px)' }}>♪</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll-staff {
          from { transform: translateX(0); }
          to { transform: translateX(-400px); }
        }
      `}</style>
    </div>
  );
};

const MusicBar = ({ isMuted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/niche.mp3');
      audioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log(e));
      setIsPlaying(true);
    }
  };

  return (
    <div className="music-bar" onClick={(e) => e.stopPropagation()}>
      <div className="music-icon">🎼</div>
      <div className="now-playing">niche.mp3</div>
      <div className="controls">
        <button onClick={togglePlay} className="retro-btn" style={{ padding: '0px 8px', fontSize: '1rem', minWidth: '32px' }}>
          {isPlaying ? '||' : '►'}
        </button>
      </div>
      <SheetMusic isPlaying={isPlaying} />
    </div>
  );
};

export default MusicBar;
