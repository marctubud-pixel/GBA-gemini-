import { useMemo } from 'react';
import QRCode from 'qrcode';

export function CinemaDetailsCode({ url, title }: { url?: string; title: string }) {
  const symbol = useMemo(() => {
    if (!url || !/^https?:\/\//i.test(url)) return null;
    try {
      const { modules } = QRCode.create(url, { errorCorrectionLevel: 'M' });
      const path = Array.from(modules.data).flatMap((bit, index) => bit
        ? [`M${index % modules.size + 4} ${Math.floor(index / modules.size) + 4}h1v1h-1z`] : []).join('');
      return { path, size: modules.size + 8 };
    } catch { return null; }
  }, [url]);
  return <div className="cinema-ticket-stub">
    {symbol ? <a className="cinema-detail-code" href={url} target="_blank" rel="noopener noreferrer"
      aria-label={`打开${title}作品详情`} title="扫码或点击查看详情">
      <svg viewBox={`0 0 ${symbol.size} ${symbol.size}`} shapeRendering="crispEdges" aria-hidden="true">
        <rect width={symbol.size} height={symbol.size} fill="#fff" /><path d={symbol.path} fill="#102e45" />
      </svg>
    </a> : <span className="cinema-detail-code is-empty" aria-label="作品详情链接待添加"><i aria-hidden="true">↗</i></span>}
    <span className="cinema-code-caption">{symbol ? '扫一扫查看详情' : '详情链接待添加'}</span>
  </div>;
}
