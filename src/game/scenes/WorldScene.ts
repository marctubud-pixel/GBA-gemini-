import Phaser from 'phaser';
import { BikeController } from '../bike/BikeController';
import { WalkingController } from '../player/WalkingController';
import { SideScrollCamera } from '../camera/SideScrollCamera';
import { WorldBuilder } from '../world/WorldBuilder';
import { WORLD_LOCATIONS, WorldLocation } from '../../data/locations';
import { useWorldStore, PlayerState } from '../../store/useWorldStore';
import { pixelSound } from '../audio/PixelSoundManager';
import { isInteriorId } from '../interiors/types';
import type { InteriorId } from '../interiors/types';

export class WorldScene extends Phaser.Scene {
  private bike!: BikeController;
  private walker!: WalkingController;
  private parkedBikeSprite!: Phaser.GameObjects.Sprite;
  private promptBubbleSprite!: Phaser.GameObjects.Sprite;
  private currentBubbleKey: string | null = null;
  private bubbleTween: Phaser.Tweens.Tween | null = null;
  private cameraController!: SideScrollCamera;
  private worldBuilder!: WorldBuilder;

  // Ambient Dynamic Life (Seagulls, Studio Cat)
  private seagulls: Array<{
    sprite: Phaser.GameObjects.Sprite;
    baseY: number;
    speedX: number;
    phase: number;
    flapTimer: number;
    currentFrame: number;
  }> = [];
  private catSprite!: Phaser.GameObjects.Sprite;
  private catAnimTimer = 0;
  private isCatPurring = false;

  // Active parked spot location if dismounted
  private activeParkedLocation: WorldLocation | null = null;
  private interiorReturnPosition: { x: number; y: number } | null = null;
  private isEnteringLandmark = false;
  private landmarkTransition: Phaser.Time.TimerEvent | null = null;
  private pendingAction = false;
  private previousVirtualAction = false;
  private pointerGlow!: Phaser.GameObjects.Graphics;
  private objectGlow!: Phaser.GameObjects.Graphics;
  private pointerObjectBounds: Array<{x:number;y:number;width:number;height:number}> = [];
  private hoverTarget: { x:number; y:number; width:number; height:number } | null = null;
  private endingTween: Phaser.Tweens.Tween | null = null;
  private endingDelay: Phaser.Time.TimerEvent | null = null;
  private endingGeneration = 0;
  private endingStartPosition: {x:number;y:number} | null = null;

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
    this.seagulls=[];this.hoverTarget=null;this.pointerObjectBounds=[];this.isCatPurring=false;this.catAnimTimer=0;
    this.isEndingRide=false;this.endingTween=null;this.endingDelay=null;this.endingStartPosition=null;
    this.lastStoreUpdate=0;this.lastStoreX=0;this.lastStoreSpeed=0;
    // 1. Build World
    this.worldBuilder = new WorldBuilder(this);
    this.worldBuilder.buildWorld();

    // Ensure canvas mouse cursor is standard default arrow (eliminates any crosshair)
    this.input.setDefaultCursor('default');

    // 2. Setup Inputs
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    // 3. Setup Entities at initial position (defaults to Entrance x: 200)
    const initialX = useWorldStore.getState().playerX || 200;
    const initialY = WorldBuilder.getGroundY(initialX) + 1;

    this.bike = new BikeController(this, initialX, initialY);
    this.walker = new WalkingController(this, initialX, initialY);

    // Parked bike sprite (hidden by default)
    this.parkedBikeSprite = this.add.sprite(initialX, initialY, 'bike_parked');
    this.parkedBikeSprite.setOrigin(0.5, 1.0);
    this.parkedBikeSprite.setDepth(19);
    this.parkedBikeSprite.setVisible(false);

    // In-world floating pixel speech bubble prompt (pops up above character)
    this.promptBubbleSprite = this.add.sprite(initialX, initialY - 52, 'bubble_prompt_park');
    this.promptBubbleSprite.setOrigin(0.5, 1.0);
    this.promptBubbleSprite.setDepth(50);
    this.promptBubbleSprite.setVisible(false);
    this.promptBubbleSprite.setScale(0);

    // Initial WALKING state check
    if (useWorldStore.getState().playerState === 'WALKING') {
      const closestLoc = WORLD_LOCATIONS.find((loc) => Math.abs(loc.parkingX - initialX) < 200) || WORLD_LOCATIONS[0];
      this.dismountBike(closestLoc);
      this.walker.setPosition(initialX, initialY);
    }

    // 4. Setup Camera
    this.cameraController = new SideScrollCamera(this);
    this.cameraController.setBounds(0, -100, WorldBuilder.TOTAL_WORLD_WIDTH, 600);
    this.cameraController.initCenter(initialX, initialY);

