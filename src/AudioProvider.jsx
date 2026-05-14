import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AudioContext } from './AudioContext';

const TRACKS = [
  { name: 'Avril 14th', src: '/Aphex Twin - Avril 14th.mp3', color: '#ffd1dc' },
  { name: 'Show Me', src: '/show me.mp3', color: '#fff9ae' },
  { name: 'Objects in the Mirror', src: '/Mac Miller - Objects in the Mirror (SPOTISAVER).mp3', color: '#a2cffe' }
];

export const AudioProvider = ({ children }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  const nextTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  }, []);

  const prevTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const audio = new window.Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
      setIsPlaying(true);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const currentSrc = TRACKS[currentTrackIndex].src;
    if (!audio.src.endsWith(encodeURI(currentSrc))) {
      audio.pause();
      audio.src = currentSrc;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    }
    return undefined;
  }, [currentTrackIndex, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.muted = isMuted;
    audio.volume = isMuted ? 0 : volume;
    return undefined;
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    return undefined;
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying((p) => !p);
  const toggleMute = () => setIsMuted((m) => !m);

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <AudioContext.Provider
      value={{
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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
