import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MediaAsset } from '../data/contentTypes';

export interface CinemaPlaybackHandle { start: () => void; }

export const CinemaFullscreenPlayer = forwardRef<CinemaPlaybackHandle, {
  video: MediaAsset; title: string; poster?: string; onClose: () => void;
}>(function CinemaFullscreenPlayer({ video, title, poster, onClose }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const close = useRef(onClose); close.current = onClose;
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState(false);
  const start = () => {
    void player.current?.play().catch(() => setBlocked(true));
    if (root.current?.requestFullscreen) void root.current.requestFullscreen().catch(() => {});
  };
  useImperativeHandle(ref, () => ({ start }));
  useEffect(() => {
    const stage = root.current, movie = player.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; movie?.focus({ preventScroll: true });
    let entered = false;
    const fullscreen = () => {
      if (document.fullscreenElement && stage?.contains(document.fullscreenElement)) entered = true;
      else if (entered) close.current();
    };
    document.addEventListener('fullscreenchange', fullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', fullscreen); movie?.pause();
      if (document.fullscreenElement && stage?.contains(document.fullscreenElement)) void document.exitFullscreen().catch(() => {});
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<div ref={root} className="cinema-fullscreen-player" role="dialog" aria-modal="true" aria-label={`${title}全屏播放器`}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(root.current?.querySelectorAll<HTMLElement>('button:not(:disabled), video[controls]') || []);
      const index = controls.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); controls[controls.length - 1]?.focus(); }
      else if (!event.shiftKey && (index < 0 || index === controls.length - 1)) { event.preventDefault(); controls[0]?.focus(); }
    }}>
    <video ref={player} src={video.url} poster={video.poster || poster} controls autoPlay playsInline preload="metadata"
      aria-label={video.caption || title} onPlay={() => setBlocked(false)} onError={() => setError(true)} />
    <div className="cinema-playback-toolbar"><button onClick={onClose}><kbd>ESC / K</kbd> 返回电影票</button><span>{title}</span></div>
    {blocked && !error && <button className="cinema-playback-resume" onClick={start}>▶ 点击播放</button>}
    {error && <p className="cinema-playback-error" role="alert">影片暂时无法播放，请检查上传文件或链接。</p>}
  </div>, document.body);
});
