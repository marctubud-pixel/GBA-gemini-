import React, { useEffect, useRef } from 'react';
import './sceneModal.css';
import { SceneModalCrown } from './SceneModalCrown';

export interface SceneModalFrameProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  variant?: 'book' | 'ticket' | 'gallery' | 'console' | 'collection';
  footer?: React.ReactNode;
}

export const SceneModalFrame: React.FC<SceneModalFrameProps> = ({
  title, subtitle, children, onClose, variant = 'gallery', footer,
}) => {
  const isLab = title === 'EXPERIMENT LAB';
  const headerKind = isLab ? 'lab' : variant;
  const frameRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    frameRef.current?.focus({ preventScroll: true });
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  const keepFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(frameRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], video[controls], [tabindex="0"]') ?? []);
    if (!controls.length) { event.preventDefault(); return; }
    const index = controls.indexOf(document.activeElement as HTMLElement);
    if (event.shiftKey && index <= 0) { event.preventDefault(); controls[controls.length - 1].focus(); }
    else if (!event.shiftKey && (index < 0 || index === controls.length - 1)) { event.preventDefault(); controls[0].focus(); }
  };
  return (
  <div className="scene-modal-backdrop" onClick={onClose}>
    <section
      className={`scene-modal-frame scene-modal-${variant}${isLab ? ' scene-modal-lab' : ''}`}
      ref={frameRef} tabIndex={-1} onKeyDown={keepFocus}
      role="dialog" aria-modal="true" aria-label={title} aria-description={subtitle}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <button className="scene-modal-dismiss" onClick={onClose} aria-label="关闭面板" title="关闭面板 · ESC"><kbd>ESC</kbd><span>关闭</span></button>
      <header className="scene-modal-header" data-header-kind={headerKind}>
        <SceneModalCrown kind={headerKind} />
        <div className="scene-header-plaque">
          <div className="scene-modal-heading"><h2>{title}</h2></div>
        </div>
      </header>
      <div className="scene-modal-body">{children}</div>
      {footer && <footer className="scene-modal-footer">{footer}</footer>}
    </section>
  </div>
  );
};

export interface ModalKeyOptions {
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onConfirm?: () => void;
  onUp?: () => void;
  onDown?: () => void;
}
const GAME_KEYS = new Set([
  'Escape', 'KeyK', 'KeyJ', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyE',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Space',
]);

/** One capture listener per open panel keeps its navigation out of Phaser. */
export function useModalKeys(options: ModalKeyOptions) {
  const callbacks = useRef(options);
  callbacks.current = options;
  useEffect(() => {
    if (!options.isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('video, audio') && (event.code === 'Escape' || event.code === 'KeyK')) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (!event.repeat) callbacks.current.onClose();
        return;
      }
      if (target?.closest('input, textarea, select, [contenteditable="true"], video, audio')) {
        // Keep native typing and media controls, but stop game input.
        event.stopPropagation();
        return;
      }
      if ((event.code === 'Enter' || event.code === 'Space') && target?.closest('button, a')) {
        // A focused UI control keeps its own native keyboard activation.
        event.stopPropagation();
        if (event.repeat) event.preventDefault();
        return;
      }
      if (!GAME_KEYS.has(event.code)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (event.repeat) return;
      const current = callbacks.current;
      if (event.code === 'Escape' || event.code === 'KeyK') current.onClose();
      else if (event.code === 'ArrowLeft' || event.code === 'KeyA') current.onPrev?.();
      else if (event.code === 'ArrowRight' || event.code === 'KeyD') current.onNext?.();
      else if (event.code === 'ArrowUp' || event.code === 'KeyW') current.onUp?.();
      else if (event.code === 'ArrowDown' || event.code === 'KeyS') current.onDown?.();
      else if (event.code === 'KeyJ' || event.code === 'Enter' || event.code === 'Space') current.onConfirm?.();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (!GAME_KEYS.has(event.code)) return;
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [options.isOpen]);
}
