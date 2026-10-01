import {
  R, L, poly, ellipse, room, window, vista, plant, lamp, cabinet, table, shelf, books, frame, hangingPlant, pinnedNote, paperStack, rug, P,
  pixelGroup,
} from './kit';
import type { InteriorDrawAssets } from './types';

const C = {
  wall: '#f4f5f1', wallShade: '#d8ded5', steel: '#182635', steelHi: '#557785',
  metal: '#9daeb0', metalHi: '#d3ded7', blue: '#0284c7', cyan: '#67bdd2',
  green: '#52a869', wood: '#b58b5f', woodHi: '#dbb782', darkWood: '#755d45',
};

/** Tools, tangible prototypes and a journal computer, on one continuous stage. */
export default function drawLab(ctx: CanvasRenderingContext2D, assets: InteriorDrawAssets = {}) {
  ctx.imageSmoothingEnabled = false;
  const roomContext = ctx;
  room(ctx, {
    wall: C.wall, wallShade: C.wallShade, trim: C.steel, trimHi: C.steelHi,
    wainscot: '#b8c6bc', floor: '#aeb9ac', floorShade: '#879890', style: 'tile',
  });
  // Warm concrete, steel transoms and service wiring echo the exterior workshop.
  R(ctx, 62, 35, 873, 5, '#bcc9bd');
  R(ctx, 64, 35, 870, 2, '#e5e8d9');
  for (const x of [62, 307, 647, 936]) {
    R(ctx, x, 40, 9, 202, '#d2d9cf');
    R(ctx, x + 1, 40, 2, 202, '#fafbf1');
    R(ctx, x + 7, 40, 2, 202, '#aab9ae');
    R(ctx, x - 3, 237, 15, 8, '#8faaa1');
  }
  R(ctx, 69, 218, 864, 3, '#ccd7cd');
  L(ctx, 64, 45, 919, 45, C.steel, 2);
  lamp(ctx, 203, 45, '#6b9486');
  lamp(ctx, 592, 45, C.blue);
  lamp(ctx, 878, 45, '#6b9486');
  entrance(ctx, assets.time);

  // FABRICATION / a tool board above a compact desktop 3D printer.
  toolBoard(ctx, 82, 78, 209, 64);
  {
    const ctx = pixelGroup(roomContext, 186, 247, 0.5, 0.5, 260);
    cabinet(ctx, 79, 209, 213, 38, '#648d87');
    R(ctx, 75, 202, 221, 9, C.darkWood);
    R(ctx, 76, 202, 219, 3, C.woodHi);
    printer(ctx, 140, 147);
    R(ctx, 92, 174, 25, 28, C.steel);
    R(ctx, 94, 176, 21, 2, C.metalHi);
    ellipse(ctx, 104, 185, 7, 7, C.metal);
    ellipse(ctx, 104, 185, 3, 3, C.steel);
    R(ctx, 94, 195, 20, 3, '#548276');
    R(ctx, 272, 179, 15, 22, '#c4aa74');
    R(ctx, 274, 170, 3, 13, C.steel);
    R(ctx, 281, 166, 3, 16, P.coral);
    R(ctx, 276, 184, 8, 3, P.cream);
    R(ctx, 90, 220, 59, 14, '#40645e');
    R(ctx, 225, 220, 48, 14, '#40645e');
  }
  plant(ctx, 300, 244, 0.62, '#a47c58');

  // JOURNAL / the monitor is the clear main interaction, directly above the desk.
  window(ctx, 368, 56, 209, 91, {
    trim: C.steel, trimHi: C.steelHi, time: assets.time,
  });
  R(ctx, 363, 145, 219, 5, C.wood);
  R(ctx, 365, 145, 215, 2, C.woodHi);
  plant(ctx, 388, 144, 0.5, '#b78353');
  R(ctx, 541, 137, 18, 8, P.cream);
  R(ctx, 544, 128, 12, 10, '#c8d5c3');
  R(ctx, 547, 127, 6, 6, '#86af7d');
  {
    const ctx = pixelGroup(roomContext, 480, 247, 0.5, 0.5, 260);
    table(ctx, 344, 206, 282, 41, C.wood);
    R(ctx, 345, 206, 280, 2, C.woodHi);
    R(ctx, 357, 216, 52, 27, '#79948b');
    R(ctx, 359, 218, 48, 11, '#afc1b1');
    R(ctx, 359, 231, 48, 10, '#8aa798');
    R(ctx, 377, 222, 12, 2, C.steel);
    R(ctx, 377, 235, 12, 2, C.steel);
    journalComputer(ctx, 439, 151);
    paperStack(ctx, 369, 194, 44);
    R(ctx, 372, 187, 36, 8, '#587f76');
    R(ctx, 378, 189, 24, 2, '#d2dac3');
    R(ctx, 558, 194, 15, 12, P.creamShade);
    R(ctx, 559, 193, 13, 3, '#fcf6df');
    R(ctx, 570, 196, 6, 7, '#d5c4a6');
    R(ctx, 573, 198, 2, 3, C.wall);
    R(ctx, 586, 199, 19, 5, '#577d74');
    R(ctx, 589, 197, 13, 3, '#8baa97');
    R(ctx, 591, 198, 3, 2, P.gold);
    // Cables are kept under the table, out of the foreground walk strip.
    L(ctx, 477, 211, 477, 232, C.steel, 2);
    L(ctx, 477, 232, 519, 232, C.steel, 2);
    L(ctx, 519, 232, 519, 239, C.steel, 2);
    R(ctx, 514, 237, 15, 5, '#859b91');
    rug(ctx, 423, 245, 132, 12, '#829e91');
    R(ctx, 565, 222, 43, 25, C.steel);
    R(ctx, 567, 224, 39, 19, '#688d87');
    R(ctx, 572, 228, 28, 2, '#a4c4ad');

  }
    pinnedNote(ctx, 331, 111, 26, 32, '#f1d78e');
  pinnedNote(ctx, 603, 120, 26, 31, '#d5e6d5');
  R(ctx, 609, 132, 14, 6, C.blue);

  // MECHANICS / a friendly original robot, assembly drawings and spare components.
  frame(ctx, 676, 58, 151, 74, C.darkWood);
  R(ctx, 681, 63, 141, 64, '#426779');
  robotDiagram(ctx, 704, 67);
  shelf(ctx, 838, 87, 85, 39);
  books(ctx, 844, 92, 27, 26, 15);
  R(ctx, 879, 102, 32, 18, '#78948c');
  R(ctx, 881, 104, 28, 2, '#c4d5bb');
  R(ctx, 890, 110, 11, 4, P.creamShade);
  hangingPlant(ctx, 649, 41, 30, '#bb8c5c');
  {
    const ctx = pixelGroup(roomContext, 735, 246, 0.45, 0.45, 260);
    robot(ctx, 689, 145);
  }
  // A low cart with a tangible looping installation, rather than a wallpaper icon.
  {
    const ctx = pixelGroup(roomContext, 875, 247, 0.5, 0.5, 260);
    cabinet(ctx, 824, 212, 103, 35, '#647f83');
    R(ctx, 821, 207, 109, 8, C.steel);
    R(ctx, 823, 207, 105, 2, C.metalHi);
    kineticRig(ctx, 846, 156);
    R(ctx, 833, 229, 83, 12, '#3b5e65');
  }
  plant(ctx, 937, 244, 0.72, C.blue);
  R(ctx, 791, 238, 29, 8, '#b0966c');
  R(ctx, 793, 238, 25, 2, '#e1c391');
  R(ctx, 799, 235, 14, 3, C.metal);
  L(ctx, 64, 270, 927, 270, '#c9d4bb');
}

