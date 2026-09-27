import Phaser from 'phaser';

/**
 * PixelArtGenerator generates authentic GBA-inspired pixel art textures
 * dynamically into Phaser's TextureManager, providing pixel-perfect sprites
 * with stepped pixel clusters, 3-5 tone shading, and the specified Coastal Palette.
 */
export class PixelArtGenerator {
  static generateAllTextures(scene: Phaser.Scene) {
    this.createBikeTextures(scene);
    this.createCharacterTextures(scene);
    this.createLandmarkTextures(scene);
    this.createEnvironmentTextures(scene);
  }

  /**
   * Generates Bike + Rider (Ride 4 frames, Idle, Parked Bike)
   */
  private static createBikeTextures(scene: Phaser.Scene) {
    const w = 72;
    const h = 56;

    // 1. Bike Ride Animation (4 frames in a sprite sheet of 288 x 56)
    const rideCanvas = scene.textures.createCanvas('bike_ride_sheet', w * 4, h);
    if (rideCanvas) {
      const ctx = rideCanvas.getContext();
      ctx.imageSmoothingEnabled = false;

      for (let f = 0; f < 4; f++) {
        const ox = f * w;
        this.drawBikeFrame(ctx, ox, 0, f, false);
      }
      rideCanvas.refresh();
    }

    // 2. Bike Idle
    const idleCanvas = scene.textures.createCanvas('bike_idle', w, h);
    if (idleCanvas) {
      const ctx = idleCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawBikeFrame(ctx, 0, 0, 0, true);
      idleCanvas.refresh();
    }

    // 3. Parked Bike (Bike alone, no rider)
    const parkedCanvas = scene.textures.createCanvas('bike_parked', 56, 40);
    if (parkedCanvas) {
      const ctx = parkedCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawParkedBike(ctx, 0, 0);
      parkedCanvas.refresh();
    }
  }

  private static drawBikeFrame(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, isIdle: boolean) {
    // Colors matching GBA Coastal Palette
    const cWheelTire = '#2a3440';
    const cWheelRim = '#6d7f8d';
    const cFrame = '#2e6db4'; // Crisp blue frame
    const cFrameHighlight = '#5693db';
    const cHandlebar = '#3b4b59';
    const cSkin = '#fed0a3';
    const cCap = '#3d5266';
    const cHair = '#1b222a';
    const cShirtBlue = '#3b70a2';
    const cShirtWhite = '#f4ecd2';
    const cShorts = '#45596b';
    const cBag = '#232b34';
    const cShoe = '#e8edf2';

    // Bobbing offset for rider
    const bobY = isIdle ? 0 : (frame % 2 === 0 ? 0 : 1);
    const pedalAngle = (frame * Math.PI) / 2;

    // --- Bike Wheels ---
    // Back Wheel (x: 18, y: 44, r: 10)
    this.drawPixelCircle(ctx, ox + 18, oy + 42, 9, cWheelTire, cWheelRim);
    // Front Wheel (x: 54, y: 44, r: 10)
    this.drawPixelCircle(ctx, ox + 54, oy + 42, 9, cWheelTire, cWheelRim);

    // --- Bike Frame Geometry ---
    // Bottom bracket (pedal center) at (34, 42)
    const bbX = ox + 34;
    const bbY = oy + 42;
    // Rear axle (18, 42)
    const rX = ox + 18;
    const rY = oy + 42;
    // Head tube (50, 26)
    const hX = ox + 50;
    const hY = oy + 26;
    // Seat post junction (30, 28)
    const sX = ox + 30;
    const sY = oy + 28;

    // Frame tubes
    this.drawPixelLine(ctx, rX, rY, sX, sY, cFrame, 2); // Seat stay
    this.drawPixelLine(ctx, rX, rY, bbX, bbY, cFrame, 2); // Chain stay
    this.drawPixelLine(ctx, sX, sY, bbX, bbY, cFrameHighlight, 2); // Seat tube
    this.drawPixelLine(ctx, sX, sY, hX, hY, cFrameHighlight, 2); // Top tube
    this.drawPixelLine(ctx, bbX, bbY, hX, hY, cFrame, 2); // Down tube
    this.drawPixelLine(ctx, hX, hY, ox + 54, oy + 42, cFrame, 2); // Fork

    // Handlebar & stem
    this.drawPixelRect(ctx, hX - 2, hY - 6, 4, 6, cHandlebar);
    this.drawPixelRect(ctx, hX - 4, hY - 7, 7, 3, '#192736');

    // Saddle
    this.drawPixelRect(ctx, sX - 5, sY - 4, 8, 3, '#1c242c');

    // Crank & Pedals
    const crankLen = 5;
    const p1X = bbX + Math.cos(pedalAngle) * crankLen;
    const p1Y = bbY + Math.sin(pedalAngle) * crankLen;
    const p2X = bbX - Math.cos(pedalAngle) * crankLen;
    const p2Y = bbY - Math.sin(pedalAngle) * crankLen;
    this.drawPixelLine(ctx, bbX, bbY, p1X, p1Y, '#8598a6', 1);
    this.drawPixelLine(ctx, bbX, bbY, p2X, p2Y, '#8598a6', 1);
    this.drawPixelRect(ctx, p1X - 2, p1Y - 1, 4, 2, '#2c353f');
    this.drawPixelRect(ctx, p2X - 2, p2Y - 1, 4, 2, '#2c353f');

    // --- Rider ---
    // Rider pelvis at saddle
    const riderPelvisX = sX + 1;
    const riderPelvisY = sY - 3 + bobY;

    // Legs
    // Front leg: hip -> knee -> pedal 1
    const knee1X = (riderPelvisX + p1X) / 2 + 2;
    const knee1Y = (riderPelvisY + p1Y) / 2 - 2;
    this.drawPixelLine(ctx, riderPelvisX, riderPelvisY, knee1X, knee1Y, cShorts, 3); // Thigh
    this.drawPixelLine(ctx, knee1X, knee1Y, p1X, p1Y, cSkin, 2); // Calf
    this.drawPixelRect(ctx, p1X - 2, p1Y - 1, 4, 3, cShoe); // Foot / shoe

    // Torso (leaning forward)
    const chestX = riderPelvisX + 7;
    const chestY = riderPelvisY - 12;
    // Striped shirt
    this.drawPixelRect(ctx, riderPelvisX, chestY, 9, 12, cShirtBlue);
    this.drawPixelRect(ctx, riderPelvisX + 1, chestY + 2, 7, 2, cShirtWhite);
    this.drawPixelRect(ctx, riderPelvisX + 1, chestY + 6, 7, 2, cShirtWhite);

    // Crossbody bag
    this.drawPixelLine(ctx, chestX - 1, chestY, riderPelvisX - 2, riderPelvisY + 2, cBag, 2);
    this.drawPixelRect(ctx, riderPelvisX - 4, riderPelvisY - 2, 5, 6, cBag);

    // Arms holding handlebar
    this.drawPixelLine(ctx, chestX, chestY + 3, hX - 2, hY - 5, cShirtBlue, 2);
    this.drawPixelRect(ctx, hX - 3, hY - 6, 3, 3, cSkin);

    // Head & Face
    const headX = chestX + 2;
    const headY = chestY - 10;
    this.drawPixelRect(ctx, headX - 4, headY - 4, 8, 9, cSkin); // Face
    this.drawPixelRect(ctx, headX - 5, headY - 3, 3, 5, cHair); // Hair back
    this.drawPixelRect(ctx, headX + 2, headY, 2, 2, '#192736'); // Eye

    // Blue-gray Cap with visor forward
    this.drawPixelRect(ctx, headX - 5, headY - 7, 10, 4, cCap);
    this.drawPixelRect(ctx, headX, headY - 4, 8, 2, cCap); // Visor brim
  }

