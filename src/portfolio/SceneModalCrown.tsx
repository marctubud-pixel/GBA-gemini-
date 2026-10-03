import React from 'react';
import { PixelBook, PixelCamera, PixelGamepad, PixelLighthouse, PixelPalmTree, PixelSeagull, PixelShell } from '../shell/PixelIcons';

export type SceneHeaderKind = 'book' | 'ticket' | 'gallery' | 'console' | 'collection' | 'lab';

// Broad, reference-specific edges replace the repeated stair-step silhouette.
const frames: Record<SceneHeaderKind, { outline: string; plaque?: string }> = {
  book: {
    outline: 'M4 60V30H106V12L116 4H484L494 12V30H596V60Z',
    plaque: 'M120 53V16L128 10H472L480 16V53Z',
  },
  gallery: {
    outline: 'M4 60V38Q4 28 20 28H140Q168 8 266 8H334Q432 8 460 28H580Q596 28 596 38V60Z',
    plaque: 'M146 54V32Q146 14 258 14H342Q454 14 454 32V54Z',
  },
  ticket: {
    outline: 'M4 60V24Q300 -6 596 24V60Z',
    plaque: 'M90 54L120 26Q300 4 480 26L510 54Z',
  },
  console: {
    outline: 'M4 60V28Q4 12 20 12H194L208 4H392L406 12H580Q596 12 596 28V60Z',
  },
  collection: {
    outline: 'M4 60V20L16 8H286L300 14L314 8H584L596 20V60Z',
    plaque: 'M158 52V23L168 15H432L442 23V52Z',
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
      <path d="M458 10V35L464 31L470 35V10Z" fill="#d78864" />
      <path d="M131 49H447M130 13H447" fill="none" stroke="#dacbad" strokeWidth="2" />
      <path d="M125 54H475M128 56H472M131 58H469" fill="none" stroke="#e7dbc1" strokeWidth="1" />
      <path d="M300 53V59" fill="none" stroke="#a78b65" strokeWidth="2" />
      <path d="M18 53H100M496 56H580" fill="none" stroke="var(--header-light)" strokeWidth="2" />
      <path d="M20 57H29V55H38V57H47V55H56V57H65V55H74V57H95M535 55H544V53H553V55H562V53H571V55H580" fill="none" stroke="#a8ddf4" strokeWidth="2" />
      <path d="M86 36H89V32H93V36H97V40H93V44H89V40H86ZM559 34H562V31H565V34H568V37H565V40H562V37H559Z" fill="#f5d48c" />
      <path d="M121 10V17H128M480 17H473V10" fill="none" stroke="#b0d8e7" strokeWidth="2" />
    </>;
    case 'gallery': return <>
      <circle cx="300" cy="12" r="12" fill="#527b91" stroke="#e3bf7e" strokeWidth="2" />
      <g transform="translate(289 1)"><PixelShell size={22} color="#f5ce8c" /></g>
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
      <path d="M300 1L304 9L313 9L306 15L309 23L300 18L291 23L294 15L287 9L296 9Z" fill="#f3c653" stroke="#8b6232" strokeWidth="1" />
      {[25, 38, 51].map((y) => <g key={y} fill="#fbf8ee"><rect x="17" y={y} width="8" height="6" /><rect x="575" y={y} width="8" height="6" /></g>)}
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
      {/* A photo album on the left, a record and books on the right. */}
      <g data-collection-detail="photo-album" stroke="#102e45" strokeWidth="2">
        <path d="M27 22H57V52H27Z" fill="#d6c697" />
        <path d="M39 15H76V48H39Z" fill="#fff8e5" />
        <path d="M44 20H71V38H44Z" fill="#76bacc" stroke="none" />
        <path d="M44 31H71V38H44Z" fill="#3287a1" stroke="none" />
        <path d="M44 38V34L54 27L62 32L71 28V38Z" fill="#84a97e" stroke="none" />
        <path d="M52 44H64" fill="none" stroke="#a8beb6" />
      </g>
      <g transform="translate(79 27)" data-collection-detail="camera"><PixelCamera size={26} color="#f8efd5" /></g>
      <path d="M117 29H121V25H125V29H129V33H125V37H121V33H117Z" fill="#ebc875" />
      <g data-collection-detail="vinyl">
        <circle cx="507" cy="37" r="16" fill="#0d293f" stroke="#82b2c4" strokeWidth="1" />
        <circle cx="507" cy="37" r="12" fill="none" stroke="#355c72" strokeWidth="1" />
        <circle cx="507" cy="37" r="9" fill="none" stroke="#355c72" strokeWidth="1" />
        <circle cx="507" cy="37" r="5" fill="#e5c885" />
        <rect x="506" y="36" width="2" height="2" fill="#163b55" />
        <path d="M495 31L499 27M497 34L502 29" fill="none" stroke="#769aa7" strokeWidth="1" />
      </g>
      <g transform="translate(537 25)" data-collection-detail="books"><PixelBook size={29} color="#faf3df" /></g>
      <path d="M474 34H477V31H480V34H483V37H480V40H477V37H474Z" fill="#9ecbd2" />
      <path d="M19 55H145M455 55H580M166 18H434" fill="none" stroke="#a8d4d7" strokeWidth="1" />
      <path d="M171 49H429M162 55H438M165 57H435" fill="none" stroke="#d7cba9" strokeWidth="1" />
      <path d="M300 56V61M296 59H304" fill="none" stroke="#80a8bb" strokeWidth="2" />
      <path d="M170 25V30H175M430 25V30H425" fill="none" stroke="#d3ad6d" strokeWidth="2" />
      <path d="M16 13H140M460 13H584" fill="none" stroke="#91bfcc" strokeWidth="1" strokeDasharray="3 5" />
      <path d="M18 18V46M582 18V46" fill="none" stroke="#194362" strokeWidth="2" />
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
