import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { TOTAL_WORLD_WIDTH } from '../data/worldSegments';
import { WORLD_LOCATIONS } from '../data/locations';
import { Volume2, VolumeX, Compass, User, Sparkles, House } from 'lucide-react';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { HandheldHardware, HANDHELD_DEVICES, HANDHELD_LAYOUTS, HANDHELD_FALLBACK_LAYOUTS, HANDHELD_SCREEN_RECT, hardwarePosition, HandheldPressedKeys, HandheldDevice, HandheldControl } from './HandheldHardware';
import './handheldHardware.css';

interface DeviceShellProps {
  children: React.ReactNode;
}

/** Physical 3D hardware around the shared, full-size pixel-art viewport. */
export const DeviceShell: React.FC<DeviceShellProps> = ({ children }) => {
  const [device, setDevice] = useState<HandheldDevice>(() => {
    try {
      const saved = localStorage.getItem('marc-island-handheld');
      if (saved && Object.prototype.hasOwnProperty.call(HANDHELD_DEVICES, saved)) return saved as HandheldDevice;
    } catch { /* Device selection still works when browser storage is unavailable. */ }
    return 'switch';
  });
  const chooseDevice = (nextDevice: HandheldDevice) => {
    setDevice(nextDevice);
    try { localStorage.setItem('marc-island-handheld', nextDevice); } catch { /* Optional preference. */ }
  };
  const [importedDevice, setImportedDevice] = useState<HandheldDevice | null>(null);
  const onAssetReady = useCallback((loadedDevice: HandheldDevice, ready: boolean) => setImportedDevice(ready ? loadedDevice : null), []);
  const layout = (importedDevice === device ? HANDHELD_LAYOUTS : HANDHELD_FALLBACK_LAYOUTS)[device];
  const {
    currentView,
    isStarting,
    soundEnabled,
    toggleSound,
    soundVolume,
    setSoundVolume,
    currentSegment,
    playerX,
    playerState,
    nearParkingZone,
    nearParkedBike,
    nearInteraction,
    setCurrentView,
    returnToWelcome,
    setVirtualInput,
    activeLandmarkModal,
    activeInterior,
    interiorPrompt,
    exitInterior,
    closeLandmarkModal,
    closePrintHouseModal,
    isPrintHouseBookOpen,
    isOverlayOpen,
    closeOverlay,
    isPostcardOpen,
    closePostcard,
    isEndingModalOpen,
  } = useWorldStore();

  // Track pressed state for all handheld buttons
  const [pressedKeys, setPressedKeys] = useState<HandheldPressedKeys>({
    left: false,
    right: false,
    up: false,
    down: false,
    j: false,
    k: false
  });

  const [activeStick, setActiveStick] = useState<'left' | 'right' | null>(null);
  const pressStarted = useRef<Partial<Record<HandheldControl, number>>>({});
  const pressTimers = useRef<Partial<Record<HandheldControl, ReturnType<typeof setTimeout>>>>({});
  const showPress = useCallback((control: HandheldControl, down: boolean) => {
    clearTimeout(pressTimers.current[control]);
    if (down) {
      pressStarted.current[control] ??= performance.now();
      setPressedKeys(keys => keys[control] ? keys : { ...keys, [control]: true });
    } else {
      const remaining = Math.max(0, 110 - (performance.now() - (pressStarted.current[control] ?? 0)));
      pressTimers.current[control] = setTimeout(() => {
        delete pressStarted.current[control];
        setPressedKeys(keys => !keys[control] ? keys : { ...keys, [control]: false });
      }, remaining);
    }
  }, []);

  // Window-level key tracking for physical keyboard feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (e.isTrusted && ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) setActiveStick('left');
      if (code === 'KeyA' || code === 'ArrowLeft') showPress('left', true);
      if (code === 'KeyD' || code === 'ArrowRight') showPress('right', true);
      if (code === 'KeyW' || code === 'ArrowUp') showPress('up', true);
      if (code === 'KeyS' || code === 'ArrowDown') showPress('down', true);
      if (code === 'KeyJ') showPress('j', true);
      if (code === 'KeyK' || code === 'KeyE' || code === 'Enter') showPress('k', true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') showPress('left', false);
      if (code === 'KeyD' || code === 'ArrowRight') showPress('right', false);
      if (code === 'KeyW' || code === 'ArrowUp') showPress('up', false);
      if (code === 'KeyS' || code === 'ArrowDown') showPress('down', false);
      if (code === 'KeyJ') showPress('j', false);
      if (code === 'KeyK' || code === 'KeyE' || code === 'Enter') showPress('k', false);
    };

    const clearPresses = () => {
      Object.values(pressTimers.current).forEach(clearTimeout);
      pressStarted.current = {};
      setActiveStick(null);
      setPressedKeys({ left: false, right: false, up: false, down: false, j: false, k: false });
      useWorldStore.getState().setVirtualInput({ left: false, right: false, up: false, down: false, accelerate: false, brake: false, action: false });
    };
    window.addEventListener('blur', clearPresses);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      Object.values(pressTimers.current).forEach(clearTimeout);
      window.removeEventListener('blur', clearPresses);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showPress]);

  // HUD volume controls must not send navigation keys into the game or a popup.
  useEffect(() => {
    const handleVolumeKey = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const deviceGroup = target?.closest('[data-handheld-devices]');
      if (deviceGroup && event.code !== 'Tab') {
        event.stopImmediatePropagation();
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
          event.preventDefault();
          const buttons = Array.from(deviceGroup.querySelectorAll<HTMLButtonElement>('button'));
          const direction = ['ArrowRight', 'ArrowDown'].includes(event.code) ? 1 : -1;
          const next = buttons[(buttons.indexOf(target as HTMLButtonElement) + direction + buttons.length) % buttons.length];
          next.focus(); next.click();
        } else if (['Enter', 'Space'].includes(event.code)) {
          event.preventDefault(); if (!event.repeat) target?.click();
        }
        return;
      }
      if (!target?.closest('[data-handheld-volume]') || event.code === 'Tab') return;
      event.stopImmediatePropagation();
      if (target instanceof HTMLInputElement) {
        const current = useWorldStore.getState().soundVolume;
        const delta = ['ArrowRight', 'ArrowUp'].includes(event.code) ? .05
          : ['ArrowLeft', 'ArrowDown'].includes(event.code) ? -.05 : 0;
        if (delta || event.code === 'Home' || event.code === 'End') {
          event.preventDefault();
          useWorldStore.getState().setSoundVolume(event.code === 'Home' ? 0 : event.code === 'End' ? 1 : current + delta);
        } else if (event.code !== 'Escape') event.preventDefault();
        if (event.code === 'Escape') target.blur();
      } else if (target instanceof HTMLButtonElement && ['Enter', 'Space'].includes(event.code)) {
        event.preventDefault();
        if (!event.repeat) target.click();
      }
    };
    window.addEventListener('keydown', handleVolumeKey, true);
    return () => window.removeEventListener('keydown', handleVolumeKey, true);
  }, []);

  // Uploaded films use the same machine volume as music, waves and game effects.
  useEffect(() => {
    const apply = (element: HTMLMediaElement) => { element.volume = soundVolume; element.muted = !soundEnabled; };
    document.querySelectorAll<HTMLMediaElement>('video, audio').forEach(apply);
    const observer = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node instanceof HTMLMediaElement) apply(node);
        if (node instanceof Element) node.querySelectorAll<HTMLMediaElement>('video, audio').forEach(apply);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [soundVolume, soundEnabled]);

  const progressPercent = Math.min(100, Math.max(0, (playerX / TOTAL_WORLD_WIDTH) * 100));

  // Determine bottom action prompt
  let actionPrompt: { key: string; text: string; color: string } | null = null;

  if (currentView === 'welcome' && !isStarting) {
    actionPrompt = null;
  } else if (isStarting) {
    actionPrompt = { key: 'LOADING', text: '正在准备海岛 · 即将出发', color: 'bg-[#245587] text-white' };
  } else if (isEndingModalOpen) {
    actionPrompt = { key: 'J / K', text: 'J 确认 · 方向键选择 · K 再次探索', color: 'bg-[#245587] text-white' };
  } else if (activeLandmarkModal || isOverlayOpen) {
    actionPrompt = { key: 'J', text: 'J 确认 · 方向键切换', color: 'bg-slate-800 text-slate-200' };
  } else if (activeInterior) {
    actionPrompt = { key: interiorPrompt ? 'J / E' : 'A / D', text: interiorPrompt ? '互动' : '走动', color: 'bg-[#245587] text-white' };
  } else if (playerState === 'RIDING') {
    if (nearParkingZone) {
      actionPrompt = { key: 'K', text: `PARK · 停靠单车 (${nearParkingZone.name})`, color: 'bg-[#ea580c] text-white' };
    } else if (playerX > 6200) {
      actionPrompt = { key: 'K', text: 'FINISH · 结束骑行 (离开画外)', color: 'bg-emerald-600 text-white animate-pulse' };
    } else {
      actionPrompt = { key: 'J / K', text: 'J 加速 · K 刹车', color: 'bg-slate-800 text-slate-200' };
    }
  } else if (playerState === 'WALKING') {
    if (nearParkedBike) {
      actionPrompt = { key: 'K', text: 'RIDE · 骑上单车', color: 'bg-[#0284c7] text-white' };
    } else if (Math.abs(playerX - 4610) < 38) {
      actionPrompt = { key: 'K', text: 'PET · 抚摸猫咪', color: 'bg-amber-500 text-white' };
    } else if (Math.abs(playerX - 6060) < 42) {
      actionPrompt = { key: 'K', text: 'LOOK · 眺望小镇全景', color: 'bg-teal-500 text-white' };
    } else if (nearInteraction) {
      actionPrompt = { key: 'K', text: `ENTER · 进入 ${nearInteraction.name}`, color: 'bg-emerald-600 text-white' };
    }
  }

  const sendPanelKey = (code: string, key: string, type: 'keydown' | 'keyup' = 'keydown') => {
    window.dispatchEvent(new KeyboardEvent(type, { code, key, bubbles: true, cancelable: true }));
  };

  // Shell controls use the same navigation as the physical keyboard in panels.
  const handleButtonJ = () => {
    if (isStarting) return;
    pixelSound.playInteract();
    if (currentView === 'welcome' || isEndingModalOpen || activeLandmarkModal || isOverlayOpen) {
      sendPanelKey('KeyJ', 'j');
      return;
    }
    if (activeInterior) {
      sendPanelKey('KeyJ', 'j');
      setVirtualInput({ action: true });
      return;
    }
    sendPanelKey('KeyJ', 'j');
    setVirtualInput({ accelerate: true });
  };

  // Handle K Button Click (Brake / Action / Enter / Close)
  const handleButtonK = () => {
    if (isStarting) return;
    pixelSound.playInteract();
    if (currentView === 'welcome' || isEndingModalOpen || activeLandmarkModal || isOverlayOpen) {
      sendPanelKey('KeyK', 'k');
      return;
    }
    if (isPrintHouseBookOpen) {
      closePrintHouseModal();
      return;
    }
    if (isPostcardOpen) {
      closePostcard();
      return;
    }
    if (isOverlayOpen) {
      closeOverlay();
      return;
    }
    sendPanelKey('KeyK', 'k');
    setVirtualInput({ brake: true, action: true });
  };

  type ShellControl = 'up' | 'down' | 'left' | 'right' | 'j' | 'k';
  const controlKeys: Record<ShellControl, [string, string]> = {
    up: ['ArrowUp', 'ArrowUp'], down: ['ArrowDown', 'ArrowDown'],
    left: ['ArrowLeft', 'ArrowLeft'], right: ['ArrowRight', 'ArrowRight'],
    j: ['KeyJ', 'j'], k: ['KeyK', 'k'],
  };
  const startControl = (control: ShellControl, stick: 'left' | 'right' | null = null) => {
    if (isStarting) return;
    showPress(control, true);
    if (!['j', 'k'].includes(control)) setActiveStick(stick);
    if (control === 'j') handleButtonJ();
    else if (control === 'k') handleButtonK();
    else if (currentView === 'welcome' || isEndingModalOpen || activeLandmarkModal || isOverlayOpen) sendPanelKey(...controlKeys[control]);
    else setVirtualInput({ [control]: true });
  };
  const releaseControl = (control: ShellControl) => {
    showPress(control, false);
    sendPanelKey(...controlKeys[control], 'keyup');
    if (control === 'j') setVirtualInput({ accelerate: false, action: false });
    else if (control === 'k') setVirtualInput({ brake: false, action: false });
    else setVirtualInput({ [control]: false });
  };
  const controlEvents = (control: ShellControl, stick: 'left' | 'right' | null = null) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      startControl(control, stick);
    },
    onPointerUp: () => releaseControl(control),
    onPointerCancel: () => releaseControl(control),
    onLostPointerCapture: () => releaseControl(control),
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      // A focused control may be activated by native Enter/Space in a panel.
      if (event.detail === 0) { startControl(control, stick); releaseControl(control); }
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault(); event.stopPropagation();
        if (!event.repeat) startControl(control, stick);
      }
    },
    onKeyUp: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.code === 'Enter' || event.code === 'Space') { event.preventDefault(); event.stopPropagation(); releaseControl(control); }
    },
  });

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center handheld-stage select-none overflow-hidden" data-handheld-device={device}>
      {/* Top Floating HUD Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-6 py-2 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs text-white">
        {/* Left: Current Zone & Segment */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 font-bold tracking-wide min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sky-300 font-pixel text-xs truncate">{activeInterior ? WORLD_LOCATIONS.find(loc => loc.id === activeInterior)?.name : currentSegment.name}</span>
          </div>
          <span className="hidden md:inline text-[11px] font-pixel text-slate-400 border-l border-white/10 pl-3">
            {activeInterior ? '室内探索 · 步行模式' : currentSegment.subname}
          </span>
        </div>

        {/* Center: World Journey Progress Bar */}
        <div className={`${activeInterior ? 'hidden' : 'hidden lg:flex'} items-center gap-2.5 w-64 xl:w-80`}>
          <span className="text-[10px] text-slate-400 font-pixel">01</span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-400 rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-pixel">10</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {currentView === 'game' && <button onClick={returnToWelcome} disabled={isStarting}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel flex items-center gap-1.5 text-[10px] sm:text-[11px] cursor-pointer"
            aria-label="回到主页" title="回到主页"><House className="w-3.5 h-3.5 hidden sm:block" /><span>主页</span></button>}
          {activeInterior && <button onClick={exitInterior} className="px-2.5 py-1 bg-slate-800 text-slate-200 font-pixel text-[10px] cursor-pointer" title="直接返回建筑门口 · ESC" aria-label="退出内景">退出内景</button>}
          <button
            onClick={() => {
              pixelSound.playConfirm();
              if (!isStarting) setCurrentView('index');
            }}
            onMouseEnter={() => pixelSound.playSelect()}
            className="px-2.5 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white font-pixel flex items-center gap-1.5 transition text-[10px] sm:text-[11px] shadow-sm cursor-pointer"
            disabled={isStarting} title="招聘方全览索引" aria-label="INDEX 索引"
          >
            <Compass className="w-3.5 h-3.5" />
            <span><span className="hidden sm:inline">INDEX </span>索引</span>
          </button>

          <button
            onClick={() => {
              pixelSound.playConfirm();
              if (!isStarting) setCurrentView('info');
            }}
            onMouseEnter={() => pixelSound.playSelect()}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel flex items-center gap-1.5 transition text-[10px] sm:text-[11px] cursor-pointer"
            disabled={isStarting} title="查看原版 PDF 简历" aria-label="INFO 简历"
          >
            <User className="w-3.5 h-3.5" />
            <span><span className="hidden sm:inline">INFO </span>简历</span>
          </button>

          {playerX >= 5000 && (
            <button
              onClick={() => {
                pixelSound.playConfirm();
                useWorldStore.getState().openPostcard();
              }}
              onMouseEnter={() => pixelSound.playSelect()}
              className="px-2.5 py-1 rounded-lg bg-teal-600/90 hover:bg-teal-500 text-white font-pixel flex items-center gap-1.5 transition text-[10px] sm:text-[11px] shadow-sm animate-pulse cursor-pointer"
              title="山顶登顶纪念明信片"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>POSTCARD 留念</span>
            </button>
          )}

          <div className="handheld-volume" data-handheld-volume role="group" aria-label="音量控制">
            <button className="handheld-mute" onClick={toggleSound} aria-label={soundEnabled ? '静音' : '开启声音'}
              aria-pressed={!soundEnabled} title={soundEnabled ? '静音' : '开启声音'}>
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </button>
            <button onClick={() => setSoundVolume(soundVolume - .05)} aria-label="降低音量" title="降低音量">−</button>
            <input type="range" min="0" max="100" step="5" value={Math.round(soundVolume * 100)}
              onChange={event => setSoundVolume(Number(event.currentTarget.value) / 100)} aria-label="音量"
              aria-valuetext={soundEnabled ? `${Math.round(soundVolume * 100)}%` : '静音'}
              title={`音量 ${Math.round(soundVolume * 100)}%`} />
            <button onClick={() => setSoundVolume(soundVolume + .05)} aria-label="提高音量" title="提高音量">+</button>
          </div>

        </div>
      </header>

      {/* Main Console Viewport Area */}
      <div className="relative w-full h-full flex items-center justify-center pt-8 pb-10 px-2 sm:px-4">
        <div className="handheld-console" data-handheld-device={device} aria-label={`${HANDHELD_DEVICES[device].label} 掌机`}>
          <HandheldHardware pressed={pressedKeys} device={device} activeStick={activeStick} onAssetReady={onAssetReady} />

          {/* Every device shares this 16:9 viewport; hardware never changes its size. */}
          <div 
            className="absolute z-10 overflow-hidden bg-black flex items-center justify-center pixel-canvas handheld-screen"
            style={hardwarePosition(...HANDHELD_SCREEN_RECT)}
          >
            {/* The Live Game Canvas + In-Screen Modals */}
            <div className="handheld-game-viewport flex items-center justify-center">
              {children}
            </div>

            {/* Subtle LCD Scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%)] bg-[length:100%_4px] opacity-20" />
            {/* Subtle Lens Glare Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[.035] via-transparent to-black/[.04] pointer-events-none" />
          </div>

          {([
            ['up', '▲ 上'], ['down', '▼ 下'], ['left', '◀ 向左移动'], ['right', '▶ 向右移动'],
            ['j', 'J 确认'], ['k', 'K 互动或返回'],
          ] as const).map(([control, label]) => <button key={control} {...controlEvents(control)}
            className={`handheld-hit ${control === 'j' || control === 'k' ? 'handheld-hit-round' : ''}`}
            style={hardwarePosition(...layout.controls[control])} aria-label={label} aria-pressed={pressedKeys[control]} data-handheld-control={control}
            title={control === 'j' ? 'J 加速 / 确认' : control === 'k' ? 'K 互动 / 返回' : label} />)}

          {Object.entries(layout.sticks ?? {}).map(([side, rect]) => (
            <div key={side} className="handheld-stick-hit" style={hardwarePosition(...rect)}>
              {(['up', 'right', 'down', 'left'] as const).map(control => <button key={control}
                {...controlEvents(control, side as 'left' | 'right')} className={`handheld-stick-sector handheld-stick-${control}`}
                aria-label={`${side === 'left' ? '左' : '右'}摇杆${{ up: '向上', down: '向下', left: '向左', right: '向右' }[control]}`}
                aria-pressed={pressedKeys[control]} title="摇杆 · 方向控制" />)}
            </div>
          ))}

          {([{ control: 'info', label: 'INFO 简历', title: '查看简历 PDF' },
            { control: 'index', label: 'INDEX 索引', title: '打开索引' }] as const).map(({ control, label, title }) =>
              <button key={control} className="handheld-small-button" style={hardwarePosition(...layout.shortcuts[control])}
                onClick={() => { pixelSound.playConfirm(); if (!isStarting) setCurrentView(control); }}
                disabled={isStarting} title={title} aria-label={label} />)}

          <div className="handheld-device-options" data-handheld-devices role="radiogroup" aria-label="选择掌机">
            {currentView === 'welcome' && <span className="handheld-device-label">选择掌机</span>}
            {(Object.entries(HANDHELD_DEVICES) as [HandheldDevice, typeof HANDHELD_DEVICES[HandheldDevice]][]).map(([nextDevice, option]) =>
              <button key={nextDevice} role="radio" aria-checked={device === nextDevice} tabIndex={device === nextDevice ? 0 : -1}
                onClick={() => chooseDevice(nextDevice)} aria-label={option.label}>
                <span style={{ backgroundColor: option.swatch }} aria-hidden="true" />{option.label}
              </button>)}
            <a className="handheld-model-credit" href="/assets/hardware/credits.html" target="_blank" rel="noopener noreferrer" aria-label="掌机模型署名" title="模型署名">ⓘ</a>
          </div>
        </div>
      </div>

      {/* Dynamic Action Prompt Hint in bottom corner */}
      {actionPrompt && (
        <div className="absolute bottom-2 z-30 pointer-events-none">
          <div className={`px-4 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 font-pixel text-[10px] sm:text-xs font-bold ${actionPrompt.color}`}>
            <span className="px-1.5 py-0.5 rounded bg-black/30 font-pixel text-[9px]">
              {actionPrompt.key}
            </span>
            <span>{actionPrompt.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
