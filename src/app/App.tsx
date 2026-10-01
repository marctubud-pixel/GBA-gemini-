import React, { useEffect, useRef, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { createGame } from '../game/Game';
import { DeviceShell } from '../shell/DeviceShell';
import { PortfolioOverlay } from '../portfolio/PortfolioOverlay';
import { WriteHouseModal } from '../portfolio/WriteHouseModal';
import { MarcCinemaModal } from '../portfolio/MarcCinemaModal';
import { BrandMuseumModal } from '../portfolio/BrandMuseumModal';
import { ArcadeGameModal } from '../portfolio/ArcadeGameModal';
import { HobbyStudioModal } from '../portfolio/HobbyStudioModal';
import { ProjectIndex } from '../portfolio/ProjectIndex';
import { InfoView } from '../portfolio/InfoView';
import { PostcardModal } from '../portfolio/PostcardModal';
import { EndingModal } from '../portfolio/EndingModal';
import Phaser from 'phaser';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelPalmTree, PixelSpeaker } from '../shell/PixelIcons';

export const App: React.FC = () => {
  const { currentView, setCurrentView } = useWorldStore();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [isQuitStandby, setIsQuitStandby] = useState(false);
  const [isLoadingTransition, setIsLoadingTransition] = useState(false);

  // Connect PixelSoundManager with world store lifecycle
  useEffect(() => {
    const unsub = pixelSound.connectStore(useWorldStore);
    return unsub;
  }, []);

  // Initialize Phaser Game instance
  useEffect(() => {
    if (gameContainerRef.current && !phaserGameRef.current) {
      phaserGameRef.current = createGame(gameContainerRef.current);
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  const handleStartGame = () => {
    if (isLoadingTransition) return;
    pixelSound.startAudio();
    pixelSound.playConfirm();
    setIsQuitStandby(false);
    setIsLoadingTransition(true);

    // Cyclist pedaling across the line loading duration: 1.6s
    setTimeout(() => {
      setIsLoadingTransition(false);
      setCurrentView('game');
      pixelSound.playMount();
      setTimeout(() => {
        window.focus();
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.focus();
      }, 50);
    }, 1600);
  };

  const handleQuitGame = () => {
    pixelSound.playCancel();
    setIsQuitStandby(true);
  };

  // Keyboard navigation on Welcome Screen (Press J: Start, Press K: Quit)
  useEffect(() => {
    if (currentView !== 'welcome' || isLoadingTransition) return;

    const onWelcomeKey = (e: KeyboardEvent) => {
      if (e.key === 'j' || e.key === 'J') {
        handleStartGame();
      } else if (e.key === 'k' || e.key === 'K') {
        handleQuitGame();
      }
    };

    window.addEventListener('keydown', onWelcomeKey);
    return () => window.removeEventListener('keydown', onWelcomeKey);
  }, [currentView, isQuitStandby, isLoadingTransition]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0d131a]">
      {/* 1. Phaser Game Viewport & In-Screen Modals inside GBA Screen */}
      <DeviceShell>
        <div 
          ref={gameContainerRef} 
          id="phaser-container" 
          className="w-full h-full flex items-center justify-center"
        />

        {/* 2. Loading Transition Animation (Matches Game's Exact GBA Pixel Palette) */}
        {isLoadingTransition && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#78c8ec] select-none animate-fadeIn overflow-hidden">
            {/* Authentic GBA Scanlines & Distant Clouds */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.12)_50%)] bg-[length:100%_4px] pointer-events-none" />
            <div className="absolute top-8 left-10 w-24 h-7 bg-white/90 rounded-xs shadow-[2px_2px_0_rgba(0,0,0,0.1)]" />
            <div className="absolute top-14 right-14 w-32 h-9 bg-white/80 rounded-xs shadow-[2px_2px_0_rgba(0,0,0,0.1)]" />
            <div className="absolute top-28 left-1/3 w-20 h-6 bg-white/70 rounded-xs" />

            {/* Center Content: Title, LOADING..., Progress Bar, Subtext */}
            <div className="relative z-10 flex flex-col items-center text-center -mt-6">
              {/* MARC ISLAND Title with Palm Tree */}
              <div className="flex flex-col items-center mb-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-['Press_Start_2P',monospace] text-2xl sm:text-3xl text-white tracking-widest pixel-shadow drop-shadow-[3px_3px_0_#0284c7]">
                    MARC ISLAND
                  </h1>
                  <PixelPalmTree className="w-6 h-6 -mt-2 drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]" />
                </div>
              </div>

              {/* Subtitle: LOADING... */}
              <div className="font-['Press_Start_2P',monospace] text-[10px] sm:text-xs text-white tracking-[0.3em] font-bold my-3 pixel-shadow animate-pulse">
                LOADING...
              </div>

              {/* Segmented Cyan Glowing Progress Bar (Authentic GBA Style) */}
              <div className="w-64 sm:w-80 h-6 bg-[#0c2340] border-2 border-white rounded-xs p-0.5 shadow-[0_3px_0_#000] flex items-center overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#38bdf8] via-[#67e8f9] to-[#a5f3fc] shadow-[0_0_8px_#38bdf8]"
                  style={{ 
                    animation: 'loadingProgressBar 1.6s ease-in-out forwards',
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(12,35,64,0.6) 6px, rgba(12,35,64,0.6) 8px)'
                  }}
                />
              </div>

              {/* Tagline: Ride toward brighter days. */}
              <div className="font-pixel text-xs sm:text-sm text-white font-bold tracking-wider mt-3 pixel-shadow drop-shadow-[1px_1px_0_#0284c7]">
                Ride toward brighter days.
              </div>
            </div>

            {/* Bottom Cyclist Animation with 3 Trailing Ghosting Frames */}
            <div className="absolute bottom-6 left-0 right-0 h-16 flex items-end overflow-hidden pointer-events-none">
              {/* Bottom Road Horizon Line */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white border-b border-[#0c2340]" />

              {/* Main Cyclist + 3 Ghosting Motion Trails */}
              <div 
                className="absolute bottom-1 w-[220px] h-[50px] flex items-center justify-end"
                style={{
                  animation: 'rideAcrossLine 1.6s cubic-bezier(0.35, 0, 0.25, 1) forwards'
                }}
              >
                {/* Motion Trail 3 (Faintest, opacity 25%) */}
                <div 
                  className="w-[48px] h-[48px] opacity-25 -mr-4 filter blur-[0.5px]"
                  style={{
                    backgroundImage: `url('/assets/bike_ride_sheet.png')`,
                    backgroundSize: '192px 48px',
                    imageRendering: 'pixelated',
                    animation: 'bikePedalLoop 0.35s steps(4) infinite'
                  }}
                />

                {/* Motion Trail 2 (Medium, opacity 45%) */}
                <div 
                  className="w-[48px] h-[48px] opacity-45 -mr-4"
                  style={{
                    backgroundImage: `url('/assets/bike_ride_sheet.png')`,
                    backgroundSize: '192px 48px',
                    imageRendering: 'pixelated',
                    animation: 'bikePedalLoop 0.35s steps(4) infinite'
                  }}
                />

                {/* Motion Trail 1 (Closest, opacity 70%) */}
                <div 
                  className="w-[48px] h-[48px] opacity-70 -mr-4"
                  style={{
                    backgroundImage: `url('/assets/bike_ride_sheet.png')`,
                    backgroundSize: '192px 48px',
                    imageRendering: 'pixelated',
                    animation: 'bikePedalLoop 0.35s steps(4) infinite'
                  }}
                />

                {/* Main Full-Opacity Cyclist */}
                <div 
                  className="w-[48px] h-[48px] relative z-10"
                  style={{
                    backgroundImage: `url('/assets/bike_ride_sheet.png')`,
                    backgroundSize: '192px 48px',
                    imageRendering: 'pixelated',
                    animation: 'bikePedalLoop 0.35s steps(4) infinite'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Game Home / Welcome Screen: Overlay on Top of the Live Game World */}
        {currentView === 'welcome' && !isLoadingTransition && (
          <div className="absolute inset-0 z-20 flex items-center justify-center select-none animate-fadeIn overflow-hidden">
            {/* Subtle retro pixel scanline tint that lets the living GBA game scene breathe through */}
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            {/* Top-Right Sound Icon Button */}
            <button
              onClick={() => useWorldStore.getState().toggleSound()}
              className="absolute top-3 right-3 px-2 py-1 gba-pixel-btn-secondary text-[10px] font-pixel flex items-center gap-1 cursor-pointer z-30"
              title="切换声音"
            >
              <PixelSpeaker className="w-3.5 h-3.5" />
              <span>SOUND</span>
            </button>

            {/* Center Hero Title Card (Authentic GBA 16-Bit Style) */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-[480px]">
              
              {/* MARC ISLAND Title + Palm Tree */}
              <div className="flex flex-col items-center mb-5">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-['Press_Start_2P',monospace] text-2xl sm:text-3xl text-white tracking-widest pixel-shadow drop-shadow-[3px_3px_0_#0284c7]">
                    MARC ISLAND
                  </h1>
                  <PixelPalmTree className="w-8 h-8 -mt-2 drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]" />
                </div>
              </div>

              {/* Action Buttons: START GAME [J] and VIEW RESUME [K] (Mario / GBA Pixel Style) */}
              <div className="flex flex-col items-center space-y-2.5 w-full max-w-[260px]">
                {/* START GAME Button */}
                <button
                  onClick={handleStartGame}
                  onMouseEnter={() => pixelSound.playSelect()}
                  className="w-full py-2.5 px-3 gba-pixel-btn-secondary flex items-center justify-between cursor-pointer group rounded-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-[#0284c7] text-white font-['Press_Start_2P',monospace] text-[9px] flex items-center justify-center font-bold border border-[#0c2340] rounded-xs">
                      J
                    </span>
                    <span className="font-['Press_Start_2P',monospace] text-[10px] font-bold tracking-wider text-[#0c2340]">
                      START GAME
                    </span>
                  </div>
                  <span className="font-pixel text-xs text-[#0284c7] group-hover:translate-x-1 transition-transform">
                    ▶
                  </span>
                </button>

                {/* VIEW RESUME Button */}
                <button
                  onClick={() => {
                    pixelSound.playConfirm();
                    setCurrentView('info');
                  }}
                  onMouseEnter={() => pixelSound.playSelect()}
                  className="w-full py-2.5 px-3 gba-pixel-btn-primary flex items-center justify-between cursor-pointer group rounded-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-white text-[#0284c7] font-['Press_Start_2P',monospace] text-[9px] flex items-center justify-center font-bold border border-[#0c2340] rounded-xs">
                      K
                    </span>
                    <span className="font-['Press_Start_2P',monospace] text-[10px] font-bold tracking-wider text-white">
                      VIEW RESUME
                    </span>
                  </div>
                  <span className="font-pixel text-xs text-white group-hover:translate-x-1 transition-transform">
                    ▶
                  </span>
                </button>
              </div>

              {/* Bottom Keyboard Controls Hint */}
              <div className="mt-3 font-pixel text-[10px] text-white font-bold pixel-shadow-sm tracking-wider">
                [J] 开始游戏 · [K] 个人简历 · [A/D] 控制骑行
              </div>

            </div>
          </div>
        )}

        {/* 4. 5 Bespoke Landmark In-Screen Pixel Art Modals */}
        <WriteHouseModal />
        <MarcCinemaModal />
        <BrandMuseumModal />
        <ArcadeGameModal />
        <HobbyStudioModal />

        {/* 5. Summit Ending Celebration In-Screen Postcard */}
        <PostcardModal />

        {/* 6. "谢谢参观" Ending Modal after riding out of frame */}
        <EndingModal />
      </DeviceShell>

      {/* Case Study Full Overlay & Recruiter Views */}
      <PortfolioOverlay />
      <ProjectIndex />
      <InfoView />
    </div>
  );
};
