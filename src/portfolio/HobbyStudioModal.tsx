import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelCamera, PixelBook, PixelDisc, PixelGamepad, PixelBike, PixelFilm, PixelRobot } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { ContentMedia } from './ContentMedia';
import { ContentDetail } from './ContentDetail';
import './mediaModals.css';

const HOBBIES = [
  { id: 'photo', name: 'Photography', label: '摄影', icon: PixelCamera, aliases: ['photo', 'photography', '摄影'] },
  { id: 'reading', name: 'Reading', label: '阅读', icon: PixelBook, aliases: ['reading', 'books', '阅读', '书籍'] },
  { id: 'vinyl', name: 'Vinyl', label: '黑胶', icon: PixelDisc, aliases: ['vinyl', 'music', '黑胶', '音乐'] },
  { id: 'games', name: 'Games', label: '游戏', icon: PixelGamepad, aliases: ['games', 'game', '游戏'] },
  { id: 'cycling', name: 'Cycling', label: '骑行', icon: PixelBike, aliases: ['cycling', 'bike', '骑行'] },
  { id: 'film', name: 'Film', label: '电影', icon: PixelFilm, aliases: ['film', 'films', 'cinema', '电影', '胶片'] },
  { id: 'figures', name: 'Figures', label: '收藏', icon: PixelRobot, aliases: ['figures', 'figure', 'collection', '手办', '收藏'] }
];
type HobbyLayer = 'showcase' | 'collection' | 'detail' | 'view';
type ShowcaseItem = { entry: ContentEntry; asset?: MediaAsset };

function categoryIndex(value?: string | null): number {
  const normalized = (value || '').replace(/^hobby[:\-]/, '').trim().toLowerCase();
  return HOBBIES.findIndex((category) => category.aliases.includes(normalized));
}
function preview(asset?: MediaAsset): MediaAsset | undefined {
  if (!asset || asset.type === 'image') return asset;
  return asset.poster ? { ...asset, type: 'image', url: asset.poster } : undefined;
}
function showcaseMedia(entry: ContentEntry): ShowcaseItem[] {
  const seen = new Set<string>();
  const assets = [entry.cover, ...entry.media].filter((asset): asset is MediaAsset => !!asset && !!asset.url.trim()).filter((asset) => {
    if (seen.has(asset.url)) return false;
    seen.add(asset.url); return true;
  });
  return assets.length ? assets.map((asset) => ({ entry, asset })) : [{ entry }];
}

