import React, { useEffect, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import type { ContentKind } from '../data/contentTypes';
import { WORLD_LOCATIONS } from '../data/locations';
import { PixelBook, PixelBike } from '../shell/PixelIcons';
import './sceneModal.css';
import { openExternalDetail } from './ManagedProjectViewer';

const KIND_LABELS: Record<ContentKind, string> = {
  writing: '文案与叙事', brand: '品牌与视觉', film: '电影与影像',
  'game-experience': '游戏经历', 'game-project': '游戏制作', hobby: '个人爱好', experiment: '创作实验', general: '世界与探索',
};

export const ProjectIndex: React.FC = () => {
  const { currentView, isOverlayOpen, setCurrentView, openContentOverlay, teleportToLocation } = useWorldStore();
  const entries = useContentStore((state) => state.entries);
  const status = useContentStore((state) => state.status);
  const [selectedKind, setSelectedKind] = useState<ContentKind | 'all'>('all');
  const isOpen = currentView === 'index';
  const kinds = Array.from(new Set(entries.map((entry) => entry.kind)));
  const filtered = selectedKind === 'all' ? entries : entries.filter((entry) => entry.kind === selectedKind);
  const openEntry = (id: string) => { const entry = entries.find(item => item.id === id); if (!openExternalDetail(entry)) openContentOverlay(id); };

  useEffect(() => {
    if (!isOpen || isOverlayOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Escape' && event.code !== 'KeyK') return;
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
      if (!event.repeat) setCurrentView('game');
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isOpen, isOverlayOpen, setCurrentView]);

  if (!isOpen) return null;
  return <div className="portfolio-index"><main className="portfolio-index-content">
    <header className="portfolio-index-header">
      <div><span className="portfolio-index-eyebrow">MY WORLD · QUICK EXPLORER</span><h1><PixelBook size={24} /> 作品全览索引</h1><p>直接阅读作品详情，或回到小镇继续探索。</p></div>
      <button className="scene-button scene-button-muted" onClick={() => setCurrentView('game')}>返回小镇 ×</button>
    </header>
    <nav className="portfolio-index-filters" aria-label="作品领域">
      <button className={selectedKind === 'all' ? 'is-active' : ''} onClick={() => setSelectedKind('all')}>全部作品</button>
      {kinds.map((kind) => <button key={kind} className={selectedKind === kind ? 'is-active' : ''} onClick={() => setSelectedKind(kind)}>{KIND_LABELS[kind]}</button>)}
      <span>{filtered.length} 件</span>
    </nav>
    <div className="portfolio-index-status" aria-live="polite">
      {status === 'loading' && '正在载入作品内容…'}
      {status === 'error' && '内容暂未更新，继续显示已有作品。'}
      {status === 'local' && '当前按简历内容占位。作品图来自简历，影片、Demo 与详细项目说明待补充。'}
    </div>
    <div className="portfolio-index-grid">{filtered.map((entry) => {
      const location = WORLD_LOCATIONS.find((item) => item.id === entry.locationId);
      return <article className="portfolio-index-card" key={entry.id}>
        <div className="portfolio-index-card-meta"><span>{KIND_LABELS[entry.kind]}</span><span>{entry.isSample ? '示例内容' : entry.source || entry.date}</span></div>
        <h2>{entry.title}</h2>
        {entry.subtitle && <p className="portfolio-index-card-subtitle">{entry.subtitle}</p>}
        <p className="portfolio-index-card-description">{entry.description}</p>
        <div className="portfolio-index-tags">{entry.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="portfolio-index-card-actions">
          <button className="scene-button" onClick={() => openEntry(entry.id)}>查看详情 ▶</button>
          {entry.locationId && <button className="scene-button scene-button-muted" onClick={() => teleportToLocation(entry.locationId!)} title={`前往${location?.name ?? '对应地标'}`}><PixelBike size={16} /> 前往地标</button>}
        </div>
        {location && <small className="portfolio-index-location">{location.name}</small>}
      </article>;
    })}</div>
    {filtered.length === 0 && <div className="scene-empty"><PixelBook size={32} /><h2>这个领域还没有作品</h2><p>选择其他领域继续浏览。</p></div>}
  </main></div>;
};
