import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelCamera, PixelBook, PixelDisc, PixelBike, PixelFilm } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { ContentMedia } from './ContentMedia';
import { HobbyMediaViewer, type HobbyMediaItem } from './HobbyMediaViewer';
import { ManagedProjectViewer, openExternalDetail } from './ManagedProjectViewer';
import './mediaModals.css';
import './hobbyRack.css';

const HOBBIES = [
  { id: 'photo', name: 'Photography', label: '摄影', icon: PixelCamera, aliases: ['photo', 'photography', '摄影'] },
  { id: 'reading', name: 'Reading', label: '阅读', icon: PixelBook, aliases: ['reading', 'books', '阅读', '书籍'] },
  { id: 'vinyl', name: 'Vinyl', label: '黑胶', icon: PixelDisc, aliases: ['vinyl', 'music', '黑胶', '音乐'] },
  { id: 'cycling', name: 'Cycling', label: '骑行', icon: PixelBike, aliases: ['cycling', 'bike', '骑行'] },
  { id: 'film', name: 'Film', label: '电影', icon: PixelFilm, aliases: ['film', 'films', 'cinema', '电影', '胶片'] },
];

function categoryIndex(value?: string | null): number {
  const normalized = (value || '').replace(/^hobby[:\-]/, '').trim().toLowerCase();
  return HOBBIES.findIndex(category => category.aliases.includes(normalized));
}
function preview(asset?: MediaAsset): MediaAsset | undefined {
  if (!asset || asset.type === 'image') return asset;
  return asset.poster ? { ...asset, type: 'image', url: asset.poster } : undefined;
}
function showcaseMedia(entry: ContentEntry): HobbyMediaItem[] {
  const seen = new Set<string>();
  const assets = [entry.cover, ...entry.media].filter((asset): asset is MediaAsset => {
    if (!asset?.url.trim() || seen.has(asset.url)) return false;
    seen.add(asset.url); return true;
  });
  return assets.length ? assets.map(asset => ({ entry, asset })) : [{ entry }];
}

