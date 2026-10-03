import { COASTAL_PALETTE as coast } from '../game/world/coastalPalette';
import { drawJourneyTexture as sprite } from './journeyTextures';

// Same 640 × 360 pixels, coastal colours and sprite atlas as the playable world.
const rect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
const polygon = (c: CanvasRenderingContext2D, points: number[][], color: string) => {
  // Integer scanlines preserve the game's pixel edges at any display scale.
  c.fillStyle = color;
  const lo = Math.ceil(Math.min(...points.map(p => p[1]))), hi = Math.floor(Math.max(...points.map(p => p[1])));
  for (let y = lo; y <= hi; y++) {
    const xs: number[] = [];
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[j], b = points[i];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) c.fillRect(Math.ceil(xs[i]), y, Math.floor(xs[i + 1]) - Math.ceil(xs[i]) + 1, 1);
  }
};

function atmosphere(c: CanvasRenderingContext2D, time: number, summit: boolean) {
  const sky = c.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, coast.skyTop); sky.addColorStop(1, coast.skyHorizon);
  c.fillStyle = sky; c.fillRect(0, 0, 640, 360);
  c.globalAlpha = .4; rect(c, 0, 150, 640, 25, '#f0f9ff'); c.globalAlpha = 1;

  c.globalAlpha = .45;
  polygon(c, [[350, 185], [440, 132], [505, 149], [572, 122], [640, 156], [640, 185]], coast.mountainFar);
  c.globalAlpha = .6;
  polygon(c, [[421, 185], [500, 152], [553, 166], [612, 145], [640, 171], [640, 185]], coast.mountainMid);
  c.globalAlpha = 1;
  rect(c, 0, 168, 640, 2, coast.horizon);
  rect(c, 0, 170, 640, 30, coast.seaFar);
  rect(c, 0, 200, 640, 35, coast.seaMid);
  rect(c, 0, 235, 640, 125, coast.seaNear);

  // The skyline stays quiet: one island ridge, one observatory at the summit.
  polygon(c, summit ? [[421, 208], [502, 179], [549, 152], [581, 157], [640, 190], [640, 234]]
    : [[484, 204], [553, 156], [589, 172], [640, 184], [640, 227]], coast.island);
  polygon(c, summit ? [[477, 197], [549, 152], [579, 170], [541, 185]]
    : [[518, 181], [553, 156], [584, 175], [549, 189]], coast.islandLight);
  rect(c, summit ? 535 : 549, 191, 43, 3, coast.stoneLight);
  if (summit) sprite(c, 'landmark_observatory', 568, 168, .3);

  for (let i = 0; i < 14; i++) {
    const x = (i * 73 + time * .008) % 668 - 28, y = 184 + (i * 13) % 78;
    const alpha = .18 + .18 * (1 + Math.sin(time / 900 + i)) / 2;
    c.globalAlpha = alpha; rect(c, x, y, 12 + i % 4 * 4, 1, coast.wave);
    c.globalAlpha = alpha * .8; rect(c, x + 5, y - 1, 6, 1, coast.foam);
  }
  c.globalAlpha = 1;
  sprite(c, 'prop_sailboat', 378 + Math.sin(time / 8000) * 6, 207 + Math.sin(time / 1000), .8);
  sprite(c, 'prop_sailboat', 465, 233 + Math.sin(time / 1200), .6);
  sprite(c, 'sky_cloud_large', 82 + Math.sin(time / 15000) * 15, 66, 1);
  sprite(c, 'sky_cloud_medium', 524 + Math.sin(time / 19000) * 19, 60, 1);
  sprite(c, 'sky_cloud_small', 374 + Math.sin(time / 17000) * 17, 38, 1);
  const gullFrame = Math.floor(time / 200) % 4;
  sprite(c, 'seagull_sheet', 452 + Math.sin(time / 5500) * 40, 101 + Math.sin(time / 900) * 3, .7, gullFrame);
  sprite(c, 'seagull_sheet', 592 - Math.sin(time / 7000) * 36, 122, .55, gullFrame);
}

