import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelPalmTree, PixelTag } from '../shell/PixelIcons';

/**
 * EndingModal.tsx
 * 
 * Authentic GBA Pixel-Art Summit Ending Dialogue Frame
 * - Perfectly matches the GBA main game scene's 16-bit aesthetic and palette
 * - Overlays directly on top of the live summit game scene
 * - Crisp 3px pixel borders, 0 modern blur, 100% pixel typography
 */
export const EndingModal: React.FC = () => {
  const { isEndingModalOpen, closeEndingModal } = useWorldStore();
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    pixelSound.playCancel();
    setShowContact(false);
    closeEndingModal();
  };

  const handleShare = () => {
    pixelSound.playConfirm();
    const shareText = `【MY WORLD — A Playable GBA Portfolio】\n欢迎来我的世界漫游：${window.location.origin}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleToggleContact = () => {
    pixelSound.playConfirm();
    setShowContact((prev) => !prev);
  };

  useEffect(() => {
    if (!isEndingModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' || e.key === 'K' || e.key === 'Escape') {
        if (showContact) {
          setShowContact(false);
        } else {
          handleClose();
        }
      } else if (e.key === 'j' || e.key === 'J' || e.key === 'Enter') {
        handleShare();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isEndingModalOpen, showContact]);

  if (!isEndingModalOpen) return null;

  return (
    <div 
      className="absolute inset-0 z-30 flex items-center justify-center select-none animate-fadeIn overflow-hidden bg-black/45"
      onClick={handleClose}
    >
      {/* Top-Right Corner Close Button */}
      <button
        onClick={handleClose}
        onMouseEnter={() => pixelSound.playSelect()}
        className="absolute top-3 right-3 w-7 h-7 gba-pixel-btn-secondary flex items-center justify-center font-pixel text-xs cursor-pointer z-40 rounded-xs"
        title="关闭 (K / ESC)"
      >
        ✕
      </button>

      {/* Center GBA Pixel Dialogue Window */}
      <div 
        className="relative z-10 w-[92%] max-w-[500px] gba-pixel-frame p-4 sm:p-5 flex flex-col items-center text-center shadow-[0_6px_0_#000] rounded-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: MARC ISLAND */}
        <div className="flex flex-col items-center mb-1">
          <div className="flex items-center gap-1.5">
            <span className="font-['Press_Start_2P',monospace] text-[10px] text-white tracking-widest font-bold pixel-shadow">
              MARC ISLAND
            </span>
            <PixelPalmTree className="w-4 h-4" />
          </div>
          <div className="w-16 h-1 bg-[#38bdf8] mt-1 shadow-[0_1px_0_#0c2340]" />
        </div>

        {/* Main Title: 谢谢参观 · Thanks for playing */}
        <div className="space-y-1.5 my-3">
          <h2 className="font-pixel text-2xl sm:text-3xl text-yellow-300 font-bold tracking-wider pixel-shadow drop-shadow-[2px_2px_0_#0284c7]">
            谢谢参观
          </h2>
          <div className="font-['Press_Start_2P',monospace] text-[8px] sm:text-[9px] text-sky-100 tracking-wider">
            Thanks for playing
          </div>
        </div>

        {/* Contact Info Popover Drawer */}
        {showContact && (
          <div className="w-full mb-3 gba-pixel-window p-2.5 text-left space-y-1 font-pixel text-xs text-slate-800 rounded-xs shadow-md animate-fadeIn">
            <div className="font-bold text-[#0284c7] flex items-center justify-between border-b border-sky-200 pb-1">
              <span className="flex items-center gap-1.5"><PixelTag className="w-3.5 h-3.5" /> 创作者联系方式：</span>
              <button onClick={() => setShowContact(false)} className="text-slate-500 hover:text-slate-800 text-xs cursor-pointer">✕</button>
            </div>
            <div className="space-y-0.5 text-slate-700 font-bold pt-1">
              <div>• 邮箱：<span className="text-[#0284c7] select-text">marc.creator@portfolio.me</span></div>
              <div>• 微信 / 电话：<span className="text-emerald-700 select-text">Marc_Creative</span></div>
              <div>• 期望职位：<span className="text-purple-700">创意总监 / 资深文案策划 / 叙事设计</span></div>
            </div>
          </div>
        )}

        {/* Action Buttons: 转发 · 查看联系方式 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full mt-2">
          {/* 转发 Button */}
          <button
            onClick={handleShare}
            onMouseEnter={() => pixelSound.playSelect()}
            className="w-full sm:flex-1 py-2 px-3 gba-pixel-btn-primary font-pixel text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
          >
            <span>{copied ? '已复制链接' : '转发'}</span>
            <span className="text-[9px]">▶</span>
          </button>

          {/* 查看联系方式 Button */}
          <button
            onClick={handleToggleContact}
            onMouseEnter={() => pixelSound.playSelect()}
            className="w-full sm:flex-1 py-2 px-3 gba-pixel-btn-secondary font-pixel text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
          >
            <span>查看联系方式</span>
            <span className="text-[#0284c7] text-[9px]">▶</span>
          </button>
        </div>

      </div>
    </div>
  );
};
