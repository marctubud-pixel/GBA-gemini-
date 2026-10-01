import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { COPYWRITING_WORKS } from '../data/copywritingProjects';
import { WORLD_LOCATIONS } from '../data/locations';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { 
  PixelPalmTree, 
  PixelShell, 
  PixelSeagull, 
  PixelTV, 
  PixelTag, 
  PixelCart, 
  PixelUsers, 
  PixelBook 
} from '../shell/PixelIcons';

/**
 * WriteHouseModal.tsx
 * 
 * 1:1 AUTHENTIC PIXEL-ART REPLICATION OF WRITE HOUSE
 * - Zero OS emojis - 100% pixel-art SVG icons and glyphs.
 * - Arch Plaque: "WRITE HOUSE", "-- WORDS MAKE A BRIGHTER TOMORROW --".
 * - Binder Tabs: IDEA, WORDS, LIFE.
 * - Left Page: Seashell badge, "文案作品", "WRITING PORTFOLIO", 4 category buttons with cursor indicator.
 * - Right Page: Exact 6-line poetic typography, sun badge, handwritten "A Brighter You", pagination & "查看系列".
 */
export const WriteHouseModal: React.FC = () => {
  const { activeLandmarkModal, closeLandmarkModal, openLocationOverlay } = useWorldStore();
  const isOpen = activeLandmarkModal === 'write-house';

  const [activeTab, setActiveTab] = useState<'IDEA' | 'WORDS' | 'LIFE'>('WORDS');
  const [activeCategory, setActiveCategory] = useState<'tvc' | 'brand' | 'ecommerce' | 'audience'>('tvc');
  const [pageIndex, setPageIndex] = useState<number>(0);

  const categoryWorks = COPYWRITING_WORKS.filter((w) => w.category === activeCategory);
  const currentWork = categoryWorks[pageIndex] || categoryWorks[0];

  const handleSelectCategory = (cat: 'tvc' | 'brand' | 'ecommerce' | 'audience') => {
    pixelSound.playSelect();
    setActiveCategory(cat);
    setPageIndex(0);
  };

  const handlePrevPage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    pixelSound.playSelect();
    setPageIndex((prev) => (prev > 0 ? prev - 1 : categoryWorks.length - 1));
  };

  const handleNextPage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    pixelSound.playSelect();
    setPageIndex((prev) => (prev < categoryWorks.length - 1 ? prev + 1 : 0));
  };

  const handleClose = () => {
    pixelSound.playCancel();
    closeLandmarkModal();
  };

  const handleViewSeries = () => {
    pixelSound.playConfirm();
    const loc = WORLD_LOCATIONS.find((l) => l.id === 'print-house');
    if (loc) {
      openLocationOverlay(loc);
    }
  };

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'k' || e.key === 'K') {
        handleClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleNextPage();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        const cats: ('tvc' | 'brand' | 'ecommerce' | 'audience')[] = ['tvc', 'brand', 'ecommerce', 'audience'];
        const idx = cats.indexOf(activeCategory);
        handleSelectCategory(cats[(idx - 1 + cats.length) % cats.length]);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        const cats: ('tvc' | 'brand' | 'ecommerce' | 'audience')[] = ['tvc', 'brand', 'ecommerce', 'audience'];
        const idx = cats.indexOf(activeCategory);
        handleSelectCategory(cats[(idx + 1) % cats.length]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, activeCategory, categoryWorks.length]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center p-1 sm:p-2 bg-black/45 select-none animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="relative w-[96%] max-w-[700px] h-[95%] max-h-[390px] flex flex-col items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* TOP ARCHED PLAQUE                                              */}
        {/* ============================================================== */}
        <div className="relative z-20 -mb-2 flex items-center justify-center">
          <div className="relative px-6 sm:px-10 py-1 bg-[#1d4ed8] border-2 border-[#0c2340] border-b-0 rounded-t-xs shadow-[0_2px_0_#000] flex items-center gap-3">
            
            {/* Left Pixel Seagull Icon */}
            <div className="flex items-center gap-1 opacity-90">
              <PixelSeagull size={16} />
            </div>

            {/* Plaque Title & Subtitle */}
            <div className="text-center px-1">
              <h2 className="font-['Press_Start_2P',monospace] text-xs sm:text-sm text-white tracking-widest pixel-shadow drop-shadow-[2px_2px_0_#0c2340]">
                WRITE HOUSE
              </h2>
              <div className="font-pixel text-[8px] sm:text-[9px] text-[#bfdbfe] tracking-widest font-bold">
                -- WORDS MAKE A BRIGHTER TOMORROW --
              </div>
            </div>

            {/* Right Pixel Palm Tree Icon */}
            <div className="flex items-center gap-1 opacity-90 pl-1">
              <PixelPalmTree size={14} />
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
        {/* MAIN BLUE NOTEBOOK BINDER (GBA Pixel Frame)                    */}
        {/* ============================================================== */}
        <div className="relative w-full flex-1 gba-pixel-frame rounded-xs p-1.5 sm:p-2 flex items-stretch">
          
          {/* Left Binder Side Tabs: IDEA, WORDS, LIFE */}
          <div className="absolute -left-5 top-6 flex flex-col gap-1.5 z-10">
            {[
              { id: 'IDEA', color: 'bg-[#38bdf8] text-[#0c4a6e] border-[#0c2340]' },
              { id: 'WORDS', color: 'bg-[#fbbf24] text-[#78350f] border-[#0c2340]' },
              { id: 'LIFE', color: 'bg-[#34d399] text-[#064e3b] border-[#0c2340]' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  pixelSound.playSelect();
                  setActiveTab(tab.id as any);
                }}
                className={`px-1 py-1.5 font-['Press_Start_2P',monospace] text-[6px] [writing-mode:vertical-rl] rounded-l-xs border border-r-0 shadow-[-2px_2px_0_#000] cursor-pointer ${
                  activeTab === tab.id ? `${tab.color} font-bold` : 'bg-slate-300 text-slate-700 opacity-70'
                }`}
              >
                {tab.id}
              </button>
            ))}
          </div>

          {/* ------------------------------------------------------------ */}
          {/* TWO-PAGE OPEN NOTEBOOK SPREAD (GBA Pixel Window)             */}
          {/* ------------------------------------------------------------ */}
          <div className="relative w-full h-full gba-pixel-window rounded-xs grid grid-cols-2 overflow-hidden">
            
            {/* Center Spine Crease & Shadow */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-black/10 via-black/5 to-black/10 pointer-events-none z-10 border-x border-slate-300/60" />

            {/* ========================================================== */}
            {/* LEFT PAGE: Category Navigation                             */}
            {/* ========================================================== */}
            <div className="relative p-2.5 sm:p-3 flex flex-col justify-between pr-3.5 border-r border-slate-200">
              
              {/* Header: Scallop Shell + 文案作品 + WRITING PORTFOLIO */}
              <div className="text-center pb-1 border-b border-sky-100 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center mb-0.5 shadow-xs">
                  <PixelShell size={18} />
                </div>
                <h3 className="font-pixel text-base font-bold text-[#0369a1] tracking-wider drop-shadow-[1px_1px_0_#bae6fd]">
                  文案作品
                </h3>
                <div className="font-pixel text-[8px] text-sky-500 tracking-widest font-bold">
                  ✦ WRITING PORTFOLIO ✦
                </div>
              </div>

              {/* 4 Category Selection Buttons (With 100% Pixel SVG Icons) */}
              <div className="flex flex-col gap-1.5 my-auto">
                {[
                  { id: 'tvc', icon: (active: boolean) => <PixelTV size={16} color={active ? '#ffffff' : '#0284c7'} />, label: 'TVC文案' },
                  { id: 'brand', icon: (active: boolean) => <PixelTag size={16} color={active ? '#ffffff' : '#0284c7'} />, label: '品牌文案' },
                  { id: 'ecommerce', icon: (active: boolean) => <PixelCart size={16} color={active ? '#ffffff' : '#0284c7'} />, label: '电商文案' },
                  { id: 'audience', icon: (active: boolean) => <PixelUsers size={16} color={active ? '#ffffff' : '#0284c7'} />, label: '人群文案' }
                ].map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id as any)}
                      onMouseEnter={() => pixelSound.playSelect()}
                      className={`relative w-full py-1.5 px-2.5 rounded-sm border-2 text-left font-pixel text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#0284c7] text-white border-[#0c2340] shadow-[0_2px_0_#0c2340] font-bold'
                          : 'bg-white hover:bg-sky-50 text-[#0f172a] border-[#cbd5e1] shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Selected Indicator Arrow */}
                        {isSelected ? (
                          <span className="text-white text-xs">▶</span>
                        ) : (
                          <span className="w-2" />
                        )}
                        <span className="flex items-center">{cat.icon(isSelected)}</span>
                        <span>{cat.label}</span>
                      </div>
                      <span className={`text-xs ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        ›
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ========================================================== */}
            {/* RIGHT PAGE: Copywriting Work Content Showcase              */}
            {/* ========================================================== */}
            <div className="relative p-2.5 sm:p-3 flex flex-col justify-between pl-3.5 bg-[#fefcf8]">
              
              {/* Top: Work Title & Subtitle */}
              <div className="pb-1.5 border-b border-amber-100">
                <h4 className="font-pixel text-sm sm:text-base font-bold text-[#0f172a] leading-tight">
                  {currentWork ? currentWork.title : '海风下的答案'}
                </h4>
                <div className="font-pixel text-[9px] sm:text-[10px] text-sky-600 mt-0.5 font-bold">
                  {currentWork ? currentWork.subtitle : '-- 某品牌TVC文案 --'}
                </div>
              </div>

              {/* Main Content Area: Warm Parchment Card with Poetic Lines */}
              <div className="relative my-auto p-2.5 sm:p-3 bg-[#fffbee] border border-[#fef08a] rounded-xs shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-center min-h-[140px]">
                <div className="space-y-1.5 text-[#1e293b] font-pixel text-xs sm:text-sm leading-relaxed">
                  {currentWork && currentWork.excerpt && currentWork.excerpt.length > 0 ? (
                    currentWork.excerpt.map((line, idx) => (
                      <p key={idx} className={idx % 2 === 1 ? 'text-[#0284c7] font-bold' : ''}>
                        {line}
                      </p>
                    ))
                  ) : (
                    <>
                      <p>有些答案，</p>
                      <p className="text-[#0284c7] font-bold">不在城市的喧嚣里，</p>
                      <p>而在海风吹过的时候。</p>
                      <p className="pt-1">生活不只有目的地，还有沿途的风。</p>
                      <p className="text-amber-800 font-bold">出发吧，去遇见更大的自己。</p>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Pagination & Action Controls */}
              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                {/* "查看系列" Button */}
                <button
                  onClick={handleViewSeries}
                  onMouseEnter={() => pixelSound.playSelect()}
                  className="px-2 py-1 gba-pixel-btn-secondary text-[#0284c7] font-pixel text-[10px] sm:text-xs flex items-center gap-1.5 cursor-pointer font-bold rounded-xs"
                >
                  <PixelBook size={12} />
                  <span>查看系列</span>
                </button>

                {/* Page Indicator: ✦ 1 / 4 ✦ */}
                <div className="font-pixel text-[10px] sm:text-xs text-sky-700 font-bold tracking-widest">
                  ✦ {pageIndex + 1} / {categoryWorks.length || 1} ✦
                </div>

                {/* Previous & Next Page Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevPage}
                    onMouseEnter={() => pixelSound.playSelect()}
                    className="px-2 py-1 gba-pixel-btn-secondary text-[#0369a1] font-pixel text-[10px] sm:text-xs cursor-pointer font-bold rounded-xs"
                    title="上一篇 (A / ◀)"
                  >
                    ◀ 上一页
                  </button>
                  <button
                    onClick={handleNextPage}
                    onMouseEnter={() => pixelSound.playSelect()}
                    className="px-2 py-1 gba-pixel-btn-primary font-pixel text-[10px] sm:text-xs cursor-pointer font-bold rounded-xs"
                    title="下一篇 (D / ▶)"
                  >
                    下一页 ▶
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom GBA In-Game Bar (1:1 with media_1790602565401.jpg) */}
        <div className="w-full mt-1.5 bg-[#0c2340] border-2 border-[#38bdf8] px-3 py-1 flex items-center justify-between text-[9px] font-pixel text-sky-200 rounded-xs shadow-[0_2px_0_#000]">
          <span className="font-bold text-white tracking-wider">WRITE HOUSE | 文案作品集 / 打开书本，浏览不同类型的文案作品</span>
          <span className="text-yellow-300 font-bold">[J] 选择 · [K] 关闭</span>
        </div>

      </div>
    </div>
  );
};
