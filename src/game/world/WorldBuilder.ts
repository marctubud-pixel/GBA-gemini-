import Phaser from 'phaser';
import { WORLD_LOCATIONS, WorldLocation } from '../../data/locations';
import { WORLD_SEGMENTS } from '../../data/worldSegments';

export class WorldBuilder {
  private scene: Phaser.Scene;

  // Road geometry constants (adjusted for dense 3-building gap layout)
  public static readonly FLAT_GROUND_Y = 270;
  public static readonly HILL_START_X = 5000;
  public static readonly HILL_END_X = 5750;
  public static readonly SUMMIT_GROUND_Y = 175; // 95px elevation rise
  public static readonly TOTAL_WORLD_WIDTH = 6400;

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

  // Dynamic animated environment elements
  private dynamicClouds: { sprite: Phaser.GameObjects.Sprite; speed: number }[] = [];
  private dynamicSeagulls: { sprite: Phaser.GameObjects.Sprite; speedX: number; baseY: number; phase: number }[] = [];
  private dynamicSailboats: { sprite: Phaser.GameObjects.Sprite; baseY: number; phase: number }[] = [];
  private waveGraphics!: Phaser.GameObjects.Graphics;
  private dynamicWaveLines: Array<{
    x: number;
    baseY: number;
    len: number;
    speedX: number;
    phase: number;
    color: number;
    thickness: number;
  }> = [];

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

  /**
   * Called every frame from WorldScene to drive dynamic clouds, sea waves, and sailboats
   */
  public update(time: number, delta: number, cameraX: number = 300) {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;

    // 1. Move parallax clouds gently across the sky
    const dt = delta / 1000;
    for (const cloud of this.dynamicClouds) {
      cloud.sprite.x += cloud.speed * dt;
      // Wrap around world bounds with buffer
      if (cloud.sprite.x > totalW + 200) {
        cloud.sprite.x = -150;
      }
    }

    // 2. Animate seagulls gliding in the sea breeze
    for (const bird of this.dynamicSeagulls) {
      bird.sprite.x += bird.speedX * dt;
      bird.sprite.y = bird.baseY + Math.sin(time * 0.002 + bird.phase) * 6;
      if (bird.speedX > 0 && bird.sprite.x > totalW + 100) {
        bird.sprite.x = -80;
      } else if (bird.speedX < 0 && bird.sprite.x < -100) {
        bird.sprite.x = totalW + 80;
      }
    }

    // 3. Subtle sailboat bobbing on ocean swell
    for (const boat of this.dynamicSailboats) {
      boat.sprite.y = boat.baseY + Math.sin(time * 0.0025 + boat.phase) * 1.5;
    }

    // 4. Animate dynamic ocean wave lines across background sea
    if (this.waveGraphics && this.dynamicWaveLines.length > 0) {
      this.waveGraphics.clear();
      const seaWidth = totalW * 0.20 + 350;

      for (const line of this.dynamicWaveLines) {
        // Drift horizontally with ocean current
        line.x += line.speedX * dt;
        if (line.x > seaWidth) line.x = -line.len - 10;
        else if (line.x < -line.len - 10) line.x = seaWidth;

        // Gentle vertical ocean swell
        const swell = Math.sin(time * 0.0018 + line.phase) * 1.0;
        const currentY = line.baseY + swell;

        // Subtle alpha breathing with tidal rhythm
        const waveSin = Math.sin(time * 0.0025 + line.phase);
        const alpha = Math.max(0.12, 0.22 + 0.20 * waveSin);

        // Draw main wave streak
        this.waveGraphics.fillStyle(line.color, alpha);
        this.waveGraphics.fillRect(line.x, currentY, line.len, line.thickness);

        // Soft white crest highlight in center of line during peak swell
        if (waveSin > 0.55) {
          const crestW = Math.max(4, Math.floor(line.len * 0.4));
          const crestX = line.x + Math.floor((line.len - crestW) / 2);
          this.waveGraphics.fillStyle(0xffffff, Math.min(0.45, (waveSin - 0.55) * 1.0));
          this.waveGraphics.fillRect(crestX, currentY, crestW, line.thickness);
        }
      }
    }
  }

  private buildSkyAndClouds() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;

    // 1. Multi-tone Mediterranean Sky Gradient (Layer 1, ScrollFactor 0.06)
    const sky = this.scene.add.graphics();
    // Vibrant Mediterranean Azure Blue at top to warm crystal cyan at horizon
    sky.fillGradientStyle(0x3584d4, 0x3584d4, 0xd0ebfc, 0xd0ebfc, 1);
    sky.fillRect(0, 0, totalW, 360);
    sky.setScrollFactor(0.06, 0.06);
    sky.setDepth(1);

