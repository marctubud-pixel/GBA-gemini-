import React from 'react';
import type { ContentEntry } from '../data/contentTypes';
import { ContentMedia } from './ContentMedia';
import { isContentUrl } from '../content/contentRepository';

export interface ContentDetailProps { entry: ContentEntry; onBack: () => void; }

export const ContentDetail: React.FC<ContentDetailProps> = ({ entry, onBack }) => {
  const gallery = entry.media.filter((asset) => asset.id !== entry.cover?.id);
  return (
    <article className="content-detail" key={entry.id}>
      <div className="content-detail-topline">
        <button className="scene-button scene-button-muted" onClick={onBack}>◀ 返回</button>
        <span>{[entry.category, entry.date, entry.isSample ? '示例内容' : ''].filter(Boolean).join(' · ')}</span>
      </div>
      <div className="content-detail-intro">
        <div className="content-detail-cover"><ContentMedia asset={entry.cover} kind={entry.kind} title={entry.title} fit="contain" /></div>
        <div className="content-detail-heading">
          <h3>{entry.title}</h3>
          {entry.englishTitle && <p className="content-detail-english">{entry.englishTitle}</p>}
          {entry.subtitle && <p className="content-detail-subtitle">{entry.subtitle}</p>}
          <p>{entry.description}</p>
          <div className="content-detail-tags">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
      </div>
      {!entry.cover && entry.media.length === 0 && <p className="content-detail-media-empty">尚未添加实际图片或视频 · 上方为像素示意图</p>}
      {entry.body && <div className="content-detail-prose">{entry.body}</div>}
      {entry.caseStudy?.map((section, index) => (
        <section className="content-detail-section" key={`${section.heading}-${index}`}>
          <h4>{section.heading}</h4><p>{section.text}</p>
        </section>
      ))}
      {gallery.length > 0 && <div className="content-detail-gallery">{gallery.map((asset) => (
        <figure key={asset.id}><ContentMedia asset={asset} kind={entry.kind} title={entry.title} fit="contain" />{asset.caption && <figcaption>{asset.caption}</figcaption>}</figure>
      ))}</div>}
      {isContentUrl(entry.demoUrl) && <a className="scene-button" href={entry.demoUrl} target="_blank" rel="noreferrer">打开作品 ↗</a>}
    </article>
  );
};
