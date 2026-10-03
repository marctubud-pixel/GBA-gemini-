import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createHandheldModel } from './handheldModels';
import { loadHandheldAsset } from './importedHandheldModels';

export type HandheldControl = 'left' | 'right' | 'up' | 'down' | 'j' | 'k';
export type HandheldPressedKeys = Record<HandheldControl, boolean>;
export const HANDHELD_DEVICES = {
  switch: { label: 'Switch Lite', swatch: '#00afa9' },
  'steam-deck': { label: 'Steam Deck', swatch: '#61646a' },
  'ps-portal': { label: 'PS Portal', swatch: '#e5e7ed' },
} as const;
export type HandheldDevice = keyof typeof HANDHELD_DEVICES;
type HardwareRect = [number, number, number, number];
interface HardwareLayout {
  controls: Record<HandheldControl, HardwareRect>;
  shortcuts: Record<'info' | 'index', HardwareRect>;
  volume: HardwareRect;
}
// One screen for all three models, independent of their grips and body silhouettes.
export const HANDHELD_SCREEN_RECT: HardwareRect = [270, 50, 660, 371.25];
export const hardwarePosition = (x: number, y: number, width: number, height: number) => ({
  left: `${x / 12}%`, top: `${y / 5}%`, width: `${width / 12}%`, height: `${height / 5}%`,
});
export const HANDHELD_LAYOUTS: Record<HandheldDevice, HardwareLayout> = {
  switch: {
    controls: { up: [126, 241, 28, 28], down: [126, 299, 28, 28], left: [97, 270, 28, 28], right: [155, 270, 28, 28], j: [1083, 110, 36, 36], k: [1045, 148, 36, 36] },
    shortcuts: { info: [175, 387, 22, 22], index: [1006, 374, 26, 26] }, volume: [525, 438, 150, 13],
  },
  'steam-deck': {
    controls: { up: [68, 33, 28, 28], down: [68, 91, 28, 28], left: [39, 62, 28, 28], right: [97, 62, 28, 28], j: [1107, 98, 36, 36], k: [1137, 63, 36, 36] },
    shortcuts: { info: [166, 313, 54, 29], index: [980, 313, 54, 29] }, volume: [525, 438, 150, 13],
  },
  'ps-portal': {
    controls: { up: [103.45, 108.28, 39.84, 47.92], down: [101.43, 170.67, 39.84, 47.92], left: [67.2, 142.32, 47.91, 39.83], right: [129.44, 144.36, 47.92, 39.84], j: [1057.68, 189.57, 39.51, 39.84], k: [1104.13, 143.77, 38.79, 39.26] },
    shortcuts: { info: [163.1, 81.27, 16.44, 28.21], index: [1020.46, 81.27, 16.44, 28.21] }, volume: [525, 438, 150, 13],
  },
};
export const HANDHELD_FALLBACK_LAYOUTS: Record<HandheldDevice, HardwareLayout> = {
  switch: HANDHELD_LAYOUTS.switch,
  'steam-deck': {
    controls: { up: [73, 94, 28, 28], down: [73, 151, 28, 28], left: [44, 123, 28, 28], right: [102, 123, 28, 28], j: [1093, 145, 34, 34], k: [1125, 113, 34, 34] },
    shortcuts: { info: [187, 373, 32, 32], index: [985, 373, 32, 32] }, volume: [525, 438, 150, 13],
  },
  'ps-portal': {
    controls: { up: [118, 101, 28, 28], down: [118, 156, 28, 28], left: [89, 128, 28, 28], right: [147, 128, 28, 28], j: [1051, 160, 38, 38], k: [1085, 126, 38, 38] },
    shortcuts: { info: [208, 79, 24, 24], index: [965, 79, 24, 24] }, volume: [525, 438, 150, 13],
  },
};

type Model = ReturnType<typeof createHandheldModel>;
interface HardwareRuntime {
  scene: THREE.Scene;
  model: Model;
  device: HandheldDevice;
  restPositions: Map<THREE.Object3D, number>;
  dirty: boolean;
}
const restPositions = (model: Model) => new Map(Object.values(model.buttons).filter((object): object is THREE.Object3D => !!object).map(object => [object, object.position.z]));
function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose());
}