    // Warm sun-glow horizon strip just above sea level
    const horizonGlow = this.scene.add.graphics();
    horizonGlow.fillStyle(0xf0f9ff, 0.4);
    horizonGlow.fillRect(0, 150, totalW, 25);
    horizonGlow.setScrollFactor(0.06, 0.06);
    horizonGlow.setDepth(1);

    // 2. Multi-layered Parallax Cumulus Clouds (Layer 2, Depth 2)
    // High Altitude Wispy Clouds (Small, very slow, ScrollFactor 0.08)
    const cloudTypes = ['sky_cloud_large', 'sky_cloud_medium', 'sky_cloud_small'];
    
    for (let cx = 50; cx < totalW + 200; cx += 220) {
      const typeIndex = (cx * 13) % cloudTypes.length;
      const cloudKey = cloudTypes[typeIndex];
      const cy = 25 + ((cx * 7) % 55);
      
      const cloudSprite = this.scene.add.sprite(cx, cy, cloudKey);
      cloudSprite.setOrigin(0.5, 0.5);
      
      // Far/small clouds have lower scroll factor and drift slower
      if (cloudKey === 'sky_cloud_small') {
        cloudSprite.setScrollFactor(0.07, 0.07);
        cloudSprite.setDepth(2);
        cloudSprite.setAlpha(0.72);
        this.dynamicClouds.push({ sprite: cloudSprite, speed: 3.5 });
      } else if (cloudKey === 'sky_cloud_medium') {
        cloudSprite.setScrollFactor(0.09, 0.09);
        cloudSprite.setDepth(2);
        cloudSprite.setAlpha(0.88);
        this.dynamicClouds.push({ sprite: cloudSprite, speed: 5.5 });
      } else {
        // Large fluffy cloud
        cloudSprite.setScrollFactor(0.12, 0.12);
        cloudSprite.setDepth(2);
        cloudSprite.setAlpha(0.96);
        this.dynamicClouds.push({ sprite: cloudSprite, speed: 8.0 });
      }
    }

    // 3. Dynamic Animated Flapping Seagulls across coastal skies (Unified canonical 24x15 model)
    if (!this.scene.anims.exists('seagull_flap')) {
      const frames = this.scene.anims.generateFrameNumbers('seagull_sheet', { start: 0, end: 3 });
      if (frames && frames.length > 0) {
        this.scene.anims.create({
          key: 'seagull_flap',
          frames: frames,
          frameRate: 5,
          repeat: -1
        });
      }
    }