export const HobbyStudioModal = () => {
  const isOpen = useWorldStore((s) => s.activeLandmarkModal === 'my-hobby' && s.currentView === 'game' && !s.isOverlayOpen);
  const modalContext = useWorldStore((s) => s.modalContext);
  const closeLandmarkModal = useWorldStore((s) => s.closeLandmarkModal);
  const entries = useContentStore((s) => s.entries);
  const [activeCategory, setActiveCategory] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [collectionIndex, setCollectionIndex] = useState(0);
  const [layer, setLayer] = useState<HobbyLayer>('showcase');
  const [detailId, setDetailId] = useState<string | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const category = HOBBIES[activeCategory];
  const hobbies = useMemo(() => entries.filter((entry) => entry.kind === 'hobby'), [entries]);
  const categoryEntries = useMemo(() => hobbies.filter((entry) => categoryIndex(entry.category) === activeCategory), [hobbies, activeCategory]);
  const items = useMemo(() => categoryEntries.flatMap(showcaseMedia), [categoryEntries]);
  const selected = items[Math.min(mediaIndex, Math.max(0, items.length - 1))];
  const selectedEntry = categoryEntries[Math.min(collectionIndex, Math.max(0, categoryEntries.length - 1))];
  const detail = categoryEntries.find((entry) => entry.id === detailId);
  const CategoryIcon = category.icon;

  useEffect(() => {
    if (isOpen) {
      const index = categoryIndex(modalContext);
      setActiveCategory(index < 0 ? 0 : index); setMediaIndex(0); setCollectionIndex(0); setLayer('showcase'); setDetailId(null);
    }
  }, [isOpen, modalContext]);
  useEffect(() => {
    setMediaIndex((index) => Math.min(index, Math.max(0, items.length - 1)));
    setCollectionIndex((index) => Math.min(index, Math.max(0, categoryEntries.length - 1)));
    if (detailId && !categoryEntries.some((entry) => entry.id === detailId)) { setDetailId(null); setLayer('collection'); }
    if (layer === 'view' && !selected?.asset) setLayer('showcase');
  }, [items.length, categoryEntries, detailId, layer, selected?.asset]);
  useEffect(() => { thumbsRef.current?.querySelector<HTMLElement>(`[data-media-index="${mediaIndex}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, [mediaIndex]);
  useEffect(() => { collectionRef.current?.querySelector<HTMLElement>(`[data-collection-index="${collectionIndex}"]`)?.scrollIntoView({ block: 'nearest' }); }, [collectionIndex]);

  const chooseCategory = useCallback((index: number) => {
    pixelSound.playSelect(); setActiveCategory((index + HOBBIES.length) % HOBBIES.length); setMediaIndex(0); setCollectionIndex(0); setDetailId(null); setLayer('showcase');
  }, []);
  const moveMedia = useCallback((step: number) => { if (!items.length) return; pixelSound.playSelect(); setMediaIndex((index) => (index + step + items.length) % items.length); }, [items.length]);
  const view = useCallback(() => { if (!selected?.asset) return; pixelSound.playConfirm(); setLayer('view'); }, [selected?.asset]);
  const openCollection = () => { pixelSound.playConfirm(); setCollectionIndex(0); setLayer('collection'); };
  const openDetail = useCallback((entry?: ContentEntry) => { if (!entry) return; pixelSound.playConfirm(); setDetailId(entry.id); setLayer('detail'); }, []);
  const back = useCallback(() => {
    if (layer === 'detail') { setLayer('collection'); setDetailId(null); }
    else if (layer !== 'showcase') setLayer('showcase');
    else { closeLandmarkModal(); return; }
    pixelSound.playCancel();
  }, [layer, closeLandmarkModal]);
  const vertical = useCallback((step: number) => {
    if (layer === 'showcase') chooseCategory(activeCategory + step);
    else if (layer === 'collection' && categoryEntries.length) { pixelSound.playSelect(); setCollectionIndex((index) => (index + step + categoryEntries.length) % categoryEntries.length); }
  }, [layer, activeCategory, chooseCategory, categoryEntries.length]);
  useModalKeys({ isOpen, onClose: back,
    onPrev: layer === 'showcase' || layer === 'view' ? () => moveMedia(-1) : undefined,
    onNext: layer === 'showcase' || layer === 'view' ? () => moveMedia(1) : undefined,
    onUp: () => vertical(-1), onDown: () => vertical(1),
    onConfirm: layer === 'showcase' ? view : layer === 'collection' ? () => openDetail(selectedEntry) : undefined
  });
  if (!isOpen) return null;

  return <SceneModalFrame title="HOBBY STUDIO" subtitle="FAVORITE THINGS · 我的兴趣展柜" variant="collection" onClose={closeLandmarkModal}
    footer={<div className="mm-footer"><span>{category.name.toUpperCase()} · {categoryEntries.length} 个条目</span><span>{layer === 'showcase' ? '↑ ↓ 分类 · ← → 媒体 · J 查看 · K 返回' : 'K / BACK 逐层返回'}</span></div>}>
    <div className={`mm-hobby mm-hobby-layer-${layer}`}>
      <nav className="mm-hobby-categories" aria-label="兴趣分类">{HOBBIES.map((hobby, index) => { const Icon = hobby.icon; return <button key={hobby.id} className={activeCategory === index ? 'is-active' : ''} aria-pressed={activeCategory === index} onClick={() => chooseCategory(index)}><Icon /><span>{hobby.name}</span><span className="mm-category-marker" aria-hidden="true">▶</span></button>; })}</nav>
      <section className="mm-hobby-content" aria-label={`${category.label}展柜`}>
        <div className="mm-hobby-heading"><h3><CategoryIcon />{category.name.toUpperCase()}</h3><span>{activeCategory + 1} / 7</span></div>
        {layer === 'detail' && detail ? <div className="mm-detail"><ContentDetail entry={detail} onBack={back} /></div>
        : layer === 'collection' ? <div className="mm-hobby-collection" ref={collectionRef}>
            <p className="mm-collection-intro">{category.label}收藏 · 选择条目查看笔记与相关媒体</p>
            {!categoryEntries.length && <div className="mm-empty-note">这个展柜尚未添加条目。</div>}
            {categoryEntries.map((entry, index) => <button key={entry.id} data-collection-index={index} className={`mm-collection-card ${index === collectionIndex ? 'is-active' : ''}`} onFocus={() => setCollectionIndex(index)} onClick={() => { setCollectionIndex(index); openDetail(entry); }}><span className="mm-collection-thumb"><ContentMedia asset={preview(entry.cover || entry.media[0])} kind={category.id} title={entry.title} /></span><span><strong>{entry.title}</strong><small>{entry.subtitle || entry.description || '笔记待补充'}</small></span><span aria-hidden="true">▶</span></button>)}
          </div>
        : layer === 'view' && selected?.asset ? <div className="mm-hobby-view"><div className="mm-hobby-enlarged"><ContentMedia key={`${selected.entry.id}:${selected.asset.id}`} asset={selected.asset} title={selected.entry.title} kind={category.id} fit="contain" /></div><p>{selected.asset.caption || selected.entry.title}</p></div>
        : <div className="mm-hobby-showcase">
            {selected ? <>
              <div className="mm-hobby-media-row"><button className="mm-hobby-main-image" disabled={!selected.asset} onClick={view} aria-label={`查看${selected.entry.title}`}><ContentMedia asset={preview(selected.asset)} kind={category.id} title={selected.entry.title} fit="cover" /><span>{selected.asset?.type === 'video' ? '▶ VIDEO' : selected.asset ? 'VIEW ↗' : '待添加媒体'}</span></button>
                <div className="mm-hobby-thumbnails" ref={thumbsRef} aria-label="展柜媒体缩略图">{items.map((item, index) => <button key={`${item.entry.id}:${item.asset?.id || 'empty'}`} data-media-index={index} className={index === mediaIndex ? 'is-active' : ''} aria-label={item.asset?.caption || `${item.entry.title} · 媒体 ${index + 1}`} aria-pressed={index === mediaIndex} onClick={() => { pixelSound.playSelect(); setMediaIndex(index); }}><ContentMedia asset={preview(item.asset)} kind={category.id} title={item.entry.title} /><span>{item.asset?.type === 'video' ? '▶' : String(index + 1).padStart(2, '0')}</span></button>)}</div>
              </div>
              <div className="mm-hobby-caption"><strong>{selected.entry.title}</strong>{selected.entry.isSample && <span className="mm-sample">示例内容</span>}<p>{selected.asset?.caption || selected.entry.description || '描述待补充'}</p></div>
            </> : <div className="mm-empty"><CategoryIcon size={30} /><h3>{category.label}展柜待整理</h3><p>添加这一分类的条目与媒体后，会在这里展示。</p></div>}
            <div className="mm-hobby-shelf" aria-hidden="true"><PixelCamera /><PixelBook /><PixelDisc /><span>SMALL THINGS · BIG INSPIRATION</span></div>
          </div>}
        <div className="mm-actions mm-hobby-actions">{layer === 'showcase' && <><button className="mm-button" disabled={!selected?.asset} onClick={view}>{selected?.asset?.type === 'video' ? '▶ PLAY VIDEO' : 'VIEW ↗'}</button><button className="mm-button mm-button-light" onClick={openCollection}>OPEN COLLECTION</button></>}<button className="mm-button mm-button-dark" onClick={back}>← BACK</button></div>
      </section>
    </div>
  </SceneModalFrame>;
};