  private static drawParkedBike(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const cWheelTire = '#2a3440';
    const cWheelRim = '#6d7f8d';
    const cFrame = '#2e6db4';
    const cFrameHighlight = '#5693db';
    const cHandlebar = '#3b4b59';

    // Wheels
    this.drawPixelCircle(ctx, ox + 12, oy + 28, 8, cWheelTire, cWheelRim);
    this.drawPixelCircle(ctx, ox + 42, oy + 28, 8, cWheelTire, cWheelRim);

    // Frame
    const bbX = ox + 26;
    const bbY = oy + 28;
    const rX = ox + 12;
    const rY = oy + 28;
    const hX = ox + 38;
    const hY = oy + 16;
    const sX = ox + 23;
    const sY = oy + 18;

    this.drawPixelLine(ctx, rX, rY, sX, sY, cFrame, 2);
    this.drawPixelLine(ctx, rX, rY, bbX, bbY, cFrame, 2);
    this.drawPixelLine(ctx, sX, sY, bbX, bbY, cFrameHighlight, 2);
    this.drawPixelLine(ctx, sX, sY, hX, hY, cFrameHighlight, 2);
    this.drawPixelLine(ctx, bbX, bbY, hX, hY, cFrame, 2);
    this.drawPixelLine(ctx, hX, hY, ox + 42, oy + 28, cFrame, 2);

    // Handlebar & Saddle
    this.drawPixelRect(ctx, hX - 1, hY - 4, 3, 4, cHandlebar);
    this.drawPixelRect(ctx, hX - 3, hY - 5, 5, 2, '#192736');
    this.drawPixelRect(ctx, sX - 4, sY - 3, 6, 2, '#1c242c');

    // Kickstand
    this.drawPixelLine(ctx, bbX, bbY, bbX - 3, oy + 36, '#475461', 2);
  }

  /**
   * Generates Character (Walking 4 frames, Idle 2 frames)
   */
  private static createCharacterTextures(scene: Phaser.Scene) {
    const w = 40;
    const h = 54;

    // 1. Walk Sheet (4 frames)
    const walkCanvas = scene.textures.createCanvas('character_walk_sheet', w * 4, h);
    if (walkCanvas) {
      const ctx = walkCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      for (let f = 0; f < 4; f++) {
        this.drawWalkingFrame(ctx, f * w, 0, f);
      }
      walkCanvas.refresh();
    }

    // 2. Idle Sheet (2 frames)
    const idleCanvas = scene.textures.createCanvas('character_idle_sheet', w * 2, h);
    if (idleCanvas) {
      const ctx = idleCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawIdleFrame(ctx, 0, 0, 0);
      this.drawIdleFrame(ctx, w, 0, 1);
      idleCanvas.refresh();
    }
  }

