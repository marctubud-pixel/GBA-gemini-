import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { 
  PixelCamera, 
  PixelBook, 
  PixelDisc, 
  PixelGamepad, 
  PixelBike, 
  PixelFilm, 
  PixelRobot 
} from '../shell/PixelIcons';

interface HobbyItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  categoryTag: string;
  mainImageTitle: string;
  mainImageDescription: string;
}

const HOBBIES: HobbyItem[] = [
  {
    id: 'photo',
    name: 'Photography',
    icon: <PixelCamera className="w-3.5 h-3.5" />,
    categoryTag: 'PHOTOGRAPHY',
    mainImageTitle: '地中海海岸小镇 · 盛夏午后',
    mainImageDescription: '阳光倾泻在白石栏杆与九重葛花丛间，远方海面浮动着归航帆船的白影。'
  },
  {
    id: 'reading',
    name: 'Reading',
    icon: <PixelBook className="w-3.5 h-3.5" />,
    categoryTag: 'READING',
    mainImageTitle: '纸页里的远方 · 书海漫步',
    mainImageDescription: '收集关于建筑、设计、人类学与诗歌的独立出版物，在铅字间呼吸。'
  },
  {
    id: 'vinyl',
    name: 'Vinyl',
    icon: <PixelDisc className="w-3.5 h-3.5" />,
    categoryTag: 'VINYL',
    mainImageTitle: '黑胶回响 · 模拟时代的纯粹质感',
    mainImageDescription: 'City Pop、爵士与环境氛围音乐，唱针划过沟槽的轻微噼啪声是时间的纹理。'
  },
  {
    id: 'games',
    name: 'Games',
    icon: <PixelGamepad className="w-3.5 h-3.5" />,
    categoryTag: 'GAMES',
    mainImageTitle: '第九艺术 · 沉浸虚拟世界',
    mainImageDescription: '热衷像素艺术独立游戏与沉浸式模拟器，探寻交互与情感表达的交点。'
  },
  {
    id: 'cycling',
    name: 'Cycling',
    icon: <PixelBike className="w-3.5 h-3.5" />,
    categoryTag: 'CYCLING',
    mainImageTitle: '海滨骑行 · 25km/h的自由视角',
    mainImageDescription: '周末沿着海边公路踩动踏板，风与海平线是最好的治愈解药。'
  },
  {
    id: 'film',
    name: 'Film',
    icon: <PixelFilm className="w-3.5 h-3.5" />,
    categoryTag: 'FILM',
    mainImageTitle: '胶片记忆 · 24格每秒的真实',
    mainImageDescription: '用 135/120 胶片相机记录街道与光影，等待冲印显影时的未知惊喜。'
  },
  {
    id: 'figures',
    name: 'Figures',
    icon: <PixelRobot className="w-3.5 h-3.5" />,
    categoryTag: 'FIGURES',
    mainImageTitle: '潮玩手办 · 立体造型艺术',
    mainImageDescription: '收藏独具机械美感与艺术灵魂的原创机甲、小怪物与雕像手办。'
  }
];

/**
 * HobbyStudioModal.tsx
 * 
 * 1:1 AUTHENTIC PIXEL-ART REPLICATION OF HOBBY STUDIO (MY HOBBY)
 * Reference: media_1790713222490.jpg
 * - Window Header: "HOBBY STUDIO", "favorite things", pixel window buttons.
 * - Left 7-Hobby Sidebar: Photography, Reading, Vinyl, Games, Cycling, Film, Figures with active arrow.
 * - Right Showcase:
 *   - Category tag header and "X / 7" counter.
 *   - Panoramic Mediterranean coast pixel artwork and 3 thumbnail variants.
 *   - Desk Shelf: Monstera plant, 35mm camera, film roll, polaroids, stacked books (TRAVEL, NATURE, LIFE), ceramic pen holder.
 *   - Action Buttons: [ VIEW ], [ OPEN COLLECTION ], [ BACK ].
 */
