import * as THREE from 'three';
import type { HandheldModel, ModelControl } from './handheldModels';

type Input = Record<ModelControl, boolean>;
interface ButtonFeedback {
  object: THREE.Object3D;
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Euler;
  colors: { material: THREE.MeshStandardMaterial; color: THREE.Color }[];
  amount: number;
  wasHeld: boolean;
  holdUntil: number;
  tiltX: number;
  tiltY: number;
}

/** Front-on pressure needs visible cap travel and reflection, as well as Z travel. */
export function createHardwareFeedback(model: HandheldModel, enhanced: boolean) {
  const buttons: ButtonFeedback[] = [];
  const replacedMaterials = new Set<THREE.Material>();
  for (const object of new Set(Object.values(model.buttons))) {
    if (!object) continue;
    const colors: ButtonFeedback['colors'] = [];
    if (enhanced) {
      const copies = new Map<THREE.MeshStandardMaterial, THREE.MeshStandardMaterial>();
      object.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        const unique = (material: THREE.Material) => {
          if (!(material instanceof THREE.MeshStandardMaterial) || /glyph|decal/.test(material.name) || child.parent?.name.startsWith('molded-')) return material;
          let copy = copies.get(material);
          if (!copy) { copy = material.clone(); copies.set(material, copy); replacedMaterials.add(material); colors.push({ material: copy, color: copy.color.clone() }); }
          return copy;
        };
        child.material = Array.isArray(child.material) ? child.material.map(unique) : unique(child.material);
      });
    }
    buttons.push({ object, position: object.position.clone(), scale: object.scale.clone(), rotation: object.rotation.clone(),
      colors, amount: 0, wasHeld: false, holdUntil: 0, tiltX: 0, tiltY: 0 });
  }
  model.group.traverse(object => {
    if (object instanceof THREE.Mesh) for (const material of Array.isArray(object.material) ? object.material : [object.material]) replacedMaterials.delete(material);
  });
  replacedMaterials.forEach(material => material.dispose());
  const sticks = Object.entries(model.sticks ?? {}).filter((entry): entry is ['left' | 'right', THREE.Object3D] => !!entry[1])
    .map(([side, object]) => ({ side, object, position: object.position.clone(), rotation: object.rotation.clone() }));
  return {
    update(input: Input, now: number, dt: number, reducedMotion: boolean, activeStick: 'left' | 'right' | null = 'left') {
      let moving = false, depth = 0, pressure = 0, stickTilt = 0;
      const directionalX = Number(input.right) - Number(input.left);
      const directionalY = Number(input.down) - Number(input.up);
      for (const state of buttons) {
        const held = Object.entries(model.buttons).some(([control, object]) => object === state.object && input[control as ModelControl]);
        if (held && !state.wasHeld) state.holdUntil = now + 130;
        state.wasHeld = held;
        const down = held || now < state.holdUntil;
        const target = down ? 1 : 0;
        const blend = reducedMotion ? 1 : 1 - Math.exp(-dt / (down ? 28 : 65));
        if (Math.abs(state.amount - target) > .001) {
          state.amount = THREE.MathUtils.lerp(state.amount, target, blend); moving = true;
        } else state.amount = target;
        const amount = state.amount;
        const travel = state.object.userData.pressDepth ?? 3.5;
        state.object.position.z = state.position.z - travel * amount;
        // Small front-plane movement makes the depression legible from the fixed camera.
        state.object.position.y = state.position.y - (enhanced ? .9 : 0) * amount;
        state.object.scale.copy(state.scale).multiplyScalar(1 - (enhanced ? (state.object.userData.rocker ? .015 : .04) : 0) * amount);
        for (const { material, color } of state.colors) material.color.copy(color).multiplyScalar(1 - .2 * amount);
        if (state.object.userData.rocker) {
          if (held) { state.tiltX = directionalY; state.tiltY = directionalX; }
          const rotation = enhanced ? .115 : .06;
          state.object.rotation.x = state.rotation.x + state.tiltX * rotation * amount;
          state.object.rotation.y = state.rotation.y + state.tiltY * rotation * amount;
        }
        depth = Math.max(depth, travel * amount); pressure = Math.max(pressure, amount);
      }
      const blend = reducedMotion ? 1 : 1 - Math.exp(-dt / 45);
      for (const { side, object, position, rotation } of sticks) {
        const targetX = rotation.x + (side === activeStick ? directionalY : 0) * .14;
        const targetY = rotation.y + (side === activeStick ? directionalX : 0) * .14;
        if (Math.abs(object.rotation.x - targetX) + Math.abs(object.rotation.y - targetY) > .0002) {
          object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, targetX, blend);
          object.rotation.y = THREE.MathUtils.lerp(object.rotation.y, targetY, blend); moving = true;
        }
        object.position.x = position.x + (object.rotation.y - rotation.y) * 14;
        object.position.y = position.y - (object.rotation.x - rotation.x) * 14;
        stickTilt = Math.max(stickTilt, Math.abs(object.rotation.x - rotation.x), Math.abs(object.rotation.y - rotation.y));
      }
      return { moving, depth, pressure, stickTilt };
    },
  };
}
