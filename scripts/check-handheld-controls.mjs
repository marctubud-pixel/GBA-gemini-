import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import * as THREE from 'three';

const root = path.resolve(import.meta.dirname, '..');
const temporary = path.join(root, 'node_modules/.handheld-controls-check.mjs');
await build({ stdin: { contents: `export { loadHandheldAsset } from './src/shell/importedHandheldModels';
export { createSwitchLiteModel } from './src/shell/switchLiteModel';
export { createHardwareFeedback } from './src/shell/handheldFeedback';
export { HANDHELD_LAYOUTS, HANDHELD_SCREEN_RECT } from './src/shell/HandheldHardware';`, resolveDir: root, loader: 'ts' },
  bundle: true, format: 'esm', platform: 'node', packages: 'external', outfile: temporary });
const actualFetch = globalThis.fetch;
globalThis.fetch = async url => {
  const bytes = await fs.readFile(path.join(root, 'public', String(url)));
  return new Response(bytes);
};
const checks = [];
const check = (label, fn) => { fn(); checks.push(label); };
const empty = () => ({ left: false, right: false, up: false, down: false, j: false, k: false });
try {
  const { loadHandheldAsset, createSwitchLiteModel, createHardwareFeedback, HANDHELD_LAYOUTS, HANDHELD_SCREEN_RECT } = await import(pathToFileURL(temporary));
  check('The common 16:9 viewport stays full size', () => assert.deepEqual(HANDHELD_SCREEN_RECT, [270, 50, 660, 371.25]));
  const lite = createSwitchLiteModel(); lite.group.updateMatrixWorld(true);
  const probeAt = (x, y, object) => new THREE.Raycaster(new THREE.Vector3(x, y, 200), new THREE.Vector3(0, 0, -1)).intersectObject(object, true);
  check('Lite: same full-size LCD aperture and metadata', () => {
    assert.deepEqual(lite.group.userData.screenRect, HANDHELD_SCREEN_RECT);
    for (const [x, y] of [[270.1, 50.1], [929.9, 50.1], [270.1, 421.15], [929.9, 421.15], [600, 235]]) {
      assert.equal(probeAt(x - 600, 250 - y, lite.group).length, 0);
    }
  });
  check('Lite: smaller faceplate with a continuous frame beside the LCD', () => {
    const plate = lite.group.getObjectByName('turquoise-display-faceplate');
    assert.ok(new THREE.Box3().setFromObject(plate).getSize(new THREE.Vector3()).x < 720);
    for (const [x, y] of [[250, 240], [950, 240], [600, 35], [600, 440]]) {
      assert.ok(probeAt(x - 600, 250 - y, plate).length);
    }
  });
  check('Lite: unwanted lower corner holes removed', () => assert.ok(!lite.group.getObjectByName('lite-speaker-slot')));
  for (const key of ['lite-volume-minus-key', 'lite-volume-plus-key']) check(`Lite: ${key} protrudes above the shell silhouette`, () => {
    const box = new THREE.Box3().setFromObject(lite.group.getObjectByName(key));
    const shell = new THREE.Box3().setFromObject(lite.group.getObjectByName('front-housing'));
    assert.ok(box.max.y > shell.max.y + 3 && box.getSize(new THREE.Vector3()).z > 5);
  });
  for (const side of ['left', 'right']) {
    const stick = lite.sticks[side], cap = lite.group.getObjectByName(`lite-stick-${side}-domed-cap`);
    const origin = stick.getWorldPosition(new THREE.Vector3());
    const topAt = (r, angle = 0) => probeAt(origin.x + r * Math.cos(angle), origin.y + r * Math.sin(angle), cap)[0]?.point.z;
    check(`Lite ${side} analog: dome center is visibly above the outer shoulder`, () => assert.ok(topAt(.1) > topAt(32.8, Math.PI / 4) + 3));
    check(`Lite ${side} analog: outer ring is an actual recessed channel`, () => assert.ok(topAt(29.7, Math.PI / 4) < topAt(27, Math.PI / 4) - 2));
    check(`Lite ${side} analog: four cardinal rim grooves are recessed`, () => {
      const uncut = topAt(32.8, Math.PI / 4);
      for (let i = 0; i < 4; i++) assert.ok(topAt(32.8, i * Math.PI / 2) < uncut - .7);
    });
    check(`Lite ${side} analog: round cap with no unequal scaling`, () => {
      const size = new THREE.Box3().setFromObject(cap).getSize(new THREE.Vector3());
      assert.ok(Math.abs(size.x - size.y) < .001);
    });
    check(`Lite ${side}: curved white shoulder is visible outside the shell`, () => {
      const box = new THREE.Box3().setFromObject(lite.group.getObjectByName(`lite-${side}-shoulder`));
      assert.ok(box.max.y > 246 && box.getSize(new THREE.Vector3()).y > 70);
    });
  }
  for (const [control, [x, y, w, h]] of Object.entries(HANDHELD_LAYOUTS.switch.controls)) check(`Lite: ${control} touch center hits its key`, () => {
    assert.ok(probeAt(x + w / 2 - 600, 250 - y - h / 2, lite.buttons[control]).length);
  });
  const liteFeedback = createHardwareFeedback(lite, false);
  const liteJRest = lite.buttons.j.position.z;
  let litePress;
  for (let frame = 0; frame < 9; frame++) litePress = liteFeedback.update({ ...empty(), j: frame === 0 }, frame * 16, 16, false);
  check('Lite: quick face-button tap produces physical depression', () => assert.ok(litePress.pressure > .95 && liteJRest - lite.buttons.j.position.z > 2));
  for (let frame = 9; frame < 60; frame++) liteFeedback.update(empty(), frame * 16, 16, false);
  check('Lite: face-button cap returns after release', () => assert.ok(Math.abs(lite.buttons.j.position.z - liteJRest) < .001));
  for (let frame = 0; frame < 12; frame++) liteFeedback.update({ ...empty(), up: true }, 2000 + frame * 16, 16, false);
  check('Lite: one-piece D-pad rocks in the pressed direction', () => assert.ok(Math.abs(lite.buttons.up.rotation.x) > .055));
  for (let frame = 0; frame < 60; frame++) liteFeedback.update(empty(), 2200 + frame * 16, 16, false);
  for (const side of ['left', 'right']) {
    for (let frame = 0; frame < 12; frame++) liteFeedback.update({ ...empty(), right: true }, 3000 + frame * 16, 16, false, side);
    check(`Lite: ${side} stick can tilt without moving the other stick`, () => {
      assert.ok(lite.sticks[side].rotation.y > .13);
      assert.ok(Math.abs(lite.sticks[side === 'left' ? 'right' : 'left'].rotation.y) < .001);
    });
    for (let frame = 0; frame < 60; frame++) liteFeedback.update(empty(), 3200 + frame * 16, 16, false, side);
    check(`Lite: ${side} stick springs back after release`, () => assert.ok(Math.abs(lite.sticks[side].rotation.y) < .001));
  }
  for (const device of ['steam-deck', 'ps-portal']) {
    const model = await loadHandheldAsset(device);
    model.group.updateMatrixWorld(true);
    check(`${device}: no lower-center volume slot`, () => assert.ok(!model.group.getObjectByName('volume-slot') && !model.group.getObjectByName('volume-channel')));
    for (const [control, rect] of Object.entries(HANDHELD_LAYOUTS[device].controls)) {
      const [x, y, w, h] = rect;
      const probe = new THREE.Raycaster(new THREE.Vector3(x + w / 2 - 600, 250 - y - h / 2, 200), new THREE.Vector3(0, 0, -1));
      check(`${device}: ${control} touch center hits its key`, () => assert.ok(probe.intersectObject(model.buttons[control], true).length));
    }
    if (device === 'steam-deck') {
      for (const side of ['left', 'right']) {
        for (const part of ['socket', 'cap']) {
          const object = model.group.getObjectByName(`stick-${side}-${part}`);
          const size = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
          check(`Deck ${side} ${part}: equal horizontal and vertical diameter`, () => assert.ok(Math.abs(size.x - size.y) < .001));
          check(`Deck ${side} ${part}: smooth 96-segment rotation`, () => assert.equal(object.geometry.parameters.segments, 96));
        }
      }
      const A = model.group.getObjectByName('button-j'), B = model.group.getObjectByName('button-k');
      const X = model.group.getObjectByName('face-X'), Y = model.group.getObjectByName('face-Y');
      check('Deck ABXY: Y top, X left, B right, A bottom', () => assert.ok(Y.position.y > X.position.y && A.position.y < X.position.y && X.position.x < Y.position.x && B.position.x > Y.position.x));
      check('Deck ABXY: same round cap geometry for all four keys', () => {
        const sizes = [A, B, X, Y].map(object => new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3()));
        for (const size of sizes) { assert.ok(Math.abs(size.x - size.y) < .001); assert.ok(Math.abs(size.x - sizes[0].x) < .001); }
      });
      check('Deck cross: balanced horizontal and vertical extent', () => {
        const size = new THREE.Box3().setFromObject(model.buttons.up).getSize(new THREE.Vector3());
        assert.ok(Math.abs(size.x - size.y) < .001);
      });
      check('Deck face buttons: at least 14 units of visible space between sockets', () => {
        for (const [a, b] of [['A', 'X'], ['X', 'Y'], ['Y', 'B'], ['B', 'A']]) {
          const first = model.group.getObjectByName(`face-${a}-socket`), second = model.group.getObjectByName(`face-${b}-socket`);
          const size = new THREE.Box3().setFromObject(first).getSize(new THREE.Vector3());
          assert.ok(first.position.distanceTo(second.position) - size.x > 14);
        }
      });
      check('Deck X button and right analog: no crowded or touching sockets', () => {
        const button = model.group.getObjectByName('face-X-socket'), stick = model.group.getObjectByName('stick-right-socket');
        const radius = (new THREE.Box3().setFromObject(button).getSize(new THREE.Vector3()).x + new THREE.Box3().setFromObject(stick).getSize(new THREE.Vector3()).x) / 2;
        assert.ok(Math.hypot(button.position.x - stick.position.x, button.position.y - stick.position.y) - radius > 14);
      });
      check('Deck D-pad and left analog: a clear gap remains', () => {
        const cross = new THREE.Box3().setFromObject(model.buttons.up), stick = new THREE.Box3().setFromObject(model.group.getObjectByName('stick-left-socket'));
        assert.ok(stick.min.x - cross.max.x > 20);
      });
      for (const side of ['left', 'right']) check(`Deck ${side} grip joint: full lower contour stays outside the viewport`, () => {
        const box = new THREE.Box3().setFromObject(model.group.getObjectByName(`grip-${side}-joint`));
        assert.ok(box.max.y - box.min.y > 290);
        assert.ok(side === 'left' ? box.max.x < -330 : box.min.x > 330);
        assert.ok(model.group.getObjectByName(`grip-${side}-joint-shoulder`));
      });
      check('Deck left and right structural joints mirror each other', () => {
        const left = new THREE.Box3().setFromObject(model.group.getObjectByName('grip-left-joint'));
        const right = new THREE.Box3().setFromObject(model.group.getObjectByName('grip-right-joint'));
        assert.ok(Math.abs(left.max.x + right.min.x) < .02 && Math.abs(left.min.x + right.max.x) < .02);
      });

    }
    const feedback = createHardwareFeedback(model, true);
    const j = model.buttons.j, restPosition = j.position.clone(), restScale = j.scale.clone();
    const untouched = model.buttons.k.position.clone();
    let result;
    for (let frame = 0; frame < 9; frame++) result = feedback.update({ ...empty(), j: frame === 0 }, frame * 16, 16, false);
    check(`${device}: a quick tap retains visible depression`, () => assert.ok(result.pressure > .95 && result.depth > 2));
    check(`${device}: front-on feedback includes cap contraction and travel`, () => assert.ok(j.scale.x < restScale.x * .97 && j.position.y < restPosition.y - .7));
    check(`${device}: unpressed adjacent cap stays still`, () => assert.deepEqual(model.buttons.k.position.toArray(), untouched.toArray()));
    for (let frame = 9; frame < 60; frame++) result = feedback.update(empty(), frame * 16, 16, false);
    check(`${device}: released key returns to its rest transform`, () => { assert.ok(j.position.distanceTo(restPosition) < .001); assert.ok(j.scale.distanceTo(restScale) < .001); });
    for (const side of ['left', 'right']) {
      for (let frame = 0; frame < 12; frame++) result = feedback.update({ ...empty(), right: true }, 1000 + frame * 16, 16, false, side);
      check(`${device}: ${side} analog tilts independently`, () => {
        assert.ok(model.sticks[side].rotation.y > .13);
        assert.ok(Math.abs(model.sticks[side === 'left' ? 'right' : 'left'].rotation.y) < .001);
      });
      for (let frame = 0; frame < 60; frame++) result = feedback.update(empty(), 1200 + frame * 16, 16, false, side);
      check(`${device}: ${side} stick and keys spring back after release`, () => assert.ok(result.stickTilt < .001 && result.pressure === 0));
    }
    const restUp = model.buttons.up.position.z;
    const reduced = feedback.update({ ...empty(), up: true }, 2400, 16, true);
    check(`${device}: reduced-motion preference gives immediate pressure`, () => {
      assert.equal(reduced.pressure, 1);
      assert.ok(Math.abs(restUp - model.buttons.up.position.z - model.buttons.up.userData.pressDepth) < .001);
    });
  }
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
} finally {
  globalThis.fetch = actualFetch;
  await fs.unlink(temporary).catch(() => {});
}