    // 5. Window level direct key tracker for foolproof input
    const onKeyDown = (e: KeyboardEvent) => {
      const store = useWorldStore.getState();
      if (!this.scene.isActive('WorldScene') || store.activeInterior || store.currentView !== 'game' || store.isStarting || store.isEndingModalOpen || store.activeLandmarkModal || store.isOverlayOpen) return;
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') this.rawKeys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.rawKeys.right = true;
      if (code === 'KeyW' || code === 'ArrowUp') this.rawKeys.up = true;
      if (code === 'KeyS' || code === 'ArrowDown') this.rawKeys.down = true;
      if (code === 'KeyJ') {
        this.rawKeys.accelerate = true;
      }
      if (code === 'KeyK' || code === 'KeyE' || code === 'Space' || code === 'Enter') {
        this.rawKeys.brake = true;
        this.rawKeys.action = true;
        if (!e.repeat) this.pendingAction = true;
      }
      if (code === 'Escape') {
        if (store.isEndingModalOpen) {
          store.closeEndingModal();
        } else if (store.isPostcardOpen) {
          store.closePostcard();
        } else if (store.activeLandmarkModal) {
          store.closeLandmarkModal();
        } else if (store.isPrintHouseBookOpen) {
          store.closePrintHouseModal();
        } else if (store.isOverlayOpen) {
          store.closeOverlay();
          this.cameraController.setTargetZoom(1.4);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') this.rawKeys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.rawKeys.right = false;
      if (code === 'KeyW' || code === 'ArrowUp') this.rawKeys.up = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.rawKeys.down = false;
      if (code === 'KeyJ') {
        this.rawKeys.accelerate = false;
      }
      if (code === 'KeyK' || code === 'KeyE' || code === 'Space' || code === 'Enter') {
        this.rawKeys.brake = false;
        this.rawKeys.action = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 6. Setup Ambient Coastal Seagulls (Unified canonical 24x15 seagull_sheet)
    const gullStarts = [
      { x: 380, y: 70, speed: 36 },
      { x: 1350, y: 95, speed: 30 },
      { x: 2450, y: 65, speed: 42 },
      { x: 3600, y: 85, speed: 34 },
      { x: 4700, y: 70, speed: 38 },
      { x: 5750, y: 80, speed: 32 }
    ];
    for (const g of gullStarts) {
      const s = this.add.sprite(g.x, g.y, 'seagull_sheet', 0);
      s.setOrigin(0.5, 0.5);
      s.setDepth(6);
      this.seagulls.push({
        sprite: s,
        baseY: g.y,
        speedX: g.speed,
        phase: Math.random() * Math.PI * 2,
        flapTimer: 0,
        currentFrame: 0
      });
    }

    // 7. Setup Coastal Studio Cat on patio porch (x: 4610)
    const catX = 4610;
    const catY = WorldBuilder.getGroundY(catX) + 1;
    this.catSprite = this.add.sprite(catX, catY, 'cat_sheet', 0);
    this.catSprite.setOrigin(0.5, 1.0);
    this.catSprite.setDepth(16);
    this.createPointerInteractions();

    const onExitInterior = (event: Event) => {
      this.resetInputs(true);
      this.walker.setAlpha(1);
      const id=(event as CustomEvent<{id?:unknown}>).detail?.id;
      const location=WORLD_LOCATIONS.find(item=>item.id===id);
      const position=location?{x:location.interactionX-12,y:WorldBuilder.getGroundY(location.interactionX-12)+1}:this.interiorReturnPosition;
      if (position) this.walker.setPosition(position.x, position.y);
      if(position)useWorldStore.getState().updatePlayerPos(position.x,position.y,0);
      this.interiorReturnPosition = null;
      this.cameras.main.fadeIn(200, 0, 0, 0);
      this.cameraController.setTargetZoom(1.4);
      this.cameraController.currentCamera.setZoom(1.4);
      this.cameraController.initCenter(this.walker.x, this.walker.y);
    };
    const onEnterInterior = (event: Event) => {
      const id = (event as CustomEvent<{ id?: unknown }>).detail?.id;
      if (isInteriorId(id)) this.enterInterior(id);
    };
    const onBlur = () => this.resetInputs(true);
    window.addEventListener('exit-interior', onExitInterior);
    window.addEventListener('enter-interior', onEnterInterior);
    window.addEventListener('blur', onBlur);

    // 6. Teleport event listener for INDEX fast-travel
    const onTeleport = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; state?: PlayerState }>;
      if (customEvent.detail && customEvent.detail.x !== undefined) {
        this.handleTeleport(customEvent.detail.x, customEvent.detail.state);
      }
    };
    window.addEventListener('teleport-player', onTeleport);

    // 7. Ending Sequence: Ride bicycle off-screen / out of the frame
    const onPlayEndingRideOut = () => {
      this.playEndingRideOut();
    };
    window.addEventListener('play-ending-ride-out', onPlayEndingRideOut);

    // Listen for overlay closure from React to restore camera zoom
    const unsubscribeStore = useWorldStore.subscribe((state, prevState) => {
      if (state.currentView !== 'game' && state.currentView !== prevState.currentView) {
        this.cancelLandmarkTransition();
        this.cancelEndingRide();
      }
      if ((prevState.isOverlayOpen && !state.isOverlayOpen) ||
          (prevState.isPrintHouseBookOpen && !state.isPrintHouseBookOpen) ||
          (prevState.activeLandmarkModal && !state.activeLandmarkModal) ||
          (prevState.isPostcardOpen && !state.isPostcardOpen)) {
        this.cameraController.setTargetZoom(1.4);
      }
      const locked = state.currentView !== 'game' || state.isStarting || state.activeInterior || state.isOverlayOpen || state.activeLandmarkModal || state.isEndingModalOpen;
      const previouslyLocked = prevState.currentView !== 'game' || prevState.isStarting || prevState.activeInterior || prevState.isOverlayOpen || prevState.activeLandmarkModal || prevState.isEndingModalOpen;
      if (locked && !previouslyLocked) this.resetInputs(true);
    });

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
      window.removeEventListener('enter-interior', onEnterInterior);
      window.removeEventListener('teleport-player', onTeleport);
      window.removeEventListener('play-ending-ride-out', onPlayEndingRideOut);
      unsubscribeStore();
      this.cancelLandmarkTransition();
      this.cancelEndingRide();
      this.resetInputs();
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    // Support direct navigation before Phaser finishes booting.
    const activeInterior = useWorldStore.getState().activeInterior;
    if (activeInterior) this.enterInterior(activeInterior);
    this.game.events.emit('journey-world-ready');
  }

  private canPointerInteract() {
    const s=useWorldStore.getState();
    return this.scene.isActive('WorldScene')&&s.currentView==='game'&&!s.isStarting&&!s.activeInterior&&
      !s.activeLandmarkModal&&!s.isOverlayOpen&&!s.isPostcardOpen&&!s.isEndingModalOpen&&
      !this.isEnteringLandmark&&!this.isEndingRide&&(s.playerState==='RIDING'||s.playerState==='WALKING');
  }

  private showPointerGlow(bounds:{x:number;y:number;width:number;height:number}|null) {
    this.hoverTarget=bounds;this.pointerGlow.clear();
    if(!bounds||!this.canPointerInteract())return;
    const {x,y,width:w,height:h}=bounds;
    this.pointerGlow.fillStyle(0x5eb6ed,.2);this.pointerGlow.fillRect(x,y,w,h);
    this.pointerGlow.fillStyle(0xffedab,1);
    for(const xx of [x,x+w-8])for(const yy of [y,y+h-2])this.pointerGlow.fillRect(xx,yy,8,2);
    for(const xx of [x,x+w-2])for(const yy of [y,y+h-8])this.pointerGlow.fillRect(xx,yy,2,8);
    this.pointerGlow.fillStyle(0xf3c653,1);
    this.pointerGlow.fillRect(x+8,y,w-16,1);this.pointerGlow.fillRect(x+8,y+h-1,w-16,1);
    this.pointerGlow.fillRect(x,y+8,1,h-16);this.pointerGlow.fillRect(x+w-1,y+8,1,h-16);
  }

  private createPointerInteractions() {
    this.objectGlow=this.add.graphics().setDepth(43);
    this.pointerGlow=this.add.graphics().setDepth(45);
    for(const location of WORLD_LOCATIONS){
      const width=location.id==='my-studio'?89:location.id==='central-plaza'?68:56;
      const height=location.id==='entrance'?75:location.id==='my-studio'?113:95;
      const bounds={x:location.interactionX-width/2,y:WorldBuilder.getGroundY(location.interactionX)-height,width,height};
      this.pointerObjectBounds.push(bounds);
      const zone=this.add.zone(bounds.x+bounds.width/2,bounds.y+bounds.height/2,width,height).setDepth(25).setName(`world-door-${location.id}`).setInteractive({useHandCursor:true});
      zone.on('pointerover',()=>this.showPointerGlow(bounds));zone.on('pointerout',()=>this.showPointerGlow(null));
      zone.on('pointerdown',()=>{
        if(!this.canPointerInteract())return;
        const s=useWorldStore.getState();
        if(s.playerState==='RIDING'||this.activeParkedLocation?.id!==location.id)this.dismountBike(location);
        this.tweens.killTweensOf(this.walker);
        this.walker.setPosition(location.interactionX,WorldBuilder.getGroundY(location.interactionX)+1);this.walker.setAlpha(1);
        s.updatePlayerPos(this.walker.x,this.walker.y,0);s.setNearParkedBike(false);s.setNearInteraction(location);
        this.triggerLandmarkInteraction(location);
      });
    }
    // Small objects share the same click/hover contract as every building door.
    this.pointerObjectBounds.push({x:4596,y:WorldBuilder.getGroundY(4610)-23,width:29,height:24});
    this.catSprite.setInteractive({useHandCursor:true});
    this.catSprite.on('pointerover',()=>this.showPointerGlow({x:4596,y:WorldBuilder.getGroundY(4610)-23,width:29,height:24}));
    this.catSprite.on('pointerout',()=>this.showPointerGlow(null));
    this.catSprite.on('pointerdown',()=>{
      if(!this.canPointerInteract()||this.isCatPurring)return;
      this.prepareObjectWalk('my-studio',4610);this.petCat();
    });
    const ty=WorldBuilder.getGroundY(6060);
    this.pointerObjectBounds.push({x:6038,y:ty-51,width:44,height:53});
    const telescope=this.add.zone(6060,ty-24,43,53).setDepth(26).setName('world-telescope').setInteractive({useHandCursor:true});
    telescope.on('pointerover',()=>this.showPointerGlow({x:6038,y:ty-51,width:44,height:53}));
    telescope.on('pointerout',()=>this.showPointerGlow(null));
    telescope.on('pointerdown',()=>{if(!this.canPointerInteract())return;this.prepareObjectWalk('observatory',6060);this.lookThroughTelescope();});
    this.parkedBikeSprite.setInteractive({useHandCursor:true});
    this.parkedBikeSprite.on('pointerover',()=>this.showPointerGlow({x:this.parkedBikeSprite.x-27,y:this.parkedBikeSprite.y-40,width:54,height:42}));
    this.parkedBikeSprite.on('pointerout',()=>this.showPointerGlow(null));
    this.parkedBikeSprite.on('pointerdown',()=>{if(this.canPointerInteract()&&useWorldStore.getState().playerState==='WALKING'){this.showPointerGlow(null);this.mountBike();}});
  }

  private updateObjectGlows(time:number) {
    this.objectGlow.clear();
    if(!this.canPointerInteract()){
      this.pointerGlow.clear();this.hoverTarget=null;return;
    }
    const camera=this.cameras.main,view=camera.worldView;
    const objects=this.parkedBikeSprite.visible?
      [...this.pointerObjectBounds,{x:this.parkedBikeSprite.x-27,y:this.parkedBikeSprite.y-40,width:54,height:42}]:this.pointerObjectBounds;
    this.objectGlow.setAlpha(.52+Math.sin(time*.004)*.13);
    for(const {x,y,width:w,height:h} of objects){
      if(x+w<view.left||x>view.right||y+h<view.top||y>view.bottom)continue;
      // One-pixel cyan rails and stepped corners identify the actual clickable area.
      this.objectGlow.fillStyle(0x5eb6ed,.75);
      this.objectGlow.fillRect(x+5,y,w-10,1);this.objectGlow.fillRect(x+5,y+h-1,w-10,1);
      this.objectGlow.fillRect(x,y+5,1,h-10);this.objectGlow.fillRect(x+w-1,y+5,1,h-10);
      this.objectGlow.fillStyle(0xb8f0e6,1);
      for(const xx of [x,x+w-6])for(const yy of [y,y+h-2])this.objectGlow.fillRect(xx,yy,6,2);
      for(const xx of [x,x+w-2])for(const yy of [y,y+h-6])this.objectGlow.fillRect(xx,yy,2,6);
      // A tiny pixel diamond is a quiet interaction marker above each object.
      const cx=Math.round(x+w/2);this.objectGlow.fillRect(cx-2,y-7,5,1);this.objectGlow.fillRect(cx-3,y-6,7,1);this.objectGlow.fillRect(cx-2,y-5,5,1);this.objectGlow.fillRect(cx-1,y-4,3,1);
    }
    // The pointer can stay stationary while the camera moves beneath it.
    if(this.hoverTarget){
      const pointer=this.input.activePointer;
      const point=camera.getWorldPoint(pointer.x,pointer.y);
      const b=this.hoverTarget;
      if(pointer.x<camera.x||pointer.x>camera.x+camera.width||pointer.y<camera.y||pointer.y>camera.y+camera.height||point.x<b.x||point.x>b.x+b.width||point.y<b.y||point.y>b.y+b.height)this.showPointerGlow(null);
      else this.pointerGlow.setAlpha(.87+Math.sin(time*.006)*.1);
    }
  }

  private prepareObjectWalk(locationId:string,x:number) {
    const location=WORLD_LOCATIONS.find(item=>item.id===locationId);
    if(!location)return;
    if(useWorldStore.getState().playerState==='RIDING'||this.activeParkedLocation?.id!==locationId)this.dismountBike(location);
    this.tweens.killTweensOf(this.walker);this.walker.setPosition(x,WorldBuilder.getGroundY(x)+1);
    const s=useWorldStore.getState();s.updatePlayerPos(this.walker.x,this.walker.y,0);s.setNearParkedBike(false);s.setNearInteraction(null);
    this.cameraController.initCenter(this.walker.x,this.walker.y);
  }

  private rawKeys = {
    left: false,
    right: false,
    up: false,
    down: false,
    accelerate: false,
    brake: false,
    action: false
  };

  private lastStoreUpdate = 0;
  private lastStoreX = 0;
  private lastStoreSpeed = 0;

  update(time: number, delta: number) {
    const store = useWorldStore.getState();
    const currentState = store.playerState;
    this.updateObjectGlows(time);

    // If ending ride is active, camera stays fixed and player rides out of the frame!
    if (this.isEndingRide) {
      return;
    }

    // 1. Update Dynamic World Atmosphere (Sky clouds, ocean waves, seagulls, sailboats)
    const camX = this.cameraController.currentCamera.scrollX + this.cameraController.currentCamera.width / 2;
    this.worldBuilder.update(time, delta, camX);

    // 2. Update Seagulls & Coastal Atmosphere
    const dt = delta / 1000;
    for (const g of this.seagulls) {
      g.sprite.x += g.speedX * dt;
      g.phase += dt * 2.0;
      g.sprite.y = g.baseY + Math.sin(g.phase) * 5;
      g.flapTimer += delta;
      if (g.flapTimer > 210) {
        g.flapTimer = 0;
        g.currentFrame = (g.currentFrame + 1) % 4;
        g.sprite.setFrame(g.currentFrame);
      }
      if (g.sprite.x > 6600) {
        g.sprite.x = -80;
      }
    }



    // Update Cat Idle (when player is not interacting)
    if (!this.isCatPurring && this.catSprite) {
      const playerCurrentX = currentState === 'WALKING' ? this.walker.x : this.bike.x;
      const distToCat = Math.abs(playerCurrentX - 4610);
      if (distToCat > 60) {
        this.catAnimTimer += delta;
        if (this.catAnimTimer > 3200) {
          this.catAnimTimer = 0;
          const currentF = this.catSprite.frame.name === '0' ? 1 : 0;
          this.catSprite.setFrame(currentF);
        }
      } else {
        // Player is nearby! Cat sits upright looking at player
        this.catSprite.setFrame(2);
      }
    }

    // Handle ESC key to close overlay
    if (this.keyEsc?.isDown && (store.isOverlayOpen || store.isPostcardOpen || store.isPrintHouseBookOpen)) {
      if (store.isPostcardOpen) store.closePostcard();
      if (store.isOverlayOpen) store.closeOverlay();
      if (store.isPrintHouseBookOpen) store.closePrintHouseModal();
      this.cameraController.setTargetZoom(1.4);
      pixelSound.playClose();
      return;
    }

    if (store.currentView !== 'game' || store.isStarting || store.activeInterior || currentState === 'INTERACTING') {
      this.resetInputs(true);
      this.pointerGlow.clear();
      pixelSound.stopBikeRoll();
      this.updatePromptBubble(null, 0, 0, time);
      return;
    }

    // Combine Phaser keyboard, window key events, and on-screen virtual inputs
    const vInput = store.virtualInput;
    const leftPressed = this.rawKeys.left || (this.cursors?.left?.isDown ?? false) || (this.keyA?.isDown ?? false) || vInput.left;
    const rightPressed = this.rawKeys.right || (this.cursors?.right?.isDown ?? false) || (this.keyD?.isDown ?? false) || vInput.right;
    const acceleratePressed = this.rawKeys.accelerate || (vInput.accelerate ?? false);
    const brakePressed = this.rawKeys.brake || (vInput.brake ?? false);
    const actionPressed = this.pendingAction || (vInput.action && !this.previousVirtualAction);
    this.pendingAction = false;
    this.previousVirtualAction = vInput.action;

    if (currentState === 'RIDING') {
      this.handleRidingUpdate(time, delta, leftPressed, rightPressed, acceleratePressed, brakePressed, actionPressed);
    } else if (currentState === 'WALKING') {
      this.handleWalkingUpdate(time, delta, leftPressed, rightPressed, acceleratePressed, actionPressed);
    }
  }

  private handleRidingUpdate(
    time: number,
    delta: number,
    leftPressed: boolean,
    rightPressed: boolean,
    acceleratePressed: boolean,
    brakePressed: boolean,
    actionPressed: boolean
  ) {
    const store = useWorldStore.getState();
    const currentX = this.bike.x;

    // Boundary check (0 to TOTAL_WORLD_WIDTH)
    if (currentX < 40 && this.bike.velocityX < 0) {
      this.bike.velocityX = 0;
      this.bike.setPosition(40, this.bike.y);
    } else if (currentX > WorldBuilder.TOTAL_WORLD_WIDTH - 60 && this.bike.velocityX > 0) {
      this.bike.velocityX = 0;
      this.playEndingRideOut();
      return;
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

    // In-world speech bubble for parking
    if (foundParkingZone) {
      this.updatePromptBubble('bubble_prompt_park', this.bike.x, this.bike.y, time);
    } else {
      this.updatePromptBubble(null, this.bike.x, this.bike.y, time);
    }

    // Calculate uphill slope factor
    const slopeFactor = WorldBuilder.getSlopeFactor(currentX);

    // Update Bike physics (J accelerates, K brakes)
    this.bike.update(delta, leftPressed, rightPressed, acceleratePressed, brakePressed, isSlowZone, slopeFactor);

    // Adjust Y position and rotation along ground contour (both wheels firmly touching slope)
    const bikeX = this.bike.x;
    const facing = this.bike.facing;
    let yRear: number;
    let yFront: number;
    let rot: number;
    let targetY: number;

    if (facing === 1) {
      // Facing right: rear wheel at (x - 13), front wheel at (x + 9)
      yRear = WorldBuilder.getGroundY(bikeX - 13) + 1;
      yFront = WorldBuilder.getGroundY(bikeX + 9) + 1;
      const sinTheta = Math.max(-1, Math.min(1, (yFront - yRear) / 22));
      rot = Math.asin(sinTheta);
      targetY = (yRear + yFront + 4 * sinTheta) / 2;
    } else {
      // Facing left (flipX = true): front wheel at (x - 9), rear wheel at (x + 13)
      yFront = WorldBuilder.getGroundY(bikeX - 9) + 1;
      yRear = WorldBuilder.getGroundY(bikeX + 13) + 1;
      const sinTheta = Math.max(-1, Math.min(1, (yRear - yFront) / 22));
      rot = Math.asin(sinTheta);
      targetY = (yRear + yFront - 4 * sinTheta) / 2;
    }

    this.bike.setPosition(bikeX, targetY);
    this.bike.setRotation(rot);

    // Camera follow (smooth, frame-rate independent)
    const isMoving = Math.abs(this.bike.velocityX) > 10;
    this.cameraController.update(this.bike.x, this.bike.y, this.bike.facing, isMoving, delta);

    // Update Zustand Store (throttled to avoid 60fps React render storms)
    const now = time;
    const isStopped = Math.abs(this.bike.velocityX) < 5;
    const wasMoving = Math.abs(this.lastStoreSpeed) >= 5;
    const shouldUpdateStore =
      now - this.lastStoreUpdate > 80 ||
      Math.abs(this.bike.x - this.lastStoreX) > 15 ||
      (isStopped && wasMoving);

    if (shouldUpdateStore) {
      this.lastStoreUpdate = now;
      this.lastStoreX = this.bike.x;
      this.lastStoreSpeed = Math.round(this.bike.velocityX);
      store.updatePlayerPos(this.bike.x, this.bike.y, this.lastStoreSpeed);
    }

    // Handle Dis-mounting (E · PARK)
    if (actionPressed && foundParkingZone && time - this.lastActionTime > 350) {
      this.lastActionTime = time;
      this.dismountBike(foundParkingZone);
    }
  }

  private spawnDustFX(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const dust = this.add.sprite(x + (i - 1) * 8, y - 2, 'fx_dust');
      dust.setOrigin(0.5, 0.95);
      dust.setDepth(21);
      dust.setScale(0.8 + Math.random() * 0.4);
      dust.setAlpha(0.85);

      this.tweens.add({
        targets: dust,
        x: dust.x + (i - 1) * 10 + (Math.random() * 6 - 3),
        y: y - 10 - Math.random() * 6,
        alpha: 0,
        scale: 0.2,
        duration: 350 + Math.random() * 150,
        ease: 'Quad.easeOut',
        onComplete: () => {
          dust.destroy();
        }
      });
    }
  }

  private dismountBike(location: WorldLocation) {
    this.activeParkedLocation = location;
    const parkX = location.parkingX;

    // 1. Hide bike controller
    this.bike.setVisible(false);
    this.bike.setRotation(0);

    // 2. Position and show parked bike with dual-wheel slope grounding
    const yR = WorldBuilder.getGroundY(parkX - 13) + 1;
    const yF = WorldBuilder.getGroundY(parkX + 9) + 1;
    const sinT = Math.max(-1, Math.min(1, (yF - yR) / 22));
    this.parkedBikeSprite.setRotation(Math.asin(sinT));
    this.parkedBikeSprite.setPosition(parkX, (yR + yF + 4 * sinT) / 2);
    this.parkedBikeSprite.setVisible(true);

    // Play retro dismount sound
    pixelSound.playDismount();

    const parkY = WorldBuilder.getGroundY(parkX) + 1;

    // 3. Position walking character with hop jump animation
    const targetWalkerX = parkX + 24;
    this.walker.setPosition(targetWalkerX, parkY - 14);
    this.walker.setVisible(true);

    // Hop jump tween for natural dismounting feeling
    this.tweens.add({
      targets: this.walker,
      y: parkY,
      duration: 180,
      ease: 'Sine.easeIn',
      onComplete: () => {
        // Spawn dust on ground contact
        this.spawnDustFX(targetWalkerX, parkY);
      }
    });

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
    acceleratePressed: boolean,
    actionPressed: boolean
  ) {
    const store = useWorldStore.getState();
    const currentX = this.walker.x;

    // Walking movement bounds around the active landmark (snug beside entrance)
    const anchorX = this.activeParkedLocation?.parkingX ?? currentX;
    const maxWalkRadius = 180;
    const walkRight = rightPressed || acceleratePressed;

    if (currentX < anchorX - maxWalkRadius && leftPressed) {
      // Reached walking left limit
      this.walker.update(delta, false, false);
    } else if (currentX > anchorX + maxWalkRadius && walkRight) {
      // Reached walking right limit
      this.walker.update(delta, false, false);
    } else {
      this.walker.update(delta, leftPressed, walkRight);
    }

    // Adjust Y along ground (firm contact on sidewalk)
    const currentY = WorldBuilder.getGroundY(this.walker.x) + 1;
    this.walker.setPosition(this.walker.x, currentY);

    // Camera follow (smooth, frame-rate independent)
    const isMoving = Math.abs(this.walker.velocityX) > 10;
    this.cameraController.update(this.walker.x, this.walker.y, this.walker.facing, isMoving, delta);

    // Update store position (throttled to avoid React render storms)
    const now = time;
    if (now - this.lastStoreUpdate > 80 || Math.abs(this.walker.x - this.lastStoreX) > 12) {
      this.lastStoreUpdate = now;
      this.lastStoreX = this.walker.x;
      this.lastStoreSpeed = 0;
      store.updatePlayerPos(this.walker.x, this.walker.y, 0);
    }

    // Check distance to parked bike
    const distToParkedBike = Math.abs(this.walker.x - this.parkedBikeSprite.x);
    const nearParkedBike = distToParkedBike < 45;
    store.setNearParkedBike(nearParkedBike);

    // Check distance to studio cat (x: 4610)
    const distToCat = Math.abs(this.walker.x - 4610);
    const nearCat = distToCat < 38;

    // Check distance to summit telescope (x: 6060)
    const distToTelescope = Math.abs(this.walker.x - 6060);
    const nearTelescope = distToTelescope < 42;

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

    // In-world speech bubble for bike re-mount, cat, telescope, or landmark interaction
    if (nearParkedBike) {
      this.updatePromptBubble('bubble_prompt_ride', this.walker.x, this.walker.y, time);
    } else if (nearCat) {
      this.updatePromptBubble('bubble_prompt_cat', this.walker.x, this.walker.y, time);
    } else if (nearTelescope) {
      this.updatePromptBubble('bubble_prompt_look', this.walker.x, this.walker.y, time);
    } else if (nearLoc) {
      let promptKey = 'bubble_prompt_enter';
      if (nearLoc.promptText === 'VIEW') promptKey = 'bubble_prompt_view';
      else if (nearLoc.promptText === 'WATCH') promptKey = 'bubble_prompt_watch';
      else if (nearLoc.promptText === 'READ') promptKey = 'bubble_prompt_read';
      else if (nearLoc.promptText === 'PLAY') promptKey = 'bubble_prompt_play';
      this.updatePromptBubble(promptKey, this.walker.x, this.walker.y, time);
    } else {
      this.updatePromptBubble(null, this.walker.x, this.walker.y, time);
    }

    // Handle Actions
    if (actionPressed && time - this.lastActionTime > 350) {
      this.lastActionTime = time;

      if (nearParkedBike) {
        // Return to Bike!
        this.mountBike();
      } else if (nearCat) {
        this.petCat();
      } else if (nearTelescope) {
        this.lookThroughTelescope();
      } else if (nearLoc) {
        // Trigger Landmark Interaction with transition
        this.triggerLandmarkInteraction(nearLoc);
      }
    }
  }

  private petCat() {
    this.isCatPurring = true;
    this.catSprite.setFrame(3);
    pixelSound.playCatMeow();
    this.spawnHeartParticles(4610, WorldBuilder.getGroundY(4610) - 16);

    this.time.delayedCall(2200, () => {
      this.isCatPurring = false;
      this.catSprite.setFrame(2);
    });
  }

  private lookThroughTelescope() {
    pixelSound.playInteract();
    this.cameraController.setTargetZoom(1.55);
    useWorldStore.getState().openPostcard();
  }

  private spawnHeartParticles(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const offsetX = (i - 1) * 9 + (Math.random() * 4 - 2);
      const heart = this.add.sprite(x + offsetX, y, 'particle_heart');
      heart.setDepth(30);
      heart.setScale(0.85);
      this.tweens.add({
        targets: heart,
        y: y - 26 - Math.random() * 12,
        x: heart.x + (Math.random() * 14 - 7),
        alpha: { from: 1, to: 0 },
        duration: 900 + i * 200,
        ease: 'Cubic.easeOut',
        onComplete: () => heart.destroy()
      });
    }
  }