function promenade(c: CanvasRenderingContext2D, time: number) {
  rect(c, 0, 267, 640, 1, coast.ink);
  rect(c, 0, 268, 640, 15, coast.stone);
  rect(c, 0, 268, 640, 2, '#f1f5f9');
  for (let x = 0; x < 640; x += 20) rect(c, x, 270, 1, 11, '#8b9cb0');
  rect(c, 0, 282, 640, 2, coast.stoneDark);
  rect(c, 0, 284, 640, 2, '#0c4a6e');
  rect(c, 0, 286, 640, 3, coast.foam);
  rect(c, 0, 289, 640, 2, coast.waveMid);
  rect(c, 0, 291, 640, 25, coast.waterNear);
  rect(c, 0, 316, 640, 33, coast.waterMid);
  rect(c, 0, 349, 640, 11, coast.waterDeep);
  for (let x = 12; x < 640; x += 69) {
    const drift = Math.round(Math.sin(time / 1800 + x) * 3);
    rect(c, x + drift, 302 + x % 5, 15, 1, coast.wave);
    rect(c, x + 5 + drift, 302 + x % 5, 5, 1, coast.foam);
    rect(c, x + 23 - drift, 334 + x % 4, 18, 1, coast.waveMid);
  }
}

export type JourneySceneKind = 'welcome' | 'loading' | 'ending';
export function drawJourneyScene(c: CanvasRenderingContext2D, kind: JourneySceneKind, time: number, progress = 0) {
  c.imageSmoothingEnabled = false;
  atmosphere(c, time, kind === 'ending');
  if (kind === 'ending') {
    polygon(c, [[0, 254], [54, 242], [105, 255], [169, 248], [256, 272], [344, 294], [409, 323], [453, 360], [0, 360]], '#647488');
    polygon(c, [[0, 281], [64, 269], [162, 276], [243, 289], [322, 312], [399, 344], [416, 360], [0, 360]], '#77889c');
    rect(c, 0, 279, 277, 9, coast.stone); rect(c, 0, 279, 267, 2, coast.stoneLight);
    rect(c, 0, 288, 296, 4, '#334155');
    for (let y = 306; y < 360; y += 16) {
      const width = 322 + (y - 306) / 2;
      rect(c, 0, y, width, 1, '#334155'); rect(c, 0, y + 1, width, 1, '#94a3b8');
      for (let x = (y % 32 ? 20 : 0); x < width; x += 46) rect(c, x, y + 2, 1, 14, '#4f6074');
    }
    sprite(c, 'prop_cypress', 23, 274, 1.6);
    sprite(c, 'prop_bush', 18, 284, 1.4); sprite(c, 'prop_bush', 283, 301, 1);
    sprite(c, 'prop_bollard_rope', 240, 282, 1.5);
    sprite(c, 'bike_parked', 145, 287, 1.5);
    // Small travel bag beside the parked bike; buttons sit below the terrace.
    rect(c, 193, 261, 17, 27, '#1e293b'); rect(c, 195, 263, 13, 23, '#d6c8a9');
    rect(c, 199, 258, 6, 4, '#334155'); rect(c, 196, 277, 11, 8, '#b8a987');
    sprite(c, 'prop_planter_urn', 79, 282, 1.4);
  } else {
    promenade(c, time);
    sprite(c, 'prop_tree', 39, 280, 2);
    sprite(c, 'prop_lamp', 80, 279, 1.6);
    sprite(c, 'prop_bench_seaside', 139, 282, 2);
    sprite(c, 'prop_planter_urn', 571, 281, 1.5);
    sprite(c, 'prop_bush', 612, 282, 1.6);
    if (kind === 'welcome') sprite(c, 'bike_parked', 221, 282, 1.5);
    else {
      const x = -50 + Math.min(1, progress) * 740;
      const frame = Math.floor(time / 140) % 4;
      for (let i = 3; i > 0; i--) {
        c.globalAlpha = .12 + i * .04;
        sprite(c, 'bike_ride_sheet', x - i * 19, 282, 1.5, frame);
      }
      c.globalAlpha = 1; sprite(c, 'bike_ride_sheet', x, 282, 1.5, frame);
    }
  }
}
