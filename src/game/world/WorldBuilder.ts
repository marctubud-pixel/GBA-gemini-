import Phaser from 'phaser';
import { WORLD_LOCATIONS, WorldLocation } from '../../data/locations';
import { WORLD_SEGMENTS } from '../../data/worldSegments';

export class WorldBuilder {
  private scene: Phaser.Scene;

  // Road geometry constants (adjusted for dense 3-building gap layout)
  public static readonly FLAT_GROUND_Y = 270;
  public static readonly HILL_START_X = 5000;
  public static readonly HILL_END_X = 6600;
  public static readonly SUMMIT_GROUND_Y = 135; // 135px elevation rise
  public static readonly TOTAL_WORLD_WIDTH = 7400;

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
   * Returns slope speed multiplier (1.0 on flat, 0.82 on uphill)
   */
  public static getSlopeFactor(x: number): number {
    if (x >= WorldBuilder.HILL_START_X && x <= WorldBuilder.HILL_END_X) {
      return 0.82; // Noticeable but brisk uphill
    }
    return 1.0;
  }

  /**
   * Builds all visual layers
   */
  public buildWorld() {
    this.buildSkyAndClouds();
    this.buildSeaAndDistantIslands();
    this.buildBackgroundTownhouses();
    this.buildRoadAndGround();
    this.buildLandmarks();
    this.buildStreetDecorations();
  }

  private buildSkyAndClouds() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;

    // 1. Sky Gradient (Layer 1, ScrollFactor 0.08)
    const sky = this.scene.add.graphics();
    sky.fillGradientStyle(0x60bde5, 0x60bde5, 0xbbe7f9, 0xbbe7f9, 1);
    sky.fillRect(0, 0, totalW, 360);
    sky.setScrollFactor(0.08, 0.08);
    sky.setDepth(1);

    // 2. Pixel Clouds in Sky
    const clouds = this.scene.add.graphics();
    clouds.fillStyle(0xffffff, 0.85);
    clouds.setScrollFactor(0.12, 0.12);
    clouds.setDepth(2);

