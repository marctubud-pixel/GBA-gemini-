import React from 'react';

type CrownKind = 'book' | 'ticket' | 'gallery' | 'console' | 'collection' | 'lab';

// The transparent steps belong to the outside silhouette, leaving the room
// visible between the raised title and the lower shoulders of the window.
const crowns: Record<CrownKind, string> = {
  gallery: 'M4 60V34H12V26H142V18H202V10H270V2H330V10H398V18H458V26H588V34H596V60Z',
  book: 'M4 60V32H12V24H128V16H190V8H266V2H334V8H410V16H472V24H588V32H596V60Z',
  ticket: 'M4 60V36H12V28H94V20H158V12H220V6H272V2H328V6H380V12H442V20H506V28H588V36H596V60Z',
  console: 'M4 60V32H12V24H112V18H170V10H258V2H342V10H430V18H488V24H588V32H596V60Z',
  collection: 'M4 60V30H12V22H122V16H190V10H266V2H334V10H410V16H478V22H588V30H596V60Z',
  lab: 'M4 60V34H12V26H92V18H156V10H244V2H356V10H444V18H508V26H588V34H596V60Z',
};

export const SceneModalCrown: React.FC<{ kind: CrownKind }> = ({ kind }) => (
  <svg className="scene-modal-crown" viewBox="0 0 600 62" preserveAspectRatio="none" aria-hidden="true">
    <path d={crowns[kind]} fill="var(--header-accent)" stroke="#102e45" strokeWidth="4" strokeLinejoin="miter" />
    <path d={crowns[kind]} fill="none" stroke="var(--header-light)" strokeWidth="2" transform="translate(0 4) scale(1 .88)" />
    <path d="M150 54V28H176V20H224V14H278V8H322V14H376V20H424V28H450V54Z" fill="#fbf8ee" stroke="#102e45" strokeWidth="2" />
    <path d="M22 52H56V48H72V52H88V48H104V52H120M480 52H504V48H520V52H536V48H552V52H578" fill="none" stroke="var(--header-light)" strokeWidth="2" />
  </svg>
);
