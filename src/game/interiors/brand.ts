/** A coastal design gallery, drawn at 960 × 320 logical pixels. */
import {
  R, L, poly, ellipse, room, window, plant,
  shelf, books, lamp, poster, table, rug, cabinet, frame,
  hangingPlant, pinnedNote, paperStack,
  pixelGroup,
} from './kit';
import type { InteriorDrawAssets } from './types';

const P = {
  ink: '#172d3b', navy: '#0f3a5e', blue: '#2679bd', blueHi: '#5eb6ed',
  cream: '#fbf8ee', creamShade: '#f0e8d5', wood: '#a57a4e',
  woodDark: '#70533d', woodHi: '#d2a46e', green: '#52a869',
  greenDark: '#255b45', greenHi: '#9bbe63', coral: '#d63a2a', gold: '#f3c653',
};

function mascot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // A cool silhouette, lit upper edge and shaded right face detach the sculpture from glass.
  poly(ctx, [[x+9,y-13],[x+31,y-13],[x+31,y-8],[x+36,y-8],[x+36,y+3],
    [x+38,y+3],[x+38,y+10],[x+41,y+10],[x+41,y+30],[x+45,y+30],[x+45,y+45],
    [x+35,y+45],[x+35,y+59],[x+8,y+59],[x+8,y+45],[x-4,y+45],[x-4,y+30],
    [x-1,y+30],[x-1,y+10],[x+2,y+10],[x+2,y+3],[x+6,y+3],[x+6,y-8],[x+9,y-8]], '#435c66');
  ellipse(ctx,x+23,y+61,20,3,'#7d938e');
  R(ctx, x + 7, y, 27, 4, '#dce8e7');
  R(ctx, x + 3, y + 4, 34, 18, '#dce8e7');
  R(ctx, x, y + 11, 40, 19, P.cream);
  R(ctx, x + 5, y + 28, 31, 19, '#d2dfdb');
  R(ctx, x + 9, y + 45, 25, 13, P.navy);
  R(ctx, x + 12, y + 48, 19, 3, P.blue);
  R(ctx, x + 13, y + 55, 6, 6, P.gold);
  R(ctx, x + 26, y + 55, 6, 6, P.gold);
  R(ctx, x + 8, y + 15, 5, 5, P.ink);
  R(ctx, x + 27, y + 15, 5, 5, P.ink);
  R(ctx, x + 15, y + 23, 12, 4, P.gold);
  R(ctx, x + 18, y + 27, 6, 3, '#c29139');
  R(ctx, x - 3, y + 31, 10, 13, P.cream);
  R(ctx, x + 34, y + 31, 10, 13, P.cream);
  R(ctx, x + 7, y - 7, 28, 9, P.navy);
  R(ctx, x + 10, y - 12, 22, 5, P.navy);
  R(ctx, x + 12, y - 9, 18, 2, P.blue);
  R(ctx, x + 17, y - 5, 7, 3, P.gold);
  R(ctx, x + 32, y + 6, 4, 17, '#acbcb8');
  R(ctx, x + 32, y + 31, 3, 13, '#94aaa8');
  R(ctx, x + 39, y + 33, 3, 10, '#9aafad');
  R(ctx, x + 3, y + 12, 2, 15, '#ffffff');
}

function bag(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  R(ctx, x + 5, y - 6, 17, 3, P.creamShade);
  R(ctx, x + 3, y - 4, 3, 8, P.creamShade);
  R(ctx, x + 20, y - 4, 3, 8, P.creamShade);
  R(ctx, x, y + 1, 26, 29, color);
  R(ctx, x + 3, y + 4, 20, 2, '#c3d4d1');
  R(ctx, x + 10, y + 13, 8, 7, P.gold);
  R(ctx, x + 26, y + 6, 3, 24, P.ink);
}

function bottle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  R(ctx, x + 4, y, 10, 5, P.gold);
  R(ctx, x + 3, y + 5, 12, 7, '#c6d1c6');
  R(ctx, x, y + 12, 18, 27, color);
  R(ctx, x + 3, y + 14, 3, 22, '#d1e8e3');
  R(ctx, x + 5, y + 22, 10, 10, P.cream);
  R(ctx, x + 8, y + 24, 4, 5, P.navy);
}

function brandBook(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  R(ctx, x, y, w, h, P.ink);
  R(ctx, x + 2, y + 1, w - 3, h - 3, color);
  R(ctx, x + 3, y + 3, 2, h - 7, '#b1c6bf');
  R(ctx, x + 8, y + 8, w - 14, 3, P.gold);
  R(ctx, x + 8, y + 14, w - 17, 2, P.cream);
}

