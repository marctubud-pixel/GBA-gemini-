import Phaser from 'phaser';
import { PixelArtGenerator } from '../world/PixelArtGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Generate all GBA Coastal Pixel Art textures
    PixelArtGenerator.generateAllTextures(this);
  }

  create() {
    // Transition immediately to WorldScene
    this.scene.start('WorldScene');
  }
}
