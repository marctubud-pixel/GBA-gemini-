/** Approved V1 room art, drawn at 960 x 320 logical pixels. */
import {
  R, L, poly, ellipse, text, room, plant, poster, table,
  sign, cabinet, frame, P,
} from './kit';

// A little coastal screening room: all large shapes sit behind the walk strip.
export default function drawCinema(ctx: CanvasRenderingContext2D, assets: unknown) {
  room(ctx, {
    wall: '#f4ead7', wallShade: '#e8d8bc', trim: P.navy,
    trimHi: P.blue, floor: '#b38964', floorShade: '#8e664a',
    wainscot: '#cab69a', style: 'wood',
  });

  // Cobalt beams, warm stone pilasters, and a red marquee echo the facade.
  R(ctx, 29, 35, 900, 9, P.navy);
  R(ctx, 31, 36, 896, 2, P.blueHi);
  R(ctx, 31, 44, 898, 5, '#b39a77');
  for (const x of [32, 227, 724, 915]) {
    R(ctx, x, 49, 13, 184, '#cbb895');
    R(ctx, x + 1, 50, 3, 181, '#fcf5e4');
    R(ctx, x + 10, 50, 3, 181, '#ad9674');
    R(ctx, x - 3, 226, 19, 8, '#937758');
    R(ctx, x - 4, 49, 21, 5, '#e9d6b7');
  }
  returnDoor(ctx);
  sign(ctx, 'MARC CINEMA', 371, 19, 217, P.coral);

  // Framed movie posters and a compact original projector on the left.
  poster(ctx, 55, 64, 65, 97, 'film', P.blue);
  poster(ctx, 138, 64, 65, 97, 'film', P.coral);
  R(ctx, 60, 150, 55, 9, P.navy);
  text(ctx, 'SEA FILM', 87, 151, 7, P.cream, 'center');
  R(ctx, 143, 150, 55, 9, P.coral);
  text(ctx, 'ROAD FILM', 170, 151, 7, P.cream, 'center');

  // Projection booth: cyan glass, wooden cabinet, reels and a brass lens.
  cabinet(ctx, 55, 207, 154, 40, P.wood);
  R(ctx, 59, 200, 146, 9, '#1d4257');
  R(ctx, 60, 200, 144, 2, '#527e8b');
  R(ctx, 76, 187, 88, 14, '#354a51');
  R(ctx, 78, 187, 84, 2, '#789391');
  R(ctx, 85, 174, 64, 21, P.navy);
  R(ctx, 86, 175, 62, 3, '#527381');
  R(ctx, 145, 180, 16, 12, '#8b744f');
  R(ctx, 160, 182, 11, 8, '#c6ad67');
  R(ctx, 169, 184, 4, 4, '#fff0b5');
  filmReel(ctx, 95, 173, 17);
  filmReel(ctx, 133, 173, 15);
  R(ctx, 111, 190, 4, 8, '#9da39a');
  R(ctx, 122, 192, 11, 3, '#5a8ca5');
  text(ctx, 'PROJECTOR 01', 132, 217, 7, '#e9c895', 'center');
  R(ctx, 68, 230, 27, 8, '#573e31');
  R(ctx, 72, 232, 19, 2, '#d8ba83');
  R(ctx, 178, 230, 17, 6, '#234859');
  R(ctx, 181, 231, 11, 3, '#c2d9d4');
  plant(ctx, 225, 243, 0.73, P.navy);

  // The silver screen is the dominant object; it contains a simple pixel film.
  R(ctx, 267, 56, 441, 145, '#203847');
  R(ctx, 270, 59, 435, 139, '#a4906d');
  R(ctx, 273, 62, 429, 134, '#394753');
  curtain(ctx, 273, 62, 46, 127, false);
  curtain(ctx, 657, 62, 45, 127, true);
  R(ctx, 314, 70, 347, 113, '#0e2233');
  R(ctx, 318, 74, 339, 105, '#dbe4df');
  R(ctx, 321, 77, 333, 99, '#78b7d7');
  screenFilm(ctx, 321, 77, 333, 99);
  R(ctx, 321, 77, 333, 8, '#172d3b');
  R(ctx, 321, 166, 333, 10, '#172d3b');
  text(ctx, 'A COASTAL STORY', 488, 177, 7, '#fff4cf', 'center');
  // Curtain valance, folds and a warm front-of-stage brass strip.
  R(ctx, 273, 62, 429, 9, '#ab2826');
  R(ctx, 276, 64, 424, 3, '#e76043');
  for (let x = 283; x < 693; x += 25) {
    poly(ctx, [[x, 69], [x + 11, 75], [x + 22, 69]], '#902b2b');
    L(ctx, x + 2, 69, x + 11, 72, '#ef7954');
  }
  R(ctx, 265, 194, 445, 7, '#493f37');
  R(ctx, 269, 195, 437, 2, '#c0a16a');
  R(ctx, 277, 201, 421, 5, '#76543f');
  R(ctx, 285, 206, 405, 4, '#a27652');

  // Wall lights beside the screen. Pixel blocks keep the lighting crisp.
  cinemaSconce(ctx, 248, 113);
  cinemaSconce(ctx, 723, 113);

  // Red seats recede into the screening area; the floor in front is walkable.
  for (const x of [317, 383, 449, 515, 581, 647]) {
    seat(ctx, x, 202, '#a52d2b', '#d94835', 0.78);
  }
  for (const x of [299, 374, 449, 524, 599, 674]) {
    seat(ctx, x, 211, '#ad2c29', '#ed5941', 1);
  }

  // Concession counter on the right, plus a second film poster.
  poster(ctx, 818, 66, 74, 87, 'film', P.blue);
  R(ctx, 823, 142, 64, 10, P.navy);
  text(ctx, 'FILM CLUB', 855, 144, 7, '#fff2da', 'center');
  sign(ctx, 'POP & SODA', 755, 155, 154, P.coral);
  cabinet(ctx, 752, 207, 160, 40, '#c78859');
  R(ctx, 749, 199, 166, 10, P.navy);
  R(ctx, 752, 199, 160, 2, '#58a9d2');
  R(ctx, 758, 211, 145, 5, '#e3b585');
  R(ctx, 802, 218, 54, 22, '#ab362b');
  R(ctx, 805, 220, 48, 18, '#e45638');
  text(ctx, 'MARC', 829, 221, 7, P.cream, 'center');
  text(ctx, 'CINEMA', 829, 230, 7, '#fff0ca', 'center');
  popcornMachine(ctx, 767, 170);
  sodaCup(ctx, 837, 184, 13);
  sodaCup(ctx, 858, 184, 13);
  R(ctx, 881, 185, 21, 14, '#e5b259');
  R(ctx, 883, 187, 17, 3, '#fff0c2');
  R(ctx, 884, 194, 16, 2, '#bd782f');
  plant(ctx, 918, 245, 0.69, '#b56c3e');

  // Exit and small framed details complete the room without filling the walk strip.
  R(ctx, 6, 49, 45, 10, '#315d52');
  text(ctx, 'EXIT', 29, 51, 7, '#e4f1d1', 'center');
  text(ctx, 'FILM / STORIES / MOTION', 487, 49, 7, '#947755', 'center');
  R(ctx, 41, 254, 878, 2, '#624b3b');
  R(ctx, 43, 256, 874, 1, '#cfaa77');
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

function curtain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, right: boolean) {
  R(ctx, x, y, w, h, '#ad2b2a');
  const folds = ['#76252b', '#c63a2d', '#ea5940', '#bf362e', '#8c262b'];
  for (let i = 0; i < w; i += 8) {
    R(ctx, x + i, y, Math.min(5, w - i), h, folds[Math.floor(i / 8) % folds.length]);
    R(ctx, x + i + 3, y + 6, 2, h - 10, '#ef6c48');
  }
  const tieY = y + 73;
  if (right) {
    poly(ctx, [[x, y + 14], [x + w - 7, tieY], [x, y + h]], '#6d2730');
    L(ctx, x + 1, y + 15, x + w - 10, tieY - 1, '#e3513b', 3);
  } else {
    poly(ctx, [[x + w, y + 14], [x + 7, tieY], [x + w, y + h]], '#6d2730');
    L(ctx, x + w - 1, y + 15, x + 10, tieY - 1, '#e3513b', 3);
  }
  R(ctx, x + 4, tieY, w - 8, 3, '#deab54');
  R(ctx, x + 5, tieY, w - 10, 1, '#ffdc88');
}

