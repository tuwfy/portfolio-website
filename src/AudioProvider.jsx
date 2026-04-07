import React, { createContext, useState, useEffect, useRef } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const tracks = [
    { name: 'Avril 14th', src: '/Aphex Twin - Avril 14th.mp3', color: '#ffd1dc' },
    { name: 'Show Me', src: '/show me.mp3', color: '#fff9ae' },
    { name: 'Objects in the Mirror', src: '/Mac Miller - Objects in the Mirror (SPOTISAVER).mp3', color: '#a2cffe' }
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new window.Audio();
      audioRef.current.preload = 'auto';
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = tracks[currentTrackIndex].src;
    audio.volume = isMuted ? 0 : volume;

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
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const currentSrc = tracks[currentTrackIndex].src;
    if (!audio.src.endsWith(encodeURI(currentSrc))) {
      audio.pause();
      audio.src = currentSrc;
      audio.load();
      if (isPlaying) {
        audio.play().catch(e => console.log("Playback error:", e));
      }
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(e => console.log("Playback error:", e));
    } else {
      audio.pause();
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
      currentTrackIndex,
      isPlaying,
      isMuted,
      volume,
      currentTime,
      duration,
      togglePlay,
      toggleMute,
      setVolume,
      nextTrack,
      prevTrack,
      seek
    }}>
      {children}
    </AudioContext.Provider>
  );
};
