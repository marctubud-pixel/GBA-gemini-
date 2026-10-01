import React, { useState } from 'react';
import type { MediaAsset } from '../data/contentTypes';
import { PixelBike, PixelBook, PixelCamera, PixelCart, PixelDisc, PixelFilm, PixelGamepad, PixelPalette, PixelRobot, PixelShell, PixelTag } from '../shell/PixelIcons';

interface ContentMediaProps {
  asset?: MediaAsset;
  kind?: string;
  title?: string;
  className?: string;
  fit?: 'cover' | 'contain';
}

/** A native pixel illustration is shown until the owner adds actual media. */
const PixelPlaceholder: React.FC<{ kind: string; title: string }> = ({ kind, title }) => {
  kind = kind.replace(/^brand-/, '');
  const Icon = kind === 'writing' || kind === 'reading' ? PixelBook
    : kind === 'film' ? PixelFilm : kind.startsWith('game') ? PixelGamepad
    : kind === 'photo' ? PixelCamera : kind === 'vinyl' ? PixelDisc
    : kind === 'cycling' ? PixelBike : kind === 'figures' || kind === 'ip' ? PixelRobot
    : kind === 'art' ? PixelPalette : kind === 'brand' ? PixelTag : kind === 'ecommerce' ? PixelCart : PixelShell;
  const warm = ['brand', 'art', 'ecommerce', 'figures'].includes(kind);
  return <div className="content-media-placeholder" role="img" aria-label={`${title} · 像素示意图`}>
    <svg viewBox="0 0 160 96" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="160" height="96" fill={warm ? '#dbc59c' : '#76b5d0'} />
      <path d="M0 52h160v44H0z" fill="#245587" />
      <path d="M0 61h29v-3h27v4h32v-3h36v5h36v3H0z" fill="#4192b8" />
      <path d="M8 76h18v2H8zm36-6h26v2H44zm60 7h24v2h-24zm33-20h15v2h-15z" fill="#a8d7df" />
      <path d="M14 21h12v-4h14v4h10v6H14zm103 8h10v-3h14v3h11v6h-35z" fill="#fff5da" />
      <path d="M0 89h20v-4h14v-4h13v-3h64v3h19v5h16v3h14v7H0z" fill="#d2a46e" />
      <path d="M44 84h69v3H44zm-17 5h100v3H27z" fill="#e7d3a8" />
      <rect x="48" y="20" width="64" height="55" fill="#102e45" />
      <rect x="51" y="23" width="58" height="49" fill="#fbf8ee" />
      <rect x="55" y="27" width="50" height="3" fill="#c5dde0" />
    </svg>
    <span className="content-media-symbol" aria-hidden="true"><Icon size={30} /></span>
  </div>;
};

export const ContentMedia: React.FC<ContentMediaProps> = ({ asset, kind = 'general', title = '作品', className = '', fit = 'cover' }) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const unavailable = !asset || !asset.url || failedUrl === asset.url;
  return <div className={`content-media ${className}`}>
    {unavailable ? <PixelPlaceholder kind={kind} title={title} />
      : asset.type === 'video' ? <video key={asset.url} controls playsInline preload="metadata" poster={asset.poster} aria-label={asset.alt || title} style={{ objectFit: fit }} onError={() => setFailedUrl(asset.url)}><source src={asset.url} /></video>
      : <img key={asset.url} src={asset.url} alt={asset.alt || title} style={{ objectFit: fit }} loading="lazy" onError={() => setFailedUrl(asset.url)} />}
    {failedUrl === asset?.url && <span className="content-media-error">媒体暂时无法加载</span>}
  </div>;
};
