import React, { useEffect, useRef, useState } from 'react';
import type { ContentEntry, ContentStatus } from '../data/contentTypes';
import { isContentUrl } from '../content/contentRepository';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelBook, PixelFilm, PixelGamepad, PixelPalette, PixelShell, PixelTag } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { ContentDetail } from './ContentDetail';
import { ContentMedia } from './ContentMedia';
import './experimentLab.css';

const FILES = [
  { id: 'film', label: '影像实验', short: 'FILM', icon: PixelFilm },
  { id: 'game', label: '游戏实验', short: 'GAME', icon: PixelGamepad },
  { id: 'interaction', label: '交互实验', short: 'INTERACTION', icon: PixelBook },
  { id: 'brand', label: '品牌实验', short: 'BRAND', icon: PixelTag },
  { id: 'visual', label: '视觉实验', short: 'VISUAL', icon: PixelPalette },
] as const;
const STATUS_LABELS: Record<ContentStatus, string> = { 'in-progress': '进行中', completed: '已归档', planned: '计划中' };
type LabView = 'archive' | 'document' | 'attachments' | 'play';

export const ExperimentLabModal: React.FC = () => {
  const { activeLandmarkModal, modalContext, currentView, isOverlayOpen, closeLandmarkModal } = useWorldStore();
  const entries = useContentStore(state => state.entries);
  const loadStatus = useContentStore(state => state.status);
  const isOpen = activeLandmarkModal === 'experiment-lab' && currentView === 'game' && !isOverlayOpen;
  const experiments = FILES.flatMap(file => entries.filter(entry => entry.kind === 'experiment' && entry.category === file.id));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<LabView>('archive');
  const listRef = useRef<HTMLElement>(null);
  const selected = experiments.find(entry => entry.id === selectedId) ?? experiments[0];
  const selectedIndex = selected ? experiments.findIndex(entry => entry.id === selected.id) : -1;
  const file = FILES.find(item => item.id === selected?.category);
  const video = selected?.media.find(asset => asset.type === 'video' && isContentUrl(asset.url));
  const demoUrl = isContentUrl(selected?.demoUrl) ? selected.demoUrl : undefined;
  const attachments = selected?.attachments?.filter(item => isContentUrl(item.url)) ?? [];
  const preview = selected?.cover ?? selected?.media.find(asset => asset.type === 'image');

  useEffect(() => {
    if (!isOpen) return;
    setView('archive');
    const requested = experiments.find(entry => entry.id === modalContext || entry.category === modalContext);
    setSelectedId(requested?.id ?? experiments[0]?.id ?? null);
  }, [isOpen, modalContext]);
  useEffect(() => {
    if (!selected) setView('archive');
    listRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected?.id]);

  const close = () => { pixelSound.playCancel(); setView('archive'); closeLandmarkModal(); };
  const back = () => { pixelSound.playCancel(); view === 'archive' ? closeLandmarkModal() : setView('archive'); };
  const choose = (entry: ContentEntry) => { setSelectedId(entry.id); setView('archive'); pixelSound.playSelect(); };
  const move = (direction: number) => {
    if (!experiments.length) return;
    choose(experiments[(selectedIndex + direction + experiments.length) % experiments.length]);
  };
  const openDocument = () => { if (selected) { pixelSound.playConfirm(); setView('document'); } };
  const openAttachments = () => { if (attachments.length) { pixelSound.playConfirm(); setView('attachments'); } };
  const openPlayer = () => { if (video) { pixelSound.playConfirm(); setView('play'); } };
  useModalKeys({ isOpen, onClose: back, onUp: view === 'archive' ? () => move(-1) : undefined,
    onDown: view === 'archive' ? () => move(1) : undefined, onConfirm: view === 'archive' ? openDocument : undefined });

  if (!isOpen) return null;
  return <SceneModalFrame title="EXPERIMENT LAB" subtitle="试试，再看看会发生什么" variant="gallery" onClose={close}
    footer={<><span><PixelShell size={12} /> 创作实验档案 · {experiments.length} 条</span><span>{view === 'archive' ? '↑↓ 选择 · J 文档 · K 返回' : 'K 返回档案 · ESC 返回'}</span></>}
  >
    {!selected ? <div className="scene-empty"><PixelBook size={30} /><h3>实验档案还没有记录</h3><p>{loadStatus === 'loading' ? '正在载入实验内容…' : '添加实验日志后，会在这里出现。'}</p><button className="scene-button" onClick={close}>返回小镇</button></div>
      : view === 'document' ? <ContentDetail entry={selected} onBack={() => setView('archive')} />
      : view === 'attachments' ? <section className="lab-resource-view">
        <button className="scene-button scene-button-muted" onClick={() => setView('archive')}>◀ 返回档案</button>
        <h3>{selected.title} · 附件</h3><p>选择文件，在新窗口打开。</p>
        <ul className="lab-attachment-list">{attachments.map(item => <li key={item.id}><PixelBook size={18} /><span>{item.title}</span><a className="scene-button" href={item.url} target="_blank" rel="noopener noreferrer">打开文件 ↗</a></li>)}</ul>
      </section>
      : view === 'play' ? <section className="lab-resource-view">
        <button className="scene-button scene-button-muted" onClick={() => setView('archive')}>◀ 返回档案</button>
        <h3>{selected.title} · 影像</h3><div className="lab-player"><ContentMedia asset={video} kind="film" title={selected.title} fit="contain" /></div>
        {video?.caption && <p>{video.caption}</p>}
      </section>
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
        <article className={`lab-record lab-record-${selected.category}`} key={selected.id}>
          <div className="lab-record-topline"><span>{file?.short} / LOG {String(selectedIndex + 1).padStart(2, '0')}</span><span>{selected.isSample ? '示例内容' : '实验记录'}</span></div>
          <div className="lab-record-art"><ContentMedia asset={preview} kind={selected.category === 'visual' ? 'art' : selected.category} title={selected.title} />
            {!preview && <span>像素示意图 · 实际封面待添加</span>}
          </div>
          <h3>{selected.title}</h3><p className="lab-record-description">{selected.description}</p>
          <div className="lab-record-tags">{selected.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          <dl className="lab-record-meta"><div><dt>日期</dt><dd>{selected.date || '待记录'}</dd></div><div><dt>状态</dt><dd className={`lab-status-${selected.status || 'none'}`}>{selected.status ? STATUS_LABELS[selected.status] : '待记录'}</dd></div><div><dt>文件</dt><dd>{selected.fileSize || '待添加'}</dd></div></dl>
          <div className="lab-record-actions">
            <button className="scene-button" onClick={openDocument}>查看文档 ▷</button>
            <button className="scene-button scene-button-muted" disabled={!attachments.length} onClick={openAttachments}>{attachments.length ? `附件 (${attachments.length}) ↗` : '附件待添加'}</button>
            {video ? <button className="scene-button lab-play-button" onClick={openPlayer}>▶ Play</button> : demoUrl ? <a className="scene-button lab-play-button" href={demoUrl} target="_blank" rel="noopener noreferrer">▶ Play</a> : <button className="scene-button lab-play-button" disabled>Play 待添加</button>}
          </div>
          {video && demoUrl && <a className="lab-extra-demo" href={demoUrl} target="_blank" rel="noopener noreferrer">打开交互 Demo ↗</a>}
        </article>
      </div>}
  </SceneModalFrame>;
};