function screenFilm(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  R(ctx, x, y, w, h, '#90cae0');
  R(ctx, x, y + 38, w, 19, '#b2dfe6');
  R(ctx, x, y + 57, w, h - 57, '#397bab');
  R(ctx, x, y + 58, w, 2, '#dfefdf');
  // The same quiet seaside world, seen through the cinema's lens.
  ellipse(ctx, x + 259, y + 27, 15, 15, '#f7df9a');
  R(ctx, x + 48, y + 23, 49, 5, '#edf4e5');
  R(ctx, x + 59, y + 19, 21, 4, '#edf4e5');
  R(ctx, x + 64, y + 28, 41, 3, '#c9e5e5');
  R(ctx, x + 183, y + 17, 36, 4, '#e9f1e3');
  R(ctx, x + 193, y + 13, 17, 4, '#e9f1e3');
  poly(ctx, [[x, y + 54], [x + 28, y + 44], [x + 49, y + 51], [x + 79, y + 39], [x + 113, y + 55]], '#557c8c');
  poly(ctx, [[x + 200, y + 58], [x + 229, y + 52], [x + 266, y + 58], [x + 300, y + 47], [x + w, y + 55], [x + w, y + 65], [x + 200, y + 65]], '#639099');
  for (const [dx, dy, ww, hh] of [[19, 42, 15, 17], [37, 39, 17, 21], [56, 45, 14, 16], [74, 47, 17, 15]]) {
    R(ctx, x + dx, y + dy, ww, hh, '#efddc0');
    R(ctx, x + dx - 2, y + dy - 3, ww + 4, 4, '#b95140');
    R(ctx, x + dx + 4, y + dy + 5, 4, 5, '#416e8c');
    R(ctx, x + dx + 10, y + dy + 5, 3, 5, '#416e8c');
  }
  R(ctx, x, y + 78, 129, 9, '#b59872');
  R(ctx, x, y + 76, 132, 3, '#eadab9');
  poly(ctx, [[x + 220, y + 69], [x + 254, y + 69], [x + 247, y + 74], [x + 226, y + 74]], '#153e62');
  L(ctx, x + 237, y + 46, x + 237, y + 69, '#f3ecd6', 1);
  poly(ctx, [[x + 235, y + 48], [x + 221, y + 66], [x + 235, y + 66]], '#f6ead0');
  for (const [dx, dy, ww] of [[150, 65, 34], [262, 78, 35], [101, 70, 26], [186, 84, 26], [52, 92, 40], [303, 64, 21]]) {
    R(ctx, x + dx, y + dy, ww, 1, '#8dd3df');
    R(ctx, x + dx + 7, y + dy + 3, Math.max(4, ww - 14), 1, '#b4e2e1');
  }
  // Small bicycle silhouette gives the still a narrative subject.
  ellipse(ctx, x + 101, y + 76, 4, 4, '#163f58');
  ellipse(ctx, x + 118, y + 76, 4, 4, '#163f58');
  L(ctx, x + 101, y + 76, x + 108, y + 69, '#153c5d', 1);
  L(ctx, x + 108, y + 69, x + 118, y + 76, '#153c5d', 1);
  L(ctx, x + 101, y + 76, x + 112, y + 76, '#153c5d', 1);
  R(ctx, x + 105, y + 62, 5, 8, '#cd5140');
  R(ctx, x + 107, y + 57, 4, 4, '#253e47');
}