  private static drawWalkingFrame(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number) {
    const cSkin = '#fed0a3';
    const cCap = '#3d5266';
    const cHair = '#1b222a';
    const cShirtBlue = '#3b70a2';
    const cShirtWhite = '#f4ecd2';
    const cShorts = '#45596b';
    const cBag = '#232b34';
    const cShoe = '#e8edf2';

    const cx = ox + 20;
    const cy = oy + 28;

    // Leg stride calculation
    const stride = [-5, 0, 5, 0][frame];

    // Left leg & Right leg
    this.drawPixelLine(ctx, cx - 2, cy + 6, cx - 2 + stride, cy + 18, cShorts, 3);
    this.drawPixelRect(ctx, cx - 4 + stride, cy + 18, 5, 4, cShoe);

    this.drawPixelLine(ctx, cx + 2, cy + 6, cx + 2 - stride, cy + 18, cShorts, 3);
    this.drawPixelRect(ctx, cx + stride > 0 ? cx + 1 - stride : cx - 1 - stride, cy + 18, 5, 4, cShoe);

    // Torso (striped shirt)
    this.drawPixelRect(ctx, cx - 6, cy - 8, 12, 14, cShirtBlue);
    this.drawPixelRect(ctx, cx - 5, cy - 5, 10, 2, cShirtWhite);
    this.drawPixelRect(ctx, cx - 5, cy - 1, 10, 2, cShirtWhite);

    // Crossbody bag
    this.drawPixelLine(ctx, cx - 5, cy - 8, cx + 5, cy + 4, cBag, 2);
    this.drawPixelRect(ctx, cx + 3, cy + 1, 6, 7, cBag);

    // Arms swinging
    const armSwing = [4, 0, -4, 0][frame];
    this.drawPixelLine(ctx, cx - 4, cy - 6, cx - 6 - armSwing, cy + 3, cSkin, 2);
    this.drawPixelLine(ctx, cx + 4, cy - 6, cx + 6 + armSwing, cy + 3, cSkin, 2);

    // Head & Cap
    this.drawPixelRect(ctx, cx - 5, cy - 18, 10, 10, cSkin);
    this.drawPixelRect(ctx, cx - 6, cy - 17, 3, 6, cHair);
    this.drawPixelRect(ctx, cx + 2, cy - 14, 2, 2, '#192736'); // Eye

    // Cap with brim
    this.drawPixelRect(ctx, cx - 6, cy - 22, 12, 5, cCap);
    this.drawPixelRect(ctx, cx + 2, cy - 18, 6, 2, cCap); // Brim
  }

  private static drawIdleFrame(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number) {
    const cSkin = '#fed0a3';
    const cCap = '#3d5266';
    const cHair = '#1b222a';
    const cShirtBlue = '#3b70a2';
    const cShirtWhite = '#f4ecd2';
    const cShorts = '#45596b';
    const cBag = '#232b34';
    const cShoe = '#e8edf2';

    const cx = ox + 20;
    const cy = oy + 28 + (frame === 1 ? 1 : 0);

    // Legs
    this.drawPixelRect(ctx, cx - 5, cy + 6, 4, 13, cShorts);
    this.drawPixelRect(ctx, cx + 1, cy + 6, 4, 13, cShorts);
    this.drawPixelRect(ctx, cx - 6, cy + 19, 5, 4, cShoe);
    this.drawPixelRect(ctx, cx + 1, cy + 19, 5, 4, cShoe);

    // Torso
    this.drawPixelRect(ctx, cx - 6, cy - 8, 12, 14, cShirtBlue);
    this.drawPixelRect(ctx, cx - 5, cy - 5, 10, 2, cShirtWhite);
    this.drawPixelRect(ctx, cx - 5, cy - 1, 10, 2, cShirtWhite);

    // Crossbody bag
    this.drawPixelLine(ctx, cx - 5, cy - 8, cx + 5, cy + 4, cBag, 2);
    this.drawPixelRect(ctx, cx + 3, cy + 1, 6, 7, cBag);

    // Arms
    this.drawPixelRect(ctx, cx - 8, cy - 6, 3, 10, cSkin);
    this.drawPixelRect(ctx, cx + 5, cy - 6, 3, 10, cSkin);

    // Head
    this.drawPixelRect(ctx, cx - 5, cy - 18, 10, 10, cSkin);
    this.drawPixelRect(ctx, cx - 6, cy - 17, 3, 6, cHair);
    this.drawPixelRect(ctx, cx + 2, cy - 14, 2, 2, '#192736');

    // Cap
    this.drawPixelRect(ctx, cx - 6, cy - 22, 12, 5, cCap);
    this.drawPixelRect(ctx, cx + 2, cy - 18, 6, 2, cCap);
  }