  private triggerLandmarkInteraction(location: WorldLocation) {
    if (this.isEnteringLandmark) return;
    this.isEnteringLandmark = true;
    const store = useWorldStore.getState();
    store.setPlayerState('INTERACTING');

    // Play retro interaction sound
    pixelSound.playInteract();

    // 1. Focus Camera onto the landmark entrance
    this.cameraController.setTargetZoom(1.52);

    // 2. Character happy hop toward the door
    const currentY = WorldBuilder.getGroundY(this.walker.x);
    this.tweens.add({
      targets: this.walker,
      y: currentY - 8,
      duration: 120,
      yoyo: true,
      ease: 'Sine.easeOut'
    });

    // 3. Subtle camera flash transition
    this.cameras.main.flash(180, 255, 255, 255, false);

    // 4. Enter a walkable room; the work UI opens at the room's interaction point.
    this.landmarkTransition = this.time.delayedCall(160, () => {
      this.landmarkTransition = null;
      const state = useWorldStore.getState();
      if (!this.isEnteringLandmark || state.currentView !== 'game' || state.activeInterior ||
          state.activeLandmarkModal || state.isOverlayOpen || state.playerState !== 'INTERACTING') {
        this.cancelLandmarkTransition();
        return;
      }
      this.isEnteringLandmark = false;
      if (isInteriorId(location.id)) {
        store.enterInterior(location.id);
      } else {
        // Fallback for general landmarks (entrance, central plaza, etc.)
        store.openLocationOverlay(location);
      }
    });
  }