function entrance(ctx: CanvasRenderingContext2D, time: number = 0) {
  R(ctx, 6, 66, 47, 179, C.steel);
  R(ctx, 9, 69, 41, 176, '#557d87');
  R(ctx, 12, 72, 35, 171, '#284d61');
  vista(ctx, 16, 79, 27, 65, time);
  R(ctx, 28, 79, 2, 65, C.steel);
  R(ctx, 16, 108, 27, 2, C.steel);
  R(ctx, 14, 156, 31, 78, '#345f72');
  R(ctx, 16, 160, 27, 2, '#799ea0');
  R(ctx, 39, 150, 4, 10, P.gold);
  R(ctx, 5, 64, 49, 4, C.metalHi);
}

function toolBoard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  R(ctx, x, y, w, h, C.steel);
  R(ctx, x + 3, y + 3, w - 6, h - 6, '#b5a078');
  R(ctx, x + 5, y + 5, w - 10, 2, '#d2bd8c');
  for (let xx = x + 10; xx < x + w - 7; xx += 16) {
    R(ctx, xx, y + 13, 2, 2, '#8d785d');
    R(ctx, xx, y + 41, 2, 2, '#8d785d');
  }
  // Large individual silhouettes: spanner, pliers, screwdriver and hammer.
  const a = x + 21;
  R(ctx, a, y + 13, 5, 32, C.metalHi);
  R(ctx, a - 3, y + 11, 3, 11, C.metalHi);
  R(ctx, a + 5, y + 11, 3, 11, C.metalHi);
  R(ctx, a - 2, y + 44, 9, 5, C.metal);
  L(ctx, x + 56, y + 17, x + 47, y + 42, C.steel, 3);
  L(ctx, x + 53, y + 17, x + 65, y + 43, C.steel, 3);
  L(ctx, x + 47, y + 42, x + 45, y + 51, P.coral, 4);
  L(ctx, x + 65, y + 43, x + 67, y + 51, P.coral, 4);
  R(ctx, x + 88, y + 11, 3, 23, C.metalHi);
  R(ctx, x + 85, y + 33, 9, 17, C.blue);
  R(ctx, x + 87, y + 35, 2, 11, C.cyan);
  R(ctx, x + 115, y + 18, 4, 31, C.darkWood);
  R(ctx, x + 104, y + 14, 27, 9, C.steel);
  R(ctx, x + 105, y + 14, 25, 3, C.metalHi);
  pinnedNote(ctx, x + 151, y + 10, 42, 41, '#e8e4c9');
  L(ctx, x + 159, y + 37, x + 165, y + 25, C.blue, 2);
  L(ctx, x + 165, y + 25, x + 181, y + 39, C.blue, 2);
}

