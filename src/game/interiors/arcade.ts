/** A collected, frequently played arcade, drawn at 960 × 320 logical pixels. */
import {
  R, L, poly, ellipse, text, room, plant, poster, shelf,
  cabinet, frame, hangingPlant, pinnedNote, stringLights, wallClock, P,
  pixelGroup,
} from './kit';
import type { InteriorDrawAssets } from './types';

interface ArcadePalette {
  body: string; shade: string; light: string; edge: string;
  accent: string; screen: 'journey' | 'making';
}

// Front-facing cabinets and an open foreground keep this a playable arcade.
export default function drawArcade(ctx: CanvasRenderingContext2D, assets: InteriorDrawAssets = {}) {
  const roomContext = ctx;
  room(ctx, {
    wall: '#e9e0c9', wallShade: '#d4c4a9', trim: '#194d85',
    trimHi: P.blueHi, floor: '#76929b', floorShade: '#506b7b',
    wainscot: '#245b91', style: 'tile',
  });

  // Blue arcade fascia with coral inserts, echoing the exterior shopfront.
  R(ctx, 29, 32, 900, 12, '#184975');
  R(ctx, 32, 34, 894, 3, '#439ace');
  R(ctx, 36, 43, 886, 4, '#bc4030');
  R(ctx, 36, 44, 886, 1, '#ee8150');
  for (const x of [34, 155, 705, 917]) {
    R(ctx, x, 48, 10, 197, '#bea884');
    R(ctx, x + 1, 48, 2, 195, '#f2dfb6');
    R(ctx, x + 7, 48, 3, 196, '#a08461');
    R(ctx, x - 3, 47, 16, 5, '#e7c799');
    R(ctx, x - 2, 239, 14, 7, '#1a4270');
  }
  returnDoor(ctx);

  // A framed adventure poster and a little glass collectible cabinet.
  gamePoster(ctx, 68, 75, 74, 95, 'adventure');
  collectionCabinet(ctx, 67, 190, 77, 57);
  plant(ctx, 150, 248, 0.65, '#d27142');

  // Four cabinets retain their tall silhouettes at a common, smaller scale.
  compactCabinet(pixelGroup(ctx, 246, 247, 0.58, 0.58, 260), 210, 113, 'GAME', 'JOURNEY', {
    body: '#245c9c', shade: '#173b68', light: '#4d9ada', edge: '#b3dfea',
    accent: '#f3c653', screen: 'journey',
  });
  compactCabinet(pixelGroup(ctx, 410, 247, 0.58, 0.58, 260), 374, 113, 'GAME', 'MAKING', {
    body: '#c1402d', shade: '#7c302e', light: '#eb6b3e', edge: '#ffd69b',
    accent: '#4eabd7', screen: 'making',
  });

  // A low memorabilia shelf above the two smaller classic machines.
  shelf(ctx, 514, 63, 175, 24);
  toyRobot(ctx, 530, 60, '#e89c42');
  toyCreature(ctx, 563, 64, '#6ca967');
  trophy(ctx, 600, 65);
  handheld(ctx, 641, 72, '#bd4036');
  R(ctx, 667, 60, 12, 18, '#1b5676');
  R(ctx, 669, 62, 3, 13, '#8bd2d9');
  smallCabinet(pixelGroup(ctx, 559, 247, 0.58, 0.58, 260), 523, 113, 72, 134, '#227a82', '#173f51', 'PIXEL RUN', 'runner');
  smallCabinet(pixelGroup(ctx, 653, 247, 0.58, 0.58, 260), 617, 113, 72, 134, '#e8af45', '#926531', 'SPACE 88', 'space');

  // Console nook: a CRT on a stand at left, a side-facing red sofa at right.
  // Its screen and controllers make the corner legible even at game scale.
  gamePoster(ctx, 829, 67, 66, 88, 'racing');
  shelf(ctx, 737, 75, 70, 13);
  R(ctx, 744, 55, 10, 21, '#ca7e40');
  R(ctx, 746, 58, 2, 13, '#ffe0a0');
  R(ctx, 757, 59, 13, 17, '#aeb66b');
  R(ctx, 759, 61, 3, 12, '#e2d8a5');
  R(ctx, 774, 55, 12, 21, '#2a6086');
  R(ctx, 776, 57, 3, 16, '#77b6cc');
  R(ctx, 790, 58, 10, 18, '#b85342');
  R(ctx, 791, 62, 2, 11, '#ffc281');
  {
    const ctx = pixelGroup(roomContext, 824, 248, 0.55, 0.55, 260);
    crt(ctx, 733, 134, 75, 58);
    cabinet(ctx, 724, 201, 91, 47, '#9f744e');
    R(ctx, 721, 196, 97, 7, P.navy);
    R(ctx, 724, 196, 91, 2, '#6391a0');
    // Original 16-bit console with cartridge and two wired controllers.
    R(ctx, 736, 191, 45, 7, '#bac0ad');
    R(ctx, 739, 190, 40, 3, '#e0dfc6');
    R(ctx, 748, 187, 17, 4, '#526a70');
    R(ctx, 751, 186, 11, 3, '#becbbb');
    R(ctx, 771, 193, 3, 2, '#e45037');
    L(ctx, 743, 198, 738, 223, '#193847', 1);
    L(ctx, 770, 198, 791, 224, '#193847', 1);
    controller(ctx, 728, 222, '#b6c5b9');
    controller(ctx, 783, 223, '#b6c5b9');
    R(ctx, 738, 235, 15, 6, '#476279');
    R(ctx, 756, 234, 17, 7, '#c55a3a');
    R(ctx, 776, 235, 16, 6, '#d4b76d');
    sofa(ctx, 825, 204, 100, 44);
    R(ctx, 863, 226, 17, 8, '#e8d8ab');
    R(ctx, 865, 226, 13, 2, '#fff0c6');
    R(ctx, 866, 230, 11, 2, '#637c88');
    plant(ctx, 911, 247, 0.73, P.navy);
  }

  // A few big wall motifs instead of a noisy texture field.
  frame(ctx, 733, 95, 72, 26, '#94734e');
  R(ctx, 737, 99, 64, 18, '#ecdfb7');
  pixelStar(ctx, 741, 109, '#d9a84a');
  stringLights(ctx, 558, 31, 133, '#f3c653');
  hangingPlant(ctx, 713, 40, 27, '#c47443');
  wallClock(ctx, 166, 65, 12);
  pinnedNote(ctx, 490, 122, 23, 30, '#f3d88c');
  pinnedNote(ctx, 492, 171, 20, 26, '#d6e0ce');
  R(ctx, 495, 180, 13, 2, P.blue);
  R(ctx, 496, 184, 9, 2, P.coral);
  {
    const ctx = pixelGroup(roomContext, 824, 248, 0.55, 0.55, 260);
    // Spare cartridges and a snack bowl stay tucked in the sofa nook.
    R(ctx, 835, 233, 18, 7, P.navy);
    R(ctx, 837, 231, 15, 4, '#a6b5aa');
    R(ctx, 840, 232, 9, 2, P.coral);
    ellipse(ctx, 891, 236, 10, 3, '#d5b47e');
    R(ctx, 884, 235, 14, 5, '#9f6749');
    R(ctx, 886, 233, 4, 3, P.gold);
    R(ctx, 892, 234, 4, 2, P.creamShade);
  }
    R(ctx, 6, 50, 45, 9, '#2a695e');
  // The foreground strip is uninterrupted for the player's feet.
  R(ctx, 41, 257, 878, 2, '#345d76');
  R(ctx, 43, 259, 874, 1, '#98b8b8');
};

