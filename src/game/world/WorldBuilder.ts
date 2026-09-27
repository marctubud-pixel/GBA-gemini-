import Phaser from 'phaser';
import { WORLD_LOCATIONS, WorldLocation } from '../../data/locations';
import { WORLD_SEGMENTS } from '../../data/worldSegments';

export class WorldBuilder {
  private scene: Phaser.Scene;

  // Road geometry constants
  public static readonly FLAT_GROUND_Y = 270;
  public static readonly HILL_START_X = 9000;
  public static readonly HILL_END_X = 10800;
  public static readonly SUMMIT_GROUND_Y = 130; // 140px elevation rise
  public static readonly TOTAL_WORLD_WIDTH = 12000;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Returns ground Y level at any given X position
   */
  public static getGroundY(x: number): number {
    if (x < WorldBuilder.HILL_START_X) {
      return WorldBuilder.FLAT_GROUND_Y;
    }
    if (x >= WorldBuilder.HILL_START_X && x <= WorldBuilder.HILL_END_X) {
      const t = (x - WorldBuilder.HILL_START_X) / (WorldBuilder.HILL_END_X - WorldBuilder.HILL_START_X);
      // Smooth sinusoidal / cubic easing for natural hill incline
      const smoothT = t * t * (3 - 2 * t);
      return WorldBuilder.FLAT_GROUND_Y - smoothT * (WorldBuilder.FLAT_GROUND_Y - WorldBuilder.SUMMIT_GROUND_Y);
    }
    return WorldBuilder.SUMMIT_GROUND_Y;
  }

  /**
   * Returns slope speed multiplier (1.0 on flat, 0.78 on uphill)
   */
  public static getSlopeFactor(x: number): number {
    if (x >= WorldBuilder.HILL_START_X && x <= WorldBuilder.HILL_END_X) {
      return 0.78; // Gentle uphill reduction as requested
    }
    return 1.0;
  }

  /**
   * Builds all visual layers
   */
  public buildWorld() {
    this.buildSkyAndSea();
    this.buildDistantHills();
    this.buildRoadAndGround();
    this.buildLandmarks();
    this.buildStreetDecorations();
  }

  private buildSkyAndSea() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;

    // 1. Sky Gradient TileSprite (Layer 1, ScrollFactor 0.1)
    const sky = this.scene.add.graphics();
    sky.fillGradientStyle(0x78c8ec, 0x78c8ec, 0xafe2f7, 0xafe2f7, 1);
    sky.fillRect(0, 0, totalW, 360);
    sky.setScrollFactor(0.1, 0.1);
    sky.setDepth(1);

    // 2. Clear Teal Sea (Layer 2, visible in coastal segments and hill)
    const seaGraphics = this.scene.add.graphics();
    seaGraphics.fillStyle(0x2a8b9f, 1);
    // Sea horizon at y = 180
    seaGraphics.fillRect(0, 180, totalW, 100);
    seaGraphics.fillStyle(0x216d7d, 1);
    seaGraphics.fillRect(0, 220, totalW, 60);
    seaGraphics.setScrollFactor(0.25, 0.25);
    seaGraphics.setDepth(2);