  /**
   * Generates all Landmark buildings & Hero assets with pixel art fidelity
   */
  private static createLandmarkTextures(scene: Phaser.Scene) {
    // 1. Entrance Sign & Gate (240 x 140)
    const entranceCanvas = scene.textures.createCanvas('landmark_entrance', 260, 140);
    if (entranceCanvas) {
      const ctx = entranceCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawEntranceLandmark(ctx);
      entranceCanvas.refresh();
    }

    // 2. Central Plaza Fountain & Clock Tower (300 x 180)
    const plazaCanvas = scene.textures.createCanvas('landmark_plaza', 320, 180);
    if (plazaCanvas) {
      const ctx = plazaCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPlazaLandmark(ctx);
      plazaCanvas.refresh();
    }

    // 3. Print House (220 x 160)
    const printCanvas = scene.textures.createCanvas('landmark_print_house', 240, 160);
    if (printCanvas) {
      const ctx = printCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPrintHouse(ctx);
      printCanvas.refresh();
    }

    // 4. Brand & Creative Museum (260 x 170)
    const brandCanvas = scene.textures.createCanvas('landmark_brand_museum', 260, 170);
    if (brandCanvas) {
      const ctx = brandCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawBrandMuseum(ctx);
      brandCanvas.refresh();
    }

    // 5. MARC CINEMA (Hero Building - 340 x 190)
    const cinemaCanvas = scene.textures.createCanvas('landmark_marc_cinema', 340, 190);
    if (cinemaCanvas) {
      const ctx = cinemaCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawMarcCinema(ctx);
      cinemaCanvas.refresh();
    }

    // 6. Experiment Lab (240 x 160)
    const labCanvas = scene.textures.createCanvas('landmark_experiment_lab', 240, 160);
    if (labCanvas) {
      const ctx = labCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawExperimentLab(ctx);
      labCanvas.refresh();
    }

    // 7. Arcade (240 x 160)
    const arcadeCanvas = scene.textures.createCanvas('landmark_arcade', 240, 160);
    if (arcadeCanvas) {
      const ctx = arcadeCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawArcade(ctx);
      arcadeCanvas.refresh();
    }

    // 8. My Studio (240 x 160)
    const studioCanvas = scene.textures.createCanvas('landmark_my_studio', 240, 160);
    if (studioCanvas) {
      const ctx = studioCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawMyStudio(ctx);
      studioCanvas.refresh();
    }

    // 9. Observatory (Summit Hero Building - 300 x 200)
    const observatoryCanvas = scene.textures.createCanvas('landmark_observatory', 300, 200);
    if (observatoryCanvas) {
      const ctx = observatoryCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawObservatory(ctx);
      observatoryCanvas.refresh();
    }
  }

  // --- Specific Landmark Drawing Logic ---

  private static drawEntranceLandmark(ctx: CanvasRenderingContext2D) {
    // Stone gate & coastal welcome signboard
    // Cream stone wall
    this.drawPixelRect(ctx, 40, 50, 180, 80, '#fcf6e5');
    this.drawPixelRect(ctx, 36, 46, 188, 6, '#e8ddc2'); // Wall cap
    this.drawPixelRect(ctx, 40, 126, 180, 4, '#8699a7'); // Base curb

    // Gateway arch in stone wall
    this.drawPixelRect(ctx, 110, 70, 40, 60, '#192736'); // Arch opening
    this.drawPixelRect(ctx, 106, 66, 48, 6, '#d8caa5'); // Arch lintel

    // MY WORLD Wooden Signboard
    this.drawPixelRect(ctx, 60, 20, 140, 24, '#d79b5c');
    this.drawPixelRect(ctx, 58, 18, 144, 3, '#ba7a3b');
    // Wooden sign posts
    this.drawPixelRect(ctx, 75, 44, 6, 16, '#8b5a2b');
    this.drawPixelRect(ctx, 175, 44, 6, 16, '#8b5a2b');

    // Text "MY WORLD"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('MY WORLD →', 88, 36);

    // Low coastal guardrail & flowers
    this.drawPixelRect(ctx, 0, 110, 40, 20, '#f0ede6');
    this.drawPixelRect(ctx, 0, 110, 40, 4, '#6d7f8d');
    this.drawPixelRect(ctx, 220, 110, 40, 20, '#f0ede6');
    this.drawPixelRect(ctx, 220, 110, 40, 4, '#6d7f8d');

    // Flower pots
    this.drawFlowerPot(ctx, 30, 118, '#ef6453');
    this.drawFlowerPot(ctx, 225, 118, '#f8cb47');
    this.drawFlowerPot(ctx, 160, 118, '#52a869');
  }

  private static drawPlazaLandmark(ctx: CanvasRenderingContext2D) {
    // Clock tower on left, Fountain in center, benches on right
    // Clock Tower (x: 20, y: 10, w: 60, h: 160)
    this.drawPixelRect(ctx, 20, 30, 60, 140, '#fcf6e5');
    this.drawPixelRect(ctx, 16, 26, 68, 6, '#e8ddc2');
    // Tower roof pyramid
    ctx.fillStyle = '#ef6453';
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(16, 26);
    ctx.lineTo(84, 26);
    ctx.closePath();
    ctx.fill();

    // Clock Face
    this.drawPixelCircle(ctx, 50, 52, 14, '#ffffff', '#192736');
    this.drawPixelRect(ctx, 49, 44, 2, 8, '#192736'); // Clock hands
    this.drawPixelRect(ctx, 50, 51, 6, 2, '#192736');

    // Tower arch door
    this.drawPixelRect(ctx, 38, 120, 24, 50, '#192736');
    this.drawPixelRect(ctx, 36, 116, 28, 6, '#d8caa5');

    // Central Fountain (x: 120, y: 80, w: 100, h: 90)
    // Fountain basin
    this.drawPixelRect(ctx, 120, 130, 100, 40, '#e8ddc2');
    this.drawPixelRect(ctx, 116, 126, 108, 6, '#fcf6e5');
    this.drawPixelRect(ctx, 124, 134, 92, 16, '#2a8b9f'); // Water
    // Center fountain pillar & tier
    this.drawPixelRect(ctx, 164, 95, 12, 35, '#fcf6e5');
    this.drawPixelRect(ctx, 150, 95, 40, 6, '#e8ddc2');
    this.drawPixelRect(ctx, 152, 97, 36, 3, '#78c8ec'); // Upper water
    // Water jet sparkles
    this.drawPixelRect(ctx, 169, 78, 2, 18, '#ffffff');
    this.drawPixelRect(ctx, 162, 88, 3, 3, '#e0f7fc');
    this.drawPixelRect(ctx, 175, 88, 3, 3, '#e0f7fc');

    // Park Bench & Direction Board on right
    this.drawBench(ctx, 240, 135);
    this.drawDirectionSign(ctx, 290, 100, 'PLAZA');
  }

