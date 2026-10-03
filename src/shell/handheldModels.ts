import * as THREE from 'three';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';

export type ModelDevice = 'switch' | 'steam-deck' | 'ps-portal';
export type ModelControl = 'up' | 'down' | 'left' | 'right' | 'j' | 'k';
export interface HandheldModel {
  group: THREE.Group;
  buttons: Partial<Record<ModelControl, THREE.Object3D>>;
}

const SCREEN = { x: 270, y: 50, width: 660, height: 371.25 };
const worldPoint = (x: number, y: number, z = 0) => new THREE.Vector3(x - 600, 250 - y, z);

/** A world-space outline, expressed in the same 1200 × 500 plane as the DOM controls. */
function roundedRect(x: number, y: number, width: number, height: number, radius = 0) {
  const left = x - 600, right = left + width, top = 250 - y, bottom = top - height;
  const r = Math.min(radius, width / 2, height / 2);
  const path = new THREE.Shape();
  path.moveTo(left + r, top); path.lineTo(right - r, top);
  path.quadraticCurveTo(right, top, right, top - r); path.lineTo(right, bottom + r);
  path.quadraticCurveTo(right, bottom, right - r, bottom); path.lineTo(left + r, bottom);
  path.quadraticCurveTo(left, bottom, left, bottom + r); path.lineTo(left, top - r);
  path.quadraticCurveTo(left, top, left + r, top); path.closePath();
  return path;
}
function outline(points: (number[] | { curve: number[] })[]) {
  const shape = new THREE.Shape();
  points.forEach((point, index) => {
    if (Array.isArray(point)) {
      const [x, y] = point;
      if (!index) shape.moveTo(x - 600, 250 - y); else shape.lineTo(x - 600, 250 - y);
    } else {
      const [a, b, c, d, x, y] = point.curve;
      shape.bezierCurveTo(a - 600, 250 - b, c - 600, 250 - d, x - 600, 250 - y);
    }
  });
  shape.closePath(); return shape;
}
function withScreenHole(shape: THREE.Shape, clearance = 0) {
  shape.holes.push(roundedRect(SCREEN.x - clearance, SCREEN.y - clearance,
    SCREEN.width + clearance * 2, SCREEN.height + clearance * 2));
  return shape;
}
function extrusion(shape: THREE.Shape, material: THREE.Material, z: number, depth: number, bevel = 1.4) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, steps: 1, bevelEnabled: bevel > 0, bevelSegments: 3,
    bevelSize: bevel, bevelThickness: bevel, curveSegments: 24,
  });
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material); mesh.position.z = z;
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}

/** Deterministic microscopic grain; no photographs or pre-rendered surface artwork. */
function plasticGrain() {
  const size = 128, rough = new Uint8Array(size * size * 4);
  let seed = 241;
  const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < size * size; i++) {
    const shade = 169 + Math.floor(noise() * 64), base = i * 4;
    rough[base] = rough[base + 1] = rough[base + 2] = shade; rough[base + 3] = 255;
    noise(); noise(); // Preserve the established roughness seed sequence.
  }
  const roughnessMap = new THREE.DataTexture(rough, size, size, THREE.RGBAFormat);
  for (const map of [roughnessMap]) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(.065, .065);
    map.magFilter = THREE.LinearFilter; map.minFilter = THREE.LinearMipmapLinearFilter;
    map.generateMipmaps = true; map.needsUpdate = true;
  }
  return { roughnessMap };
}

function materialKit(device: ModelDevice) {
  const grain = plasticGrain();
  const plastic = (color: string, roughness = .88) => new THREE.MeshPhysicalMaterial({
    color, metalness: 0, roughness, clearcoat: .08, clearcoatRoughness: .6,
    roughnessMap: grain.roughnessMap,
  });
  return {
    shell: plastic(device === 'switch' ? '#00afa9' : device === 'steam-deck' ? '#24272a' : '#f0f0ec'),
    rear: plastic(device === 'switch' ? '#008d89' : '#141619', .8),
    edge: plastic(device === 'switch' ? '#0b7774' : '#090b0e', .86),
    keys: plastic(device === 'switch' ? '#d9ded7' : device === 'ps-portal' ? '#bcc2c3' : '#343940', .62),
    rubber: plastic('#14171a', .9),
    glyph: new THREE.MeshStandardMaterial({ color: device === 'steam-deck' ? '#b2b9bf' : '#3d4549', roughness: .72 }),
    rim: new THREE.MeshPhysicalMaterial({ color: '#111417', metalness: .12, roughness: .24,
      clearcoat: .8, clearcoatRoughness: .14 }),
    pad: plastic('#1c2024', .68),
    inset: new THREE.MeshStandardMaterial({ color: '#07090b', roughness: .93 }),
    trim: new THREE.MeshStandardMaterial({ color: '#537485', metalness: .32, roughness: .45 }),
    blue: new THREE.MeshStandardMaterial({ color: '#428bff', emissive: '#1558d6', emissiveIntensity: .22, roughness: .45 }),
  };
}
type Materials = ReturnType<typeof materialKit>;

