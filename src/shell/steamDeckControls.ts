import * as THREE from 'three';
import type { HandheldModel } from './handheldModels';

// Controls stay in the shared screen's coordinate plane. The source housing
// can be widened, but a circular control must never inherit that XY stretch.
export const STEAM_CONTROL_CENTERS = {
  dpad: [90, 86], leftStick: [178, 101], rightStick: [1022, 101],
  A: [1110, 114], B: [1137, 87], X: [1083, 87], Y: [1110, 60],
} as const;

function revolved(profile: number[][], material: THREE.Material) {
  const geometry = new THREE.LatheGeometry(profile.map(([radius, z]) => new THREE.Vector2(radius, z)), 96);
  geometry.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

export function discardHandheldParts(group: THREE.Group, names: string[]) {
  const removedMaterials = new Set<THREE.Material>();
  for (const name of names) {
    const part = group.getObjectByName(name);
    if (!part) continue;
    part.removeFromParent();
    part.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) removedMaterials.add(material);
    });
  }
  group.traverse(object => {
    if (object instanceof THREE.Mesh) for (const material of Array.isArray(object.material) ? object.material : [object.material]) removedMaterials.delete(material);
  });
  removedMaterials.forEach(material => material.dispose());
}

export function calibrateSteamControls(group: THREE.Group) {
  const buttons: HandheldModel['buttons'] = {};
  const sticks: NonNullable<HandheldModel['sticks']> = {};
  discardHandheldParts(group, ['deck-part-0-0-3', 'deck-part-0-0-2',
    'deck-part-2-0-8', 'deck-part-2-0-7', 'deck-part-2-0-14', 'deck-part-2-0-13',
    'button-j', 'button-k', 'face-X', 'face-Y']);

  const well = new THREE.MeshPhysicalMaterial({ name: 'stick-well', color: '#15171a', roughness: .58, specularIntensity: .48 });
  const rim = new THREE.MeshPhysicalMaterial({ name: 'stick-socket-rim', color: '#35373a', roughness: .5, specularIntensity: .55 });
  const stem = new THREE.MeshPhysicalMaterial({ name: 'stick-stem', color: '#55585b', roughness: .42, specularIntensity: .65 });
  const rubber = new THREE.MeshPhysicalMaterial({ name: 'stick-rubber', color: '#303236', roughness: .8, specularIntensity: .4 });
  for (const side of ['left', 'right'] as const) {
    const [x, y] = STEAM_CONTROL_CENTERS[side === 'left' ? 'leftStick' : 'rightStick'];
    const socket = revolved([[0, -.2], [43, -.2], [44, .3], [44, 1.1], [43, 2.1], [39, 2.2], [32, .8], [0, .6]], well);
    socket.name = `stick-${side}-socket`; socket.position.set(x - 600, 250 - y, 0); group.add(socket);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(43.2, .6, 8, 96), rim);
    lip.position.set(x - 600, 250 - y, 1.8); lip.name = `stick-${side}-rim`; group.add(lip);
    const moving = new THREE.Group(); moving.name = `control-${side}-stick`;
    moving.position.set(x - 600, 250 - y, 2);
    moving.add(revolved([[0, 0], [11, 0], [12, 1], [12, 9], [11, 10], [0, 10]], stem));
    const cap = revolved([[0, 7.5], [18, 7.5], [26, 9], [29.2, 11], [29.5, 13],
      [29.1, 15.5], [27.8, 16.5], [26.2, 16.6], [24.8, 16], [22.5, 14.8], [17, 13.5], [0, 13.2]], rubber);
    cap.name = `stick-${side}-cap`; moving.add(cap);
    // Fine molded grip rings follow the circular cap instead of a coarse polygon.
    for (const radius of [26.6, 28]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .3, 6, 96), rubber);
      ring.position.z = 16.45; moving.add(ring);
    }
    group.add(moving); sticks[side] = moving;
  }

  const cross = group.getObjectByName('direction-cross');
  if (cross instanceof THREE.Mesh) {
    cross.geometry.computeBoundingBox();
    const size = cross.geometry.boundingBox!.getSize(new THREE.Vector3());
    cross.scale.x = 78 / size.x; cross.scale.y = 78 / size.y;
    cross.position.set(STEAM_CONTROL_CENTERS.dpad[0] - 600, 250 - STEAM_CONTROL_CENTERS.dpad[1], -.1);
    cross.userData.rocker = true; cross.userData.pressDepth = 2.6;
    for (const control of ['up', 'down', 'left', 'right'] as const) buttons[control] = cross;
  }
  const capMaterial = new THREE.MeshPhysicalMaterial({ name: 'buttons-cap', color: '#181b20', roughness: .27,
    clearcoat: .3, clearcoatRoughness: .25, specularIntensity: .72 });
  for (const symbol of ['A', 'B', 'X', 'Y'] as const) {
    const [x, y] = STEAM_CONTROL_CENTERS[symbol];
    const socket = revolved([[0, -.6], [18.4, -.6], [19, -.2], [19, .8], [18, 1.4], [0, 1.4]], well);
    socket.position.set(x - 600, 250 - y, 0); group.add(socket);
    const cap = revolved([[0, 0], [15.4, 0], [16.5, 1], [16.8, 5.8], [16.5, 7.6], [15.3, 8.8], [11, 9.1], [0, 9.2]], capMaterial);
    cap.position.set(x - 600, 250 - y, 1.7);
    cap.name = symbol === 'A' ? 'button-j' : symbol === 'B' ? 'button-k' : `face-${symbol}`;
    cap.userData.pressDepth = 3.4; group.add(cap);
    if (symbol === 'A') buttons.j = cap;
    if (symbol === 'B') buttons.k = cap;
  }
  return { buttons, sticks };
}
