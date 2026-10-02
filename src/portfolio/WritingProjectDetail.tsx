import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ContentEntry, MediaAsset } from '../data/contentTypes';
import { isContentUrl } from '../content/contentRepository';
import './writingProjectDetail.css';

const imageDimensions = new Map<string, { width: number; height: number }>();

export function getWritingMedia(entry: ContentEntry): MediaAsset[] {
  const seen = new Set<string>();
  return [entry.cover, ...entry.media].filter((asset): asset is MediaAsset => {
    if (!asset || asset.type !== 'image' || !isContentUrl(asset.url) || seen.has(asset.url)) return false;
    seen.add(asset.url);
    return true;
  });
}

function getWritingGroupSize(entry: ContentEntry): number {
  const media = getWritingMedia(entry);
  const size = media[0] ? imageDimensions.get(media[0].url) : undefined;
  return entry.category !== 'tvc' && size && size.width / size.height < .85 ? Math.min(3, media.length) : 1;
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
  const isTvc = entry.category === 'tvc';
  const video = entry.media.find(asset => asset.type === 'video' && isContentUrl(asset.url));
  const role = entry.caseStudy?.find(section => section.heading === '我的角色')?.text;
  const futureDetail = entry.caseStudy?.find(section => section.heading === '项目详情' || section.heading === '项目概述')?.text?.trim();
  const body = entry.body?.trim();
  const projectDetails = futureDetail || (body && !/^(完整文案|项目详情|项目概述)待补充[。.!！]?$/.test(body) ? body : '项目详情待补充。');
  const zoomButton = useRef<HTMLButtonElement>(null);
  const zoomOrigin = useRef<HTMLButtonElement | null>(null);
  const videoPlayer = useRef<HTMLVideoElement>(null);
  const zoomDialog = useRef<HTMLElement>(null);
  const zoomClose = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [magnification, setMagnification] = useState(100);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [dimensionVersion, setDimensionVersion] = useState(0);
  const [playing, setPlaying] = useState(false);
  const groupSize = getWritingGroupSize(entry);
  const visibleImages = Array.from({ length: Math.min(groupSize, media.length) }, (_, offset) => {
    const index = (currentIndex + offset) % media.length;
    return { asset: media[index], index };
  });
  const turnImage = (direction: number) => {
    if (media.length > 1) onMediaIndexChange((currentIndex + direction + media.length) % media.length);
  };
  const openImage = (index: number, origin: HTMLButtonElement) => {
    zoomOrigin.current = origin;
    onMediaIndexChange(index);
    onZoomChange(true);
  };
  const noteDimensions = (url: string, image: HTMLImageElement) => {
    const old = imageDimensions.get(url);
    if (old?.width === image.naturalWidth && old?.height === image.naturalHeight) return;
    imageDimensions.set(url, { width: image.naturalWidth, height: image.naturalHeight });
    setDimensionVersion(version => version + 1);
  };

  useEffect(() => { setPlaying(false); }, [entry.id]);
  useEffect(() => { if (zoomed) videoPlayer.current?.pause(); }, [zoomed]);

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
      const origin = zoomOrigin.current?.isConnected ? zoomOrigin.current : zoomButton.current;
      origin?.focus({ preventScroll: true });
      zoomOrigin.current = null;
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

  return <article className={`writing-project-detail${groupSize > 1 ? ' writing-project-detail-portraits' : ''}`} aria-labelledby={titleId} data-gallery-size={groupSize} data-dimension-version={dimensionVersion}>
    <div className="writing-project-gallery" aria-label="项目图片轮播">
      <div className={`writing-gallery-stage${groupSize > 1 ? ' writing-gallery-stage-portraits' : ''}${isTvc ? ' writing-gallery-stage-tvc' : ''}`}
        onTouchStart={startSwipe} onTouchEnd={finishSwipe} onTouchCancel={() => { touchStart.current = null; }}>
        <div className="writing-gallery-images" style={groupSize > 1 ? undefined : { gridTemplateColumns: 'minmax(0, 1fr)' }}>
          {visibleImages.map(({ asset, index }) => <button key={asset.url} className="writing-project-image"
            style={groupSize > 1 ? { aspectRatio: (() => { const size = imageDimensions.get(asset.url) ?? imageDimensions.get(media[0].url); return size ? size.width / size.height : undefined; })() } : undefined}
            onClick={event => openImage(index, event.currentTarget)} aria-label={`放大查看第 ${index + 1} 张图片`}>
            {failedImages.has(asset.url) ? <span className="writing-project-image-error">图片暂时无法加载</span>
              : <img src={asset.url} alt={`${entry.title} · 第 ${index + 1} 张图片`} draggable={false}
                onLoad={event => noteDimensions(asset.url, event.currentTarget)}
                onError={() => setFailedImages(previous => new Set(previous).add(asset.url))} />}
          </button>)}
          {!visibleImages.length && <div className="writing-gallery-empty">项目图片待补充</div>}
        </div>
        {isTvc && (playing && video ? <video className="writing-project-video" ref={videoPlayer} src={video.url} poster={currentImage?.url}
          controls autoPlay playsInline preload="metadata" aria-label={`${entry.title} · 影片`} />
          : <button className={`writing-tvc-play${video ? '' : ' is-unavailable'}`} disabled={!video} onClick={() => setPlaying(true)}
            aria-label={video ? '播放项目影片' : '影片待上传'}><span aria-hidden="true">▶</span><span>{video ? '播放影片' : '影片待上传'}</span></button>)}
        {media.length > groupSize && <><button className="writing-gallery-arrow writing-gallery-arrow-prev" onClick={() => turnImage(-1)} aria-label="上一组图片">◀</button>
          <button className="writing-gallery-arrow writing-gallery-arrow-next" onClick={() => turnImage(1)} aria-label="下一组图片">▶</button></>}
      </div>
      <div className="writing-gallery-caption">
        <button ref={zoomButton} className="writing-gallery-enlarge" disabled={!currentImage} onClick={event => openImage(currentIndex, event.currentTarget)} aria-label="放大查看图片">点击图片放大</button>
        {!!media.length && <span className="writing-gallery-count" aria-live="polite">{currentIndex + 1} / {media.length}</span>}
      </div>
    </div>
    <div className="writing-project-summary">
      <div className="writing-project-title"><h3 id={titleId}>{entry.title}</h3>{entry.subtitle && <p className="writing-project-subtitle">{entry.subtitle}</p>}</div>
      <div className="writing-project-prose">{isTvc ? <><p>{entry.description}</p>{role && <p>{role}</p>}</> : <p>{projectDetails}</p>}</div>
    </div>
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
