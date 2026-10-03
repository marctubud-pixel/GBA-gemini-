import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import type { MediaAsset } from '../data/contentTypes';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { PixelFilm } from '../shell/PixelIcons';
import { SceneModalFrame, useModalKeys } from './SceneModalFrame';
import { ProjectCover } from './ProjectCover';
import { CinemaProjectViewer } from './CinemaProjectViewer';
import { ManagedProjectViewer, openExternalDetail, usesManagedViewer } from './ManagedProjectViewer';
import './mediaModals.css';
import './cinemaTicket.css';
import { readPreviewContext } from '../content/projectPreview';
import { CinemaTicketTitle } from './CinemaTicketTitle';
import { CinemaDetailsCode } from './CinemaDetailsCode';
import { CinemaFullscreenPlayer, type CinemaPlaybackHandle } from './CinemaFullscreenPlayer';

type CinemaPanel = 'ticket' | 'player';
function ticketImage(asset?: MediaAsset): MediaAsset | undefined {
  if (!asset || asset.type === 'image') return asset;
  return asset.poster ? { ...asset, type: 'image', url: asset.poster } : undefined;
}

export const MarcCinemaModal = () => {
  const isOpen = useWorldStore((s) => s.activeLandmarkModal === 'marc-cinema' && s.currentView === 'game' && !s.isOverlayOpen);
  const closeLandmarkModal = useWorldStore((s) => s.closeLandmarkModal);
  const modalContext = useWorldStore((s) => s.modalContext);
  const entries = useContentStore((s) => s.entries);
  const films = useMemo(() => entries.filter((entry) => entry.kind === 'film'), [entries]);
  const [filmIndex, setFilmIndex] = useState(0);
  const [panel, setPanel] = useState<CinemaPanel>('ticket');
  const [showDetail, setShowDetail] = useState(false);
  const playback = useRef<CinemaPlaybackHandle>(null);
  const film = films[Math.min(filmIndex, Math.max(0, films.length - 1))];
  const video = film?.media.find((asset) => asset.type === 'video' && asset.url.trim());
  const cover = ticketImage(film?.cover || film?.media.find((asset) => asset.type === 'image') || video);

  useEffect(() => {
    if (isOpen) {
      const preview = readPreviewContext(modalContext);
      const index = films.findIndex(entry => entry.id === (preview?.entryId || modalContext));
      setFilmIndex(Math.max(0, index)); setPanel('ticket'); setShowDetail(preview?.page === 'detail');
    }
  }, [isOpen, modalContext]);
  useEffect(() => {
    setFilmIndex((index) => Math.min(index, Math.max(0, films.length - 1)));
  }, [films.length]);
  useEffect(() => { setPanel('ticket'); }, [film?.id, video?.url]);

  const changeFilm = useCallback((step: number) => {
    if (!films.length) return;
    pixelSound.playSelect();
    setPanel('ticket');
    setFilmIndex((index) => (index + step + films.length) % films.length);
  }, [films.length]);
  const back = useCallback(() => {
    if (panel !== 'ticket') { pixelSound.playCancel(); setPanel('ticket'); }
    else closeLandmarkModal();
  }, [panel, closeLandmarkModal]);
  const play = useCallback(() => {
    if (!video) return;
    pixelSound.playConfirm();
    flushSync(() => setPanel('player'));
    playback.current?.start();
  }, [video]);
  const selectDetailFilm = (id: string) => {
    const index = films.findIndex((entry) => entry.id === id);
    if (index < 0) return;
    if (openExternalDetail(films[index])) return;
    pixelSound.playSelect(); setFilmIndex(index);
  };
  useModalKeys({ isOpen: isOpen && !showDetail, onClose: back,
    onPrev: panel === 'ticket' ? () => changeFilm(-1) : undefined,
    onNext: panel === 'ticket' ? () => changeFilm(1) : undefined,
    onConfirm: panel === 'ticket' ? play : undefined
  });
  if (!isOpen) return null;
  if (panel === 'player' && film && video) return <CinemaFullscreenPlayer ref={playback} video={video}
    title={film.title} poster={cover?.type === 'image' ? cover.url : undefined} onClose={back} />;

  return <>
  <div className="cinema-base" aria-hidden={showDetail ? true : undefined}>
  <SceneModalFrame title="MARC CINEMA" subtitle="选择电影票" variant="ticket" onClose={closeLandmarkModal}
    footer={<div className="mm-footer"><span>{films.length ? `${filmIndex + 1} / ${films.length}` : '影片库'}</span><span>A / D 选片 · J 播放</span></div>}>
    <div className="mm-cinema cinema-ticket-room">
      {!film ? <div className="mm-empty"><PixelFilm size={30} /><h3>放映表正在准备</h3><p>作品上传后会出现在这里。</p></div>
      : <>
          <div className="cinema-ticket-switcher">
            <button className="cinema-ticket-arrow" aria-label="上一部影片" title="上一部影片 · A / ←" disabled={films.length < 2} onClick={() => changeFilm(-1)}><span aria-hidden="true">◀</span></button>
            <article className="cinema-ticket" aria-label={`${film.title}电影票`} data-film-id={film.id}>
              <svg className="cinema-ticket-outline" viewBox="0 0 600 240" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
                <path d="M12 4H472V12H488V4H588L596 12V108H586V132H596V228L588 236H488V228H472V236H12L4 228V132H14V108H4V12Z" fill="#fbf4e1" stroke="#ad7653" strokeWidth="3" />
                <path d="M17 12H465M495 12H583M17 228H465M495 228H583" stroke="#e1c891" strokeWidth="2" />
                <path d="M22 20H30V18H38V20H46M554 222H562V220H570V222H578" fill="none" stroke="#b4cdd3" strokeWidth="2" />
              </svg>
              <div className="cinema-ticket-art"><ProjectCover asset={cover} layout={{ ratio: '16:9', fit: film.coverLayout?.fit || 'contain' }} kind="film" title={film.title} /></div>
              <div className="cinema-ticket-copy">
                <span className="cinema-ticket-label">影片名称</span><CinemaTicketTitle title={film.title} />
                <dl className="cinema-ticket-meta"><div><dt>影片类型</dt><dd title={film.category}>{film.category || '待补充'}</dd></div><div><dt>上映日期</dt><dd title={film.date}>{film.date || '待补充'}</dd></div></dl>
              </div>
              <CinemaDetailsCode url={film.detail?.type === 'link' ? film.detail.url : undefined} title={film.title} />
            </article>
            <button className="cinema-ticket-arrow" aria-label="下一部影片" title="下一部影片 · D / →" disabled={films.length < 2} onClick={() => changeFilm(1)}><span aria-hidden="true">▶</span></button>
          </div>
          <div className="cinema-ticket-actions"><button className="cinema-ticket-play" aria-label={video ? `播放${film.title}` : `${film.title}影片待上传`} title={video ? '全屏播放影片 · J' : '完整影片待上传'} disabled={!video} onClick={play}><span aria-hidden="true">▶</span><span>{video ? '播放' : '影片待上传'}</span></button></div>
        </>}
    </div>
  </SceneModalFrame>
  </div>
  {showDetail && film && (usesManagedViewer(film) ? <ManagedProjectViewer entries={films} entryId={film.id} onEntryChange={selectDetailFilm} onClose={() => setShowDetail(false)} /> : <CinemaProjectViewer entries={films} entryId={film.id} onEntryChange={selectDetailFilm} onClose={() => { pixelSound.playCancel(); setShowDetail(false); }} />)}
  </>;
};
