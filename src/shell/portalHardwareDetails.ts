import * as THREE from 'three';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { discardHandheldParts } from './steamDeckControls';

const point = (x: number, y: number, z = 0) => new THREE.Vector3(x - 600, 250 - y, z);
const mirrorX = (x: number, side: 'left' | 'right') => side === 'left' ? x : 1200 - x;

// A Portal face follows the analog well. The donor DualSense's long diagonal
// white seam is a different silhouette and must not be carried over unchanged.
function panelShape(side: 'left' | 'right') {
  const shape = new THREE.Shape();
  const xy = (x: number, y: number) => [mirrorX(x, side) - 600, 250 - y] as const;
  shape.moveTo(...xy(83, 61));
  shape.bezierCurveTo(...xy(110, 55), ...xy(162, 49), ...xy(190, 59));
  shape.bezierCurveTo(...xy(199, 87), ...xy(204, 120), ...xy(213, 157));
  shape.bezierCurveTo(...xy(220, 182), ...xy(214, 192), ...xy(198, 205));
  shape.bezierCurveTo(...xy(176, 224), ...xy(173, 244), ...xy(179, 263));
  shape.bezierCurveTo(...xy(183, 278), ...xy(175, 295), ...xy(168, 311));
  shape.lineTo(...xy(112, 438));
  shape.quadraticCurveTo(...xy(108, 449), ...xy(94, 453));
  shape.bezierCurveTo(...xy(74, 460), ...xy(63, 457), ...xy(48, 451));
  shape.bezierCurveTo(...xy(16, 438), ...xy(3, 401), ...xy(5, 342));
  shape.bezierCurveTo(...xy(5, 253), ...xy(22, 151), ...xy(64, 77));
  shape.quadraticCurveTo(...xy(71, 64), ...xy(83, 61));
  shape.closePath(); return shape;
}
function panelCrown(x: number, y: number, side: 'left' | 'right') {
  const u = side === 'left' ? x : 1200 - x;
  return 6.8 * Math.sin(Math.PI * THREE.MathUtils.clamp(u / 222, 0, 1)) *
    Math.sin(Math.PI * THREE.MathUtils.clamp((y - 48) / 425, 0, 1));
}
function whitePanel(side: 'left' | 'right', material: THREE.Material) {
  const source = new THREE.ExtrudeGeometry(panelShape(side), { depth: 39,
    bevelEnabled: true, bevelSize: 3.2, bevelThickness: 3.2, bevelSegments: 6, curveSegments: 40 });
  const geometry = new TessellateModifier(12, 12).modify(source); source.dispose();
  const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal'), uv: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), u = x + 600, v = 250 - y;
    const t = THREE.MathUtils.clamp((z - 32) / 10.2, 0, 1), blend = t * t * (3 - 2 * t);
    const height = panelCrown(u, v, side);
    const dx = (panelCrown(u + .2, v, side) - panelCrown(u - .2, v, side)) / .4;
    const dy = -(panelCrown(u, v + .2, side) - panelCrown(u, v - .2, side)) / .4;
    const derivative = z > 32 && z < 42.2 ? 6 * t * (1 - t) / 10.2 : 0;
    const nz = n.getZ(i) / (1 + height * derivative);
    const normal = new THREE.Vector3(n.getX(i) - dx * blend * nz, n.getY(i) - dy * blend * nz, nz).normalize();
    p.setZ(i, z + height * blend); n.setXYZ(i, normal.x, normal.y, normal.z); uv.push(x, y);
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const mesh = new THREE.Mesh(geometry, material); mesh.position.z = -23;
  mesh.name = `portal-${side}-white-face`; mesh.castShadow = mesh.receiveShadow = true; return mesh;
}
function insetButton(parent: THREE.Group, name: string, x: number, y: number, material: THREE.Material) {
  const shape = new THREE.Shape(); shape.absellipse(0, 0, 12.5, 11, 0, Math.PI * 2, false, 0);
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 1.7, bevelEnabled: true,
    bevelSize: .9, bevelThickness: .7, bevelSegments: 4, curveSegments: 32 }), material);
  mesh.name = name; mesh.position.copy(point(x, y, 14)); mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
}
function stroke(parent: THREE.Object3D, points: number[][], material: THREE.Material, radius: number, z = 17) {
  for (let i = 1; i < points.length; i++) {
    const a = new THREE.Vector3(points[i - 1][0], points[i - 1][1], z), b = new THREE.Vector3(points[i][0], points[i][1], z);
    const d = b.clone().sub(a), mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, d.length(), 10), material);
    mesh.position.copy(a.clone().add(b).multiplyScalar(.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); parent.add(mesh);
  }
}