function cylinder(radius: number, height: number, material: THREE.Material, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * .95, height, 40, 1), material);
  mesh.rotation.x = Math.PI / 2; mesh.position.copy(worldPoint(x, y, z));
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
function line(points: THREE.Vector3[], color: THREE.Material, radius = 1) {
  const curve = new THREE.CatmullRomCurve3(points);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, radius, 8, false), color);
  mesh.castShadow = true; return mesh;
}
function glyph(group: THREE.Group, symbol: string, radius: number, material: THREE.Material) {
  const k = radius * .43;
  const strokes: Record<string, number[][][]> = {
    A: [[[-k, -k], [0, k], [k, -k]], [[-k * .55, 0], [k * .55, 0]]],
    B: [[[-k * .65, -k], [-k * .65, k]], [[-k * .65, k], [k * .55, k], [k * .75, k * .5], [k * .35, 0], [-k * .65, 0]], [[-k * .65, 0], [k * .45, 0], [k * .75, -k * .5], [k * .45, -k], [-k * .65, -k]]],
    X: [[[-k, -k], [k, k]], [[-k, k], [k, -k]]],
    Y: [[[-k, k], [0, 0], [k, k]], [[0, 0], [0, -k]]],
    triangle: [[[-k, -k * .65], [0, k], [k, -k * .65], [-k, -k * .65]]],
    square: [[[-k, -k], [-k, k], [k, k], [k, -k], [-k, -k]]],
    plus: [[[-k, 0], [k, 0]], [[0, -k], [0, k]]],
    minus: [[[-k, 0], [k, 0]]],
  };
  if (symbol === 'circle') {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(k, .8, 8, 32), material); mesh.position.z = 16.8; group.add(mesh);
  } else for (const stroke of strokes[symbol] || []) {
    // Straight segments keep tiny molded lettering crisp; curved housing uses tubes separately.
    for (let i = 1; i < stroke.length; i++) {
      const a = new THREE.Vector3(stroke[i - 1][0], stroke[i - 1][1], 16.8);
      const b = new THREE.Vector3(stroke[i][0], stroke[i][1], 16.8);
      const direction = b.clone().sub(a), mesh = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, direction.length(), 8), material);
      mesh.position.copy(a.clone().add(b).multiplyScalar(.5));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); group.add(mesh);
    }
  }
}
function faceButton(parent: THREE.Group, x: number, y: number, radius: number, symbol: string, kit: Materials) {
  parent.add(cylinder(radius + 3, 2.4, kit.inset, x, y, 7));
  const button = new THREE.Group(); button.position.copy(worldPoint(x, y));
  const cap = cylinder(radius, 10, kit.keys, 600, 250, 9); button.add(cap);
  const domeGeometry = new THREE.SphereGeometry(radius, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  domeGeometry.scale(1, .13, 1);
  const dome = new THREE.Mesh(domeGeometry, kit.keys); dome.rotation.x = Math.PI / 2;
  dome.position.z = 14; dome.castShadow = true; dome.receiveShadow = true; button.add(dome);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius - .7, .65, 8, 40), kit.keys);
  ring.position.z = 14.1; button.add(ring); glyph(button, symbol, radius, kit.glyph);
  parent.add(button); return button;
}
function stick(parent: THREE.Group, x: number, y: number, radius: number, kit: Materials, lightCap = false) {
  const assembly = new THREE.Group(); assembly.name = 'analog-stick'; assembly.position.z = 4;
  parent.add(assembly);
  // Seat the full socket above the shallow front contour; its lower wall remains
  // buried in the shell, avoiding clipped black crescents around the analog cap.
  assembly.add(cylinder(radius + 3, 8, kit.inset, x, y, 5));
  // Keep the stem below the concave center; it must not pierce a light-colored cap.
  assembly.add(cylinder(radius * .42, 8, kit.rubber, x, y, 7));
  const profile = [new THREE.Vector2(0, 13), new THREE.Vector2(radius * .56, 13),
    new THREE.Vector2(radius * .86, 16), new THREE.Vector2(radius, 15),
    new THREE.Vector2(radius, 11), new THREE.Vector2(radius * .8, 7), new THREE.Vector2(radius * .45, 6)];
  const capMaterial = lightCap ? kit.keys : kit.rubber;
  // Lathe expects the profile from the bottom toward the top. Reversing the old
  // top-to-bottom profile puts the visible cap normals toward the +Z camera.
  const cap = new THREE.Mesh(new THREE.LatheGeometry(profile.reverse(), 48), capMaterial);
  cap.rotation.x = Math.PI / 2; cap.position.copy(worldPoint(x, y)); cap.castShadow = true; cap.receiveShadow = true; assembly.add(cap);
  for (const factor of [.87, .93]) {
    const grip = new THREE.Mesh(new THREE.TorusGeometry(radius * factor, .55, 6, 48), capMaterial);
    grip.position.copy(worldPoint(x, y, 16)); assembly.add(grip);
  }
}
function dpad(parent: THREE.Group, x: number, y: number, half: number, arm: number, kit: Materials,
  buttons: HandheldModel['buttons'], dark = false) {
  const cross = outline([[x - arm, y - half], [x + arm, y - half], [x + arm, y - arm],
    [x + half, y - arm], [x + half, y + arm], [x + arm, y + arm], [x + arm, y + half],
    [x - arm, y + half], [x - arm, y + arm], [x - half, y + arm], [x - half, y - arm], [x - arm, y - arm]]);
  parent.add(extrusion(cross, kit.inset, 5.3, 1.2, 1.5));
  const material = dark ? kit.rubber : kit.keys;
  const center = extrusion(roundedRect(x - arm + .6, y - arm + .6, arm * 2 - 1.2, arm * 2 - 1.2, 2), material, 4, 8, 1.1);
  parent.add(center);
  const length = half - arm - .6;
  const positions: [ModelControl, number, number, number, number][] = [
    ['up', x - arm + .6, y - half, arm * 2 - 1.2, length],
    ['down', x - arm + .6, y + arm + .6, arm * 2 - 1.2, length],
    ['left', x - half, y - arm + .6, length, arm * 2 - 1.2],
    ['right', x + arm + .6, y - arm + .6, length, arm * 2 - 1.2],
  ];
  for (const [control, left, top, width, height] of positions) {
    const cap = extrusion(roundedRect(left, top, width, height, 2), material, 4, 8, 1.1);
    parent.add(cap); buttons[control] = cap;
  }
}
function speaker(parent: THREE.Group, x: number, y: number, kit: Materials, vertical = false, z = 7.2) {
  for (let i = 0; i < 5; i++) parent.add(extrusion(roundedRect(x + (vertical ? i * 4.8 : 0),
    y + (vertical ? 0 : i * 4.8), vertical ? 2.5 : 27, vertical ? 24 : 2.5, 1.2), kit.inset, z, .5, .15));
}
type FrontContour = 'gentle' | 'deck' | 'portal';
function frontLift(x: number, y: number, kind: FrontContour, amount: number) {
  if (x >= SCREEN.x && x <= SCREEN.x + SCREEN.width) return 0;
  const sideX = x < SCREEN.x ? x : 1200 - x;
  const lateral = Math.sin(Math.PI * THREE.MathUtils.clamp((sideX - 17) / 250, 0, 1));
  const vertical = Math.sin(Math.PI * THREE.MathUtils.clamp((y - 24) / 470, 0, 1));
  const lowerGrip = kind === 'gentle' ? 1 : .25 + .75 * Math.exp(-(((y - (kind === 'deck' ? 336 : 350)) / 155) ** 2));
  // A single low-frequency molded curve. Recessing each control separately caused
  // large plastic ripples and distracting halos, rather than a continuous housing.
  return Math.max(0, lateral * vertical) * lowerGrip * amount;
}
function contourFront(mesh: THREE.Mesh, amount: number, kind: FrontContour) {
  const source = mesh.geometry;
  // Finish subdivision rather than leaving 100+ px triangles across a bent face.
  const geometry = new TessellateModifier(22, 12).modify(source);
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const uv: number[] = [];
  for (let i = 0; i < positions.count; i++) {
    const uiX = positions.getX(i) + 600, uiY = 250 - positions.getY(i), oldZ = positions.getZ(i) + mesh.position.z;
    const lift = frontLift(uiX, uiY, kind, amount);
    const blend = THREE.MathUtils.smoothstep(oldZ, -4, 5.8), mound = lift * blend;
    positions.setZ(i, oldZ + mound - mesh.position.z);
    // Derive the normal directly from the continuous height field. Averaging cap
    // triangles with side/bevel vertices created large diagonal shading creases.
    const epsilon = .25;
    const dx = (frontLift(uiX + epsilon, uiY, kind, amount) - frontLift(uiX - epsilon, uiY, kind, amount)) / (2 * epsilon);
    const dy = -(frontLift(uiX, uiY + epsilon, kind, amount) - frontLift(uiX, uiY - epsilon, kind, amount)) / (2 * epsilon);
    const t = THREE.MathUtils.clamp((oldZ + 4) / 9.8, 0, 1);
    const derivative = oldZ > -4 && oldZ < 5.8 ? 6 * t * (1 - t) / 9.8 : 0;
    const inverseZ = 1 / (1 + lift * derivative);
    const nz = normals.getZ(i) * inverseZ;
    const normal = new THREE.Vector3(normals.getX(i) - dx * blend * nz, normals.getY(i) - dy * blend * nz, nz).normalize();
    normals.setXYZ(i, normal.x, normal.y, normal.z);
    // One continuous UV field welds the old extruded cap triangles correctly.
    uv.push(positions.getX(i), positions.getY(i));
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  mesh.geometry = geometry;
  source.dispose();
}
function commonBody(parent: THREE.Group, shape: () => THREE.Shape, kit: Materials, bevel: number,
  curveAmount = 6, kind: FrontContour = 'gentle') {
  const rear = extrusion(withScreenHole(shape(), bevel + 2), kit.rear, -32, 10, bevel);
  rear.name = 'rear-housing'; parent.add(rear);
  const seam = extrusion(withScreenHole(shape(), bevel + 2), kit.edge, -22, 1.5, bevel + .15);
  seam.name = 'housing-seam'; parent.add(seam);
  const front = extrusion(withScreenHole(shape(), bevel + 2), kit.shell, -20.2, 19, bevel);
  contourFront(front, curveAmount, kind);
  front.name = 'front-housing'; parent.add(front);
  // The black lens is an actual open ring, never a plane across the game aperture.
  const rim = extrusion(withScreenHole(roundedRect(252, 33, 696, 406, 16), 2.5), kit.rim, 8, 4, 2.2);
  rim.name = 'screen-lens-surround'; parent.add(rim);
  const gasket = extrusion(withScreenHole(roundedRect(266, 46, 668, 379.25, 3), .7), kit.inset, 13, .8, .5);
  gasket.name = 'screen-gasket'; parent.add(gasket);
  parent.add(extrusion(roundedRect(525, 438, 150, 13, 4), kit.inset, 6, .9, .6));
  for (let i = 0; i < 7; i++) parent.add(extrusion(roundedRect(580 + i * 6, 440, 1.5, 9, .6), kit.trim, 1, .7, .15));
}

function switchLite(group: THREE.Group, kit: Materials, buttons: HandheldModel['buttons']) {
  commonBody(group, () => roundedRect(23, 24, 1154, 449, 49), kit, 7, 2.5);
  stick(group, 163, 144, 34, kit, true); stick(group, 1030, 306, 34, kit, true);
  dpad(group, 163, 273, 46, 15, kit, buttons);
  buttons.j = faceButton(group, 1064, 161, 19, 'A', kit);
  buttons.k = faceButton(group, 1030, 195, 19, 'B', kit);
  faceButton(group, 1030, 127, 19, 'X', kit); faceButton(group, 996, 161, 19, 'Y', kit);
  faceButton(group, 198, 389, 14, 'square', kit); faceButton(group, 1030, 391, 14, 'circle', kit);
  faceButton(group, 219, 72, 9, 'minus', kit); faceButton(group, 980, 73, 9, 'plus', kit);
  speaker(group, 210, 431, kit); speaker(group, 962, 431, kit);
  // Shoulder caps, exposed shell seam and screw sockets give a physical sidewall.
  group.add(extrusion(roundedRect(68, 20, 131, 17, 8), kit.keys, -12, 7, 2));
  group.add(extrusion(roundedRect(1001, 20, 131, 17, 8), kit.keys, -12, 7, 2));
}
function steamDeck(group: THREE.Group, kit: Materials, buttons: HandheldModel['buttons']) {
  const body = () => outline([[113, 26], [1087, 26], { curve: [1151, 24, 1185, 69, 1188, 143] },
    [1190, 334], { curve: [1190, 430, 1165, 478, 1105, 477] },
    [1019, 471], { curve: [972, 468, 949, 448, 925, 446] }, [275, 446],
    { curve: [251, 448, 228, 468, 181, 471] }, [95, 477],
    { curve: [35, 478, 10, 430, 10, 334] }, [12, 143], { curve: [15, 69, 49, 24, 113, 26] }]);
  commonBody(group, body, kit, 7, 4, 'deck');
  stick(group, 200, 137, 37, kit); stick(group, 997, 137, 37, kit);
  dpad(group, 87, 135, 42, 14, kit, buttons);
  buttons.j = faceButton(group, 1110, 162, 17, 'A', kit);
  buttons.k = faceButton(group, 1142, 130, 17, 'B', kit);
  faceButton(group, 1110, 98, 17, 'Y', kit); faceButton(group, 1078, 130, 17, 'X', kit);
  for (const x of [144, 949]) {
    group.add(extrusion(roundedRect(x - 3, 249, 111, 106, 11), kit.inset, 8.5, 1.2, 1.2));
    group.add(extrusion(roundedRect(x, 252, 105, 100, 8), kit.pad, 9.6, 1.6, .9));
  }
  faceButton(group, 203, 389, 16, 'minus', kit); faceButton(group, 1001, 389, 16, 'plus', kit);
  faceButton(group, 259, 78, 10, 'minus', kit); faceButton(group, 943, 78, 10, 'plus', kit);
  speaker(group, 69, 371, kit, true, 9.3); speaker(group, 1107, 371, kit, true, 9.3);
  for (let i = 0; i < 13; i++) group.add(extrusion(roundedRect(511 + i * 14, 29, 7, 8, 1.6), kit.inset, 7.2, .7, .2));
}
function psPortal(group: THREE.Group, kit: Materials, buttons: HandheldModel['buttons']) {
  const body = () => outline([[260, 30], [940, 30], { curve: [980, 26, 1008, 17, 1052, 27] },
    { curve: [1133, 41, 1180, 125, 1187, 219] }, { curve: [1201, 314, 1161, 410, 1111, 472] },
    { curve: [1088, 501, 1035, 499, 1002, 477] }, [947, 447], [253, 447], [198, 477],
    { curve: [165, 499, 112, 501, 89, 472] }, { curve: [39, 410, -1, 314, 13, 219] },
    { curve: [20, 125, 67, 41, 148, 27] }, { curve: [192, 17, 220, 26, 260, 30] }]);
  commonBody(group, body, kit, 7, 5, 'portal');
  // Portal's center is a separate black tablet, seated above the white controller wings.
  const tablet = extrusion(withScreenHole(roundedRect(245, 24, 710, 423, 13), 4.2), kit.rim, 4, 6, 3.5);
  tablet.name = 'independent-tablet'; group.add(tablet);
  // Smooth circular sockets are seated into the single continuous wing surface.
  group.add(cylinder(44, 1.3, kit.pad, 204, 286, 10.8));
  group.add(cylinder(44, 1.3, kit.pad, 996, 286, 10.8));
  stick(group, 204, 286, 36, kit); stick(group, 996, 286, 36, kit);
  dpad(group, 132, 142, 42, 14, kit, buttons, true);
  buttons.j = faceButton(group, 1070, 179, 19, 'X', kit);
  buttons.k = faceButton(group, 1104, 145, 19, 'circle', kit);
  faceButton(group, 1070, 111, 19, 'triangle', kit); faceButton(group, 1036, 145, 19, 'square', kit);
  faceButton(group, 220, 91, 12, 'minus', kit); faceButton(group, 977, 91, 12, 'plus', kit);
  speaker(group, 165, 386, kit, true, 9.8); speaker(group, 1014, 386, kit, true, 9.8);
  for (const mirrored of [false, true]) {
    const path = [[247, 42], [245, 175], [228, 215], [177, 248], [151, 295], [188, 352], [230, 425]];
    const xy = new THREE.CatmullRomCurve3(path.map(([x, y]) => worldPoint(mirrored ? 1200 - x : x, y)));
    const points = xy.getPoints(70).map(point => {
      point.z = 7 + frontLift(point.x + 600, 250 - point.y, 'portal', 5);
      return point;
    });
    group.add(line(points, kit.blue, 1.45));
  }
}

/** All models share one open screen aperture and can be lit, rotated and depressed in real time. */
export function createHandheldModel(device: ModelDevice): HandheldModel {
  const group = new THREE.Group(); group.name = `physical-${device}`;
  group.userData.screenRect = [SCREEN.x, SCREEN.y, SCREEN.width, SCREEN.height];
  const buttons: HandheldModel['buttons'] = {}, kit = materialKit(device);
  if (device === 'switch') switchLite(group, kit, buttons);
  else if (device === 'steam-deck') steamDeck(group, kit, buttons);
  else psPortal(group, kit, buttons);
  for (const [control, object] of Object.entries(buttons)) {
    if (!object) continue; object.name = `button-${control}`;
    object.userData.restZ = object.position.z;
  }
  return { group, buttons };
}