export default function drawBrand(ctx: CanvasRenderingContext2D, assets: InteriorDrawAssets = {}) {
  const roomContext = ctx;
  room(ctx, {
    wall: '#e8dfc8', wallShade: '#d2c4a4', trim: P.navy, trimHi: '#487491',
    floor: '#d5c6a4', floorShade: '#b3a185', wainscot: '#dfd1b1', style: 'tile',
  });

  // Sandstone panels: deliberately sparse joints, large quiet surfaces.
  R(ctx, 0, 29, 960, 4, '#cbbc99');
  R(ctx, 0, 33, 960, 2, '#f6ebd2');
  R(ctx, 0, 211, 960, 17, '#d0c19e');
  R(ctx, 0, 226, 960, 7, P.navy);
  R(ctx, 0, 226, 960, 2, '#35596c');
  for (const x of [325, 642, 929]) {
    R(ctx, x, 35, 13, 177, '#ddcfac');
    R(ctx, x + 2, 35, 3, 177, '#f2e7ca');
    R(ctx, x + 12, 35, 2, 177, '#bbaa83');
    R(ctx, x - 4, 35, 22, 6, '#c6b592');
    R(ctx, x - 4, 207, 22, 6, '#c6b592');
  }
  // Return door at the common left entrance, separated from the exhibits.
  R(ctx, 4, 61, 49, 184, '#aa9165');
  R(ctx, 7, 64, 43, 181, P.navy);
  R(ctx, 11, 68, 35, 177, '#244965');
  R(ctx, 15, 72, 27, 119, '#3f6173');
  R(ctx, 17, 75, 23, 2, '#73949d');
  R(ctx, 27, 75, 2, 114, P.navy);
  R(ctx, 15, 193, 27, 3, P.gold);
  R(ctx, 15, 204, 27, 31, '#163b54');
  R(ctx, 38, 184, 5, 3, P.gold);

  // Left exhibition: identity poster, companion sculpture and concept cards.
  poster(ctx, 67, 54, 113, 103, 'graphic', '#44648f');
  R(ctx, 83, 75, 80, 41, P.navy);
  poly(ctx, [[102, 95], [117, 82], [131, 95], [146, 82], [154, 113], [93, 113]], P.gold);
  R(ctx, 66, 159, 114, 10, P.cream);

  {
    const ctx = pixelGroup(roomContext, 195, 247, 0.82, 0.65, 260);
    // Wall cast shadows sit behind the glass and plinth; short floor shadows anchor both.
    R(ctx, 219, 113, 88, 89, '#b4a88d');
    R(ctx, 305, 119, 3, 80, '#c5b79c');
    ellipse(ctx, 259, 248, 54, 5, '#a18f70');
    ellipse(ctx, 119, 247, 38, 4, '#a18f70');
    // Glass sides are a few opaque highlight strokes, preserving crisp pixels.
    R(ctx, 212, 106, 88, 90, '#c7d6ce');
    R(ctx, 215, 108, 82, 87, '#d6dfd1');
    R(ctx, 218, 110, 2, 71, '#f5f6e2');
    R(ctx, 286, 110, 2, 71, '#eaf2e0');
    R(ctx, 218, 193, 75, 3, '#92a7a7');
    mascot(ctx, 237, 132);
    R(ctx, 205, 196, 102, 6, P.navy);
    R(ctx, 209, 202, 94, 43, '#c2af88');
    R(ctx, 214, 206, 84, 35, '#dbc8a0');
    R(ctx, 215, 207, 3, 33, '#f1dfb8');
    R(ctx, 294, 204, 8, 39, '#9a8462');
    R(ctx, 210, 203, 84, 2, '#f8ebc9');
    R(ctx, 233, 216, 44, 12, P.cream);

    R(ctx, 85, 199, 63, 45, '#c4b18b');
    R(ctx, 81, 192, 70, 8, P.navy);
    R(ctx, 86, 194, 59, 2, '#4f6d7d');
    brandBook(ctx, 91, 163, 26, 31, P.blue);
    brandBook(ctx, 120, 170, 23, 23, P.creamShade);
    plant(ctx, 66, 244, 0.65, P.navy);
  }

  // A projected wall shadow gives the framed guide physical depth.
  R(ctx, 393, 59, 201, 104, '#ab9a7d');
  // Middle: the visitor guide is an angled museum table, not a wall of labels.
  frame(ctx, 386, 53, 201, 104, '#b99b63');
  R(ctx, 394, 61, 185, 88, P.navy);
  R(ctx, 404, 71, 165, 4, '#365d76');
  const chips = [P.cream, '#c3cfd0', '#426596', P.navy, P.gold];
  chips.forEach((color, i) => {
    R(ctx, 413 + i * 30, 102, 24, 21, color);
    R(ctx, 414 + i * 30, 103, 21, 2, i === 4 ? '#ffe19a' : '#e6e7d3');
  });

  {
    const ctx = pixelGroup(roomContext, 480, 246, 0.5, 0.5, 260);
    rug(ctx, 374, 229, 225, 20, '#baa889');
    ellipse(ctx, 486, 248, 91, 5, '#948368');
    R(ctx, 395, 207, 176, 39, P.navy);
    R(ctx, 405, 214, 155, 29, '#1a4861');
    R(ctx, 409, 217, 4, 25, '#386b81');
    R(ctx, 476, 219, 17, 5, P.gold);
    poly(ctx, [[394, 178], [565, 178], [590, 205], [372, 205]], '#142f43');
    poly(ctx, [[398, 180], [561, 180], [582, 199], [381, 199]], '#42648a');
    poly(ctx, [[405, 183], [553, 183], [568, 196], [393, 196]], P.creamShade);
    poly(ctx, [[410, 183], [458, 183], [452, 196], [398, 196]], '#87b6c2');
    poly(ctx, [[433, 184], [457, 184], [454, 191], [447, 191], [445, 195], [420, 195]], '#cab688');
    R(ctx, 443, 186, 7, 3, P.coral);
    L(ctx, 465, 185, 544, 185, '#8a8d7a');
    L(ctx, 469, 189, 551, 189, '#8a8d7a');
    L(ctx, 473, 193, 538, 193, '#8a8d7a');
    R(ctx, 388, 201, 190, 4, '#597687');

  }
  { const ctx = pixelGroup(roomContext, 635, 245, 0.65, 0.65, 260);
  // A simple bench bridges guide table and brand objects without blocking path.
  R(ctx, 601, 213, 64, 9, P.woodDark);
  R(ctx, 602, 213, 62, 3, P.woodHi);
  R(ctx, 607, 222, 6, 23, P.navy);
  R(ctx, 652, 222, 6, 23, P.navy);
  R(ctx, 609, 228, 45, 4, '#42647a');

}
  // Right: the display projects away from the wall, with a dark reveal on its right.
  R(ctx, 702, 73, 191, 177, '#ad9d82');
  R(ctx, 890, 80, 5, 160, '#c2b294');
  ellipse(ctx, 794, 250, 101, 5, '#a18f70');
  // Right: curated cabinet with packages, small bottles and a printed brandbook.
  R(ctx, 695, 66, 191, 179, P.ink);
  R(ctx, 699, 70, 183, 171, P.navy);
  R(ctx, 706, 76, 169, 151, '#a8b9b2');
  R(ctx, 710, 80, 161, 143, '#d1dbc9');
  R(ctx, 712, 80, 3, 138, '#e6edda');
  R(ctx, 866, 80, 5, 143, '#92a296');
  R(ctx, 710, 80, 156, 4, '#9eaea3');
  R(ctx, 780, 76, 8, 151, P.navy);
  R(ctx, 707, 139, 167, 6, P.navy);
  R(ctx, 707, 139, 167, 2, '#49718a');
  R(ctx, 707, 198, 167, 6, P.navy);
  R(ctx, 707, 198, 167, 2, '#49718a');
  R(ctx, 735, 108, 29, 30, '#afbbad');
  R(ctx, 808, 107, 29, 30, '#afbbad');
  ellipse(ctx, 746, 137, 17, 2, '#879a93');
  ellipse(ctx, 819, 137, 17, 2, '#879a93');
  bag(ctx, 730, 103, P.blue);
  bag(ctx, 803, 102, '#436894');
  R(ctx, 733, 169, 18, 28, '#aeb9ab');
  R(ctx, 760, 169, 18, 28, '#aeb9ab');
  ellipse(ctx, 738, 196, 12, 2, '#82978d');
  ellipse(ctx, 765, 196, 12, 2, '#82978d');
  bottle(ctx, 728, 156, '#40776b');
  bottle(ctx, 755, 156, '#679b81');
  brandBook(ctx, 802, 161, 25, 36, P.navy);
  brandBook(ctx, 834, 164, 25, 33, P.cream);
  R(ctx, 710, 232, 73, 5, '#31516c');
  R(ctx, 791, 232, 75, 5, '#31516c');
  R(ctx, 742, 233, 10, 3, P.gold);
  R(ctx, 820, 233, 10, 3, P.gold);
  R(ctx, 873, 106, 3, 10, P.gold);
  R(ctx, 873, 167, 3, 10, P.gold);
  R(ctx, 739, 49, 104, 11, P.cream);

  frame(ctx, 900, 83, 24, 54, '#b99759');
  R(ctx, 905, 88, 14, 44, P.navy);
  R(ctx, 908, 103, 8, 15, P.gold);
  plant(ctx, 920, 244, 0.8, '#b79c72');

  // Daylight, pinned colour studies and archive material keep the gallery personal.
  window(ctx, 607, 66, 66, 86, { trim: P.navy, trimHi: '#789398', time: assets.time });
  hangingPlant(ctx, 679, 35, 25, '#a78b5f');
  pinnedNote(ctx, 347, 65, 26, 31, '#efe8d0');
  pinnedNote(ctx, 349, 112, 24, 31, '#d2dfd1');
  R(ctx, 350, 125, 8, 8, P.blue);
  R(ctx, 359, 125, 8, 8, P.gold);
  lamp(ctx, 301, 31, P.navy);
  R(ctx, 420, 159, 134, 12, '#f6eedc');
  {
    const ctx = pixelGroup(roomContext, 635, 245, 0.65, 0.65, 260);
    paperStack(ctx, 611, 204, 36);
    R(ctx, 614, 199, 29, 7, P.blue);
    R(ctx, 619, 201, 19, 2, '#a3c5cc');
  }
    R(ctx, 318, 193, 11, 16, '#8c7860');
  R(ctx, 320, 184, 2, 12, P.navy);
  R(ctx, 325, 181, 2, 15, P.coral);
};
