import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelGamepad, PixelCart } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { ContentMedia } from './ContentMedia';
import { ContentDetail } from './ContentDetail';
import './mediaModals.css';

type GameTab = 'journey' | 'making';
function gameCover(entry: ContentEntry): MediaAsset | undefined {
  const asset = entry.cover || entry.media.find((media) => media.type === 'image');
  if (!asset || asset.type === 'image') return asset;
  return asset.poster ? { ...asset, type: 'image', url: asset.poster } : undefined;
}
function demoLink(value?: string): string | undefined {
  if (!value || !/^(https?:\/\/|\/)/i.test(value.trim())) return;
  try { const url = new URL(value.trim(), window.location.origin); if (url.protocol === 'https:' || url.protocol === 'http:') return url.href; }
  catch { /* Malformed links remain disabled. */ }
}
function playHours(entry: ContentEntry): string {
  if (entry.hours === undefined || entry.hours === null) return '时长待补充';
  return typeof entry.hours === 'number' ? `${entry.hours} h` : String(entry.hours);
}

export const ArcadeGameModal = () => {
  const isOpen = useWorldStore((s) => s.activeLandmarkModal === 'arcade' && s.currentView === 'game' && !s.isOverlayOpen);
  const modalContext = useWorldStore((s) => s.modalContext);
  const closeLandmarkModal = useWorldStore((s) => s.closeLandmarkModal);
  const entries = useContentStore((s) => s.entries);
  const [tab, setTab] = useState<GameTab>('journey');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const games = useMemo(() => entries.filter((entry) => entry.kind === (tab === 'journey' ? 'game-experience' : 'game-project')), [entries, tab]);
  const active = games[Math.min(selectedIndex, Math.max(0, games.length - 1))];
  const detail = games.find((entry) => entry.id === detailId);
  const demo = active ? demoLink(active.demoUrl) : undefined;
  const totalHours = games.reduce((total, entry) => total + (typeof entry.hours === 'number' && Number.isFinite(entry.hours) ? entry.hours : 0), 0);
  useEffect(() => { if (isOpen) { setTab(modalContext === 'making' ? 'making' : 'journey'); setSelectedIndex(0); setDetailId(null); } }, [isOpen, modalContext]);
  useEffect(() => { setSelectedIndex((index) => Math.min(index, Math.max(0, games.length - 1))); if (detailId && !games.some((entry) => entry.id === detailId)) setDetailId(null); }, [games, detailId]);
  useEffect(() => { listRef.current?.querySelector<HTMLElement>(`[data-game-index="${selectedIndex}"]`)?.scrollIntoView({ block: 'nearest' }); }, [selectedIndex, tab]);
  const selectTab = useCallback((next: GameTab) => { pixelSound.playSelect(); setTab(next); setSelectedIndex(0); setDetailId(null); }, []);
  const move = useCallback((step: number) => { if (!games.length || detailId) return; pixelSound.playSelect(); setSelectedIndex((index) => (index + step + games.length) % games.length); }, [games.length, detailId]);
  const openDetail = useCallback((entry?: ContentEntry) => { if (!entry) return; pixelSound.playConfirm(); setDetailId(entry.id); }, []);
  const back = useCallback(() => { if (detailId) { pixelSound.playCancel(); setDetailId(null); } else closeLandmarkModal(); }, [detailId, closeLandmarkModal]);
  useModalKeys({ isOpen, onClose: back, onPrev: !detail ? () => selectTab('journey') : undefined, onNext: !detail ? () => selectTab('making') : undefined, onUp: !detail ? () => move(-1) : undefined, onDown: !detail ? () => move(1) : undefined, onConfirm: !detail ? () => openDetail(active) : undefined });
  if (!isOpen) return null;

  return <SceneModalFrame title="MY GAME" subtitle={tab === 'journey' ? '游戏经历 · PLAY GAMES, BE HAPPY' : '游戏制作 · MAKE SOMETHING PLAYABLE'} variant="console" onClose={closeLandmarkModal}
    footer={<div className="mm-footer"><span>{games.length} {tab === 'journey' ? '条游戏记录' : '个制作项目'}</span><span>{detail ? 'K 返回列表' : '← → 分类 · ↑ ↓ 选择 · J 详情 · K 返回'}</span></div>}>
    <div className="mm-arcade">
      <div className="mm-tabs" role="tablist" aria-label="游戏内容类型"><button id="game-journey-tab" role="tab" aria-controls="game-content-panel" aria-selected={tab === 'journey'} className={tab === 'journey' ? 'is-active' : ''} onClick={() => selectTab('journey')}><PixelGamepad />游戏经历</button><button id="game-making-tab" role="tab" aria-controls="game-content-panel" aria-selected={tab === 'making'} className={tab === 'making' ? 'is-active' : ''} onClick={() => selectTab('making')}><PixelCart />游戏制作</button><span className="mm-tab-metric">{tab === 'journey' ? `${games.some((entry) => entry.isSample) ? '示例记录' : '已记录'} ${totalHours} h` : 'IDEAS → PROTOTYPES'}</span></div>
      <div id="game-content-panel" role="tabpanel" aria-labelledby={`game-${tab}-tab`} className="mm-game-panel">
        {detail ? <div className="mm-detail"><ContentDetail entry={detail} onBack={() => setDetailId(null)} /></div>
        : !active ? <div className="mm-empty"><PixelGamepad size={30} /><h3>{tab === 'journey' ? '游戏经历待记录' : '制作项目待添加'}</h3><p>{tab === 'journey' ? '在内容管理中填写玩过的游戏、真实时长与体验笔记。' : '添加项目介绍、开发记录和可用的 Demo 链接。'}</p></div>
        : <div className="mm-games-layout">
            <div className="mm-games-list" ref={listRef} aria-label={tab === 'journey' ? '游戏经历列表' : '游戏制作列表'}>{games.map((entry, index) => <button key={entry.id} data-game-index={index} className={`mm-game-card ${index === selectedIndex ? 'is-active' : ''}`} onFocus={() => setSelectedIndex(index)} onClick={() => { setSelectedIndex(index); openDetail(entry); }}><span className="mm-game-thumb"><ContentMedia asset={gameCover(entry)} kind="game" title={entry.title} fit="cover" /></span><span className="mm-game-copy"><strong>{entry.title}</strong><span>{entry.subtitle || entry.description || '详情待补充'}</span><small>{tab === 'journey' ? playHours(entry) : entry.date || entry.category}</small></span><span className="mm-card-arrow" aria-hidden="true">▶</span></button>)}</div>
            <aside className="mm-game-inspector"><div className="mm-game-hero"><ContentMedia asset={gameCover(active)} kind="game" title={active.title} fit="cover" /></div><span className="mm-eyebrow">{tab === 'journey' ? 'PLAY NOTES' : 'DEV NOTES'}</span><h3>{active.title}</h3><p>{active.description || '项目介绍待补充'}</p>{!!active.tags.length && <div className="mm-tags">{active.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>}<button className="mm-button" onClick={() => openDetail(active)}>查看详情 ▶</button>{tab === 'making' && (demo ? <a className="mm-button mm-button-gold" href={demo} target="_blank" rel="noopener noreferrer">OPEN DEMO ↗</a> : <button className="mm-button mm-button-gold" disabled>待添加 Demo</button>)}</aside>
          </div>}
      </div>
      <div className="mm-actions mm-actions-end">{detail && <button className="mm-button mm-button-light" onClick={() => setDetailId(null)}>← 返回列表</button>}{detail?.kind === 'game-project' && (demoLink(detail.demoUrl) ? <a className="mm-button mm-button-gold" href={demoLink(detail.demoUrl)} target="_blank" rel="noopener noreferrer">OPEN DEMO ↗</a> : <button className="mm-button mm-button-gold" disabled>待添加 Demo</button>)}<button className="mm-button" onClick={closeLandmarkModal}>返回游戏厅</button></div>
    </div>
  </SceneModalFrame>;
};
