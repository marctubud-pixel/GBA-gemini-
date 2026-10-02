import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import type { MediaAsset } from '../data/contentTypes';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelFilm, PixelPalmTree, PixelSeagull } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { ContentMedia } from './ContentMedia';
import { ContentDetail } from './ContentDetail';
import './mediaModals.css';

type CinemaPanel = 'ticket' | 'player' | 'detail';
function ticketImage(asset?: MediaAsset): MediaAsset | undefined {
  if (!asset || asset.type === 'image') return asset;
  return asset.poster ? { ...asset, type: 'image', url: asset.poster } : undefined;
}

export const MarcCinemaModal = () => {
  const isOpen = useWorldStore((s) => s.activeLandmarkModal === 'marc-cinema' && s.currentView === 'game' && !s.isOverlayOpen);
  const closeLandmarkModal = useWorldStore((s) => s.closeLandmarkModal);
  const entries = useContentStore((s) => s.entries);
  const films = useMemo(() => entries.filter((entry) => entry.kind === 'film'), [entries]);
  const [filmIndex, setFilmIndex] = useState(0);
  const [panel, setPanel] = useState<CinemaPanel>('ticket');
  const [playbackError, setPlaybackError] = useState(false);
  const film = films[Math.min(filmIndex, Math.max(0, films.length - 1))];
  const video = film?.media.find((asset) => asset.type === 'video' && asset.url.trim());
  const cover = ticketImage(film?.cover || film?.media.find((asset) => asset.type === 'image') || video);

  useEffect(() => {
    if (isOpen) { setFilmIndex(0); setPanel('ticket'); setPlaybackError(false); }
  }, [isOpen]);
  useEffect(() => {
    setFilmIndex((index) => Math.min(index, Math.max(0, films.length - 1)));
  }, [films.length]);
  useEffect(() => { setPanel('ticket'); setPlaybackError(false); }, [film?.id, video?.url]);

  const changeFilm = useCallback((step: number) => {
    if (!films.length) return;
    pixelSound.playSelect();
    setPanel('ticket'); setPlaybackError(false);
    setFilmIndex((index) => (index + step + films.length) % films.length);
  }, [films.length]);
  const back = useCallback(() => {
    if (panel !== 'ticket') { pixelSound.playCancel(); setPanel('ticket'); }
    else closeLandmarkModal();
  }, [panel, closeLandmarkModal]);
  const play = useCallback(() => {
    if (!video) return;
    pixelSound.playConfirm(); setPlaybackError(false); setPanel('player');
  }, [video]);
  const openDetail = () => {
    if (!film) return;
    pixelSound.playConfirm(); setPanel('detail');
  };
  useModalKeys({ isOpen, onClose: back,
    onPrev: panel === 'ticket' ? () => changeFilm(-1) : undefined,
    onNext: panel === 'ticket' ? () => changeFilm(1) : undefined,
    onConfirm: panel === 'ticket' ? play : undefined
  });
  if (!isOpen) return null;

  return <SceneModalFrame title="MARC CINEMA" subtitle={panel === 'player' ? film?.title : '海岸影院 · 选择票根，放映作品'} variant="ticket" onClose={closeLandmarkModal}
    footer={<div className="mm-footer"><span>{films.length ? `${filmIndex + 1} / ${films.length} 部作品` : '影片库'}</span><span>{panel === 'ticket' ? '← → 选片 · J 播放 · K 返回' : 'K 返回票根'}</span></div>}>
    <div className="mm-cinema">
      {!film ? <div className="mm-empty"><PixelFilm size={30} /><h3>放映表正在准备</h3><p>添加影片条目后，票根、介绍和上传的影片会出现在这里。</p><button className="mm-button" onClick={closeLandmarkModal}>返回放映室</button></div>
      : panel === 'player' ? <section className="mm-player" aria-label={`${film.title}影片播放器`}>
          <div className="mm-player-title"><PixelFilm /><strong>{film.title}</strong></div>
          {video ? <video key={`${film.id}:${video.url}`} src={video.url} poster={video.poster || (cover?.type === 'image' ? cover.url : undefined)} controls autoPlay playsInline preload="metadata" onError={() => setPlaybackError(true)} aria-label={video.caption || film.title}>你的浏览器不支持影片播放。</video> : <p className="mm-empty-note">待上传影片</p>}
          {playbackError && <p className="mm-error" role="alert">影片暂时无法播放，请检查上传文件或链接。</p>}
          {video?.caption && <p className="mm-media-caption">{video.caption}</p>}
          <button className="mm-button" onClick={() => setPanel('ticket')}>← 返回票根</button>
        </section>
      : panel === 'detail' ? <div className="mm-detail"><ContentDetail entry={film} onBack={() => setPanel('ticket')} /></div>
      : <>
          <div className="mm-cinema-program">
          <div className="mm-cinema-banner" aria-hidden="true"><PixelPalmTree /><span>SAME SKIES · BRIGHTER STORIES</span><PixelSeagull /></div>
          <div className="mm-ticket-switcher">
            <button className="mm-arrow" aria-label="上一部影片" disabled={films.length < 2} onClick={() => changeFilm(-1)}>◀</button>
            <article className="mm-ticket">
              <div className="mm-ticket-art"><ContentMedia asset={cover} kind="film" title={film.title} fit="cover" /></div>
              <div className="mm-ticket-copy"><span className="mm-eyebrow">ADMIT ONE · NO. {String(filmIndex + 1).padStart(2, '0')} {film.isSample && <span className="mm-sample">示例内容</span>}</span><h3>{film.title}</h3>{film.englishTitle && <p className="mm-english-title">{film.englishTitle}</p>}<div className="mm-ticket-meta"><span>{film.category}</span><span>{film.date || '日期待补充'}</span></div><span className="mm-stamp">MARC CINEMA</span></div>
            </article>
            <button className="mm-arrow" aria-label="下一部影片" disabled={films.length < 2} onClick={() => changeFilm(1)}>▶</button>
          </div>
          <dl className="mm-film-facts"><div><dt>影片类型</dt><dd>{film.category}</dd></div><div><dt>影片时长</dt><dd>{film.duration || '时长待补充'}</dd></div><div className="mm-synopsis"><dt>剧情简介</dt><dd>{film.description || '简介待补充'}</dd></div></dl>
          </div>
          <div className="mm-actions"><button className="mm-button mm-button-gold" disabled={!video} onClick={play}>{video ? '▶ 播放影片' : '待上传影片'}</button><button className="mm-button mm-button-light" onClick={openDetail}>作品详情</button><button className="mm-button" onClick={closeLandmarkModal}>返回放映室</button><button className="mm-button mm-button-light" disabled={films.length < 2} onClick={() => changeFilm(1)}>再看一部 ▶</button></div>
        </>}
    </div>
  </SceneModalFrame>;
};
