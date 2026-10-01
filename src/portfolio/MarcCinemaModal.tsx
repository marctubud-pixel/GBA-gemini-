import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { PORTFOLIO_PROJECTS } from '../data/projects';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { 
  PixelPalmTree, 
  PixelFilm, 
  PixelSeagull, 
  PixelLighthouse, 
  PixelTag 
} from '../shell/PixelIcons';

interface CinemaFilm {
  id: string;
  projectId?: string;
  title: string;
  enTitle: string;
  genre: string;
  releaseDate: string;
  duration: string;
  synopsis: string;
  thumbnailSvg: React.ReactNode;
}

const CINEMA_FILMS: CinemaFilm[] = [
  {
    id: 'film-summer',
    projectId: 'film-01',
    title: '海岸的夏天',
    enTitle: 'A SUMMER BY THE SEA',
    genre: '青春 / 治愈 / 剧情',
    releaseDate: '2023.07.14',
    duration: '118 分钟',
    synopsis: '关于一个夏天、一座海边小镇，和那段再也回不去却依然发光的时光。',
    thumbnailSvg: (
      <svg width="100%" height="100%" viewBox="0 0 140 76" className="w-full h-full object-cover" shapeRendering="crispEdges">
        <rect x="0" y="0" width="140" height="48" fill="#38bdf8" />
        <rect x="10" y="8" width="40" height="16" fill="#f8fafc" rx="4" />
        <rect x="18" y="4" width="24" height="8" fill="#ffffff" />
        <rect x="75" y="12" width="50" height="14" fill="#e0f2fe" rx="3" />
        <rect x="0" y="44" width="140" height="18" fill="#0284c7" />
        <rect x="0" y="56" width="140" height="8" fill="#0369a1" />
        <line x1="20" y1="48" x2="60" y2="48" stroke="#bae6fd" strokeWidth="2" />
        <line x1="80" y1="52" x2="120" y2="52" stroke="#bae6fd" strokeWidth="2" />
        <polygon points="65,64 95,28 140,64" fill="#16a34a" />
        <polygon points="80,64 100,34 135,64" fill="#15803d" />
        <rect x="100" y="16" width="8" height="24" fill="#ffffff" />
        <rect x="100" y="22" width="8" height="4" fill="#ef4444" />
        <rect x="98" y="14" width="12" height="3" fill="#0284c7" />
        <rect x="101" y="12" width="6" height="3" fill="#f59e0b" />
        <polygon points="50,76 80,64 140,76" fill="#fef08a" />
      </svg>
    )
  },
  {
    id: 'film-observatory',
    projectId: 'film-02',
    title: '海边星穹天文台',
    enTitle: 'THE SEASIDE OBSERVATORY',
    genre: '纪录 / 科幻 / 叙事',
    releaseDate: '2025.08.20',
    duration: '95 分钟',
    synopsis: '当小镇少年与山顶的天文台望远镜相遇，探索欲成为终生的精神锚点。',
    thumbnailSvg: (
      <svg width="100%" height="100%" viewBox="0 0 140 76" className="w-full h-full object-cover" shapeRendering="crispEdges">
        <rect x="0" y="0" width="140" height="52" fill="#0f172a" />
        <rect x="15" y="8" width="2" height="2" fill="#fef08a" />
        <rect x="45" y="16" width="2" height="2" fill="#f8fafc" />
        <rect x="90" y="10" width="3" height="3" fill="#fef08a" />
        <rect x="125" y="20" width="2" height="2" fill="#bae6fd" />
        <circle cx="115" cy="18" r="8" fill="#fef08a" />
        <circle cx="118" cy="18" r="7" fill="#0f172a" />
        <polygon points="0,76 60,35 140,76" fill="#1e293b" />
        <ellipse cx="65" cy="38" rx="14" ry="12" fill="#38bdf8" />
        <rect x="53" y="38" width="24" height="12" fill="#e2e8f0" />
        <rect x="63" y="28" width="4" height="14" fill="#0284c7" />
        <rect x="0" y="58" width="140" height="18" fill="#024269" />
      </svg>
    )
  },
  {
    id: 'film-arcade',
    projectId: 'film-03',
    title: '霓虹街机夏天',
    enTitle: 'NEON ARCADE MEMORIES',
    genre: '怀旧 / 像素 / 实验',
    releaseDate: '2025.04.18',
    duration: '82 分钟',
    synopsis: '把童年街机厅投币声与夏日蝉鸣编织成视听交响诗，无限续币的人生探险。',
    thumbnailSvg: (
      <svg width="100%" height="100%" viewBox="0 0 140 76" className="w-full h-full object-cover" shapeRendering="crispEdges">
        <rect x="0" y="0" width="140" height="20" fill="#701a75" />
        <rect x="0" y="20" width="140" height="20" fill="#be185d" />
        <rect x="0" y="40" width="140" height="16" fill="#f97316" />
        <rect x="0" y="56" width="140" height="20" fill="#1e1b4b" />
        <circle cx="70" cy="35" r="16" fill="#fef08a" />
        <line x1="54" y1="36" x2="86" y2="36" stroke="#f97316" strokeWidth="2" />
        <line x1="58" y1="41" x2="82" y2="41" stroke="#be185d" strokeWidth="2" />
        <polygon points="20,25 24,18 28,25" fill="#020617" />
        <rect x="23" y="25" width="2" height="35" fill="#020617" />
        <polygon points="120,28 124,20 128,28" fill="#020617" />
        <rect x="123" y="28" width="2" height="32" fill="#020617" />
      </svg>
    )
  }
];