  private enterPrintHouse() {
    useWorldStore.getState().enterInterior('print-house');
  }

  private resetInputs(clearVirtual = false) {
    this.rawKeys = {
      left: false, right: false, up: false, down: false,
      accelerate: false, brake: false, action: false,
    };
    this.pendingAction = false;
    this.previousVirtualAction = false;
    this.input.keyboard?.resetKeys();
    if (clearVirtual) {
      const store = useWorldStore.getState();
      if (Object.values(store.virtualInput).some(Boolean)) {
        store.setVirtualInput({
          left: false, right: false, up: false, down: false,
          action: false, accelerate: false, brake: false,
        });
      }
    }
  }

  private enterInterior(id: InteriorId) {
    const location = WORLD_LOCATIONS.find((item) => item.id === id);
    if (!location) return;
    this.cancelLandmarkTransition();
    this.cancelEndingRide();
    this.resetInputs(true);
    this.isEnteringLandmark = false;
    // Direct navigation from the index must also establish the correct parked bike.
    if (!this.walker.sprite.visible || this.activeParkedLocation?.id !== id) {
      this.dismountBike(location);
      this.walker.setPosition(location.interactionX, WorldBuilder.getGroundY(location.interactionX) + 1);
    }
    this.tweens.killTweensOf(this.walker);
    this.walker.y = WorldBuilder.getGroundY(this.walker.x) + 1;
    this.interiorReturnPosition = { x: this.walker.x, y: this.walker.y };
    this.walker.velocityX = 0;
    this.bike.velocityX = 0;
    pixelSound.stopBikeRoll();
    this.updatePromptBubble(null, 0, 0, this.time.now);
    this.objectGlow.clear();this.showPointerGlow(null);
    const store = useWorldStore.getState();
    store.setNearParkingZone(null);
    store.setNearInteraction(null);
    store.setNearParkedBike(false);
    this.cameraController.setTargetZoom(1.4);
    this.cameraController.currentCamera.setZoom(1.4);
    this.scene.pause('WorldScene');
    if (this.scene.isActive('InteriorScene')) {
      this.scene.get('InteriorScene').scene.restart({ id });
    } else {
      this.scene.launch('InteriorScene', { id });
    }
  }

