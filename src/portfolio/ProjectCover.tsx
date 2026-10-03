import type { CoverLayout, MediaAsset } from '../data/contentTypes';
import { ContentMedia } from './ContentMedia';
import './projectCover.css';

const RATIOS = { '4:3': 4 / 3, '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1 };

/** Fit a selected cover frame inside the existing room UI, without changing its size. */
export function ProjectCover({ asset, layout, kind, title, fit = 'contain' }: {
  asset?: MediaAsset; layout?: CoverLayout; kind?: string; title?: string; fit?: 'contain' | 'cover';
}) {
  if (!layout || layout.ratio === 'original') {
    return <ContentMedia asset={asset} kind={kind} title={title} fit={layout ? 'contain' : fit} />;
  }
  const ratio = RATIOS[layout.ratio];
  return <div className="project-cover" data-cover-ratio={layout.ratio} data-cover-fit={layout.fit}>
    <div className="project-cover-frame" style={{ width: `min(100cqw, ${100 * ratio}cqh)`, height: `min(100cqh, ${100 / ratio}cqw)` }}>
      <ContentMedia asset={asset} kind={kind} title={title} fit={layout.fit} />
    </div>
  </div>;
}