function bridgeDetails(group: THREE.Group, material: THREE.Material) {
  // Slightly sweep the upper donor shell into the screen carrier. Retain its
  // real lower grip surfaces; only the short upper neck needs this correction.
  for (const side of ['left', 'right'] as const) {
    const root = group.getObjectByName(`grip-${side}`);
    root?.traverse(object => {
      if (!(object instanceof THREE.Mesh) || !['back-shell', 'black-front-shell', 'new-cut-cap'].includes(object.userData.part)) return;
      const p = object.geometry.getAttribute('position'), n = object.geometry.getAttribute('normal');
      const offset = (x: number, y: number) => {
        const u = 600 - Math.abs(x), v = 250 - y;
        const top = 60 - 26 * THREE.MathUtils.smoothstep(u, 185, 255);
        return (top - 50) * THREE.MathUtils.smoothstep(u, 170, 185) * (1 - THREE.MathUtils.smoothstep(v, 50, 100));
      };
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), amount = offset(x, y);
        if (!amount) continue;
        const dx = (offset(x + .1, y) - offset(x - .1, y)) / .2;
        const dy = (offset(x, y + .1) - offset(x, y - .1)) / .2;
        const ny = n.getY(i) / (1 - dy);
        const normal = new THREE.Vector3(n.getX(i) + dx * ny, ny, n.getZ(i)).normalize();
        p.setY(i, y - amount); n.setXYZ(i, normal.x, normal.y, normal.z);
      }
      p.needsUpdate = n.needsUpdate = true; object.geometry.computeBoundingBox(); object.geometry.computeBoundingSphere();
    });
  }
  const glyph = new THREE.MeshPhysicalMaterial({ color: '#646b77', roughness: .52, specularIntensity: .5 });
  const left = insetButton(group, 'portal-screen-side-left-key', 236, 102, material);
  const ps = new THREE.Group(); ps.position.copy(point(236, 102, 0)); ps.name = 'portal-molded-ps-mark';
  stroke(ps, [[-3.5, -5], [-3.5, 6], [1, 6], [4, 3.5], [3, .5], [.2, .5]], glyph, .65);
  stroke(ps, [[-3.5, -4], [-8, -2], [-4, 0]], glyph, .65);
  stroke(ps, [[-.5, -3], [6, -.5], [8, -2], [0, -5], [-3.5, -5]], glyph, .65);
  group.add(ps);
  const right = insetButton(group, 'portal-screen-side-right-key', 964, 102, material);
  const mute = new THREE.Group(); mute.position.copy(point(964, 102, 0)); mute.name = 'portal-molded-mute-mark';
  stroke(mute, [[-3, 1], [-3, 5], [0, 7], [3, 5], [3, 1], [0, -1], [-3, 1]], glyph, .5);
  stroke(mute, [[-5, 2], [-5, -1], [0, -4], [5, -1], [5, 2]], glyph, .5);
  stroke(mute, [[0, -4], [0, -6]], glyph, .5);
  stroke(mute, [[-7, -6], [7, -6]], glyph, .5); group.add(mute);
  // Short molded marks on the white control keys match the reference face.
  for (const [side, keyName] of [['left', 'button-info'], ['right', 'button-index']] as const) {
    const key = group.getObjectByName(keyName); if (!key) continue;
    const mark = new THREE.Group(); mark.position.copy(key.position); mark.name = `portal-${side}-shortcut-mark`;
    for (let i = 0; i < 3; i++) stroke(mark, [[-3.2, 16 + i * 2.4], [3.2, 16 + i * 2.4]], glyph, .34, 2.8);
    group.add(mark);
  }
  left.userData.detailOnly = true; right.userData.detailOnly = true;
}

function lightGuide(group: THREE.Group, side: 'left' | 'right') {
  const outline = panelShape(side), edge = new THREE.CurvePath<THREE.Vector2>();
  for (const curve of outline.curves.slice(1, 5)) edge.add(curve);
  const raw = edge.getSpacedPoints(100);
  // Stop shortly below the analog well; the lower white grip stays clean.
  for (let i = 1; i <= 15; i++) raw.push(outline.curves[5].getPoint(i / 15 * 30 / 127));
  const probe = new THREE.Raycaster(); group.updateMatrixWorld(true);
  const samples = raw.map(p2 => {
    const p = new THREE.Vector3(p2.x + (side === 'left' ? 1.3 : -1.3), p2.y, 0);
    // Find the rounded front edge. Offset to the dark side, rather than drawing
    // a diagonal across the white face or continuing through a button hole.
    probe.set(new THREE.Vector3(p.x, p.y, 100), new THREE.Vector3(0, 0, -1));
    p.z = (probe.intersectObject(group, true)[0]?.point.z ?? 11) + .4;
    return p;
  });
  const material = new THREE.MeshPhysicalMaterial({ name: 'portal-blue-seam', color: '#397ef7',
    emissive: '#1645bf', emissiveIntensity: .4, roughness: .36, clearcoat: .16, specularIntensity: .62 });
  const guide = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(samples), 120, .72, 10), material);
  guide.name = `portal-${side}-analog-seam-light`; group.add(guide);
}

