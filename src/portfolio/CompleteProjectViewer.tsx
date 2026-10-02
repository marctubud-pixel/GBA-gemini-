import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { isContentUrl } from '../content/contentRepository';
import './completeProjectViewer.css';

export interface CompleteProjectViewerProps {
  entries: ContentEntry[];
  entryId: string;
  onEntryChange: (id: string) => void;
  onClose: () => void;
  returnLabel: string;
}

const CONTROL_KEYS = new Set([
  'Escape', 'KeyK', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyE',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Space',
]);
const FOCUSABLE = 'button:not(:disabled), a[href], video[controls], [tabindex="0"]';
const EXPERIMENT_CATEGORIES: Record<string, string> = {
  film: '影像实验', game: '游戏实验', interaction: '交互实验', brand: '品牌实验', visual: '视觉实验',
};

const CompleteProjectAsset: React.FC<{ asset: MediaAsset; title: string; index: number }> = ({ asset, title, index }) => {
  const [failed, setFailed] = useState(false);
  return <figure className="complete-project-figure" data-media-index={index}>
    {failed ? <div className="complete-project-media-empty" role="status"><span aria-hidden="true">▧</span><p>这份作品暂时无法加载</p></div>
      : asset.type === 'video' ? <video controls playsInline preload="metadata" aria-label={`${title} · 影片 ${index + 1}`}
        poster={isContentUrl(asset.poster) ? asset.poster : undefined} onError={() => setFailed(true)}><source src={asset.url} /></video>
        : <img src={asset.url} alt={`${title} · 作品图 ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} onError={() => setFailed(true)} />}
    <figcaption>{String(index + 1).padStart(2, '0')}</figcaption>
  </figure>;
};

/** A complete project layer shared by experiment records and interactive games. */
export const CompleteProjectViewer: React.FC<CompleteProjectViewerProps> = ({ entries, entryId, onEntryChange, onClose, returnLabel }) => {
  const index = entries.findIndex(entry => entry.id === entryId);
  const currentIndex = index >= 0 ? index : 0;
  const entry = entries[currentIndex];
  const dialogRef = useRef<HTMLElement>(null);
  const returnRef = useRef<HTMLButtonElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLElement>(null);
  const callbacks = useRef({ entries, currentIndex, onEntryChange, onClose });
  callbacks.current = { entries, currentIndex, onEntryChange, onClose };
  const hasEntry = Boolean(entry);
  const categoryLabel = entry?.kind === 'experiment' ? EXPERIMENT_CATEGORIES[entry.category] || entry.category
    : entry?.kind === 'game-project' ? '游戏互动' : entry?.category;
  const documentUrl = isContentUrl(entry?.documentUrl) ? entry.documentUrl : undefined;
  const demoUrl = isContentUrl(entry?.demoUrl) ? entry.demoUrl : undefined;
  const attachments = entry?.attachments?.filter(item => isContentUrl(item.url)) ?? [];
  const body = entry?.body?.trim();
  const projectBody = body && entry.description && body.startsWith(`${entry.description}\n`)
    ? body.slice(entry.description.length).trim() : body;

  const gallery = useMemo(() => {
    if (!entry) return [];
    const seen = new Set<string>();
    return [entry.cover, ...entry.media].filter((asset): asset is MediaAsset => {
      if (!asset || !isContentUrl(asset.url) || seen.has(asset.url)) return false;
      seen.add(asset.url);
      return true;
    });
  }, [entry]);

  const turnProject = (direction: number) => {
    const current = callbacks.current;
    if (current.entries.length < 2) return;
    const next = (current.currentIndex + direction + current.entries.length) % current.entries.length;
    current.onEntryChange(current.entries[next].id);
  };

  useLayoutEffect(() => {
    if (!hasEntry) return;
    const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    returnRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
        if (!controls.length) { dialogRef.current?.focus({ preventScroll: true }); return; }
        const focused = controls.indexOf(document.activeElement as HTMLElement);
        const next = focused < 0 ? (event.shiftKey ? controls.length - 1 : 0)
          : (focused + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[next].focus({ preventScroll: true });
        return;
      }
      if (!CONTROL_KEYS.has(event.code)) return;
      const target = event.target instanceof Element ? event.target : null;
      const nativeControl = target?.closest('input, textarea, select, [contenteditable="true"], video, audio');
      const closes = event.code === 'Escape' || event.code === 'KeyK';
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (nativeControl && !closes) return;
      if ((event.code === 'Enter' || event.code === 'Space') && target?.closest('button, a')) {
        if (event.repeat) event.preventDefault();
        return;
      }
      event.preventDefault();
      if (closes) { if (!event.repeat) callbacks.current.onClose(); }
      else if (event.code === 'ArrowLeft' || event.code === 'KeyA') { if (!event.repeat) turnProject(-1); }
      else if (event.code === 'ArrowRight' || event.code === 'KeyD') { if (!event.repeat) turnProject(1); }
      else if (['ArrowUp', 'KeyW', 'ArrowDown', 'KeyS'].includes(event.code)) {
        const direction = event.code === 'ArrowUp' || event.code === 'KeyW' ? -1 : 1;
        const area = infoRef.current?.contains(document.activeElement) ? infoRef.current : galleryRef.current;
        area?.scrollBy({ top: direction * Math.max(100, area.clientHeight * .35), behavior: 'auto' });
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (!CONTROL_KEYS.has(event.code)) return;
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      document.body.style.overflow = oldOverflow;
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    };
  }, [hasEntry]);

  useLayoutEffect(() => {
    galleryRef.current?.scrollTo({ top: 0, left: 0 });
    infoRef.current?.scrollTo({ top: 0, left: 0 });
  }, [entry?.id]);

  if (!entry) return null;
  return createPortal(<div className="complete-project-backdrop"
    onClick={event => event.stopPropagation()} onPointerDown={event => event.stopPropagation()}
    onWheel={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <section className="complete-project-viewer" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true"
      aria-label={`${entry.title} · 完整作品详情`} data-entry-id={entry.id}>
      <div className="complete-project-toolbar">
        <button className="complete-project-return" ref={returnRef} onClick={onClose} title={`${returnLabel} · K / ESC`}><kbd>ESC</kbd><span>{returnLabel}</span></button>
        <div className="complete-project-navigation" aria-label="切换项目">
          <button className="complete-project-prev" onClick={() => turnProject(-1)} disabled={entries.length < 2} aria-label="上一个项目" title="上一个项目 · A / ←"><span aria-hidden="true">◀</span></button>
          <span className="complete-project-counter" aria-live="polite">{String(currentIndex + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}</span>
          <button className="complete-project-next" onClick={() => turnProject(1)} disabled={entries.length < 2} aria-label="下一个项目" title="下一个项目 · D / →"><span aria-hidden="true">▶</span></button>
        </div>
      </div>
      <div className="complete-project-paper">
        <div className="complete-project-gallery" ref={galleryRef} tabIndex={0} role="region" aria-label={`${entry.title} · 完整作品图片`}>
          {gallery.length ? gallery.map((asset, mediaIndex) => <CompleteProjectAsset key={`${entry.id}-${asset.url}`} asset={asset} title={entry.title} index={mediaIndex} />)
            : <div className="complete-project-media-empty" role="status"><span aria-hidden="true">▧</span><p>这个项目的作品图片待补充</p></div>}
        </div>
        <aside className="complete-project-info" ref={infoRef} tabIndex={0} aria-label="项目介绍">
          <span className="complete-project-category">{categoryLabel}</span>
          <h2>{entry.title}</h2>
          {entry.subtitle && <p className="complete-project-subtitle">{entry.subtitle}</p>}
          <p className="complete-project-description">{entry.description}</p>
          {projectBody && projectBody !== entry.description && <p className="complete-project-body">{projectBody}</p>}
          {entry.caseStudy?.map((section, sectionIndex) => <section className="complete-project-section" key={`${section.heading}-${sectionIndex}`}>
            <h3>{section.heading}</h3><p>{section.text}</p>
          </section>)}
          {(documentUrl || demoUrl || attachments.length > 0) && <div className="complete-project-resources" aria-label="项目资源">
            {documentUrl && <a href={documentUrl} target="_blank" rel="noopener noreferrer">查看文档 ↗</a>}
            {demoUrl && <a href={demoUrl} target="_blank" rel="noopener noreferrer">打开 Demo ↗</a>}
            {attachments.map(item => <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">附件：{item.title} ↗</a>)}
          </div>}
          {entry.tags.length > 0 && <div className="complete-project-tags">{entry.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
        </aside>
      </div>
      <p className="complete-project-hint"><span>← → 切换项目</span><span>W / S 上下阅读 · 滚动查看完整作品</span></p>
    </section>
  </div>, document.body);
};