function returnDoor(ctx: CanvasRenderingContext2D) {
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
}

/** Remap only integer pixel rectangles, preserving crisp edges at the smaller size. */
function compactCabinet(ctx: CanvasRenderingContext2D, x: number, y: number, line1: string, line2: string, palette: ArcadePalette) {
  const sx = 72 / 130, sy = 134 / 169;
  ellipse(ctx, x + 40, y + 137, 40, 4, '#506b76');
  const scaled = {
    get fillStyle() { return ctx.fillStyle; },
    set fillStyle(value: string | CanvasGradient | CanvasPattern) { ctx.fillStyle = value; },
    fillRect(px: number, py: number, width: number, height: number) {
      const left = Math.round(px * sx), top = Math.round(py * sy);
      ctx.fillRect(x + left, y + top, Math.round((px + width) * sx) - left, Math.round((py + height) * sy) - top);
    },
  } as CanvasRenderingContext2D;
  mainCabinet(scaled, 0, 0, 130, 169, line1, line2, palette);
}

function mainCabinet(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, line1: string, line2: string, c: ArcadePalette) {
  const base = y + h;
  // Black silhouette with stepped profile; shaded sides suggest cabinet depth.
  poly(ctx, [[x + 9, y], [x + w - 9, y], [x + w - 3, y + 10], [x + w - 10, y + 75], [x + w, y + 96], [x + w - 9, base], [x + 7, base], [x, y + 96], [x + 8, y + 75], [x + 3, y + 9]], P.ink);
  poly(ctx, [[x + 11, y + 3], [x + w - 11, y + 3], [x + w - 6, y + 11], [x + w - 13, y + 76], [x + w - 4, y + 96], [x + w - 12, base - 4], [x + 11, base - 4], [x + 4, y + 96], [x + 11, y + 75], [x + 7, y + 11]], c.body);
  R(ctx, x + w - 22, y + 10, 10, h - 16, c.shade);
  R(ctx, x + 11, y + 10, 5, h - 17, c.light);
  R(ctx, x + 18, y + 6, w - 38, 30, '#132d43');
  R(ctx, x + 20, y + 8, w - 42, 26, c.accent);
  R(ctx, x + 22, y + 10, w - 46, 22, '#204f71');
  R(ctx, x + 18, y + 40, w - 36, 57, '#162d35');
  R(ctx, x + 20, y + 42, w - 40, 52, '#435b65');
  R(ctx, x + 24, y + 46, w - 48, 43, '#132d3b');
  if (c.screen === 'journey') journeyScreen(ctx, x + 27, y + 49, w - 54, 37);
  else makingScreen(ctx, x + 27, y + 49, w - 54, 37);
  R(ctx, x + 29, y + 91, w - 61, 2, c.edge);
  // The control deck projects forward and remains unmistakably a game machine.
  poly(ctx, [[x + 8, y + 98], [x + w - 13, y + 98], [x + w - 2, y + 111], [x + 3, y + 111]], c.light);
  L(ctx, x + 10, y + 99, x + w - 15, y + 99, c.edge, 2);
  R(ctx, x + 29, y + 101, 4, 7, '#24465e');
  ellipse(ctx, x + 31, y + 101, 5, 3, '#e1573b');
  R(ctx, x + 83, y + 101, 5, 6, '#253d46');
  ellipse(ctx, x + 85, y + 101, 5, 3, '#e1573b');
  for (const [dx, dy, color] of [[45, 105, '#f3c653'], [55, 103, '#e7533a'], [98, 105, '#f3c653'], [108, 103, '#e7533a']] as const) {
    ellipse(ctx, x + dx, y + dy, 3, 2, color);
    R(ctx, x + dx - 1, y + dy - 1, 2, 1, '#fff0bc');
  }
  R(ctx, x + 15, y + 115, w - 31, 42, c.body);
  R(ctx, x + 19, y + 118, w - 40, 2, c.light);
  R(ctx, x + w - 36, y + 123, 17, 25, '#132d3b');
  R(ctx, x + w - 33, y + 125, 11, 9, '#506570');
  R(ctx, x + w - 31, y + 127, 7, 2, '#b5c2bd');
  R(ctx, x + w - 33, y + 137, 11, 7, '#1d475b');
  R(ctx, x + w - 30, y + 139, 5, 2, '#d9b575');
  // Side art: a pixel controller and one bold stripe.
  L(ctx, x + 24, y + 132, x + 71, y + 151, c.accent, 4);
  controller(ctx, x + 31, y + 132, c.edge);
  R(ctx, x + 12, base - 8, w - 25, 5, c.shade);
  R(ctx, x + 15, base - 4, 11, 4, P.ink);
  R(ctx, x + w - 30, base - 4, 11, 4, P.ink);
}

