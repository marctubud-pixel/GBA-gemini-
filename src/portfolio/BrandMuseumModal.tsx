import React, { useEffect, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelSeagull, PixelPalette, PixelTag, PixelCart, PixelEasel } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { BrandCaseViewer } from './BrandCaseViewer';
import { ManagedProjectViewer, openExternalDetail, usesManagedViewer } from './ManagedProjectViewer';
import { ProjectCover } from './ProjectCover';
import './brandMuseum.css';
import { readPreviewContext } from '../content/projectPreview';

const PANELS = [
  { id: 'ip', title: 'IP', icon: PixelSeagull, slogan: '让角色成为品牌的好朋友。' },
  { id: 'art', title: '视觉', icon: PixelPalette, slogan: '用视觉表达更大的想象。' },
  { id: 'brand', title: '品牌', icon: PixelTag, slogan: '从策略到视觉，塑造品牌价值。' },
  { id: 'ecommerce', title: '电商', icon: PixelCart, slogan: '把好设计放进真实生活。' },
  { id: 'offline', title: '线下', icon: PixelEasel, slogan: '展览作品待补充。' },
] as const;
type BrandCategory = typeof PANELS[number]['id'];

export const BrandMuseumModal: React.FC = () => {
  const { activeLandmarkModal, modalContext, currentView, isOverlayOpen, closeLandmarkModal } = useWorldStore();
  const entries = useContentStore((state) => state.entries);
  const isOpen = activeLandmarkModal === 'brand-museum' && currentView === 'game' && !isOverlayOpen;
  const [selected, setSelected] = useState<BrandCategory>('ip');
  const [pages, setPages] = useState<Record<BrandCategory, number>>({ ip: 0, art: 0, brand: 0, ecommerce: 0, offline: 0 });
  const [detailId, setDetailId] = useState<string | null>(null);
  const brands = entries.filter((entry) => entry.kind === 'brand');
  const detail = brands.find((entry) => entry.id === detailId);
  const selectedWorks = brands.filter((entry) => entry.category === selected);
  const selectedWork = selectedWorks.length ? selectedWorks[pages[selected] % selectedWorks.length] : undefined;

  useEffect(() => {
    if (!isOpen) return;
    setDetailId(null);
    const preview = readPreviewContext(modalContext);
    const requested = brands.find((entry) => entry.id === (preview?.entryId || modalContext));
    if (requested) {
      if (PANELS.some((panel) => panel.id === requested.category)) {
        const category = requested.category as BrandCategory;
        setSelected(category);
        setPages(previous => ({ ...previous, [category]: brands.filter(entry => entry.category === category).findIndex(entry => entry.id === requested.id) }));
      }
      setDetailId(preview?.page === 'panel' ? null : requested.id);
    } else if (PANELS.some((panel) => panel.id === modalContext)) setSelected(modalContext as BrandCategory);
  }, [isOpen, modalContext]);
  const close = () => { pixelSound.playCancel(); setDetailId(null); closeLandmarkModal(); };
  const openCase = (id: string) => {
    const entry = brands.find(item => item.id === id);
    if (!entry) return;
    if (PANELS.some(panel => panel.id === entry.category)) {
      const category = entry.category as BrandCategory;
      const categoryIndex = brands.filter(item => item.category === category).findIndex(item => item.id === id);
      setSelected(category);
      setPages(previous => ({ ...previous, [category]: categoryIndex }));
    }
    pixelSound.playConfirm(); if (!openExternalDetail(entry)) setDetailId(id);
  };
  const selectPanel = (direction: number) => {
    const index = PANELS.findIndex((panel) => panel.id === selected);
    setSelected(PANELS[(index + direction + PANELS.length) % PANELS.length].id);
    pixelSound.playSelect();
  };
  const turnPage = (category: BrandCategory, direction: number) => {
    const count = brands.filter((entry) => entry.category === category).length;
    if (count < 2) return;
    setPages((previous) => ({ ...previous, [category]: (previous[category] + direction + count) % count }));
    setSelected(category); pixelSound.playSelect();
  };
  useModalKeys({
    isOpen: isOpen && !detail, onClose: close,
    onPrev: () => selectPanel(-1), onNext: () => selectPanel(1),
    onUp: () => turnPage(selected, -1), onDown: () => turnPage(selected, 1),
    onConfirm: !selectedWork ? undefined : () => openCase(selectedWork.id),
  });

  if (!isOpen) return null;
  return (<>
    <div className="brand-museum-base" aria-hidden={detail ? true : undefined}>
    <SceneModalFrame title="BRAND & VISUAL" subtitle="让品牌具象化" variant="gallery" onClose={close}
      footer={<span className="brand-navigation-hint">←→ 选择 · ↑↓ 切换 · J 查看</span>}
    >
      <div className="brand-exhibition">
        <div className="brand-panels">{PANELS.map(({ id, title, icon: Icon, slogan }) => {
          const works = brands.filter((entry) => entry.category === id);
          const visiblePage = works.length ? pages[id] % works.length : 0;
          const entry = works[visiblePage];
          return <section key={id} data-brand-category={id} className={`brand-panel ${selected === id ? 'is-active' : ''}`} onMouseEnter={() => setSelected(id)}>
            <button className="brand-panel-label" onFocus={() => setSelected(id)} onClick={() => setSelected(id)} aria-pressed={selected === id}><Icon size={20} /><h3>{title}</h3></button>
            <div className="brand-panel-content">
            <button className="brand-panel-art brand-art-entry" disabled={!entry} onFocus={() => setSelected(id)} onClick={() => entry && openCase(entry.id)} aria-label={entry ? `打开${entry.title}完整案例` : `${title}作品待补充`}><ProjectCover asset={entry?.cover} layout={entry?.coverLayout} kind={`brand-${id}`} title={entry?.title ?? title} /></button>
            {entry && <h4>{entry.title}</h4>}
            <p>{entry?.description ?? slogan}</p>
            {entry?.isSample && <small className="scene-sample-label">示例内容</small>}
            </div>
          </section>;
        })}</div>
      </div>
    </SceneModalFrame>
    </div>
    {detail && (usesManagedViewer(detail) ? <ManagedProjectViewer entries={brands} entryId={detail.id} onEntryChange={openCase} onClose={() => setDetailId(null)} /> : <BrandCaseViewer entries={brands} entryId={detail.id} onEntryChange={openCase} onClose={() => { pixelSound.playCancel(); setDetailId(null); }} />)}
  </>);
};
