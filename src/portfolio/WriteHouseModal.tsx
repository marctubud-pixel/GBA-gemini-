import { useEffect, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelBook, PixelCart, PixelTV, PixelUsers, PixelTag } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { WritingProjectDetail, getWritingMedia } from './WritingProjectDetail';
import './writingHouse.css';

const CATEGORIES = [
  { id: 'tvc', title: 'TVC 文案', icon: PixelTV },
  { id: 'brand', title: '品牌文案', icon: PixelTag },
  { id: 'ecommerce', title: '电商文案', icon: PixelCart },
  { id: 'audience', title: '人群文案', icon: PixelUsers },
] as const;
type WritingCategory = typeof CATEGORIES[number]['id'];

const WritingPageTrim = () => <svg className="writing-page-trim" viewBox="0 0 600 220" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
  <path d="M5 18V5H20M580 5H595V18M5 202V215H20M580 215H595V202" fill="none" stroke="#76bcea" strokeWidth="2" />
  <path d="M12 12H24M12 12V24M576 12H588V24M12 196V208H24M576 208H588V196" fill="none" stroke="#bfd9e5" strokeWidth="1" />
  <path d="M24 214H32V212H40V214H48V212H56V214H64M536 214H544V212H552V214H560V212H568V214H576" fill="none" stroke="#4f9dcc" strokeWidth="2" />
  <path d="M26 5H30V1H34V5H38V9H34V13H30V9H26ZM562 5H566V1H570V5H574V9H570V13H566V9H562Z" fill="#d5a457" />
</svg>;

export const WriteHouseModal = () => {
  const { activeLandmarkModal, modalContext, currentView, isOverlayOpen, closeLandmarkModal } = useWorldStore();
  const entries = useContentStore(state => state.entries);
  const isOpen = activeLandmarkModal === 'write-house' && currentView === 'game' && !isOverlayOpen;
  const [category, setCategory] = useState<WritingCategory>('tvc');
  const [page, setPage] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const writing = entries.filter(entry => entry.kind === 'writing');
  const works = writing.filter(entry => entry.category === category);
  const visiblePage = works.length ? page % works.length : 0;
  const currentWork = works[visiblePage];
  const detail = writing.find(entry => entry.id === detailId);
  const media = detail ? getWritingMedia(detail) : [];

  useEffect(() => {
    if (!isOpen) return;
    setDetailId(null); setPage(0); setMediaIndex(0); setZoomed(false);
    const requested = writing.find(entry => entry.id === modalContext);
    if (requested) {
      if (CATEGORIES.some(item => item.id === requested.category)) setCategory(requested.category as WritingCategory);
      setPage(Math.max(0, writing.filter(entry => entry.category === requested.category).findIndex(entry => entry.id === requested.id)));
      setDetailId(requested.id);
    } else if (CATEGORIES.some(item => item.id === modalContext)) setCategory(modalContext as WritingCategory);
  }, [isOpen, modalContext]);
  useEffect(() => { setMediaIndex(0); setZoomed(false); }, [detailId]);

  const selectCategory = (next: WritingCategory) => {
    pixelSound.playSelect(); setCategory(next); setPage(0); setDetailId(null); setZoomed(false);
  };
  const changeCategory = (direction: number) => {
    const index = CATEGORIES.findIndex(item => item.id === category);
    selectCategory(CATEGORIES[(index + direction + CATEGORIES.length) % CATEGORIES.length].id);
  };
  const turnProject = (direction: number) => {
    if (works.length < 2) return;
    pixelSound.playSelect(); setPage(previous => (previous + direction + works.length) % works.length);
  };
  const turnImage = (direction: number) => {
    if (media.length < 2) return;
    pixelSound.playSelect(); setMediaIndex(previous => (previous + direction + media.length) % media.length);
  };
  const openSeries = () => {
    if (!currentWork) return;
    pixelSound.playConfirm(); setDetailId(currentWork.id); setMediaIndex(0);
  };
  const close = () => { pixelSound.playCancel(); setDetailId(null); setZoomed(false); closeLandmarkModal(); };
  const back = () => {
    pixelSound.playCancel();
    if (zoomed) setZoomed(false);
    else if (detail) setDetailId(null);
    else closeLandmarkModal();
  };
  const scrollDetail = (direction: number) => {
    const area = document.querySelector<HTMLElement>(zoomed ? '.writing-zoom-viewport' : '.writing-project-prose')
      ?? document.querySelector<HTMLElement>('.writing-detail-scroll');
    area?.scrollBy({ top: direction * 75, behavior: 'auto' });
  };
  useModalKeys({
    isOpen, onClose: back,
    onPrev: detail ? () => turnImage(-1) : () => turnProject(-1),
    onNext: detail ? () => turnImage(1) : () => turnProject(1),
    onUp: detail ? () => scrollDetail(-1) : () => changeCategory(-1),
    onDown: detail ? () => scrollDetail(1) : () => changeCategory(1),
    onConfirm: detail ? () => media.length && setZoomed(!zoomed) : openSeries,
  });

  if (!isOpen) return null;
  return <SceneModalFrame title="WRITE HOUSE" variant="book" onClose={close}
    footer={<><span><PixelBook size={12} /> 文案工坊</span><span>{detail ? 'A / D 切图 · W / S 阅读 · J 放大 · K 返回' : 'W / S 分类 · A / D 项目 · J 查看 · K 返回'}</span></>}>
    <div className="writing-surface"><WritingPageTrim />{detail ? <div className="writing-detail">
      <div className="writing-detail-scroll"><WritingProjectDetail entry={detail} mediaIndex={mediaIndex} onMediaIndexChange={setMediaIndex} zoomed={zoomed} onZoomChange={setZoomed} /></div>
      <div className="writing-detail-actions"><button className="scene-button scene-button-muted" onClick={() => { setZoomed(false); setDetailId(null); }}>◀ 返回项目</button></div>
    </div> : <div className="writing-house">
      <nav className="writing-house-categories" aria-label="文案分类">{CATEGORIES.map(({ id, title, icon: Icon }) => <button key={id} className={category === id ? 'is-active' : ''} onClick={() => selectCategory(id)} aria-pressed={category === id}><span aria-hidden="true">{category === id ? '▶' : '·'}</span><Icon size={18} /><span>{title}</span></button>)}</nav>
      <section className="writing-house-preview" aria-label="项目预览">
        {currentWork ? <><div className="writing-house-summary"><h3>{currentWork.title}</h3><p>{currentWork.description}</p></div>
          <div className="writing-house-actions"><button className="scene-button" onClick={openSeries}>查看系列 ▶</button>{works.length > 1 && <div className="scene-pagination"><button onClick={() => turnProject(-1)} aria-label="上一个项目">◀</button><span>{visiblePage + 1} / {works.length}</span><button onClick={() => turnProject(1)} aria-label="下一个项目">▶</button></div>}</div>
        </> : <div className="writing-house-empty"><h3>暂未添加项目</h3><p>请选择其他文案分类。</p></div>}
      </section>
    </div>}</div>
  </SceneModalFrame>;
};