  private cancelLandmarkTransition() {
    if (!this.isEnteringLandmark && !this.landmarkTransition) return;
    this.landmarkTransition?.remove(false);
    this.landmarkTransition = null;
    this.isEnteringLandmark = false;
    this.tweens.killTweensOf(this.walker);
    this.walker.y = WorldBuilder.getGroundY(this.walker.x) + 1;
    this.cameraController.setTargetZoom(1.4);
    const store = useWorldStore.getState();
    if (store.playerState === 'INTERACTING' && !store.activeInterior &&
        !store.activeLandmarkModal && !store.isOverlayOpen && !store.isPostcardOpen && !store.isEndingModalOpen) {
      store.setPlayerState('WALKING');
    }
  }

  private mountBike() {
    const mountX = this.parkedBikeSprite.x;

    // 1. Hide walker and parked bike
    this.walker.setVisible(false);
    this.parkedBikeSprite.setVisible(false);

    // 2. Position and show bike with dual-wheel slope grounding
    const yR = WorldBuilder.getGroundY(mountX - 13) + 1;
    const yF = WorldBuilder.getGroundY(mountX + 9) + 1;
    const sinT = Math.max(-1, Math.min(1, (yF - yR) / 22));
    const rot = Math.asin(sinT);
    this.bike.setPosition(mountX, (yR + yF + 4 * sinT) / 2);
    this.bike.setRotation(rot);
    this.bike.setVisible(true);

    // Play retro mount sound
    pixelSound.playMount();

    const mountY = (yR + yF + 4 * sinT) / 2;

    // Suspension bounce animation on mount
    this.bike.sprite.setScale(1.0, 0.88);
    this.tweens.add({
      targets: this.bike.sprite,
      scaleY: 1.0,
      duration: 150,
      ease: 'Back.easeOut'
    });

    // Spawn tiny mount dust
    this.spawnDustFX(mountX, mountY);

    // 3. Update state
    this.activeParkedLocation = null;
    const store = useWorldStore.getState();
    store.setPlayerState('RIDING');
    store.setNearParkedBike(false);
    store.setNearInteraction(null);
  }

