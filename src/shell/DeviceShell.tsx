import React, { useRef, useEffect, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { TOTAL_WORLD_WIDTH } from '../data/worldSegments';
import { WORLD_LOCATIONS } from '../data/locations';
import { Volume2, VolumeX, Compass, User, Sparkles } from 'lucide-react';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { GBAPixelShellRenderer, GBAPressedKeys } from './GBAPixelShellRenderer';

interface DeviceShellProps {
  children: React.ReactNode;
}

/**
 * DeviceShell.tsx
 * 
 * 100% AUTHENTIC PROCEDURAL PIXEL-ART GBA (AGB-001) HARDWARE CHASSIS
 * - Driven by GBAPixelShellRenderer on a high-precision pixel canvas.
 * - Exact 16:9 Inner Screen Cutout (64% width, 64% height) -> ZERO BLACK BARS!
 * - Real-time button depression & luminous glowing visual feedback for D-Pad and J/K keys!
 * - J = Accelerate / Start, K = Brake / Action / Enter / Back
 */
export const DeviceShell: React.FC<DeviceShellProps> = ({ children }) => {
  const {
    currentView,
    isStarting,
    soundEnabled,
    toggleSound,
    currentSegment,
    playerX,
    playerState,
    nearParkingZone,
    nearParkedBike,
    nearInteraction,
    setCurrentView,
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Track pressed state for all GBA buttons
  const [pressedKeys, setPressedKeys] = useState<GBAPressedKeys>({
    left: false,
    right: false,
    up: false,
    down: false,
    j: false,
    k: false
  });

  // Window-level key tracking for physical keyboard feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') setPressedKeys(p => p.left ? p : { ...p, left: true });
      if (code === 'KeyD' || code === 'ArrowRight') setPressedKeys(p => p.right ? p : { ...p, right: true });
      if (code === 'KeyW' || code === 'ArrowUp') setPressedKeys(p => p.up ? p : { ...p, up: true });
      if (code === 'KeyS' || code === 'ArrowDown') setPressedKeys(p => p.down ? p : { ...p, down: true });
      if (code === 'KeyJ') setPressedKeys(p => p.j ? p : { ...p, j: true });
      if (code === 'KeyK' || code === 'KeyE' || code === 'Enter') setPressedKeys(p => p.k ? p : { ...p, k: true });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') setPressedKeys(p => !p.left ? p : { ...p, left: false });
      if (code === 'KeyD' || code === 'ArrowRight') setPressedKeys(p => !p.right ? p : { ...p, right: false });
      if (code === 'KeyW' || code === 'ArrowUp') setPressedKeys(p => !p.up ? p : { ...p, up: false });
      if (code === 'KeyS' || code === 'ArrowDown') setPressedKeys(p => !p.down ? p : { ...p, down: false });
      if (code === 'KeyJ') setPressedKeys(p => !p.j ? p : { ...p, j: false });
      if (code === 'KeyK' || code === 'KeyE' || code === 'Enter') setPressedKeys(p => !p.k ? p : { ...p, k: false });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Paint the pure pixel-art GBA console chassis whenever buttons are pressed/released
  useEffect(() => {
    if (canvasRef.current) {
      GBAPixelShellRenderer.render(canvasRef.current, pressedKeys);
    }
  }, [pressedKeys]);

  const progressPercent = Math.min(100, Math.max(0, (playerX / TOTAL_WORLD_WIDTH) * 100));

  // Determine bottom action prompt
  let actionPrompt: { key: string; text: string; color: string } | null = null;

  if (isStarting) {
    actionPrompt = { key: 'LOADING', text: '正在准备海岛 · 即将出发', color: 'bg-[#245587] text-white' };
  } else if (isEndingModalOpen) {
    actionPrompt = { key: 'J / K', text: 'J 确认 · 方向键选择 · K 再次探索', color: 'bg-[#245587] text-white' };
  } else if (activeLandmarkModal || isOverlayOpen) {
    actionPrompt = { key: 'J / K', text: 'J 确认 · K 返回 · 方向键选择', color: 'bg-slate-800 text-slate-200' };
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
  const startControl = (control: ShellControl) => {
    if (isStarting) return;
    setPressedKeys(p => ({ ...p, [control]: true }));
    if (control === 'j') handleButtonJ();
    else if (control === 'k') handleButtonK();
    else if (currentView === 'welcome' || isEndingModalOpen || activeLandmarkModal || isOverlayOpen) sendPanelKey(...controlKeys[control]);
    else setVirtualInput({ [control]: true });
  };
  const releaseControl = (control: ShellControl) => {
    setPressedKeys(p => ({ ...p, [control]: false }));
    sendPanelKey(...controlKeys[control], 'keyup');
    if (control === 'j') setVirtualInput({ accelerate: false, action: false });
    else if (control === 'k') setVirtualInput({ brake: false, action: false });
    else setVirtualInput({ [control]: false });
  };
  const controlEvents = (control: ShellControl) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      startControl(control);
    },
    onPointerUp: () => releaseControl(control),
    onPointerCancel: () => releaseControl(control),
    onLostPointerCapture: () => releaseControl(control),
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      // A focused control may be activated by native Enter/Space in a panel.
      if (event.detail === 0) { startControl(control); releaseControl(control); }
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault(); event.stopPropagation();
        if (!event.repeat) startControl(control);
      }
    },
    onKeyUp: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.code === 'Enter' || event.code === 'Space') { event.preventDefault(); event.stopPropagation(); releaseControl(control); }
    },
  });

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#090d14] select-none overflow-hidden">
      {/* Top Floating HUD Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-6 py-2 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs text-white">
        {/* Left: Current Zone & Segment */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sky-300 font-pixel text-xs">{activeInterior ? WORLD_LOCATIONS.find(loc => loc.id === activeInterior)?.name : currentSegment.name}</span>
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
        <div className="flex items-center gap-2">
          {activeInterior && <button onClick={exitInterior} className="px-2.5 py-1 bg-slate-800 text-slate-200 font-pixel text-[10px] cursor-pointer" title="直接返回建筑门口 · ESC" aria-label="退出内景">退出内景</button>}
          <button
            onClick={() => {
              pixelSound.playConfirm();
              if (!isStarting) setCurrentView('index');
            }}
            onMouseEnter={() => pixelSound.playSelect()}
            className="px-2.5 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white font-pixel flex items-center gap-1.5 transition text-[10px] sm:text-[11px] shadow-sm cursor-pointer"
            disabled={isStarting} title="招聘方全览索引"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>INDEX 索引</span>
          </button>

          <button
            onClick={() => {
              pixelSound.playConfirm();
              if (!isStarting) setCurrentView('info');
            }}
            onMouseEnter={() => pixelSound.playSelect()}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel flex items-center gap-1.5 transition text-[10px] sm:text-[11px] cursor-pointer"
            disabled={isStarting} title="创作者简历与介绍"
          >
            <User className="w-3.5 h-3.5" />
            <span>INFO 介绍</span>
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

          <button
            onClick={toggleSound}
            onMouseEnter={() => pixelSound.playSelect()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={soundEnabled ? '音效开启' : '音效静音'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Main Console Viewport Area */}
      <div className="relative w-full h-full flex items-center justify-center pt-8 pb-10 px-2 sm:px-4">
        {/* ================================================================= */}
        {/* AUTHENTIC PIXEL-ART GBA CONSOLE CHASSIS CONTAINER                 */}
        {/* Aspect Ratio 800:450 = 16:9 Ratio Matching the Canvas             */}
        {/* ================================================================= */}
        <div className="relative w-full max-w-[1040px] aspect-[800/450] max-h-[88vh] flex items-center justify-center select-none">
          {/* Background Canvas: Paints the complete 100% genuine Pixel Art GBA console */}
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none pixel-canvas z-0 drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)]"
          />

          {/* --------------------------------------------------------------- */}
          {/* CENTER SCREEN: Exact 16:9 Cutout (18% left, 18% top, 64% w, 64% h) */}
          {/* Completely fills the GBA screen with ZERO top/bottom black bars! */}
          {/* --------------------------------------------------------------- */}
          <div 
            className="absolute z-10 overflow-hidden bg-black flex items-center justify-center pixel-canvas shadow-inner"
            style={{
              left: '18%',
              top: '18%',
              width: '64%',
              height: '64%'
            }}
          >
            {/* The Live Game Canvas + In-Screen Modals */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {children}
            </div>

            {/* Subtle GBA LCD Scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%)] bg-[length:100%_4px] opacity-20" />
            {/* Subtle Lens Glare Reflection */}
            <div className="absolute top-1 left-2 w-32 h-10 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-[2px] pointer-events-none" />
          </div>

          {/* --------------------------------------------------------------- */}
          {/* LEFT WING OVERLAY: Interactive Cross D-Pad                      */}
          {/* --------------------------------------------------------------- */}
          <div 
            className="absolute z-20 flex items-center justify-center"
            style={{
              left: '4.5%',
              top: '36%',
              width: '12%',
              height: '24%'
            }}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              {([
                ['up', 'absolute top-0 w-6 h-6', '▲ 上'],
                ['down', 'absolute bottom-0 w-6 h-6', '▼ 下'],
                ['left', 'absolute left-0 w-6 h-6', '◀ 向左移动'],
                ['right', 'absolute right-0 w-6 h-6', '▶ 向右移动'],
              ] as const).map(([control, position, label]) => <button
                key={control} {...controlEvents(control)}
                className={`${position} rounded cursor-pointer touch-none`}
                title={label} aria-label={label}
              />)}
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* RIGHT WING OVERLAY: Interactive J & K Buttons                   */}
          {/* --------------------------------------------------------------- */}
          <div 
            className="absolute z-20 flex items-center justify-center"
            style={{
              right: '4%',
              top: '34%',
              width: '12%',
              height: '24%'
            }}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <button {...controlEvents('j')}
                className="absolute bottom-1 left-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer touch-none"
                title="J 键 (加速 / 确认)" aria-label="J 确认" />
              <button {...controlEvents('k')}
                className="absolute top-1 right-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer touch-none"
                title="K 键 (互动 / 返回)" aria-label="K 互动或返回" />
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* BOTTOM CENTER: SELECT & START Buttons                           */}
          {/* --------------------------------------------------------------- */}
          <div 
            className="absolute z-20 flex items-center justify-center gap-6 sm:gap-10"
            style={{
              bottom: '5%',
              left: '18%',
              width: '26%',
              height: '6%'
            }}
          >
            <button
              onClick={() => {
                pixelSound.playConfirm();
                if (!isStarting) setCurrentView('index');
              }}
              onMouseEnter={() => pixelSound.playSelect()}
              className="w-8 h-4 rotate-[-25deg] hover:bg-white/15 active:bg-white/30 rounded-full cursor-pointer"
              disabled={isStarting} title="SELECT: 打开索引"
            />
            <button
              onClick={() => {
                pixelSound.playConfirm();
                if (!isStarting) setCurrentView('info');
              }}
              onMouseEnter={() => pixelSound.playSelect()}
              className="w-8 h-4 rotate-[-25deg] hover:bg-white/15 active:bg-white/30 rounded-full cursor-pointer"
              disabled={isStarting} title="START: 作者介绍"
            />
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
