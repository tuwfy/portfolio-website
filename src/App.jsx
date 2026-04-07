import React, { useState, useEffect } from 'react';
import BootScreen from './components/BootScreen';
import MenuBar from './components/MenuBar';
import DesktopIcon from './components/DesktopIcon';
import Window from './components/Window';
import MusicBar from './components/MusicBar';
import AboutWindow from './components/AboutWindow';
import HelpWindow from './components/HelpWindow';
import SpotifyApp from './components/SpotifyApp';
import WorkApp from './components/WorkApp';
import CVApp from './components/CVApp';
import { AudioProvider } from './AudioProvider';

// Pre-load audio for zero-latency clicks on mobile and desktop
const clickDownAudio = typeof window !== 'undefined' ? new window.Audio('/click-down.mp3') : null;
const clickUpAudio = typeof window !== 'undefined' ? new window.Audio('/click-release.mp3') : null;

function App() {
  const [booted, setBooted] = useState(false);
  const [windows, setWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);

  // Play realistic mechanical clicks with zero latency
  useEffect(() => {
    const playDown = () => {
      if (!clickDownAudio) return;
      clickDownAudio.currentTime = 0;
      clickDownAudio.volume = 0.5;
      clickDownAudio.play().catch(() => {});
    };
    const playUp = () => {
      if (!clickUpAudio) return;
      clickUpAudio.currentTime = 0;
      clickUpAudio.volume = 0.5;
      clickUpAudio.play().catch(() => {});
    };

    if (booted) {
      window.addEventListener('mousedown', playDown);
      window.addEventListener('touchstart', playDown, { passive: true });
      window.addEventListener('mouseup', playUp);
      window.addEventListener('touchend', playUp, { passive: true });
    }
    return () => {
      window.removeEventListener('mousedown', playDown);
      window.removeEventListener('touchstart', playDown);
      window.removeEventListener('mouseup', playUp);
      window.removeEventListener('touchend', playUp);
    }
  }, [booted]);

  const openWindow = (id, title, content, isCentered = false) => {
    if (!windows.find(w => w.id === id)) {
      setWindows(prev => [...prev, { id, title, content, isCentered }]);
    }
    setActiveWindow(id);
  };

  const handleBoot = () => {
    setBooted(true);
    setTimeout(() => {
      openWindow(
        'about-system',
        'About This Computer',
        <AboutWindow />,
        true
      );
    }, 500);
  };

  const closeWindow = (id) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindow === id) {
      setActiveWindow(null);
    }
  };

  const focusWindow = (id) => {
    setActiveWindow(id);
  };

  const openLinkedIn = () => {
    window.open('https://www.linkedin.com/in/tylerriccardi/', '_blank');
  };

  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = '/TylerRiccardiResume.pdf';
    link.download = 'Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!booted) {
    return <BootScreen onBoot={handleBoot} />;
  }

  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 600;
  const isMobile = screenW <= 768;
  const rightX = isMobile ? screenW - 90 : screenW - 120;
  const leftX = isMobile ? 10 : 20;

  const getWindowPosition = (win, index) => {
    if (isMobile) {
      return { x: screenW * 0.025, y: 50 + index * 20 };
    }
    if (win.isCentered) {
      return { x: screenW / 2 - 250, y: (screenH / 2 - 350) };
    }
    return { x: 100 + index * 40, y: 100 + index * 40 };
  };

  return (
    <AudioProvider>
      <MenuBar onOpenHelp={() => openWindow('help', 'Wiz Tree', <HelpWindow />, true)} />
      <div className="desktop-area" onClick={() => setSelectedIcon(null)}>

        <DesktopIcon
          label="Macintosh HD"
          icon="💾"
          selected={selectedIcon === 'hd'}
          onClick={() => setSelectedIcon('hd')}
          onDoubleClick={() => openWindow('hd', 'Macintosh HD', <div className="mac-content-inner"><p>Hard Drive is healthy.</p></div>)}
          defaultPosition={{ x: rightX, y: 20 }}
        />

        <DesktopIcon
          label="About Me"
          icon="👤"
          selected={selectedIcon === 'about'}
          onClick={() => setSelectedIcon('about')}
          onDoubleClick={() => openWindow(
            'about',
            'About Me',
            <div className="mac-content-inner">
              <p>Welcome to my classic space.</p>
              <p>I am a creative. I stand to Normalize Niche.</p>
              <p>Doing passions because I want to.</p>
            </div>
          )}
          defaultPosition={{ x: rightX, y: 100 }}
        />
        <DesktopIcon
          label="Work"
          icon="📂"
          selected={selectedIcon === 'work'}
          onClick={() => setSelectedIcon('work')}
          onDoubleClick={() => openWindow(
            'work',
            'Work',
            <WorkApp />
          )}
          defaultPosition={{ x: rightX, y: 160 }}
        />
        <DesktopIcon
          label="CV"
          icon="📄"
          selected={selectedIcon === 'cv'}
          onClick={() => setSelectedIcon('cv')}
          onDoubleClick={() => openWindow(
            'cv',
            'CV',
            <CVApp />
          )}
          defaultPosition={{ x: rightX, y: 240 }}
        />
        <DesktopIcon
          label="LinkedIn"
          icon="🔗"
          selected={selectedIcon === 'linkedin'}
          onClick={() => setSelectedIcon('linkedin')}
          onDoubleClick={openLinkedIn}
          defaultPosition={{ x: rightX, y: 320 }}
        />
        <DesktopIcon
          label="Contact"
          icon="✉️"
          selected={selectedIcon === 'contact'}
          onClick={() => setSelectedIcon('contact')}
          onDoubleClick={() => openWindow('contact', 'Contact',
            <div className="mac-content-inner">
              <p>Email: tyler.riccardi7@gmail.com</p>
            </div>
          )}
          defaultPosition={{ x: rightX, y: 400 }}
        />

        <DesktopIcon
          label="readme.txt"
          icon="📝"
          selected={selectedIcon === 'readme'}
          onClick={() => setSelectedIcon('readme')}
          onDoubleClick={downloadResume}
          defaultPosition={{ x: leftX, y: 20 }}
        />

        <DesktopIcon
          label="spotify.exe"
          icon="🎵"
          selected={selectedIcon === 'spotify'}
          onClick={() => setSelectedIcon('spotify')}
          onDoubleClick={() => openWindow('spotify', 'Spotify Player', <SpotifyApp />)}
          defaultPosition={{ x: leftX, y: 100 }}
        />

        <div className="window-container">
          {windows.map((win, index) => (
            <Window
              key={win.id}
              id={win.id}
              title={win.title}
              zIndex={activeWindow === win.id ? 1000 : 100 + index}
              onClick={() => focusWindow(win.id)}
              onClose={() => closeWindow(win.id)}
              defaultPosition={getWindowPosition(win, index)}
            >
              {win.content}
            </Window>
          ))}
        </div>

        <MusicBar />
      </div>
    </AudioProvider>
  );
}

export default App;
