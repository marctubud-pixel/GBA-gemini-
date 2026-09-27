import React from 'react';
import { useWorldStore, ShellType } from '../store/useWorldStore';
import { WORLD_SEGMENTS, TOTAL_WORLD_WIDTH } from '../data/worldSegments';
import { Volume2, VolumeX, Tv, Smartphone, Maximize2, Compass, User, Sparkles } from 'lucide-react';

interface DeviceShellProps {
  children: React.ReactNode;
}

export const DeviceShell: React.FC<DeviceShellProps> = ({ children }) => {
  const {
    deviceShell,
    setDeviceShell,
    soundEnabled,
    toggleSound,
    currentSegment,
    playerX,
    bikeSpeed,
    playerState,
    nearParkingZone,
    nearParkedBike,
    nearInteraction,
    setCurrentView,
    setVirtualInput
  } = useWorldStore();

  const progressPercent = Math.min(100, Math.max(0, (playerX / TOTAL_WORLD_WIDTH) * 100));

  // Determine bottom action prompt
  let actionPrompt: { key: string; text: string; color: string } | null = null;

  if (playerState === 'RIDING') {
    if (nearParkingZone) {
      actionPrompt = { key: 'E', text: `PARK · 停靠单车 (${nearParkingZone.name})`, color: 'bg-amber-400 text-slate-950' };
    }
  } else if (playerState === 'WALKING') {
    if (nearParkedBike) {
      actionPrompt = { key: 'E', text: 'RIDE · 骑上单车', color: 'bg-blue-600 text-white' };
    } else if (nearInteraction) {
      actionPrompt = { key: 'E', text: `${nearInteraction.promptText} · ${nearInteraction.name}`, color: 'bg-emerald-600 text-white' };
    }
  }

  const nextShell = (): ShellType => {
    if (deviceShell === 'retro-tv') return 'gba';
    if (deviceShell === 'gba') return 'none';
    return 'retro-tv';
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0d131a] select-none overflow-hidden">
      {/* Top Floating HUD */}
      <header className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-6 py-2.5 bg-slate-950/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs text-white">
        {/* Left: Current Zone & Segment */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sky-300 font-mono">{currentSegment.name}</span>
          </div>
          <span className="hidden md:inline text-[11px] text-slate-400 border-l border-white/10 pl-3">
            {currentSegment.subname}
          </span>
        </div>

        {/* Center: World Journey Progress Bar */}
        <div className="hidden lg:flex items-center gap-2.5 w-64 xl:w-80">
          <span className="text-[10px] text-slate-400 font-mono">01</span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-400 rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">10</span>
        </div>

        {/* Right Controls: Index, Info, Shell Toggle, Sound */}
        <div className="flex items-center gap-2">
          {/* Recruiter Index Quick Access */}
          <button
            onClick={() => setCurrentView('index')}
            className="px-2.5 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 transition text-[11px] shadow-sm"
            title="招聘方全览索引"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>INDEX 索引</span>
          </button>

          <button
            onClick={() => setCurrentView('info')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition text-[11px]"
            title="创作者简历与介绍"
          >
            <User className="w-3.5 h-3.5" />
            <span>INFO 介绍</span>
          </button>

          <button
            onClick={() => setDeviceShell(nextShell())}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title={`切换机壳 (当前: ${deviceShell})`}
          >
            {deviceShell === 'retro-tv' && <Tv className="w-3.5 h-3.5" />}
            {deviceShell === 'gba' && <Smartphone className="w-3.5 h-3.5" />}
            {deviceShell === 'none' && <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title={soundEnabled ? '音效开启' : '音效静音'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <div className="relative w-full h-full flex items-center justify-center pt-10 pb-12 px-2">
        {/* Retro TV Shell Styling */}
        {deviceShell === 'retro-tv' && (
          <div className="relative max-w-[1040px] w-full aspect-[16/9] max-h-[82vh] bg-[#1a1e24] p-4 sm:p-7 rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.85)] border-4 border-[#28303b] flex flex-col justify-between">
            {/* TV Brand Plate */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="font-mono text-[9px] tracking-widest text-slate-400 uppercase">
                SONY TRINITRON · GBA CO-PROCESSOR
              </span>
            </div>

            {/* Inner Curved Bezel Screen */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black shadow-inner border-2 border-slate-700/60 pixel-canvas">
              {children}
            </div>

            {/* TV Bottom Grill & Control Knobs */}
            <div className="h-4 flex items-center justify-between px-4 mt-2">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <span key={i} className="w-3 h-1 bg-slate-700 rounded-xs" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-500" />
              </div>
            </div>
          </div>
        )}

        {/* GBA Device Shell Styling */}
        {deviceShell === 'gba' && (
          <div className="relative max-w-[1080px] w-full aspect-[16/9] max-h-[82vh] bg-[#3a4785] p-4 sm:p-8 rounded-[48px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] border-4 border-[#4f5ea0] flex items-center justify-between">
            {/* GBA Left D-Pad */}
            <div className="hidden sm:flex flex-col items-center justify-center w-24">
              <div className="relative w-16 h-16">
                <div className="absolute inset-y-0 left-5 w-6 bg-[#1e243b] rounded-md shadow-md" />
                <div className="absolute inset-x-0 top-5 h-6 bg-[#1e243b] rounded-md shadow-md" />
                <div className="absolute inset-5 bg-[#181c2f] rounded-xs" />
                {/* Clickable Left */}
                <button
                  onMouseDown={() => setVirtualInput({ left: true })}
                  onMouseUp={() => setVirtualInput({ left: false })}
                  onTouchStart={() => setVirtualInput({ left: true })}
                  onTouchEnd={() => setVirtualInput({ left: false })}
                  className="absolute inset-y-4 left-0 w-6 hover:bg-white/10 active:bg-white/20 rounded-l cursor-pointer"
                  title="向左移动"
                />
                {/* Clickable Right */}
                <button
                  onMouseDown={() => setVirtualInput({ right: true })}
                  onMouseUp={() => setVirtualInput({ right: false })}
                  onTouchStart={() => setVirtualInput({ right: true })}
                  onTouchEnd={() => setVirtualInput({ right: false })}
                  className="absolute inset-y-4 right-0 w-6 hover:bg-white/10 active:bg-white/20 rounded-r cursor-pointer"
                  title="向右移动"
                />
              </div>
              <span className="text-[9px] font-bold text-slate-400/80 tracking-widest mt-4">
                GAME BOY
              </span>
            </div>

            {/* GBA Center Screen */}
            <div className="relative flex-1 h-full rounded-xl overflow-hidden bg-black border-4 border-[#242b47] pixel-canvas shadow-2xl">
              {children}
            </div>

            {/* GBA Right A/B Buttons */}
            <div className="hidden sm:flex flex-col items-center justify-center w-24 gap-3">
              <div className="flex gap-3 rotate-[-25deg]">
                <button
                  onClick={() => {
                    const store = useWorldStore.getState();
                    if (store.isOverlayOpen) store.closeOverlay();
                  }}
                  className="w-8 h-8 rounded-full bg-[#832646] hover:bg-[#a8325a] active:scale-95 border-2 border-[#a8325a] shadow-md flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                  title="B键 (返回/关闭)"
                >
                  B
                </button>
                <button
                  onClick={() => {
                    setVirtualInput({ action: true });
                    setTimeout(() => setVirtualInput({ action: false }), 250);
                  }}
                  className="w-8 h-8 rounded-full bg-[#832646] hover:bg-[#a8325a] active:scale-95 border-2 border-[#a8325a] shadow-md flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                  title="A键 (停车/互动)"
                >
                  A
                </button>
              </div>
              <span className="text-[9px] font-bold text-slate-400/80 tracking-widest mt-6">
                ADVANCE
              </span>
            </div>
          </div>
        )}

        {/* Clean Frame (No Shell) */}
        {deviceShell === 'none' && (
          <div className="relative w-full h-full max-w-[1280px] max-h-[85vh] rounded-xl overflow-hidden bg-black shadow-2xl border border-white/10 pixel-canvas">
            {children}
          </div>
        )}
      </div>

      {/* Bottom Floating Interaction & Control Banner */}
      <footer className="absolute bottom-2 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 pointer-events-none">
        {/* On-screen Movement Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur p-1 rounded-xl border border-white/15 shadow-md">
          <button
            onMouseDown={() => setVirtualInput({ left: true })}
            onMouseUp={() => setVirtualInput({ left: false })}
            onMouseLeave={() => setVirtualInput({ left: false })}
            onTouchStart={() => setVirtualInput({ left: true })}
            onTouchEnd={() => setVirtualInput({ left: false })}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold text-xs flex items-center gap-1 transition select-none cursor-pointer"
            title="向左骑行 (A / ←)"
          >
            ◀ 骑行左
          </button>
          <button
            onMouseDown={() => setVirtualInput({ right: true })}
            onMouseUp={() => setVirtualInput({ right: false })}
            onMouseLeave={() => setVirtualInput({ right: false })}
            onTouchStart={() => setVirtualInput({ right: true })}
            onTouchEnd={() => setVirtualInput({ right: false })}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold text-xs flex items-center gap-1 transition select-none cursor-pointer"
            title="向右骑行 (D / →)"
          >
            骑行右 ▶
          </button>
        </div>

        {/* Dynamic Action Button */}
        {actionPrompt && (
          <button
            onClick={() => {
              setVirtualInput({ action: true });
              setTimeout(() => setVirtualInput({ action: false }), 250);
            }}
            className={`pointer-events-auto mx-auto px-4 py-2 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2.5 font-bold text-xs sm:text-sm active:scale-95 transition cursor-pointer ${actionPrompt.color}`}
          >
            <kbd className="px-2 py-0.5 rounded-lg bg-black/30 font-mono text-xs">
              {actionPrompt.key}
            </kbd>
            <span>{actionPrompt.text}</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-400 font-mono">
          <span>SPEED: {Math.abs(bikeSpeed)} PX/S</span>
        </div>
      </footer>
    </div>
  );
};