export const HobbyStudioModal: React.FC = () => {
  const { activeLandmarkModal, closeLandmarkModal } = useWorldStore();
  const isOpen = activeLandmarkModal === 'my-hobby';

  const [activeHobbyIndex, setActiveHobbyIndex] = useState<number>(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState<boolean>(false);

  const currentHobby = HOBBIES[activeHobbyIndex] || HOBBIES[0];

  const handleSelectHobby = (index: number) => {
    pixelSound.playSelect();
    setActiveHobbyIndex(index);
    setSelectedPhotoIndex(0);
  };

  const handleClose = () => {
    pixelSound.playCancel();
    closeLandmarkModal();
    setIsPhotoZoomed(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'k' || e.key === 'K') {
        if (isPhotoZoomed) {
          setIsPhotoZoomed(false);
        } else {
          handleClose();
        }
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        pixelSound.playSelect();
        setActiveHobbyIndex((prev) => (prev > 0 ? prev - 1 : HOBBIES.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        pixelSound.playSelect();
        setActiveHobbyIndex((prev) => (prev < HOBBIES.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isPhotoZoomed]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center p-1 sm:p-2 bg-black/45 select-none animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="relative w-[96%] max-w-[730px] h-[95%] max-h-[390px] gba-pixel-frame rounded-xs p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* TOP WINDOW HEADER: MY HOBBY + favorite things                  */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#1d4ed8] border-b-2 border-[#0c2340] rounded-t-xs text-white">
          <div className="flex items-center gap-2.5">
            <h2 className="font-['Press_Start_2P',monospace] text-xs sm:text-sm tracking-wider text-white pixel-shadow">
              MY HOBBY
            </h2>
          </div>

          {/* 3 Retro OS Window Control Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border border-[#0c2340] bg-sky-400 rounded-xs shadow-xs" />
            <span className="w-3.5 h-3.5 border border-[#0c2340] bg-yellow-400 rounded-xs shadow-xs" />
            <button
              onClick={handleClose}
              onMouseEnter={() => pixelSound.playSelect()}
              className="w-4 h-4 border border-[#0c2340] bg-red-500 hover:bg-red-600 rounded-xs flex items-center justify-center text-white text-[10px] font-bold cursor-pointer shadow-xs"
              title="关闭 (K / ESC)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN BODY: 2-COLUMN STUDIO BINDER (GBA Pixel Window)           */}
        {/* ============================================================== */}
        <div className="relative flex-1 gba-pixel-window rounded-xs my-1 p-2 grid grid-cols-12 gap-2 overflow-hidden shadow-inner">
          
          {/* ------------------------------------------------------------ */}
          {/* LEFT COLUMN: 7 HOBBIES SIDEBAR (4 cols)                      */}
          {/* ------------------------------------------------------------ */}
          <div className="col-span-4 border-r border-slate-200 pr-1.5 flex flex-col justify-between space-y-1">
            {HOBBIES.map((hobby, idx) => {
              const isActive = activeHobbyIndex === idx;
              return (
                <button
                  key={hobby.id}
                  onClick={() => handleSelectHobby(idx)}
                  onMouseEnter={() => pixelSound.playSelect()}
                  className={`w-full py-1.5 px-2 rounded-lg border text-left font-pixel text-xs sm:text-sm flex items-center justify-between cursor-pointer transition ${
                    isActive
                      ? 'bg-[#0284c7] text-white border-[#38bdf8] shadow-[0_2px_0_#0369a1] font-bold'
                      : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {hobby.icon}
                    <span className="font-bold tracking-wide">{hobby.name}</span>
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    →
                  </span>
                </button>
              );
            })}
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT COLUMN: SHOWCASE & DESK SHELF (8 cols)                 */}
          {/* ------------------------------------------------------------ */}
          <div className="col-span-8 flex flex-col justify-between pl-1">
            
            {/* Top Showcase Header: Category Tag & Counter */}
            <div className="flex items-center justify-between pb-1 border-b border-sky-100">
              <div className="flex items-center gap-2">
                {currentHobby.icon}
                <span className="font-['Press_Start_2P',monospace] text-xs sm:text-sm text-[#0f172a] font-bold">
                  {currentHobby.categoryTag}
                </span>
              </div>
              <div className="font-pixel text-xs text-sky-700 font-bold tracking-widest">
                {activeHobbyIndex + 1} / {HOBBIES.length}
              </div>
            </div>

            {/* Middle Stage: Panoramic Photo & 3 Thumbnail Variants */}
            <div className="grid grid-cols-12 gap-1.5 my-1.5 items-stretch">
              {/* Main Panoramic Image (8 cols) */}
              <div 
                className="col-span-8 aspect-[16/10] rounded-lg border-2 border-sky-300 overflow-hidden bg-slate-900 shadow-md relative cursor-pointer group"
                onClick={() => setIsPhotoZoomed(true)}
              >
                <svg width="100%" height="100%" viewBox="0 0 160 100" shapeRendering="crispEdges">
                  <rect x="0" y="0" width="160" height="55" fill="#38bdf8" />
                  <rect x="30" y="10" width="40" height="15" fill="#f8fafc" rx="4" />
                  <rect x="90" y="8" width="55" height="18" fill="#ffffff" rx="5" />
                  <rect x="0" y="55" width="160" height="25" fill="#0284c7" />
                  <line x1="20" y1="62" x2="60" y2="62" stroke="#bae6fd" strokeWidth="2" />
                  <polygon points="35,52 38,44 42,52" fill="#ffffff" />
                  <polygon points="50,56 53,48 57,56" fill="#ffffff" />
                  <polygon points="60,80 120,20 160,80" fill="#15803d" />
                  <rect x="95" y="42" width="16" height="14" fill="#ffffff" />
                  <polygon points="93,42 103,34 113,42" fill="#ea580c" />
                  <rect x="115" y="32" width="14" height="14" fill="#f8fafc" />
                  <polygon points="113,32 122,24 131,32" fill="#c2410c" />
                  <rect x="80" y="55" width="18" height="16" fill="#ffffff" />
                  <polygon points="78,55 89,46 100,55" fill="#ea580c" />
                  <rect x="70" y="68" width="25" height="8" fill="#ec4899" />
                  <rect x="110" y="56" width="30" height="10" fill="#f43f5e" />
                  <rect x="0" y="78" width="160" height="4" fill="#f1f5f9" />
                  <rect x="15" y="78" width="5" height="22" fill="#e2e8f0" />
                  <rect x="45" y="78" width="5" height="22" fill="#e2e8f0" />
                  <rect x="75" y="78" width="5" height="22" fill="#e2e8f0" />
                  <rect x="105" y="78" width="5" height="22" fill="#e2e8f0" />
                  <rect x="135" y="78" width="5" height="22" fill="#e2e8f0" />
                  <rect x="0" y="82" width="160" height="18" fill="#cbd5e1" />
                  <line x1="125" y1="52" x2="125" y2="88" stroke="#1e293b" strokeWidth="2" />
                  <rect x="122" y="48" width="6" height="6" fill="#fef08a" />
                  <polygon points="121,48 125,44 129,48" fill="#0f172a" />
                </svg>

                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white rounded-xs text-[8px] font-pixel opacity-0 group-hover:opacity-100 transition font-bold">
                  点击放大 [VIEW]
                </div>
              </div>

              {/* 3 Right Thumbnail Cards (4 cols) */}
              <div className="col-span-4 flex flex-col justify-between gap-1">
                {[
                  { id: 0, label: 'Mount Fuji Lake', color: 'from-[#38bdf8] to-[#0284c7]' },
                  { id: 1, label: 'Lamppost Street', color: 'from-[#fbbf24] to-[#f97316]' },
                  { id: 2, label: 'Ocean Sunset', color: 'from-[#f43f5e] to-[#701a75]' }
                ].map((thumb) => (
                  <div
                    key={thumb.id}
                    onClick={() => {
                      pixelSound.playSelect();
                      setSelectedPhotoIndex(thumb.id);
                    }}
                    className={`h-7 sm:h-8 rounded-xs border-2 overflow-hidden cursor-pointer transition flex items-center justify-center p-0.5 ${
                      selectedPhotoIndex === thumb.id
                        ? 'border-[#0284c7] shadow-xs scale-102 ring-1 ring-sky-300'
                        : 'border-slate-300 hover:border-sky-400'
                    }`}
                  >
                    <div className={`w-full h-full bg-gradient-to-r ${thumb.color} rounded-xs flex items-center justify-center text-[8px] font-pixel text-white font-bold drop-shadow-xs`}>
                      {thumb.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Buttons: VIEW, OPEN COLLECTION, BACK */}
            <div className="flex items-center justify-between gap-1.5 pt-2 border-t-2 border-slate-200">
              <button
                onClick={() => {
                  pixelSound.playConfirm();
                  setIsPhotoZoomed(true);
                }}
                onMouseEnter={() => pixelSound.playSelect()}
                className="flex-1 py-1.5 px-2 gba-pixel-btn-primary text-white rounded-xs font-pixel text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95"
              >
                <span className="text-[9px]">▶</span>
                <span>VIEW</span>
              </button>

              <button
                onClick={() => {
                  pixelSound.playConfirm();
                  setIsPhotoZoomed(true);
                }}
                onMouseEnter={() => pixelSound.playSelect()}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-sky-50 text-[#0284c7] border border-[#38bdf8] rounded-xs font-pixel text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95"
              >
                <span className="text-[9px]">▶</span>
                <span>OPEN COLLECTION</span>
              </button>

              <button
                onClick={handleClose}
                onMouseEnter={() => pixelSound.playSelect()}
                className="py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xs font-pixel text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95"
              >
                <span>←</span>
                <span>BACK</span>
              </button>
            </div>

          </div>

        </div>

        {/* Bottom GBA In-Game Bar */}
        <div className="w-full mt-1.5 bg-[#0c2340] border-2 border-[#38bdf8] px-3 py-1 flex items-center justify-between text-[9px] font-pixel text-sky-200 rounded-xs shadow-[0_2px_0_#000]">
          <span className="font-bold text-white tracking-wider">MY HOBBY | 个人爱好与收藏展柜</span>
          <span className="text-yellow-300 font-bold">[J] 查看 · [K] 关闭</span>
        </div>

      </div>

      {/* High-Res Photo Zoom Modal */}
      {isPhotoZoomed && (
        <div 
          className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsPhotoZoomed(false)}
        >
          <div 
            className="relative w-full max-w-[560px] bg-[#fdfbf7] border-3 border-[#0284c7] rounded-xs p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-sky-200 pb-2">
              <div className="flex items-center gap-2">
                {currentHobby.icon}
                <span className="font-['Press_Start_2P',monospace] text-xs text-[#0f172a] font-bold">{currentHobby.mainImageTitle}</span>
              </div>
              <button 
                onClick={() => setIsPhotoZoomed(false)}
                className="w-6 h-6 rounded-xs bg-slate-200 text-slate-700 font-pixel text-xs font-bold flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="w-full aspect-[16/9] rounded-xs overflow-hidden border-2 border-sky-300 bg-slate-900 shadow-md">
              <svg width="100%" height="100%" viewBox="0 0 160 100" shapeRendering="crispEdges">
                <rect x="0" y="0" width="160" height="55" fill="#38bdf8" />
                <rect x="30" y="10" width="40" height="15" fill="#f8fafc" rx="4" />
                <rect x="90" y="8" width="55" height="18" fill="#ffffff" rx="5" />
                <rect x="0" y="55" width="160" height="25" fill="#0284c7" />
                <line x1="20" y1="62" x2="60" y2="62" stroke="#bae6fd" strokeWidth="2" />
                <polygon points="35,52 38,44 42,52" fill="#ffffff" />
                <polygon points="50,56 53,48 57,56" fill="#ffffff" />
                <polygon points="60,80 120,20 160,80" fill="#15803d" />
                <rect x="95" y="42" width="16" height="14" fill="#ffffff" />
                <polygon points="93,42 103,34 113,42" fill="#ea580c" />
                <rect x="115" y="32" width="14" height="14" fill="#f8fafc" />
                <polygon points="113,32 122,24 131,32" fill="#c2410c" />
                <rect x="80" y="55" width="18" height="16" fill="#ffffff" />
                <polygon points="78,55 89,46 100,55" fill="#ea580c" />
                <rect x="70" y="68" width="25" height="8" fill="#ec4899" />
                <rect x="110" y="56" width="30" height="10" fill="#f43f5e" />
                <rect x="0" y="78" width="160" height="4" fill="#f1f5f9" />
                <rect x="15" y="78" width="5" height="22" fill="#e2e8f0" />
                <rect x="45" y="78" width="5" height="22" fill="#e2e8f0" />
                <rect x="75" y="78" width="5" height="22" fill="#e2e8f0" />
                <rect x="105" y="78" width="5" height="22" fill="#e2e8f0" />
                <rect x="135" y="78" width="5" height="22" fill="#e2e8f0" />
                <rect x="0" y="82" width="160" height="18" fill="#cbd5e1" />
                <line x1="125" y1="52" x2="125" y2="88" stroke="#1e293b" strokeWidth="2" />
                <rect x="122" y="48" width="6" height="6" fill="#fef08a" />
                <polygon points="121,48 125,44 129,48" fill="#0f172a" />
              </svg>
            </div>

            <p className="font-pixel text-xs sm:text-sm text-slate-800 leading-relaxed bg-sky-50 p-3 rounded-xs border border-sky-100 font-bold">
              {currentHobby.mainImageDescription}
            </p>

            <button
              onClick={() => setIsPhotoZoomed(false)}
              className="w-full py-2 gba-pixel-btn-primary text-white font-pixel text-xs sm:text-sm font-bold rounded-xs cursor-pointer"
            >
              返回展柜
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