    for (let cx = 80; cx < totalW; cx += 320) {
      const cy = 35 + (cx % 3) * 15;
      // Multi-cluster pixel cloud
      clouds.fillRect(cx, cy, 60, 14);
      clouds.fillRect(cx + 8, cy - 8, 44, 8);
      clouds.fillRect(cx + 16, cy - 14, 28, 6);
      clouds.fillRect(cx - 8, cy + 4, 76, 10);
    }
  }

  private buildSeaAndDistantIslands() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;

    // 1. Ocean Horizon (Layer 2, ScrollFactor 0.2)
    const sea = this.scene.add.graphics();
    sea.setScrollFactor(0.2, 0.2);
    sea.setDepth(3);

    // Deep teal-blue sea horizon
    sea.fillStyle(0x2d8da0, 1);
    sea.fillRect(0, 175, totalW, 95);
    sea.fillStyle(0x216d7d, 1);
    sea.fillRect(0, 220, totalW, 55);

    // Glistening pixel waves
    sea.fillStyle(0x78c8ec, 0.7);
    for (let wx = 30; wx < totalW; wx += 90) {
      sea.fillRect(wx, 190, 24, 2);
      sea.fillRect(wx + 35, 205, 30, 2);
      sea.fillRect(wx + 65, 225, 20, 2);
    }

    // 2. Distant Coastal Hills / Islands (as seen in the reference Future Hill strip)
    const islands = this.scene.add.graphics();
    islands.setScrollFactor(0.3, 0.3);
    islands.setDepth(4);

    // Rolling soft blue-green island silhouettes on the horizon
    islands.fillStyle(0x458b9b, 0.75);
    for (let ix = 0; ix < totalW; ix += 480) {
      islands.beginPath();
      islands.moveTo(ix, 210);
      islands.lineTo(ix + 120, 160);
      islands.lineTo(ix + 260, 175);
      islands.lineTo(ix + 380, 210);
      islands.closePath();
      islands.fill();
    }
  }

  /**
   * Midground: Charming Mediterranean / European coastal townhouses with terracotta & cream roofs
   * (Directly reference Strip 2 & Strip 3 in the user's uploaded image!)
   */
  private buildBackgroundTownhouses() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;
    const town = this.scene.add.graphics();
    town.setScrollFactor(0.65, 0.65);
    town.setDepth(5);

    // Build charming rooftop skyline between x: 500 and 4900 (Main Town area)
    for (let tx = 400; tx < 4900; tx += 95) {
      const houseH = 75 + (tx % 4) * 16;
      const houseW = 85 + (tx % 3) * 12;
      const roofY = 270 - houseH;

      // House facade (Warm Cream / Soft Beige / Pale Terracotta)
      const colors = [0xfcf6e5, 0xf6ebd1, 0xfae5cc, 0xf0e6d2];
      town.fillStyle(colors[tx % colors.length], 1);
      town.fillRect(tx, roofY, houseW, houseH);

      // Sloped Terracotta Roof
      const roofColors = [0xdd6242, 0xc95335, 0xe07255];
      town.fillStyle(roofColors[tx % roofColors.length], 1);
      town.beginPath();
      town.moveTo(tx - 4, roofY);
      town.lineTo(tx + houseW / 2, roofY - 18);
      town.lineTo(tx + houseW + 4, roofY);
      town.closePath();
      town.fill();

      // Chimney
      town.fillStyle(0xbb553b, 1);
      town.fillRect(tx + houseW - 16, roofY - 26, 8, 14);

      // Windows with Blue / Charcoal Shutters
      town.fillStyle(0x192736, 1);
      town.fillRect(tx + 12, roofY + 18, 14, 20);
      town.fillRect(tx + houseW - 26, roofY + 18, 14, 20);
      // Window panes glow
      town.fillStyle(0x78c8ec, 0.8);
      town.fillRect(tx + 14, roofY + 20, 10, 16);
      town.fillRect(tx + houseW - 24, roofY + 20, 10, 16);

      // Background clock tower spire at Central Plaza backdrop (around x = 850)
      if (tx >= 800 && tx <= 900) {
        town.fillStyle(0xfcf6e5, 1);
        town.fillRect(tx + 30, roofY - 55, 30, 55);
        town.fillStyle(0xdd6242, 1);
        town.beginPath();
        town.moveTo(tx + 26, roofY - 55);
        town.lineTo(tx + 45, roofY - 95);
        town.lineTo(tx + 64, roofY - 55);
        town.closePath();
        town.fill();
        // Clock face
        town.fillStyle(0xffffff, 1);
        town.fillRect(tx + 38, roofY - 45, 14, 14);
      }
    }
  }

  private buildRoadAndGround() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;
    const roadGraphics = this.scene.add.graphics();
    roadGraphics.setDepth(10);

    const step = 15;
    for (let x = 0; x < totalW; x += step) {
      const y1 = WorldBuilder.getGroundY(x);
      const y2 = WorldBuilder.getGroundY(x + step);

      // Sidewalk (paved stone curb top 14px)
      roadGraphics.fillStyle(0xe8edf2, 1);
      roadGraphics.beginPath();
      roadGraphics.moveTo(x, y1 - 14);
      roadGraphics.lineTo(x + step, y2 - 14);
      roadGraphics.lineTo(x + step, y2);
      roadGraphics.lineTo(x, y1);
      roadGraphics.closePath();
      roadGraphics.fill();

      // Stone curb trim line
      roadGraphics.fillStyle(0xc5d1dc, 1);
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

      // Stone bedrock/foundation below road
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
    // 01 Entrance (x: 300)
    this.addBuilding(300, 'landmark_entrance', 0.5, 0.95);

    // 02 Plaza (x: 900)
    this.addBuilding(900, 'landmark_plaza', 0.5, 0.95);

    // 03 Print House (x: 1500)
    this.addBuilding(1500, 'landmark_print_house', 0.5, 0.95);

    // 04 Brand Museum (x: 2100)
    this.addBuilding(2100, 'landmark_brand_museum', 0.5, 0.95);

    // 05 Marc Cinema (x: 2740, Hero Building!)
    this.addBuilding(2740, 'landmark_marc_cinema', 0.5, 0.95);

    // 06 Experiment Lab (x: 3380)
    this.addBuilding(3380, 'landmark_experiment_lab', 0.5, 0.95);

    // 07 Arcade (x: 4020)
    this.addBuilding(4020, 'landmark_arcade', 0.5, 0.95);

    // 08 My Studio (x: 4660)
    this.addBuilding(4660, 'landmark_my_studio', 0.5, 0.95);

    // Outdoor stone stairs leading up between Studio and Hill (x: 4850)
    this.addBuilding(4880, 'prop_outdoor_stairs', 0.5, 0.95);

    // 10 Observatory (x: 6900, on the summit plateau!)
    this.addBuilding(6900, 'landmark_observatory', 0.5, 0.95);
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

    // Place trees, ornate lampposts with flower baskets, guardrails, and signs
    for (let x = 60; x < totalW - 60; x += 110) {
      const gy = WorldBuilder.getGroundY(x);

      // Future Hill gets tall cypress trees, stone retaining walls, wildflowers and directional signs!
      if (x >= WorldBuilder.HILL_START_X && x <= WorldBuilder.HILL_END_X) {
        if (x % 240 === 0) {
          const cypress = this.scene.add.sprite(x, gy, 'prop_cypress');
          cypress.setOrigin(0.5, 0.95);
          cypress.setDepth(7);
        }
        if (x % 140 === 0) {
          const wall = this.scene.add.sprite(x, gy - 16, 'prop_stone_wall');
          wall.setOrigin(0.5, 0.95);
          wall.setDepth(6);
        }
        const grass = this.scene.add.sprite(x + 40, gy, 'prop_grass');
        grass.setOrigin(0.5, 0.95);
        grass.setDepth(9);

        // Direction sign on the hill: "HIGHER → FURTHER → A BRIGHTER YOU →"
        if (x === 5400) {
          const sign = this.scene.add.sprite(x, gy, 'prop_hill_sign');
          sign.setOrigin(0.5, 0.95);
          sign.setDepth(14);
        }
      } else {
        // Main Town ornate black lampposts with hanging flower baskets
        if (x % 220 === 0 && !this.isNearBuildingCenter(x)) {
          const lamp = this.scene.add.sprite(x, gy, 'prop_lamp');
          lamp.setOrigin(0.5, 0.95);
          lamp.setDepth(15);
        }
        // Coastal / Town trees between buildings
        if (x % 340 === 0 && !this.isNearBuildingCenter(x)) {
          const tree = this.scene.add.sprite(x, gy, 'prop_tree');
          tree.setOrigin(0.5, 0.95);
          tree.setDepth(7);
        }
      }

      // Seaside guardrails for entrance & seaside hill portions
      if (x < 650 || (x > 4950 && x < 6650)) {
        if (x % 80 === 0) {
          const rail = this.scene.add.sprite(x, gy, 'prop_guardrail');
          rail.setOrigin(0.5, 0.95);
          rail.setDepth(12);
        }
      }
    }

    // Add Parked Bike indicator stands right next to each building entrance
    WORLD_LOCATIONS.forEach((loc) => {
      const gy = WorldBuilder.getGroundY(loc.parkingX);
      const pSign = this.scene.add.graphics();
      // Blue badge with white P
      pSign.fillStyle(0x2e6db4, 1);
      pSign.fillRect(loc.parkingX - 8, gy - 48, 16, 14);
      pSign.fillRect(loc.parkingX - 2, gy - 34, 4, 32);
      pSign.fillStyle(0xffffff, 1);
      pSign.fillRect(loc.parkingX - 4, gy - 45, 3, 8);
      pSign.fillRect(loc.parkingX - 4, gy - 45, 7, 2);
      pSign.fillRect(loc.parkingX - 4, gy - 41, 7, 2);
      pSign.fillRect(loc.parkingX, gy - 45, 3, 5);
      pSign.setDepth(9);
    });
  }

  private isNearBuildingCenter(x: number): boolean {
    return WORLD_LOCATIONS.some((loc) => Math.abs(loc.x - x) < 90);
  }
}