  private static drawPrintHouse(ctx: CanvasRenderingContext2D) {
    // Warm cream facade, muted orange/red banner, large poster window
    this.drawPixelRect(ctx, 20, 20, 200, 140, '#fdf8e6');
    this.drawPixelRect(ctx, 16, 16, 208, 6, '#e8ddc2'); // Cornice

    // Storefront Awning (Striped cream & coral)
    for (let i = 0; i < 10; i++) {
      const color = i % 2 === 0 ? '#f58e3f' : '#fcf6e5';
      this.drawPixelRect(ctx, 30 + i * 18, 50, 18, 14, color);
    }
    this.drawPixelRect(ctx, 28, 63, 184, 3, '#d6742a');

    // Signboard: "PRINT HOUSE"
    this.drawPixelRect(ctx, 50, 28, 140, 18, '#ffffff');
    this.drawPixelRect(ctx, 48, 26, 144, 2, '#8699a7');
    ctx.fillStyle = '#ef6453';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('PRINT HOUSE', 76, 41);

    // Large Display Windows with books and posters
    this.drawPixelRect(ctx, 35, 75, 75, 75, '#192736');
    this.drawPixelRect(ctx, 38, 78, 69, 69, '#2a3b4c');
    // Poster thumbnails in window
    this.drawPixelRect(ctx, 45, 85, 20, 28, '#f58e3f');
    this.drawPixelRect(ctx, 72, 85, 25, 28, '#78c8ec');
    this.drawPixelRect(ctx, 50, 120, 45, 18, '#fcf6e5');

    // Entrance Glass Door
    this.drawPixelRect(ctx, 125, 75, 45, 75, '#192736');
    this.drawPixelRect(ctx, 128, 78, 39, 72, '#2a3b4c');
    this.drawPixelRect(ctx, 160, 110, 4, 10, '#fac948'); // Brass handle

    // Potted plant near entrance
    this.drawFlowerPot(ctx, 180, 125, '#52a869');
  }

  private static drawBrandMuseum(ctx: CanvasRenderingContext2D) {
    // Contemporary gallery facade, clear modern windows, blue signage
    this.drawPixelRect(ctx, 20, 15, 220, 145, '#f5f7fa');
    this.drawPixelRect(ctx, 16, 12, 228, 5, '#cbd5e1');

    // Sign "BRAND & CREATIVE MUSEUM"
    this.drawPixelRect(ctx, 40, 24, 180, 18, '#1e293b');
    ctx.fillStyle = '#78c8ec';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('BRAND & CREATIVE MUSEUM', 46, 36);

    // Massive minimalist display glass
    this.drawPixelRect(ctx, 35, 55, 110, 95, '#0f172a');
    this.drawPixelRect(ctx, 38, 58, 104, 89, '#1e293b');
    // Art installation preview inside glass
    this.drawPixelRect(ctx, 65, 85, 50, 50, '#38bdf8');
    this.drawPixelRect(ctx, 75, 75, 30, 30, '#f43f5e');

    // Gallery Entrance
    this.drawPixelRect(ctx, 160, 60, 55, 90, '#0f172a');
    this.drawPixelRect(ctx, 163, 63, 49, 87, '#334155');
    this.drawPixelRect(ctx, 185, 105, 3, 16, '#94a3b8');

    // Poster Frame on exterior right wall
    this.drawPixelRect(ctx, 220, 70, 16, 30, '#cbd5e1');
    this.drawPixelRect(ctx, 222, 72, 12, 26, '#f58e3f');
  }