  private isEndingRide = false;

  private playEndingRideOut() {
    const store = useWorldStore.getState();
    if(this.isEndingRide||store.currentView!=='game'||store.activeInterior||store.isOverlayOpen||store.activeLandmarkModal||store.isEndingModalOpen)return;
    const playerX=store.playerState==='WALKING'?this.walker.x:this.bike.x;
    if(playerX<WorldBuilder.TOTAL_WORLD_WIDTH-240)return;
    this.cancelEndingRide();
    this.isEndingRide = true;
    const generation=++this.endingGeneration;

    // If currently walking, mount bike first
    if (store.playerState === 'WALKING') {
      this.mountBike();
    }
    this.endingStartPosition={x:this.bike.x,y:this.bike.y};
    store.setPlayerState('INTERACTING');
    this.resetInputs(true);
    this.pointerGlow.clear();
    pixelSound.stopBikeRoll();

    // Ensure prompt bubble is hidden
    this.updatePromptBubble(null, 0, 0, 0);

    // Play mount/ride sound
    pixelSound.playMount();

    // Start bike pedaling animation
    this.bike.facing = 1;
    this.bike.sprite.setFlipX(false);
    this.bike.sprite.play('bike_pedal');

    // Freeze the current camera and cross its actual right edge before showing UI.
    const targetX = Math.max(this.bike.x+180,this.cameras.main.worldView.right+80);

    this.endingTween=this.tweens.add({
      targets: this.bike,
      x: targetX,
      duration: 2100,
      ease: 'Quad.easeIn',
      onUpdate: () => {
        const currentY = WorldBuilder.getGroundY(this.bike.x) + 1;
        this.bike.setPosition(this.bike.x, currentY);
        if (Math.random() < 0.4) {
          this.spawnDustFX(this.bike.x - 14, currentY);
        }
      },
      onComplete: () => {
        this.endingTween=null;
        if(generation!==this.endingGeneration||!this.isEndingRide)return;
        // Rider has physically ridden completely off the screen!
        this.bike.setVisible(false);

        // Pause briefly in quiet scenic horizon, then pop up "谢谢参观" modal!
        this.endingDelay=this.time.delayedCall(400, () => {
          this.endingDelay=null;
          const state=useWorldStore.getState();
          if(generation!==this.endingGeneration||!this.isEndingRide||state.currentView!=='game'||state.activeInterior)return;
          state.openEndingModal();
        });
      }
    });
  }

