import React, { useEffect, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelSeagull, PixelPalette, PixelTag, PixelCart, PixelShell } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { ContentDetail } from './ContentDetail';
import { ContentMedia } from './ContentMedia';

const PANELS = [
  { id: 'ip', title: 'IP', icon: PixelSeagull, slogan: '让角色成为品牌的好朋友。' },
  { id: 'art', title: '视觉', icon: PixelPalette, slogan: '用视觉表达更大的想象。' },
  { id: 'brand', title: '品牌', icon: PixelTag, slogan: '从策略到视觉，塑造品牌价值。' },
  { id: 'ecommerce', title: '电商', icon: PixelCart, slogan: '把好设计放进真实生活。' },
] as const;
type BrandCategory = typeof PANELS[number]['id'];

export const BrandMuseumModal: React.FC = () => {
  const { activeLandmarkModal, modalContext, currentView, isOverlayOpen, closeLandmarkModal } = useWorldStore();
  const entries = useContentStore((state) => state.entries);
  const isOpen = activeLandmarkModal === 'brand-museum' && currentView === 'game' && !isOverlayOpen;
  const [selected, setSelected] = useState<BrandCategory>('ip');
  const [pages, setPages] = useState<Record<BrandCategory, number>>({ ip: 0, art: 0, brand: 0, ecommerce: 0 });
  const [detailId, setDetailId] = useState<string | null>(null);
  const brands = entries.filter((entry) => entry.kind === 'brand');
  const detail = brands.find((entry) => entry.id === detailId);
  const selectedWorks = brands.filter((entry) => entry.category === selected);
  const selectedWork = selectedWorks.length ? selectedWorks[pages[selected] % selectedWorks.length] : undefined;

  useEffect(() => {
    if (!isOpen) return;
    setDetailId(null);
    const requested = brands.find((entry) => entry.id === modalContext);
    if (requested) {
      if (PANELS.some((panel) => panel.id === requested.category)) setSelected(requested.category as BrandCategory);
      setDetailId(requested.id);
    } else if (PANELS.some((panel) => panel.id === modalContext)) setSelected(modalContext as BrandCategory);
  }, [isOpen, modalContext]);
  const close = () => { pixelSound.playCancel(); setDetailId(null); closeLandmarkModal(); };
  const openCase = (id: string) => { pixelSound.playConfirm(); setDetailId(id); };
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
    isOpen, onClose: () => detail ? setDetailId(null) : close(),
    onPrev: detail ? undefined : () => selectPanel(-1), onNext: detail ? undefined : () => selectPanel(1),
    onUp: detail ? undefined : () => turnPage(selected, -1), onDown: detail ? undefined : () => turnPage(selected, 1),
    onConfirm: detail || !selectedWork ? undefined : () => openCase(selectedWork.id),
  });

  if (!isOpen) return null;
  return (
    <SceneModalFrame title="BRAND & VISUAL" subtitle="让品牌具象化" variant="gallery" onClose={close}
      footer={<><span><PixelShell size={12} /> 视觉需要策略</span><span>←→ 选择 · ↑↓ 换件 · J 案例 · K 返回</span></>}
    >
      {detail ? <ContentDetail entry={detail} onBack={() => setDetailId(null)} /> : <div className="brand-exhibition">
        <div className="brand-panels">{PANELS.map(({ id, title, icon: Icon, slogan }, index) => {
          const works = brands.filter((entry) => entry.category === id);
          const visiblePage = works.length ? pages[id] % works.length : 0;
          const entry = works[visiblePage];
          return <section key={id} className={`brand-panel ${selected === id ? 'is-active' : ''}`} onMouseEnter={() => setSelected(id)}>
            <button className="brand-panel-label" onClick={() => setSelected(id)} aria-pressed={selected === id}><Icon size={20} /><h3>{title}</h3><span>0{index + 1}</span></button>
            <div className="brand-panel-content">
            <div className="brand-panel-art"><ContentMedia asset={entry?.cover} kind={`brand-${id}`} title={entry?.title ?? title} fit="contain" /></div>
            <h4>{entry?.title ?? title}</h4>
            <p>{entry?.description ?? slogan}</p>
            {entry?.isSample && <small className="scene-sample-label">示例内容</small>}
            {works.length > 1 && <div className="scene-pagination"><button onClick={() => turnPage(id, -1)} aria-label={`${title}上一个案例`}>◀</button><span>{visiblePage + 1} / {works.length}</span><button onClick={() => turnPage(id, 1)} aria-label={`${title}下一个案例`}>▶</button></div>}
            </div>
            <button className="scene-button brand-case-button" disabled={!entry} onClick={() => entry && openCase(entry.id)}>{entry ? '查看案例 ▶' : '暂无案例'}</button>
          </section>;
        })}</div>
        <div className="brand-seaside" aria-hidden="true"><PixelShell size={16} /><i /><span>SAME SKIES · BRIGHTER IDEAS</span><i /><PixelSeagull size={20} /></div>
      </div>}
    </SceneModalFrame>
  );
};
