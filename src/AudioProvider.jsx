import React, { createContext, useState, useEffect, useRef } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const tracks = [
    { name: 'Avril 14th', src: '/Aphex Twin - Avril 14th.mp3' },
    { name: 'Mac Miller', src: '/Mac Miller - Objects in the Mirror (SPOTISAVER).mp3' },
    { name: 'niche.mp3', src: '/niche.mp3' }
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(typeof window !== 'undefined' ? new window.Audio() : null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = tracks[currentTrackIndex].src;
    
    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => nextTrack();

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Change src only if it differs, so we don't restart current track unnecessarily
    if (!audio.src.endsWith(encodeURI(tracks[currentTrackIndex].src))) {
      audio.src = tracks[currentTrackIndex].src;
      audio.load();
      if (isPlaying) {
        audio.play().catch(e => console.log(e));
      }
    }
  }, [currentTrackIndex, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const currentTrack = tracks[currentTrackIndex];

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      isMuted,
      currentTime,
      duration,
      togglePlay,
      toggleMute,
      nextTrack,
      prevTrack,
      seek
    }}>
      {children}
    </AudioContext.Provider>
  );
};
