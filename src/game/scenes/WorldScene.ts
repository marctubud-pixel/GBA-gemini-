import Phaser from 'phaser';
import { BikeController } from '../bike/BikeController';
import { WalkingController } from '../player/WalkingController';
import { SideScrollCamera } from '../camera/SideScrollCamera';
import { WorldBuilder } from '../world/WorldBuilder';
import { WORLD_LOCATIONS, WorldLocation } from '../../data/locations';
import { useWorldStore, PlayerState } from '../../store/useWorldStore';

export class WorldScene extends Phaser.Scene {
  private bike!: BikeController;
  private walker!: WalkingController;
  private parkedBikeSprite!: Phaser.GameObjects.Sprite;
  private cameraController!: SideScrollCamera;
  private worldBuilder!: WorldBuilder;

  // Active parked spot location if dismounted
  private activeParkedLocation: WorldLocation | null = null;

  // Keyboard controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;

  // Throttle action key press
  private lastActionTime = 0;

  constructor() {
    super('WorldScene');
  }

  create() {
    // 1. Build World
    this.worldBuilder = new WorldBuilder(this);
    this.worldBuilder.buildWorld();

    // 2. Setup Inputs
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    // 3. Setup Entities at initial position (x: 200)
    const initialX = 200;
    const initialY = WorldBuilder.getGroundY(initialX);

    this.bike = new BikeController(this, initialX, initialY);
    this.walker = new WalkingController(this, initialX, initialY);

    // Parked bike sprite (hidden by default)
    this.parkedBikeSprite = this.add.sprite(initialX, initialY, 'bike_parked');
    this.parkedBikeSprite.setOrigin(0.5, 0.95);
    this.parkedBikeSprite.setDepth(19);
    this.parkedBikeSprite.setVisible(false);

    // 4. Setup Camera
    this.cameraController = new SideScrollCamera(this);
    this.cameraController.setBounds(0, -100, WorldBuilder.TOTAL_WORLD_WIDTH, 600);
    this.cameraController.initCenter(initialX, initialY);

    // 5. Window level direct key tracker for foolproof input
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') this.rawKeys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.rawKeys.right = true;
      if (code === 'KeyE' || code === 'Space' || code === 'Enter') this.rawKeys.action = true;
      if (code === 'Escape') {
        const store = useWorldStore.getState();
        if (store.isOverlayOpen) store.closeOverlay();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') this.rawKeys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.rawKeys.right = false;
      if (code === 'KeyE' || code === 'Space' || code === 'Enter') this.rawKeys.action = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    });

