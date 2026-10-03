import { useEffect, useRef, useState } from 'react';
import type { ContentDocument } from '../data/contentTypes';
import { PREVIEW_PARAM, type PreviewMessage, type PreviewPage } from '../content/projectPreview';

export function GamePreviewDialog({ document, entryId, unsaved, onClose }: {
  document: ContentDocument; entryId: string; unsaved: boolean; onClose: () => void;
}) {
  const [token] = useState(() => crypto.randomUUID());
  const [page, setPage] = useState<PreviewPage>('panel');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('正在打开房间…');
  const frame = useRef<HTMLIFrameElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const request = useRef('');
  const entry = document.entries.find(item => item.id === entryId)!;
  const latest = useRef({ document, entryId, page }); latest.current = { document, entryId, page };
  function send() {
    request.current = crypto.randomUUID();
    const message: PreviewMessage = { type: 'portfolio-project-preview', token, ...latest.current, requestId: request.current };
    frame.current?.contentWindow?.postMessage(message, window.location.origin);
    setStatus('正在呈现作品…');
  }
  function choosePage(next: PreviewPage) { setPage(next); if (next === page && connected) send(); }
  useEffect(() => {
    const origin = window.location.origin;
    const previous = window.document.activeElement as HTMLElement | null;
    const overflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden'; closeButton.current?.focus();
    const receive = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== frame.current?.contentWindow || event.data?.token !== token) return;
      if (event.data.type === 'portfolio-preview-ready') { setConnected(true); send(); }
      if (event.data.type === 'portfolio-preview-shown' && event.data.requestId === request.current) {
        setStatus('正在预览当前作品'); frame.current?.contentWindow?.focus();
      }
      if (event.data.type === 'portfolio-preview-error') setStatus('预览暂时无法打开，请关闭后重试');
    };
    const key = (event: KeyboardEvent) => { if (event.code === 'Escape') { event.preventDefault(); onClose(); } };
    window.addEventListener('message', receive); window.addEventListener('keydown', key);
    return () => { window.removeEventListener('message', receive); window.removeEventListener('keydown', key);
      window.document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [token, onClose]);
  useEffect(() => { if (connected) send(); }, [page, document, entryId]);
  return <div className="admin-game-preview-backdrop">
    <section className="admin-game-preview" role="dialog" aria-modal="true" aria-label="游戏中预览">
      <header><div className="admin-preview-heading"><h2>{entry.title}</h2><span>{unsaved ? '当前修改 · 尚未保存' : '已保存作品'}</span></div>
        <nav aria-label="预览视角"><button className={page === 'panel' ? 'is-active' : ''} aria-pressed={page === 'panel'} onClick={() => choosePage('panel')}>房间界面</button><button className={page === 'detail' ? 'is-active' : ''} aria-pressed={page === 'detail'} disabled={entry.kind === 'game-experience'} onClick={() => choosePage('detail')}>作品详情</button></nav>
        <button className="admin-preview-close" ref={closeButton} onClick={onClose}>关闭预览</button>
      </header>
      <iframe ref={frame} title="游戏中的作品预览" src={`/?${PREVIEW_PARAM}=${token}`} />
      <footer><span role="status">{status}</span><span>预览中可使用游戏按键。关闭后继续编辑，保存到作品库后更新前台。</span></footer>
    </section>
  </div>;
}
