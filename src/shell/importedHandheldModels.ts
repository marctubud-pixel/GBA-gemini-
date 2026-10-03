import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { HandheldModel, ModelControl, ModelDevice } from './handheldModels';

const ASSETS: Partial<Record<ModelDevice, string>> = {
  'steam-deck': '/assets/hardware/steam-deck/deck.glb',
  'ps-portal': '/assets/hardware/ps-portal/portal.glb',
};
// Cache bytes, not live geometries/materials. Every renderer owns and disposes
// its parsed model, including the admin preview and rapid shell changes.
const downloads = new Map<string, Promise<ArrayBuffer>>();
function modelBytes(url: string) {
  let pending = downloads.get(url);
  if (!pending) {
    pending = fetch(url).then(response => {
      if (!response.ok) throw new Error(`Hardware asset HTTP ${response.status}`);
      return response.arrayBuffer();
    }).catch(error => { downloads.delete(url); throw error; });
    downloads.set(url, pending);
  }
  return pending;
}

function grain() {
  const size = 128, pixels = new Uint8Array(size * size * 4);
  let seed = 407;
  for (let i = 0; i < pixels.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const shade = 218 + (seed >>> 27);
    pixels[i] = pixels[i + 1] = pixels[i + 2] = shade; pixels[i + 3] = 255;
  }
  const map = new THREE.DataTexture(pixels, size, size);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  // One texel is about half a UI unit. Authored atlas UVs stretch this into
  // broad patches; physical grain must stay microscopic on every component.
  map.repeat.set(1 / 64, 1 / 64); map.magFilter = THREE.LinearFilter;
  map.minFilter = THREE.LinearMipmapLinearFilter; map.generateMipmaps = true; map.needsUpdate = true;
  return map;
}

function physicalMaterials(group: THREE.Group, device: ModelDevice) {
  const texture = grain();
  const replacements = new Map<string, THREE.MeshPhysicalMaterial>();
  const originals = new Set<THREE.Material>();
  group.updateMatrixWorld(true);
  group.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    // The source Deck contains overlapping closed panels. Let the actual
    // geometry/light falloff define its contours, without back-panel shadows
    // appearing as straight dark blocks on the front casing.
    object.receiveShadow = device !== 'steam-deck';
    const positions = object.geometry.getAttribute('position');
    const uv = [], point = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
      uv.push(point.x, point.y);
    }
    object.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const replace = (source: THREE.Material) => {
      const original = source as THREE.MeshStandardMaterial;
      const role = source.name;
      const lens = role.includes('lens');
      const glyph = role.includes('decal') || role.includes('glyph');
      const well = role.includes('well') || (device === 'steam-deck' && ['deck-part-2-0-13', 'deck-part-2-0-14'].includes(object.name));
      const rubber = role.includes('rubber') && !well;
      const rim = role.includes('buttons-rim');
      const cap = role.startsWith('buttons') && !glyph;
      const darkCap = device === 'ps-portal' && ['buttons-dark', 'buttons-trigger'].includes(role);
      const direction = object.name === 'direction-cross';
      const stem = device === 'steam-deck' && ['deck-part-0-0-2', 'deck-part-0-0-3'].includes(object.name);
      const trackpad = role === 'trackpad';
      const white = role === 'plastic-white';
      const light = role.startsWith('lights');
      const profile = lens ? 'lens' : glyph ? 'glyph' : light ? 'light' : rim ? 'rim' : rubber ? 'rubber' : well ? 'well' : stem ? 'stem' : direction ? 'direction' : darkCap ? 'dark-cap' : cap ? 'cap' : trackpad ? 'trackpad' : white ? 'white' : 'shell';
      const key = `${source.uuid}:${profile}`;
      let result = replacements.get(key);
      if (!result) {
        const color = original.color?.clone() ?? new THREE.Color('#22252a');
        if (white) color.setRGB(.76, .77, .765);
        else if (rubber) color.set(device === 'steam-deck' ? '#343538' : '#24262a');
        else if (well) color.set(device === 'steam-deck' ? '#282a2d' : '#181a20');
        else if (stem) color.set('#5f6265');
        else if (glyph && device === 'ps-portal') color.set('#959ba3');
        else if (rim) color.set('#e2e4e6');
        else if (darkCap) color.set('#181b20');
        else if (cap && device === 'ps-portal') color.set('#d0d3d6');
        else if (device === 'steam-deck' && !lens) color.set(trackpad ? '#303236' : direction ? '#141619' : cap ? '#202226' : '#2d2f32');
        const roughness = lens ? .2 : rim ? .24 : glyph ? .64 : rubber ? .8 : well ? .52 : stem ? .4 : direction ? .32 : darkCap ? .58 : cap ? (device === 'ps-portal' ? .36 : .3) : trackpad ? .76 : white ? .62 : .7;
        result = new THREE.MeshPhysicalMaterial({
          name: role, color, roughness, metalness: 0,
          transparent: original.transparent, opacity: original.opacity,
          emissive: original.emissive?.clone(), emissiveMap: original.emissiveMap,
          emissiveIntensity: original.emissiveIntensity,
          alphaTest: original.alphaTest, side: original.side,
          roughnessMap: lens || glyph || light || rim ? null : texture,
          bumpMap: lens || glyph || light || rim || cap || direction ? null : texture,
          bumpScale: rubber ? .06 : white ? .035 : .045,
          clearcoat: lens ? .65 : rim ? .42 : darkCap ? .025 : cap || direction ? .22 : white ? .015 : rubber ? 0 : .025,
          clearcoatRoughness: lens ? .18 : rim ? .22 : cap ? .3 : .62,
          specularIntensity: rubber ? .38 : white ? .62 : rim ? .85 : .68,
          depthWrite: original.depthWrite,
        });
        // Closed source shells can otherwise cast their interior faces outward.
        result.shadowSide = THREE.FrontSide;
        replacements.set(key, result);
        originals.add(source);
      }
      return result;
    };
    object.material = Array.isArray(object.material) ? object.material.map(replace) : replace(object.material);
  });
  originals.forEach(source => source.dispose());
}