    for (let bx = 120; bx < totalW + 200; bx += 320) {
      const by = 85 + ((bx * 7) % 45);
      const bird = this.scene.add.sprite(bx, by, 'seagull_sheet', 0);
      bird.setOrigin(0.5, 0.5);
      bird.setScale(1.0);
      bird.setScrollFactor(0.40, 0.40);
      bird.setDepth(6);
      bird.setAlpha(0.95);
      const isRight = (bx % 3) !== 0;
      bird.setFlipX(!isRight);
      if (this.scene.anims.exists('seagull_flap')) {
        bird.play('seagull_flap');
      }
      this.dynamicSeagulls.push({
        sprite: bird,
        speedX: isRight ? (20 + (bx % 12)) : -(18 + (bx % 10)),
        baseY: by,
        phase: bx * 0.15
      });
    }
  }

  private buildSeaAndDistantIslands() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;

    // 1. Far Sea Horizon & Gradient (Layer 2, ScrollFactor 0.20, Depth 3)
    const sea = this.scene.add.graphics();
    sea.setScrollFactor(0.2, 0.2);
    sea.setDepth(3);

    // Horizon Glisten Line (Sharp sunlit demarcation between sky and water)
    sea.fillStyle(0xbbe7fa, 0.9);
    sea.fillRect(0, 168, totalW, 2);

    // Deep Azure Ocean Body (3-step depth gradient)
    sea.fillStyle(0x1e608a, 1); // Deep sapphire ocean horizon
    sea.fillRect(0, 170, totalW, 30);

    sea.fillStyle(0x277da1, 1); // Vibrant Mediterranean blue mid-sea
    sea.fillRect(0, 200, totalW, 35);

    sea.fillStyle(0x389aa6, 1); // Clear emerald coastal shelf water
    sea.fillRect(0, 235, totalW, 35);

    // 2. Layer 1 Distant Mountains (Very far hazy blue silhouettes, ScrollFactor 0.10, Depth 2)
    const farMountains = this.scene.add.graphics();
    farMountains.setScrollFactor(0.1, 0.1);
    farMountains.setDepth(2);
    farMountains.fillStyle(0x608ea8, 0.45); // Hazy atmospheric blue

    for (let fx = 0; fx < totalW + 400; fx += 520) {
      farMountains.beginPath();
      farMountains.moveTo(fx - 60, 185);
      farMountains.lineTo(fx + 140, 115);
      farMountains.lineTo(fx + 260, 138);
      farMountains.lineTo(fx + 380, 122);
      farMountains.lineTo(fx + 520, 185);
      farMountains.closePath();
      farMountains.fill();
    }

    // Mid-distant mountain ridges (ScrollFactor 0.18, Depth 2)
    const midMountains = this.scene.add.graphics();
    midMountains.setScrollFactor(0.18, 0.18);
    midMountains.setDepth(2);
    midMountains.fillStyle(0x4a7f96, 0.6);

    for (let fx = 100; fx < totalW + 400; fx += 580) {
      midMountains.beginPath();
      midMountains.moveTo(fx - 40, 185);
      midMountains.lineTo(fx + 160, 132);
      midMountains.lineTo(fx + 320, 146);
      midMountains.lineTo(fx + 460, 185);
      midMountains.closePath();
      midMountains.fill();
    }

    // 3. Layer 2 Near Emerald Coastal Islands (Matching Strip 3 & 5 reference art! ScrollFactor 0.24, Depth 3)
    const nearIslands = this.scene.add.graphics();
    nearIslands.setScrollFactor(0.24, 0.24);
    nearIslands.setDepth(3);

    for (let ix = 60; ix < totalW; ix += 480) {
      // Base island body (rich coastal blue-green)
      nearIslands.fillStyle(0x2d6874, 0.85);
      nearIslands.beginPath();
      nearIslands.moveTo(ix - 30, 195);
      nearIslands.lineTo(ix + 90, 154);
      nearIslands.lineTo(ix + 210, 165);
      nearIslands.lineTo(ix + 310, 195);
      nearIslands.closePath();
      nearIslands.fill();

      // Sunlit ridge highlight (lush green terraced slope)
      nearIslands.fillStyle(0x448d7d, 0.75);
      nearIslands.beginPath();
      nearIslands.moveTo(ix + 20, 178);
      nearIslands.lineTo(ix + 90, 154);
      nearIslands.lineTo(ix + 150, 172);
      nearIslands.closePath();
      nearIslands.fill();

      // White island cliff base
      nearIslands.fillStyle(0xe2e8f0, 0.55);
      nearIslands.fillRect(ix + 55, 186, 45, 3);
    }

    // 4. Distant Sailboats gently moored on calm open water
    const boatSpots = [350, 950, 1600, 2300, 3100, 3800, 4500, 5200, 6000];
    for (const bx of boatSpots) {
      const by = 186 + (bx % 16);
      const boat = this.scene.add.sprite(bx, by, 'prop_sailboat');
      boat.setOrigin(0.5, 0.9);
      boat.setScrollFactor(0.22, 0.22);
      boat.setDepth(3);
      boat.setAlpha(0.92);
      this.dynamicSailboats.push({
        sprite: boat,
        baseY: by,
        phase: bx * 0.05
      });
    }

    // 5. Dynamic Animated Glistening Sea Wave Lines System (ScrollFactor 0.20, Depth 4)
    this.waveGraphics = this.scene.add.graphics();
    this.waveGraphics.setScrollFactor(0.20, 0.20);
    this.waveGraphics.setDepth(4);

    // Dynamic wave line elements (drifting horizontal tide lines) across the background open sea
    // Kept sparse, gentle, and subtle matching user request ("不需那么多，减少")
    const waveLineColors = [0xffffff, 0xe0f2fe, 0xbae6fd];
    const seaWidth = totalW * 0.20 + 350; // coordinate space for scrollFactor 0.20
    for (let lx = 60; lx < seaWidth; lx += 190) {
      const row = Math.floor(lx / 190) % 3;
      const by = 188 + row * 11 + ((lx * 7) % 6);
      const len = 20 + ((lx * 9) % 18);
      this.dynamicWaveLines.push({
        x: lx,
        baseY: by,
        len: len,
        speedX: 6 + (row % 3) * 1.8, // gentle uniform tide drift to the right
        phase: lx * 0.15,
        color: waveLineColors[row % waveLineColors.length],
        thickness: 1
      });
    }
  }

  /**
   * Midground: Charming Mediterranean coastal townhouses across all gaps
   * Parallax Depth: ScrollFactor 0.48, Depth 5
   */
  private buildBackgroundTownhouses() {
    const town = this.scene.add.graphics();
    town.setScrollFactor(0.35, 0.35); // Softer, further parallax
    town.setDepth(5);

    // 1. Central Plaza standalone backdrop: Classic Clock Tower & Terracotta Villa
    // Matching Strip 2 of reference art!
    const clockX = 940;
    const clockY = 160;
    // White clock tower body
    town.fillStyle(0xfcf6e5, 1);
    town.fillRect(clockX, clockY, 32, 110);
    // Dark corners
    town.fillStyle(0xd5ccb7, 1);
    town.fillRect(clockX + 28, clockY, 4, 110);
    // Terracotta pyramid spire
    town.fillStyle(0xdd6242, 1);
    town.beginPath();
    town.moveTo(clockX - 3, clockY);
    town.lineTo(clockX + 16, clockY - 42);
    town.lineTo(clockX + 35, clockY);
    town.closePath();
    town.fill();
    // Clock face
    town.fillStyle(0xffffff, 1);
    town.fillRect(clockX + 8, clockY + 12, 16, 16);
    town.fillStyle(0x1e293b, 1);
    town.fillRect(clockX + 15, clockY + 15, 2, 8);
    town.fillRect(clockX + 15, clockY + 20, 6, 2);

    // Adjacent backdrop villa (x = 875..925)
    town.fillStyle(0xf6ebd1, 1);
    town.fillRect(875, 195, 52, 75);
    town.fillStyle(0xdd6242, 1);
    town.beginPath();
    town.moveTo(871, 195);
    town.lineTo(901, 178);
    town.lineTo(931, 195);
    town.closePath();
    town.fill();
    // Villa windows
    town.fillStyle(0x192736, 1);
    town.fillRect(885, 210, 10, 14);
    town.fillRect(907, 210, 10, 14);
    town.fillStyle(0x78c8ec, 0.8);
    town.fillRect(887, 212, 6, 10);
    town.fillRect(909, 212, 6, 10);

    // 2. Delicate distant cypress groves & soft green headlands across building gaps
    // (Preserves open sky & sea visibility matching reference art!)
    const distantGroves = [580, 1260, 1850, 2480, 3120, 3760, 4400];
    for (const gx of distantGroves) {
      // Soft atmospheric distant hillock
      town.fillStyle(0x388277, 0.55);
      town.beginPath();
      town.moveTo(gx - 50, 270);
      town.lineTo(gx + 20, 225);
      town.lineTo(gx + 90, 270);
      town.closePath();
      town.fill();

      // Slender distant cypress silhouettes
      town.fillStyle(0x1b4332, 0.7);
      town.beginPath();
      town.moveTo(gx + 12, 195);
      town.lineTo(gx + 4, 255);
      town.lineTo(gx + 20, 255);
      town.closePath();
      town.fill();

      town.fillStyle(0x2d6874, 0.7);
      town.beginPath();
      town.moveTo(gx + 26, 205);
      town.lineTo(gx + 19, 255);
      town.lineTo(gx + 33, 255);
      town.closePath();
      town.fill();
    }
  }

  /**
   * Foreground Coastal Promenade & Seawater
   * Narrow 12px stone paver promenade with dark grounding baseline and sparkling blue sea below
   */
  private buildRoadAndGround() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;
    const roadGraphics = this.scene.add.graphics();
    roadGraphics.setDepth(10);

    // =========================================================================
    // 1. COASTAL PROMENADE PIER & FOREGROUND BLUE SEA (x < 5000)
    // =========================================================================
    const coastStep = 12;
    for (let x = 0; x < WorldBuilder.HILL_START_X; x += coastStep) {
      const y1 = WorldBuilder.getGroundY(x);

      // 1px Dark Baseline separating building bottoms and planters from sidewalk
      roadGraphics.fillStyle(0x26364b, 1);
      roadGraphics.fillRect(x, y1, coastStep, 1);

      // Narrow Paved Stone Sidewalk (y1 + 1 to y1 + 10: 9px high)
      roadGraphics.fillStyle(0xcad5e2, 1);
      roadGraphics.fillRect(x, y1 + 1, coastStep, 9);

      // Top highlight bevel (y1 + 1)
      roadGraphics.fillStyle(0xe2e8f0, 1);
      roadGraphics.fillRect(x, y1 + 1, coastStep, 1);

      // Stone sidewalk vertical paver seams every 20px
      if (Math.floor(x / 20) !== Math.floor((x + coastStep) / 20)) {
        roadGraphics.fillStyle(0x8b9cb0, 1);
        roadGraphics.fillRect(x, y1 + 1, 1, 9);
      }

      // Stone Quay / Seawall Coping Curb Edge (y1 + 10 to y1 + 12: 2px high)
      roadGraphics.fillStyle(0x64748b, 1);
      roadGraphics.fillRect(x, y1 + 10, coastStep, 1);
      roadGraphics.fillStyle(0x334155, 1);
      roadGraphics.fillRect(x, y1 + 11, coastStep, 1);

      // 2. BLUE SEAWATER (From y1 + 12 down to screen bottom 450)
      // Seawall drop shadow onto water
      roadGraphics.fillStyle(0x0c4a6e, 1);
      roadGraphics.fillRect(x, y1 + 12, coastStep, 2);

      // White & Cyan Lapping Foam Spray along the seawall curb
      const foamWave = Math.sin(x * 0.15);
      const foamH = 2 + Math.floor(foamWave * 1.5);
      roadGraphics.fillStyle(0xffffff, 0.9);
      roadGraphics.fillRect(x, y1 + 14, coastStep, foamH);
      roadGraphics.fillStyle(0x38bdf8, 0.85);
      roadGraphics.fillRect(x, y1 + 14 + foamH, coastStep, 2);

      // Layer 1: Vibrant Coastal Azure Water (y1 + 17 to y1 + 42)
      roadGraphics.fillStyle(0x0284c7, 1);
      roadGraphics.fillRect(x, y1 + 17, coastStep, 25);

      // Layer 2: Deep Mediterranean Sapphire Water (y1 + 42 to y1 + 75)
      roadGraphics.fillStyle(0x0369a1, 1);
      roadGraphics.fillRect(x, y1 + 42, coastStep, 33);

      // Layer 3: Deep Oceanic Marine Blue (y1 + 75 to 450)
      roadGraphics.fillStyle(0x075985, 1);
      roadGraphics.fillRect(x, y1 + 75, coastStep, 450 - (y1 + 75));
    }

    // =========================================================================
    // 2. FUTURE HILL SCENIC MOUNTAIN ROAD & ASHLAR STONE RETAINING WALL (x >= 5000)
    // =========================================================================
    const hillStep = 4;
    const stonePalette = [0x6d7e92, 0x647488, 0x77889c, 0x5b6b7f, 0x7e8f9f];
    const courseH = 16;

    for (let x = WorldBuilder.HILL_START_X; x < totalW; x += hillStep) {
      const y1 = WorldBuilder.getGroundY(x);
      const y2 = WorldBuilder.getGroundY(x + hillStep);

      // 1px Dark Baseline separating ground from road
      roadGraphics.fillStyle(0x1e293b, 1);
      roadGraphics.beginPath();
      roadGraphics.moveTo(x, y1);
      roadGraphics.lineTo(x + hillStep, y2);
      roadGraphics.lineTo(x + hillStep, y2 + 1);
      roadGraphics.lineTo(x, y1 + 1);
      roadGraphics.closePath();
      roadGraphics.fill();

      // Hill Road surface (y1 + 1 to y1 + 10)
      roadGraphics.fillStyle(0xcad5e2, 1);
      roadGraphics.beginPath();
      roadGraphics.moveTo(x, y1 + 1);
      roadGraphics.lineTo(x + hillStep, y2 + 1);
      roadGraphics.lineTo(x + hillStep, y2 + 10);
      roadGraphics.lineTo(x, y1 + 10);
      roadGraphics.closePath();
      roadGraphics.fill();

      // Stone Coping Curb Trim (y1 + 10 to y1 + 15)
      // Top coping highlight
      roadGraphics.fillStyle(0xe2e8f0, 1);
      roadGraphics.beginPath();
      roadGraphics.moveTo(x, y1 + 10);
      roadGraphics.lineTo(x + hillStep, y2 + 10);
      roadGraphics.lineTo(x + hillStep, y2 + 13);
      roadGraphics.lineTo(x, y1 + 13);
      roadGraphics.closePath();
      roadGraphics.fill();

      // Bottom coping shadow
      roadGraphics.fillStyle(0x334155, 1);
      roadGraphics.beginPath();
      roadGraphics.moveTo(x, y1 + 13);
      roadGraphics.lineTo(x + hillStep, y2 + 13);
      roadGraphics.lineTo(x + hillStep, y2 + 15);
      roadGraphics.lineTo(x, y1 + 15);
      roadGraphics.closePath();
      roadGraphics.fill();

      // Base Ashlar Retaining Wall body down to bottom 450
      const wallTop = y1 + 15;
      roadGraphics.fillStyle(0x647488, 1);
      roadGraphics.beginPath();
      roadGraphics.moveTo(x, wallTop);
      roadGraphics.lineTo(x + hillStep, y2 + 15);
      roadGraphics.lineTo(x + hillStep, 450);
      roadGraphics.lineTo(x, 450);
      roadGraphics.closePath();
      roadGraphics.fill();

      // Individual stone courses with horizontal mortar lines & staggered vertical joints
      for (let k = 0; k < 20; k++) {
        const cy = 60 + k * courseH;
        if (cy >= wallTop && cy < 450) {
          // Horizontal mortar joint
          roadGraphics.fillStyle(0x1e293b, 1);
          roadGraphics.fillRect(x, cy, hillStep, 1);
          roadGraphics.fillStyle(0x94a3b8, 0.7);
          roadGraphics.fillRect(x, cy + 1, hillStep, 1);

          // Staggered vertical joints & block tones
          const stagger = (k * 23) % 46;
          const bx = Math.floor((x + stagger) / 46);
          const blockColor = stonePalette[(bx + k * 3) % stonePalette.length];

          if ((x + stagger) % 46 >= hillStep) {
            roadGraphics.fillStyle(blockColor, 1);
            roadGraphics.fillRect(x, cy + 2, hillStep, Math.min(courseH - 2, 450 - cy - 2));
          } else {
            // Vertical mortar joint
            roadGraphics.fillStyle(0x1e293b, 1);
            roadGraphics.fillRect(x, cy + 1, 1, Math.min(courseH - 1, 450 - cy - 1));
            roadGraphics.fillStyle(0x94a3b8, 0.7);
            roadGraphics.fillRect(x + 1, cy + 1, 1, Math.min(courseH - 1, 450 - cy - 1));
          }
        }
      }
    }

    // Trailing Mediterranean ivy vines beneath coping curb
    for (let vx = WorldBuilder.HILL_START_X + 24; vx < totalW - 40; vx += 56) {
      const vy = WorldBuilder.getGroundY(vx) + 14;
      const ivyLeaves = [
        { dx: -6, dy: 8 },
        { dx: -2, dy: 13 },
        { dx: 3, dy: 15 },
        { dx: 8, dy: 9 }
      ];
      for (const leaf of ivyLeaves) {
        // Deep shadow
        roadGraphics.fillStyle(0x1b4332, 1);
        roadGraphics.fillEllipse(vx + leaf.dx, vy + leaf.dy / 2, 6, leaf.dy);
        // Leafy green
        roadGraphics.fillStyle(0x52a64c, 1);
        roadGraphics.fillEllipse(vx + leaf.dx, vy + leaf.dy / 2, 4, Math.max(2, leaf.dy - 3));
        // Sunlit highlight
        roadGraphics.fillStyle(0x72be55, 1);
        roadGraphics.fillEllipse(vx + leaf.dx, vy + leaf.dy / 2 - 1, 2, Math.max(2, leaf.dy - 6));
      }
    }

    // Dynamic wave ripples across coastal sea (x < 5000)
    const waveGraphics = this.scene.add.graphics();
    waveGraphics.setDepth(11);
    for (let wx = 20; wx < WorldBuilder.HILL_START_X - 40; wx += 68) {
      const wy1 = WorldBuilder.getGroundY(wx);
      const rowOffset = (wx * 11) % 5;

      // Surface soft azure glint (wy1 + 25)
      if (wx % 80 < 55) {
        waveGraphics.fillStyle(0x7dd3fc, 0.7);
        waveGraphics.fillRect(wx, wy1 + 25 + rowOffset, 16, 1);
        waveGraphics.fillRect(wx + 3, wy1 + 26 + rowOffset, 10, 1);
        waveGraphics.fillStyle(0xffffff, 0.65);
        waveGraphics.fillRect(wx + 5, wy1 + 25 + rowOffset, 6, 1);
      }

      // Mid-depth sapphire wave crest (wy1 + 48)
      if ((wx + 35) % 90 < 60) {
        waveGraphics.fillStyle(0x38bdf8, 0.6);
        waveGraphics.fillRect(wx + 16, wy1 + 48 + ((wx * 7) % 6), 20, 1);
        waveGraphics.fillRect(wx + 20, wy1 + 49 + ((wx * 7) % 6), 12, 1);
      }

      // Deep sea gentle swell (wy1 + 78)
      if ((wx + 15) % 110 < 70) {
        waveGraphics.fillStyle(0x38bdf8, 0.45);
        waveGraphics.fillRect(wx + 8, wy1 + 78 + ((wx * 13) % 7), 22, 1);
        waveGraphics.fillRect(wx + 12, wy1 + 79 + ((wx * 13) % 7), 14, 1);
      }
    }
  }

  private buildLandmarks() {
    // 01 Entrance (x: 300) - Baseline flush at y = 270 (originY = 170/185 = 0.9189)
    this.addBuilding(300, 'landmark_entrance', 0.5, 0.9189, 1.25);

    // 02 Plaza (x: 900) - Door baseline flush at y = 270 (originY = 170/185 = 0.9189)
    this.addBuilding(900, 'landmark_plaza', 0.5, 0.9189, 1.25);

    // 03 Print House (x: 1500) - Door baseline flush at y = 270 (originY = 150/165 = 0.9091)
    this.addBuilding(1500, 'landmark_print_house', 0.5, 0.9091, 1.25);

    // 04 Brand Museum (x: 2100) - Door baseline flush at y = 270 (originY = 150/165 = 0.9091)
    this.addBuilding(2100, 'landmark_brand_museum', 0.5, 0.9091, 1.25);

    // 05 Marc Cinema (x: 2740, Hero Building!) - Door baseline flush at y = 270 (originY = 150/165 = 0.9091)
    this.addBuilding(2740, 'landmark_marc_cinema', 0.5, 0.9091, 1.25);

    // 06 Experiment Lab (x: 3380) - Door baseline flush at y = 270 (originY = 150/165 = 0.9091)
    this.addBuilding(3380, 'landmark_experiment_lab', 0.5, 0.9091, 1.25);

    // 07 Arcade (x: 4020) - Door baseline flush at y = 270 (originY = 150/165 = 0.9091)
    this.addBuilding(4020, 'landmark_arcade', 0.5, 0.9091, 1.25);

    // 08 My Studio (x: 4660) - Studio entrance aligned at x: 4660, door baseline flush at y = 270 (originY = 170/185 = 0.9189)
    this.addBuilding(4660, 'landmark_my_studio', 0.338, 0.9189, 1.25);

    // 10 Observatory (x: 5900, on the summit plateau!) - As explicitly requested: "观景台不需要调整"
    this.addBuilding(5900, 'landmark_observatory', 0.5, 1.0, 1.25);

    // 11 Summit Telescope Lookout (x: 6060, on the panoramic cliff edge)
    const telY = WorldBuilder.getGroundY(6060);
    const telescope = this.scene.add.sprite(6060, telY, 'prop_telescope');
    telescope.setOrigin(0.5, 1.0);
    telescope.setDepth(12);
  }

  private addBuilding(x: number, texture: string, originX = 0.5, originY = 1.0, scale = 1.0) {
    const y = WorldBuilder.getGroundY(x);
    const b = this.scene.add.sprite(x, y, texture);
    b.setOrigin(originX, originY);
    b.setDepth(8); // Behind street lamps and player
    if (scale !== 1.0) {
      b.setScale(scale);
    }
    return b;
  }

  private buildStreetDecorations() {
    const totalW = WorldBuilder.TOTAL_WORLD_WIDTH;

    // Place trees, bushes, flower pots, lampposts, benches, bollards, guardrails, and signs
    // All props setOrigin(0.5, 1.0) so they sit flush on the baseline y = 270!
    // Place milestone at the foot of Future Hill (x = 5000)
    const milestoneX = WorldBuilder.HILL_START_X;
    const milestoneY = WorldBuilder.getGroundY(milestoneX);
    const milestone = this.scene.add.sprite(milestoneX, milestoneY, 'prop_milestone');
    milestone.setOrigin(0.5, 1.0);
    milestone.setDepth(12);

    for (let x = 60; x < totalW - 60; x += 40) {
      const gy = WorldBuilder.getGroundY(x);

      // Future Hill decorations (x >= 5000)
      if (x >= WorldBuilder.HILL_START_X && x <= WorldBuilder.HILL_END_X) {
        // Tall dark green cypress trees along the hill
        if (x % 140 === 0) {
          const cypress = this.scene.add.sprite(x, gy, 'prop_cypress');
          cypress.setOrigin(0.5, 1.0);
          cypress.setDepth(7);
          cypress.setScale(x % 280 === 0 ? 1.05 : 0.9);
        }
        // Granite mountain boulders along hill slope
        if (x % 160 === 80) {
          const boulder = this.scene.add.sprite(x, gy, 'prop_boulder');
          boulder.setOrigin(0.5, 1.0);
          boulder.setDepth(8);
          boulder.setScale(x % 320 === 80 ? 1.0 : 0.82);
        }
        // White wooden post guardrails along the hill road edge
        if (x % 120 === 20 && x < WorldBuilder.HILL_END_X - 60) {
          const guardrail = this.scene.add.sprite(x, gy, 'prop_guardrail');
          guardrail.setOrigin(0.5, 1.0);
          guardrail.setDepth(11);
        }
        // Hill bushes between cypress
        if (x % 90 === 0) {
          const bush = this.scene.add.sprite(x + 15, gy, 'prop_bush');
          bush.setOrigin(0.5, 1.0);
          bush.setDepth(9);
        }
        // Wildflowers along hill slope
        if (x % 45 === 0) {
          const grass = this.scene.add.sprite(x + 12, gy, 'prop_grass');
          grass.setOrigin(0.5, 1.0);
          grass.setDepth(9);
        }
      } else {
        // Main Promenade Street Decorations (x < 5000)
        const nearCenter = this.isNearBuildingCenter(x);

        if (!nearCenter) {
          // 1. Ornate black Victorian lampposts with hanging flower baskets (Unified 84px height)
          if (x % 240 === 0) {
            const lamp = this.scene.add.sprite(x, gy, 'prop_lamp');
            lamp.setOrigin(0.5, 1.0);
            lamp.setDepth(15);
          }

          // 2. Seaside Teak Park Benches facing the water (Strictly offset by 120px from lampposts — never blocked!)
          if (x % 240 === 120) {
            const bench = this.scene.add.sprite(x, gy, 'prop_bench_seaside');
            bench.setOrigin(0.5, 1.0);
            bench.setDepth(14);
          }

          // 3. Nautical Bollard with heavy marine rope along the seawall rim
          if (x % 80 === 0) {
            const bollard = this.scene.add.sprite(x, gy, 'prop_bollard_rope');
            bollard.setOrigin(0.5, 1.0);
            bollard.setDepth(11);
          }

          // 4. Coastal trees in gaps between buildings (4-tone reference foliage)
          if (x % 160 === 0) {
            const tree = this.scene.add.sprite(x, gy, 'prop_tree');
            tree.setOrigin(0.5, 1.0);
            tree.setDepth(7);
            tree.setScale(x % 320 === 0 ? 1.05 : 0.88);
          }

          // 5. Green bushes along sidewalk promenade
          if (x % 80 === 40) {
            const bush = this.scene.add.sprite(x, gy, 'prop_bush');
            bush.setOrigin(0.5, 1.0);
            bush.setDepth(9);
          }

          // 6. Terracotta Planter Urns with blooming flowers
          if (x % 180 === 80) {
            const urn = this.scene.add.sprite(x, gy, 'prop_planter_urn');
            urn.setOrigin(0.5, 1.0);
            urn.setDepth(13);
          }

          // 7. Wildflowers and grass planters
          if (x % 60 === 20) {
            const grass = this.scene.add.sprite(x, gy, 'prop_grass');
            grass.setOrigin(0.5, 1.0);
            grass.setDepth(9);
          }
        }
      }

    }

    // 8. White wooden post-and-rail guardrails for Entrance seaside promenade (x = 20..84)
    for (let gx = 20; gx <= 84; gx += 64) {
      const gy = WorldBuilder.getGroundY(gx);
      const rail = this.scene.add.sprite(gx, gy, 'prop_guardrail');
      rail.setOrigin(0.5, 1.0);
      rail.setDepth(12);
    }

    // 9. Authentic Entrance Direction Signboard at x = 75: "MY WORLD ->"
    const entSignX = 75;
    const entSignGy = WorldBuilder.getGroundY(entSignX);
    const entSign = this.scene.add.sprite(entSignX, entSignGy, 'prop_entrance_sign');
    entSign.setOrigin(0.5, 1.0);
    entSign.setDepth(13);

    // 10. White wooden post-and-rail guardrails for Seaside Hill slope (x = 5020..5740)
    for (let gx = 5020; gx <= 5740; gx += 64) {
      const gy = WorldBuilder.getGroundY(gx);
      const dy = WorldBuilder.getGroundY(gx + 16) - WorldBuilder.getGroundY(gx - 16);
      const angle = Math.atan2(dy, 32);
      const rail = this.scene.add.sprite(gx, gy, 'prop_guardrail');
      rail.setOrigin(0.5, 1.0);
      rail.setRotation(angle);
      rail.setDepth(12);
    }

    // 11. Authentic Direction Sign on the hill at x = 5120: "HIGHER → FURTHER → A BRIGHTER YOU →"
    const signX = 5120;
    const signGy = WorldBuilder.getGroundY(signX);
    const signDy = WorldBuilder.getGroundY(signX + 8) - WorldBuilder.getGroundY(signX - 8);
    const signAngle = Math.atan2(signDy, 16);
    const hillSign = this.scene.add.sprite(signX, signGy, 'prop_hill_sign');
    hillSign.setOrigin(0.5, 1.0);
    hillSign.setRotation(signAngle);
    hillSign.setDepth(14);
  }

  private isNearBuildingCenter(x: number): boolean {
    return WORLD_LOCATIONS.some((loc) => {
      let radius = 105;
      if (loc.id === 'entrance') radius = 175;
      else if (loc.id === 'central-plaza') radius = 225;
      else if (loc.id === 'marc-cinema') radius = 160;
      else if (loc.id === 'my-studio') radius = 150;
      return Math.abs(loc.x - x) < radius;
    });
  }
}
