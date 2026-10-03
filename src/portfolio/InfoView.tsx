import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import './managedProjectViewer.css';
import './infoView.css';

const PdfReader = lazy(() => import('./PdfReader'));
export const RESUME_PDF_URL = '/media/resume/zhang-zhen-game-2026.pdf';

/** All resume entrances open the supplied PDF, with no reconstructed profile page. */
export const InfoView = () => {
  const currentView = useWorldStore(state => state.currentView);
  const closeInfo = useWorldStore(state => state.closeInfo);
  const [zoom, setZoom] = useState(100);
  const dialog = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (currentView !== 'info') return;
    setZoom(100);
    const origin = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus({ preventScroll: true });
    const keys = new Set(['Escape', 'KeyK', 'KeyA', 'KeyD', 'KeyW', 'KeyS',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault(); event.stopImmediatePropagation();
        const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]') || []);
        if (controls.length) {
          const index = controls.indexOf(document.activeElement as HTMLElement);
          controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
        }
        return;
      }
      if (!keys.has(event.code)) return;
      event.preventDefault(); event.stopImmediatePropagation();
      if (event.code === 'Escape' || event.code === 'KeyK') { if (!event.repeat) closeInfo(); return; }
      const area = dialog.current?.querySelector<HTMLElement>('[data-project-scroll]');
      if (!area) return;
      if (event.code === 'Home') area.scrollTo({ top: 0 });
      else if (event.code === 'End') area.scrollTo({ top: area.scrollHeight });
      else if (['KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'].includes(event.code))
        area.scrollBy({ left: ['KeyA', 'ArrowLeft'].includes(event.code) ? -140 : 140 });
      else area.scrollBy({ top: ['KeyW', 'ArrowUp', 'PageUp'].includes(event.code) ? -180 : 180 });
    };
    const up = (event: KeyboardEvent) => { if (keys.has(event.code)) event.stopImmediatePropagation(); };
    window.addEventListener('keydown', key, true); window.addEventListener('keyup', up, true);
    return () => {
      window.removeEventListener('keydown', key, true); window.removeEventListener('keyup', up, true);
      document.body.style.overflow = overflow;
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    };
  }, [currentView, closeInfo]);
  if (currentView !== 'info') return null;
  return <div className="resume-overlay">
    <section className="resume-dialog" ref={dialog} role="dialog" aria-modal="true" aria-label="张震简历2026（游戏）PDF">
      <header className="resume-toolbar"><h1>张震简历2026（游戏）</h1>
        <a href={RESUME_PDF_URL} target="_blank" rel="noopener noreferrer">打开原文件 ↗</a>
        <button ref={closeButton} onClick={closeInfo}>ESC · 关闭</button>
      </header>
      <div className="resume-paper">
        <div className="project-reader-controls"><span>滚动 / 拖动阅读</span><div>
          <button aria-label="缩小简历" disabled={zoom <= 60} onClick={() => setZoom(value => Math.max(60, value - 20))}>−</button>
          <span>{zoom}%</span>
          <button aria-label="放大简历" disabled={zoom >= 220} onClick={() => setZoom(value => Math.min(220, value + 20))}>＋</button>
        </div></div>
        <Suspense fallback={<p className="project-reader-empty" role="status">正在打开简历 PDF…</p>}>
          <PdfReader url={RESUME_PDF_URL} zoom={zoom} />
        </Suspense>
      </div>
    </section>
  </div>;
};
