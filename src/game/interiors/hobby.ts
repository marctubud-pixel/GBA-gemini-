/** A personal studio, drawn at 960 × 320 logical pixels. */
import { R, L, poly, ellipse, text, room, window, plant, shelf, books, lamp, poster, table, sign, stool, rug, cabinet, frame, vista, hangingPlant, pinnedNote, stringLights, paperStack, P } from './kit';
import type { InteriorDrawAssets } from './types';

// Personal studio: four readable interests on one continuous back wall.
// All freestanding furniture rests at y=244..250.  The y=250..270 strip
// deliberately contains only floor; the shared player sprite is composited later.
export default function drawHobby(ctx: CanvasRenderingContext2D, assets: InteriorDrawAssets = {}) {
  ctx.imageSmoothingEnabled = false;
  room(ctx, {
    wall: '#faf7e8', wallShade: '#e7dec8', trim: '#163e50',
    trimHi: '#366276', floor: '#b68c61', floorShade: '#97704d',
    wainscot: '#e8dfc6', style: 'wood'
  });

  // The exterior's cream stone, deep blue joinery, and warm wood continue inside.
  R(ctx, 0, 24, 960, 6, P.navy);
  R(ctx, 0, 23, 960, 1, '#427081');
  for (const x of [14, 326, 649, 942]) {
    R(ctx, x, 30, 8, 215, '#ded4bd');
    R(ctx, x, 30, 2, 215, P.cream);
    R(ctx, x + 6, 30, 2, 215, '#c3b99f');
    R(ctx, x - 2, 238, 12, 7, '#c3b99f');
  }
  // A narrow side entry leaves x=0..56 available to the arrival transition.
  R(ctx, 9, 67, 46, 178, '#173f50');
  R(ctx, 12, 70, 40, 174, '#315d70');
  R(ctx, 14, 72, 36, 2, '#75919a');
  R(ctx, 18, 82, 28, 65, '#102f42');
  R(ctx, 21, 85, 22, 59, '#81b9bd');
  R(ctx, 21, 119, 22, 25, '#4c828b');
  L(ctx, 21, 100, 42, 100, '#d3e4d6', 2);
  R(ctx, 19, 165, 27, 56, '#244b5d');
  R(ctx, 21, 167, 23, 1, '#577b87');
  R(ctx, 43, 156, 3, 11, '#e5c680');
  text(ctx, 'EXIT', 32, 54, 7, P.navy, 'center');
  R(ctx, 8, 243, 48, 3, '#c6b99d');

  // 01 / PHOTOGRAPHY — contact prints, camera desk and a wooden bookcase.
  sign(ctx, 'PHOTOGRAPHY', 64, 40, 143, P.navy);
  const prints: [number, number, number, number, 'coast' | 'graphic' | 'film', string][] = [
    [64, 77, 38, 34, 'coast', '#60a9b8'],
    [111, 70, 38, 42, 'graphic', '#d4a34d'],
    [160, 78, 42, 34, 'coast', '#7a986d'],
    [67, 119, 36, 29, 'graphic', '#588a96'],
    [114, 121, 38, 32, 'coast', '#55999b'],
    [163, 119, 39, 31, 'film', '#b36d58']
  ];
  for (const [x,y,w,h,kind,accent] of prints) {
    poster(ctx, x, y, w, h, kind, accent);
    R(ctx, x + Math.floor(w / 2) - 3, y - 2, 6, 4, '#d5bd88');
  }
  L(ctx, 64, 161, 199, 161, '#b8ac8d');
  L(ctx, 64, 163, 199, 163, P.cream);
  table(ctx, 64, 178, 139, 66, P.wood);
  // Worktop edge, two wide drawers, shelf of large paper sheets.
  R(ctx, 62, 177, 143, 5, '#d9af7b');
  R(ctx, 69, 188, 129, 24, '#8e6949');
  R(ctx, 72, 189, 59, 20, '#bc9160');
  R(ctx, 134, 189, 61, 20, '#bc9160');
  L(ctx, 73, 190, 128, 190, '#dfb984');
  L(ctx, 135, 190, 192, 190, '#dfb984');
  R(ctx, 96, 198, 11, 3, '#493d34');
  R(ctx, 158, 198, 11, 3, '#493d34');
  R(ctx, 75, 221, 62, 5, '#d2caba');
  R(ctx, 77, 216, 59, 5, '#fcf4df');
  R(ctx, 79, 217, 49, 1, '#e0d8c7');
  R(ctx, 146, 216, 31, 14, '#2e5770');
  R(ctx, 151, 217, 2, 12, '#6997aa');
  // SLR body: optical viewfinder, lens rim and cool glass highlights.
  R(ctx, 68, 164, 41, 13, '#253842');
  R(ctx, 70, 162, 10, 3, '#3c5560');
  R(ctx, 82, 159, 15, 7, '#374c57');
  R(ctx, 86, 160, 7, 3, '#7b99a5');
  R(ctx, 70, 165, 35, 2, '#71868e');
  ellipse(ctx, 91, 170, 9, 9, '#142f3f');
  ellipse(ctx, 91, 170, 6, 6, '#486a7b');
  ellipse(ctx, 91, 170, 4, 4, '#163e50');
  R(ctx, 88, 167, 3, 2, '#94cdd0');
  R(ctx, 104, 166, 3, 2, P.gold);
  // Open album and a desk light.
  poly(ctx, [[113,168],[139,166],[141,178],[114,178]], '#e8dfcb');
  poly(ctx, [[141,166],[166,168],[166,178],[141,178]], '#fbf6e6');
  L(ctx, 141, 167, 141, 177, '#bda882');
  R(ctx, 118, 170, 17, 5, '#4f8a8a');
  R(ctx, 146, 170, 14, 5, '#719b74');
  L(ctx, 175, 174, 183, 174, P.ink, 2);
  L(ctx, 179, 174, 179, 152, '#366276', 2);
  poly(ctx, [[167,151],[189,151],[184,142],[172,142]], '#446e79');
  R(ctx, 169, 150, 18, 2, '#7aa3aa');
  // Deep wooden reading shelves echo the facade's planted home studio.
  shelf(ctx, 218, 67, 99, 177);
  books(ctx, 224, 80, 83, 29, 11);
  books(ctx, 224, 119, 52, 29, 24);
  R(ctx, 282, 129, 22, 16, '#e0c88d');
  R(ctx, 286, 132, 14, 6, '#4b7d80');
  books(ctx, 239, 161, 69, 29, 38);
  // Large flat archive boxes at the bottom keep the room calm and readable.
  R(ctx, 225, 201, 80, 13, '#b09a79');
  R(ctx, 224, 200, 82, 3, '#d0b48e');
  R(ctx, 257, 206, 17, 4, P.cream);
  R(ctx, 225, 218, 80, 15, '#8f9c8b');
  R(ctx, 224, 217, 82, 3, '#c0c9af');
  R(ctx, 258, 223, 16, 4, P.cream);
  plant(ctx, 302, 65, 0.65, '#346e7c');
  // Tripod remains behind the visitor lane.
  R(ctx, 204, 149, 14, 8, '#213f50');
  ellipse(ctx, 213, 153, 5, 5, '#547684');
  L(ctx, 211, 160, 211, 238, '#56727c', 2);
  L(ctx, 211, 181, 197, 244, P.ink, 2);
  L(ctx, 212, 181, 224, 244, P.ink, 2);

  // 02 / MUSIC — an open coastal window, soft chair, vinyl and warm speakers.
  window(ctx, 369, 51, 176, 117, { trim: P.navy, trimHi: '#507e8c', time: assets.time });
  // Pixel curtains stay at the sides; a wide, bright sea vista remains visible.
  for (const x of [349, 546]) {
    R(ctx, x, 47, 17, 127, '#d9dec4');
    R(ctx, x + 3, 47, 5, 123, '#ecedd3');
    R(ctx, x + 11, 47, 3, 124, '#b5c4a8');
    R(ctx, x - 1, 138, 19, 4, '#b89a64');
  }
  R(ctx, 346, 42, 219, 4, '#446672');
  R(ctx, 346, 42, 219, 1, '#8fa8a4');
  R(ctx, 368, 168, 180, 5, '#caa777');
  R(ctx, 370, 168, 176, 1, '#e7c598');
  plant(ctx, 383, 166, 0.55, '#b77750');
  R(ctx, 518, 159, 14, 9, P.cream);
  R(ctx, 521, 160, 8, 1, '#cbb89b');
  sign(ctx, 'MUSIC', 572, 43, 58, P.navy);
  // The wall record sleeve uses a strong, simple graphic rather than tiny marks.
  poster(ctx, 574, 82, 54, 65, 'graphic', '#71958b');
  ellipse(ctx, 600, 111, 18, 18, '#203b48');
  ellipse(ctx, 600, 111, 7, 7, '#d4ad62');
  R(ctx, 598, 109, 3, 3, P.cream);
  // Chair silhouette and upholstery: four chunky green tones.
  R(ctx, 405, 181, 57, 51, '#2d5f49');
  R(ctx, 409, 177, 49, 43, '#468c58');
  R(ctx, 413, 179, 41, 4, '#7aaf69');
  R(ctx, 413, 184, 39, 32, '#61a166');
  R(ctx, 414, 211, 36, 3, '#3f8153');
  R(ctx, 398, 210, 13, 23, '#39724e');
  R(ctx, 397, 208, 14, 5, '#699d60');
  R(ctx, 456, 210, 13, 23, '#39724e');
  R(ctx, 456, 208, 14, 5, '#699d60');
  R(ctx, 410, 218, 47, 12, '#579560');
  R(ctx, 412, 219, 43, 3, '#80b272');
  R(ctx, 403, 232, 61, 7, '#285540');
  R(ctx, 407, 238, 5, 8, '#6d523b');
  R(ctx, 455, 238, 5, 8, '#6d523b');
  // Coral cushion is a single focal accent against the fern-green chair.
  R(ctx, 432, 188, 16, 24, '#ae6850');
  R(ctx, 431, 187, 15, 21, '#d29873');
  L(ctx, 433, 188, 443, 188, '#ecc0a0');
  // Low side table and cup (legs end at y=246).
  table(ctx, 476, 214, 36, 31, '#8c694a');
  R(ctx, 480, 212, 29, 3, '#d6b284');
  R(ctx, 487, 203, 10, 9, P.cream);
  R(ctx, 496, 205, 4, 5, '#e3d5bc');
  R(ctx, 498, 206, 2, 3, '#9a7f5d');
  R(ctx, 488, 203, 8, 2, '#7e573e');
  // Music console has three open cubbies, two speakers and a turntable.
  cabinet(ctx, 521, 191, 110, 54, '#a57d52');
  R(ctx, 519, 189, 114, 5, '#d4ab79');
  R(ctx, 526, 199, 100, 30, '#624d3b');
  R(ctx, 557, 199, 3, 30, '#a57d52');
  R(ctx, 592, 199, 3, 30, '#a57d52');
  for (let i = 0; i < 8; i++) {
    R(ctx, 529 + i * 3, 203 + (i % 3), 2, 24 - (i % 3),
      ['#d6ba85','#668985','#c9816b','#e3d6b9'][i % 4]);
  }
  // Upright album covers read as a curated record library.
  R(ctx, 564, 205, 22, 22, '#e0cfab');
  R(ctx, 567, 208, 16, 15, '#4e7782');
  ellipse(ctx, 575, 216, 6, 6, '#f0c278');
  R(ctx, 600, 204, 18, 23, '#b37d57');
  R(ctx, 603, 207, 12, 15, '#dbb37a');
  L(ctx, 606, 207, 612, 220, '#795745', 2);
  // Turntable deck and lid.
  R(ctx, 548, 175, 53, 13, '#514b40');
  R(ctx, 549, 175, 51, 2, '#b99e71');
  ellipse(ctx, 570, 180, 17, 5, '#1e3541');
  ellipse(ctx, 570, 180, 6, 2, '#c99152');
  R(ctx, 569, 179, 2, 2, P.cream);
  L(ctx, 593, 178, 590, 183, '#c6c5ac');
  L(ctx, 590, 183, 580, 182, '#c6c5ac');
  R(ctx, 547, 169, 55, 4, '#779c9f');
  L(ctx, 548, 169, 548, 175, '#64838a');
  L(ctx, 601, 169, 601, 175, '#64838a');
  for (const x of [524, 605]) {
    R(ctx, x, 161, 22, 28, '#3b4240');
    R(ctx, x + 1, 162, 20, 3, '#6c7161');
    ellipse(ctx, x + 11, 179, 7, 7, '#182f37');
    ellipse(ctx, x + 11, 179, 4, 4, '#697875');
    ellipse(ctx, x + 11, 168, 3, 3, '#b3b292');
  }
  // Standing lamp belongs to the listening corner, not the front walk path.
  L(ctx, 348, 167, 348, 242, P.navy, 2);
  R(ctx, 339, 242, 19, 4, P.navy);
  poly(ctx, [[332,160],[364,160],[359,139],[337,139]], '#e6c586');
  R(ctx, 334, 159, 28, 3, '#b79459');
  R(ctx, 339, 141, 4, 17, '#f2d9a1');

  // 03 / CYCLING — bike silhouette, route map, jersey, helmet and repair kit.
  sign(ctx, 'CYCLING', 674, 41, 110, P.navy);
  poster(ctx, 674, 77, 105, 58, 'coast', '#75a39c');
  // Three broad route segments suggest a coastline, with two landmark pins.
  L(ctx, 687, 111, 711, 98, '#fcf0cb', 2);
  L(ctx, 711, 98, 737, 111, '#fcf0cb', 2);
  L(ctx, 737, 111, 765, 92, '#fcf0cb', 2);
  R(ctx, 685, 108, 5, 5, P.coral);
  R(ctx, 763, 89, 5, 5, P.gold);
  // Wall hooks and a cream / slate-blue cycling jersey.
  R(ctx, 800, 75, 123, 5, '#96714d');
  for (const x of [811, 842, 873, 905]) {
    R(ctx, x, 79, 2, 7, P.navy);
    R(ctx, x, 84, 5, 2, P.navy);
  }
  poly(ctx, [[821,89],[832,94],[824,100],[827,130],[800,130],[803,100],[795,98],[803,89],[809,86],[815,90]], '#345d74');
  poly(ctx, [[804,91],[809,88],[815,93],[820,91],[825,96],[818,101],[819,123],[806,123],[807,101],[799,97]], '#e4e9dd');
  R(ctx, 807, 106, 12, 5, '#7296a1');
  R(ctx, 807, 119, 12, 4, '#356176');
  L(ctx, 812, 93, 812, 123, '#99afb1');
  R(ctx, 834, 139, 41, 4, '#b9966a');
  // Helmet in recognizable stepped shell, with large ventilation slits.
  R(ctx, 840, 129, 31, 8, '#2c5269');
  R(ctx, 842, 122, 26, 10, '#5593ad');
  R(ctx, 847, 118, 17, 8, '#6cacc0');
  R(ctx, 848, 120, 5, 7, '#244c64');
  R(ctx, 859, 120, 5, 7, '#244c64');
  R(ctx, 867, 130, 8, 3, '#193c53');
  // Bicycle frame and two large pixel wheels.  The spoke geometry is sparse.
  const wheel = (cx: number, cy: number) => {
    ellipse(ctx, cx, cy, 31, 31, '#213746');
    ellipse(ctx, cx, cy, 26, 26, '#b9a17c');
    ellipse(ctx, cx, cy, 24, 24, '#dcc39b');
    for (const [dx,dy] of [[0,23],[23,0],[17,17],[17,-17]]) {
      L(ctx, cx-dx, cy-dy, cx+dx, cy+dy, '#8b9290');
    }
    ellipse(ctx, cx, cy, 3, 3, '#395268');
    L(ctx, cx - 15, cy - 25, cx + 6, cy - 29, '#62717a', 2);
  };
  wheel(687, 216); wheel(772, 216);
  L(ctx, 688, 216, 714, 177, '#173d55', 4);
  L(ctx, 714, 177, 735, 216, '#173d55', 4);
  L(ctx, 735, 216, 688, 216, '#173d55', 4);
  L(ctx, 714, 177, 757, 177, '#173d55', 4);
  L(ctx, 735, 216, 757, 177, '#173d55', 4);
  L(ctx, 757, 177, 772, 216, '#173d55', 4);
  // Selective teal highlights describe steel tubing, not glossy gradients.
  L(ctx, 714, 177, 754, 177, '#7cafb6', 1);
  L(ctx, 690, 214, 732, 214, '#51929e', 1);
  L(ctx, 735, 213, 755, 178, '#51929e', 1);
  L(ctx, 713, 175, 711, 167, '#4a6572', 3);
  R(ctx, 702, 164, 22, 5, '#343d41');
  R(ctx, 704, 164, 16, 1, '#939a92');
  L(ctx, 757, 178, 754, 157, '#4d6b78', 3);
  L(ctx, 755, 157, 765, 156, '#4d6b78', 3);
  L(ctx, 765, 156, 768, 162, '#4d6b78', 3);
  R(ctx, 764, 158, 8, 3, '#253d46');
  ellipse(ctx, 735, 216, 7, 7, '#667779');
  ellipse(ctx, 735, 216, 4, 4, '#314b59');
  L(ctx, 735, 216, 741, 226, '#c0bfa5', 2);
  R(ctx, 738, 225, 10, 3, '#233d4b');
  R(ctx, 734, 185, 5, 15, '#e6e4d7');
  R(ctx, 733, 187, 7, 3, '#579b9f');
  // A low equipment chest grounds the hanging gear without crossing the lane.
  cabinet(ctx, 808, 180, 46, 64, '#405e63');
  R(ctx, 810, 182, 42, 4, '#6f8e85');
  R(ctx, 814, 190, 34, 22, '#577a74');
  R(ctx, 826, 200, 9, 3, '#d5bd7d');
  R(ctx, 814, 219, 34, 18, '#446a63');
  R(ctx, 826, 226, 9, 3, '#d5bd7d');
  R(ctx, 814, 173, 26, 7, '#ad8762');
  R(ctx, 819, 171, 15, 2, '#70553e');

  // 04 / COLLECTION — a glass-fronted display of objects, with clear silhouettes.
  sign(ctx, 'COLLECTION', 863, 42, 65, P.navy);
  R(ctx, 867, 91, 68, 155, '#263f4c');
  R(ctx, 871, 95, 60, 146, '#719495');
  R(ctx, 874, 98, 54, 140, '#d0ddcd');
  for (const y of [134, 180, 231]) {
    R(ctx, 872, y, 58, 5, '#38616b');
    R(ctx, 872, y, 58, 1, '#779693');
  }
  // Top shelf: two small model vessels.
  poly(ctx, [[880,123],[899,123],[894,130],[884,130]], '#566f79');
  L(ctx, 889, 101, 889, 123, '#a47c50');
  poly(ctx, [[891,103],[891,120],[900,120]], P.cream);
  poly(ctx, [[886,108],[886,120],[879,120]], '#7fa7a2');
  R(ctx, 909, 108, 10, 22, '#ca965c');
  R(ctx, 907, 111, 14, 15, '#f0c177');
  R(ctx, 910, 113, 8, 8, '#7c5e45');
  R(ctx, 912, 114, 4, 6, '#eadbb3');
  // Middle shelf: handheld and a tiny red robot figure.
  R(ctx, 879, 151, 23, 18, '#466781');
  R(ctx, 880, 152, 21, 2, '#7998a7');
  R(ctx, 885, 155, 12, 8, '#213d50');
  R(ctx, 887, 157, 8, 4, '#85bfa7');
  R(ctx, 881, 159, 3, 3, '#203846');
  R(ctx, 898, 159, 2, 2, '#d2c48f');
  R(ctx, 911, 149, 9, 11, '#bc5d42');
  R(ctx, 910, 162, 12, 11, '#a84232');
  R(ctx, 907, 163, 3, 8, '#a84232');
  R(ctx, 922, 163, 3, 8, '#a84232');
  R(ctx, 911, 173, 3, 6, P.ink);
  R(ctx, 919, 173, 3, 6, P.ink);
  R(ctx, 912, 152, 7, 3, '#ebc09a');
  R(ctx, 914, 166, 5, 3, P.gold);
  // Bottom shelf: grouped art magazines and a framed postcard.
  books(ctx, 878, 195, 21, 33, 57);
  R(ctx, 905, 201, 20, 24, '#a78359');
  R(ctx, 907, 203, 16, 19, P.cream);
  R(ctx, 909, 206, 12, 12, '#68a6a6');
  R(ctx, 909, 214, 12, 4, '#477b6c');
  R(ctx, 916, 208, 4, 4, '#f4d27b');
  // Glass divider and a single wide reflection on each pane.
  R(ctx, 900, 95, 2, 146, '#3b6570');
  R(ctx, 875, 98, 2, 32, '#f2f4dc');
  R(ctx, 924, 141, 2, 31, '#f2f4dc');
  R(ctx, 901, 188, 2, 29, '#f2f4dc');
  R(ctx, 894, 172, 3, 7, '#d4b578');
  R(ctx, 904, 172, 3, 7, '#d4b578');
  R(ctx, 871, 241, 6, 7, '#213f50');
  R(ctx, 925, 241, 6, 7, '#213f50');

  hangingPlant(ctx, 326, 36, 31, '#b98256');
  stringLights(ctx, 654, 30, 153, '#efca73');
  pinnedNote(ctx, 638, 112, 25, 30, '#ecdbac');
  R(ctx, 643, 124, 14, 7, '#6a9599');
  // Half-finished reading and listening rituals make the collection feel used.
  paperStack(ctx, 274, 59, 28);
  R(ctx, 242, 67, 13, 4, '#d7b279');
  R(ctx, 244, 64, 9, 3, P.navy);
  rug(ctx, 390, 242, 86, 16, '#aa8c62');
  R(ctx, 573, 232, 22, 12, '#daae77');
  R(ctx, 575, 233, 18, 9, P.creamShade);
  R(ctx, 578, 235, 11, 5, '#688c85');
  R(ctx, 813, 151, 30, 9, P.creamShade);
  R(ctx, 816, 153, 23, 2, '#9c977e');
  R(ctx, 816, 157, 15, 1, '#9c977e');

  // Foreground floor stays empty: readable horizontal stage for walking.
  // Few long joins, rather than speckled grain, reinforce the pixel scale.
  L(ctx, 28, 270, 932, 270, '#cba373');
  L(ctx, 28, 271, 932, 271, '#946d48');
};
