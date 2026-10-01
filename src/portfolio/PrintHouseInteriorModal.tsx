import React, { useState, useEffect, useRef } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import {
  COPYWRITING_CATEGORIES,
  COPYWRITING_WORKS
} from '../data/copywritingProjects';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PrintHouseInteriorRenderer } from '../game/world/PrintHouseInteriorRenderer';

/**
 * PrintHouseInteriorModal.tsx
 * 
 * 100% RETRO GBA / CRT-TV IN-SCREEN PIXEL ART UI
 * - Strictly inside retro TV frame (16:9 preserved, CRT scanlines naturally overlay).
 * - UI size increased by ~10% with blunt/curved pixel-styled rounded corners (rounded-2xl with stepped pixel borders).
 * - Color palette 100% harmonized with the exterior Print House building:
 *   - Timber & Wood trims: #78350f / #a16207 / #5c270a
 *   - Mediterranean Cream Limestone: #fbf8ee / #faf7ee / #f0e8d5
 *   - Terracotta Orange: #ea580c / #c2410c
 *   - Crimson Letterpress: #b91c1c / #7f1d1d
 *   - Deep Blue Steel & Gold Handles: #182b40 / #f59e0b / #fbbf24
 * - Left column: Large, easily readable pixel category buttons (TVC, 品牌, 电商, 人群).
 * - Right column: Pixel artwork on left, work introduction on right.
 * - Pure symbolic pagination: [ ◀ ] 1/3 [ ▶ ]
 * - Removed all verbose text and "查看全文" buttons as requested.
 */