function smallCabinet(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, shade: string, label: string, game: 'runner' | 'space') {
  poly(ctx, [[x + 5, y], [x + w - 6, y], [x + w - 2, y + 9], [x + w - 8, y + 71], [x + w, y + 88], [x + w - 5, y + h], [x + 4, y + h], [x, y + 88], [x + 7, y + 70], [x + 2, y + 8]], '#163445');
  poly(ctx, [[x + 7, y + 3], [x + w - 8, y + 3], [x + w - 5, y + 10], [x + w - 11, y + 73], [x + w - 4, y + 87], [x + w - 8, y + h - 4], [x + 8, y + h - 4], [x + 4, y + 87], [x + 10, y + 72], [x + 5, y + 10]], color);
  R(ctx, x + w - 17, y + 10, 7, h - 16, shade);
  R(ctx, x + 11, y + 7, w - 27, 14, '#173847');
  R(ctx, x + 12, y + 28, w - 28, 40, '#152c37');
  if (game === 'runner') runnerScreen(ctx, x + 16, y + 32, w - 36, 31);
  else spaceScreen(ctx, x + 16, y + 32, w - 36, 31);
  poly(ctx, [[x + 7, y + 74], [x + w - 10, y + 74], [x + w - 3, y + 85], [x + 4, y + 85]], shade);
  R(ctx, x + 11, y + 75, w - 25, 2, '#dbc88c');
  R(ctx, x + 21, y + 76, 3, 6, '#203e4b');
  ellipse(ctx, x + 22, y + 76, 4, 3, '#cc5133');
  ellipse(ctx, x + 41, y + 80, 3, 2, '#f3c653');
  ellipse(ctx, x + 51, y + 78, 3, 2, '#e86942');
  R(ctx, x + 13, y + 91, w - 30, 29, color);
  R(ctx, x + 16, y + 95, 14, 21, '#1b3b48');
  R(ctx, x + 19, y + 98, 8, 2, '#9faea0');
  R(ctx, x + 20, y + 107, 6, 4, '#bb6b3f');
  R(ctx, x + 33, y + 104, 17, 3, '#d1caa7');
  R(ctx, x + 37, y + 109, 13, 3, '#d1caa7');
  R(ctx, x + 9, y + h - 7, w - 19, 4, shade);
  R(ctx, x + 11, y + h - 3, 8, 3, P.ink);
  R(ctx, x + w - 22, y + h - 3, 8, 3, P.ink);
}

