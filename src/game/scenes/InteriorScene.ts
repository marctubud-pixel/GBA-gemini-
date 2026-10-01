import Phaser from 'phaser';
import { WalkingController } from '../player/WalkingController';
import { useWorldStore } from '../../store/useWorldStore';
import { INTERIORS, nearestInteriorInteraction } from '../interiors/rooms';
import {
  INTERIOR_ENTRY_X, INTERIOR_EXIT_X, INTERIOR_HEIGHT, INTERIOR_WALK_Y,
  INTERIOR_WIDTH, isInteriorId,
} from '../interiors/types';
import type { InteriorId } from '../interiors/types';
import { ellipse, P } from '../interiors/kit';

const ACTION_KEYS = new Set(['KeyJ', 'KeyE', 'KeyK', 'Enter', 'Space']);
const MOVEMENT_KEYS = new Set(['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight']);

function isEditingText(target: EventTarget | null) {
  return target instanceof HTMLElement &&
    Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

/** One procedural, horizontally walkable room for each of the five main buildings. */
export class InteriorScene extends Phaser.Scene {
  private interiorId: InteriorId = 'print-house';
  private walker!: WalkingController;
  private shadow!: Phaser.GameObjects.Image;
  private promptBadge!: Phaser.GameObjects.Container;
  private promptBackground!: Phaser.GameObjects.Graphics;
  private promptText!: Phaser.GameObjects.Text;
  private pressedKeys = new Set<string>();
  private pendingAction = false;
  private pendingEscape = false;
  private previousVirtualAction = false;
  private displayedPrompt: string | null = null;
  private isExiting = false;

  constructor() {
    super('InteriorScene');
  }

  init(data: { id?: unknown } = {}) {
    const id = data.id ?? useWorldStore.getState().activeInterior;
    this.interiorId = isInteriorId(id) ? id : 'print-house';
    this.pressedKeys.clear();
    this.pendingAction = false;
    this.pendingEscape = false;
    this.displayedPrompt = null;
    this.isExiting = false;
    const virtual = useWorldStore.getState().virtualInput;
    // An action still held from the exterior must be released before it can act here.
    this.previousVirtualAction = Boolean(virtual.action || virtual.accelerate || virtual.brake);
  }

  create() {
    useWorldStore.getState().setInteriorPrompt(null);
    const textureKey = `interior-v1-${this.interiorId}`;
    if (!this.textures.exists(textureKey)) {
      const texture = this.textures.createCanvas(textureKey, INTERIOR_WIDTH, INTERIOR_HEIGHT);
      if (!texture) throw new Error(`Unable to create ${this.interiorId} interior texture.`);
      const ctx = texture.getContext();
      ctx.imageSmoothingEnabled = false;
      INTERIORS[this.interiorId].draw(ctx, {});
      texture.refresh();
      texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    this.add.image(0, 0, textureKey).setOrigin(0).setDepth(0);

    if (!this.textures.exists('interior-player-shadow')) {
      const texture = this.textures.createCanvas('interior-player-shadow', 38, 8);
      if (texture) {
        ellipse(texture.getContext(), 19, 4, 18, 3, '#a39478');
        texture.refresh();
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
    this.shadow = this.add.image(INTERIOR_ENTRY_X, INTERIOR_WALK_Y + 1, 'interior-player-shadow')
      .setDepth(19);
    this.walker = new WalkingController(this, INTERIOR_ENTRY_X, INTERIOR_WALK_Y);
    this.walker.sprite.setScale(2);
    this.walker.setVisible(true);

    const camera = this.cameras.main;
    camera.setBackgroundColor(P.navy);
    camera.setZoom(1);
    // Twenty pixels above and below center the 320px room in the 360px viewport.
    camera.setBounds(0, -20, INTERIOR_WIDTH, INTERIOR_HEIGHT + 40);
    camera.startFollow(this.walker.sprite, true, 1, 1);
    camera.setFollowOffset(0, 110);
    camera.centerOn(INTERIOR_ENTRY_X, INTERIOR_HEIGHT / 2);
    camera.fadeIn(160, 0, 0, 0);
    this.input.setDefaultCursor('default');

    this.promptBackground = this.add.graphics();
    this.promptText = this.add.text(0, 0, '', {
      fontFamily: "'Cubic 11', 'Zpix', monospace, sans-serif",
      fontSize: '11px', color: P.cream,
    }).setOrigin(0.5);
    this.promptBadge = this.add.container(0, 150, [this.promptBackground, this.promptText]);
    this.promptBadge.setDepth(40).setVisible(false);

    const onKeyDown = (event: KeyboardEvent) => {
      const store = useWorldStore.getState();
      if (this.isExiting || store.activeInterior !== this.interiorId ||
          isEditingText(event.target) || store.currentView !== 'game') return;
      if (MOVEMENT_KEYS.has(event.code)) this.pressedKeys.add(event.code);
      if (!event.repeat && ACTION_KEYS.has(event.code)) this.pendingAction = true;
      if (!event.repeat && event.code === 'Escape') this.pendingEscape = true;
      if (MOVEMENT_KEYS.has(event.code) || ACTION_KEYS.has(event.code) || event.code === 'Escape') {
        event.preventDefault();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => this.pressedKeys.delete(event.code);
    const onBlur = () => {
      this.clearInputs();
      useWorldStore.getState().setVirtualInput({
        left: false, right: false, action: false, accelerate: false, brake: false,
      });
    };
    const onExitInterior = () => this.returnToWorld();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('exit-interior', onExitInterior);

    let disposed = false;
    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      this.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
      this.events.off(Phaser.Scenes.Events.DESTROY, cleanup);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('exit-interior', onExitInterior);
      this.clearInputs();
      // Phaser's CameraManager may have already removed its main camera.
      this.cameras.main?.stopFollow();
      useWorldStore.getState().setInteriorPrompt(null);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  }

  update(_time: number, delta: number) {
    const store = useWorldStore.getState();
    const virtual = store.virtualInput;
    const virtualAction = Boolean(virtual.action || virtual.accelerate || virtual.brake);
    const actionPressed = this.pendingAction || (virtualAction && !this.previousVirtualAction);
    const escapePressed = this.pendingEscape;
    this.previousVirtualAction = virtualAction;
    this.pendingAction = false;
    this.pendingEscape = false;

    if (this.isExiting || store.activeInterior !== this.interiorId) return;

    if (escapePressed && store.currentView === 'game') {
      if (store.activeLandmarkModal) store.closeLandmarkModal();
      else if (store.isOverlayOpen) store.closeOverlay();
      else store.exitInterior();
      this.walker.update(delta, false, false);
      this.showPrompt(null, 0);
      return;
    }

    const inputLocked = store.currentView !== 'game' || Boolean(store.activeLandmarkModal) || store.isOverlayOpen;
    if (inputLocked) {
      this.walker.update(delta, false, false);
      this.pressedKeys.clear();
      if (Object.values(virtual).some(Boolean)) {
        store.setVirtualInput({
          left: false, right: false, up: false, down: false,
          action: false, accelerate: false, brake: false,
        });
      }
      this.showPrompt(null, 0);
      return;
    }

    const left = this.pressedKeys.has('KeyA') || this.pressedKeys.has('ArrowLeft') || virtual.left;
    const right = this.pressedKeys.has('KeyD') || this.pressedKeys.has('ArrowRight') || virtual.right;
    this.walker.update(delta, left, right);
    this.walker.x = Phaser.Math.Clamp(this.walker.x, 24, INTERIOR_WIDTH - 26);
    this.walker.y = INTERIOR_WALK_Y;
    this.shadow.setPosition(this.walker.x, INTERIOR_WALK_Y + 1);

    const nearExit = Math.abs(this.walker.x - INTERIOR_EXIT_X) <= 23;
    const point = nearestInteriorInteraction(this.interiorId, this.walker.x);
    if (nearExit) {
      this.showPrompt(`J / E · 走出${INTERIORS[this.interiorId].name}`, INTERIOR_EXIT_X);
      if (actionPressed) store.exitInterior();
    } else if (point) {
      this.showPrompt(`J / E · ${point.prompt}`, point.x);
      if (actionPressed) {
        this.walker.update(delta, false, false);
        this.showPrompt(null, 0);
        store.openLandmarkModal(point.modal, point.context);
      }
    } else {
      this.showPrompt(null, 0);
    }
  }

  private showPrompt(prompt: string | null, x: number) {
    if (prompt !== this.displayedPrompt) {
      this.displayedPrompt = prompt;
      const store = useWorldStore.getState();
      if (store.interiorPrompt !== prompt) store.setInteriorPrompt(prompt);
      this.promptBadge.setVisible(Boolean(prompt));
      if (prompt) {
        this.promptText.setText(prompt);
        const width = Math.ceil(this.promptText.width) + 16;
        this.promptBackground.clear();
        this.promptBackground.fillStyle(0x0f3a5e, 0.97);
        this.promptBackground.fillRect(-width / 2, -12, width, 24);
        this.promptBackground.lineStyle(1, 0x5eb6ed, 1);
        this.promptBackground.strokeRect(-width / 2, -12, width, 24);
        this.promptBackground.fillTriangle(-3, 12, 3, 12, 0, 16);
      }
    }
    if (prompt) {
      const halfWidth = this.promptText.width / 2 + 10;
      this.promptBadge.x = Phaser.Math.Clamp(x, halfWidth, INTERIOR_WIDTH - halfWidth);
    }
  }

  private clearInputs() {
    this.pressedKeys.clear();
    this.pendingAction = false;
    this.pendingEscape = false;
  }

  private returnToWorld() {
    if (this.isExiting) return;
    this.isExiting = true;
    this.clearInputs();
    this.showPrompt(null, 0);
    useWorldStore.getState().setVirtualInput({
      left: false, right: false, action: false, accelerate: false, brake: false,
    });
    this.cameras.main.fadeOut(120, 0, 0, 0);
    this.time.delayedCall(130, () => {
      // A newer room request wins over an earlier exit fade.
      if (useWorldStore.getState().activeInterior) return;
      // The store already dispatched exit-interior; never dispatch it recursively.
      this.scene.resume('WorldScene');
      this.scene.stop('InteriorScene');
    });
  }
}
