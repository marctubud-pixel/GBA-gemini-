import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { isContentUrl } from '../content/contentRepository';
import './brandCaseViewer.css';

export interface BrandCaseViewerProps {
  entries: ContentEntry[];
  entryId: string;
  onEntryChange: (id: string) => void;
  onClose: () => void;
}

const CATEGORY_NAMES: Record<string, string> = { ip: 'IP', art: '视觉', brand: '品牌', ecommerce: '电商' };
const CONTROL_KEYS = new Set([
  'Escape', 'KeyK', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyE',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Space',
]);
const FOCUSABLE = 'button:not(:disabled), a[href], video[controls], [tabindex="0"]';

const BrandCaseAsset: React.FC<{ asset: MediaAsset; title: string; index: number }> = ({ asset, title, index }) => {
  const [failed, setFailed] = useState(false);
  const label = `${title} · 作品图 ${index + 1}`;
  return <figure className="brand-case-figure" data-media-index={index}>
    {failed ? <div className="brand-case-media-empty" role="status"><span aria-hidden="true">▧</span><p>这张作品暂时无法加载</p></div>
      : asset.type === 'video' ? <video controls playsInline preload="metadata" aria-label={`${title} · 影片 ${index + 1}`}
        poster={isContentUrl(asset.poster) ? asset.poster : undefined} onError={() => setFailed(true)}><source src={asset.url} /></video>
        : <img src={asset.url} alt={label} loading={index === 0 ? 'eager' : 'lazy'} onError={() => setFailed(true)} />}
    <figcaption>{String(index + 1).padStart(2, '0')}</figcaption>
  </figure>;
};

/** Opens the complete project directly, retaining the exhibition underneath. */
export const BrandCaseViewer: React.FC<BrandCaseViewerProps> = ({ entries, entryId, onEntryChange, onClose }) => {
  const index = entries.findIndex(entry => entry.id === entryId);
  const entry = entries[index >= 0 ? index : 0];
  const currentIndex = index >= 0 ? index : 0;
  const dialogRef = useRef<HTMLElement>(null);
  const returnRef = useRef<HTMLButtonElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLElement>(null);
  const callbacks = useRef({ entries, currentIndex, onEntryChange, onClose });
  callbacks.current = { entries, currentIndex, onEntryChange, onClose };
  const hasEntry = Boolean(entry);

  const gallery = useMemo(() => {
    if (!entry) return [];
    const seen = new Set<string>();
    return [entry.cover, ...entry.media].filter((asset): asset is MediaAsset => {
      if (!asset || !isContentUrl(asset.url) || seen.has(asset.url)) return false;
      seen.add(asset.url);
      return true;
    });
  }, [entry]);

  const turnCase = (direction: number) => {
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
      else if (event.code === 'ArrowLeft' || event.code === 'KeyA') { if (!event.repeat) turnCase(-1); }
      else if (event.code === 'ArrowRight' || event.code === 'KeyD') { if (!event.repeat) turnCase(1); }
      else if (['ArrowUp', 'KeyW', 'ArrowDown', 'KeyS'].includes(event.code)) {
        const direction = event.code === 'ArrowUp' || event.code === 'KeyW' ? -1 : 1;
        const area = galleryRef.current;
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
  return createPortal(<div className="brand-case-backdrop"
    onClick={event => event.stopPropagation()} onPointerDown={event => event.stopPropagation()}
    onWheel={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <section className="brand-case-viewer" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true"
      aria-label={`${entry.title} · 完整案例`} data-entry-id={entry.id}>
      <div className="brand-case-toolbar">
        <button className="brand-case-return" ref={returnRef} onClick={onClose} title="返回品牌馆 · K / ESC"><kbd>ESC</kbd><span>返回品牌馆</span></button>
        <div className="brand-case-navigation" aria-label="切换案例">
          <button className="brand-case-prev" onClick={() => turnCase(-1)} disabled={entries.length < 2} aria-label="上一个案例" title="上一个案例 · A / ←"><span aria-hidden="true">◀</span><span>上一个案例</span></button>
          <span className="brand-case-counter" aria-live="polite">{String(currentIndex + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}</span>
          <button className="brand-case-next" onClick={() => turnCase(1)} disabled={entries.length < 2} aria-label="下一个案例" title="下一个案例 · D / →"><span>下一个案例</span><span aria-hidden="true">▶</span></button>
        </div>
      </div>
      <div className="brand-case-paper">
        <div className="brand-case-gallery" ref={galleryRef} tabIndex={0} role="region" aria-label={`${entry.title} · 完整作品图片`}>
          {gallery.length ? gallery.map((asset, mediaIndex) => <BrandCaseAsset key={`${entry.id}-${asset.url}`} asset={asset} title={entry.title} index={mediaIndex} />)
            : <div className="brand-case-media-empty" role="status"><span aria-hidden="true">▧</span><p>这个项目的作品图片待补充</p></div>}
        </div>
        <aside className="brand-case-info" ref={infoRef} tabIndex={0} aria-label="项目信息">
          <span className="brand-case-category">{CATEGORY_NAMES[entry.category] || entry.category}</span>
          <h2>{entry.title}</h2>
          {entry.subtitle && <p className="brand-case-subtitle">{entry.subtitle}</p>}
          <p className="brand-case-description">{entry.description}</p>
          {entry.body && entry.body !== entry.description && <p className="brand-case-body">{entry.body}</p>}
          {entry.caseStudy?.map((section, sectionIndex) => <section className="brand-case-section" key={`${section.heading}-${sectionIndex}`}>
            <h3>{section.heading}</h3><p>{section.text}</p>
          </section>)}
          {entry.tags.length > 0 && <div className="brand-case-tags">{entry.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
        </aside>
      </div>
      <p className="brand-case-hint"><span>← → 切换案例</span><span>W / S 上下阅读 · 滚动查看完整作品</span></p>
    </section>
  </div>, document.body);
};