function journeyScreen(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  R(ctx, x, y, w, h, '#86c0d5');
  R(ctx, x, y, w, 8, '#193a52');
  poly(ctx, [[x, y + 24], [x + 15, y + 12], [x + 28, y + 23], [x + 39, y + 16], [x + 53, y + 27], [x + w, y + 20], [x + w, y + h], [x, y + h]], '#528d6b');
  R(ctx, x, y + 30, w, h - 30, '#2b6b52');
  R(ctx, x, y + 31, w, 2, '#b1c476');
  R(ctx, x + 7, y + 20, 4, 11, '#566849');
  R(ctx, x + 3, y + 15, 12, 9, '#2f724f');
  R(ctx, x + 6, y + 13, 6, 5, '#8caf67');
  R(ctx, x + 50, y + 23, 17, 7, '#d8c68b');
  R(ctx, x + 48, y + 21, 21, 3, '#a5663f');
  R(ctx, x + 56, y + 25, 4, 5, '#2d5a58');
  R(ctx, x + 29, y + 21, 4, 4, '#eccf9c');
  R(ctx, x + 27, y + 25, 7, 6, '#bb5641');
  R(ctx, x + 27, y + 31, 3, 3, '#153b51');
  R(ctx, x + 32, y + 31, 3, 3, '#153b51');
  R(ctx, x + 37, y + 22, 2, 7, '#e6d69f');
}

function makingScreen(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  R(ctx, x, y, w, h, '#173747');
  R(ctx, x, y, 12, h, '#3e6070');
  R(ctx, x + 1, y + 1, 10, 5, '#7fabaa');
  for (let i = 0; i < 4; i++) R(ctx, x + 3, y + 9 + i * 6, 6, 4, ['#efb552', '#6bb77b', '#e86b45', '#85b9d5'][i]);
  R(ctx, x + 14, y + 2, w - 16, 4, '#335969');
  for (let xx = 16; xx < w - 3; xx += 8) L(ctx, x + xx, y + 8, x + xx, y + h - 3, '#294b57');
  for (let yy = 8; yy < h - 3; yy += 8) L(ctx, x + 14, y + yy, x + w - 3, y + yy, '#294b57');
  R(ctx, x + 17, y + 28, 50, 5, '#b7a15e');
  R(ctx, x + 17, y + 28, 50, 2, '#78b776');
  R(ctx, x + 27, y + 19, 14, 4, '#c5a75d');
  R(ctx, x + 52, y + 13, 15, 4, '#c5a75d');
  R(ctx, x + 22, y + 23, 4, 5, '#dd694d');
  L(ctx, x + 44, y + 10, x + 44, y + 22, '#e9ded1');
  L(ctx, x + 39, y + 15, x + 49, y + 15, '#e9ded1');
  R(ctx, x + 61, y + 22, 4, 4, '#6badd2');
}

