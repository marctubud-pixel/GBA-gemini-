import React from 'react';
import { PixelBook, PixelGamepad, PixelLighthouse, PixelPalmTree, PixelSeagull, PixelShell } from '../shell/PixelIcons';

export type SceneHeaderKind = 'book' | 'ticket' | 'gallery' | 'console' | 'collection' | 'lab';

// Broad, reference-specific edges replace the repeated stair-step silhouette.
const frames: Record<SceneHeaderKind, { outline: string; plaque?: string }> = {
  book: {
    outline: 'M4 60V30H116V12L126 4H474L484 12V30H596V60Z',
    plaque: 'M130 54V16L138 10H462L470 16V54Z',
  },
  gallery: {
    outline: 'M4 60V34Q4 24 20 24H140Q168 6 266 6H334Q432 6 460 24H580Q596 24 596 34V60Z',
    plaque: 'M146 54V32Q146 14 258 14H342Q454 14 454 32V54Z',
  },
  ticket: {
    outline: 'M4 60V24Q300 -6 596 24V60Z',
    plaque: 'M94 54L108 24Q300 4 492 24L506 54Z',
  },
  console: {
    outline: 'M4 60V28Q4 12 20 12H194L208 4H392L406 12H580Q596 12 596 28V60Z',
  },
  collection: {
    outline: 'M4 60V16L12 8H292L300 14L308 8H588L596 16V60Z',
  },
  lab: {
    outline: 'M4 60V24L12 16H32V8H182V16H588L596 24V60Z',
    plaque: 'M20 54V24H580V54Z',
  },
};

const HeaderDetails: React.FC<{ kind: SceneHeaderKind }> = ({ kind }) => {
  switch (kind) {
    case 'book': return <>
      <g transform="translate(44 30)"><PixelBook size={28} /></g>
      <g transform="translate(509 26)"><PixelPalmTree size={29} /></g>
      <path d="M498 52V37L508 28L518 37V52Z" fill="#fbf8ee" stroke="#102e45" strokeWidth="2" />
      <rect x="505" y="40" width="6" height="12" fill="#2679bd" />
      <path d="M454 12V31L459 27L464 31V12Z" fill="#d78864" />
    </>;
    case 'gallery': return <>
      <g transform="translate(288 0)"><PixelShell size={24} color="#ffd8b2" /></g>
      <g transform="translate(40 16)"><PixelSeagull size={31} /></g>
      <g transform="translate(520 17)"><PixelLighthouse size={35} /></g>
      <path d="M25 54Q42 42 59 54T93 54M492 54Q509 42 526 54T560 54" fill="none" stroke="var(--header-light)" strokeWidth="3" />
    </>;
    case 'ticket': return <>
      <g fill="#e5c985" stroke="#102e45" strokeWidth="2">
        <circle cx="53" cy="38" r="16" />
        <circle cx="53" cy="38" r="3" fill="#102e45" />
        <circle cx="47" cy="31" r="4" fill="#527f95" />
        <circle cx="60" cy="32" r="4" fill="#527f95" />
        <circle cx="46" cy="45" r="4" fill="#527f95" />
        <circle cx="60" cy="44" r="4" fill="#527f95" />
      </g>
      <g transform="translate(525 20)"><PixelLighthouse size={31} /></g>
      <path d="M300 3L303 10L311 10L305 15L307 22L300 18L293 22L295 15L289 10L297 10Z" fill="#f3c653" stroke="#8b6232" strokeWidth="1" />
      {[18, 78, 512, 572].map((x) => <rect key={x} x={x} y="28" width="8" height="6" fill="#fbf8ee" />)}
    </>;
    case 'console': return <>
      <g transform="translate(77 12)"><PixelPalmTree size={34} /></g>
      <g transform="translate(29 24)"><PixelGamepad size={40} color="#fffdf5" /></g>
      <g stroke="#102e45" strokeWidth="2">
        <rect x="479" y="17" width="28" height="36" rx="2" fill="#448ca6" />
        <rect x="486" y="24" width="14" height="13" fill="#fff3c6" />
        <rect x="505" y="24" width="28" height="30" rx="2" fill="#d78864" />
        <rect x="512" y="30" width="14" height="11" fill="#fff3c6" />
        <rect x="531" y="20" width="25" height="34" rx="2" fill="#87ad72" />
        <rect x="537" y="26" width="13" height="12" fill="#fff3c6" />
      </g>
      <path d="M132 30H158V24H146V20H138V24H132ZM434 28H461V22H450V18H442V22H434Z" fill="#d7edf2" />
    </>;
    case 'collection': return <>
      <path d="M300 18V54" fill="none" stroke="var(--header-light)" strokeWidth="2" />
      {[462, 488, 514].map((x) => <g key={x}>
        <rect x={x} y="31" width="13" height="13" fill="#102e45" />
        <rect x={x + 2} y="33" width="9" height="8" fill="#bce0e9" />
      </g>)}
    </>;
    case 'lab': return <>
      <path d="M55 10V2H95V10H89V6H61V10Z" fill="#edcf76" stroke="#7c663e" strokeWidth="2" />
      <g transform="translate(38 27)"><PixelPalmTree size={25} /></g>
      <path d="M530 9V32Q530 41 539 41Q548 41 548 32V16Q548 10 542 10Q536 10 536 16V32" fill="none" stroke="#173a50" strokeWidth="5" />
      <path d="M530 9V32Q530 41 539 41Q548 41 548 32V16Q548 10 542 10Q536 10 536 16V32" fill="none" stroke="#91c8df" strokeWidth="2" />
      {[26, 574].map((x) => <g key={x} fill="#173a50"><rect x={x} y="28" width="3" height="3" /><rect x={x} y="47" width="3" height="3" /></g>)}
    </>;
  }
};

export const SceneModalCrown: React.FC<{ kind: SceneHeaderKind }> = ({ kind }) => {
  const { outline, plaque } = frames[kind];
  return <svg className="scene-modal-crown" data-crown-kind={kind} viewBox="0 -2 600 70" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    <path d={outline} fill="#102e45" stroke="#061b2b" strokeWidth="6" transform="translate(0 6)" />
    <path d={outline} fill="var(--header-accent)" stroke="#102e45" strokeWidth="6" />
    <path d={outline} fill="none" stroke="var(--header-light)" strokeWidth="3" transform="translate(5 4) scale(.984 .88)" />
    {plaque && <>
      <path d={plaque} fill="#dacbad" stroke="#102e45" strokeWidth="3" transform="translate(0 4)" />
      <path d={plaque} fill="#fbf8ee" stroke="#102e45" strokeWidth="3" />
    </>}
    <HeaderDetails kind={kind} />
  </svg>;
};
