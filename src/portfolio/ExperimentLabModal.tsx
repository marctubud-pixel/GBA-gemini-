import React, { useEffect, useRef, useState } from 'react';
import type { ContentEntry } from '../data/contentTypes';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelBook, PixelFilm, PixelGamepad, PixelPalette, PixelShell, PixelTag } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { CompleteProjectViewer } from './CompleteProjectViewer';
import './experimentLab.css';

const FILES = [
  { id: 'film', label: '影像实验', short: 'FILM', icon: PixelFilm },
  { id: 'game', label: '游戏实验', short: 'GAME', icon: PixelGamepad },
  { id: 'interaction', label: '交互实验', short: 'INTERACTION', icon: PixelBook },
  { id: 'brand', label: '品牌实验', short: 'BRAND', icon: PixelTag },
  { id: 'visual', label: '视觉实验', short: 'VISUAL', icon: PixelPalette },
] as const;
const briefIntroduction = (description: string) => description.trim().split(/(?<=[。！？!?])\s*/)[0] || '项目介绍待补充。';

export const ExperimentLabModal: React.FC = () => {
  const { activeLandmarkModal, modalContext, currentView, isOverlayOpen, closeLandmarkModal } = useWorldStore();
  const entries = useContentStore(state => state.entries);
  const loadStatus = useContentStore(state => state.status);
  const isOpen = activeLandmarkModal === 'experiment-lab' && currentView === 'game' && !isOverlayOpen;
  const experiments = FILES.flatMap(file => entries.filter(entry => entry.kind === 'experiment' && entry.category === file.id));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const listRef = useRef<HTMLElement>(null);
  const selected = experiments.find(entry => entry.id === selectedId) ?? experiments[0];
  const selectedIndex = selected ? experiments.findIndex(entry => entry.id === selected.id) : -1;

  useEffect(() => {
    if (!isOpen) return;
    setShowDetail(false);
    const requested = experiments.find(entry => entry.id === modalContext || entry.category === modalContext);
    setSelectedId(requested?.id ?? experiments[0]?.id ?? null);
  }, [isOpen, modalContext]);
  useEffect(() => {
    if (!selected) setShowDetail(false);
    listRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected?.id]);

  const close = () => { pixelSound.playCancel(); setShowDetail(false); closeLandmarkModal(); };
  const closeDetail = () => { pixelSound.playCancel(); setShowDetail(false); };
  const choose = (entry: ContentEntry) => { setSelectedId(entry.id); pixelSound.playSelect(); };
  const move = (direction: number) => {
    if (!experiments.length) return;
    choose(experiments[(selectedIndex + direction + experiments.length) % experiments.length]);
  };
  const openDetail = () => { if (selected) { pixelSound.playConfirm(); setShowDetail(true); } };
  const changeDetail = (id: string) => {
    const entry = experiments.find(item => item.id === id);
    if (entry) choose(entry);
  };
  useModalKeys({ isOpen: isOpen && !showDetail, onClose: close, onUp: () => move(-1),
    onDown: () => move(1), onConfirm: selected ? openDetail : undefined });

  if (!isOpen) return null;
  return <>
    <div className="experiment-lab-base" aria-hidden={showDetail ? true : undefined}>
    <SceneModalFrame title="EXPERIMENT LAB" subtitle="试试，再看看会发生什么" variant="gallery" onClose={close}
    footer={<><span><PixelShell size={12} /> 创作实验档案 · {experiments.length} 条</span><span>↑↓ 选择 · J 详情 · K 返回</span></>}
  >
    {!selected ? <div className="scene-empty"><PixelBook size={30} /><h3>实验档案还没有记录</h3><p>{loadStatus === 'loading' ? '正在载入实验内容…' : '添加实验日志后，会在这里出现。'}</p></div>
      : <div className="lab-archive">
        <aside className="lab-file-cabinet" aria-label="实验日志列表" ref={listRef}>
          <div className="lab-cabinet-title"><PixelBook size={16} /><h3>实验日志</h3><span>FILES</span></div>
          {FILES.map(({ id, label, short, icon: Icon }, categoryIndex) => {
            const records = experiments.filter(entry => entry.category === id);
            return <div className={`lab-file-group lab-file-${id}`} key={id}>
              {records.length ? records.map((entry, recordIndex) => <button className={`lab-file-tab ${entry.id === selected.id ? 'is-active' : ''}`} key={entry.id} onClick={() => choose(entry)} aria-pressed={entry.id === selected.id}>
                <Icon size={18} /><span><strong>{records.length === 1 ? label : entry.title}</strong><small>0{categoryIndex + 1}{records.length > 1 ? `.${recordIndex + 1}` : ''} / {short}</small></span><i aria-hidden="true">{entry.id === selected.id ? '▶' : '·'}</i>
              </button>) : <button className="lab-file-tab" disabled><Icon size={18} /><span><strong>{label}</strong><small>暂无日志 / {short}</small></span></button>}
            </div>;
          })}
          <small className="lab-cabinet-note">每一个想法，都值得留下记录。</small>
        </aside>
        <article className={`lab-record lab-record-${selected.category}`}>
          <div className="lab-record-intro">
            <h3>{selected.title}</h3>
            <p className="lab-record-description">{briefIntroduction(selected.description)}</p>
          </div>
          <div className="lab-record-actions">
            <button className="scene-button lab-detail-button" onClick={openDetail}>查看详情 ↗</button>
          </div>
        </article>
      </div>}
    </SceneModalFrame>
    </div>
    {showDetail && selected && <CompleteProjectViewer entries={experiments} entryId={selected.id} onEntryChange={changeDetail} onClose={closeDetail} returnLabel="返回实验档案" />}
  </>;
};