/**
 * MarcCinemaModal.tsx
 * 
 * 1:1 AUTHENTIC PIXEL-ART REPLICATION OF MARC CINEMA
 * Reference: media_1790713160225.jpg
 * - Retro coastal marquee arch: Star peak, perched seagull, lighthouse on cliff, palm tree & film reel.
 * - Perforated movie ticket stub: 16:9 film art, Title, En-Title, Tags, Vintage ink stamp "Same Skies Brighter People".
 * - Lower film details board: [影片名称], [影片类型], [上映日期], [影片时长], [剧情简介], and typography waves art.
 * - Action buttons: [ ▶ 播放 ], [ 离开影院 ], [ 再看一部 ▶ ].
 */
export const MarcCinemaModal: React.FC = () => {
  const { activeLandmarkModal, closeLandmarkModal, openProjectOverlay } = useWorldStore();
  const isOpen = activeLandmarkModal === 'marc-cinema';

  const [filmIndex, setFilmIndex] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  const currentFilm = CINEMA_FILMS[filmIndex] || CINEMA_FILMS[0];

  const handlePrevFilm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    pixelSound.playSelect();
    setFilmIndex((prev) => (prev > 0 ? prev - 1 : CINEMA_FILMS.length - 1));
  };

  const handleNextFilm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    pixelSound.playSelect();
    setFilmIndex((prev) => (prev < CINEMA_FILMS.length - 1 ? prev + 1 : 0));
  };

  const handleClose = () => {
    pixelSound.playCancel();
    closeLandmarkModal();
    setIsPlayingPreview(false);
  };

  const handlePlayFilm = () => {
    pixelSound.playConfirm();
    setIsPlayingPreview(true);
  };

  const handleOpenDetailedCase = () => {
    pixelSound.playConfirm();
    const proj = PORTFOLIO_PROJECTS.find((p) => p.id === currentFilm.projectId) || PORTFOLIO_PROJECTS.find(p => p.locationId === 'marc-cinema');
    if (proj) {
      openProjectOverlay(proj);
    }
  };

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'k' || e.key === 'K') {
        if (isPlayingPreview) {
          setIsPlayingPreview(false);
        } else {
          handleClose();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePrevFilm();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleNextFilm();
      } else if (e.key === 'j' || e.key === 'J' || e.key === 'Enter') {
        handlePlayFilm();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isPlayingPreview]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center p-1 sm:p-2 bg-black/45 select-none animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="relative w-[96%] max-w-[710px] h-[95%] max-h-[390px] flex flex-col items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* TOP MARQUEE ARCH                                               */}
        {/* ============================================================== */}
        <div className="relative z-20 -mb-2 w-full flex flex-col items-center">
          
          <div className="relative px-6 sm:px-12 py-1 bg-[#1d4ed8] border-2 border-[#0c2340] border-b-0 rounded-t-xs shadow-[0_2px_0_#000] flex items-center gap-3">
            
            {/* Left: Palm tree & Film Reel */}
            <div className="flex items-center gap-1.5">
              <PixelPalmTree className="w-4 h-4 text-white" />
              <PixelFilm className="w-3.5 h-3.5 text-white" />
            </div>

            {/* Center Peak Star & Title */}
            <div className="text-center px-2 py-0.5">
              <h2 className="font-['Press_Start_2P',monospace] text-xs sm:text-sm text-white tracking-widest pixel-shadow drop-shadow-[2px_2px_0_#0c2340]">
                MARC CINEMA
              </h2>
            </div>

            {/* Right: Perched Seagull & Lighthouse on cliff */}
            <div className="flex items-center gap-1.5 pl-1">
              <PixelSeagull className="w-3.5 h-3.5 text-white" />
              <PixelLighthouse className="w-4 h-4 text-white" />
            </div>

            {/* Corner Close Button [ ✕ ] */}
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
        {/* MAIN CINEMA BOARD (GBA Pixel Frame)                            */}
        {/* ============================================================== */}
        <div className="relative w-full flex-1 gba-pixel-frame rounded-xs p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden">

          {/* ------------------------------------------------------------ */}
          {/* SECTION 1: PERFORATED CINEMA TICKET STUB                     */}
          {/* ------------------------------------------------------------ */}
          <div className="relative w-full my-1 flex items-center justify-between gap-1.5">
            
            {/* Left Ticket Switch Arrow ◀ */}
            <button
              onClick={handlePrevFilm}
              onMouseEnter={() => pixelSound.playSelect()}
              className="w-7 h-14 bg-white hover:bg-sky-50 text-[#0284c7] border-2 border-[#38bdf8] rounded-xs font-pixel text-sm font-bold flex items-center justify-center cursor-pointer transition active:scale-95 shadow-xs"
              title="上一个票根 (A / ◀)"
            >
              ◀
            </button>

            {/* The Ticket Body with Pixel Notch Cutouts */}
            <div className="relative flex-1 bg-[#fffdf7] border-2 border-[#cbd5e1] rounded-xs shadow-md p-2 flex items-center justify-between overflow-hidden">
              
              {/* Left & Right Pixel Notches */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-6 bg-[#1e40af] border-2 border-[#cbd5e1] rounded-xs" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-6 bg-[#1e40af] border-2 border-[#cbd5e1] rounded-xs" />

              <div className="flex items-center gap-3 w-full px-2">
                {/* Film Thumbnail Card */}
                <div className="w-28 sm:w-36 h-16 sm:h-18 rounded-xs border-2 border-sky-300 overflow-hidden bg-slate-900 shadow-inner shrink-0">
                  {currentFilm.thumbnailSvg}
                </div>

                {/* Ticket Text Info */}
                <div className="flex-1 space-y-1 pl-1">
                  <h3 className="font-pixel text-base sm:text-lg font-bold text-[#0f172a] tracking-wide">
                    {currentFilm.title}
                  </h3>
                  <div className="font-['Press_Start_2P',monospace] text-[7px] text-sky-600 font-bold">
                    {currentFilm.enTitle}
                  </div>
                  <div className="w-full border-t-2 border-slate-200 my-1" />
                  <div className="flex flex-wrap items-center gap-3 font-pixel text-[10px] text-slate-700 font-bold">
                    <span className="flex items-center gap-1.5"><PixelFilm className="w-3.5 h-3.5 text-sky-600" /> {currentFilm.genre}</span>
                    <span className="flex items-center gap-1.5"><PixelTag className="w-3.5 h-3.5 text-sky-600" /> {currentFilm.releaseDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Ticket Switch Arrow ▶ */}
            <button
              onClick={handleNextFilm}
              onMouseEnter={() => pixelSound.playSelect()}
              className="w-7 h-14 bg-white hover:bg-sky-50 text-[#0284c7] border-2 border-[#38bdf8] rounded-xs font-pixel text-sm font-bold flex items-center justify-center cursor-pointer transition active:scale-95 shadow-xs"
              title="下一个票根 (D / ▶)"
            >
              ▶
            </button>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* SECTION 2: FILM DETAILS DISPLAY BOARD                        */}
          {/* ------------------------------------------------------------ */}
          <div className="relative w-full bg-[#fdfbf7] border-2 border-[#cbd5e1] rounded-xs p-2.5 sm:p-3 shadow-inner flex items-center justify-between">
            {/* Metadata Rows */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm">
                <span className="px-2 py-0.5 bg-[#0284c7] text-white rounded-xs text-[10px] font-bold shrink-0">
                  影片名称
                </span>
                <span className="text-[#0f172a] font-bold">{currentFilm.title}</span>
              </div>

              <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm">
                <span className="px-2 py-0.5 bg-[#0284c7] text-white rounded-xs text-[10px] font-bold shrink-0">
                  影片类型
                </span>
                <span className="text-slate-700 font-bold">{currentFilm.genre}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm">
                  <span className="px-2 py-0.5 bg-[#0284c7] text-white rounded-xs text-[10px] font-bold shrink-0">
                    上映日期
                  </span>
                  <span className="text-slate-700 font-bold">{currentFilm.releaseDate}</span>
                </div>
                <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm">
                  <span className="px-2 py-0.5 bg-[#0284c7] text-white rounded-xs text-[10px] font-bold shrink-0">
                    影片时长
                  </span>
                  <span className="text-slate-700 font-bold">{currentFilm.duration}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 font-pixel text-xs sm:text-sm pt-0.5">
                <span className="px-2 py-0.5 bg-[#0284c7] text-white rounded-xs text-[10px] font-bold shrink-0">
                  剧情简介
                </span>
                <span className="text-slate-700 leading-snug line-clamp-2">
                  {currentFilm.synopsis}
                </span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* SECTION 3: ACTION BUTTONS BAR                                */}
          {/* ------------------------------------------------------------ */}
          <div className="flex items-center justify-between pt-1 gap-2">
            
            {/* Golden Play Button with 3D Bevel */}
            <button
              onClick={handlePlayFilm}
              onMouseEnter={() => pixelSound.playSelect()}
              className="flex-1 py-2 px-3 bg-gradient-to-b from-[#facc15] via-[#eab308] to-[#ca8a04] hover:from-[#fde047] hover:to-[#eab308] text-[#78350f] border-2 border-white rounded-xs font-pixel text-sm sm:text-base font-black flex items-center justify-center gap-2 shadow-[0_4px_0_#854d0e] cursor-pointer transition active:translate-y-1 active:shadow-[0_1px_0_#854d0e]"
            >
              <span className="text-base">▶</span>
              <span className="tracking-wider">播 放</span>
            </button>

            {/* Blue Exit Button */}
            <button
              onClick={handleClose}
              onMouseEnter={() => pixelSound.playSelect()}
              className="gba-pixel-btn-secondary py-2 px-5 text-white font-pixel text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
            >
              <span>离开影院</span>
            </button>

            {/* Blue Next Button */}
            <button
              onClick={handleNextFilm}
              onMouseEnter={() => pixelSound.playSelect()}
              className="gba-pixel-btn-primary py-2 px-5 text-white font-pixel text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
            >
              <span>再看一部 ▶</span>
            </button>
          </div>

        </div>

        {/* Bottom GBA In-Game Bar */}
        <div className="w-full mt-1.5 bg-[#0c2340] border-2 border-[#38bdf8] px-3 py-1 flex items-center justify-between text-[9px] font-pixel text-sky-200 rounded-xs shadow-[0_2px_0_#000]">
          <span className="font-bold text-white tracking-wider">MARC CINEMA | 海岸影院 / 选择票根放映作品</span>
          <span className="text-yellow-300 font-bold">[J] 播放 · [K] 关闭</span>
        </div>

      </div>

      {/* Embedded Film Preview Screen Modal */}
      {isPlayingPreview && (
        <div 
          className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsPlayingPreview(false)}
        >
          <div 
            className="relative w-full max-w-[540px] aspect-video bg-black border-4 border-[#38bdf8] rounded-xs overflow-hidden shadow-2xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
              {currentFilm.thumbnailSvg}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 bg-black/85 p-3 rounded-xs border-2 border-white/20 text-white flex items-center justify-between">
                <div>
                  <div className="font-pixel text-sm text-yellow-300 font-bold">{currentFilm.title}</div>
                  <div className="font-pixel text-[10px] text-slate-300 font-bold">{currentFilm.enTitle} · {currentFilm.duration}</div>
                </div>
                <button
                  onClick={handleOpenDetailedCase}
                  className="px-3 py-1.5 gba-pixel-btn-primary text-white rounded-xs font-pixel text-[10px] font-bold cursor-pointer"
                >
                  查看完整案例 ▶
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsPlayingPreview(false)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white font-pixel text-xs flex items-center justify-center hover:bg-red-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