    // 6. Teleport event listener for INDEX fast-travel
    window.addEventListener('teleport-player', (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number }>;
      if (customEvent.detail && customEvent.detail.x !== undefined) {
        this.handleTeleport(customEvent.detail.x);
      }
    });
  }

  private rawKeys = {
    left: false,
    right: false,
    action: false
  };

  update(time: number, delta: number) {
    const store = useWorldStore.getState();
    const currentState = store.playerState;

    // Handle ESC key to close overlay
    if (this.keyEsc?.isDown && store.isOverlayOpen) {
      store.closeOverlay();
      return;
    }

    if (currentState === 'INTERACTING') {
      // Locked input while reading case study overlay
      return;
    }

    // Combine Phaser keyboard, window key events, and on-screen virtual inputs
    const vInput = store.virtualInput;
    const leftPressed = this.rawKeys.left || (this.cursors?.left?.isDown ?? false) || (this.keyA?.isDown ?? false) || vInput.left;
    const rightPressed = this.rawKeys.right || (this.cursors?.right?.isDown ?? false) || (this.keyD?.isDown ?? false) || vInput.right;
    const actionPressed = this.rawKeys.action || (this.keyE?.isDown ?? false) || vInput.action;

    if (currentState === 'RIDING') {
      this.handleRidingUpdate(time, delta, leftPressed, rightPressed, actionPressed);
    } else if (currentState === 'WALKING') {
      this.handleWalkingUpdate(time, delta, leftPressed, rightPressed, actionPressed);
    }
  }

  private handleRidingUpdate(
    time: number,
    delta: number,
    leftPressed: boolean,
    rightPressed: boolean,
    actionPressed: boolean
  ) {
    const store = useWorldStore.getState();
    const currentX = this.bike.x;

    // Boundary check (0 to TOTAL_WORLD_WIDTH)
    if (currentX < 40 && this.bike.velocityX < 0) {
      this.bike.velocityX = 0;
      this.bike.setPosition(40, this.bike.y);
    } else if (currentX > WorldBuilder.TOTAL_WORLD_WIDTH - 40 && this.bike.velocityX > 0) {
      this.bike.velocityX = 0;
      this.bike.setPosition(WorldBuilder.TOTAL_WORLD_WIDTH - 40, this.bike.y);
    }

    // Check proximity to Parking Zones & Slow Zones
    let isSlowZone = false;
    let foundParkingZone: WorldLocation | null = null;

    for (const loc of WORLD_LOCATIONS) {
      const dist = Math.abs(currentX - loc.parkingX);
      if (dist < loc.parkingWidth + 60) {
        isSlowZone = true;
      }
      if (dist < loc.parkingWidth / 2) {
        foundParkingZone = loc;
        break;
      }
    }

    store.setNearParkingZone(foundParkingZone);

    // Calculate uphill slope factor
    const slopeFactor = WorldBuilder.getSlopeFactor(currentX);

    // Update Bike physics
    this.bike.update(delta, leftPressed, rightPressed, isSlowZone, slopeFactor);

    // Adjust Y position along ground contour
    const currentY = WorldBuilder.getGroundY(this.bike.x);
    this.bike.setPosition(this.bike.x, currentY);

    // Camera follow
    const isMoving = Math.abs(this.bike.velocityX) > 10;
    this.cameraController.update(this.bike.x, this.bike.y, this.bike.facing, isMoving);

    // Update Zustand Store
    store.updatePlayerPos(this.bike.x, this.bike.y, Math.round(this.bike.velocityX));

    // Handle Dis-mounting (E · PARK)
    if (actionPressed && foundParkingZone && time - this.lastActionTime > 350) {
      this.lastActionTime = time;
      this.dismountBike(foundParkingZone);
    }
  }

  private dismountBike(location: WorldLocation) {
    this.activeParkedLocation = location;
    const parkX = location.parkingX;
    const parkY = WorldBuilder.getGroundY(parkX);

    // 1. Hide bike controller
    this.bike.setVisible(false);

    // 2. Position and show parked bike
    this.parkedBikeSprite.setPosition(parkX, parkY);
    this.parkedBikeSprite.setVisible(true);

    // 3. Position and show walking character 25px next to bike
    this.walker.setPosition(parkX + 25, parkY);
    this.walker.setVisible(true);

    // 4. Update store state
    const store = useWorldStore.getState();
    store.setPlayerState('WALKING');
    store.setNearParkingZone(null);
    store.setNearParkedBike(true);
  }

  private handleWalkingUpdate(
    time: number,
    delta: number,
    leftPressed: boolean,
    rightPressed: boolean,
    actionPressed: boolean
  ) {
    const store = useWorldStore.getState();
    const currentX = this.walker.x;

    // Walking movement bounds around the active landmark
    const anchorX = this.activeParkedLocation?.parkingX ?? currentX;
    const maxWalkRadius = 260;

    if (currentX < anchorX - maxWalkRadius && leftPressed) {
      // Reached walking left limit
      this.walker.update(delta, false, false);
    } else if (currentX > anchorX + maxWalkRadius && rightPressed) {
      // Reached walking right limit
      this.walker.update(delta, false, false);
    } else {
      this.walker.update(delta, leftPressed, rightPressed);
    }

    // Adjust Y along ground
    const currentY = WorldBuilder.getGroundY(this.walker.x);
    this.walker.setPosition(this.walker.x, currentY);

    // Camera follow
    const isMoving = Math.abs(this.walker.velocityX) > 10;
    this.cameraController.update(this.walker.x, this.walker.y, this.walker.facing, isMoving);

    // Update store position
    store.updatePlayerPos(this.walker.x, this.walker.y, 0);

    // Check distance to parked bike
    const distToParkedBike = Math.abs(this.walker.x - this.parkedBikeSprite.x);
    const nearParkedBike = distToParkedBike < 45;
    store.setNearParkedBike(nearParkedBike);

    // Check distance to landmark interaction zone
    let nearLoc: WorldLocation | null = null;
    for (const loc of WORLD_LOCATIONS) {
      const dist = Math.abs(this.walker.x - loc.interactionX);
      if (dist < loc.interactionWidth / 2) {
        nearLoc = loc;
        break;
      }
    }
    store.setNearInteraction(nearLoc);

    // Handle Actions
    if (actionPressed && time - this.lastActionTime > 350) {
      this.lastActionTime = time;

      if (nearParkedBike) {
        // Return to Bike!
        this.mountBike();
      } else if (nearLoc) {
        // Trigger Landmark Interaction
        store.openLocationOverlay(nearLoc);
      }
    }
  }

  private mountBike() {
    const mountX = this.parkedBikeSprite.x;
    const mountY = WorldBuilder.getGroundY(mountX);

    // 1. Hide walker and parked bike
    this.walker.setVisible(false);
    this.parkedBikeSprite.setVisible(false);

    // 2. Position and show bike
    this.bike.setPosition(mountX, mountY);
    this.bike.setVisible(true);

    // 3. Update state
    this.activeParkedLocation = null;
    const store = useWorldStore.getState();
    store.setPlayerState('RIDING');
    store.setNearParkedBike(false);
    store.setNearInteraction(null);
  }

  private handleTeleport(targetX: number) {
    const targetY = WorldBuilder.getGroundY(targetX);
    // Find closest location
    const closest = WORLD_LOCATIONS.find((loc) => Math.abs(loc.parkingX - targetX) < 150) || WORLD_LOCATIONS[0];
    this.dismountBike(closest);
    this.walker.setPosition(targetX, targetY);
    this.cameraController.update(targetX, targetY, 1, false);
  }
}
