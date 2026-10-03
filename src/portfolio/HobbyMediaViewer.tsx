import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { ContentMedia } from './ContentMedia';
import { pixelSound } from '../game/audio/PixelSoundManager';

export interface HobbyMediaItem { entry: ContentEntry; asset?: MediaAsset }
const KEYS = new Set(['Escape', 'KeyK', 'KeyJ', 'KeyE', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Space']);

/** Open the selected shelf item directly, without a collection submenu. */
export function HobbyMediaViewer({ items, index, onChange, onClose }: {
  items: HobbyMediaItem[]; index: number; onChange: (index: number) => void; onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const returnRef = useRef<HTMLButtonElement>(null);
  const callbacks = useRef({ items, index, onChange, onClose });
  callbacks.current = { items, index, onChange, onClose };
  const item = items[index];
  const turn = (step: number) => {
    const current = callbacks.current;
    if (current.items.length < 2) return;
    pixelSound.playSelect(); current.onChange((current.index + step + current.items.length) % current.items.length);
  };

  useLayoutEffect(() => {
    const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; returnRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
        const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), video[controls]') ?? []);
        if (!controls.length) return;
        const current = controls.indexOf(document.activeElement as HTMLElement);
        controls[(current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus({ preventScroll: true });
        return;
      }
      if (!KEYS.has(event.code)) return;
      const target = event.target instanceof Element ? event.target : null;
      const closes = event.code === 'Escape' || event.code === 'KeyK';
      event.stopPropagation(); event.stopImmediatePropagation();
      if (target?.closest('video, audio') && !closes) return;
      if ((event.code === 'Enter' || event.code === 'Space') && target?.closest('button')) { if (event.repeat) event.preventDefault(); return; }
      event.preventDefault(); if (event.repeat) return;
      if (closes) callbacks.current.onClose();
      else if (event.code === 'KeyA' || event.code === 'ArrowLeft') turn(-1);
      else if (event.code === 'KeyD' || event.code === 'ArrowRight') turn(1);
    };
    const onKeyUp = (event: KeyboardEvent) => { if (KEYS.has(event.code)) { event.stopPropagation(); event.stopImmediatePropagation(); } };
    window.addEventListener('keydown', onKeyDown, true); window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true); window.removeEventListener('keyup', onKeyUp, true);
      document.body.style.overflow = oldOverflow;
      const selected = document.querySelector<HTMLElement>('.hobby-rack-item.is-active:not(:disabled)');
      if (selected) selected.focus({ preventScroll: true }); else if (origin?.isConnected) origin.focus({ preventScroll: true });
    };
  }, []);
  if (!item?.asset) return null;
  return createPortal(<div className="hobby-viewer-backdrop" onPointerDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <section className="hobby-media-viewer" ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${item.entry.title} · 收藏原图`} data-entry-id={item.entry.id}>
      <div className="hobby-viewer-toolbar"><button className="hobby-viewer-return" ref={returnRef} onClick={onClose}><kbd>ESC</kbd><span>返回展柜</span></button>
        <span className="hobby-viewer-caption">{item.asset.caption || item.entry.title}</span><span className="hobby-viewer-counter">{index + 1} / {items.length}</span>
      </div>
      <div className="hobby-viewer-picture"><ContentMedia key={`${item.entry.id}:${item.asset.url}`} asset={item.asset} title={item.entry.title} fit="contain" /></div>
      <button className="hobby-viewer-prev" onClick={() => turn(-1)} disabled={items.length < 2} aria-label="上一件收藏" title="A / ←">◀</button>
      <button className="hobby-viewer-next" onClick={() => turn(1)} disabled={items.length < 2} aria-label="下一件收藏" title="D / →">▶</button>
    </section>
  </div>, document.body);
}
