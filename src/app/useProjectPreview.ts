import { useEffect, useState, type RefObject } from 'react';
import type Phaser from 'phaser';
import { getPreviewToken, parsePreviewMessage, previewContext, previewDestination, type PreviewMessage } from '../content/projectPreview';
import { useContentStore } from '../store/useContentStore';
import { useWorldStore } from '../store/useWorldStore';

/** The preview runs the same Phaser rooms and React panels as the public game. */
export function useProjectPreview(game: RefObject<Phaser.Game | null>) {
  const [token] = useState(getPreviewToken);
  const [pending, setPending] = useState<PreviewMessage | null>(null);
  const [error, setError] = useState('');
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!token) return;
    const parent = window.parent;
    if (parent === window) { setError('请从作品后台打开游戏预览'); return; }
    const timeout = window.setTimeout(() => setError('正在等待后台内容，请关闭后重新打开预览'), 15000);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== parent) return;
      if (event.data?.type !== 'portfolio-project-preview' || event.data?.token !== token) return;
      try {
        const message = parsePreviewMessage(event.data, token);
        window.clearTimeout(timeout);
        useContentStore.getState().setPreviewDocument(message.document); setPending(message); setError('');
      } catch {
        setError('预览内容无法读取，请关闭后重新打开');
        parent.postMessage({ type: 'portfolio-preview-error', token }, window.location.origin);
      }
    };
    window.addEventListener('message', receive);
    parent.postMessage({ type: 'portfolio-preview-ready', token }, window.location.origin);
    return () => { window.removeEventListener('message', receive); window.clearTimeout(timeout); };
  }, [token]);
  useEffect(() => {
    if (!pending || !token) return;
    let opened = false;
    const timeout = window.setTimeout(() => { if (!opened) setError('游戏加载较慢，请关闭后重新打开预览'); }, 20000);
    const apply = () => {
      const phaser = game.current;
      if (!phaser?.scene.isActive('WorldScene') && !phaser?.scene.isActive('InteriorScene')) return;
      const entry = pending.document.entries.find(item => item.id === pending.entryId)!;
      const target = previewDestination(entry), state = useWorldStore.getState();
      useWorldStore.setState({ soundEnabled: false, isStarting: false });
      if (target) {
        if (state.activeInterior !== target.interior) {
          if (state.activeInterior) state.exitInterior();
          useWorldStore.getState().enterInterior(target.interior);
        }
        useWorldStore.getState().openLandmarkModal(target.modal, previewContext(pending.page, entry.id, pending.requestId));
      } else { state.setCurrentView('index'); state.openContentOverlay(entry.id); }
      opened = true; window.clearTimeout(timeout); window.clearInterval(interval);
      setShown(true);
      window.parent.postMessage({ type: 'portfolio-preview-shown', token, requestId: pending.requestId }, window.location.origin);
    };
    const interval = window.setInterval(apply, 50); apply();
    return () => { window.clearInterval(interval); window.clearTimeout(timeout); };
  }, [pending, token, game]);
  return { active: !!token, waiting: !!token && !shown, error };
}
