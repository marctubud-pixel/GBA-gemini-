import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelGamepad } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { ContentMedia } from './ContentMedia';
import { CompleteProjectViewer } from './CompleteProjectViewer';
import './arcadeLibrary.css';

function gameCover(entry: ContentEntry): MediaAsset | undefined {
  const asset = entry.cover || entry.media.find((media) => media.type === 'image');
  if (!asset || asset.type === 'image') return asset;
  return asset.poster ? { ...asset, type: 'image', url: asset.poster } : undefined;
}
function playHours(entry: ContentEntry): string {
  if (entry.hours === undefined || entry.hours === null) return '时长待补充';
  return typeof entry.hours === 'number' ? `${entry.hours} 小时` : String(entry.hours);
}

export const ArcadeGameModal = () => {
  const isOpen = useWorldStore((s) => s.activeLandmarkModal === 'arcade' && s.currentView === 'game' && !s.isOverlayOpen);
  const modalContext = useWorldStore((s) => s.modalContext);
  const closeLandmarkModal = useWorldStore((s) => s.closeLandmarkModal);
  const entries = useContentStore((s) => s.entries);
  const isMaking = modalContext === 'making';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const games = useMemo(() => entries.filter((entry) => entry.kind === (isMaking ? 'game-project' : 'game-experience')), [entries, isMaking]);
  const active = games[Math.min(selectedIndex, Math.max(0, games.length - 1))];
  const detail = isMaking ? games.find((entry) => entry.id === detailId) : undefined;

  useEffect(() => {
    if (isOpen) { setSelectedIndex(0); setDetailId(null); }
  }, [isOpen, isMaking]);
  useEffect(() => {
    setSelectedIndex((index) => Math.min(index, Math.max(0, games.length - 1)));
    if (detailId && !games.some((entry) => entry.id === detailId)) setDetailId(null);
  }, [games, detailId]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-game-index="${selectedIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, isMaking]);
  const select = useCallback((index: number) => {
    pixelSound.playSelect();
    setSelectedIndex(index);
  }, []);
  const move = useCallback((step: number) => {
    if (!games.length) return;
    pixelSound.playSelect();
    setSelectedIndex((index) => (index + step + games.length) % games.length);
  }, [games.length]);
  const openDetail = useCallback((entry?: ContentEntry) => {
    if (!isMaking || !entry) return;
    pixelSound.playConfirm();
    setSelectedIndex(games.findIndex((game) => game.id === entry.id));
    setDetailId(entry.id);
  }, [isMaking, games]);
  const changeDetail = useCallback((id: string) => {
    const index = games.findIndex((entry) => entry.id === id);
    if (index < 0) return;
    pixelSound.playSelect();
    setSelectedIndex(index);
    setDetailId(id);
  }, [games]);
  const closeDetail = useCallback(() => {
    pixelSound.playCancel();
    setDetailId(null);
  }, []);
  useModalKeys({
    isOpen: isOpen && !detail,
    onClose: closeLandmarkModal,
    onUp: () => move(-1),
    onDown: () => move(1),
    onConfirm: isMaking ? () => openDetail(active) : undefined,
  });
  if (!isOpen) return null;

  const label = isMaking ? '游戏互动' : '游戏经历';
  return <>
    <div className="arcade-library-base" aria-hidden={detail ? true : undefined}>
      <SceneModalFrame title="MY GAME" subtitle={label} variant="console" onClose={closeLandmarkModal}
        footer={<div className="arcade-library-footer"><span>{games.length} {isMaking ? '个互动项目' : '条游戏记录'}</span><span>{isMaking ? 'W / S 选择 · J 详情' : 'W / S 浏览'} · K / ESC 关闭</span></div>}>
        <div className="arcade-library" data-game-mode={isMaking ? 'making' : 'journey'}>
          <header className="arcade-library-heading"><PixelGamepad size={20} /><h3>{label}</h3></header>
          {!games.length ? <div className="arcade-library-empty"><PixelGamepad size={30} /><h3>{isMaking ? '互动项目待添加' : '游戏经历待记录'}</h3></div>
            : <div className="arcade-library-list" ref={listRef} aria-label={`${label}列表`}>{games.map((entry, index) => <button
              key={entry.id} data-game-index={index} data-entry-id={entry.id}
              className={`arcade-library-row${index === selectedIndex ? ' is-active' : ''}${isMaking ? ' is-project' : ''}`}
              aria-label={isMaking ? `查看${entry.title}完整项目` : `${entry.title}，体验时长${playHours(entry)}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
              onFocus={() => setSelectedIndex(index)}
              onClick={() => { select(index); if (isMaking) openDetail(entry); }}>
              <span className="arcade-library-thumb"><ContentMedia asset={gameCover(entry)} kind="game" title={entry.title} fit="cover" /></span>
              <span className="arcade-library-copy"><strong>{entry.title}</strong>{!isMaking && <span className="arcade-library-hours"><svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" shapeRendering="crispEdges"><path d="M5 1h6v1h2v2h1v2h1v5h-1v2h-2v1h-2v1H5v-1H3v-2H2v-2H1V6h1V4h2V2h1V1ZM5 3v1H4v1H3v6h1v1h1v1h6v-1h1v-1h1V5h-1V4h-1V3H5Z" fill="currentColor" fillRule="evenodd" /><path d="M7 4h2v4h3v2H7z" fill="currentColor" /></svg>体验时长 <b>{playHours(entry)}</b></span>}</span>
            </button>)}</div>}
        </div>
      </SceneModalFrame>
    </div>
    {detail && <CompleteProjectViewer entries={games} entryId={detail.id} onEntryChange={changeDetail} onClose={closeDetail} returnLabel="返回游戏互动" />}
  </>;
};
