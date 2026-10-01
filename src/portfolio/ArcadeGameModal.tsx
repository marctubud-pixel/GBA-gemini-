import React, { useEffect, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { 
  PixelGamepad, 
  PixelPalmTree, 
  PixelSeagull, 
  PixelTag 
} from '../shell/PixelIcons';

interface GameRecord {
  id: string;
  title: string;
  hours: number;
  note: string;
  thumbnailSvg: React.ReactNode;
}

const GAME_RECORDS: GameRecord[] = [
  {
    id: 'stardew',
    title: 'Stardew Valley',
    hours: 320,
    note: '在星露谷的每一天都在耕耘生活的平静，最喜欢的季节是夏天的海风与蝉鸣。',
    thumbnailSvg: (
      <svg width="100%" height="100%" viewBox="0 0 80 40" shapeRendering="crispEdges">
        <rect x="0" y="0" width="80" height="24" fill="#38bdf8" />
        <rect x="10" y="4" width="20" height="8" fill="#ffffff" rx="2" />
        <rect x="0" y="24" width="80" height="16" fill="#22c55e" />
        <polygon points="50,26 65,12 80,26" fill="#15803d" />
        <rect x="62" y="24" width="6" height="12" fill="#78350f" />
        <line x1="8" y1="28" x2="40" y2="28" stroke="#fef08a" strokeWidth="2" />
        <line x1="16" y1="26" x2="16" y2="34" stroke="#fef08a" strokeWidth="2" />
        <line x1="32" y1="26" x2="32" y2="34" stroke="#fef08a" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'zelda',
    title: 'The Legend of Zelda',
    hours: 280,
    note: '海拉鲁大陆的旷野风声与探索欲，赋予了我对开放世界关卡设计的无尽灵感。',
    thumbnailSvg: (
      <svg width="100%" height="100%" viewBox="0 0 80 40" shapeRendering="crispEdges">
        <rect x="0" y="0" width="80" height="40" fill="#0284c7" />
        <polygon points="40,8 30,22 50,22" fill="#facc15" />
        <polygon points="30,22 20,36 40,36" fill="#facc15" />
        <polygon points="50,22 40,36 60,36" fill="#facc15" />
        <polygon points="40,22 35,32 45,32" fill="#0284c7" />
        <line x1="40" y1="4" x2="40" y2="38" stroke="#ffffff" strokeWidth="2" />
        <rect x="36" y="10" width="8" height="2" fill="#3b82f6" />
      </svg>
    )
  },
  {
    id: 'minecraft',
    title: 'Minecraft',
    hours: 265,
    note: '方块是思维的乐高，在这里搭建过自己的像素城堡与红石自动化工坊。',
    thumbnailSvg: (
      <svg width="100%" height="100%" viewBox="0 0 80 40" shapeRendering="crispEdges">
        <rect x="0" y="0" width="80" height="16" fill="#15803d" />
        <rect x="0" y="16" width="80" height="24" fill="#78350f" />
        <rect x="12" y="18" width="8" height="8" fill="#5c270a" />
        <rect x="36" y="24" width="8" height="8" fill="#92400e" />
        <rect x="60" y="20" width="8" height="8" fill="#5c270a" />
        <rect x="24" y="4" width="6" height="6" fill="#22c55e" />
        <rect x="52" y="6" width="6" height="6" fill="#4ade80" />
      </svg>
    )
  },
  {
    id: 'hollowknight',
    title: 'Hollow Knight',
    hours: 180,
    note: '圣巢的幽邃与悲壮，顶级的类银河恶魔城手感与氛围营造美学。',
    thumbnailSvg: (
      <svg width="100%" height="100%" viewBox="0 0 80 40" shapeRendering="crispEdges">
        <rect x="0" y="0" width="80" height="40" fill="#0f172a" />
        <ellipse cx="40" cy="22" rx="12" ry="14" fill="#ffffff" />
        <path d="M30,12 Q24,2 26,0 Q34,6 36,12" fill="#ffffff" />
        <path d="M50,12 Q56,2 54,0 Q46,6 44,12" fill="#ffffff" />
        <ellipse cx="35" cy="22" rx="3.5" ry="5.5" fill="#000000" />
        <ellipse cx="45" cy="22" rx="3.5" ry="5.5" fill="#000000" />
        <circle cx="40" cy="22" r="18" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
      </svg>
    )
  },
  {
    id: 'celeste',
    title: 'Celeste',
    hours: 95,
    note: '呼吸，踏上塞莱斯特山。每一万次死亡，都是学会接纳焦虑与自我对话。',
    thumbnailSvg: (
      <svg width="100%" height="100%" viewBox="0 0 80 40" shapeRendering="crispEdges">
        <rect x="0" y="0" width="80" height="40" fill="#1e1b4b" />
        <polygon points="40,6 10,40 70,40" fill="#3b82f6" />
        <polygon points="40,6 30,18 50,18" fill="#ffffff" />
        <ellipse cx="40" cy="24" rx="6" ry="7" fill="#ef4444" />
        <polygon points="32,24 24,18 30,22" fill="#fef08a" />
        <polygon points="48,24 56,18 50,22" fill="#fef08a" />
      </svg>
    )
  },
  {
    id: 'terraria',
    title: 'Terraria',
    hours: 90,
    note: '在像素地底挖掘至地狱，与好友并肩迎战克苏鲁之眼的难忘夏夜。',
    thumbnailSvg: (
      <svg width="100%" height="100%" viewBox="0 0 80 40" shapeRendering="crispEdges">
        <rect x="0" y="0" width="80" height="40" fill="#022c22" />
        <circle cx="64" cy="12" r="7" fill="#fef08a" />
        <circle cx="66" cy="11" r="6" fill="#022c22" />
        <polygon points="20,10 12,28 28,28" fill="#15803d" />
        <rect x="18" y="28" width="4" height="12" fill="#78350f" />
        <rect x="34" y="20" width="22" height="18" fill="#b45309" />
        <polygon points="30,20 45,10 60,20" fill="#78350f" />
        <rect x="42" y="24" width="6" height="6" fill="#fef08a" />
      </svg>
    )
  }
];

/**
 * ArcadeGameModal.tsx
 * 
 * 1:1 AUTHENTIC PIXEL-ART REPLICATION OF MY GAME (ARCADE)
 * Reference: media_1790713204512.jpg
 * - Retro gamepad header with palm tree, title "MY GAME", flying seagull & stacked game cartridges.
 * - Subheader: Controller icon, "游戏经历", right quote: "PLAY GAMES BE HAPPY" with palm tree.
 * - Scrollable Game Records List (Stardew, Zelda, Minecraft, Hollow Knight, Celeste, Terraria).
 * - Interactive game card selection with play notes.
 * - Starfish & seashell accents.
 */
export const ArcadeGameModal: React.FC = () => {
  const { activeLandmarkModal, closeLandmarkModal } = useWorldStore();
  const isOpen = activeLandmarkModal === 'arcade';

  const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null);

  const handleClose = () => {
    pixelSound.playCancel();
    closeLandmarkModal();
    setSelectedGame(null);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'k' || e.key === 'K') {
        if (selectedGame) {
          setSelectedGame(null);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, selectedGame]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center p-1 sm:p-2 bg-black/45 select-none animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="relative w-[96%] max-w-[690px] h-[95%] max-h-[390px] flex flex-col items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* TOP CONTROLLER & CARTRIDGE HEADER                              */}
        {/* ============================================================== */}
        <div className="relative z-20 -mb-2 w-full flex flex-col items-center">
          
          <div className="relative px-6 sm:px-12 py-1 bg-[#1d4ed8] border-2 border-[#0c2340] border-b-0 rounded-t-xs shadow-[0_2px_0_#000] flex items-center gap-3">
            
            {/* Left: Pixel Gamepad & Palm Tree */}
            <div className="flex items-center gap-1.5">
              <PixelGamepad className="w-4 h-4 text-white" />
              <PixelPalmTree className="w-4 h-4 text-white" />
            </div>

            {/* Center: Title "ARCADE" */}
            <div className="text-center px-2">
              <h2 className="font-['Press_Start_2P',monospace] text-xs sm:text-sm text-white tracking-widest pixel-shadow drop-shadow-[2px_2px_0_#0c2340]">
                ARCADE
              </h2>
            </div>

            {/* Right: Seagull & Stacked Cartridges (Blue, Red, Green) */}
            <div className="flex items-center gap-1 pl-1">
              <PixelSeagull className="w-3.5 h-3.5 text-white" />
              <div className="flex items-center -space-x-1">
                <span className="w-3 h-3.5 bg-[#38bdf8] border border-[#0c2340] rounded-xs shadow-xs" />
                <span className="w-3 h-3.5 bg-[#ef4444] border border-[#0c2340] rounded-xs shadow-xs" />
                <span className="w-3 h-3.5 bg-[#22c55e] border border-[#0c2340] rounded-xs shadow-xs" />
              </div>
            </div>

            {/* Close Button [ ✕ ] */}
            <button
              onClick={handleClose}
              onMouseEnter={() => pixelSound.playSelect()}
              className="absolute -top-1 -right-3 w-5 h-5 bg-[#ef4444] border border-[#0c2340] text-white font-pixel text-[10px] font-bold flex items-center justify-center hover:bg-red-600 transition shadow-[0_1px_0_#000] cursor-pointer rounded-xs"
              title="关闭 (K / ESC)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN GAME RECORDS BOARD (GBA Pixel Frame)                      */}
        {/* ============================================================== */}
        <div className="relative w-full flex-1 gba-pixel-frame rounded-xs p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden">
          
          {/* Subheader: Controller Icon + 游戏经历 */}
          <div className="flex items-center justify-between pb-1 px-1 border-b-2 border-[#0c2340]">
            <div className="flex items-center gap-1.5">
              <PixelGamepad className="w-4 h-4 text-yellow-300" />
              <h3 className="font-pixel text-sm sm:text-base font-bold text-white tracking-wide">
                游戏经历
              </h3>
            </div>
          </div>

          {/* Scrollable Records List */}
          <div className="relative flex-1 overflow-y-auto pr-1 my-1 space-y-1.5 max-h-[220px] custom-scrollbar">
            {GAME_RECORDS.map((game) => {
              const isSelected = selectedGame?.id === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => {
                    pixelSound.playSelect();
                    setSelectedGame(isSelected ? null : game);
                  }}
                  onMouseEnter={() => pixelSound.playSelect()}
                  className={`relative p-1.5 sm:p-2 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-50 border-[#0284c7] shadow-md scale-[1.01]'
                      : 'bg-[#fdfbf7] border-[#cbd5e1] hover:border-sky-300 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Game Box Art / Thumbnail */}
                    <div className="w-16 sm:w-20 h-9 sm:h-10 rounded-lg border border-sky-200 overflow-hidden bg-slate-900 shadow-inner shrink-0">
                      {game.thumbnailSvg}
                    </div>

                    {/* Game Title & Play Hours */}
                    <div>
                      <h4 className="font-['Press_Start_2P',monospace] text-[9px] sm:text-[10px] text-[#0f172a] font-bold">
                        {game.title}
                      </h4>
                      <div className="font-pixel text-xs sm:text-sm text-[#0284c7] font-bold mt-1 flex items-center gap-1.5">
                        <PixelTag className="w-3.5 h-3.5 text-sky-600" />
                        <span>游玩时间 {game.hours} 小时</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div className="flex items-center gap-1 pr-1 font-pixel text-xs text-slate-500 font-bold">
                    <span className="hidden sm:inline">心得感悟</span>
                    <span className="text-sky-600 font-bold">›</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom GBA In-Game Bar */}
        <div className="w-full mt-1.5 bg-[#0c2340] border-2 border-[#38bdf8] px-3 py-1 flex items-center justify-between text-[9px] font-pixel text-sky-200 rounded-xs shadow-[0_2px_0_#000]">
          <span className="font-bold text-white tracking-wider">ARCADE | 街机游戏厅</span>
          <span className="text-yellow-300 font-bold">[J] 查看 · [K] 关闭</span>
        </div>

      </div>

      {/* Selected Game Review Modal Pop-up */}
      {selectedGame && (
        <div 
          className="absolute inset-0 z-30 bg-black/75 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedGame(null)}
        >
          <div 
            className="w-full max-w-[420px] bg-[#fdfbf7] border-3 border-[#0284c7] rounded-xs p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-sky-200 pb-2">
              <div className="flex items-center gap-2">
                <PixelGamepad className="w-5 h-5 text-sky-600" />
                <span className="font-['Press_Start_2P',monospace] text-xs text-[#0f172a] font-bold">{selectedGame.title}</span>
              </div>
              <button 
                onClick={() => setSelectedGame(null)}
                className="w-6 h-6 rounded-xs bg-slate-200 text-slate-700 font-pixel text-xs font-bold flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="font-pixel text-sm text-[#0284c7] font-bold flex items-center gap-1.5">
              <PixelTag className="w-3.5 h-3.5 text-sky-600" />
              <span>累计游玩时间: {selectedGame.hours} 小时</span>
            </div>

            <p className="font-pixel text-xs sm:text-sm text-slate-800 leading-relaxed bg-sky-50 p-3 rounded-xs border border-sky-100 font-bold">
              "{selectedGame.note}"
            </p>

            <button
              onClick={() => setSelectedGame(null)}
              className="w-full py-2 gba-pixel-btn-primary text-white font-pixel text-xs sm:text-sm font-bold rounded-xs cursor-pointer"
            >
              返回游戏档案
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