  private static drawMarcCinema(ctx: CanvasRenderingContext2D) {
    // Hero Building of Main Town!
    // Cream facade, bright cyan canopy, coral/red neon MARC CINEMA marquee
    this.drawPixelRect(ctx, 20, 25, 300, 155, '#fdf8e6');
    this.drawPixelRect(ctx, 14, 20, 312, 7, '#e8ddc2'); // Top cornice
    // Decorative roof crest
    this.drawPixelRect(ctx, 100, 8, 140, 14, '#ef6453');
    this.drawPixelRect(ctx, 104, 11, 132, 8, '#ffffff');

    // Grand Marquee Neon Signboard: "MARC CINEMA"
    this.drawPixelRect(ctx, 50, 32, 240, 30, '#ef6453');
    this.drawPixelRect(ctx, 48, 30, 244, 3, '#f8cb47'); // Gold border
    this.drawPixelRect(ctx, 48, 61, 244, 3, '#f8cb47');
    // Marquee bulbs along border
    for (let b = 52; b < 288; b += 12) {
      this.drawPixelRect(ctx, b, 32, 3, 2, '#fff');
      this.drawPixelRect(ctx, b, 58, 3, 2, '#fff');
    }
    // Neon text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('MARC CINEMA', 105, 52);

    // Cinema Canopy (Muted Teal / Cyan)
    this.drawPixelRect(ctx, 35, 68, 270, 12, '#2a8b9f');
    this.drawPixelRect(ctx, 33, 78, 274, 4, '#78c8ec');

    // Film Poster Lightboxes (Left and Right)
    this.drawPixelRect(ctx, 35, 90, 45, 65, '#f8cb47');
    this.drawPixelRect(ctx, 38, 93, 39, 59, '#192736');
    this.drawPixelRect(ctx, 42, 98, 31, 35, '#78c8ec'); // Poster 1 art

    this.drawPixelRect(ctx, 260, 90, 45, 65, '#f8cb47');
    this.drawPixelRect(ctx, 263, 93, 39, 59, '#192736');
    this.drawPixelRect(ctx, 267, 98, 31, 35, '#ef6453'); // Poster 2 art

    // Double Cinema Entrance Doors
    this.drawPixelRect(ctx, 100, 88, 140, 82, '#192736');
    this.drawPixelRect(ctx, 105, 92, 60, 78, '#2a3b4c');
    this.drawPixelRect(ctx, 175, 92, 60, 78, '#2a3b4c');
    // Gold door push bars
    this.drawPixelRect(ctx, 160, 128, 4, 18, '#fac948');
    this.drawPixelRect(ctx, 176, 128, 4, 18, '#fac948');

    // Ticket Booth in middle or side
    this.drawPixelRect(ctx, 145, 92, 50, 40, '#fdf8e6');
    this.drawPixelRect(ctx, 150, 98, 40, 24, '#78c8ec');
    ctx.fillStyle = '#ef6453';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('TICKETS', 151, 130);
  }