  private cancelEndingRide() {
    const wasRidingOut=this.isEndingRide;
    this.endingGeneration++;
    this.endingTween?.stop();this.endingTween=null;
    this.endingDelay?.remove(false);this.endingDelay=null;
    if(this.bike)this.tweens.killTweensOf(this.bike);
    this.isEndingRide=false;
    if(wasRidingOut&&this.endingStartPosition&&this.bike){
      this.bike.setPosition(this.endingStartPosition.x,this.endingStartPosition.y);this.bike.setVisible(true);this.bike.velocityX=0;this.bike.sprite.stop();
      const s=useWorldStore.getState();
      if(s.playerState==='INTERACTING'&&!s.isEndingModalOpen&&!s.activeInterior&&!s.isOverlayOpen&&!s.activeLandmarkModal)s.setPlayerState('RIDING');
    }
    this.endingStartPosition=null;
  }

  private handleTeleport(targetX: number, desiredState?: PlayerState) {
    this.cancelLandmarkTransition();
    this.cancelEndingRide();
    this.resetInputs(true);
    this.interiorReturnPosition=null;
    this.tweens.killTweensOf(this.walker);
    this.tweens.killTweensOf(this.bike.sprite);
    const store=useWorldStore.getState();
    const ride=desiredState==='RIDING'||(!desiredState&&store.playerState==='RIDING');
    const targetY = WorldBuilder.getGroundY(targetX);
    if(ride){
      this.walker.setVisible(false);this.parkedBikeSprite.setVisible(false);this.activeParkedLocation=null;
      this.bike.setPosition(targetX,targetY+1);this.bike.setVisible(true);this.bike.velocityX=0;this.bike.facing=1;this.bike.sprite.setFlipX(false);this.bike.setRotation(0);this.bike.sprite.setScale(1);
      store.setPlayerState('RIDING');
    }else{
      const closest = WORLD_LOCATIONS.find((loc) => Math.abs(loc.parkingX - targetX) < 150) || WORLD_LOCATIONS[0];
      this.dismountBike(closest);this.tweens.killTweensOf(this.walker);this.walker.setPosition(targetX, targetY + 1);this.walker.setAlpha(1);
    }
    store.setNearInteraction(null);store.setNearParkedBike(false);store.setNearParkingZone(null);store.updatePlayerPos(targetX,targetY+1,0);
    this.cameraController.setTargetZoom(1.4);
    this.cameraController.currentCamera.setZoom(1.4);
    this.cameraController.initCenter(targetX, targetY + 1);
  }

  private updatePromptBubble(
    desiredKey: string | null,
    targetX: number,
    targetY: number,
    time: number
  ) {
    if (!desiredKey) {
      if (this.currentBubbleKey !== null) {
        this.currentBubbleKey = null;
        if (this.bubbleTween) {
          this.bubbleTween.stop();
        }
        this.bubbleTween = this.tweens.add({
          targets: this.promptBubbleSprite,
          scale: 0,
          duration: 140,
          ease: 'Back.easeIn',
          onComplete: () => {
            this.promptBubbleSprite.setVisible(false);
          }
        });
      }
      return;
    }

    const floatOffset = Math.sin(time * 0.006) * 2;
    this.promptBubbleSprite.setPosition(targetX, targetY - 52 + floatOffset);

    if (this.currentBubbleKey !== desiredKey) {
      this.currentBubbleKey = desiredKey;
      this.promptBubbleSprite.setTexture(desiredKey);
      this.promptBubbleSprite.setVisible(true);
      if (this.bubbleTween) {
        this.bubbleTween.stop();
      }
      this.promptBubbleSprite.setScale(0);
      this.bubbleTween = this.tweens.add({
        targets: this.promptBubbleSprite,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    }
  }
}