function shoulders(group: THREE.Group) {
  discardHandheldParts(group, ['control-l1', 'control-r1', 'control-l2', 'control-r2']);
  const material = new THREE.MeshPhysicalMaterial({ color: '#242932', roughness: .65, clearcoat: .06, specularIntensity: .62 });
  for (const side of ['left', 'right'] as const) {
    const xy = (x: number, y: number) => [mirrorX(x, side) - 600, 250 - y] as const;
    const shape = new THREE.Shape(); shape.moveTo(...xy(87, 57));
    shape.bezierCurveTo(...xy(115, 49), ...xy(154, 44), ...xy(169, 49));
    shape.lineTo(...xy(171, 61));
    shape.bezierCurveTo(...xy(142, 60), ...xy(115, 65), ...xy(86, 74)); shape.closePath();
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 12, bevelEnabled: true,
      bevelSize: 1.5, bevelThickness: 1.5, bevelSegments: 5, curveSegments: 32 }), material);
    mesh.position.z = -7; mesh.name = `portal-${side}-shoulder`; mesh.castShadow = mesh.receiveShadow = true; group.add(mesh);
  }
}

function directionalTriangles(group: THREE.Group) {
  const glyph = new THREE.MeshPhysicalMaterial({ color: '#9b9fa4', roughness: .61, specularIntensity: .5 });
  for (const [direction, rotation] of [['up', 0], ['left', Math.PI / 2], ['down', Math.PI], ['right', -Math.PI / 2]] as const) {
    const key = group.getObjectByName(`button-${direction}`); if (!key) continue;
    discardHandheldParts(group, [`molded-ps-${direction}`]);
    const shape = new THREE.Shape(); shape.moveTo(-5.6, -3.2); shape.lineTo(0, 5.2); shape.lineTo(5.6, -3.2); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .35, bevelEnabled: true,
      bevelSize: .15, bevelThickness: .12, bevelSegments: 2 });
    const triangle = new THREE.Mesh(geometry, glyph); triangle.rotation.z = rotation;
    group.updateMatrixWorld(true);
    const origin = key.getWorldPosition(new THREE.Vector3());
    const probe = new THREE.Raycaster(new THREE.Vector3(origin.x, origin.y, 100), new THREE.Vector3(0, 0, -1));
    const surface = probe.intersectObject(key, true)[0];
    triangle.position.z = (surface?.point.z ?? origin.z + 11) - origin.z + .05;
    triangle.name = `portal-solid-triangle-${direction}`; triangle.castShadow = true; key.add(triangle);
  }
}

export function refinePortalHardware(group: THREE.Group) {
  const donorWhite = group.getObjectByName('left-white-shell-left__Object_10_0') as THREE.Mesh;
  const white = (donorWhite.material as THREE.MeshPhysicalMaterial).clone();
  white.name = 'portal-white-face'; white.roughness = .6; white.clearcoat = .025;
  discardHandheldParts(group, ['left-white-shell-left__Object_10_0', 'right-white-shell-right__Object_10_1',
    'seam-light-guide-left', 'seam-light-guide-right']);
  for (const side of ['left', 'right'] as const) {
    group.add(whitePanel(side, white));
    const stick = group.getObjectByName(`control-${side}-stick`);
    const well = group.getObjectByName(side === 'left' ? 'left-left-stick-well__Object_14_1' : 'right-right-stick-well__Object_14_0');
    if (stick) stick.position.z += 4;
    if (well) well.position.z += 4;
  }
  // Seat the controls above the new front skin, retaining actual travel rather
  // than letting the donor's rear shell bleed through the white face.
  for (const name of ['button-up', 'button-down', 'button-left', 'button-right',
    'button-j', 'button-k', 'button-info', 'button-index', 'control-triangle', 'control-square']) {
    const key = group.getObjectByName(name); if (key) key.position.z += 8;
  }
  for (const name of ['button-j', 'button-k', 'control-triangle', 'control-square']) {
    const key = group.getObjectByName(name); if (!key) continue;
    key.scale.set(1.2, 1.2, 1);
    for (const child of key.children) if (child.name.startsWith('molded-ps-')) child.scale.set(1.4, 1.4, 1);
  }
  directionalTriangles(group);
  const bridge = new THREE.MeshPhysicalMaterial({ color: '#20252d', roughness: .54, clearcoat: .08, specularIntensity: .62 });
  bridgeDetails(group, bridge); shoulders(group); group.updateMatrixWorld(true);
  for (const side of ['left', 'right'] as const) lightGuide(group, side);
}
