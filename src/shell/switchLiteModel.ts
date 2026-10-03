import * as THREE from 'three';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import type { HandheldModel } from './handheldModels';

// All measurements are in the shared 1200 × 500 hardware plane. The LCD stays
// fixed; this housing and its controls are independently fitted to the Lite.
const SCREEN = [270, 50, 660, 371.25] as const;
const point = (x: number, y: number, z = 0) => new THREE.Vector3(x - 600, 250 - y, z);
const coord = (x: number, y: number) => [x - 600, 250 - y] as const;

function rectangle(x: number, y: number, width: number, height: number, radius: number) {
  const [left, top] = coord(x, y), right = left + width, bottom = top - height;
  const r = Math.min(radius, width / 2, height / 2), shape = new THREE.Shape();
  shape.moveTo(left + r, top); shape.lineTo(right - r, top);
  shape.quadraticCurveTo(right, top, right, top - r); shape.lineTo(right, bottom + r);
  shape.quadraticCurveTo(right, bottom, right - r, bottom); shape.lineTo(left + r, bottom);
  shape.quadraticCurveTo(left, bottom, left, bottom + r); shape.lineTo(left, top - r);
  shape.quadraticCurveTo(left, top, left + r, top); shape.closePath(); return shape;
}
function perimeter() {
  const shape = new THREE.Shape();
  const move = (x: number, y: number) => shape.moveTo(...coord(x, y));
  const line = (x: number, y: number) => shape.lineTo(...coord(x, y));
  const curve = (a: number, b: number, c: number, d: number, x: number, y: number) =>
    shape.bezierCurveTo(...coord(a, b), ...coord(c, d), ...coord(x, y));
  move(145, 20); line(1055, 20);
  curve(1112, 20, 1144, 49, 1147, 107);
  // Bowed sidewalls and long corner transitions, rather than a tablet rectangle.
  curve(1156, 189, 1156, 311, 1147, 390);
  curve(1144, 449, 1112, 477, 1055, 477); line(145, 477);
  curve(88, 477, 56, 449, 53, 390);
  curve(44, 311, 44, 189, 53, 107);
  curve(56, 49, 88, 20, 145, 20); shape.closePath(); return shape;
}
function openScreen(shape: THREE.Shape, clearance: number) {
  shape.holes.push(rectangle(SCREEN[0] - clearance, SCREEN[1] - clearance,
    SCREEN[2] + clearance * 2, SCREEN[3] + clearance * 2, 0)); return shape;
}
function molded(shape: THREE.Shape, material: THREE.Material, z: number, depth: number, bevel: number) {
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, steps: 1,
    bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel,
    bevelSegments: 6, curveSegments: 40 });
  const mesh = new THREE.Mesh(geometry, material); mesh.position.z = z;
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
function grain() {
  const size = 128, data = new Uint8Array(size * size * 4);
  let seed = 713;
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const shade = 215 + Math.floor(seed / 4294967296 * 40);
    data.set([shade, shade, shade, 255], i * 4);
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(.042, .042);
  texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true; texture.needsUpdate = true; return texture;
}
function materials() {
  const texture = grain();
  const plastic = (color: string, roughness = .61) => new THREE.MeshPhysicalMaterial({
    color, metalness: 0, roughness, roughnessMap: texture, bumpMap: texture, bumpScale: .035,
    clearcoat: .075, clearcoatRoughness: .54, specularIntensity: .72,
  });
  return {
    front: plastic('#00b5b1'), back: plastic('#009894', .7), seam: plastic('#126a69', .76),
    bezel: new THREE.MeshPhysicalMaterial({ color: '#08aaa6', roughness: .36, metalness: 0,
      clearcoat: .18, clearcoatRoughness: .35, specularIntensity: .7 }),
    key: plastic('#dce0db', .54), stick: plastic('#cdd3ce', .62),
    engraving: new THREE.MeshStandardMaterial({ color: '#bac4bf', roughness: .73 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#222c2b', roughness: .83 }),
    recess: new THREE.MeshStandardMaterial({ color: '#215451', roughness: .88 }),
    lens: new THREE.MeshPhysicalMaterial({ color: '#101d1d', roughness: .23,
      metalness: .03, clearcoat: .65, clearcoatRoughness: .15 }),
  };
}
type Materials = ReturnType<typeof materials>;

function crown(x: number, y: number) {
  const lateral = x < 225 ? x : x > 975 ? 1200 - x : 225;
  return 4.2 * Math.sin(Math.PI * THREE.MathUtils.clamp((lateral - 44) / 181, 0, 1)) *
    Math.sin(Math.PI * THREE.MathUtils.clamp((y - 20) / 457, 0, 1));
}
/** Deform with analytic normals, so triangulation cannot produce diagonal creases. */
function curvedFace(mesh: THREE.Mesh, lift: (x: number, y: number) => number,
  lowerZ: number, upperZ: number) {
  const source = mesh.geometry, geometry = new TessellateModifier(15, 13).modify(source);
  const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal'), uv: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const uiX = x + 600, uiY = 250 - y;
    const t = THREE.MathUtils.clamp((z - lowerZ) / (upperZ - lowerZ), 0, 1);
    const blend = t * t * (3 - 2 * t), amount = lift(uiX, uiY);
    p.setZ(i, z + amount * blend);
    const dx = (lift(uiX + .2, uiY) - lift(uiX - .2, uiY)) / .4;
    const dy = -(lift(uiX, uiY + .2) - lift(uiX, uiY - .2)) / .4;
    const derivative = z > lowerZ && z < upperZ ? 6 * t * (1 - t) / (upperZ - lowerZ) : 0;
    const nz = n.getZ(i) / (1 + amount * derivative);
    const normal = new THREE.Vector3(n.getX(i) - dx * blend * nz, n.getY(i) - dy * blend * nz, nz).normalize();
    n.setXYZ(i, normal.x, normal.y, normal.z); uv.push(x, y);
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  mesh.geometry = geometry; source.dispose();
}
function cylinder(radius: number, height: number, material: THREE.Material, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 64), material);
  mesh.rotation.x = Math.PI / 2; mesh.position.copy(point(x, y, z));
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
function lathed(profile: [number, number][], material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r, z]) => new THREE.Vector2(r, z)), 80), material);
  mesh.rotation.x = Math.PI / 2; mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