export const PrintHouseInteriorModal: React.FC = () => {
  const {
    isPrintHouseBookOpen,
    closePrintHouseModal
  } = useWorldStore();

  const [activeCategory, setActiveCategory] = useState<'tvc' | 'brand' | 'ecommerce' | 'audience'>('tvc');
  const [pageIndex, setPageIndex] = useState<number>(0);

  // Filter works under active category
  const categoryWorks = COPYWRITING_WORKS.filter((w) => w.category === activeCategory);
  const currentWork = categoryWorks[pageIndex] || categoryWorks[0];

  // Procedural Canvas reference for Project Thumbnail
  const thumbnailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render procedural thumbnail illustration when current work changes
  useEffect(() => {
    if (!isPrintHouseBookOpen || !currentWork) return;
    const canvas = thumbnailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    PrintHouseInteriorRenderer.renderThumbnail(ctx, canvas.width, canvas.height, currentWork.category);
  }, [isPrintHouseBookOpen, currentWork]);

  // Reset page index when switching category
  const handleSelectCategory = (catId: 'tvc' | 'brand' | 'ecommerce' | 'audience') => {
    pixelSound.playSelect();
    setActiveCategory(catId);
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
    closePrintHouseModal();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isPrintHouseBookOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'k' || e.key === 'K') {
        handleClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'j' || e.key === 'J') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPrintHouseBookOpen, categoryWorks.length]);

  if (!isPrintHouseBookOpen) return null;

  return (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center p-2 sm:p-3 bg-black/60 backdrop-blur-[1px] select-none"
      onClick={() => closePrintHouseModal()}
    >
      {/* 
        Main Architectural Pixel Dialog Window:
        - Scaled ~10% larger (w-[94%] h-[90%] max-w-[700px] max-h-[380px])
        - Pixel rounded corners (rounded-2xl) with authentic timber & gold double pixel border
        - Colors strictly matching Print House exterior
      */}
      <div 
        className="relative w-[94%] h-[90%] max-w-[700px] max-h-[380px] bg-[#fbf8ee] rounded-2xl border-4 border-[#5c270a] shadow-[inset_0_0_0_2px_#a16207,inset_0_0_0_4px_#faf7ee,0_8px_24px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ----------------------------------------------------------------- */}
        {/* 1. TOP HEADER: Print House Signboard Style (#78350f / #faf7ee)    */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-[#78350f] px-3 sm:px-4 py-2 border-b-4 border-[#5c270a] flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Terracotta Badge */}
            <span className="px-2 py-0.5 bg-[#ea580c] border border-[#fef08a] text-white font-['Press_Start_2P',monospace] text-[8px] sm:text-[9px] rounded-xs shadow-xs">
              03
            </span>
            {/* Crimson Letterpress Title */}
            <h1 className="font-pixel text-[11px] sm:text-[13px] text-[#fef08a] tracking-wider drop-shadow-[1px_1px_0_#450a0a]">
              PRINT HOUSE
            </h1>
            <span className="hidden sm:inline-block font-pixel text-[11px] font-bold text-amber-200 tracking-wider">
              · 文案与叙事字工坊
            </span>
          </div>

          {/* Close button with pixel bevel */}
          <button
            onClick={handleClose}
            onMouseEnter={() => pixelSound.playSelect()}
            className="px-2.5 py-1 bg-[#b91c1c] hover:bg-[#dc2626] active:bg-[#7f1d1d] text-white font-pixel text-[8px] sm:text-[9px] border-2 border-[#fef08a] rounded-xs shadow-[1px_1px_0_#450a0a] transition cursor-pointer"
            title="关闭 (ESC)"
          >
            [ESC ✕]
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 2. MAIN BODY: Left Large Categories + Right Artwork & Intro       */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex-1 flex gap-2 sm:gap-3 p-2 sm:p-3 overflow-hidden bg-[#fbf8ee]">
          {/* 
            LEFT COLUMN: Category Selector with LARGER, CLEAR PIXEL TEXT
          */}
          <div className="w-[145px] sm:w-[175px] bg-[#f0e8d5] rounded-xl border-2 border-[#c8baa0] p-1.5 sm:p-2 flex flex-col justify-between shadow-inner flex-shrink-0">
            <div className="space-y-1.5">
              <div className="text-[8px] sm:text-[9px] font-pixel text-[#78350f] pb-1 border-b-2 border-[#ded3bd] tracking-wider">
                CATEGORY:
              </div>

              {COPYWRITING_CATEGORIES.map((cat, idx) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    onMouseEnter={() => pixelSound.playSelect()}
                    className={`w-full text-left px-2 py-2 sm:py-2.5 rounded-lg flex items-center justify-between font-pixel text-[11px] sm:text-xs font-bold tracking-wider border-2 transition cursor-pointer relative ${
                      isActive
                        ? 'bg-[#182b40] text-white border-[#0f1a26] shadow-[2px_2px_0_#0f1a26]'
                        : 'bg-[#faf7ee] hover:bg-white text-[#78350f] border-[#d6cab4] hover:border-[#a16207] shadow-[1px_1px_0_#c8baa0]'
                    }`}
                  >
                    {/* Active Golden Handle bar on right edge */}
                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#f59e0b] rounded-r-md border-l border-[#fbbf24]" />
                    )}

                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-pixel text-[8px] text-[#f59e0b]">
                        {isActive ? '▶' : `${idx + 1}`}
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Courtyard Slogan Plaque */}
            <div className="border-t-2 border-[#ded3bd] pt-1.5 text-center">
              <span className="font-['Press_Start_2P',monospace] text-[7px] text-[#b45309] block tracking-wider">
                IDEAS INTO THINGS
              </span>
            </div>
          </div>

          {/* 
            RIGHT COLUMN: Streamlined Artwork on Left, Intro Info on Right
          */}
          <div className="flex-1 bg-[#faf7ee] rounded-xl border-2 border-[#c8baa0] p-2.5 sm:p-3 flex flex-col justify-between shadow-inner overflow-hidden">
            {currentWork ? (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {/* Top Info Bar */}
                <div className="flex items-center justify-between pb-1.5 border-b-2 border-[#ded3bd]">
                  <span className="px-2 py-0.5 bg-[#ea580c] text-white text-[8px] sm:text-[9px] font-['Press_Start_2P',monospace] rounded-xs shadow-xs">
                    {currentWork.category.toUpperCase()}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-['Press_Start_2P',monospace] text-[#78350f]">
                    0{pageIndex + 1} / 0{categoryWorks.length}
                  </span>
                </div>

                {/* Center Content: Pixel Artwork on Left, Description on Right */}
                <div className="flex-1 flex flex-col sm:flex-row gap-2.5 sm:gap-3.5 my-2 items-center overflow-hidden">
                  {/* The Pixel Art Illustration (Framed with dark steel) */}
                  <div className="w-full sm:w-[190px] md:w-[220px] h-[95px] sm:h-[125px] rounded-lg border-2 border-[#182b40] bg-[#091522] shadow-md overflow-hidden flex-shrink-0">
                    <canvas
                      ref={thumbnailCanvasRef}
                      width={240}
                      height={110}
                      className="w-full h-full object-cover pixel-canvas"
                    />
                  </div>

                  {/* Right side: Work Introduction & Copy Details */}
                  <div className="flex-1 w-full flex flex-col justify-center space-y-1.5 overflow-hidden">
                    {/* Work Title */}
                    <h2 className="font-pixel text-sm sm:text-base font-bold text-[#1e293b] tracking-wide leading-tight truncate">
                      {currentWork.title}
                    </h2>

                    {/* Subtitle / Client */}
                    <div className="text-[11px] font-pixel font-bold text-[#b45309] truncate tracking-wide">
                      {currentWork.subtitle}
                    </div>

                    {/* Core Idea or Excerpt (Succinct) */}
                    {currentWork.fullContent?.coreIdea ? (
                      <div className="bg-[#f0e8d5] rounded-md border border-[#c8baa0] p-2 text-[11px] font-pixel text-[#1e293b] leading-relaxed line-clamp-2">
                        <span className="text-[#ea580c] font-bold mr-1">✦</span>
                        {currentWork.fullContent.coreIdea}
                      </div>
                    ) : (
                      <div className="bg-[#f0e8d5] rounded-md border border-[#c8baa0] p-2 text-[11px] font-pixel text-[#1e293b] leading-relaxed line-clamp-2">
                        {currentWork.excerpt[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Pagination: Pure Symbols [ ◀ ] 1/3 [ ▶ ] */}
                <div className="pt-1.5 border-t-2 border-[#ded3bd] flex items-center justify-end gap-2">
                  <div className="flex items-center gap-1.5 font-pixel text-[9px] sm:text-[10px]">
                    <button
                      onClick={handlePrevPage}
                      onMouseEnter={() => pixelSound.playSelect()}
                      className="w-7 h-7 bg-[#faf7ee] hover:bg-[#182b40] hover:text-white active:bg-[#ea580c] text-[#78350f] border-2 border-[#78350f] rounded-xs flex items-center justify-center cursor-pointer shadow-[1px_1px_0_#5c270a] transition active:scale-95"
                      title="Prev"
                    >
                      ◀
                    </button>

                    <span className="px-2 py-1 text-[#78350f] bg-[#f0e8d5] border-2 border-[#c8baa0] rounded-xs font-bold">
                      {pageIndex + 1} / {categoryWorks.length}
                    </span>

                    <button
                      onClick={handleNextPage}
                      onMouseEnter={() => pixelSound.playSelect()}
                      className="w-7 h-7 bg-[#faf7ee] hover:bg-[#182b40] hover:text-white active:bg-[#ea580c] text-[#78350f] border-2 border-[#78350f] rounded-xs flex items-center justify-center cursor-pointer shadow-[1px_1px_0_#5c270a] transition active:scale-95"
                      title="Next"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-pixel text-[9px]">
                EMPTY
              </div>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 3. BOTTOM FOOTER: Minimalist Plinth with Key Hints               */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-[#78350f] border-t-4 border-[#5c270a] px-3 sm:px-4 py-1.5 flex items-center justify-between text-[7px] sm:text-[8px] font-pixel text-[#fef08a] flex-shrink-0 tracking-wider">
          <span>[A/D] ◀▶ FLIP</span>
          <span className="text-amber-200">[ESC] EXIT</span>
        </div>
      </div>
    </div>
  );
};