function runnerScreen(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  R(ctx, x, y, w, h, '#73b1c8');
  R(ctx, x, y + 22, w, h - 22, '#936d43');
  R(ctx, x, y + 21, w, 3, '#8ab76b');
  R(ctx, x + 6, y + 10, 12, 3, '#e5eccd');
  R(ctx, x + 26, y + 16, 9, 4, '#d4b45d');
  R(ctx, x + 11, y + 14, 4, 4, '#f4d7a3');
  R(ctx, x + 10, y + 18, 5, 5, '#d04c3b');
  R(ctx, x + 25, y + 10, 3, 3, '#f3ce62');
}

function spaceScreen(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  R(ctx, x, y, w, h, '#152844');
  for (const [xx, yy] of [[5, 4], [17, 7], [30, 3], [27, 22], [7, 19]]) R(ctx, x + xx, y + yy, 1, 1, '#eddfbc');
  for (const [xx, yy] of [[5, 10], [15, 10], [25, 10]]) {
    R(ctx, x + xx, y + yy, 6, 3, '#75b98a');
    R(ctx, x + xx - 1, y + yy + 2, 2, 3, '#75b98a');
    R(ctx, x + xx + 5, y + yy + 2, 2, 3, '#75b98a');
  }
  poly(ctx, [[x + 17, y + 22], [x + 12, y + 27], [x + 22, y + 27]], '#d9dad0');
  R(ctx, x + 17, y + 18, 1, 3, '#e8ac4f');
}

function gamePoster(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, theme: 'adventure' | 'racing') {
  frame(ctx, x, y, w, h, '#1a4975');
  R(ctx, x + 4, y + 4, w - 8, h - 8, theme === 'adventure' ? '#86bcca' : '#4f7587');
  if (theme === 'adventure') {
    ellipse(ctx, x + 49, y + 23, 10, 10, '#f5d38c');
    poly(ctx, [[x + 4, y + 62], [x + 22, y + 30], [x + 39, y + 62], [x + 57, y + 40], [x + w - 4, y + 59], [x + w - 4, y + h - 4], [x + 4, y + h - 4]], '#3d705f');
    poly(ctx, [[x + 6, y + 76], [x + 36, y + 65], [x + w - 4, y + 75], [x + w - 4, y + h - 4], [x + 6, y + h - 4]], '#a3af6c');
    R(ctx, x + 30, y + 55, 10, 12, '#f1ca9a');
    R(ctx, x + 27, y + 65, 15, 18, '#cf5c3c');
    R(ctx, x + 24, y + 54, 19, 5, '#4c694e');
    R(ctx, x + 40, y + 66, 3, 14, '#ead6a3');
    R(ctx, x + 46, y + 57, 3, 21, '#dae3cd');
    R(ctx, x + 5, y + 7, w - 10, 11, '#204e6c');
    text(ctx, 'ADVENTURE', x + w / 2, y + 9, 7, '#ffefc1', 'center');
  } else {
    R(ctx, x + 5, y + 7, w - 10, 11, '#193f5c');
    text(ctx, 'RACE CLUB', x + w / 2, y + 9, 7, '#f9e6b3', 'center');
    poly(ctx, [[x + 8, y + h - 7], [x + 30, y + 33], [x + 45, y + 33], [x + w - 7, y + h - 7]], '#293e4f');
    L(ctx, x + 34, y + 39, x + 24, y + h - 7, '#e4c885', 2);
    L(ctx, x + 39, y + 39, x + 47, y + h - 7, '#e4c885', 2);
    R(ctx, x + 27, y + 51, 18, 19, '#c64e37');
    R(ctx, x + 30, y + 48, 12, 6, '#da7b46');
    R(ctx, x + 30, y + 54, 12, 7, '#77b6c7');
    R(ctx, x + 24, y + 54, 4, 14, '#182e3c');
    R(ctx, x + 44, y + 54, 4, 14, '#182e3c');
    R(ctx, x + 29, y + 67, 4, 2, '#f4d68a');
    R(ctx, x + 39, y + 67, 4, 2, '#f4d68a');
  }
}