export const HobbyStudioModal = () => {
  const isOpen = useWorldStore(s => s.activeLandmarkModal === 'my-hobby' && s.currentView === 'game' && !s.isOverlayOpen);
  const modalContext = useWorldStore(s => s.modalContext);
  const closeLandmarkModal = useWorldStore(s => s.closeLandmarkModal);
  const entries = useContentStore(s => s.entries);
  const [activeCategory, setActiveCategory] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const rackRef = useRef<HTMLDivElement>(null);
  const category = HOBBIES[activeCategory];
  const categoryEntries = useMemo(() => entries.filter(entry => entry.kind === 'hobby' && categoryIndex(entry.category) === activeCategory), [entries, activeCategory]);
  const allMedia = useMemo(() => categoryEntries.flatMap(showcaseMedia), [categoryEntries]);
  const viewMedia = useMemo(() => allMedia.filter(item => item.asset), [allMedia]);
  const items = useMemo(() => ['photo', 'cycling'].includes(category.id)
    ? allMedia : categoryEntries.map(entry => showcaseMedia(entry)[0]), [category.id, allMedia, categoryEntries]);
  const selected = items[mediaIndex];
  const CategoryIcon = category.icon;

  useEffect(() => {
    if (!isOpen) return;
    const index = categoryIndex(modalContext);
    setActiveCategory(index < 0 ? 0 : index); setMediaIndex(0); setViewIndex(null); setDetailId(null);
  }, [isOpen, modalContext]);
  useEffect(() => {
    setMediaIndex(index => Math.min(index, Math.max(0, items.length - 1)));
    setViewIndex(index => index === null || !viewMedia.length ? null : Math.min(index, viewMedia.length - 1));
  }, [items.length, viewMedia.length]);
  useEffect(() => {
    rackRef.current?.querySelector<HTMLElement>(`[data-rack-index="${mediaIndex}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [mediaIndex, activeCategory]);

  const chooseCategory = useCallback((index: number) => {
    pixelSound.playSelect(); setActiveCategory((index + HOBBIES.length) % HOBBIES.length); setMediaIndex(0); setViewIndex(null);
  }, []);
  const moveMedia = useCallback((step: number) => {
    if (!items.length) return;
    pixelSound.playSelect(); setMediaIndex(index => (index + step + items.length) % items.length);
  }, [items.length]);
  const view = useCallback((item?: HobbyMediaItem) => {
    const current = item || selected;
    if (current?.entry.detail) { if (!openExternalDetail(current.entry)) setDetailId(current.entry.id); return; }
    if (!current?.asset) return;
    const index = viewMedia.findIndex(media => media.entry.id === current.entry.id && media.asset?.url === current.asset?.url);
    if (index < 0) return;
    pixelSound.playConfirm(); setViewIndex(index);
  }, [selected, viewMedia]);
  const changeView = (index: number) => {
    const current = viewMedia[index];
    const rackIndex = items.findIndex(item => item.entry.id === current.entry.id && (item.asset?.url === current.asset?.url || !['photo', 'cycling'].includes(category.id)));
    setViewIndex(index); if (rackIndex >= 0) setMediaIndex(rackIndex);
  };
  const closeViewer = () => { pixelSound.playCancel(); setViewIndex(null); };
  useModalKeys({ isOpen: isOpen && viewIndex === null && detailId === null, onClose: closeLandmarkModal,
    onPrev: () => moveMedia(-1), onNext: () => moveMedia(1),
    onUp: () => chooseCategory(activeCategory - 1), onDown: () => chooseCategory(activeCategory + 1),
    onConfirm: () => view(),
  });
  if (!isOpen) return null;

  return <>
    <SceneModalFrame title="HOBBY STUDIO" variant="collection" onClose={closeLandmarkModal}
      footer={<div className="mm-footer"><span>{categoryEntries.length} 个收藏</span><span>W / S 分类 · A / D 选择 · J 查看</span></div>}>
      <div className="mm-hobby hobby-studio-rack">
        <nav className="mm-hobby-categories" aria-label="兴趣分类">{HOBBIES.map((hobby, index) => {
          const Icon = hobby.icon;
          return <button key={hobby.id} className={activeCategory === index ? 'is-active' : ''} aria-pressed={activeCategory === index} onClick={() => chooseCategory(index)}>
            <Icon /><span>{hobby.name}</span><span className="mm-category-marker" aria-hidden="true">▶</span>
          </button>;
        })}</nav>
        <section className={`hobby-rack-panel hobby-rack-${category.id}`} aria-label={`${category.label}展柜`} data-hobby-category={category.id}>
          <div className="hobby-rack-grid" ref={rackRef}>
            {items.map((item, index) => <button key={`${item.entry.id}:${item.asset?.url || 'empty'}`} data-entry-id={item.entry.id} data-rack-index={index}
              className={`hobby-rack-item ${index === mediaIndex ? 'is-active' : ''}`} aria-pressed={index === mediaIndex}
              aria-label={item.asset?.caption || item.entry.title} title={`${item.entry.title} · J 查看`} disabled={!item.asset && !item.entry.detail}
              onMouseEnter={() => setMediaIndex(index)} onFocus={() => setMediaIndex(index)} onClick={() => { setMediaIndex(index); view(item); }}>
              <span className="hobby-rack-cover"><ContentMedia asset={preview(item.asset)} kind={category.id} title={item.entry.title} fit="cover" />
                {item.asset?.type === 'video' && <span className="hobby-rack-video" aria-hidden="true">▶</span>}
              </span>
              {!['photo', 'cycling'].includes(category.id) && <span className="hobby-rack-label">{item.entry.title}</span>}
            </button>)}
            {!items.length && <>
              {Array.from({ length: category.id === 'photo' || category.id === 'vinyl' ? 6 : 4 }, (_, index) => <div className="hobby-rack-placeholder" key={index} aria-hidden="true"><span className="hobby-rack-cover"><CategoryIcon size={20} /></span></div>)}
              <p className="hobby-rack-empty" role="status">收藏待补充</p>
            </>}
          </div>
        </section>
      </div>
    </SceneModalFrame>
    {viewIndex !== null && viewMedia[viewIndex]?.asset && <HobbyMediaViewer items={viewMedia} index={viewIndex} onChange={changeView} onClose={closeViewer} />}
    {detailId && <ManagedProjectViewer entries={categoryEntries} entryId={detailId} onEntryChange={setDetailId} onClose={() => setDetailId(null)} returnLabel="返回收藏架" />}
  </>;
};
