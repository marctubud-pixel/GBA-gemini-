import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { isContentUrl } from '../content/contentRepository';
import './writingProjectDetail.css';

export function getWritingMedia(entry: ContentEntry): MediaAsset[] {
  const seen = new Set<string>();
  return [entry.cover, ...entry.media].filter((asset): asset is MediaAsset => {
    if (!asset || asset.type !== 'image' || !isContentUrl(asset.url) || seen.has(asset.url)) return false;
    seen.add(asset.url);
    return true;
  });
}

export interface WritingProjectDetailProps {
  entry: ContentEntry;
  mediaIndex: number;
  onMediaIndexChange: (index: number) => void;
  zoomed: boolean;
  onZoomChange: (value: boolean) => void;
}

export const WritingProjectDetail = ({ entry, mediaIndex, onMediaIndexChange, zoomed, onZoomChange }: WritingProjectDetailProps) => {
  const media = getWritingMedia(entry);
  const currentIndex = media.length ? ((mediaIndex % media.length) + media.length) % media.length : 0;
  const currentImage = media[currentIndex];
  const zoomButton = useRef<HTMLButtonElement>(null);
  const zoomDialog = useRef<HTMLElement>(null);
  const zoomClose = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [magnification, setMagnification] = useState(100);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const turnImage = (direction: number) => {
    if (media.length > 1) onMediaIndexChange((currentIndex + direction + media.length) % media.length);
  };

  useEffect(() => {
    setNaturalSize({ width: 0, height: 0 });
    setFailedImage(null);
    viewport.current?.scrollTo({ top: 0, left: 0 });
  }, [currentImage?.url]);

  useLayoutEffect(() => {
    if (!zoomed || !currentImage) return;
    setMagnification(100);
    zoomClose.current?.focus({ preventScroll: true });
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const area = viewport.current;
    const updateSize = () => {
      if (area) setViewportSize({ width: area.clientWidth, height: area.clientHeight });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (area) observer.observe(area);
    return () => {
      observer.disconnect();
      document.body.style.overflow = oldOverflow;
      if (zoomButton.current?.isConnected) zoomButton.current.focus({ preventScroll: true });
    };
  }, [zoomed]);

  const trapZoomFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    // Portal events also bubble through the room dialog. Its trap must not pull
    // focus out of this full-viewport image viewer.
    event.preventDefault();
    event.stopPropagation();
    const controls = Array.from(zoomDialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
    if (!controls.length) return;
    const index = controls.indexOf(document.activeElement as HTMLButtonElement);
    const next = index < 0 ? (event.shiftKey ? controls.length - 1 : 0)
      : (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
    controls[next].focus({ preventScroll: true });
  };
  const startSwipe = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const finishSwipe = (event: TouchEvent<HTMLElement>) => {
    const touch = event.changedTouches[0];
    const start = touchStart.current;
    touchStart.current = null;
    if (!touch || !start) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      event.preventDefault();
      turnImage(dx < 0 ? 1 : -1);
    }
  };

  const fitScale = naturalSize.width && naturalSize.height && viewportSize.width && viewportSize.height
    ? Math.min((viewportSize.width - 28) / naturalSize.width, (viewportSize.height - 28) / naturalSize.height)
    : 0;
  const imageWidth = Math.max(1, Math.round(naturalSize.width * fitScale * magnification / 100));
  const imageHeight = Math.max(1, Math.round(naturalSize.height * fitScale * magnification / 100));
  const imageFailed = failedImage === currentImage?.url;
  const titleId = `writing-project-${entry.id}`;

  return <article className="writing-project-detail" aria-labelledby={titleId}>
    <div className={`writing-project-intro${currentImage ? '' : ' writing-project-intro-text'}`}>
      {currentImage && <div className="writing-project-gallery" aria-label="项目图片轮播">
        <button className="writing-project-image" onClick={() => onZoomChange(true)} aria-label={`放大查看第 ${currentIndex + 1} 张图片`}
          onTouchStart={startSwipe} onTouchEnd={finishSwipe} onTouchCancel={() => { touchStart.current = null; }}>
          {imageFailed ? <span className="writing-project-image-error">图片暂时无法加载</span>
            : <img key={currentImage.url} src={currentImage.url} alt={`${entry.title} · 第 ${currentIndex + 1} 张图片`} draggable={false} onError={() => setFailedImage(currentImage.url)} />}
        </button>
        <div className="writing-gallery-controls">
          <button onClick={() => turnImage(-1)} disabled={media.length < 2} aria-label="上一张图片">◀</button>
          <span className="writing-gallery-count" aria-live="polite">{currentIndex + 1} / {media.length}</span>
          <button onClick={() => turnImage(1)} disabled={media.length < 2} aria-label="下一张图片">▶</button>
          <button ref={zoomButton} className="writing-gallery-enlarge" onClick={() => onZoomChange(true)} aria-label="放大查看图片">放大查看</button>
        </div>
      </div>}
      <div className="writing-project-title"><h3 id={titleId}>{entry.title}</h3></div>
    </div>
    <div className="writing-project-prose">{entry.body || entry.description}</div>
    {zoomed && currentImage && createPortal(<div className="writing-zoom-backdrop" onClick={event => event.stopPropagation()}
      onPointerDown={event => event.stopPropagation()} onWheel={event => event.stopPropagation()}>
      <section className="writing-zoom-dialog" ref={zoomDialog} role="dialog" aria-modal="true" aria-label={`${entry.title} · 放大查看`}
        onKeyDownCapture={trapZoomFocus}>
        <header className="writing-zoom-heading"><h3>{entry.title}</h3><button ref={zoomClose} onClick={() => onZoomChange(false)} aria-label="收起大图">收起大图</button></header>
        <div className="writing-zoom-toolbar">
          <div className="writing-zoom-pages"><button onClick={() => turnImage(-1)} disabled={media.length < 2} aria-label="放大查看上一张图片">◀ 上一张</button><span aria-live="polite">{currentIndex + 1} / {media.length}</span><button onClick={() => turnImage(1)} disabled={media.length < 2} aria-label="放大查看下一张图片">下一张 ▶</button></div>
          <div className="writing-zoom-scale" aria-label="图片缩放"><button onClick={() => setMagnification(value => Math.max(100, value - 50))} disabled={magnification <= 100} aria-label="缩小图片">−</button><output aria-live="polite">{magnification}%</output><button onClick={() => setMagnification(value => Math.min(300, value + 50))} disabled={magnification >= 300} aria-label="放大图片">＋</button><button onClick={() => { setMagnification(100); viewport.current?.scrollTo({ top: 0, left: 0 }); }} aria-label="适应窗口">适应窗口</button></div>
        </div>
        <div className="writing-zoom-viewport" ref={viewport} tabIndex={-1} aria-label="大图滚动查看区">
          <div className="writing-zoom-canvas" style={fitScale ? { width: Math.max(viewportSize.width, imageWidth + 28), height: Math.max(viewportSize.height, imageHeight + 28) } : undefined}>
            {imageFailed ? <p className="writing-project-image-error">图片暂时无法加载</p> : <img className="writing-zoom-image" key={currentImage.url} src={currentImage.url} alt={`${entry.title} · 第 ${currentIndex + 1} 张图片`}
              draggable={false} style={fitScale ? { width: imageWidth, height: imageHeight } : undefined}
              onLoad={event => setNaturalSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setFailedImage(currentImage.url)} />}
          </div>
        </div>
      </section>
    </div>, document.body)}
  </article>;
};