function printer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  R(ctx, x, y, 125, 53, C.steel);
  R(ctx, x + 4, y + 4, 117, 45, '#56838b');
  R(ctx, x + 10, y + 9, 105, 34, '#bdd1bf');
  R(ctx, x + 11, y + 9, 3, 34, C.metalHi);
  R(ctx, x + 99, y + 9, 3, 34, C.metalHi);
  R(ctx, x + 15, y + 11, 85, 4, C.steel);
  R(ctx, x + 54, y + 11, 10, 9, C.blue);
  R(ctx, x + 57, y + 20, 4, 6, P.gold);
  R(ctx, x + 20, y + 36, 77, 5, C.steel);
  poly(ctx, [[x + 46, y + 27], [x + 60, y + 23], [x + 71, y + 29], [x + 71, y + 36], [x + 46, y + 36]], '#51a58c');
  R(ctx, x + 48, y + 29, 12, 6, '#88c6a1');
  R(ctx, x - 2, y + 49, 129, 7, C.steel);
  R(ctx, x + 4, y + 51, 30, 3, '#99c8bd');
  R(ctx, x + 92, y + 51, 15, 3, P.gold);
  ellipse(ctx, x + 94, y - 5, 14, 14, C.steel);
  ellipse(ctx, x + 94, y - 5, 11, 11, '#58a692');
  ellipse(ctx, x + 94, y - 5, 4, 4, C.metalHi);
  L(ctx, x + 84, y - 10, x + 57, y - 10, '#344f5c', 2);
  L(ctx, x + 57, y - 10, x + 57, y + 11, '#344f5c', 2);
}

function journalComputer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  R(ctx, x, y, 94, 41, C.steel);
  R(ctx, x + 3, y + 3, 88, 35, C.metal);
  R(ctx, x + 7, y + 6, 75, 27, '#153f54');
  R(ctx, x + 8, y + 7, 73, 4, '#3b7182');
  R(ctx, x + 13, y + 28, 26, 2, C.green);
  R(ctx, x + 44, y + 28, 27, 2, '#749f99');
  R(ctx, x + 86, y + 28, 3, 3, C.green);
  R(ctx, x + 38, y + 41, 15, 8, C.steel);
  R(ctx, x + 25, y + 48, 40, 3, C.metal);
  poly(ctx, [[x - 2, y + 48], [x + 75, y + 48], [x + 82, y + 54], [x - 7, y + 54]], C.steel);
  R(ctx, x, y + 50, 73, 2, C.metalHi);
  for (let i = 0; i < 12; i++) R(ctx, x + 2 + i * 6, y + 50, 2, 1, C.steelHi);
  ellipse(ctx, x + 102, y + 52, 6, 3, C.metalHi);
  L(ctx, x + 97, y + 51, x + 98, y + 41, C.steel);
}

