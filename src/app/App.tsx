import React, { useEffect, useRef } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { createGame } from '../game/Game';
import { DeviceShell } from '../shell/DeviceShell';
import { PortfolioOverlay } from '../portfolio/PortfolioOverlay';
import { ProjectIndex } from '../portfolio/ProjectIndex';
import { InfoView } from '../portfolio/InfoView';
import { Bike, Play, Compass, User, Sparkles, ChevronRight } from 'lucide-react';
import Phaser from 'phaser';

export const App: React.FC = () => {
  const { currentView, setCurrentView } = useWorldStore();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0d131a]">
      {/* 1. Phaser Game Viewport (Always active in DOM so state persists) */}
      <DeviceShell>
        <div 
          ref={gameContainerRef} 
          id="phaser-container" 
          className="w-full h-full flex items-center justify-center"
        />
      </DeviceShell>

      {/* 2. Welcome Title Screen (Overlay when currentView === 'welcome') */}
      {currentView === 'welcome' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
          <div className="max-w-xl w-full bg-slate-900/95 border-2 border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center text-white space-y-6 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Pixel Logo & Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GBA-INSPIRED PLAYABLE PORTFOLIO</span>
            </div>

            {/* Main Title */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-sky-300 via-teal-200 to-amber-200 bg-clip-text text-transparent font-['Plus_Jakarta_Sans']">
                MY WORLD
              </h1>
              <div className="text-xs sm:text-sm font-bold tracking-widest text-slate-400 font-mono">
                RIDE · EXPLORE · CREATE
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              欢迎来到我的个人创作世界。骑上一辆自行车，在沿海小镇与山丘间漫游，探索影像、品牌、游戏原型与创作手记。
            </p>

            {/* Key Journey Landmarks Preview */}
            <div className="py-3 px-4 rounded-xl bg-slate-800/60 border border-white/5 text-[11px] text-slate-400 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="block text-sky-400 font-bold font-mono">01-06</span>
                <span>Main Town</span>
              </div>
              <div>
                <span className="block text-amber-400 font-bold font-mono">07-08</span>
                <span>Interest Area</span>
              </div>
              <div>
                <span className="block text-teal-400 font-bold font-mono">09-10</span>
                <span>Future Hill</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCurrentView('game');
                  setTimeout(() => {
                    window.focus();
                    const canvas = document.querySelector('canvas');
                    if (canvas) canvas.focus();
                  }, 50);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/25 transition-all duration-150 flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
              >
                <Bike className="w-5 h-5 group-hover:animate-bounce" />
                <span>进入世界 (Start Ride)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentView('index')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Compass className="w-4 h-4 text-slate-400" />
                <span>作品索引 (Index)</span>
              </button>
            </div>

            {/* Controls Guide */}
            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              操作提示：<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">A / D</kbd> 骑行 · <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">E</kbd> 停车/互动
            </div>
          </div>
        </div>
      )}

      {/* 3. Portfolio Case Study Overlay */}
      <PortfolioOverlay />

      {/* 4. Recruiter Project Index */}
      <ProjectIndex />

      {/* 5. Creator Info / Profile View */}
      <InfoView />
    </div>
  );
};
