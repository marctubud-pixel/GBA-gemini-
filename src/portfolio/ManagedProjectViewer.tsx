import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { isContentUrl } from '../content/contentRepository';
import './managedProjectViewer.css';
const PdfReader = lazy(() => import('./PdfReader'));

/** Called during a click/key action so external details don't become another submenu. */
export function openExternalDetail(entry?: ContentEntry): boolean {
  if (entry?.detail?.type !== 'link' || !isContentUrl(entry.detail.url)) return false;
  const anchor = document.createElement('a'); anchor.href = entry.detail.url; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; anchor.click();
  return true;
}
export function usesManagedViewer(entry?: ContentEntry) { return !!(entry?.detail || entry?.presentation); }
type Props = { entries: ContentEntry[]; entryId: string; onEntryChange: (id: string) => void; onClose: () => void; returnLabel?: string };

export function ManagedProjectViewer({ entries, entryId, onEntryChange, onClose, returnLabel = '返回作品' }: Props) {
  const currentIndex = Math.max(0, entries.findIndex(entry => entry.id === entryId));
  const entry = entries[currentIndex];
  const [mediaIndex, setMediaIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number; top: number; left: number; moved: boolean } | null>(null);
  const gallery = useMemo(() => {
    if (!entry) return [];
    const seen = new Set<string>();
    const assets = entry.media.length ? entry.media : [entry.cover];
    return assets.filter((asset): asset is MediaAsset => !!asset && isContentUrl(asset.url) && !seen.has(asset.url) && !!seen.add(asset.url));
  }, [entry]);
  const asset = gallery[Math.min(mediaIndex, Math.max(0, gallery.length - 1))];
  const callbacks = useRef({ onClose, entries, currentIndex, onEntryChange, gallery, mediaIndex, zoom, entry });
  callbacks.current = { onClose, entries, currentIndex, onEntryChange, gallery, mediaIndex, zoom, entry };
  function turnMedia(step: number) { const count = callbacks.current.gallery.length; if (count > 1) { setMediaIndex(index => (index + step + count) % count); setZoom(100); } }
  function turnProject(step: number) {
    const current = callbacks.current;
    if (current.entries.length < 2) return;
    const next = current.entries[(current.currentIndex + step + current.entries.length) % current.entries.length];
    if (!openExternalDetail(next)) current.onEntryChange(next.id);
  }
  useEffect(() => { setMediaIndex(0); setZoom(100); setFailed(false); }, [entry?.id]);
  useEffect(() => { setFailed(false); viewport.current?.scrollTo({ top: 0, left: 0 }); }, [asset?.url]);
  useLayoutEffect(() => {
    const origin = document.activeElement as HTMLElement | null; const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; closeButton.current?.focus({ preventScroll: true });
    const keys = new Set(['Escape','KeyK','KeyA','KeyD','KeyW','KeyS','KeyJ','KeyE','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','Space']);
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault(); event.stopImmediatePropagation();
        const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], video[controls], [tabindex="0"]') || []);
        if (controls.length) { const index = controls.indexOf(document.activeElement as HTMLElement); controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus(); } return;
      }
      if (!keys.has(event.code)) return;
      event.stopImmediatePropagation();
      const native = (event.target as HTMLElement)?.closest('video, input, textarea');
      const closes = event.code === 'Escape' || event.code === 'KeyK';
      if (native && !closes) return;
      if (['Enter', 'Space'].includes(event.code) && (event.target as HTMLElement)?.closest('a,button')) return;
      event.preventDefault(); if (event.repeat && !['KeyW','KeyS','ArrowUp','ArrowDown'].includes(event.code)) return;
      if (closes) callbacks.current.onClose();
      else if (['KeyA','ArrowLeft','KeyD','ArrowRight'].includes(event.code)) {
        const step = ['KeyA','ArrowLeft'].includes(event.code) ? -1 : 1;
        if (callbacks.current.entry?.detail?.type === 'pdf' || !callbacks.current.gallery.length) turnProject(step); else turnMedia(step);
      } else if (['KeyW','KeyS','ArrowUp','ArrowDown'].includes(event.code)) {
        const area = dialog.current?.querySelector<HTMLElement>('[data-project-scroll]'); area?.scrollBy({ top: ['KeyW','ArrowUp'].includes(event.code) ? -140 : 140 });
      } else if (event.code === 'KeyJ') setZoom(value => value === 100 ? 160 : 100);
    };
    const up = (event: KeyboardEvent) => { if (keys.has(event.code)) event.stopImmediatePropagation(); };
    window.addEventListener('keydown', key, true); window.addEventListener('keyup', up, true);
    return () => { window.removeEventListener('keydown', key, true); window.removeEventListener('keyup', up, true); document.body.style.overflow = overflow; if (origin?.isConnected) origin.focus({ preventScroll: true }); };
  }, []);
  if (!entry) return null;
  const isPdf = entry.detail?.type === 'pdf';
  return createPortal(<div className="managed-project-backdrop" onPointerDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
    <section className="managed-project-dialog" ref={dialog} role="dialog" aria-modal="true" aria-label={`${entry.title} · 作品详情`} data-entry-id={entry.id}>
      <header className="managed-project-toolbar"><button ref={closeButton} onClick={onClose}><kbd>ESC</kbd> {returnLabel}</button><h2>{entry.detail ? entry.title : ''}</h2>
        <div><button aria-label="上一个项目" disabled={entries.length < 2} onClick={() => turnProject(-1)}>◀</button><span>{currentIndex + 1} / {entries.length}</span><button aria-label="下一个项目" disabled={entries.length < 2} onClick={() => turnProject(1)}>▶</button></div>
      </header>
      {entry.detail?.type === 'link' ? <div className="project-reader-empty"><a href={entry.detail.url} target="_blank" rel="noopener noreferrer">打开项目详情 ↗</a></div> : isPdf ? <div className="managed-project-pdf"><div className="project-reader-controls"><span>滚动 / 拖动阅读</span><div><button aria-label="缩小 PDF" disabled={zoom <= 60} onClick={() => setZoom(value => Math.max(60, value - 20))}>−</button><span>{zoom}%</span><button aria-label="放大 PDF" disabled={zoom >= 220} onClick={() => setZoom(value => Math.min(220, value + 20))}>＋</button></div></div><Suspense fallback={<p className="project-reader-empty">正在打开 PDF…</p>}><PdfReader key={entry.id} url={entry.detail!.url} zoom={zoom} /></Suspense></div>
      : <div className={`managed-project-paper layout-${entry.presentation || 'original'}`}>
        <div className={`managed-media-stage ${zoom > 100 ? 'is-zoomed' : ''}`}>
          <div className="managed-media-scroll" ref={viewport} tabIndex={0} data-project-scroll
            onPointerDown={event => { if ((event.target as HTMLElement).closest('video,button,a') || event.button !== 0) return;
              pointer.current = { x: event.clientX, y: event.clientY, top: event.currentTarget.scrollTop, left: event.currentTarget.scrollLeft, moved: false };
              if (event.pointerType === 'mouse' && zoom > 100) { event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault(); } }}
            onPointerMove={event => { const start = pointer.current; if (!start || zoom <= 100) return; start.moved = true; event.currentTarget.scrollTop = start.top + start.y - event.clientY; event.currentTarget.scrollLeft = start.left + start.x - event.clientX; }}
            onPointerUp={event => { const start = pointer.current; pointer.current = null; if (!start || zoom > 100) return; const x = event.clientX - start.x, y = event.clientY - start.y; if (Math.abs(x) > 50 && Math.abs(x) > Math.abs(y) * 1.3) turnMedia(x < 0 ? 1 : -1); }} onPointerCancel={() => { pointer.current = null; }}>
            {!asset || failed ? <p className="project-reader-empty">{failed ? '这份作品暂时无法显示' : '作品画面待上传'}</p> : <div className="managed-media-frame" style={zoom > 100 ? { width: `${zoom}%`, maxWidth: 'none', height: 'auto', flexShrink: 0 } : undefined}>
              {asset.type === 'video' ? <video key={asset.url} src={asset.url} poster={asset.poster || (entry.cover?.type === 'image' ? entry.cover.url : undefined)} controls playsInline preload="metadata" aria-label={`${entry.title} · 视频`} onError={() => setFailed(true)} /> : <img key={asset.url} src={asset.url} alt={asset.alt || entry.title} draggable={false} onError={() => setFailed(true)} />}
            </div>}
          </div>
          {gallery.length > 1 && <><button className="managed-media-arrow previous" aria-label="上一张画面" onClick={() => turnMedia(-1)}>◀</button><button className="managed-media-arrow next" aria-label="下一张画面" onClick={() => turnMedia(1)}>▶</button><span className="managed-media-counter">{mediaIndex + 1} / {gallery.length}</span></>}
          {asset?.type === 'image' && <button className="managed-media-zoom" onClick={() => setZoom(value => value > 100 ? 100 : 180)}>{zoom > 100 ? '适合画面' : '放大查看'}</button>}
        </div>
        <aside className="managed-project-info"><h3>{entry.title}</h3><p>{entry.description}</p>{entry.body && entry.body !== entry.description && <p>{entry.body}</p>}{entry.caseStudy?.map((section, index) => <section key={index}><h4>{section.heading}</h4><p>{section.text}</p></section>)}{isContentUrl(entry.demoUrl) && <a href={entry.demoUrl} target="_blank" rel="noopener noreferrer">打开体验 ↗</a>}</aside>
      </div>}
    </section>
  </div>, document.body);
}
