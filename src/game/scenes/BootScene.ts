import Phaser from 'phaser';
import { PixelArtGenerator } from '../world/PixelArtGenerator';
import { registerJourneyTextures } from '../../app/journeyTextures';
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // 1. Load clean, redrawn 1:1 authentic character & bike sprite sheets
    this.load.spritesheet('bike_ride_sheet', '/assets/bike_ride_sheet.png', {
      frameWidth: 50,
      frameHeight: 50
    });
    this.load.image('bike_idle_img', '/assets/bike_idle.png');
    this.load.image('bike_parked', '/assets/bike_parked.png');
    this.load.spritesheet('character_walk_sheet', '/assets/character_walk_sheet.png', {
      frameWidth: 32,
      frameHeight: 50
    });
    this.load.spritesheet('character_idle_sheet', '/assets/character_idle_sheet.png', {
      frameWidth: 32,
      frameHeight: 50
    });
  }

  create() {
    // 3. Generate procedural pixel art textures (props, clouds, waves, landmarks)
    PixelArtGenerator.generateAllTextures(this);
    registerJourneyTextures(this.textures);

    // Transition immediately to WorldScene
    this.scene.start('WorldScene');
  }
}
