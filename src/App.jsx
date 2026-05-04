import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import DoomApp from './components/DoomApp';
import FinderApp from './components/FinderApp';
import { AudioProvider } from './AudioProvider';

const clickDownAudio = typeof window !== 'undefined' ? new window.Audio('/click-down.mp3') : null;
const clickUpAudio = typeof window !== 'undefined' ? new window.Audio('/click-release.mp3') : null;

function App() {
  const [booted, setBooted] = useState(false);
  const [windows, setWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [finderViewMode, setFinderViewMode] = useState('icons');
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [customFolders, setCustomFolders] = useState([]);
  const folderCounterRef = useRef(0);

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
    };
  }, [booted]);

  const openWindow = useCallback((id, title, content, isCentered = false) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) {
        return prev.map((w) =>
          w.id === id ? { ...w, title, content, minimized: false } : w
        );
      }
      return [...prev, { id, title, content, isCentered, minimized: false }];
    });
    setActiveWindow(id);
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindow((curr) => (curr === id ? null : curr));
    if (id === 'about-system') {
      setTimeout(() => {
        openWindow('help', 'Wiz Tree', <HelpWindow />, true);
      }, 180);
    }
  }, [openWindow]);

  const focusWindow = useCallback((id) => {
    setActiveWindow(id);
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: false } : w)));
  }, []);

  const toggleMinimize = useCallback((id) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  }, []);

  const handleBoot = () => {
    setBooted(true);
    setTimeout(() => {
      openWindow('about-system', 'About This Computer', <AboutWindow />, true);
    }, 500);
  };

  const openLinkedIn = useCallback(() => {
    const url = 'https://www.linkedin.com/in/tylerriccardi/';
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  }, []);

  const downloadResume = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/TylerRiccardiResume.pdf';
    link.download = 'Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const openAboutMe = useCallback(() => {
    openWindow(
      'about',
      'About Me',
      <div className="mac-content-inner">
        <p>Welcome to my classic space.</p>
        <p>I am a creative. I stand to Normalize Niche.</p>
        <p>Doing passions because I want to.</p>
        <hr style={{ border: 0, borderTop: '1px solid #8b8b8b', margin: '14px 0 10px' }} />
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Turning my penny stocks into vintage Carhartt jackets.</li>
          <li>Treating my closet of vintage tees like a diversified investment portfolio.</li>
          <li>Living life on my own terms (and wearing 90s denim).</li>
        </ul>
      </div>
    );
  }, [openWindow]);

  const openContact = useCallback(() => {
    openWindow(
      'contact',
      'Contact',
      <div className="mac-content-inner">
        <p>
          Email:{' '}
          <a href="mailto:tylrrcc@gmail.com" rel="noopener noreferrer">
            tylrrcc@gmail.com
          </a>
        </p>
      </div>
    );
  }, [openWindow]);

  const openHD = useCallback(() => {
    openWindow(
      'hd',
      'Macintosh HD',
      <div className="mac-content-inner mac-hd-note">
        <p className="mac-hd-greeting">This is Mac&nbsp;OS&nbsp;9.</p>
        <p>I like old stuff — hope you like it too.</p>
        <p className="mac-hd-sig">— ty</p>
      </div>
    );
  }, [openWindow]);

  const desktopApps = useMemo(
    () => [
      {
        id: 'readme',
        label: 'readme.txt',
        shortName: 'Resume',
        kind: 'document',
        size: '84 K',
        icon: '📝',
        action: downloadResume,
      },
      {
        id: 'spotify',
        label: 'spotify.exe',
        shortName: 'Music',
        kind: 'application',
        size: '112 K',
        icon: '🎵',
        action: () => openWindow('spotify', 'Spotify Player', <SpotifyApp />),
      },
      {
        id: 'about',
        label: 'About Me',
        shortName: 'About',
        kind: 'document',
        size: '14 K',
        icon: '👤',
        action: openAboutMe,
      },
      {
        id: 'doom',
        label: 'Doom',
        shortName: 'Doom',
        kind: 'application',
        size: '2.1 MB',
        icon: '/doom-icon.png',
        action: () => openWindow('doom', 'Doom', <DoomApp />),
      },
      {
        id: 'hd',
        label: 'Macintosh HD',
        shortName: 'HD',
        kind: 'disk',
        size: '—',
        icon: '💾',
        action: openHD,
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        shortName: 'Link',
        kind: 'alias',
        size: '2 K',
        icon: '🔗',
        action: openLinkedIn,
      },
      {
        id: 'contact',
        label: 'Contact',
        shortName: 'Email',
        kind: 'document',
        size: '4 K',
        icon: '✉️',
        action: openContact,
      },
      {
        id: 'work',
        label: 'Work',
        shortName: 'Work',
        kind: 'folder',
        size: '—',
        icon: '📂',
        action: () => openWindow('work', 'Work', <WorkApp />),
      },
      {
        id: 'cv',
        label: 'CV',
        shortName: 'CV',
        kind: 'document',
        size: '42 K',
        icon: '📄',
        action: () => openWindow('cv', 'CV', <CVApp />),
      },
    ],
    [openWindow, downloadResume, openLinkedIn, openAboutMe, openContact, openHD]
  );

  const openFinder = useCallback(
    (modeOverride) => {
      const mode = modeOverride || finderViewMode;
      openWindow(
        'finder',
        'Applications',
        <FinderApp apps={desktopApps} viewMode={mode} />,
        true
      );
    },
    [openWindow, desktopApps, finderViewMode]
  );

  useEffect(() => {
    const existing = windows.find((w) => w.id === 'finder');
    if (existing) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === 'finder'
            ? { ...w, content: <FinderApp apps={desktopApps} viewMode={finderViewMode} /> }
            : w
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finderViewMode, desktopApps]);

  const handleNewFolder = useCallback(() => {
    folderCounterRef.current += 1;
    const n = folderCounterRef.current;
    const id = `folder-${Date.now()}-${n}`;
    const label = n === 1 ? 'untitled folder' : `untitled folder ${n}`;
    setCustomFolders((prev) => [...prev, { id, label }]);
  }, []);

  const handleOpenSelected = useCallback(() => {
    if (!selectedIcon) return;
    const app = desktopApps.find((a) => a.id === selectedIcon);
    if (app) app.action();
  }, [selectedIcon, desktopApps]);

  const handlePrint = useCallback(() => {
    try {
      window.print();
    } catch {
      /* no-op */
    }
  }, []);

  const handleCloseActive = useCallback(() => {
    if (activeWindow) closeWindow(activeWindow);
    else if (windows.length > 0) closeWindow(windows[windows.length - 1].id);
  }, [activeWindow, windows, closeWindow]);

  const handleMinimizeActive = useCallback(() => {
    const target = activeWindow || (windows.length ? windows[windows.length - 1].id : null);
    if (target) toggleMinimize(target);
  }, [activeWindow, windows, toggleMinimize]);

  const handleBringAllToFront = useCallback(() => {
    setWindows((prev) => prev.map((w) => ({ ...w, minimized: false })));
    if (windows.length && !activeWindow) setActiveWindow(windows[windows.length - 1].id);
  }, [windows, activeWindow]);

  const execClipboard = useCallback((command) => {
    try {
      if (command === 'copy' && navigator.clipboard && window.getSelection) {
        const sel = window.getSelection().toString();
        if (sel) {
          navigator.clipboard.writeText(sel).catch(() => {});
          return;
        }
      }
      document.execCommand(command);
    } catch {
      /* no-op */
    }
  }, []);

  const handleClear = useCallback(() => {
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
    setSelectedIcon(null);
  }, []);

  const handleSetViewMode = useCallback(
    (mode) => {
      setFinderViewMode(mode);
      const hasFinder = windows.some((w) => w.id === 'finder');
      if (!hasFinder) openFinder(mode);
      else setActiveWindow('finder');
    },
    [windows, openFinder]
  );

  const handleCleanUp = useCallback(() => {
    setSelectedIcon(null);
    setLayoutVersion((v) => v + 1);
  }, []);

  const menuActions = useMemo(
    () => ({
      File: [
        { label: 'New Folder', shortcut: '⌘N', onClick: handleNewFolder },
        {
          label: 'Open',
          shortcut: '⌘O',
          onClick: handleOpenSelected,
          disabled: !selectedIcon,
        },
        { label: 'Print…', shortcut: '⌘P', onClick: handlePrint },
        { label: 'Close Window', shortcut: '⌘W', onClick: handleCloseActive, disabled: !activeWindow && windows.length === 0 },
      ],
      Edit: [
        { label: 'Undo', shortcut: '⌘Z', onClick: () => execClipboard('undo') },
        { label: 'Cut', shortcut: '⌘X', onClick: () => execClipboard('cut') },
        { label: 'Copy', shortcut: '⌘C', onClick: () => execClipboard('copy') },
        { label: 'Paste', shortcut: '⌘V', onClick: () => execClipboard('paste') },
        { label: 'Clear', onClick: handleClear },
      ],
      View: [
        {
          label: 'as Icons',
          onClick: () => handleSetViewMode('icons'),
          checked: finderViewMode === 'icons',
        },
        {
          label: 'as List',
          onClick: () => handleSetViewMode('list'),
          checked: finderViewMode === 'list',
        },
        { label: 'Clean Up', onClick: handleCleanUp },
      ],
      Window: [
        { label: 'Minimize Window', shortcut: '⌘M', onClick: handleMinimizeActive, disabled: windows.length === 0 },
        { label: 'Bring All to Front', onClick: handleBringAllToFront, disabled: windows.length === 0 },
      ],
    }),
    [
      handleNewFolder,
      handleOpenSelected,
      handlePrint,
      handleCloseActive,
      activeWindow,
      windows.length,
      execClipboard,
      handleClear,
      handleSetViewMode,
      finderViewMode,
      handleCleanUp,
      handleMinimizeActive,
      handleBringAllToFront,
      selectedIcon,
    ]
  );

  if (!booted) {
    return <BootScreen onBoot={handleBoot} />;
  }

  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const isMobile = screenW <= 768;
  const leftColumnX = isMobile ? 12 : 24;
  const rightColumnX = isMobile ? Math.max(108, screenW - 96) : Math.max(120, screenW - 108);
  const iconY = (row) => (isMobile ? 14 + row * 78 : 20 + row * 82);

  const leftColumnIds = ['readme', 'spotify', 'about', 'doom'];
  const leftApps = leftColumnIds
    .map((id) => desktopApps.find((a) => a.id === id))
    .filter(Boolean);
  const rightApps = desktopApps.filter((a) => !leftColumnIds.includes(a.id));

  return (
    <AudioProvider>
      <MenuBar
        onOpenHelp={() => openWindow('help', 'Wiz Tree', <HelpWindow />, true)}
        onOpenFinder={() => openFinder()}
        menuActions={menuActions}
      />
      <div className="desktop-area" onClick={() => setSelectedIcon(null)}>

        {leftApps.map((app, i) => (
          <DesktopIcon
            key={`${app.id}-${layoutVersion}`}
            label={app.label}
            icon={app.icon}
            selected={selectedIcon === app.id}
            onClick={() => setSelectedIcon(app.id)}
            onDoubleClick={app.action}
            defaultPosition={{ x: leftColumnX, y: iconY(i) }}
          />
        ))}

        {rightApps.map((app, i) => (
          <DesktopIcon
            key={`${app.id}-${layoutVersion}`}
            label={app.label}
            icon={app.icon}
            selected={selectedIcon === app.id}
            onClick={() => setSelectedIcon(app.id)}
            onDoubleClick={app.action}
            defaultPosition={{ x: rightColumnX, y: iconY(i) }}
          />
        ))}

        {customFolders.map((folder, i) => (
          <DesktopIcon
            key={`${folder.id}-${layoutVersion}`}
            label={folder.label}
            icon="📁"
            selected={selectedIcon === folder.id}
            onClick={() => setSelectedIcon(folder.id)}
            onDoubleClick={() =>
              openWindow(
                folder.id,
                folder.label,
                <div className="mac-content-inner">
                  <p>This folder is empty.</p>
                </div>
              )
            }
            defaultPosition={{
              x: isMobile ? leftColumnX + 90 : leftColumnX + 100,
              y: iconY(i),
            }}
          />
        ))}

        <div className="window-container">
          {windows.map((win, index) => (
            <Window
              key={win.id}
              id={win.id}
              title={win.title}
              zIndex={activeWindow === win.id ? 1000 : 100 + index}
              onClick={() => focusWindow(win.id)}
              onClose={() => closeWindow(win.id)}
              minimized={win.minimized}
              onToggleMinimize={() => toggleMinimize(win.id)}
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