  private static drawExperimentLab(ctx: CanvasRenderingContext2D) {
    // Light industrial creative workshop with pipes, EXP. sign
    this.drawPixelRect(ctx, 20, 25, 200, 135, '#e2e8f0');
    this.drawPixelRect(ctx, 16, 20, 208, 6, '#94a3b8');

    // Industrial Pipes along top
    this.drawPixelRect(ctx, 10, 32, 220, 8, '#64748b');
    this.drawPixelRect(ctx, 80, 40, 8, 30, '#64748b');

    // Sign: "EXP. LAB"
    this.drawPixelRect(ctx, 40, 44, 90, 22, '#52a869');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('EXP. LAB', 54, 59);

    // Workshop garage glass door
    this.drawPixelRect(ctx, 40, 75, 90, 85, '#1e293b');
    // Door grid
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.drawPixelRect(ctx, 45 + c * 28, 80 + r * 26, 24, 22, '#38bdf8');
      }
    }

    // Work station window on right
    this.drawPixelRect(ctx, 145, 75, 60, 55, '#1e293b');
    this.drawPixelRect(ctx, 148, 78, 54, 49, '#334155');
    // Oscilloscope / monitor glow
    this.drawPixelRect(ctx, 155, 90, 22, 16, '#22c55e');

    // Vent / exhaust prop on wall
    this.drawPixelRect(ctx, 175, 45, 24, 20, '#475569');
  }

  private static drawArcade(ctx: CanvasRenderingContext2D) {
    // Klein blue facade, vibrant coral ARCADE sign, retro game window
    this.drawPixelRect(ctx, 20, 25, 200, 135, '#1e40af'); // Vibrant blue
    this.drawPixelRect(ctx, 16, 20, 208, 6, '#1d4ed8');

    // Coral / Orange ARCADE Sign
    this.drawPixelRect(ctx, 45, 32, 150, 24, '#ef6453');
    this.drawPixelRect(ctx, 43, 30, 154, 2, '#f8cb47');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('★ ARCADE ★', 68, 48);

    // Arcade machines visible through window
    this.drawPixelRect(ctx, 35, 68, 85, 80, '#0f172a');
    this.drawPixelRect(ctx, 38, 71, 79, 74, '#1e1b4b');
    // Cabinets inside
    this.drawPixelRect(ctx, 45, 85, 20, 45, '#ec4899');
    this.drawPixelRect(ctx, 47, 90, 16, 14, '#38bdf8'); // Screen
    this.drawPixelRect(ctx, 75, 85, 20, 45, '#eab308');
    this.drawPixelRect(ctx, 77, 90, 16, 14, '#22c55e'); // Screen

    // Arcade Entrance
    this.drawPixelRect(ctx, 135, 68, 50, 85, '#0f172a');
    this.drawPixelRect(ctx, 138, 71, 44, 82, '#312e81');

    // Vending Machine on right
    this.drawVendingMachine(ctx, 195, 80);
  }

  private static drawMyStudio(ctx: CanvasRenderingContext2D) {
    // Cozy coastal studio with green ivy, large window, warm lights
    this.drawPixelRect(ctx, 20, 25, 200, 135, '#fcf6e5');
    this.drawPixelRect(ctx, 16, 18, 208, 8, '#2a8b9f'); // Teal sloped roof trim

    // Wooden sign: "MY STUDIO"
    this.drawPixelRect(ctx, 45, 32, 90, 16, '#ba7a3b');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('MY STUDIO', 56, 44);

    // Studio window with books, desk, and lamp
    this.drawPixelRect(ctx, 35, 60, 85, 75, '#192736');
    this.drawPixelRect(ctx, 38, 63, 79, 69, '#fef08a'); // Warm interior glow
    // Desk silhouette & plants
    this.drawPixelRect(ctx, 42, 105, 70, 15, '#78350f');
    this.drawPixelRect(ctx, 48, 92, 14, 13, '#52a869'); // Potted plant on desk
    this.drawPixelRect(ctx, 80, 85, 24, 18, '#3b82f6'); // Laptop / books

    // Entrance wooden door
    this.drawPixelRect(ctx, 135, 60, 45, 85, '#78350f');
    this.drawPixelRect(ctx, 138, 63, 39, 82, '#92400e');
    this.drawPixelRect(ctx, 145, 70, 25, 25, '#fef08a'); // Glass window pane in door

    // Ivy vines hanging from roof
    this.drawPixelRect(ctx, 25, 25, 12, 35, '#52a869');
    this.drawPixelRect(ctx, 180, 25, 16, 45, '#52a869');
    this.drawFlowerPot(ctx, 190, 120, '#ef6453');
  }

  private static drawObservatory(ctx: CanvasRenderingContext2D) {
    // Summit Landmark! Cream building, steel-blue dome, telescope & lookout fence
    // Observatory Main Dome (x: 80, y: 15, r: 60)
    ctx.fillStyle = '#78c8ec';
    ctx.beginPath();
    ctx.arc(150, 75, 55, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    // Dome shading & ribs
    this.drawPixelRect(ctx, 146, 20, 8, 55, '#2a8b9f');
    this.drawPixelRect(ctx, 115, 35, 6, 40, '#5693db');
    this.drawPixelRect(ctx, 178, 35, 6, 40, '#216d7d');

    // Telescope Slit & Barrel extending
    this.drawPixelLine(ctx, 145, 45, 195, 15, '#334155', 7);
    this.drawPixelLine(ctx, 145, 45, 195, 15, '#f8fafc', 3);

    // Cylindrical Observatory Base
    this.drawPixelRect(ctx, 75, 75, 150, 110, '#fcf6e5');
    this.drawPixelRect(ctx, 70, 70, 160, 6, '#e8ddc2'); // Cornice

    // Observatory Arched Door
    this.drawPixelRect(ctx, 130, 120, 40, 65, '#192736');
    this.drawPixelRect(ctx, 133, 123, 34, 62, '#334155');
    this.drawPixelRect(ctx, 128, 116, 44, 5, '#d8caa5');

    // Windows on flanks
    this.drawPixelRect(ctx, 90, 100, 25, 40, '#192736');
    this.drawPixelRect(ctx, 92, 102, 21, 36, '#78c8ec');
    this.drawPixelRect(ctx, 185, 100, 25, 40, '#192736');
    this.drawPixelRect(ctx, 187, 102, 21, 36, '#78c8ec');

    // Summit Lookout Railing & Telescope Post
    this.drawPixelRect(ctx, 230, 145, 60, 25, '#cbd5e1');
    this.drawPixelRect(ctx, 230, 145, 60, 4, '#475569');
    // Public lookout telescope on tripod
    this.drawPixelRect(ctx, 255, 130, 4, 18, '#1e293b');
    this.drawPixelLine(ctx, 250, 128, 268, 122, '#475569', 4);

    // Direction plaque: "THE JOURNEY CONTINUES"
    this.drawPixelRect(ctx, 10, 145, 55, 25, '#d79b5c');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('SUMMIT', 18, 160);
  }

  /**
   * Environment and Street Kit Textures
   */
  private static createEnvironmentTextures(scene: Phaser.Scene) {
    // 1. Road and Sidewalk Tiles (64 x 64)
    const roadCanvas = scene.textures.createCanvas('tile_road', 64, 64);
    if (roadCanvas) {
      const ctx = roadCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Sidewalk (top 20px)
      this.drawPixelRect(ctx, 0, 0, 64, 20, '#e2e8f0');
      this.drawPixelRect(ctx, 0, 19, 64, 2, '#cbd5e1'); // Curb edge
      // Road surface (cool blue-gray #8699a7)
      this.drawPixelRect(ctx, 0, 21, 64, 43, '#8699a7');
      // Subtle road texture specks
      this.drawPixelRect(ctx, 12, 35, 2, 2, '#758897');
      this.drawPixelRect(ctx, 42, 48, 2, 2, '#97aab9');
      roadCanvas.refresh();
    }

    // 2. Coastal Guardrail (64 x 32)
    const guardrailCanvas = scene.textures.createCanvas('prop_guardrail', 64, 32);
    if (guardrailCanvas) {
      const ctx = guardrailCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 0, 8, 64, 4, '#cbd5e1');
      this.drawPixelRect(ctx, 0, 16, 64, 4, '#94a3b8');
      this.drawPixelRect(ctx, 8, 6, 6, 26, '#64748b');
      this.drawPixelRect(ctx, 40, 6, 6, 26, '#64748b');
      guardrailCanvas.refresh();
    }

    // 3. Street Lamp (32 x 80)
    const lampCanvas = scene.textures.createCanvas('prop_lamp', 32, 80);
    if (lampCanvas) {
      const ctx = lampCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 14, 15, 4, 65, '#334155');
      this.drawPixelRect(ctx, 10, 75, 12, 5, '#1e293b'); // Base
      // Lantern
      this.drawPixelRect(ctx, 8, 12, 16, 14, '#1e293b');
      this.drawPixelRect(ctx, 10, 14, 12, 10, '#fef08a'); // Warm yellow light
      this.drawPixelRect(ctx, 12, 7, 8, 6, '#1e293b'); // Cap
      lampCanvas.refresh();
    }

    // 4. Coastal Tree (64 x 110)
    const treeCanvas = scene.textures.createCanvas('prop_tree', 64, 110);
    if (treeCanvas) {
      const ctx = treeCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Trunk
      this.drawPixelRect(ctx, 28, 55, 8, 55, '#78350f');
      this.drawPixelRect(ctx, 26, 100, 12, 10, '#451a03'); // Roots
      // Canopy (GBA layered green clusters)
      this.drawPixelCircle(ctx, 32, 45, 26, '#52a869', '#3b8750');
      this.drawPixelCircle(ctx, 24, 30, 20, '#65c47f', '#52a869');
      this.drawPixelCircle(ctx, 40, 32, 18, '#52a869', '#2f6943');
      this.drawPixelCircle(ctx, 32, 20, 16, '#7ae095', '#52a869');
      treeCanvas.refresh();
    }

    // 5. Tall Cypress Tree for Future Hill (40 x 130)
    const cypressCanvas = scene.textures.createCanvas('prop_cypress', 40, 130);
    if (cypressCanvas) {
      const ctx = cypressCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Slender conical shape
      this.drawPixelRect(ctx, 18, 90, 4, 40, '#451a03');
      ctx.fillStyle = '#2f6943';
      ctx.beginPath();
      ctx.moveTo(20, 5);
      ctx.lineTo(6, 100);
      ctx.lineTo(34, 100);
      ctx.closePath();
      ctx.fill();
      // Highlight side
      ctx.fillStyle = '#52a869';
      ctx.beginPath();
      ctx.moveTo(20, 5);
      ctx.lineTo(12, 100);
      ctx.lineTo(20, 100);
      ctx.closePath();
      ctx.fill();
      cypressCanvas.refresh();
    }

    // 6. Mountain Stone Wall (64 x 48)
    const wallCanvas = scene.textures.createCanvas('prop_stone_wall', 64, 48);
    if (wallCanvas) {
      const ctx = wallCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 0, 0, 64, 48, '#64748b');
      // Stone block cracks
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let y = 12; y < 48; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(64, y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(24, 0); ctx.lineTo(24, 12);
      ctx.moveTo(48, 12); ctx.lineTo(48, 24);
      ctx.moveTo(16, 24); ctx.lineTo(16, 36);
      ctx.moveTo(40, 36); ctx.lineTo(40, 48);
      ctx.stroke();
      wallCanvas.refresh();
    }

    // 7. Wildflowers & Roadside Grass (32 x 24)
    const grassCanvas = scene.textures.createCanvas('prop_grass', 32, 24);
    if (grassCanvas) {
      const ctx = grassCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 4, 10, 4, 14, '#52a869');
      this.drawPixelRect(ctx, 12, 6, 4, 18, '#65c47f');
      this.drawPixelRect(ctx, 20, 12, 4, 12, '#3b8750');
      // Flower blossoms
      this.drawPixelRect(ctx, 3, 7, 6, 5, '#ef6453');
      this.drawPixelRect(ctx, 11, 3, 6, 5, '#f8cb47');
      this.drawPixelRect(ctx, 19, 9, 6, 5, '#78c8ec');
      grassCanvas.refresh();
    }
  }

  // --- Helper Utilities ---

  private static drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  private static drawPixelLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(Math.floor(x1), Math.floor(y1));
    ctx.lineTo(Math.floor(x2), Math.floor(y2));
    ctx.stroke();
  }

  private static drawPixelCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fillColor: string, strokeColor?: string) {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(Math.floor(cx), Math.floor(cy), Math.floor(r), 0, Math.PI * 2);
    ctx.fill();
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private static drawFlowerPot(ctx: CanvasRenderingContext2D, x: number, y: number, flowerColor: string) {
    // Terra cotta pot
    this.drawPixelRect(ctx, x, y + 8, 14, 12, '#c2410c');
    this.drawPixelRect(ctx, x - 1, y + 6, 16, 3, '#9a3412');
    // Foliage & Flower
    this.drawPixelRect(ctx, x + 1, y, 12, 8, '#52a869');
    this.drawPixelRect(ctx, x + 4, y - 2, 6, 4, flowerColor);
  }

  private static drawBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.drawPixelRect(ctx, x, y, 36, 4, '#ba7a3b');
    this.drawPixelRect(ctx, x, y + 8, 36, 4, '#ba7a3b');
    this.drawPixelRect(ctx, x + 4, y + 12, 4, 12, '#334155');
    this.drawPixelRect(ctx, x + 28, y + 12, 4, 12, '#334155');
  }

  private static drawDirectionSign(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
    this.drawPixelRect(ctx, x + 10, y + 16, 4, 44, '#475569');
    this.drawPixelRect(ctx, x, y, 36, 16, '#d79b5c');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText(text, x + 4, y + 11);
  }

  private static drawVendingMachine(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.drawPixelRect(ctx, x, y, 28, 55, '#dc2626');
    this.drawPixelRect(ctx, x + 3, y + 6, 22, 22, '#38bdf8'); // Beverage display
    this.drawPixelRect(ctx, x + 5, y + 36, 18, 12, '#1e293b'); // Dispenser slot
  }
}
