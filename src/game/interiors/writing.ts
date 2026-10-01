/** A lived-in coastal writing room, drawn at 960 × 320 logical pixels. */
import {
  R, L, poly, ellipse, text, room, window, plant,
  shelf, books, lamp, poster, table, sign, stool, rug, cabinet, frame,
  hangingPlant, pinnedNote, wallClock, paperStack,
} from './kit';
import type { InteriorDrawAssets } from './types';

const P = {
  ink: '#172d3b', navy: '#0f3a5e', blue: '#2679bd', blueHi: '#5eb6ed',
  cream: '#fbf8ee', creamShade: '#f0e8d5', wood: '#a57a4e',
  woodDark: '#70533d', woodHi: '#d2a46e', green: '#52a869',
  greenDark: '#255b45', greenHi: '#9bbe63', coral: '#d63a2a', gold: '#f3c653',
};

function paperPile(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number = 13) {
  R(ctx, x + 3, y + h - 3, w, 3, '#c4bdac');
  R(ctx, x + 1, y + 3, w, h - 3, '#ddd5c0');
  R(ctx, x, y, w, h - 4, P.cream);
  L(ctx, x + 5, y + 3, x + w - 6, y + 3, '#c0c0b3');
  L(ctx, x + 5, y + 6, x + w - 11, y + 6, '#d7cfba');
}

function typewriter(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Paper, carriage, sloped dark body and chunky mechanical keys.
  R(ctx, x + 15, y - 33, 55, 33, '#b8b5a8');
  R(ctx, x + 12, y - 36, 55, 35, P.cream);
  L(ctx, x + 21, y - 27, x + 57, y - 27, '#9a9b96');
  L(ctx, x + 21, y - 21, x + 54, y - 21, '#c5c2b4');
  L(ctx, x + 21, y - 15, x + 59, y - 15, '#c5c2b4');
  R(ctx, x + 6, y - 3, 74, 9, P.ink);
  R(ctx, x + 1, y - 1, 7, 7, P.navy);
  R(ctx, x + 79, y - 1, 7, 7, P.ink);
  R(ctx, x + 13, y + 1, 58, 3, '#637b8a');
  poly(ctx, [[x + 10, y + 6], [x + 74, y + 6], [x + 86, y + 30], [x, y + 30]], P.ink);
  poly(ctx, [[x + 13, y + 8], [x + 71, y + 8], [x + 80, y + 24], [x + 6, y + 24]], P.navy);
  R(ctx, x + 2, y + 29, 82, 7, '#112b3d');
  R(ctx, x + 7, y + 32, 73, 2, '#4b6a80');
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      R(ctx, x + 15 - row * 2 + col * 6, y + 10 + row * 5, 4, 3, row === 0 ? '#adc3c7' : '#8fa4ad');
    }
  }
  R(ctx, x + 27, y + 26, 31, 3, '#91a5b1');
}

function openBook(ctx: CanvasRenderingContext2D, x: number, y: number) {
  R(ctx, x + 1, y + 23, 133, 4, P.woodDark);
  poly(ctx, [[x, y + 8], [x + 58, y], [x + 67, y + 7], [x + 67, y + 27], [x, y + 22]], '#c3b99c');
  poly(ctx, [[x + 67, y + 7], [x + 77, y], [x + 134, y + 8], [x + 134, y + 22], [x + 67, y + 27]], '#dcd0ac');
  poly(ctx, [[x + 3, y + 3], [x + 57, y - 3], [x + 65, y + 2], [x + 65, y + 22], [x + 3, y + 17]], P.cream);
  poly(ctx, [[x + 69, y + 2], [x + 77, y - 3], [x + 131, y + 3], [x + 131, y + 17], [x + 69, y + 22]], '#f1e9cf');
  L(ctx, x + 67, y + 3, x + 67, y + 25, '#987e5e', 2);
  for (let row = 0; row < 3; row++) {
    L(ctx, x + 13, y + 5 + row * 5, x + 48, y + 2 + row * 5, '#b4a98d');
    L(ctx, x + 83, y + 2 + row * 5, x + 120, y + 5 + row * 5, '#b4a98d');
  }
  R(ctx, x + 57, y + 22, 5, 13, P.coral);
}