function seat(ctx: CanvasRenderingContext2D, x: number, y: number, dark: string, light: string, scale: number) {
  const s = (n: number) => Math.round(n * scale);
  R(ctx, x + s(5), y + s(29), s(37), s(6), '#634939');
  R(ctx, x + s(9), y + s(31), s(4), s(5), P.ink);
  R(ctx, x + s(36), y + s(31), s(4), s(5), P.ink);
  R(ctx, x + s(7), y, s(35), s(28), '#642832');
  R(ctx, x + s(9), y + s(2), s(31), s(23), dark);
  R(ctx, x + s(10), y + s(3), s(29), s(3), light);
  R(ctx, x + s(11), y + s(6), s(3), s(17), light);
  R(ctx, x + s(13), y + s(24), s(26), s(6), '#c74433');
  R(ctx, x + s(13), y + s(24), s(26), s(2), '#f3734d');
  R(ctx, x + s(2), y + s(22), s(8), s(6), P.ink);
  R(ctx, x + s(40), y + s(22), s(8), s(6), P.ink);
  R(ctx, x + s(3), y + s(22), s(6), s(2), '#58778a');
  R(ctx, x + s(41), y + s(22), s(6), s(2), '#58778a');
}

function filmReel(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ellipse(ctx, x, y, radius, radius, '#152d3b');
  ellipse(ctx, x, y, radius - 2, radius - 2, '#9dada9');
  ellipse(ctx, x - 1, y - 1, radius - 4, radius - 4, '#d2d7bd');
  for (const [dx, dy] of [[0, -8], [7, -2], [4, 6], [-5, 6], [-8, -3]]) {
    ellipse(ctx, x + dx, y + dy, 3, 3, '#345360');
  }
  R(ctx, x - 2, y - 2, 4, 4, '#63818a');
  R(ctx, x - 1, y - 1, 2, 2, '#fff1cb');
}