function collectionCabinet(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  R(ctx, x, y, w, h, '#173b58');
  R(ctx, x + 3, y + 3, w - 6, h - 6, '#8ab1b5');
  R(ctx, x + 6, y + 5, w - 12, h - 13, '#aac5bc');
  R(ctx, x + 3, y + 25, w - 6, 3, '#c6b48b');
  R(ctx, x + 3, y + h - 10, w - 6, 5, '#c5a275');
  R(ctx, x + 35, y + 3, 3, h - 12, '#e6ddba');
  trophy(ctx, x + 13, y + 20);
  toyCreature(ctx, x + 51, y + 20, '#b46347');
  handheld(ctx, x + 10, y + 34, '#cf6343');
  R(ctx, x + 46, y + 34, 17, 12, '#3d6882');
  R(ctx, x + 48, y + 36, 13, 6, '#c1ceb6');
  R(ctx, x + 3, y + 4, 2, h - 16, '#e4edcc');
}

function toyRobot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  R(ctx, x + 3, y - 7, 13, 9, '#243f4b');
  R(ctx, x + 5, y - 6, 9, 7, color);
  R(ctx, x + 6, y - 3, 2, 2, '#efe3b5');
  R(ctx, x + 11, y - 3, 2, 2, '#efe3b5');
  R(ctx, x + 4, y + 3, 12, 12, color);
  R(ctx, x + 7, y + 5, 6, 5, '#3f7686');
  R(ctx, x, y + 4, 4, 9, '#8c6f47');
  R(ctx, x + 16, y + 4, 4, 9, '#8c6f47');
  R(ctx, x + 4, y + 15, 4, 5, '#294859');
  R(ctx, x + 12, y + 15, 4, 5, '#294859');
}

function toyCreature(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  R(ctx, x + 3, y - 5, 13, 14, color);
  R(ctx, x + 5, y - 9, 4, 5, color);
  R(ctx, x + 12, y - 9, 4, 5, color);
  R(ctx, x + 6, y - 2, 2, 3, '#ecddab');
  R(ctx, x + 12, y - 2, 2, 3, '#ecddab');
  R(ctx, x + 7, y + 3, 6, 4, '#f3d6a0');
  R(ctx, x, y + 5, 5, 7, '#375d4a');
  R(ctx, x + 15, y + 5, 5, 7, '#375d4a');
  R(ctx, x + 3, y + 12, 5, 3, '#29444c');
  R(ctx, x + 12, y + 12, 5, 3, '#29444c');
}

function trophy(ctx: CanvasRenderingContext2D, x: number, y: number) {
  R(ctx, x + 4, y - 13, 14, 12, '#c38b3c');
  R(ctx, x + 6, y - 13, 10, 9, '#edc46b');
  R(ctx, x + 5, y - 12, 2, 6, '#ffe8a0');
  L(ctx, x + 1, y - 11, x + 1, y - 5, '#d2a64e', 2);
  L(ctx, x + 20, y - 11, x + 20, y - 5, '#d2a64e', 2);
  L(ctx, x + 1, y - 5, x + 5, y - 3, '#d2a64e', 2);
  L(ctx, x + 20, y - 5, x + 16, y - 3, '#d2a64e', 2);
  R(ctx, x + 9, y - 1, 5, 5, '#e2b154');
  R(ctx, x + 4, y + 4, 16, 4, '#674b37');
  R(ctx, x + 7, y + 5, 10, 2, '#e6c888');
}

function handheld(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  R(ctx, x, y, 24, 14, '#273e49');
  R(ctx, x + 1, y + 1, 22, 12, color);
  R(ctx, x + 7, y + 3, 10, 8, '#244858');
  R(ctx, x + 8, y + 4, 8, 6, '#a5bc95');
  R(ctx, x + 3, y + 6, 1, 5, '#f2d7ab');
  R(ctx, x + 2, y + 8, 3, 1, '#f2d7ab');
  R(ctx, x + 19, y + 6, 2, 2, '#f2d7ab');
  R(ctx, x + 21, y + 9, 1, 1, '#f2d7ab');
}