function stroke(parent: THREE.Group, points: number[][], z: number, material: THREE.Material, radius = .55) {
  for (let i = 1; i < points.length; i++) {
    const a = new THREE.Vector3(points[i - 1][0], points[i - 1][1], z);
    const b = new THREE.Vector3(points[i][0], points[i][1], z), d = b.clone().sub(a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, d.length(), 10), material);
    mesh.position.copy(a.clone().add(b).multiplyScalar(.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); parent.add(mesh);
  }
}
function letter(parent: THREE.Group, symbol: string, z: number, kit: Materials) {
  const s = 5.4;
  const strokes: Record<string, number[][][]> = {
    A: [[[-s, -s], [0, s], [s, -s]], [[-s * .52, -.8], [s * .52, -.8]]],
    B: [[[-s * .6, -s], [-s * .6, s]], [[-s * .6, s], [s * .45, s], [s * .8, s * .45], [s * .35, 0], [-s * .6, 0]], [[-s * .6, 0], [s * .4, 0], [s * .8, -s * .45], [s * .4, -s], [-s * .6, -s]]],
    X: [[[-s, s], [s, -s]], [[s, s], [-s, -s]]],
    Y: [[[-s, s], [0, 0], [s, s]], [[0, 0], [0, -s]]],
  };
  for (const line of strokes[symbol] || []) stroke(parent, line, z, kit.engraving, .5);
}
function cap(parent: THREE.Group, x: number, y: number, radius: number, symbol: string, kit: Materials) {
  const surface = 9 + crown(x, y);
  parent.add(cylinder(radius + 1.3, 1.7, kit.recess, x, y, surface + .4));
  const button = new THREE.Group(); button.position.copy(point(x, y, surface));
  button.name = symbol ? `lite-face-${symbol}` : 'lite-home-key';
  button.add(lathed([[0, .5], [radius - 1, .5], [radius, 1.2], [radius, 4.1],
    [radius - .25, 5.2], [radius - 1, 6], [radius - 2, 6.35], [0, 6.5]], kit.key));
  letter(button, symbol, 6.65, kit); parent.add(button);
  button.userData.pressDepth = 2.3; return button;
}
function joystick(parent: THREE.Group, x: number, y: number, side: 'left' | 'right', kit: Materials) {
  const z = 9 + crown(x, y), radius = 34;
  const socket = cylinder(radius + 2.4, 1.9, kit.recess, x, y, z + .5);
  socket.name = `lite-stick-${side}-socket`; parent.add(socket);
  const stick = new THREE.Group(); stick.position.copy(point(x, y, z)); stick.name = `lite-stick-${side}`;
  stick.add(cylinder(15, 7, kit.rubber, 600, 250, 5));
  // The center rises above the perimeter. The annular channel is cut into the
  // actual cap profile; four cardinal cuts segment its rim without a painted X.
  const profile: [number, number][] = [[0, 5], [15, 5], [27, 7.3], [32, 10.6],
    [34, 13.5], [34, 16.2], [33.6, 18.1], [32.8, 19], [31.7, 19.3],
    [31, 18.9], [30.4, 17.75], [29.7, 17.6], [29, 18.25], [28.3, 19.5],
    [27, 20.05], [25, 20.45], [20, 21.4], [14, 22.2], [7, 22.7], [0, 22.85]];
  const geometry = new THREE.LatheGeometry(profile.map(([r, height]) => new THREE.Vector2(r, height)), 192);
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), radialZ = positions.getZ(i);
    const r = Math.hypot(x, radialZ), crossDistance = Math.min(Math.abs(x), Math.abs(radialZ));
    if (r < 27 || y < 17.5) continue;
    const rim = THREE.MathUtils.smoothstep(r, 27, 29);
    positions.setY(i, y - .9 * rim * Math.exp(-((crossDistance / .6) ** 2)));
  }
  geometry.computeVertexNormals();
  const top = new THREE.Mesh(geometry, kit.stick); top.rotation.x = Math.PI / 2;
  top.name = `lite-stick-${side}-domed-cap`; top.castShadow = top.receiveShadow = true;
  stick.add(top);
  const channel = new THREE.Mesh(new THREE.TorusGeometry(29.7, .18, 8, 192), kit.engraving);
  channel.name = `lite-stick-${side}-ring-channel`; channel.position.z = 17.6;
  stick.add(channel); parent.add(stick); return stick;
}
function cross(half: number, arm: number) {
  const xy = [[-arm, -half], [arm, -half], [arm, -arm], [half, -arm], [half, arm],
    [arm, arm], [arm, half], [-arm, half], [-arm, arm], [-half, arm], [-half, -arm], [-arm, -arm]];
  const shape = new THREE.Shape(), rounding = 2.1;
  const corner = (i: number) => {
    const v = new THREE.Vector2(...xy[i] as [number, number]);
    const prev = new THREE.Vector2(...xy[(i + xy.length - 1) % xy.length] as [number, number]);
    const next = new THREE.Vector2(...xy[(i + 1) % xy.length] as [number, number]);
    return [v.clone().add(prev.sub(v).normalize().multiplyScalar(rounding)), v,
      v.clone().add(next.sub(v).normalize().multiplyScalar(rounding))];
  };
  const first = corner(0)[0]; shape.moveTo(first.x, -first.y);
  for (let i = 0; i < xy.length; i++) {
    const [entry, v, exit] = corner(i);
    if (i) shape.lineTo(entry.x, -entry.y);
    shape.quadraticCurveTo(v.x, -v.y, exit.x, -exit.y);
  }
  shape.closePath(); return shape;
}
function dpad(parent: THREE.Group, kit: Materials, buttons: HandheldModel['buttons']) {
  const x = 140, y = 284, z = 9 + crown(x, y);
  const socket = molded(cross(47.5, 16.2), kit.recess, 0, 1.2, .5);
  socket.position.copy(point(x, y, z + .4)); parent.add(socket);
  const button = new THREE.Group(); button.position.copy(point(x, y, z));
  button.name = 'lite-one-piece-dpad'; button.userData.rocker = true; button.userData.pressDepth = 1;
  const key = molded(cross(45, 14.6), kit.key, .4, 5.4, 1.65);
  // Local cross coordinates use the same normal-preserving deformation routine.
  curvedFace(key, (uiX, uiY) => -1.05 * Math.exp(-((uiX - 600) ** 2 + (uiY - 250) ** 2) / 95), 2, 7.45);
  button.add(key);
  for (let i = 0; i < 4; i++) {
    const arrow = new THREE.Group(); arrow.rotation.z = i * Math.PI / 2;
    stroke(arrow, [[-3, 28], [0, 32], [3, 28]], 7.49, kit.engraving, .38); button.add(arrow);
  }
  parent.add(button);
  for (const direction of ['up', 'down', 'left', 'right'] as const) buttons[direction] = button;
}
function smallKeys(parent: THREE.Group, kit: Materials) {
  // Capture is a square molded key; Home is circular with a shallow house mark.
  const squareX = 186, squareY = 398, squareZ = 9 + crown(squareX, squareY);
  parent.add(molded(rectangle(squareX - 11.5, squareY - 11.5, 23, 23, 3), kit.recess, squareZ, 1, .35));
  const captureKey = molded(rectangle(squareX - 10.1, squareY - 10.1, 20.2, 20.2, 2.6), kit.key, squareZ + .5, 3.2, .8);
  captureKey.name = 'lite-capture-key'; parent.add(captureKey);
  const capture = new THREE.Group(); capture.position.copy(point(squareX, squareY, squareZ + 4.6));
  const captureRing = new THREE.Mesh(new THREE.TorusGeometry(5.4, .45, 8, 48), kit.engraving);
  capture.add(captureRing); parent.add(capture);
  const home = cap(parent, 1019, 387, 13, '', kit);
  stroke(home, [[-5, -.5], [-5, -4.5], [5, -4.5], [5, -.5]], 6.65, kit.engraving, .5);
  stroke(home, [[-6, -.5], [0, 4.8], [6, -.5]], 6.65, kit.engraving, .5);
  stroke(home, [[-1.4, -4.5], [-1.4, -1], [1.4, -1], [1.4, -4.5]], 6.65, kit.engraving, .5);
  // Actual minus bar and plus-shaped caps, with tight molded recesses.
  for (const [x, plus] of [[197, false], [1005, true]] as const) {
    const y = 53, z = 9 + crown(x, y);
    const shape = plus ? cross(8, 2.6) : rectangle(591, 247.7, 18, 4.6, 1.8);
    const socket = molded(shape.clone(), kit.recess, 0, 1, 1);
    socket.position.copy(point(x, y, z + .2)); parent.add(socket);
    const key = molded(shape, kit.key, 0, 2.4, .65);
    key.name = plus ? 'lite-plus-key' : 'lite-minus-key';
    key.position.copy(point(x, y, z + 1)); parent.add(key);
  }
}
function topKeys(parent: THREE.Group, kit: Materials) {
  for (const [index, x] of [287, 326].entries()) {
    const socket = molded(rectangle(x - 1, 5.5, 25, 5.5, 1.2), kit.seam, -13, 5, .5);
    socket.name = `lite-volume-${index === 0 ? 'minus' : 'plus'}-socket`; parent.add(socket);
    const key = molded(rectangle(x, 2.5, 23, 6, 1.7), kit.front, -9, 5, .9);
    key.name = `lite-volume-${index === 0 ? 'minus' : 'plus'}-key`; parent.add(key);
  }
  // Curved shoulder caps follow each upper corner, with their own molded edge.
  for (const side of ['left', 'right'] as const) {
    const shape = new THREE.Shape();
    const xy = (x: number, y: number) => coord(side === 'left' ? x - 4 : 1204 - x, y - 10);
    shape.moveTo(...xy(190, 13)); shape.lineTo(...xy(145, 13));
    shape.bezierCurveTo(...xy(88, 13), ...xy(48, 43), ...xy(43, 85));
    shape.lineTo(...xy(54, 88));
    shape.bezierCurveTo(...xy(65, 49), ...xy(96, 26), ...xy(145, 25));
    shape.lineTo(...xy(190, 25)); shape.closePath();
    const key = molded(shape, kit.key, -15, 7, 1.4);
    key.name = `lite-${side}-shoulder`; parent.add(key);
  }
}