function robotDiagram(ctx: CanvasRenderingContext2D, x: number, y: number) {
  L(ctx, x + 28, y + 2, x + 28, y + 40, '#91b4b5');
  R(ctx, x + 12, y + 7, 34, 14, '#bed7cf');
  R(ctx, x + 17, y + 10, 25, 8, '#426779');
  R(ctx, x + 17, y + 23, 25, 14, '#bed7cf');
  L(ctx, x + 17, y + 36, x + 10, y + 46, '#bed7cf', 2);
  L(ctx, x + 39, y + 36, x + 47, y + 46, '#bed7cf', 2);
  L(ctx, x + 12, y + 25, x + 4, y + 33, '#bed7cf', 2);
  L(ctx, x + 46, y + 25, x + 54, y + 33, '#bed7cf', 2);
  L(ctx, x + 61, y + 10, x + 99, y + 10, '#92b9b6');
  L(ctx, x + 65, y + 18, x + 96, y + 18, '#92b9b6');
  L(ctx, x + 61, y + 27, x + 99, y + 27, '#92b9b6');
  R(ctx, x + 64, y + 32, 10, 8, C.cyan);
  R(ctx, x + 79, y + 32, 10, 8, P.gold);
  R(ctx, x + 94, y + 32, 7, 8, C.green);
}

function robot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ellipse(ctx, x + 46, 246, 58, 3, '#81958b');
  R(ctx, x + 42, y - 15, 3, 17, C.steel);
  R(ctx, x + 39, y - 17, 9, 5, P.gold);
  R(ctx, x + 13, y, 64, 29, C.steel);
  R(ctx, x + 16, y + 3, 58, 23, C.metal);
  R(ctx, x + 17, y + 3, 55, 3, C.metalHi);
  R(ctx, x + 22, y + 9, 46, 11, '#2a596b');
  R(ctx, x + 29, y + 11, 10, 5, C.cyan);
  R(ctx, x + 51, y + 11, 10, 5, C.cyan);
  R(ctx, x + 36, y + 28, 19, 8, C.steel);
  R(ctx, x + 17, y + 34, 58, 40, C.steel);
  R(ctx, x + 20, y + 36, 52, 34, '#88a9a2');
  R(ctx, x + 23, y + 38, 45, 4, '#b9cec0');
  R(ctx, x + 33, y + 49, 28, 15, C.blue);
  R(ctx, x + 36, y + 52, 21, 2, C.cyan);
  R(ctx, x + 36, y + 57, 11, 3, P.gold);
  R(ctx, x + 53, y + 58, 4, 4, C.green);
  ellipse(ctx, x + 14, y + 43, 8, 8, C.steel);
  ellipse(ctx, x + 76, y + 43, 8, 8, C.steel);
  L(ctx, x + 10, y + 47, x, y + 66, C.metal, 9);
  L(ctx, x + 79, y + 47, x + 90, y + 58, C.metal, 9);
  L(ctx, x + 90, y + 58, x + 98, y + 52, C.metalHi, 6);
  R(ctx, x - 7, y + 66, 14, 12, C.steel);
  R(ctx, x - 5, y + 67, 10, 7, C.metalHi);
  R(ctx, x + 95, y + 43, 10, 12, C.steel);
  R(ctx, x + 97, y + 44, 3, 7, C.metalHi);
  R(ctx, x + 104, y + 44, 3, 8, C.metalHi);
  R(ctx, x + 26, y + 73, 14, 22, C.steel);
  R(ctx, x + 53, y + 73, 14, 22, C.steel);
  R(ctx, x + 28, y + 75, 10, 17, C.metal);
  R(ctx, x + 55, y + 75, 10, 17, C.metal);
  R(ctx, x + 21, y + 92, 22, 9, C.steel);
  R(ctx, x + 51, y + 92, 22, 9, C.steel);
  R(ctx, x + 23, y + 92, 18, 3, C.blue);
  R(ctx, x + 53, y + 92, 18, 3, C.blue);
}

function kineticRig(ctx: CanvasRenderingContext2D, x: number, y: number) {
  R(ctx, x + 3, y + 45, 61, 6, C.steel);
  R(ctx, x + 7, y + 45, 53, 2, C.metalHi);
  R(ctx, x + 12, y + 3, 4, 42, C.metal);
  R(ctx, x + 51, y + 3, 4, 42, C.metal);
  R(ctx, x + 12, y + 2, 43, 5, C.steel);
  R(ctx, x + 12, y + 2, 43, 2, C.metalHi);
  for (let i = 0; i < 4; i++) {
    const xx = x + 20 + i * 9;
    L(ctx, xx, y + 6, xx, y + 29, C.steel);
    ellipse(ctx, xx, y + 31, 5, 5, i === 3 ? P.gold : C.blue);
    R(ctx, xx - 2, y + 28, 3, 2, i === 3 ? P.cream : C.cyan);
  }
}