function controller(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  poly(ctx, [[x + 3, y], [x + 18, y], [x + 23, y + 4], [x + 21, y + 9], [x + 16, y + 8], [x + 13, y + 5], [x + 8, y + 5], [x + 5, y + 8], [x, y + 9], [x - 2, y + 5]], '#223e4b');
  poly(ctx, [[x + 3, y + 1], [x + 17, y + 1], [x + 21, y + 4], [x + 20, y + 7], [x + 15, y + 6], [x + 12, y + 4], [x + 8, y + 4], [x + 4, y + 7], [x + 1, y + 7], [x, y + 4]], color);
  R(ctx, x + 4, y + 2, 2, 4, '#2d4e5a');
  R(ctx, x + 3, y + 3, 4, 2, '#2d4e5a');
  R(ctx, x + 15, y + 3, 2, 2, '#b95b3d');
  R(ctx, x + 18, y + 2, 2, 2, '#b95b3d');
}

function crt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  R(ctx, x, y, w, h - 4, '#273f4c');
  R(ctx, x + 3, y + 3, w - 6, h - 10, '#637b7d');
  R(ctx, x + 5, y + 5, w - 20, h - 16, '#153944');
  R(ctx, x + 8, y + 8, w - 26, h - 22, '#76b6c2');
  R(ctx, x + 8, y + 32, w - 26, 8, '#567957');
  R(ctx, x + 8, y + 40, w - 26, 4, '#b9a071');
  R(ctx, x + 16, y + 24, 5, 5, '#e5c79b');
  R(ctx, x + 15, y + 29, 7, 10, '#be5e43');
  R(ctx, x + 43, y + 21, 6, 6, '#efd591');
  R(ctx, x + 41, y + 27, 9, 12, '#397b8f');
  R(ctx, x + 11, y + 11, 17, 3, '#cb5b45');
  R(ctx, x + 38, y + 11, 17, 3, '#e4bd65');
  for (let yy = 10; yy < 30; yy += 4) R(ctx, x + w - 10, y + yy, 5, 2, '#283e4a');
  R(ctx, x + w - 9, y + 35, 3, 3, '#e3a95d');
  R(ctx, x + 12, y + h - 4, w - 24, 4, '#203c4e');
  R(ctx, x + 16, y + h, w - 32, 3, '#546d71');
}

function sofa(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  R(ctx, x + 8, y + 3, w - 11, h - 9, '#7e302e');
  R(ctx, x + 10, y + 5, w - 15, h - 13, '#bb5140');
  R(ctx, x + 12, y + 6, w - 19, 3, '#e3794f');
  R(ctx, x + 16, y + 10, 28, 20, '#d16746');
  R(ctx, x + 48, y + 10, 27, 20, '#cd6343');
  R(ctx, x + 18, y + 12, 23, 2, '#eda071');
  R(ctx, x + 50, y + 12, 22, 2, '#eda071');
  R(ctx, x + 16, y + 28, w - 36, 8, '#da7951');
  R(ctx, x + 16, y + 29, w - 37, 2, '#edaa70');
  R(ctx, x + 1, y + 20, 15, 17, '#76322e');
  R(ctx, x + 3, y + 21, 11, 12, '#b9573e');
  R(ctx, x + 4, y + 21, 9, 2, '#e6975e');
  R(ctx, x + w - 20, y + 18, 17, 21, '#76322e');
  R(ctx, x + w - 18, y + 19, 13, 16, '#b9573e');
  R(ctx, x + w - 17, y + 19, 11, 2, '#e6975e');
  R(ctx, x + 5, y + h - 6, w - 11, 3, '#7a4b36');
  R(ctx, x + 8, y + h - 3, 5, 3, '#2c3f45');
  R(ctx, x + w - 15, y + h - 3, 5, 3, '#2c3f45');
}

function pixelStar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  R(ctx, x + 2, y - 5, 2, 3, color);
  R(ctx, x - 2, y - 2, 10, 2, color);
  R(ctx, x, y, 6, 3, color);
  R(ctx, x - 1, y + 3, 3, 2, color);
  R(ctx, x + 4, y + 3, 3, 2, color);
}