    // Pixel wave glints
    seaGraphics.fillStyle(0x78c8ec, 0.6);
    for (let wx = 50; wx < totalW; wx += 120) {
      seaGraphics.fillRect(wx, 195, 20, 2);
      seaGraphics.fillRect(wx + 40, 210, 30, 2);
      seaGraphics.fillRect(wx + 80, 230, 24, 2);
    }
  }

  private buildDistantHills() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;
    const hills = this.scene.add.graphics();
    hills.setScrollFactor(0.4, 0.4);
    hills.setDepth(3);

    // Distant mountain ranges
    hills.fillStyle(0x3b8750, 0.5);
    for (let hx = 0; hx < totalW; hx += 350) {
      const peakY = 150 + Math.sin(hx * 0.003) * 30;
      hills.beginPath();
      hills.moveTo(hx, 270);
      hills.lineTo(hx + 175, peakY);
      hills.lineTo(hx + 350, 270);
      hills.closePath();
      hills.fill();
    }
  }

  private buildRoadAndGround() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;
    const roadGraphics = this.scene.add.graphics();
    roadGraphics.setDepth(10);

    const step = 20;
    for (let x = 0; x < totalW; x += step) {
      const y1 = WorldBuilder.getGroundY(x);
      const y2 = WorldBuilder.getGroundY(x + step);

      // Sidewalk (top 14px)
      roadGraphics.fillStyle(0xe2e8f0, 1);
      roadGraphics.beginPath();
      roadGraphics.moveTo(x, y1 - 14);
      roadGraphics.lineTo(x + step, y2 - 14);
      roadGraphics.lineTo(x + step, y2);
      roadGraphics.lineTo(x, y1);
      roadGraphics.closePath();
      roadGraphics.fill();

      // Curb highlight line
      roadGraphics.fillStyle(0xcbd5e1, 1);
      roadGraphics.fillRect(x, y1 - 1, step, 2);

      // Road surface (Cool blue-gray #8699a7)
      roadGraphics.fillStyle(0x8699a7, 1);
      roadGraphics.beginPath();
      roadGraphics.moveTo(x, y1);
      roadGraphics.lineTo(x + step, y2);
      roadGraphics.lineTo(x + step, y2 + 65);
      roadGraphics.lineTo(x, y1 + 65);
      roadGraphics.closePath();
      roadGraphics.fill();

      // Underground bedrock/retaining foundation below road
      roadGraphics.fillStyle(0x192736, 1);
      roadGraphics.beginPath();
      roadGraphics.moveTo(x, y1 + 65);
      roadGraphics.lineTo(x + step, y2 + 65);
      roadGraphics.lineTo(x + step, 450);
      roadGraphics.lineTo(x, 450);
      roadGraphics.closePath();
      roadGraphics.fill();
    }
  }

  private buildLandmarks() {
    // 01 Entrance
    this.addBuilding(480, 'landmark_entrance', 0.5, 0.95);

    // 02 Plaza
    this.addBuilding(1550, 'landmark_plaza', 0.5, 0.95);

    // 03 Print House
    this.addBuilding(2650, 'landmark_print_house', 0.5, 0.95);

    // 04 Brand Museum
    this.addBuilding(3800, 'landmark_brand_museum', 0.5, 0.95);

    // 05 Marc Cinema (Hero Building)
    this.addBuilding(5050, 'landmark_marc_cinema', 0.5, 0.95);

    // 06 Experiment Lab
    this.addBuilding(6250, 'landmark_experiment_lab', 0.5, 0.95);

    // 07 Arcade
    this.addBuilding(7350, 'landmark_arcade', 0.5, 0.95);

    // 08 My Studio
    this.addBuilding(8450, 'landmark_my_studio', 0.5, 0.95);

    // 10 Observatory (On Summit)
    this.addBuilding(11400, 'landmark_observatory', 0.5, 0.95);
  }

  private addBuilding(x: number, texture: string, originX = 0.5, originY = 0.95) {
    const y = WorldBuilder.getGroundY(x);
    const b = this.scene.add.sprite(x, y, texture);
    b.setOrigin(originX, originY);
    b.setDepth(8); // Behind street lamps and player
    return b;
  }

  private buildStreetDecorations() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;

    // Place trees, street lamps, guardrails, and banners
    for (let x = 100; x < totalW - 100; x += 180) {
      const gy = WorldBuilder.getGroundY(x);

      // Future Hill gets tall cypress trees and stone retaining walls
      if (x >= WorldBuilder.HILL_START_X && x <= WorldBuilder.HILL_END_X) {
        if (x % 360 === 0) {
          const cypress = this.scene.add.sprite(x, gy, 'prop_cypress');
          cypress.setOrigin(0.5, 0.95);
          cypress.setDepth(7);
        }
        if (x % 200 === 0) {
          const wall = this.scene.add.sprite(x, gy - 20, 'prop_stone_wall');
          wall.setOrigin(0.5, 0.95);
          wall.setDepth(6);
        }
        const grass = this.scene.add.sprite(x + 50, gy, 'prop_grass');
        grass.setOrigin(0.5, 0.95);
        grass.setDepth(9);
      } else {
        // Town street lamps
        if (x % 280 === 0) {
          const lamp = this.scene.add.sprite(x, gy, 'prop_lamp');
          lamp.setOrigin(0.5, 0.95);
          lamp.setDepth(15);
        }
        // Coastal / Town trees
        if (x % 420 === 0 && !this.isNearLandmark(x)) {
          const tree = this.scene.add.sprite(x, gy, 'prop_tree');
          tree.setOrigin(0.5, 0.95);
          tree.setDepth(7);
        }
      }

      // Coastal guardrails for entrance & seaside segments
      if (x < 1000 || (x > 8800 && x < 10700)) {
        if (x % 120 === 0) {
          const rail = this.scene.add.sprite(x, gy, 'prop_guardrail');
          rail.setOrigin(0.5, 0.95);
          rail.setDepth(12);
        }
      }
    }

    // Add Parked Bike indicator sprites at each landmark parking anchor
    WORLD_LOCATIONS.forEach((loc) => {
      const gy = WorldBuilder.getGroundY(loc.parkingX);
      // Bike parking stand / prompt spot
      const pSign = this.scene.add.graphics();
      pSign.fillStyle(0x2e6db4, 1);
      pSign.fillRect(loc.parkingX - 10, gy - 55, 20, 16);
      pSign.fillRect(loc.parkingX - 2, gy - 40, 4, 38);
      pSign.fillStyle(0xffffff, 1);
      // Small "P" letter
      pSign.fillRect(loc.parkingX - 5, gy - 51, 3, 9);
      pSign.fillRect(loc.parkingX - 5, gy - 51, 8, 3);
      pSign.fillRect(loc.parkingX - 5, gy - 46, 8, 3);
      pSign.fillRect(loc.parkingX, gy - 51, 3, 6);
      pSign.setDepth(9);
    });
  }

  private isNearLandmark(x: number): boolean {
    return WORLD_LOCATIONS.some((loc) => Math.abs(loc.x - x) < 130);
  }
}