export default function drawWriting(ctx: CanvasRenderingContext2D, assets: InteriorDrawAssets = {}) {
  room(ctx, {
    wall: P.cream, wallShade: '#e5e4d3', trim: P.navy, trimHi: P.blue,
    floor: '#b39162', floorShade: '#98754e', wainscot: '#e9e5d6', style: 'wood',
  });

  // Long blue skirting and the continuous architectural dado unify the room.
  R(ctx, 0, 143, 960, 4, '#c9c9bd');
  R(ctx, 0, 147, 960, 3, P.cream);
  R(ctx, 0, 225, 960, 8, P.navy);
  R(ctx, 0, 225, 960, 2, P.blue);
  // Narrow return door is kept clear for the shared entrance at the left edge.
  R(ctx, 4, 61, 49, 184, P.woodDark);
  R(ctx, 7, 64, 43, 181, P.navy);
  R(ctx, 11, 68, 35, 177, '#1b5472');
  R(ctx, 14, 71, 29, 124, '#2b6d8b');
  R(ctx, 16, 76, 25, 58, '#477b8b');
  R(ctx, 16, 137, 25, 53, '#32687a');
  R(ctx, 11, 195, 35, 4, '#83b6bf');
  R(ctx, 14, 204, 29, 28, '#19475e');
  R(ctx, 38, 186, 5, 3, P.gold);
  R(ctx, 4, 60, 49, 3, P.woodHi);
  R(ctx, 934, 30, 7, 195, '#e1dccb');
  sign(ctx, 'WRITE HOUSE', 369, 16, 226, P.blue);

  // Left: reading shelves and a proper, compact writing desk.
  shelf(ctx, 67, 55, 118, 190);
  books(ctx, 76, 64, 99, 25, 23);
  books(ctx, 76, 99, 61, 25, 9);
  books(ctx, 76, 134, 99, 25, 44);
  books(ctx, 76, 169, 99, 25, 17);
  R(ctx, 144, 100, 28, 23, P.creamShade);
  R(ctx, 148, 104, 20, 16, P.cream);
  R(ctx, 153, 106, 10, 5, P.blue);
  text(ctx, 'NOTES', 158, 114, 7, P.navy, 'center');
  R(ctx, 76, 205, 99, 28, '#846649');
  R(ctx, 81, 211, 40, 17, '#b59267');
  R(ctx, 128, 211, 40, 17, '#b59267');
  R(ctx, 98, 215, 7, 3, P.gold);
  R(ctx, 145, 215, 7, 3, P.gold);

  poster(ctx, 227, 50, 85, 83, 'graphic', P.blue);
  text(ctx, 'MAKE WORDS', 269, 119, 5, P.cream, 'center');
  table(ctx, 202, 189, 145, 58, P.wood);
  R(ctx, 213, 204, 122, 17, '#926e47');
  R(ctx, 220, 207, 49, 10, '#bd9365');
  R(ctx, 276, 207, 49, 10, '#bd9365');
  R(ctx, 241, 210, 9, 3, P.gold);
  R(ctx, 297, 210, 9, 3, P.gold);
  paperPile(ctx, 259, 177, 49, 13);
  R(ctx, 265, 167, 37, 12, P.blue);
  R(ctx, 270, 170, 25, 2, P.blueHi);
  R(ctx, 314, 172, 15, 17, P.creamShade);
  R(ctx, 315, 173, 11, 3, '#fffff6');
  R(ctx, 329, 176, 5, 8, P.creamShade);
  R(ctx, 329, 178, 2, 4, P.woodDark);
  R(ctx, 214, 185, 24, 4, P.navy);
  R(ctx, 224, 158, 3, 29, P.navy);
  L(ctx, 225, 159, 213, 150, P.navy, 3);
  poly(ctx, [[206, 148], [220, 148], [226, 158], [201, 158]], P.navy);
  poly(ctx, [[207, 149], [218, 149], [222, 155], [205, 155]], P.blue);
  R(ctx, 203, 157, 21, 2, P.gold);
  stool(ctx, 265, 219, P.woodDark);

  // Middle: view of the sea, quiet daylight and an open manuscript.
  window(ctx, 385, 50, 211, 118, { trim: P.navy, trimHi: P.blue, time: assets.time });
  R(ctx, 377, 168, 227, 7, P.woodDark);
  R(ctx, 379, 168, 223, 2, P.woodHi);
  R(ctx, 401, 158, 19, 9, '#f4eddb');
  R(ctx, 404, 148, 12, 12, '#d7e4d5');
  R(ctx, 406, 139, 7, 15, P.greenDark);
  R(ctx, 399, 142, 9, 6, P.green);
  R(ctx, 412, 146, 9, 5, P.greenHi);
  R(ctx, 552, 157, 23, 10, P.blue);
  R(ctx, 558, 152, 10, 5, '#a6dcf1');
  rug(ctx, 403, 233, 178, 19, '#cdb487');
  L(ctx, 411, 242, 573, 242, '#f2dfab', 2);
  table(ctx, 402, 197, 176, 50, '#b28a5a');
  R(ctx, 419, 210, 144, 29, '#c79e6b');
  R(ctx, 422, 212, 138, 3, '#d9b47f');
  R(ctx, 433, 224, 113, 3, '#ac8052');
  openBook(ctx, 423, 174);
  R(ctx, 588, 195, 27, 7, P.navy);
  R(ctx, 596, 201, 9, 43, P.woodDark);
  R(ctx, 586, 242, 30, 4, P.woodDark);
  R(ctx, 590, 176, 20, 16, P.cream);
  R(ctx, 593, 180, 14, 2, '#b8bdaf');
  R(ctx, 593, 185, 10, 2, '#b8bdaf');

  // Right: typewriter, collected manuscript cards and a little paper storage.
  frame(ctx, 739, 50, 164, 102, P.woodDark);
  R(ctx, 747, 58, 148, 86, '#c49f6d');
  R(ctx, 751, 62, 140, 78, '#cda975');
  const pinned = [
    [759, 70, 32, 48, -1], [802, 67, 38, 56, 1], [852, 75, 31, 48, 0],
  ];
  for (const [x, y, w, h, offset] of pinned) {
    R(ctx, x + 2, y + 2, w, h, '#ab885e');
    R(ctx, x, y, w, h, P.creamShade);
    R(ctx, x + 4, y + 4, w - 8, h - 8, P.cream);
    R(ctx, x + w / 2 - 2 + offset, y - 2, 4, 4, P.coral);
    for (let line = 0; line < 5; line++) {
      R(ctx, x + 7, y + 12 + line * 5, w - 14 - (line % 2) * 6, 1, '#a8a894');
    }
  }
  R(ctx, 779, 128, 75, 9, P.creamShade);
  text(ctx, 'STORIES BEGIN HERE', 817, 135, 5, P.woodDark, 'center');
  table(ctx, 681, 197, 151, 50, P.wood);
  R(ctx, 691, 214, 130, 26, '#8b6648');
  R(ctx, 697, 219, 116, 14, '#aa855c');
  R(ctx, 746, 222, 18, 3, P.gold);
  typewriter(ctx, 692, 160);
  paperPile(ctx, 791, 181, 32, 15);
  R(ctx, 818, 158, 5, 21, P.coral);
  R(ctx, 824, 162, 3, 18, P.navy);
  R(ctx, 813, 179, 19, 15, '#d9ccb1');
  R(ctx, 816, 181, 13, 2, '#fff5db');
  stool(ctx, 738, 219, P.woodDark);
  cabinet(ctx, 858, 181, 49, 64, P.blue);
  R(ctx, 866, 189, 33, 15, P.creamShade);
  R(ctx, 866, 209, 33, 15, '#d7dcca');
  R(ctx, 878, 194, 9, 3, P.navy);
  R(ctx, 878, 214, 9, 3, P.navy);
  paperPile(ctx, 864, 170, 36, 11);
  plant(ctx, 920, 243, 0.85, '#b78862');

  // The everyday tools of writing occupy the back wall and worktops.
  hangingPlant(ctx, 631, 38, 28, '#bd8055');
  wallClock(ctx, 682, 94, 16);
  pinnedNote(ctx, 625, 138, 25, 31, '#f4db8b');
  pinnedNote(ctx, 660, 147, 28, 26, P.cream);
  lamp(ctx, 196, 32, P.blue);
  paperStack(ctx, 214, 179, 26);
  R(ctx, 251, 186, 29, 2, '#ba4e37');
  R(ctx, 276, 185, 5, 3, '#e2cba0');
  R(ctx, 309, 229, 34, 10, '#d2bc8c');
  R(ctx, 311, 230, 30, 2, P.cream);
  text(ctx, 'DRAFT', 326, 232, 7, P.woodDark, 'center');
  frame(ctx, 194, 99, 25, 32, P.woodDark);
  R(ctx, 200, 105, 13, 15, '#779aa0');
  R(ctx, 202, 108, 8, 3, P.gold);

  // The walking foreground stays uncluttered; only broad floorboard marks.
  L(ctx, 29, 272, 919, 272, '#caa578');
};
