import React, { useEffect, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import type { ContentEntry } from '../data/contentTypes';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelBook, PixelCart, PixelShell, PixelTV, PixelUsers, PixelTag } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { ContentDetail } from './ContentDetail';
import { ContentMedia } from './ContentMedia';

const SECTIONS = ['IDEA', 'WORDS', 'LIFE'] as const;
type WritingSection = typeof SECTIONS[number];
const CATEGORIES = [
  { id: 'tvc', title: 'TVC 文案', icon: PixelTV },
  { id: 'brand', title: '品牌文案', icon: PixelTag },
  { id: 'ecommerce', title: '电商文案', icon: PixelCart },
  { id: 'audience', title: '人群文案', icon: PixelUsers },
] as const;
type WritingCategory = typeof CATEGORIES[number]['id'];
const SECTION_COPY: Record<WritingSection, { title: string; description: string }> = {
  IDEA: { title: '创意手记', description: '从一个问题，到一句可以被记住的话。' },
  WORDS: { title: '文案作品', description: '文字有节奏，故事有温度。' },
  LIFE: { title: '日常与观察', description: '把生活里的细小发现，写成新的可能。' },
};
function belongsToSection(entry: ContentEntry, section: WritingSection) {
  return (entry.section ?? 'WORDS') === section;
}

export const WriteHouseModal: React.FC = () => {
  const { activeLandmarkModal, modalContext, currentView, isOverlayOpen, closeLandmarkModal } = useWorldStore();
  const entries = useContentStore((state) => state.entries);
  const isOpen = activeLandmarkModal === 'write-house' && currentView === 'game' && !isOverlayOpen;
  const [section, setSection] = useState<WritingSection>('WORDS');
  const [category, setCategory] = useState<WritingCategory>('tvc');
  const [page, setPage] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);
  const writing = entries.filter((entry) => entry.kind === 'writing');
  const works = writing.filter((entry) => entry.category === category && belongsToSection(entry, section));
  const visiblePage = works.length ? page % works.length : 0;
  const currentWork = works[visiblePage];
  const detail = writing.find((entry) => entry.id === detailId);
  const series = detail ? writing.filter((entry) => entry.category === detail.category && (entry.section ?? 'WORDS') === (detail.section ?? 'WORDS')) : [];

  useEffect(() => {
    if (!isOpen) return;
    setDetailId(null);
    setPage(0);
    const requested = writing.find((entry) => entry.id === modalContext);
    if (requested) {
      setSection(requested.section ?? 'WORDS');
      if (CATEGORIES.some((item) => item.id === requested.category)) setCategory(requested.category as WritingCategory);
      setDetailId(requested.id);
    } else if (CATEGORIES.some((item) => item.id === modalContext)) {
      setCategory(modalContext as WritingCategory);
    }
  }, [isOpen, modalContext]);

  const selectSection = (next: WritingSection) => {
    pixelSound.playSelect(); setSection(next); setPage(0); setDetailId(null);
  };
  const selectCategory = (next: WritingCategory) => {
    pixelSound.playSelect(); setCategory(next); setPage(0); setDetailId(null);
  };
  const turnPage = (direction: number) => {
    if (works.length < 2) return;
    pixelSound.playSelect(); setPage((previous) => (previous + direction + works.length) % works.length);
  };
  const openSeries = () => {
    if (!currentWork) return;
    pixelSound.playConfirm(); setDetailId(currentWork.id);
  };
  const close = () => {
    pixelSound.playCancel(); setDetailId(null); closeLandmarkModal();
  };
  const changeCategory = (direction: number) => {
    const index = CATEGORIES.findIndex((item) => item.id === category);
    selectCategory(CATEGORIES[(index + direction + CATEGORIES.length) % CATEGORIES.length].id);
  };
  useModalKeys({
    isOpen, onClose: () => detail ? setDetailId(null) : close(),
    onPrev: detail ? undefined : () => turnPage(-1), onNext: detail ? undefined : () => turnPage(1),
    onUp: detail ? undefined : () => changeCategory(-1), onDown: detail ? undefined : () => changeCategory(1),
    onConfirm: detail ? undefined : openSeries,
  });

  if (!isOpen) return null;
  return (
    <SceneModalFrame
      title="WRITE HOUSE" subtitle="WORDS MAKE A BRIGHTER TOMORROW" variant="book" onClose={close}
      footer={<><span><PixelBook size={12} /> 文案工坊 · {SECTION_COPY[section].title}</span><span>↑↓ 分类 · ←→ 翻页 · J 查看 · K 返回</span></>}
    >
      {detail ? <>
        {series.length > 1 && <nav className="writing-series" aria-label="同系列作品">{series.map((entry) => (
          <button key={entry.id} className={`scene-button scene-button-muted ${entry.id === detail.id ? 'is-active' : ''}`} onClick={() => setDetailId(entry.id)}>{entry.title}</button>
        ))}</nav>}
        <ContentDetail entry={detail} onBack={() => setDetailId(null)} />
      </> : (
        <div className="writing-book">
          <nav className="writing-book-tabs" aria-label="内容分区">{SECTIONS.map((tab) => (
            <button key={tab} className={section === tab ? 'is-active' : ''} onClick={() => selectSection(tab)} aria-pressed={section === tab}>{tab}</button>
          ))}</nav>
          <div className="writing-book-spread">
            <section className="writing-book-left">
              <div className="writing-book-badge"><PixelShell size={22} /><div><h3>{SECTION_COPY[section].title}</h3><span>WRITING PORTFOLIO</span></div></div>
              <p className="writing-book-description">{SECTION_COPY[section].description}</p>
              <nav className="writing-categories" aria-label="文案分类">{CATEGORIES.map(({ id, title, icon: Icon }) => {
                const count = writing.filter((entry) => entry.category === id && belongsToSection(entry, section)).length;
                return <button key={id} className={category === id ? 'is-active' : ''} onClick={() => selectCategory(id)} aria-pressed={category === id}><span className="writing-category-arrow">{category === id ? '▶' : '·'}</span><Icon size={18} /><span>{title}</span><small>{count}</small></button>;
              })}</nav>
              <div className="writing-book-note">好文字，<br />让日常变得更明亮。</div>
            </section>
            <section className="writing-book-right">
              {currentWork ? <>
                <div className="writing-preview-art"><ContentMedia asset={currentWork.cover} kind={currentWork.kind} title={currentWork.title} fit="cover" /><span className="writing-preview-stamp">A BRIGHTER YOU</span></div>
                <h3>{currentWork.title}</h3>
                {(currentWork.subtitle || currentWork.isSample) && <p className="writing-work-subtitle">{[currentWork.subtitle, currentWork.isSample ? '示例内容' : ''].filter(Boolean).join(' · ')}</p>}
                <div className="writing-work-excerpt">{currentWork.body ?? currentWork.description}</div>
                <div className="writing-book-actions">
                  <button className="scene-button" onClick={openSeries}>查看系列 ▶</button>
                  <div className="scene-pagination"><button disabled={works.length < 2} onClick={() => turnPage(-1)} aria-label="上一篇">◀</button><span>{visiblePage + 1} / {works.length}</span><button disabled={works.length < 2} onClick={() => turnPage(1)} aria-label="下一篇">▶</button></div>
                </div>
              </> : <div className="scene-empty"><PixelBook size={34} /><h3>{SECTION_COPY[section].title}</h3><p>这个分类还没有作品。</p><small>请选择其他分类继续阅读。</small></div>}
            </section>
          </div>
        </div>
      )}
    </SceneModalFrame>
  );
};
