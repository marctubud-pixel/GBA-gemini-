import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
GlobalWorkerOptions.workerSrc = workerUrl;

function PdfPage({ pdf, number, width, ratio, root }: { pdf: PDFDocumentProxy; number: number; width: number; ratio: number; root: HTMLElement | null }) {
  const holder = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [nearby, setNearby] = useState(number === 1);
  const [heightRatio, setHeightRatio] = useState(ratio);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), { root, rootMargin: '900px' });
    if (holder.current) observer.observe(holder.current);
    return () => observer.disconnect();
  }, [root]);
  useEffect(() => {
    if (!nearby || !width) { if (canvas.current) { canvas.current.width = 0; canvas.current.height = 0; } setReady(false); return; }
    let cancelled = false; let task: RenderTask | undefined;
    setReady(false); setError(false);
    void pdf.getPage(number).then(page => {
      if (cancelled || !canvas.current) return;
      const original = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: width / original.width });
      setHeightRatio(original.height / original.width);
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.current.width = Math.ceil(viewport.width * density); canvas.current.height = Math.ceil(viewport.height * density);
      task = page.render({ canvas: canvas.current, viewport, transform: density === 1 ? undefined : [density, 0, 0, density, 0, 0] });
      return task.promise;
    }).then(() => { if (!cancelled) setReady(true); }).catch(error => { if (!cancelled && error.name !== 'RenderingCancelledException') setError(true); });
    return () => { cancelled = true; task?.cancel(); };
  }, [pdf, number, width, nearby]);
  return <div className="project-pdf-page" ref={holder} style={{ width, height: width * heightRatio }} data-pdf-page={number}>
    <canvas ref={canvas} aria-label={`PDF 第 ${number} 页`} style={{ visibility: ready ? 'visible' : 'hidden' }} />
    {!ready && <span>{error ? '这一页暂时无法显示' : `第 ${number} 页`}</span>}
  </div>;
}

export default function PdfReader({ url, zoom }: { url: string; zoom: number }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [ratio, setRatio] = useState(1.414);
  const [error, setError] = useState('');
  const [width, setWidth] = useState(0);
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  useEffect(() => {
    let cancelled = false; setPdf(null); setError('');
    const task = getDocument({ url, cMapUrl: '/pdf-support/cmaps/', cMapPacked: true,
      standardFontDataUrl: '/pdf-support/standard_fonts/', wasmUrl: '/pdf-support/wasm/' });
    task.onPassword = () => { if (!cancelled) setError('这份 PDF 有密码保护，请上传可直接阅读的版本'); };
    void task.promise.then(async document => {
      if (cancelled) return;
      const first = await document.getPage(1); const viewport = first.getViewport({ scale: 1 });
      if (!cancelled) { setRatio(viewport.height / viewport.width); setPdf(document); }
    }).catch(() => { if (!cancelled) setError('PDF 暂时无法显示，请检查文件是否完整'); });
    return () => { cancelled = true; void task.destroy(); };
  }, [url]);
  useEffect(() => {
    const element = area.current; if (!element) return;
    const resize = () => setWidth(Math.min(1000, Math.max(200, element.clientWidth - 52)) * zoom / 100);
    resize(); const observer = new ResizeObserver(resize); observer.observe(element); return () => observer.disconnect();
  }, [zoom]);
  return <div className="project-pdf-scroll" ref={area} tabIndex={0} aria-label="PDF 连续阅读" data-project-scroll
    onPointerDown={event => { if (event.pointerType !== 'mouse' || event.button !== 0 || !(event.target instanceof HTMLCanvasElement)) return;
      drag.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop }; event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault(); }}
    onPointerMove={event => { const start = drag.current; if (!start) return; event.currentTarget.scrollLeft = start.left + start.x - event.clientX; event.currentTarget.scrollTop = start.top + start.y - event.clientY; }}
    onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
    {error ? <div className="project-reader-empty" role="alert"><p>{error}</p><a href={url} target="_blank" rel="noopener noreferrer">打开原文件 ↗</a></div> : !pdf ? <p className="project-reader-empty" role="status">正在打开 PDF…</p>
      : <div className="project-pdf-pages" style={{ minWidth: width + 48 }}>{Array.from({ length: pdf.numPages }, (_, index) => <PdfPage key={`${url}:${index}`} pdf={pdf} number={index + 1} width={width} ratio={ratio} root={area.current} />)}<p className="project-pdf-end">共 {pdf.numPages} 页</p></div>}
  </div>;
}
