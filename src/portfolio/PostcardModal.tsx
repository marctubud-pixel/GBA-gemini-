import React, { useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { LANDMARK_OBSERVATORY_DATA } from '../assets/buildings/allLandmarksData';
import { pixelSound } from '../game/audio/PixelSoundManager';

/**
 * PostcardModal.tsx
 * 
 * 100% GBA IN-SCREEN ENDING CELEBRATION & SUMMIT KEEPSAKE
 * - Renders directly inside the GBA screen bezel (absolute inset-0 z-20).
 * - Full pixel-art styling (#182b40 / #fbf8ee).
 * - Marks the final climax of the user's journey across the world (x: 5900 - 6400).
 */
export const PostcardModal: React.FC = () => {
  const { isPostcardOpen, closePostcard, teleportToLocation, setCurrentView } = useWorldStore();
  const [copied, setCopied] = useState(false);

  if (!isPostcardOpen) return null;

  const observatoryImage = LANDMARK_OBSERVATORY_DATA;

  const handleShare = () => {
    pixelSound.playConfirm();
    const shareText = `【MY WORLD — A Playable GBA Portfolio】\n我已经完成了从海边小镇到山顶天文台的全线骑行探索！\n探索地标：10/10 | 骑行里程：6400px\n欢迎来我的世界漫游：${window.location.origin}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleRestartRide = () => {
    pixelSound.playConfirm();
    pixelSound.playMount();
    closePostcard();
    teleportToLocation('entrance');
  };

  const handleOpenIndex = () => {
    pixelSound.playConfirm();
    closePostcard();
    setCurrentView('index');
  };

  const handleClose = () => {
    pixelSound.playCancel();
    closePostcard();
  };

  return (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center p-2 sm:p-3 bg-black/75 backdrop-blur-[1px] select-none"
      onClick={closePostcard}
    >
      {/* GBA Ending Celebration Window */}
      <div 
        className="relative w-[94%] h-[90%] max-w-[660px] max-h-[360px] bg-[#fbf8ee] rounded-xs border-4 border-[#12162c] shadow-[inset_0_0_0_2px_#38bdf8,0_10px_30px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#182b40] px-3 sm:px-4 py-1.5 border-b-2 border-[#38bdf8] flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#facc15] animate-ping" />
            <span className="font-pixel text-[9px] sm:text-[11px] text-[#facc15] tracking-wider">
              ★ 100% COMPLETE ★
            </span>
            <span className="hidden sm:inline-block font-pixel text-[10px] text-sky-200 tracking-wider">
              · 终点通关留念
            </span>
          </div>

          <button
            onClick={handleClose}
            onMouseEnter={() => pixelSound.playSelect()}
            className="px-2 py-0.5 bg-[#b91c1c] text-white font-pixel text-[8px] border border-white cursor-pointer"
            title="关闭 (ESC)"
          >
            [ESC ✕]
          </button>
        </div>

        {/* Content Body: Left Picture, Right Stats & Message */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3 p-3 overflow-hidden items-center justify-center bg-[#faf7ee]">
          {/* Left: Pixel Art Summit Photo */}
          <div className="w-full sm:w-[220px] h-[105px] sm:h-[135px] rounded-lg border-2 border-[#182b40] bg-[#091522] overflow-hidden shadow-inner flex-shrink-0 relative">
            {observatoryImage ? (
              <img
                src={observatoryImage}
                alt="Observatory Summit"
                className="w-full h-full object-cover pixel-canvas"
              />
            ) : (
              <div className="text-white text-xs font-pixel flex items-center justify-center h-full">
                SUMMIT 6400PX
              </div>
            )}
            <div className="absolute bottom-1 right-2 px-1.5 py-0.5 bg-black/80 font-pixel text-[7px] text-[#facc15]">
              6,400 PX
            </div>
          </div>

          {/* Right: Completion Details & Metrics */}
          <div className="flex-1 flex flex-col justify-between space-y-2 overflow-hidden w-full">
            <div>
              <h2 className="font-pixel text-sm sm:text-base font-bold text-[#1e293b] leading-tight tracking-wide">
                恭喜完成全岛骑行探索！
              </h2>
              <p className="text-[10px] sm:text-[11px] font-pixel text-slate-700 mt-1 leading-relaxed">
                已抵达最高点【星穹天文台】。从海边小镇到未来之丘，所有创作皆已尽数展陈。
              </p>
            </div>

            {/* 3 Metrics in Pixel Boxes */}
            <div className="grid grid-cols-3 gap-1.5 text-center font-pixel">
              <div className="bg-[#f0e8d5] border border-[#c8baa0] p-1 rounded">
                <span className="block text-[8px] text-slate-500 font-bold">LANDMARKS</span>
                <span className="font-pixel text-[9px] text-[#ea580c]">10/10</span>
              </div>
              <div className="bg-[#f0e8d5] border border-[#c8baa0] p-1 rounded">
                <span className="block text-[8px] text-slate-500 font-bold">DISTANCE</span>
                <span className="font-pixel text-[9px] text-[#0284c7]">6400P</span>
              </div>
              <div className="bg-[#f0e8d5] border border-[#c8baa0] p-1 rounded">
                <span className="block text-[8px] text-slate-500 font-bold">RANK</span>
                <span className="font-pixel text-[9px] text-[#15803d]">★STAR</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => {
                  pixelSound.playConfirm();
                  closePostcard();
                  useWorldStore.getState().triggerEndingRide();
                }}
                onMouseEnter={() => pixelSound.playSelect()}
                className="flex-1 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-pixel text-[10px] sm:text-[11px] font-bold border border-[#fef08a] rounded-xs shadow-[1px_1px_0_#000] cursor-pointer"
                title="完成骑行结算，骑车离开画外"
              >
                完成骑行 (离开画外)
              </button>
              <button
                onClick={handleShare}
                onMouseEnter={() => pixelSound.playSelect()}
                className="px-2.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-pixel text-[10px] sm:text-[11px] font-bold border border-[#38bdf8] rounded-xs shadow-[1px_1px_0_#000] cursor-pointer"
              >
                {copied ? '✔ 已复制' : '分享'}
              </button>
              <button
                onClick={handleRestartRide}
                onMouseEnter={() => pixelSound.playSelect()}
                className="px-2 py-1.5 bg-[#f0e8d5] hover:bg-white text-[#78350f] font-pixel text-[10px] sm:text-[11px] font-bold border border-[#78350f] rounded-xs shadow-[1px_1px_0_#000] cursor-pointer"
                title="重新回到起点"
              >
                重骑
              </button>
              <button
                onClick={handleOpenIndex}
                onMouseEnter={() => pixelSound.playSelect()}
                className="px-2 py-1.5 bg-[#182b40] hover:bg-[#254263] text-white font-pixel text-[10px] sm:text-[11px] font-bold border border-white rounded-xs shadow-[1px_1px_0_#000] cursor-pointer"
              >
                索引
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#182b40] px-3 py-1 border-t border-[#38bdf8] text-[7px] sm:text-[8px] font-['Press_Start_2P',monospace] text-sky-200 flex items-center justify-between flex-shrink-0">
          <span>SUMMIT OBSERVATORY</span>
          <span>[ESC] CLOSE</span>
        </div>
      </div>
    </div>
  );
};
