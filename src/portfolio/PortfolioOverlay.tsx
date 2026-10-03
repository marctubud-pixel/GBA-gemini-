import React from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import { projectToContentEntry } from '../data/contentSeed';
import { WORLD_LOCATIONS } from '../data/locations';
import { ContentDetail } from './ContentDetail';
import { usesManagedViewer } from './ManagedProjectViewer';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';

export const PortfolioOverlay: React.FC = () => {
  const { isOverlayOpen, activeContentId, activeProject, activeLocation, currentView, closeOverlay, openContentOverlay } = useWorldStore();
  const entries = useContentStore((state) => state.entries);
  const status = useContentStore((state) => state.status);
  const entry = activeContentId ? entries.find((item) => item.id === activeContentId)
    : activeProject ? entries.find((item) => item.id === activeProject.id) ?? (status === 'ready' ? undefined : projectToContentEntry(activeProject))
    : undefined;
  const related = entry ? entries.filter((item) => item.kind === entry.kind && (!entry.locationId || item.locationId === entry.locationId)) : [];
  const currentIndex = entry ? related.findIndex((item) => item.id === entry.id) : -1;
  const location = WORLD_LOCATIONS.find((item) => item.id === entry?.locationId) ?? activeLocation;
  const navigate = (direction: number) => {
    if (!related.length) return;
    const nextIndex = currentIndex < 0 ? (direction > 0 ? 0 : related.length - 1)
      : (currentIndex + direction + related.length) % related.length;
    openContentOverlay(related[nextIndex].id);
  };
  useModalKeys({ isOpen: isOverlayOpen && !usesManagedViewer(entry), onClose: closeOverlay, onPrev: () => navigate(-1), onNext: () => navigate(1) });

  if (!isOverlayOpen) return null;
  return <div className="portfolio-content-overlay">
    <SceneModalFrame title="WORK DETAIL" subtitle={entry ? location?.name ?? '作品详情' : `${location?.name ?? '作品'} · 内容待添加`} onClose={closeOverlay}
      variant={entry?.kind === 'writing' ? 'book' : entry?.kind === 'film' ? 'ticket' : 'gallery'}
      footer={<><span>{entry ? 'K / ESC 返回 · ←→ 同领域作品' : 'K / ESC 关闭并返回'}</span>{related.length > 1 && <div className="portfolio-overlay-navigation"><button onClick={() => navigate(-1)} aria-label="上一个作品">◀</button><span>{currentIndex >= 0 ? `${currentIndex + 1} / ${related.length}` : `${related.length} 件相关作品`}</span><button onClick={() => navigate(1)} aria-label="下一个作品">▶</button></div>}</>}
    >
      {entry ? <ContentDetail key={entry.id} entry={entry} onBack={closeOverlay} />
        : <div className="scene-empty"><h3>{location?.name ?? '作品'} · 暂无内容</h3><p>{currentView === 'index' ? '返回索引后选择其他作品。' : '关闭窗口，继续探索小镇。'}</p><button className="scene-button" onClick={closeOverlay}>关闭并返回 ▶</button></div>}
    </SceneModalFrame>
  </div>;
};