export function createSwitchLiteModel(): HandheldModel {
  const group = new THREE.Group(), kit = materials(), buttons: HandheldModel['buttons'] = {};
  group.name = 'physical-switch'; group.userData.screenRect = [...SCREEN];
  const rear = molded(openScreen(perimeter(), 13), kit.back, -33, 11, 10);
  rear.name = 'rear-housing'; group.add(rear);
  const seam = molded(openScreen(perimeter(), 13), kit.seam, -21.5, .65, 10.2);
  seam.name = 'housing-seam'; group.add(seam);
  const front = molded(openScreen(perimeter(), 15), kit.front, -23, 19, 13);
  curvedFace(front, crown, 19, 32); front.name = 'front-housing'; group.add(front);
  // A flush turquoise faceplate frames the fixed LCD. Only its thin inner gasket is black.
  const bezel = molded(openScreen(rectangle(243, 29, 714, 419, 5), 3.5), kit.bezel, 10, .45, .65);
  bezel.name = 'turquoise-display-faceplate'; group.add(bezel);
  const lens = molded(openScreen(rectangle(267, 47, 666, 377.25, 1.5), .35), kit.lens, 11.3, .45, .35);
  lens.name = 'screen-lens-surround'; group.add(lens);
  const sticks = { left: joystick(group, 140, 123, 'left', kit), right: joystick(group, 1065, 265, 'right', kit) };
  dpad(group, kit, buttons);
  buttons.j = cap(group, 1101, 128, 18, 'A', kit);
  buttons.k = cap(group, 1063, 166, 18, 'B', kit);
  cap(group, 1063, 90, 18, 'X', kit); cap(group, 1025, 128, 18, 'Y', kit);
  smallKeys(group, kit); topKeys(group, kit);
  for (const object of new Set(Object.values(buttons))) if (object) object.userData.restZ = object.position.z;
  return { group, buttons, sticks };
}
