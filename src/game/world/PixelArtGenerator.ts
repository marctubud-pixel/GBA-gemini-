import Phaser from 'phaser';

/**
 * PixelArtGenerator generates authentic GBA-inspired pixel art textures
 * dynamically into Phaser's TextureManager, matching the exact visual standards
 * from the MY WORLD design reference sheet (coastal townhouses, hero buildings, props).
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

      // Register animation frames 0..3
      for (let f = 0; f < 4; f++) {
        rideCanvas.add(f, 0, f * w, 0, w, h);
      }
    }

    // 2. Bike Idle
    const idleCanvas = scene.textures.createCanvas('bike_idle', w, h);
    if (idleCanvas) {
      const ctx = idleCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawBikeFrame(ctx, 0, 0, 0, true);
      idleCanvas.refresh();
    }

    // 3. Parked Bike (Bike alone, no rider, on kickstand)
    const parkedCanvas = scene.textures.createCanvas('bike_parked', 56, 40);
    if (parkedCanvas) {
      const ctx = parkedCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawParkedBike(ctx, 0, 0);
      parkedCanvas.refresh();
    }
  }

  private static drawBikeFrame(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, isIdle: boolean) {
    const cWheelTire = '#2a3440';
    const cWheelRim = '#6d7f8d';
    const cFrame = '#2e6db4';
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

    const bobY = isIdle ? 0 : (frame % 2 === 0 ? 0 : 1);
    const pedalAngle = (frame * Math.PI) / 2;

    // Wheels
    this.drawPixelCircle(ctx, ox + 18, oy + 42, 9, cWheelTire, cWheelRim);
    this.drawPixelCircle(ctx, ox + 54, oy + 42, 9, cWheelTire, cWheelRim);

    // Bottom bracket (pedal center)
    const bbX = ox + 34;
    const bbY = oy + 42;
    const rX = ox + 18;
    const rY = oy + 42;
    const hX = ox + 50;
    const hY = oy + 26;
    const sX = ox + 30;
    const sY = oy + 28;

    // Frame tubes
    this.drawPixelLine(ctx, rX, rY, sX, sY, cFrame, 2);
    this.drawPixelLine(ctx, rX, rY, bbX, bbY, cFrame, 2);
    this.drawPixelLine(ctx, sX, sY, bbX, bbY, cFrameHighlight, 2);
    this.drawPixelLine(ctx, sX, sY, hX, hY, cFrameHighlight, 2);
    this.drawPixelLine(ctx, bbX, bbY, hX, hY, cFrame, 2);
    this.drawPixelLine(ctx, hX, hY, ox + 54, oy + 42, cFrame, 2);

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

    // Rider
    const riderPelvisX = sX + 1;
    const riderPelvisY = sY - 3 + bobY;

    // Legs
    const knee1X = (riderPelvisX + p1X) / 2 + 2;
    const knee1Y = (riderPelvisY + p1Y) / 2 - 2;
    this.drawPixelLine(ctx, riderPelvisX, riderPelvisY, knee1X, knee1Y, cShorts, 3);
    this.drawPixelLine(ctx, knee1X, knee1Y, p1X, p1Y, cSkin, 2);
    this.drawPixelRect(ctx, p1X - 2, p1Y - 1, 4, 3, cShoe);

    // Torso
    const chestX = riderPelvisX + 7;
    const chestY = riderPelvisY - 12;
    this.drawPixelRect(ctx, riderPelvisX, chestY, 9, 12, cShirtBlue);
    this.drawPixelRect(ctx, riderPelvisX + 1, chestY + 2, 7, 2, cShirtWhite);
    this.drawPixelRect(ctx, riderPelvisX + 1, chestY + 6, 7, 2, cShirtWhite);

    // Crossbody bag
    this.drawPixelLine(ctx, chestX - 1, chestY, riderPelvisX - 2, riderPelvisY + 2, cBag, 2);
    this.drawPixelRect(ctx, riderPelvisX - 4, riderPelvisY - 2, 5, 6, cBag);

    // Arms
    this.drawPixelLine(ctx, chestX, chestY + 3, hX - 2, hY - 5, cShirtBlue, 2);
    this.drawPixelRect(ctx, hX - 3, hY - 6, 3, 3, cSkin);

    // Head & Cap
    const headX = chestX + 2;
    const headY = chestY - 10;
    this.drawPixelRect(ctx, headX - 4, headY - 4, 8, 9, cSkin);
    this.drawPixelRect(ctx, headX - 5, headY - 3, 3, 5, cHair);
    this.drawPixelRect(ctx, headX + 2, headY, 2, 2, '#192736');

    // Cap with brim
    this.drawPixelRect(ctx, headX - 5, headY - 7, 10, 4, cCap);
    this.drawPixelRect(ctx, headX, headY - 4, 8, 2, cCap);
  }

  private static drawParkedBike(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const cWheelTire = '#2a3440';
    const cWheelRim = '#6d7f8d';
    const cFrame = '#2e6db4';
    const cFrameHighlight = '#5693db';
    const cHandlebar = '#3b4b59';

    this.drawPixelCircle(ctx, ox + 12, oy + 28, 8, cWheelTire, cWheelRim);
    this.drawPixelCircle(ctx, ox + 42, oy + 28, 8, cWheelTire, cWheelRim);

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

    this.drawPixelRect(ctx, hX - 1, hY - 4, 3, 4, cHandlebar);
    this.drawPixelRect(ctx, hX - 3, hY - 5, 5, 2, '#192736');
    this.drawPixelRect(ctx, sX - 4, sY - 3, 6, 2, '#1c242c');
    this.drawPixelLine(ctx, bbX, bbY, bbX - 3, oy + 36, '#475461', 2);
  }

  /**
   * Generates Character (Walking 4 frames, Idle 2 frames)
   */
  private static createCharacterTextures(scene: Phaser.Scene) {
    const w = 40;
    const h = 54;

    const walkCanvas = scene.textures.createCanvas('character_walk_sheet', w * 4, h);
    if (walkCanvas) {
      const ctx = walkCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      for (let f = 0; f < 4; f++) {
        this.drawWalkingFrame(ctx, f * w, 0, f);
      }
      walkCanvas.refresh();

      for (let f = 0; f < 4; f++) {
        walkCanvas.add(f, 0, f * w, 0, w, h);
      }
    }

    const idleCanvas = scene.textures.createCanvas('character_idle_sheet', w * 2, h);
    if (idleCanvas) {
      const ctx = idleCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawIdleFrame(ctx, 0, 0, 0);
      this.drawIdleFrame(ctx, w, 0, 1);
      idleCanvas.refresh();

      for (let f = 0; f < 2; f++) {
        idleCanvas.add(f, 0, f * w, 0, w, h);
      }
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
    const stride = [-5, 0, 5, 0][frame];

    this.drawPixelLine(ctx, cx - 2, cy + 6, cx - 2 + stride, cy + 18, cShorts, 3);
    this.drawPixelRect(ctx, cx - 4 + stride, cy + 18, 5, 4, cShoe);

    this.drawPixelLine(ctx, cx + 2, cy + 6, cx + 2 - stride, cy + 18, cShorts, 3);
    this.drawPixelRect(ctx, cx + stride > 0 ? cx + 1 - stride : cx - 1 - stride, cy + 18, 5, 4, cShoe);

    this.drawPixelRect(ctx, cx - 6, cy - 8, 12, 14, cShirtBlue);
    this.drawPixelRect(ctx, cx - 5, cy - 5, 10, 2, cShirtWhite);
    this.drawPixelRect(ctx, cx - 5, cy - 1, 10, 2, cShirtWhite);

    this.drawPixelLine(ctx, cx - 5, cy - 8, cx + 5, cy + 4, cBag, 2);
    this.drawPixelRect(ctx, cx + 3, cy + 1, 6, 7, cBag);

    const armSwing = [4, 0, -4, 0][frame];
    this.drawPixelLine(ctx, cx - 4, cy - 6, cx - 6 - armSwing, cy + 3, cSkin, 2);
    this.drawPixelLine(ctx, cx + 4, cy - 6, cx + 6 + armSwing, cy + 3, cSkin, 2);

    this.drawPixelRect(ctx, cx - 5, cy - 18, 10, 10, cSkin);
    this.drawPixelRect(ctx, cx - 6, cy - 17, 3, 6, cHair);
    this.drawPixelRect(ctx, cx + 2, cy - 14, 2, 2, '#192736');

    this.drawPixelRect(ctx, cx - 6, cy - 22, 12, 5, cCap);
    this.drawPixelRect(ctx, cx + 2, cy - 18, 6, 2, cCap);
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

    this.drawPixelRect(ctx, cx - 5, cy + 6, 4, 13, cShorts);
    this.drawPixelRect(ctx, cx + 1, cy + 6, 4, 13, cShorts);
    this.drawPixelRect(ctx, cx - 6, cy + 19, 5, 4, cShoe);
    this.drawPixelRect(ctx, cx + 1, cy + 19, 5, 4, cShoe);

    this.drawPixelRect(ctx, cx - 6, cy - 8, 12, 14, cShirtBlue);
    this.drawPixelRect(ctx, cx - 5, cy - 5, 10, 2, cShirtWhite);
    this.drawPixelRect(ctx, cx - 5, cy - 1, 10, 2, cShirtWhite);

    this.drawPixelLine(ctx, cx - 5, cy - 8, cx + 5, cy + 4, cBag, 2);
    this.drawPixelRect(ctx, cx + 3, cy + 1, 6, 7, cBag);

    this.drawPixelRect(ctx, cx - 8, cy - 6, 3, 10, cSkin);
    this.drawPixelRect(ctx, cx + 5, cy - 6, 3, 10, cSkin);

    this.drawPixelRect(ctx, cx - 5, cy - 18, 10, 10, cSkin);
    this.drawPixelRect(ctx, cx - 6, cy - 17, 3, 6, cHair);
    this.drawPixelRect(ctx, cx + 2, cy - 14, 2, 2, '#192736');

    this.drawPixelRect(ctx, cx - 6, cy - 22, 12, 5, cCap);
    this.drawPixelRect(ctx, cx + 2, cy - 18, 6, 2, cCap);
  }

  /**
   * Generates all Landmark buildings & Hero assets with pixel art fidelity matching reference sheet
   */
  private static createLandmarkTextures(scene: Phaser.Scene) {
    // 01 Entrance (280 x 140)
    const entranceCanvas = scene.textures.createCanvas('landmark_entrance', 280, 140);
    if (entranceCanvas) {
      const ctx = entranceCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawEntranceLandmark(ctx);
      entranceCanvas.refresh();
    }

    // 02 Central Plaza (320 x 180)
    const plazaCanvas = scene.textures.createCanvas('landmark_plaza', 320, 180);
    if (plazaCanvas) {
      const ctx = plazaCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPlazaLandmark(ctx);
      plazaCanvas.refresh();
    }

    // 03 Print House (240 x 160)
    const printCanvas = scene.textures.createCanvas('landmark_print_house', 240, 160);
    if (printCanvas) {
      const ctx = printCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPrintHouse(ctx);
      printCanvas.refresh();
    }

    // 04 Brand & Creative Museum (260 x 170)
    const brandCanvas = scene.textures.createCanvas('landmark_brand_museum', 260, 170);
    if (brandCanvas) {
      const ctx = brandCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawBrandMuseum(ctx);
      brandCanvas.refresh();
    }

    // 05 MARC CINEMA (Hero Building - 340 x 190)
    const cinemaCanvas = scene.textures.createCanvas('landmark_marc_cinema', 340, 190);
    if (cinemaCanvas) {
      const ctx = cinemaCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawMarcCinema(ctx);
      cinemaCanvas.refresh();
    }

    // 06 Experiment Lab (240 x 160)
    const labCanvas = scene.textures.createCanvas('landmark_experiment_lab', 240, 160);
    if (labCanvas) {
      const ctx = labCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawExperimentLab(ctx);
      labCanvas.refresh();
    }

    // 07 Arcade (240 x 160)
    const arcadeCanvas = scene.textures.createCanvas('landmark_arcade', 240, 160);
    if (arcadeCanvas) {
      const ctx = arcadeCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawArcade(ctx);
      arcadeCanvas.refresh();
    }

    // 08 My Studio (240 x 160)
    const studioCanvas = scene.textures.createCanvas('landmark_my_studio', 240, 160);
    if (studioCanvas) {
      const ctx = studioCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawMyStudio(ctx);
      studioCanvas.refresh();
    }

    // Outdoor Stairs between Studio and Hill (100 x 140)
    const stairsCanvas = scene.textures.createCanvas('prop_outdoor_stairs', 100, 140);
    if (stairsCanvas) {
      const ctx = stairsCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawOutdoorStairs(ctx);
      stairsCanvas.refresh();
    }

    // Future Hill Direction Signboard (80 x 60)
    const hillSignCanvas = scene.textures.createCanvas('prop_hill_sign', 80, 60);
    if (hillSignCanvas) {
      const ctx = hillSignCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawHillSign(ctx);
      hillSignCanvas.refresh();
    }

    // 10 Observatory (300 x 200)
    const observatoryCanvas = scene.textures.createCanvas('landmark_observatory', 300, 200);
    if (observatoryCanvas) {
      const ctx = observatoryCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawObservatory(ctx);
      observatoryCanvas.refresh();
    }
  }

  // --- Specific Landmark Drawing Logic (Directly matching image reference!) ---

  private static drawEntranceLandmark(ctx: CanvasRenderingContext2D) {
    // White stone archway with stone steps & green wooden door
    this.drawPixelRect(ctx, 40, 40, 190, 95, '#fcf6e5');
    this.drawPixelRect(ctx, 36, 35, 198, 6, '#e8ddc2'); // Cornice

    // Entrance stone arch
    this.drawPixelRect(ctx, 110, 60, 46, 75, '#1e293b');
    this.drawPixelRect(ctx, 114, 64, 38, 71, '#1b4332'); // Dark green wooden door
    this.drawPixelRect(ctx, 106, 56, 54, 6, '#d8caa5'); // Lintel

    // MY WORLD Signboard
    this.drawPixelRect(ctx, 60, 12, 148, 22, '#d79b5c');
    this.drawPixelRect(ctx, 58, 10, 152, 2, '#ba7a3b');
    this.drawPixelRect(ctx, 75, 34, 6, 10, '#8b5a2b');
    this.drawPixelRect(ctx, 185, 34, 6, 10, '#8b5a2b');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('MY WORLD →', 92, 27);

    // Stone terrace & welcome plaque
    this.drawPixelRect(ctx, 168, 70, 52, 28, '#ffffff');
    this.drawPixelRect(ctx, 166, 68, 56, 2, '#cbd5e1');
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 6px sans-serif';
    ctx.fillText('WELCOME TO', 170, 79);
    ctx.fillText('A BRIGHTER YOU', 168, 90);

    // Park bench on right
    this.drawBench(ctx, 225, 115);
    // Green climbing ivy
    this.drawPixelRect(ctx, 42, 45, 14, 30, '#52a869');
    this.drawPixelRect(ctx, 95, 45, 10, 20, '#52a869');
  }

  private static drawPlazaLandmark(ctx: CanvasRenderingContext2D) {
    // Classical central town square with fountain and orange café umbrellas!
    // Multi-tier Fountain in center
    this.drawPixelRect(ctx, 110, 125, 100, 45, '#e8ddc2');
    this.drawPixelRect(ctx, 106, 121, 108, 6, '#fcf6e5');
    this.drawPixelRect(ctx, 114, 128, 92, 18, '#2a8b9f'); // Water
    // Center column & Tier
    this.drawPixelRect(ctx, 154, 90, 12, 35, '#fcf6e5');
    this.drawPixelRect(ctx, 140, 90, 40, 6, '#e8ddc2');
    this.drawPixelRect(ctx, 142, 92, 36, 4, '#78c8ec');
    // Water jet
    this.drawPixelRect(ctx, 159, 72, 2, 20, '#ffffff');
    this.drawPixelRect(ctx, 152, 82, 3, 3, '#e0f7fc');
    this.drawPixelRect(ctx, 165, 82, 3, 3, '#e0f7fc');

    // Orange Café Umbrella & Table (Left)
    this.drawCafeUmbrella(ctx, 45, 75, '#f58e3f');
    // Orange Café Umbrella & Table (Right)
    this.drawCafeUmbrella(ctx, 245, 75, '#f58e3f');

    // Park benches
    this.drawBench(ctx, 10, 140);
    this.drawBench(ctx, 275, 140);
  }

  private static drawPrintHouse(ctx: CanvasRenderingContext2D) {
    // Reference Image Strip 3: White stone facade, dark framed windows with posters,
    // "PRINT HOUSE" text, striped awning, green ivy vines, poster "IDEAS INTO THINGS"
    this.drawPixelRect(ctx, 20, 20, 200, 140, '#fdf8e6');
    this.drawPixelRect(ctx, 16, 16, 208, 6, '#e8ddc2');

    // Signboard: "PRINT HOUSE" (Bold red/coral on cream)
    this.drawPixelRect(ctx, 40, 26, 160, 22, '#fcf6e5');
    this.drawPixelRect(ctx, 38, 24, 164, 2, '#ef6453');
    this.drawPixelRect(ctx, 38, 48, 164, 2, '#ef6453');
    ctx.fillStyle = '#ef6453';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('PRINT HOUSE', 70, 42);

    // Striped Awning (coral and cream)
    for (let i = 0; i < 9; i++) {
      const color = i % 2 === 0 ? '#ef6453' : '#fcf6e5';
      this.drawPixelRect(ctx, 35 + i * 19, 52, 19, 14, color);
    }
    this.drawPixelRect(ctx, 33, 65, 175, 3, '#991b1b');

    // Display Windows with books and posters
    this.drawPixelRect(ctx, 35, 76, 75, 74, '#192736');
    this.drawPixelRect(ctx, 38, 79, 69, 68, '#2a3b4c');
    this.drawPixelRect(ctx, 45, 86, 22, 28, '#f58e3f');
    this.drawPixelRect(ctx, 74, 86, 25, 28, '#78c8ec');

    // Poster on left wall: "IDEAS INTO THINGS"
    this.drawPixelRect(ctx, 2, 70, 22, 35, '#ffffff');
    this.drawPixelRect(ctx, 2, 70, 22, 2, '#cbd5e1');
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 5px sans-serif';
    ctx.fillText('IDEAS', 4, 82);
    ctx.fillText('INTO', 4, 91);
    ctx.fillText('THINGS', 3, 100);

    // Entrance Glass Door
    this.drawPixelRect(ctx, 125, 76, 45, 74, '#192736');
    this.drawPixelRect(ctx, 128, 79, 39, 71, '#2a3b4c');
    this.drawPixelRect(ctx, 160, 110, 4, 12, '#fac948');

    // Climbing ivy vines
    this.drawPixelRect(ctx, 18, 22, 12, 45, '#52a869');
    this.drawPixelRect(ctx, 180, 22, 16, 50, '#52a869');
    this.drawFlowerPot(ctx, 180, 126, '#52a869');
  }

  private static drawBrandMuseum(ctx: CanvasRenderingContext2D) {
    // Reference Image Strip 3: Modernist block facade with recessed deep blue entryway,
    // large exhibition window, "BRAND & CREATIVE MUSEUM", "A MORE HUMAN CREATIVE WORLD"
    this.drawPixelRect(ctx, 20, 15, 220, 145, '#f5f7fa');
    this.drawPixelRect(ctx, 16, 12, 228, 5, '#cbd5e1');

    // Modern signage
    this.drawPixelRect(ctx, 35, 24, 190, 20, '#1e293b');
    ctx.fillStyle = '#78c8ec';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('BRAND & CREATIVE MUSEUM', 42, 38);

    // Subtitle plaque on right wall: "A MORE HUMAN CREATIVE WORLD"
    this.drawPixelRect(ctx, 175, 55, 60, 30, '#ffffff');
    this.drawPixelRect(ctx, 174, 54, 62, 2, '#cbd5e1');
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 5px sans-serif';
    ctx.fillText('A MORE', 180, 65);
    ctx.fillText('HUMAN', 180, 72);
    ctx.fillText('CREATIVE WORLD', 176, 80);

    // Large exhibition glass display
    this.drawPixelRect(ctx, 35, 55, 80, 95, '#0f172a');
    this.drawPixelRect(ctx, 38, 58, 74, 89, '#1e293b');
    this.drawPixelRect(ctx, 50, 75, 45, 55, '#38bdf8'); // Artwork preview

    // Recessed deep navy entrance
    this.drawPixelRect(ctx, 125, 55, 45, 95, '#0f172a');
    this.drawPixelRect(ctx, 128, 58, 39, 92, '#1e3a8a');
    this.drawPixelRect(ctx, 155, 105, 3, 16, '#94a3b8');

    // Stone bench outside
    this.drawBench(ctx, 185, 125);
  }

  private static drawMarcCinema(ctx: CanvasRenderingContext2D) {
    // The Hero Building! Directly matching Reference Image Strip 3!
    // Top bright red/coral marquee box with "MARC CINEMA"
    // Lower marquee "GOOD STORIES BRIGHTER PEOPLE"
    // Deep blue / cyan canopy, double entrance doors, poster lightboxes!
    this.drawPixelRect(ctx, 20, 24, 300, 156, '#fdf8e6');
    this.drawPixelRect(ctx, 14, 18, 312, 7, '#e8ddc2');

    // Top Grand Marquee Neon Sign: "MARC CINEMA"
    this.drawPixelRect(ctx, 50, 28, 240, 26, '#ef6453');
    this.drawPixelRect(ctx, 48, 26, 244, 2, '#f8cb47');
    this.drawPixelRect(ctx, 48, 53, 244, 2, '#f8cb47');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('MARC CINEMA', 106, 47);

    // Subtitle Marquee: "GOOD STORIES · BRIGHTER PEOPLE"
    this.drawPixelRect(ctx, 60, 56, 220, 16, '#ffffff');
    this.drawPixelRect(ctx, 58, 55, 224, 1, '#cbd5e1');
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('GOOD STORIES  BRIGHTER PEOPLE', 75, 68);

    // Deep blue canopy
    this.drawPixelRect(ctx, 35, 75, 270, 12, '#1e3a8a');
    this.drawPixelRect(ctx, 33, 85, 274, 3, '#3b82f6');

    // Poster Lightboxes (Left and Right)
    this.drawPixelRect(ctx, 35, 96, 45, 65, '#f8cb47');
    this.drawPixelRect(ctx, 38, 99, 39, 59, '#192736');
    this.drawPixelRect(ctx, 42, 104, 31, 35, '#78c8ec');

    this.drawPixelRect(ctx, 260, 96, 45, 65, '#f8cb47');
    this.drawPixelRect(ctx, 263, 99, 39, 59, '#192736');
    this.drawPixelRect(ctx, 267, 104, 31, 35, '#ef6453');

    // Cinema Double Doors
    this.drawPixelRect(ctx, 110, 95, 120, 75, '#192736');
    this.drawPixelRect(ctx, 115, 99, 50, 71, '#2a3b4c');
    this.drawPixelRect(ctx, 175, 99, 50, 71, '#2a3b4c');
    this.drawPixelRect(ctx, 160, 130, 4, 18, '#fac948');
    this.drawPixelRect(ctx, 176, 130, 4, 18, '#fac948');

    // Cinema wall lamps
    this.drawPixelRect(ctx, 95, 115, 8, 12, '#fef08a');
    this.drawPixelRect(ctx, 237, 115, 8, 12, '#fef08a');
  }

  private static drawExperimentLab(ctx: CanvasRenderingContext2D) {
    // Reference Image Strip 4: Industrial creative facade with rooftop exhaust pipes,
    // green ivy, "EXP.", roll-up glass garage doors, red soda vending machine!
    this.drawPixelRect(ctx, 20, 25, 200, 135, '#e2e8f0');
    this.drawPixelRect(ctx, 16, 20, 208, 6, '#94a3b8');

    // Rooftop Metallic Pipes
    this.drawPixelRect(ctx, 10, 28, 220, 8, '#64748b');
    this.drawPixelRect(ctx, 75, 36, 8, 30, '#64748b');
    this.drawPixelRect(ctx, 160, 36, 8, 20, '#64748b');

    // Sign: "EXP." (Play, Test, Learn, Repeat)
    this.drawPixelRect(ctx, 40, 42, 85, 22, '#52a869');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('EXP. LAB', 52, 58);

    // Roll-up glass garage doors
    this.drawPixelRect(ctx, 40, 74, 85, 86, '#1e293b');
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.drawPixelRect(ctx, 45 + c * 26, 79 + r * 27, 22, 23, '#38bdf8');
      }
    }

    // Work station window
    this.drawPixelRect(ctx, 140, 74, 65, 55, '#1e293b');
    this.drawPixelRect(ctx, 143, 77, 59, 49, '#334155');
    this.drawPixelRect(ctx, 150, 88, 22, 16, '#22c55e');

    // Red soda vending machine beside lab!
    this.drawVendingMachine(ctx, 210, 95);

    // Vines on left
    this.drawPixelRect(ctx, 22, 25, 12, 40, '#52a869');
  }

  private static drawArcade(ctx: CanvasRenderingContext2D) {
    // Reference Image Strip 4: Vibrant Klein blue facade, glowing red marquee "ARCADE",
    // subtext "GAMES IDEAS FRIENDS", arcade machines visible through glass
    this.drawPixelRect(ctx, 20, 24, 200, 136, '#1d4ed8');
    this.drawPixelRect(ctx, 16, 18, 208, 6, '#1e40af');

    // Red Marquee "ARCADE"
    this.drawPixelRect(ctx, 45, 28, 150, 24, '#ef6453');
    this.drawPixelRect(ctx, 43, 26, 154, 2, '#f8cb47');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('★ ARCADE ★', 68, 45);

    // Large glass window with arcade cabinets
    this.drawPixelRect(ctx, 35, 65, 85, 85, '#0f172a');
    this.drawPixelRect(ctx, 38, 68, 79, 79, '#1e1b4b');
    this.drawPixelRect(ctx, 45, 82, 20, 48, '#ec4899');
    this.drawPixelRect(ctx, 47, 87, 16, 15, '#38bdf8');
    this.drawPixelRect(ctx, 75, 82, 20, 48, '#eab308');
    this.drawPixelRect(ctx, 77, 87, 16, 15, '#22c55e');

    // Arcade Entrance
    this.drawPixelRect(ctx, 135, 65, 50, 85, '#0f172a');
    this.drawPixelRect(ctx, 138, 68, 44, 82, '#312e81');

    // Trash can on right
    this.drawTrashCan(ctx, 195, 125);
  }

  private static drawMyStudio(ctx: CanvasRenderingContext2D) {
    // Reference Image Strip 4: Cozy studio with sign "MY STUDIO", warm window,
    // work table, books, and stone staircase going up!
    this.drawPixelRect(ctx, 20, 24, 200, 136, '#fcf6e5');
    this.drawPixelRect(ctx, 16, 18, 208, 7, '#2a8b9f');

    // Wooden sign "MY STUDIO"
    this.drawPixelRect(ctx, 45, 30, 90, 18, '#ba7a3b');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('MY STUDIO', 56, 43);

    // Warm lit window with work table & camera
    this.drawPixelRect(ctx, 35, 58, 85, 78, '#192736');
    this.drawPixelRect(ctx, 38, 61, 79, 72, '#fef08a');
    this.drawPixelRect(ctx, 42, 105, 70, 15, '#78350f');
    this.drawPixelRect(ctx, 48, 92, 14, 13, '#52a869');
    this.drawPixelRect(ctx, 80, 85, 24, 18, '#3b82f6');

    // Wooden door
    this.drawPixelRect(ctx, 135, 58, 45, 88, '#78350f');
    this.drawPixelRect(ctx, 138, 61, 39, 85, '#92400e');
    this.drawPixelRect(ctx, 145, 68, 25, 25, '#fef08a');

    // Potted plant
    this.drawFlowerPot(ctx, 185, 120, '#ef6453');
  }

  private static drawOutdoorStairs(ctx: CanvasRenderingContext2D) {
    // Stepped stone staircase leading up to Future Hill with sign "A BRIGHTER TOMORROW"
    for (let s = 0; s < 6; s++) {
      this.drawPixelRect(ctx, s * 14, 120 - s * 16, 28, 20 + s * 16, '#e8ddc2');
      this.drawPixelRect(ctx, s * 14, 120 - s * 16, 28, 3, '#fcf6e5');
    }
    // Wooden sign on stairs: "A BRIGHTER TOMORROW"
    this.drawPixelRect(ctx, 30, 30, 60, 20, '#d79b5c');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 6px sans-serif';
    ctx.fillText('A BRIGHTER', 35, 39);
    ctx.fillText('TOMORROW →', 33, 47);
  }

  private static drawHillSign(ctx: CanvasRenderingContext2D) {
    // Reference Image Strip 5: "HIGHER →", "FURTHER →", "A BRIGHTER YOU →"
    this.drawPixelRect(ctx, 8, 4, 64, 14, '#1e293b');
    this.drawPixelRect(ctx, 8, 20, 64, 14, '#1e293b');
    this.drawPixelRect(ctx, 8, 36, 64, 14, '#1e293b');
    this.drawPixelRect(ctx, 36, 50, 8, 10, '#64748b');

    ctx.fillStyle = '#78c8ec';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('HIGHER →', 16, 14);
    ctx.fillText('FURTHER →', 14, 30);
    ctx.fillText('A BRIGHTER YOU', 9, 46);
  }

  private static drawObservatory(ctx: CanvasRenderingContext2D) {
    // Reference Image Strip 5: Summit white cylindrical observatory with dome,
    // open slit with metallic telescope barrel, observation deck railing with telescope on tripod!
    ctx.fillStyle = '#78c8ec';
    ctx.beginPath();
    ctx.arc(150, 75, 55, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    this.drawPixelRect(ctx, 146, 20, 8, 55, '#2a8b9f');
    this.drawPixelRect(ctx, 115, 35, 6, 40, '#5693db');
    this.drawPixelRect(ctx, 178, 35, 6, 40, '#216d7d');

    // Telescope barrel
    this.drawPixelLine(ctx, 145, 45, 195, 15, '#334155', 7);
    this.drawPixelLine(ctx, 145, 45, 195, 15, '#f8fafc', 3);

    // Cylindrical Base
    this.drawPixelRect(ctx, 75, 75, 150, 110, '#fcf6e5');
    this.drawPixelRect(ctx, 70, 70, 160, 6, '#e8ddc2');

    // Door & windows
    this.drawPixelRect(ctx, 130, 120, 40, 65, '#192736');
    this.drawPixelRect(ctx, 133, 123, 34, 62, '#334155');
    this.drawPixelRect(ctx, 90, 100, 25, 40, '#78c8ec');
    this.drawPixelRect(ctx, 185, 100, 25, 40, '#78c8ec');

    // Observation deck railing & telescope
    this.drawPixelRect(ctx, 230, 145, 60, 25, '#cbd5e1');
    this.drawPixelRect(ctx, 230, 145, 60, 4, '#475569');
    this.drawPixelRect(ctx, 255, 130, 4, 18, '#1e293b');
    this.drawPixelLine(ctx, 250, 128, 268, 122, '#475569', 4);

    // Plaque "NEW HORIZONS SAME ME"
    this.drawPixelRect(ctx, 10, 145, 58, 25, '#d79b5c');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 6px sans-serif';
    ctx.fillText('NEW HORIZONS', 12, 155);
    ctx.fillText('SAME ME', 18, 164);
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
      this.drawPixelRect(ctx, 0, 0, 64, 20, '#e8edf2');
      this.drawPixelRect(ctx, 0, 19, 64, 2, '#c5d1dc');
      this.drawPixelRect(ctx, 0, 21, 64, 43, '#8699a7');
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

    // 3. Ornate Street Lamp with hanging flower baskets (36 x 84)
    const lampCanvas = scene.textures.createCanvas('prop_lamp', 36, 84);
    if (lampCanvas) {
      const ctx = lampCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Post
      this.drawPixelRect(ctx, 16, 18, 4, 62, '#1e293b');
      this.drawPixelRect(ctx, 12, 76, 12, 5, '#0f172a');
      // Lantern
      this.drawPixelRect(ctx, 10, 14, 16, 14, '#0f172a');
      this.drawPixelRect(ctx, 12, 16, 12, 10, '#fef08a');
      this.drawPixelRect(ctx, 14, 9, 8, 6, '#0f172a');
      // Hanging flower baskets on side arms!
      this.drawPixelRect(ctx, 4, 34, 8, 8, '#78350f');
      this.drawPixelRect(ctx, 3, 30, 10, 5, '#ef6453');
      this.drawPixelRect(ctx, 24, 34, 8, 8, '#78350f');
      this.drawPixelRect(ctx, 23, 30, 10, 5, '#f8cb47');
      lampCanvas.refresh();
    }

    // 4. Coastal Tree (64 x 110)
    const treeCanvas = scene.textures.createCanvas('prop_tree', 64, 110);
    if (treeCanvas) {
      const ctx = treeCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 28, 55, 8, 55, '#78350f');
      this.drawPixelRect(ctx, 26, 100, 12, 10, '#451a03');
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
      this.drawPixelRect(ctx, 18, 90, 4, 40, '#451a03');
      ctx.fillStyle = '#2f6943';
      ctx.beginPath();
      ctx.moveTo(20, 5);
      ctx.lineTo(6, 100);
      ctx.lineTo(34, 100);
      ctx.closePath();
      ctx.fill();
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
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let y = 12; y < 48; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(64, y);
        ctx.stroke();
      }
      wallCanvas.refresh();
    }

    // 7. Wildflowers & Grass (32 x 24)
    const grassCanvas = scene.textures.createCanvas('prop_grass', 32, 24);
    if (grassCanvas) {
      const ctx = grassCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 4, 10, 4, 14, '#52a869');
      this.drawPixelRect(ctx, 12, 6, 4, 18, '#65c47f');
      this.drawPixelRect(ctx, 20, 12, 4, 12, '#3b8750');
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

  private static drawCafeUmbrella(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    // Parasol pole
    this.drawPixelRect(ctx, x + 24, y + 25, 4, 45, '#334155');
    // Parasol canopy
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 26, y + 25, 26, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    // Alternating cream stripes
    ctx.fillStyle = '#fcf6e5';
    this.drawPixelRect(ctx, x + 12, y + 10, 6, 15, '#fcf6e5');
    this.drawPixelRect(ctx, x + 34, y + 10, 6, 15, '#fcf6e5');
    // Round café table below
    this.drawPixelRect(ctx, x + 16, y + 54, 20, 4, '#ffffff');
    this.drawPixelRect(ctx, x + 24, y + 58, 4, 12, '#334155');
  }

  private static drawFlowerPot(ctx: CanvasRenderingContext2D, x: number, y: number, flowerColor: string) {
    this.drawPixelRect(ctx, x, y + 8, 14, 12, '#c2410c');
    this.drawPixelRect(ctx, x - 1, y + 6, 16, 3, '#9a3412');
    this.drawPixelRect(ctx, x + 1, y, 12, 8, '#52a869');
    this.drawPixelRect(ctx, x + 4, y - 2, 6, 4, flowerColor);
  }

  private static drawBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.drawPixelRect(ctx, x, y, 36, 4, '#ba7a3b');
    this.drawPixelRect(ctx, x, y + 8, 36, 4, '#ba7a3b');
    this.drawPixelRect(ctx, x + 4, y + 12, 4, 12, '#334155');
    this.drawPixelRect(ctx, x + 28, y + 12, 4, 12, '#334155');
  }

  private static drawTrashCan(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.drawPixelRect(ctx, x, y, 16, 22, '#475569');
    this.drawPixelRect(ctx, x - 1, y - 3, 18, 4, '#334155');
  }

  private static drawVendingMachine(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.drawPixelRect(ctx, x, y, 28, 55, '#dc2626');
    this.drawPixelRect(ctx, x + 3, y + 6, 22, 22, '#38bdf8');
    this.drawPixelRect(ctx, x + 5, y + 36, 18, 12, '#1e293b');
  }
}