function steamLetter(button: THREE.Object3D, symbol: 'A' | 'B' | 'X' | 'Y', material: THREE.Material) {
  const r = 5.5;
  const strokes: Record<string, number[][][]> = {
    A: [[[-r, -r], [0, r], [r, -r]], [[-r * .5, -1], [r * .5, -1]]],
    B: [[[-r * .7, -r], [-r * .7, r]], [[-r * .7, r], [r * .45, r], [r, r * .5], [r * .5, 0], [-r * .7, 0]], [[-r * .7, 0], [r * .5, 0], [r, -r * .5], [r * .45, -r], [-r * .7, -r]]],
    X: [[[-r, -r], [r, r]], [[-r, r], [r, -r]]],
    Y: [[[-r, r], [0, 0], [r, r]], [[0, 0], [0, -r]]],
  };
  const mesh = button as THREE.Mesh;
  mesh.geometry.computeBoundingBox();
  const depth = (mesh.geometry.boundingBox?.max.z ?? 8) + .15;
  const letters = new THREE.Group(); letters.name = `molded-${symbol}`;
  for (const stroke of strokes[symbol]) for (let i = 1; i < stroke.length; i++) {
    const a = new THREE.Vector3(...stroke[i - 1] as [number, number], depth);
    const b = new THREE.Vector3(...stroke[i] as [number, number], depth);
    const direction = b.clone().sub(a);
    const segment = new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, direction.length(), 8), material);
    segment.position.copy(a.clone().add(b).multiplyScalar(.5));
    segment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    letters.add(segment);
  }
  button.add(letters);
}

function steamDetails(group: THREE.Group) {
  const glyph = new THREE.MeshStandardMaterial({ color: '#b9bdc2', roughness: .67 });
  for (const [name, symbol] of [['button-j', 'A'], ['button-k', 'B'], ['face-X', 'X'], ['face-Y', 'Y']] as const) {
    const object = group.getObjectByName(name); if (object) steamLetter(object, symbol, glyph);
  }
  const shape = new THREE.Shape();
  shape.moveTo(-72, -1); shape.lineTo(72, -1); shape.quadraticCurveTo(75, -1, 75, -4);
  shape.lineTo(75, -10); shape.quadraticCurveTo(75, -13, 72, -13);
  shape.lineTo(-72, -13); shape.quadraticCurveTo(-75, -13, -75, -10);
  shape.lineTo(-75, -4); shape.quadraticCurveTo(-75, -1, -72, -1);
  const slot = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true, bevelSize: .6, bevelThickness: .6, bevelSegments: 2 }),
    new THREE.MeshPhysicalMaterial({ color: '#0b0d0e', roughness: .8 }));
  slot.name = 'volume-slot'; slot.position.set(0, -187, 3); group.add(slot);

  // The source atlas supplied speaker darkness rather than a separate grille.
  // Tiny recessed inserts keep that detail visible under real material lighting.
  const grille = new THREE.MeshPhysicalMaterial({ color: '#07090c', roughness: .92, specularIntensity: .3 });
  const casing = group.getObjectByName('deck-part-2-0-0');
  const probe = new THREE.Raycaster();
  for (const centerX of [201, 999]) for (let row = 0; row < 3; row++) for (let column = 0; column < 4; column++) {
    const x = centerX + (column - 1.5) * 12, y = 371 + row * 9;
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 4.3, 1.4, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .28, bevelEnabled: true, bevelSize: .22, bevelThickness: .18, bevelSegments: 2, curveSegments: 12 }), grille);
    probe.set(new THREE.Vector3(x - 600, 250 - y, 100), new THREE.Vector3(0, 0, -1));
    const hit = casing ? probe.intersectObject(casing)[0] : null;
    hole.position.set(x - 600, 250 - y, (hit?.point.z ?? -1) + .04);
    hole.name = 'speaker-insert'; group.add(hole);
  }
}

export async function loadHandheldAsset(device: ModelDevice): Promise<HandheldModel | null> {
  const url = ASSETS[device];
  if (!url) return null;
  const data = await modelBytes(url);
  const gltf = await new GLTFLoader().parseAsync(data.slice(0), '');
  const group = gltf.scene;
  group.name = `physical-${device}`;
  group.userData.screenRect = [270, 50, 660, 371.25];
  group.userData.importedAsset = url;
  physicalMaterials(group, device);
  const buttons: HandheldModel['buttons'] = {};
  for (const control of ['up', 'down', 'left', 'right', 'j', 'k'] as ModelControl[]) {
    const object = group.getObjectByName(`button-${control}`);
    if (object) buttons[control] = object;
  }
  if (device === 'steam-deck') {
    const cross = group.getObjectByName('direction-cross');
    if (cross) for (const control of ['up', 'down', 'left', 'right'] as const) buttons[control] = cross;
    steamDetails(group);
  }
  return { group, buttons };
}
