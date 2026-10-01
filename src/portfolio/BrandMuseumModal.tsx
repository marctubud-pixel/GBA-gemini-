import React, { useEffect, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { PORTFOLIO_PROJECTS } from '../data/projects';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { 
  PixelSeagull, 
  PixelPalette, 
  PixelTag, 
  PixelCart, 
  PixelShell, 
  PixelLighthouse 
} from '../shell/PixelIcons';

interface BrandPanelItem {
  id: string;
  categoryTitle: string;
  categoryIcon: React.ReactNode;
  slogan: string;
  projectId: string;
  illustrationSvg: React.ReactNode;
}

const BRAND_PANELS: BrandPanelItem[] = [
  {
    id: 'ip',
    categoryTitle: 'IP',
    categoryIcon: <PixelSeagull className="w-4 h-4 text-[#0369a1]" />,
    slogan: '让角色成为品牌的好朋友。',
    projectId: 'brand-01',
    illustrationSvg: (
      <svg width="100%" height="100%" viewBox="0 0 100 80" shapeRendering="crispEdges">
        <rect x="0" y="0" width="100" height="48" fill="#38bdf8" />
        <rect x="0" y="48" width="100" height="16" fill="#0284c7" />
        <rect x="0" y="64" width="100" height="16" fill="#0369a1" />
        <line x1="10" y1="52" x2="40" y2="52" stroke="#bae6fd" strokeWidth="2" />
        <line x1="60" y1="56" x2="90" y2="56" stroke="#bae6fd" strokeWidth="2" />
        <rect x="0" y="50" width="100" height="3" fill="#334155" />
        <rect x="15" y="50" width="4" height="30" fill="#475569" />
        <rect x="80" y="50" width="4" height="30" fill="#475569" />
        {/* Sailor Mascot */}
        <ellipse cx="50" cy="22" rx="14" ry="5" fill="#ffffff" />
        <rect x="42" y="16" width="16" height="5" fill="#1e3a8a" />
        <rect x="46" y="17" width="8" height="3" fill="#f59e0b" />
        <ellipse cx="50" cy="34" rx="16" ry="14" fill="#ffffff" />
        <circle cx="43" cy="32" r="2.5" fill="#0f172a" />
        <circle cx="57" cy="32" r="2.5" fill="#0f172a" />
        <ellipse cx="40" cy="36" rx="3" ry="1.5" fill="#fca5a5" />
        <ellipse cx="60" cy="36" rx="3" ry="1.5" fill="#fca5a5" />
        <polygon points="46,35 54,35 50,40" fill="#f59e0b" />
        <path d="M40,44 Q50,48 60,44" stroke="#1d4ed8" strokeWidth="4" fill="none" />
        <polygon points="47,46 53,46 50,54" fill="#1d4ed8" />
        <text x="16" y="32" fill="#fef08a" fontSize="12" fontWeight="bold">✦</text>
      </svg>
    )
  },
  {
    id: 'art',
    categoryTitle: '艺术',
    categoryIcon: <PixelPalette className="w-4 h-4 text-[#0369a1]" />,
    slogan: '用视觉表达更大的想象。',
    projectId: 'brand-02',
    illustrationSvg: (
      <svg width="100%" height="100%" viewBox="0 0 100 80" shapeRendering="crispEdges">
        <rect x="0" y="0" width="100" height="45" fill="#7dd3fc" />
        <rect x="0" y="45" width="100" height="20" fill="#0284c7" />
        <polygon points="6,24 16,12 26,24" fill="#15803d" />
        <rect x="14" y="24" width="4" height="46" fill="#78350f" />
        {/* Easel */}
        <line x1="50" y1="20" x2="50" y2="76" stroke="#b45309" strokeWidth="3" />
        <line x1="50" y1="20" x2="28" y2="76" stroke="#d97706" strokeWidth="3.5" />
        <line x1="50" y1="20" x2="72" y2="76" stroke="#d97706" strokeWidth="3.5" />
        <rect x="32" y="26" width="36" height="30" fill="#ffffff" stroke="#92400e" strokeWidth="2" rx="1" />
        <rect x="34" y="28" width="32" height="15" fill="#38bdf8" />
        <polygon points="42,43 50,34 58,43" fill="#16a34a" />
        <rect x="34" y="43" width="32" height="11" fill="#0284c7" />
        <rect x="26" y="56" width="48" height="4" fill="#92400e" rx="1" />
      </svg>
    )
  },
  {
    id: 'brand',
    categoryTitle: '品牌',
    categoryIcon: <PixelTag className="w-4 h-4 text-[#0369a1]" />,
    slogan: '从策略到视觉塑造品牌价值。',
    projectId: 'brand-01',
    illustrationSvg: (
      <svg width="100%" height="100%" viewBox="0 0 100 80" shapeRendering="crispEdges">
        <rect x="0" y="0" width="100" height="40" fill="#60a5fa" />
        <rect x="0" y="40" width="100" height="22" fill="#0369a1" />
        <polygon points="10,80 25,58 75,58 90,80" fill="#d97706" />
        <polygon points="25,58 75,58 72,55 28,55" fill="#b45309" />
        <polygon points="36,40 64,40 74,48 46,48" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <polygon points="36,40 46,48 46,68 36,60" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        <polygon points="46,48 74,48 74,68 46,68" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        <ellipse cx="60" cy="56" rx="6" ry="4" fill="#0284c7" />
        <path d="M56,56 Q60,53 64,56" stroke="#ffffff" strokeWidth="1.5" fill="none" />
        <text x="50" y="66" fill="#0f172a" fontSize="6" fontWeight="bold" fontFamily="monospace">BRAND</text>
      </svg>
    )
  },
  {
    id: 'ecommerce',
    categoryTitle: '电商',
    categoryIcon: <PixelCart className="w-4 h-4 text-[#0369a1]" />,
    slogan: '用好看的设计带来真实的声音。',
    projectId: 'writing-01',
    illustrationSvg: (
      <svg width="100%" height="100%" viewBox="0 0 100 80" shapeRendering="crispEdges">
        <rect x="0" y="0" width="100" height="45" fill="#38bdf8" />
        <rect x="0" y="45" width="100" height="20" fill="#0284c7" />
        <polygon points="8,26 16,14 24,26" fill="#16a34a" />
        <rect x="15" y="26" width="3" height="40" fill="#78350f" />
        <rect x="26" y="22" width="48" height="34" fill="#0f172a" stroke="#64748b" strokeWidth="2" rx="2" />
        <rect x="29" y="25" width="42" height="28" fill="#ffffff" />
        <rect x="29" y="25" width="42" height="8" fill="#0284c7" />
        <line x1="34" y1="25" x2="34" y2="33" stroke="#ffffff" strokeWidth="2" />
        <line x1="42" y1="25" x2="42" y2="33" stroke="#ffffff" strokeWidth="2" />
        <line x1="50" y1="25" x2="50" y2="33" stroke="#ffffff" strokeWidth="2" />
        <line x1="58" y1="25" x2="58" y2="33" stroke="#ffffff" strokeWidth="2" />
        {/* Pixel Mini Shopping Cart */}
        <rect x="42" y="38" width="16" height="10" fill="#0284c7" />
        <rect x="44" y="40" width="12" height="6" fill="#bae6fd" />
        <rect x="40" y="36" width="3" height="3" fill="#0284c7" />
        <rect x="45" y="49" width="3" height="3" fill="#0f172a" />
        <rect x="53" y="49" width="3" height="3" fill="#0f172a" />
        <polygon points="20,62 80,62 84,66 16,66" fill="#94a3b8" />
        <rect x="44" y="63" width="12" height="2" fill="#cbd5e1" rx="0.5" />
      </svg>
    )
  }
];

/**
 * BrandMuseumModal.tsx
 * 
 * 1:1 AUTHENTIC PIXEL-ART REPLICATION OF BRAND & VISUAL
 * Reference: media_1790713178475.jpg
 * - Arch crest with pink pearl seashell, perched seagull, lighthouse on cliff.
 * - Title: "✦ BRAND & VISUAL ✦" and subtitle: "✦ 让品牌具象化 ✦".
 * - 4-fold accordion exhibition panels: IP, 艺术, 品牌, 电商 with slogans and [查看案例 ▶] buttons.
 * - Bottom coastal beach with rolling waves, pink starfish, and pearl oyster.
 * - Bottom slogan: "— 视觉需要策略 —".
 */
export const BrandMuseumModal: React.FC = () => {
  const { activeLandmarkModal, closeLandmarkModal, openProjectOverlay } = useWorldStore();
  const isOpen = activeLandmarkModal === 'brand-museum';

  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);

  const handleClose = () => {
    pixelSound.playCancel();
    closeLandmarkModal();
  };

  const handleOpenCase = (projectId: string) => {
    pixelSound.playConfirm();
    const proj = PORTFOLIO_PROJECTS.find((p) => p.id === projectId) || PORTFOLIO_PROJECTS.find(p => p.locationId === 'brand-museum');
    if (proj) {
      openProjectOverlay(proj);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'k' || e.key === 'K') {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center p-1 sm:p-2 bg-black/45 select-none animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="relative w-[96%] max-w-[720px] h-[95%] max-h-[390px] flex flex-col items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* TOP SHELL ARCH HEADER                                          */}
        {/* ============================================================== */}
        <div className="relative z-20 -mb-2 w-full flex flex-col items-center">
          
          <div className="relative px-6 sm:px-12 py-1 bg-[#1d4ed8] border-2 border-[#0c2340] border-b-0 rounded-t-xs shadow-[0_2px_0_#000] flex items-center gap-3">
            
            {/* Top Pink Pearl Seashell Crest */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-xs bg-[#f472b6] border-2 border-white flex items-center justify-center shadow-md">
              <PixelShell className="w-4 h-4 text-white" />
            </div>

            {/* Left: Perched Seagull */}
            <div className="flex items-center gap-1 opacity-90 pr-1">
              <PixelSeagull className="w-4 h-4 text-white" />
            </div>

            {/* Center: Title */}
            <div className="text-center px-2 py-0.5">
              <h2 className="font-['Press_Start_2P',monospace] text-xs sm:text-sm text-white tracking-widest pixel-shadow drop-shadow-[2px_2px_0_#0c2340]">
                BRAND MUSEUM
              </h2>
            </div>

            {/* Right: Lighthouse on Cliff */}
            <div className="flex items-center gap-1 opacity-90 pl-1">
              <PixelLighthouse className="w-4 h-4 text-white" />
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
        {/* 4-FOLD ACCORDION SCREEN FRAME (GBA Pixel Frame)                */}
        {/* ============================================================== */}
        <div className="relative w-full flex-1 gba-pixel-frame rounded-xs p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden">
          
          {/* Main 4-Fold Grid */}
          <div className="relative w-full flex-1 grid grid-cols-4 gap-1.5 sm:gap-2 my-auto">
            {BRAND_PANELS.map((panel) => {
              const isHovered = hoveredPanel === panel.id;
              return (
                <div
                  key={panel.id}
                  onMouseEnter={() => {
                    pixelSound.playSelect();
                    setHoveredPanel(panel.id);
                  }}
                  onMouseLeave={() => setHoveredPanel(null)}
                  className={`relative bg-[#fdfbf7] border-2 rounded-xs p-1.5 sm:p-2 flex flex-col justify-between transition-all duration-150 shadow-sm ${
                    isHovered
                      ? 'border-[#38bdf8] scale-[1.02] shadow-md bg-white'
                      : 'border-[#cbd5e1] hover:border-sky-300'
                  }`}
                >
                  {/* Panel Top Badge: Icon + Category Name */}
                  <div className="flex items-center justify-center gap-1.5 pb-1 border-b border-sky-100">
                    {panel.categoryIcon}
                    <span className="font-pixel text-sm sm:text-base font-bold text-[#0369a1] tracking-wide">
                      {panel.categoryTitle}
                    </span>
                  </div>

                  {/* Artwork Illustration Card */}
                  <div className="relative w-full aspect-[4/3] rounded-xs border border-sky-200 overflow-hidden bg-sky-50 shadow-inner my-1">
                    {panel.illustrationSvg}
                  </div>

                  {/* Slogan Text */}
                  <div className="text-center px-0.5 min-h-[36px] flex items-center justify-center">
                    <p className="font-pixel text-[10px] sm:text-xs text-slate-800 leading-snug line-clamp-2 font-bold">
                      {panel.slogan}
                    </p>
                  </div>

                  {/* Button: 查看案例 ▶ */}
                  <button
                    onClick={() => handleOpenCase(panel.projectId)}
                    className="w-full py-1.5 px-2 bg-[#0284c7] hover:bg-[#0369a1] text-white border border-[#38bdf8] rounded-xs font-pixel text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition active:scale-95 mt-1 font-bold"
                  >
                    <span>查看案例</span>
                    <span className="text-[9px]">▶</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom GBA In-Game Bar */}
        <div className="w-full mt-1.5 bg-[#0c2340] border-2 border-[#38bdf8] px-3 py-1 flex items-center justify-between text-[9px] font-pixel text-sky-200 rounded-xs shadow-[0_2px_0_#000]">
          <span className="font-bold text-white tracking-wider">BRAND MUSEUM | 品牌展馆</span>
          <span className="text-yellow-300 font-bold">[J] 查看 · [K] 关闭</span>
        </div>

      </div>
    </div>
  );
};