function popcornMachine(ctx: CanvasRenderingContext2D, x: number, y: number) {
  R(ctx, x, y + 4, 46, 25, '#3d5d63');
  R(ctx, x + 3, y + 6, 40, 20, '#a9d0ce');
  R(ctx, x + 5, y + 7, 34, 12, '#d8e1ca');
  R(ctx, x + 7, y + 19, 31, 7, '#f1d09a');
  for (let i = 0; i < 10; i++) {
    const px = x + 8 + ((i * 11) % 28);
    const py = y + 17 + ((i * 3) % 7);
    R(ctx, px, py, 4, 3, i % 3 === 0 ? '#fff0c7' : '#e3b86c');
  }
  R(ctx, x - 2, y, 50, 6, '#b2362c');
  R(ctx, x, y + 1, 46, 2, '#ef6546');
  R(ctx, x - 1, y + 27, 48, 3, '#b2362c');
  R(ctx, x + 3, y + 5, 2, 21, '#f6e8c5');
  R(ctx, x + 40, y + 5, 2, 21, '#edecd1');
  text(ctx, 'POP', x + 22, y - 1, 7, '#ffe8b3', 'center');
}

function sodaCup(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  poly(ctx, [[x, y + 3], [x + w, y + 3], [x + w - 2, y + 15], [x + 2, y + 15]], '#edebd1');
  R(ctx, x + 3, y + 5, 3, 9, '#d44232');
  R(ctx, x + 9, y + 5, 2, 9, '#d44232');
  R(ctx, x - 1, y + 2, w + 2, 3, '#fef8df');
  R(ctx, x + 7, y - 6, 2, 9, '#73c0d1');
}

function cinemaSconce(ctx: CanvasRenderingContext2D, x: number, y: number) {
  R(ctx, x - 5, y - 4, 10, 22, P.navy);
  R(ctx, x - 3, y - 2, 6, 18, '#dcbd78');
  R(ctx, x - 2, y, 4, 14, '#f5dfa1');
  R(ctx, x - 6, y - 6, 12, 3, '#bc8c50');
  R(ctx, x - 6, y + 17, 12, 3, '#bc8c50');
  R(ctx, x - 10, y - 1, 3, 16, '#ead4a6');
  R(ctx, x + 8, y - 1, 3, 16, '#ead4a6');
}