export function HandheldHardware({ pressed, device, onAssetReady }: { pressed: HandheldPressedKeys; device: HandheldDevice; onAssetReady?: (device: HandheldDevice, ready: boolean) => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const runtime = useRef<HardwareRuntime | null>(null);
  const input = useRef(pressed); input.current = pressed;
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [renderedDevice, setRenderedDevice] = useState(device);
  const [modelSource, setModelSource] = useState<'native' | 'loading' | 'asset' | 'fallback'>(device === 'switch' ? 'native' : 'loading');

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
    catch { setUnavailable(true); return; }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = .92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.domElement.dataset.handheldCanvas = 'true';
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-600, 600, 250, -250, .1, 2000);
    camera.position.set(0, 0, 1000);
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, .025);
    scene.environment = environment.texture;
    scene.environmentIntensity = .32;
    room.dispose(); pmrem.dispose();
    const hemisphere = new THREE.HemisphereLight(0xeaf1ff, 0x101319, .22);
    scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xfff6e8, .9);
    key.position.set(-460, 560, 700); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -800; key.shadow.camera.right = 800;
    key.shadow.camera.top = 600; key.shadow.camera.bottom = -600;
    key.shadow.camera.near = 10; key.shadow.camera.far = 2000;
    key.shadow.normalBias = .6; key.shadow.bias = -.00008;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8d8ff, .16);
    fill.position.set(500, -100, 600); scene.add(fill);
    // A physical softbox produces a broad reflection and a falloff across the curved grips.
    RectAreaLightUniformsLib.init();
    const softbox = new THREE.RectAreaLight(0xfff5e9, 3.8, 480, 340);
    softbox.position.set(-390, 390, 430); softbox.lookAt(0, 0, 0); scene.add(softbox);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1450, 700), new THREE.ShadowMaterial({ opacity: .12 }));
    ground.position.z = -65; ground.receiveShadow = true; scene.add(ground);
    const model = createHandheldModel(device); scene.add(model.group);
    const state: HardwareRuntime = { scene, model, device, restPositions: restPositions(model), dirty: true };
    runtime.current = state;
    const resize = () => { const box = host.getBoundingClientRect(); renderer.setSize(Math.max(1, box.width), Math.max(1, box.height), false); state.dirty = true; };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const consoleElement = host.closest('.handheld-console');
    const targetLight = new THREE.Vector2(-460, 560);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = (event: Event) => {
      if (reducedMotion || !(event instanceof PointerEvent) || !consoleElement) return;
      const bounds = consoleElement.getBoundingClientRect();
      targetLight.set(-460 + ((event.clientX - bounds.left) / bounds.width - .5) * 220, 560 - ((event.clientY - bounds.top) / bounds.height - .5) * 130);
    };
    const leave = () => targetLight.set(-460, 560);
    consoleElement?.addEventListener('pointermove', pointer);
    consoleElement?.addEventListener('pointerleave', leave);
    let frame = 0, previous = performance.now();
    const draw = (now: number) => {
      const blend = reducedMotion ? 1 : 1 - Math.exp(-Math.min(50, now - previous) / 45); previous = now;
      let moving = false;
      const held = new Map<THREE.Object3D, boolean>();
      for (const [control, object] of Object.entries(state.model.buttons) as [HandheldControl, THREE.Object3D][]) {
        if (object) held.set(object, !!input.current[control] || !!held.get(object));
      }
      let maxDepth = 0;
      for (const [object, down] of held) {
        const rest = state.restPositions.get(object) ?? object.position.z;
        const target = rest - (down ? (object.userData.pressDepth ?? 3.5) : 0);
        if (Math.abs(object.position.z - target) > .01) { object.position.z = THREE.MathUtils.lerp(object.position.z, target, blend); moving = true; }
        maxDepth = Math.max(maxDepth, rest - object.position.z);
        if (object.userData.rocker) {
          const tiltX = ((input.current.down ? 1 : 0) - (input.current.up ? 1 : 0)) * .06;
          const tiltY = ((input.current.right ? 1 : 0) - (input.current.left ? 1 : 0)) * .06;
          if (Math.abs(object.rotation.x - tiltX) + Math.abs(object.rotation.y - tiltY) > .0002) {
            object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, tiltX, blend);
            object.rotation.y = THREE.MathUtils.lerp(object.rotation.y, tiltY, blend); moving = true;
          }
        }
      }
      if (Math.abs(key.position.x - targetLight.x) + Math.abs(key.position.y - targetLight.y) > .1) {
        key.position.x = THREE.MathUtils.lerp(key.position.x, targetLight.x, blend);
        key.position.y = THREE.MathUtils.lerp(key.position.y, targetLight.y, blend); moving = true;
        softbox.position.x = key.position.x + 70;
        softbox.position.y = key.position.y - 170;
        softbox.lookAt(0, 0, 0);
      }
      if (state.dirty || moving) {
        renderer.shadowMap.needsUpdate = true;
        renderer.render(scene, camera);
        renderer.domElement.dataset.buttonDepth = maxDepth.toFixed(2);
        state.dirty = false;
      }
      frame = requestAnimationFrame(draw);
    };
    draw(performance.now()); setReady(true);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      consoleElement?.removeEventListener('pointermove', pointer); consoleElement?.removeEventListener('pointerleave', leave);
      runtime.current = null; disposeObject(scene); environment.dispose(); key.shadow.dispose();
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    const state = runtime.current;
    if (!state) return;
    let cancelled = false;
    const replace = (next: Model) => {
      state.scene.remove(state.model.group); disposeObject(state.model.group);
      state.model = next; state.device = device; state.restPositions = restPositions(next);
      state.scene.add(next.group); state.dirty = true; setRenderedDevice(device);
    };
    if (state.device !== device) replace(createHandheldModel(device));
    onAssetReady?.(device, false);
    setModelSource(device === 'switch' ? 'native' : 'loading');
    if (device !== 'switch') loadHandheldAsset(device).then(next => {
      if (!next) return;
      if (cancelled || runtime.current !== state) { disposeObject(next.group); return; }
      replace(next); setModelSource('asset'); onAssetReady?.(device, true);
    }).catch(() => {
      if (!cancelled && runtime.current === state) setModelSource('fallback');
    });
    return () => { cancelled = true; };
  }, [device, onAssetReady]);

  return <div ref={mount} className="handheld-hardware" aria-hidden="true" data-material="physical-3d"
    data-ready={ready} data-device-rendered={renderedDevice} data-model-source={modelSource} data-handheld-pressed={Object.keys(pressed).filter(key => pressed[key as HandheldControl]).join(' ') || undefined}
    data-render-error={unavailable || undefined}>
    {unavailable && <span className="handheld-render-error">机身外观加载失败，请刷新重试</span>}
  </div>;
}
