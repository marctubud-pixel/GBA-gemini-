import Phaser from 'phaser';

/**
 * PixelArtGenerator generates authentic GBA-inspired pixel art textures
 * dynamically into Phaser's TextureManager, matching the exact visual standards
 * from the MY WORLD design reference sheet (coastal townhouses, hero buildings, props).
 */
export class PixelArtGenerator {
  static generateAllTextures(scene: Phaser.Scene) {
    if (!scene.textures.exists('bike_ride_sheet')) {
      this.createBikeTextures(scene);
    }
    if (!scene.textures.exists('character_walk_sheet')) {
      this.createCharacterTextures(scene);
    }
    this.createLandmarkTextures(scene);
    this.createEnvironmentTextures(scene);
    this.createAmbientLifeTextures(scene);
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
    const cWheelTire = '#0f172a';
    const cWheelRim = '#94a3b8';
    const cFrame = '#0284c7';
    const cFrameHighlight = '#38bdf8';
    const cHandlebar = '#1e293b';
    const cSkin = '#fed0a3';
    const cCap = '#0f172a';
    const cCapBrim = '#1e293b';
    const cHair = '#090d16';
    const cShirtBlue = '#2563eb';
    const cShirtWhite = '#ffffff';
    const cShorts = '#1e293b';
    const cBag = '#0f172a';
    const cShoe = '#ffffff';

    const bobY = isIdle ? 0 : (frame % 2 === 0 ? 0 : 1);
    const pedalAngle = (frame * Math.PI) / 2;

    // Wheels (with crisp dark rim)
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

    // Frame tubes (with 1px dark contrast border)
    this.drawPixelLine(ctx, rX, rY, sX, sY, '#0f172a', 3);
    this.drawPixelLine(ctx, rX, rY, bbX, bbY, '#0f172a', 3);
    this.drawPixelLine(ctx, sX, sY, bbX, bbY, '#0f172a', 3);
    this.drawPixelLine(ctx, sX, sY, hX, hY, '#0f172a', 3);
    this.drawPixelLine(ctx, bbX, bbY, hX, hY, '#0f172a', 3);
    this.drawPixelLine(ctx, hX, hY, ox + 54, oy + 42, '#0f172a', 3);

    this.drawPixelLine(ctx, rX, rY, sX, sY, cFrame, 2);
    this.drawPixelLine(ctx, rX, rY, bbX, bbY, cFrame, 2);
    this.drawPixelLine(ctx, sX, sY, bbX, bbY, cFrameHighlight, 2);
    this.drawPixelLine(ctx, sX, sY, hX, hY, cFrameHighlight, 2);
    this.drawPixelLine(ctx, bbX, bbY, hX, hY, cFrame, 2);
    this.drawPixelLine(ctx, hX, hY, ox + 54, oy + 42, cFrame, 2);

    // Handlebar & stem
    this.drawPixelRect(ctx, hX - 2, hY - 6, 4, 6, cHandlebar);
    this.drawPixelRect(ctx, hX - 4, hY - 7, 7, 3, '#0f172a');

    // Saddle
    this.drawPixelRect(ctx, sX - 5, sY - 4, 8, 3, '#0f172a');

    // Crank & Pedals
    const crankLen = 5;
    const p1X = bbX + Math.cos(pedalAngle) * crankLen;
    const p1Y = bbY + Math.sin(pedalAngle) * crankLen;
    const p2X = bbX - Math.cos(pedalAngle) * crankLen;
    const p2Y = bbY - Math.sin(pedalAngle) * crankLen;
    this.drawPixelLine(ctx, bbX, bbY, p1X, p1Y, '#cbd5e1', 1);
    this.drawPixelLine(ctx, bbX, bbY, p2X, p2Y, '#cbd5e1', 1);
    this.drawPixelRect(ctx, p1X - 2, p1Y - 1, 4, 2, '#0f172a');
    this.drawPixelRect(ctx, p2X - 2, p2Y - 1, 4, 2, '#0f172a');

    // Rider
    const riderPelvisX = sX + 1;
    const riderPelvisY = sY - 3 + bobY;

    // Legs with dark outline
    const knee1X = (riderPelvisX + p1X) / 2 + 2;
    const knee1Y = (riderPelvisY + p1Y) / 2 - 2;
    this.drawPixelLine(ctx, riderPelvisX, riderPelvisY, knee1X, knee1Y, '#0f172a', 4);
    this.drawPixelLine(ctx, riderPelvisX, riderPelvisY, knee1X, knee1Y, cShorts, 3);
    this.drawPixelLine(ctx, knee1X, knee1Y, p1X, p1Y, '#0f172a', 3);
    this.drawPixelLine(ctx, knee1X, knee1Y, p1X, p1Y, cSkin, 2);
    this.drawPixelRect(ctx, p1X - 3, p1Y - 2, 6, 4, '#0f172a');
    this.drawPixelRect(ctx, p1X - 2, p1Y - 1, 4, 3, cShoe);

    // Torso with dark silhouette backing
    const chestX = riderPelvisX + 7;
    const chestY = riderPelvisY - 12;
    this.drawPixelRect(ctx, riderPelvisX - 1, chestY - 1, 11, 14, '#0f172a');
    this.drawPixelRect(ctx, riderPelvisX, chestY, 9, 12, cShirtBlue);
    this.drawPixelRect(ctx, riderPelvisX + 1, chestY + 2, 7, 2, cShirtWhite);
    this.drawPixelRect(ctx, riderPelvisX + 1, chestY + 6, 7, 2, cShirtWhite);

    // Crossbody bag
    this.drawPixelLine(ctx, chestX - 1, chestY, riderPelvisX - 2, riderPelvisY + 2, cBag, 2);
    this.drawPixelRect(ctx, riderPelvisX - 4, riderPelvisY - 2, 5, 6, cBag);

    // Arms
    this.drawPixelLine(ctx, chestX, chestY + 3, hX - 2, hY - 5, '#0f172a', 3);
    this.drawPixelLine(ctx, chestX, chestY + 3, hX - 2, hY - 5, cShirtBlue, 2);
    this.drawPixelRect(ctx, hX - 3, hY - 6, 3, 3, cSkin);

    // Head & Cap (with dark silhouette backing)
    const headX = chestX + 2;
    const headY = chestY - 10;
    this.drawPixelRect(ctx, headX - 5, headY - 5, 10, 11, '#0f172a');
    this.drawPixelRect(ctx, headX - 4, headY - 4, 8, 9, cSkin);
    this.drawPixelRect(ctx, headX - 5, headY - 3, 3, 5, cHair);
    this.drawPixelRect(ctx, headX + 2, headY, 2, 2, '#0f172a');

    // Cap with brim
    this.drawPixelRect(ctx, headX - 6, headY - 8, 12, 5, '#0f172a');
    this.drawPixelRect(ctx, headX - 5, headY - 7, 10, 4, cCap);
    this.drawPixelRect(ctx, headX, headY - 4, 8, 2, cCapBrim);
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
    const cCap = '#0f172a';
    const cCapBrim = '#1e293b';
    const cHair = '#090d16';
    const cShirtBlue = '#2563eb';
    const cShirtWhite = '#ffffff';
    const cShorts = '#1e293b';
    const cBag = '#0f172a';
    const cShoe = '#ffffff';

    const cx = ox + 20;
    const cy = oy + 28;
    const stride = [-5, 0, 5, 0][frame];

    // Legs with dark outline
    this.drawPixelLine(ctx, cx - 2, cy + 6, cx - 2 + stride, cy + 18, '#0f172a', 4);
    this.drawPixelLine(ctx, cx - 2, cy + 6, cx - 2 + stride, cy + 18, cShorts, 3);
    this.drawPixelRect(ctx, cx - 5 + stride, cy + 17, 7, 5, '#0f172a');
    this.drawPixelRect(ctx, cx - 4 + stride, cy + 18, 5, 4, cShoe);

    this.drawPixelLine(ctx, cx + 2, cy + 6, cx + 2 - stride, cy + 18, '#0f172a', 4);
    this.drawPixelLine(ctx, cx + 2, cy + 6, cx + 2 - stride, cy + 18, cShorts, 3);
    const shoe2X = cx + stride > 0 ? cx + 1 - stride : cx - 1 - stride;
    this.drawPixelRect(ctx, shoe2X - 1, cy + 17, 7, 5, '#0f172a');
    this.drawPixelRect(ctx, shoe2X, cy + 18, 5, 4, cShoe);

    // Torso with dark silhouette
    this.drawPixelRect(ctx, cx - 7, cy - 9, 14, 16, '#0f172a');
    this.drawPixelRect(ctx, cx - 6, cy - 8, 12, 14, cShirtBlue);
    this.drawPixelRect(ctx, cx - 5, cy - 5, 10, 2, cShirtWhite);
    this.drawPixelRect(ctx, cx - 5, cy - 1, 10, 2, cShirtWhite);

    this.drawPixelLine(ctx, cx - 5, cy - 8, cx + 5, cy + 4, cBag, 2);
    this.drawPixelRect(ctx, cx + 3, cy + 1, 6, 7, cBag);

    const armSwing = [4, 0, -4, 0][frame];
    this.drawPixelLine(ctx, cx - 4, cy - 6, cx - 6 - armSwing, cy + 3, '#0f172a', 3);
    this.drawPixelLine(ctx, cx - 4, cy - 6, cx - 6 - armSwing, cy + 3, cSkin, 2);
    this.drawPixelLine(ctx, cx + 4, cy - 6, cx + 6 + armSwing, cy + 3, '#0f172a', 3);
    this.drawPixelLine(ctx, cx + 4, cy - 6, cx + 6 + armSwing, cy + 3, cSkin, 2);

    // Head & Cap with dark silhouette
    this.drawPixelRect(ctx, cx - 6, cy - 19, 12, 12, '#0f172a');
    this.drawPixelRect(ctx, cx - 5, cy - 18, 10, 10, cSkin);
    this.drawPixelRect(ctx, cx - 6, cy - 17, 3, 6, cHair);
    this.drawPixelRect(ctx, cx + 2, cy - 14, 2, 2, '#0f172a');

    this.drawPixelRect(ctx, cx - 7, cy - 23, 14, 6, '#0f172a');
    this.drawPixelRect(ctx, cx - 6, cy - 22, 12, 5, cCap);
    this.drawPixelRect(ctx, cx + 2, cy - 18, 6, 2, cCapBrim);
  }

  private static drawIdleFrame(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number) {
    const cSkin = '#fed0a3';
    const cCap = '#0f172a';
    const cCapBrim = '#1e293b';
    const cHair = '#090d16';
    const cShirtBlue = '#2563eb';
    const cShirtWhite = '#ffffff';
    const cShorts = '#1e293b';
    const cBag = '#0f172a';
    const cShoe = '#ffffff';

    const cx = ox + 20;
    const cy = oy + 28 + (frame === 1 ? 1 : 0);

    // Legs
    this.drawPixelRect(ctx, cx - 6, cy + 5, 6, 15, '#0f172a');
    this.drawPixelRect(ctx, cx - 5, cy + 6, 4, 13, cShorts);
    this.drawPixelRect(ctx, cx + 1, cy + 5, 6, 15, '#0f172a');
    this.drawPixelRect(ctx, cx + 2, cy + 6, 4, 13, cShorts);

    this.drawPixelRect(ctx, cx - 7, cy + 18, 7, 5, '#0f172a');
    this.drawPixelRect(ctx, cx - 6, cy + 19, 5, 4, cShoe);
    this.drawPixelRect(ctx, cx + 1, cy + 18, 7, 5, '#0f172a');
    this.drawPixelRect(ctx, cx + 2, cy + 19, 5, 4, cShoe);

    // Torso with dark silhouette
    this.drawPixelRect(ctx, cx - 7, cy - 9, 14, 16, '#0f172a');
    this.drawPixelRect(ctx, cx - 6, cy - 8, 12, 14, cShirtBlue);
    this.drawPixelRect(ctx, cx - 5, cy - 5, 10, 2, cShirtWhite);
    this.drawPixelRect(ctx, cx - 5, cy - 1, 10, 2, cShirtWhite);

    this.drawPixelLine(ctx, cx - 5, cy - 8, cx + 5, cy + 4, cBag, 2);
    this.drawPixelRect(ctx, cx + 3, cy + 1, 6, 7, cBag);

    // Arms
    this.drawPixelRect(ctx, cx - 9, cy - 6, 4, 11, '#0f172a');
    this.drawPixelRect(ctx, cx - 8, cy - 5, 3, 9, cSkin);
    this.drawPixelRect(ctx, cx + 4, cy - 6, 4, 11, '#0f172a');
    this.drawPixelRect(ctx, cx + 5, cy - 5, 3, 9, cSkin);

    // Head & Cap
    this.drawPixelRect(ctx, cx - 6, cy - 19, 12, 12, '#0f172a');
    this.drawPixelRect(ctx, cx - 5, cy - 18, 10, 10, cSkin);
    this.drawPixelRect(ctx, cx - 6, cy - 17, 3, 6, cHair);
    this.drawPixelRect(ctx, cx + 2, cy - 14, 2, 2, '#0f172a');

    this.drawPixelRect(ctx, cx - 7, cy - 23, 14, 6, '#0f172a');
    this.drawPixelRect(ctx, cx - 6, cy - 22, 12, 5, cCap);
    this.drawPixelRect(ctx, cx + 2, cy - 18, 6, 2, cCapBrim);
  }

  /**
   * Generates all Landmark buildings & Hero assets with pixel art fidelity matching reference sheet
   */
  private static createLandmarkTextures(scene: Phaser.Scene) {
    // 01 Entrance (Authentic 1:1 image with full stereoscopic 3D depth preloaded in BootScene)
    if (!scene.textures.exists('landmark_entrance')) {
      const entranceCanvas = scene.textures.createCanvas('landmark_entrance', 290, 185);
      if (entranceCanvas) {
        const ctx = entranceCanvas.getContext();
        ctx.imageSmoothingEnabled = false;
        this.drawEntranceLandmark(ctx);
        entranceCanvas.refresh();
      }
    }

    // 02 Central Plaza (360 x 185, groundY = 170) - Pure procedural canvas pixel art!
    const plazaCanvas = scene.textures.createCanvas('landmark_plaza', 360, 185);
    if (plazaCanvas) {
      const ctx = plazaCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPlazaLandmark(ctx);
      plazaCanvas.refresh();
    }

    // 03 Print House (260 x 165) - Authentic reference architecture & proportions!
    const printHouseCanvas = scene.textures.createCanvas('landmark_print_house', 260, 165);
    if (printHouseCanvas) {
      const ctx = printHouseCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPrintHouse(ctx);
      printHouseCanvas.refresh();
    }

    // 04 Brand Museum (260 x 165) - Pure procedural canvas pixel art matching authentic reference!
    const museumCanvas = scene.textures.createCanvas('landmark_brand_museum', 260, 165);
    if (museumCanvas) {
      const ctx = museumCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawBrandMuseum(ctx);
      museumCanvas.refresh();
    }

    // 05 Marc Cinema (260 x 165) - Pure procedural canvas pixel art!
    const cinemaCanvas = scene.textures.createCanvas('landmark_marc_cinema', 260, 165);
    if (cinemaCanvas) {
      const ctx = cinemaCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawMarcCinema(ctx);
      cinemaCanvas.refresh();
    }

    // 06 Experiment Lab (260 x 165) - Pure procedural canvas pixel art matching authentic reference!
    const labCanvas = scene.textures.createCanvas('landmark_experiment_lab', 260, 165);
    if (labCanvas) {
      const ctx = labCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawExperimentLab(ctx);
      labCanvas.refresh();
    }

    // 07 Arcade (260 x 165) - Pure procedural canvas pixel art matching authentic reference!
    const arcadeCanvas = scene.textures.createCanvas('landmark_arcade', 260, 165);
    if (arcadeCanvas) {
      const ctx = arcadeCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawArcade(ctx);
      arcadeCanvas.refresh();
    }

    // 08 My Studio (325 x 185) - Pure procedural canvas pixel art matching authentic reference!
    const studioCanvas = scene.textures.createCanvas('landmark_my_studio', 325, 185);
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

    // Entrance Wooden Direction Signboard (54 x 60) - Matching authentic reference art Strip 1!
    const entranceSignCanvas = scene.textures.createCanvas('prop_entrance_sign', 54, 60);
    if (entranceSignCanvas) {
      const ctx = entranceSignCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawEntranceSign(ctx);
      entranceSignCanvas.refresh();
    }

    // 10 Observatory (330 x 180) - Hero-scale procedural canvas pixel art matching authentic game style!
    const observatoryCanvas = scene.textures.createCanvas('landmark_observatory', 330, 180);
    if (observatoryCanvas) {
      const ctx = observatoryCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawObservatory(ctx);
      observatoryCanvas.refresh();
    }
  }

  private static drawEntranceLandmark(ctx: CanvasRenderingContext2D) {
    const groundY = 170;
    const totalW = 290;
    const centerX = 145;

    // 0. Sub-sidewalk Plinth / Foundation (below groundY = 170..185)
    this.drawPixelRect(ctx, 0, 170, totalW, 15, '#1e293b');
    this.drawPixelRect(ctx, 0, 170, totalW, 2, '#94a3b8');

    // 1. Lush Background Mediterranean Tree Canopy (Layered Behind Roof & Walls, y: 4..85)
    const backTrees = [
      { cx: 30, cy: 56, rx: 26, ry: 25 },
      { cx: 68, cy: 40, rx: 30, ry: 28 },
      { cx: 110, cy: 26, rx: 34, ry: 30 },
      { cx: 145, cy: 18, rx: 36, ry: 32 },
      { cx: 180, cy: 26, rx: 34, ry: 30 },
      { cx: 222, cy: 40, rx: 30, ry: 28 },
      { cx: 260, cy: 56, rx: 26, ry: 24 },
      // Secondary dense lower canopy fill
      { cx: 48, cy: 66, rx: 22, ry: 18 },
      { cx: 88, cy: 54, rx: 25, ry: 20 },
      { cx: 125, cy: 46, rx: 26, ry: 22 },
      { cx: 165, cy: 46, rx: 26, ry: 22 },
      { cx: 205, cy: 54, rx: 24, ry: 20 },
      { cx: 242, cy: 66, rx: 22, ry: 18 }
    ];
    for (const t of backTrees) {
      this.drawProceduralBush(ctx, t.cx, t.cy, t.rx, t.ry);
    }

    // Color Palette
    const cWallCream = '#fcf6e5';
    const cWallCreamAlt = '#f7eddb';
    const cWallCreamSh = '#ded3bb';
    const cGrout = '#d6c8ad';
    const cCornice = '#ede2c8';
    const cWhite = '#ffffff';
    const cTerra = '#dd6242';
    const cTerraHi = '#f97316';
    const cTerraDk = '#9a3412';
    const cInk = '#0f172a';

    // =========================================================================
    // LAYER 2: RECESSED CENTER ARCHWAY TOWER (x: 118..172, centered at cx = 145)
    // Sits in middle depth plane, behind the projecting left wall!
    // =========================================================================
    this.drawPixelRect(ctx, 118, 46, 54, groundY - 46, cWallCreamSh);
    this.drawPixelRect(ctx, 122, 46, 46, groundY - 46, cWallCream);
    // Cornice Coping below belfry
    this.drawPixelRect(ctx, 116, 42, 58, 4, cCornice);
    this.drawPixelLine(ctx, 116, 42, 174, 42, cWhite);
    this.drawPixelLine(ctx, 116, 45, 174, 45, cWallCreamSh);

    // Deep Inner Shadow from projecting Left Wall onto recessed Center Tower (Drop Shadow)
    this.drawPixelRect(ctx, 118, 46, 5, groundY - 46, 'rgba(15, 23, 42, 0.35)');
    this.drawPixelRect(ctx, 118, 46, 2, groundY - 46, 'rgba(15, 23, 42, 0.50)');

    // Upper Belfry Pavilion (x: 125..165, centered at 145, y: 18..42)
    this.drawPixelRect(ctx, 125, 22, 6, 20, cWallCream);
    this.drawPixelRect(ctx, 159, 22, 6, 20, cWallCream);
    this.drawPixelLine(ctx, 125, 22, 125, 42, cWhite);
    this.drawPixelLine(ctx, 164, 22, 164, 42, cWallCreamSh);
    // Belfry Arched Opening (void)
    this.drawPixelRect(ctx, 131, 24, 28, 18, '#0f172a');
    this.drawPixelCircle(ctx, 145, 24, 14, '#0f172a');
    // Bronze Bell inside
    this.drawPixelRect(ctx, 144, 23, 2, 4, '#b45309');
    this.drawPixelCircle(ctx, 145, 30, 5, '#d97706');
    this.drawPixelRect(ctx, 140, 32, 10, 3, '#b45309');
    this.drawPixelRect(ctx, 144, 35, 2, 2, '#fbbf24'); // Clapper

    // Belfry Terracotta Hipped Roof (centered at 145, y: 8..22)
    this.drawPixelRect(ctx, 121, 20, 48, 3, cTerraDk);
    ctx.fillStyle = cTerra;
    ctx.beginPath();
    ctx.moveTo(121, 20); ctx.lineTo(145, 10); ctx.lineTo(169, 20);
    ctx.closePath(); ctx.fill();
    this.drawPixelLine(ctx, 121, 20, 145, 10, cTerraHi, 2);
    this.drawPixelLine(ctx, 145, 10, 169, 20, cTerraDk, 2);
    // Finial Spire & Ball
    this.drawPixelLine(ctx, 145, 10, 145, 5, '#475569', 1);
    this.drawPixelCircle(ctx, 145, 4, 2, '#fbbf24');

    // Arched Portal Cavity (Centered at cx = 145, x: 129..161, y: 72..146)
    this.drawPixelRect(ctx, 129, 90, 32, 56, '#0f172a');
    this.drawPixelCircle(ctx, 145, 90, 16, '#0f172a');
    // Radial Voussoir Stone Arch
    this.drawPixelCircle(ctx, 145, 90, 18, 'transparent', cCornice);
    // Keystone
    this.drawPixelRect(ctx, 143, 71, 4, 5, cWhite);

    // Arched Forest Green Double Doors (x: 132..158, centered at 145)
    this.drawPixelRect(ctx, 132, 90, 26, 56, '#1b4332');
    this.drawPixelCircle(ctx, 145, 90, 13, '#1b4332');
    // Door Panels & Molding
    this.drawPixelRect(ctx, 134, 94, 9, 22, '#143829');
    this.drawPixelRect(ctx, 147, 94, 9, 22, '#143829');
    this.drawPixelRect(ctx, 134, 120, 9, 24, '#143829');
    this.drawPixelRect(ctx, 147, 120, 9, 24, '#143829');
    // Center Door Seam
    this.drawPixelLine(ctx, 145, 78, 145, 146, '#091e15', 1);
    // Golden Brass Door Handles
    this.drawPixelRect(ctx, 143, 114, 2, 7, '#fbbf24');
    this.drawPixelRect(ctx, 146, 114, 2, 7, '#fbbf24');

    // =========================================================================
    // 4. BROAD STONE STAIRS — SYMMETRICALLY CENTERED AT cx = 145!
    // 6 spreading steps leading from groundY=170 up to door threshold y=146
    // =========================================================================
    const stairs = [
      { sx: 111, sy: 166, sw: 68, sh: 4 }, // Step 1: 111 + 34 = 145
      { sx: 114, sy: 162, sw: 62, sh: 4 }, // Step 2: 114 + 31 = 145
      { sx: 117, sy: 158, sw: 56, sh: 4 }, // Step 3: 117 + 28 = 145
      { sx: 120, sy: 154, sw: 50, sh: 4 }, // Step 4: 120 + 25 = 145
      { sx: 123, sy: 150, sw: 44, sh: 4 }, // Step 5: 123 + 22 = 145
      { sx: 126, sy: 146, sw: 38, sh: 4 }  // Step 6: 126 + 19 = 145
    ];
    for (const s of stairs) {
      this.drawPixelRect(ctx, s.sx, s.sy, s.sw, s.sh, '#f1f5f9');
      this.drawPixelLine(ctx, s.sx, s.sy, s.sx + s.sw, s.sy, '#ffffff'); // Tread top highlight
      this.drawPixelLine(ctx, s.sx, s.sy + s.sh - 1, s.sx + s.sw, s.sy + s.sh - 1, '#94a3b8'); // Riser bottom shadow
      this.drawPixelLine(ctx, s.sx, s.sy, s.sx, s.sy + s.sh, '#ffffff');
      this.drawPixelLine(ctx, s.sx + s.sw - 1, s.sy, s.sx + s.sw - 1, s.sy + s.sh, '#64748b');
    }

    // =========================================================================
    // LAYER 1: FOREGROUND LEFT WALL (Outermost front plane! x: 14..118)
    // Projects forward from the center tower with solid 3D depth and return quoin edge!
    // =========================================================================
    this.drawPixelRect(ctx, 14, 52, 104, groundY - 52, cWallCream);
    this.drawPixelLine(ctx, 14, 52, 14, groundY, cWhite);
    // Wall Top Cornice & Coping (Projecting forward)
    this.drawPixelRect(ctx, 12, 48, 108, 4, cCornice);
    this.drawPixelLine(ctx, 12, 48, 120, 48, cWhite);
    this.drawPixelLine(ctx, 12, 51, 120, 51, cWallCreamSh);

    // 3D Corner Bevel & Return Quoins on the Right Exposed Edge of Left Wall (x: 116..118)
    this.drawPixelRect(ctx, 116, 52, 2, groundY - 52, '#c5b89a');
    this.drawPixelLine(ctx, 118, 52, 118, groundY, '#786850', 1);

    // Stone Quoins on Left Edge
    for (let qy = 52; qy < groundY - 10; qy += 14) {
      this.drawPixelRect(ctx, 14, qy, 4, 6, cCornice);
      this.drawPixelRect(ctx, 114, qy + 7, 4, 6, '#d8caa5'); // Right return quoin
    }

    // Masonry Ashlar Grout Courses (Horizontal)
    for (let wy = 66; wy < groundY; wy += 14) {
      this.drawPixelLine(ctx, 14, wy, 116, wy, cGrout);
      this.drawPixelLine(ctx, 14, wy + 1, 116, wy + 1, cWhite);
    }
    // Staggered Vertical Grout Lines
    for (let idx = 0, wy = 52; wy < groundY - 8; wy += 14, idx++) {
      const off = idx % 2 === 1 ? 14 : 0;
      for (let wx = 14 + 14 + off; wx < 116; wx += 28) {
        this.drawPixelLine(ctx, wx, wy, wx, Math.min(groundY, wy + 14), cGrout);
        if ((wx + wy) % 3 === 0) {
          this.drawPixelRect(ctx, wx + 1, wy + 2, 12, 10, cWallCreamAlt);
        }
      }
    }

    // Carved Academic Mortarboard Cap Logo
    const capX = 66;
    const capY = 68;
    ctx.fillStyle = cInk;
    ctx.beginPath();
    ctx.moveTo(capX - 11, capY);
    ctx.lineTo(capX, capY - 6);
    ctx.lineTo(capX + 11, capY);
    ctx.lineTo(capX, capY + 6);
    ctx.closePath();
    ctx.fill();
    this.drawPixelRect(ctx, capX - 6, capY + 5, 12, 3, cInk);
    this.drawPixelLine(ctx, capX, capY, capX + 13, capY + 7, '#fbbf24');
    this.drawPixelCircle(ctx, capX + 13, capY + 8, 1, '#f59e0b');

    // Left Wall Pixel Typography
    this.renderUnifiedMarqueeText(ctx, 'MY WORLD', 27, 76, '#0f172a', undefined, 1);
    this.renderPixelText4x6(ctx, 'RIDE', 47, 96, '#334155', 2);
    this.renderPixelText4x6(ctx, 'EXPLORE', 39, 108, '#334155', 2);
    this.renderPixelText4x6(ctx, 'CREATE', 41, 120, '#334155', 2);

    // =========================================================================
    // LAYER 3: RIGHT WALL (x: 172..274, y: 62..170)
    // Sits in middle-back plane with stucco plaque and decorative stone urns
    // =========================================================================
    this.drawPixelRect(ctx, 172, 62, 102, groundY - 62, cWallCreamAlt);
    this.drawPixelLine(ctx, 273, 62, 273, groundY, cWallCreamSh);
    // Inner shadow at junction with center tower
    this.drawPixelRect(ctx, 172, 62, 3, groundY - 62, 'rgba(15, 23, 42, 0.25)');
    // Cornice Coping
    this.drawPixelRect(ctx, 170, 58, 106, 4, cCornice);
    this.drawPixelLine(ctx, 170, 58, 276, 58, cWhite);
    this.drawPixelLine(ctx, 170, 61, 276, 61, cWallCreamSh);

    // Decorative Stone Urn Finials on Right Wall Parapet with blooming roses
    for (const ux of [184, 222, 260]) {
      this.drawPixelRect(ctx, ux - 4, 54, 8, 4, cCornice);
      this.drawPixelRect(ctx, ux - 5, 50, 10, 4, cWallCream);
      this.drawPixelRect(ctx, ux - 3, 47, 6, 3, cCornice);
      this.drawPixelRect(ctx, ux - 1, 44, 2, 3, cTerra);
      // Small rose blossom in urn
      this.drawPixelCircle(ctx, ux, 44, 3, '#16a34a');
      this.drawPixelRect(ctx, ux - 1, 42, 2, 2, '#f43f5e');
    }

    // Masonry courses on right wall
    for (let wy = 76; wy < groundY; wy += 14) {
      this.drawPixelLine(ctx, 172, wy, 274, wy, cGrout);
      this.drawPixelLine(ctx, 172, wy + 1, 274, wy + 1, cWhite);
    }
    for (let idx = 0, wy = 62; wy < groundY - 8; wy += 14, idx++) {
      const off = idx % 2 === 1 ? 14 : 0;
      for (let wx = 172 + 14 + off; wx < 274; wx += 28) {
        this.drawPixelLine(ctx, wx, wy + 10, wx, Math.min(groundY, wy + 24), cGrout);
      }
    }

    // Right Wall: Inset Stucco Plaque
    this.drawPixelRect(ctx, 182, 78, 80, 46, '#ffffff');
    this.drawPixelRect(ctx, 181, 77, 82, 1, '#cbd5e1');
    this.drawPixelRect(ctx, 181, 124, 82, 1, '#cbd5e1');
    this.drawPixelLine(ctx, 181, 77, 181, 124, '#cbd5e1');
    this.drawPixelLine(ctx, 263, 77, 263, 124, '#94a3b8');
    this.renderPixelText4x6(ctx, 'WELCOME TO', 191, 86, '#1e293b', 1);
    this.renderPixelText4x6(ctx, 'A BRIGHTER YOU', 184, 100, '#1e293b', 1);

    // =========================================================================
    // 5. ENRICHED PLANT DECORATIONS (丰富植物装饰!)
    // =========================================================================
    // Lush Climbing Ivy, Cascading Vines, and Rose Trellises
    const ivyClusters = [
      { ix: 114, iy: 48, ih: 32 },
      { ix: 172, iy: 48, ih: 34 },
      { ix: 122, iy: 76, ih: 42 },
      { ix: 168, iy: 76, ih: 42 },
      { ix: 16, iy: 56, ih: 38 },
      { ix: 268, iy: 66, ih: 38 },
      // Top parapet spilling garlands
      { ix: 45, iy: 46, ih: 14 },
      { ix: 85, iy: 46, ih: 14 },
      { ix: 200, iy: 56, ih: 16 },
      { ix: 240, iy: 56, ih: 16 }
    ];
    for (const cluster of ivyClusters) {
      for (let py = cluster.iy; py < cluster.iy + cluster.ih; py += 3) {
        const px = cluster.ix + Math.floor(2.5 * Math.sin(py * 0.45));
        this.drawPixelCircle(ctx, px, py, 3, '#166534');
        this.drawPixelCircle(ctx, px - 1, py - 1, 2, '#22c55e');
        if ((px + py) % 7 === 0) {
          this.drawPixelRect(ctx, px, py, 2, 2, '#fb7185'); // Rose bloom
        } else if ((px + py) % 11 === 0) {
          this.drawPixelRect(ctx, px, py, 2, 2, '#fde047'); // Yellow jasmine
        } else if ((px + py) % 13 === 0) {
          this.drawPixelRect(ctx, px, py, 2, 2, '#ffffff'); // White blossom
        }
      }
    }

    // Flanking Terracotta Planter Urns right beside the centered stairs (x = 104 and x = 186)
    for (const px of [104, 186]) {
      this.drawPixelRect(ctx, px - 6, groundY - 16, 12, 16, '#c2410c');
      this.drawPixelRect(ctx, px - 7, groundY - 18, 14, 3, '#ea580c');
      this.drawProceduralBush(ctx, px, groundY - 22, 9, 8);
      // Flowering blossoms
      this.drawPixelRect(ctx, px - 3, groundY - 24, 2, 2, '#f43f5e');
      this.drawPixelRect(ctx, px + 2, groundY - 23, 2, 2, '#fbbf24');
      this.drawPixelRect(ctx, px - 1, groundY - 26, 2, 2, '#ffffff');
    }

    // Additional Terracotta Planters on corners
    for (const px of [18, 268]) {
      this.drawPixelRect(ctx, px - 5, groundY - 14, 10, 14, '#c2410c');
      this.drawPixelRect(ctx, px - 6, groundY - 16, 12, 3, '#ea580c');
      this.drawProceduralBush(ctx, px, groundY - 18, 8, 7);
      this.drawPixelRect(ctx, px - 2, groundY - 20, 2, 2, '#f43f5e');
      this.drawPixelRect(ctx, px + 1, groundY - 19, 2, 2, '#fbbf24');
    }

    // Continuous Wildflower beds along bottom wall edge
    for (let bx = 22; bx < 96; bx += 10) {
      this.drawProceduralBush(ctx, bx, groundY - 6, 7, 5);
      const col = bx % 20 === 0 ? '#fb7185' : (bx % 30 === 0 ? '#fbbf24' : '#ffffff');
      this.drawPixelRect(ctx, bx - 1, groundY - 8, 2, 2, col);
    }
    for (let bx = 196; bx < 262; bx += 10) {
      this.drawProceduralBush(ctx, bx, groundY - 6, 7, 5);
      const col = bx % 20 === 0 ? '#e879f9' : (bx % 30 === 0 ? '#38bdf8' : '#ffffff');
      this.drawPixelRect(ctx, bx - 1, groundY - 8, 2, 2, col);
    }

    // 6. Ground Baseline Separation Line
    this.drawPixelLine(ctx, 10, groundY, totalW - 10, groundY, '#26364b');
  }

  private static drawPlazaLandmark(ctx: CanvasRenderingContext2D) {
    const groundY = 170;
    const totalW = 360;

    // 0. Sub-sidewalk Plinth / Foundation (below groundY = 170..185)
    this.drawPixelRect(ctx, 0, 170, totalW, 15, '#1e293b');
    this.drawPixelRect(ctx, 0, 170, totalW, 2, '#94a3b8');

    // 1. Background Mediterranean Forest Trees (Layered behind townhouses and tower, y: 4..80)
    const backTrees = [
      { cx: 85, cy: 45, rx: 30, ry: 28 },
      { cx: 130, cy: 32, rx: 36, ry: 32 },
      { cx: 180, cy: 26, rx: 38, ry: 34 },
      { cx: 230, cy: 35, rx: 34, ry: 30 },
      { cx: 275, cy: 48, rx: 30, ry: 26 },
      // Secondary dense lower canopy fill
      { cx: 60, cy: 65, rx: 24, ry: 20 },
      { cx: 105, cy: 52, rx: 26, ry: 22 },
      { cx: 155, cy: 45, rx: 28, ry: 24 },
      { cx: 205, cy: 48, rx: 26, ry: 22 },
      { cx: 250, cy: 58, rx: 25, ry: 20 }
    ];
    for (const t of backTrees) {
      this.drawProceduralBush(ctx, t.cx, t.cy, t.rx, t.ry);
    }

    // Color Palette
    const cCream = '#fcf6e5';
    const cCreamSh = '#ded3bb';
    const cWhite = '#ffffff';
    const cGrout = '#d6c8ad';
    const cCornice = '#ede2c8';
    const cTerra = '#dd6242';
    const cTerraHi = '#f97316';
    const cTerraDk = '#9a3412';
    const cBlue = '#1d4ed8';

    // =========================================================================
    // 2. OPEN CLASSICAL 3-TIERED EUROPEAN PLAZA FOUNTAIN (x: 14..98, center fx = 56)
    // Completely open tiered stone fountain — NO pavilion canopy roof, NO gazebo columns!
    // =========================================================================
    const fx = 56;

    // Stepped Circular Stone Plinth (flush at groundY = 170)
    this.drawPixelRect(ctx, fx - 42, groundY - 4, 84, 4, '#94a3b8');
    this.drawPixelLine(ctx, fx - 42, groundY - 4, fx + 42, groundY - 4, '#cbd5e1');

    // Large Lower Octagonal Carved Stone Basin (x: 18..94, w: 76, y: 146..166)
    this.drawPixelRect(ctx, fx - 38, 148, 76, groundY - 148 - 4, cCornice);
    this.drawPixelRect(ctx, fx - 40, 145, 80, 4, '#f8fafc'); // Basin top coping rim
    this.drawPixelLine(ctx, fx - 40, 145, fx + 40, 145, '#ffffff'); // Rim highlight
    this.drawPixelLine(ctx, fx - 40, 148, fx + 40, 148, '#cbd5e1'); // Rim drop shadow
    // Basin Outer Wall Ashlar relief
    for (let bx = fx - 38; bx < fx + 38; bx += 19) {
      this.drawPixelLine(ctx, bx, 149, bx, groundY - 4, cGrout);
    }

    // Clear Azure & Cyan Water Pool inside Lower Basin
    this.drawPixelRect(ctx, fx - 35, 149, 70, 14, '#0284c7');
    this.drawPixelRect(ctx, fx - 33, 150, 66, 10, '#38bdf8');
    this.drawPixelRect(ctx, fx - 28, 151, 56, 5, '#7dd3fc');
    // Glistening Water Surface Ripple Highlights
    this.drawPixelLine(ctx, fx - 24, 152, fx - 10, 152, '#ffffff');
    this.drawPixelLine(ctx, fx + 10, 152, fx + 24, 152, '#ffffff');
    this.drawPixelLine(ctx, fx - 18, 155, fx - 6, 155, '#bae6fd');
    this.drawPixelLine(ctx, fx + 6, 155, fx + 18, 155, '#bae6fd');

    // Central Classical Sculpted Baluster / Pedestal (rises out of water)
    this.drawPixelRect(ctx, fx - 6, 126, 12, 28, cCornice);
    this.drawPixelLine(ctx, fx - 6, 126, fx - 6, 154, cWhite);
    this.drawPixelLine(ctx, fx + 5, 126, fx + 5, 154, cCreamSh);
    this.drawPixelRect(ctx, fx - 8, 148, 16, 4, '#e2e8f0'); // Pedestal base ring

    // Mid-Level Scalloped Stone Bowl (x: 34..78, w: 44, y: 124..134)
    this.drawPixelRect(ctx, fx - 22, 128, 44, 6, cCornice);
    this.drawPixelRect(ctx, fx - 24, 125, 48, 4, '#f8fafc'); // Bowl rim
    this.drawPixelLine(ctx, fx - 24, 125, fx + 24, 125, '#ffffff');
    this.drawPixelLine(ctx, fx - 24, 128, fx + 24, 128, '#cbd5e1');
    // Water inside Mid Bowl
    this.drawPixelRect(ctx, fx - 20, 127, 40, 3, '#38bdf8');
    this.drawPixelLine(ctx, fx - 16, 127, fx + 16, 127, '#bae6fd');

    // Overflowing Cascades (Sheets of water spilling from Mid-Bowl into Lower Basin)
    for (const sx of [fx - 23, fx - 12, fx + 12, fx + 23]) {
      this.drawPixelLine(ctx, sx, 128, sx, 149, 'rgba(255, 255, 255, 0.85)', 1);
      this.drawPixelLine(ctx, sx + (sx > fx ? -1 : 1), 131, sx + (sx > fx ? -1 : 1), 148, '#bae6fd', 1);
      // Splash droplets at landing
      this.drawPixelRect(ctx, sx - 1, 148, 3, 2, '#ffffff');
    }

    // Upper Pedestal Finial & Spout (x: 50..62, y: 110..118)
    this.drawPixelRect(ctx, fx - 4, 114, 8, 11, cCornice);
    this.drawPixelRect(ctx, fx - 6, 111, 12, 4, '#f8fafc');
    this.drawPixelLine(ctx, fx - 6, 111, fx + 6, 111, '#ffffff');

    // Sparkling Central Water Plume Jet (Shooting up into the air: y: 92..112)
    this.drawPixelLine(ctx, fx, 92, fx, 112, '#ffffff', 2);
    this.drawPixelRect(ctx, fx - 1, 95, 3, 14, '#e0f2fe');
    // Arching water droplets falling gracefully on both sides
    this.drawPixelRect(ctx, fx - 3, 98, 2, 3, '#ffffff');
    this.drawPixelRect(ctx, fx + 2, 98, 2, 3, '#ffffff');
    this.drawPixelRect(ctx, fx - 6, 103, 2, 4, '#bae6fd');
    this.drawPixelRect(ctx, fx + 5, 103, 2, 4, '#bae6fd');
    this.drawPixelRect(ctx, fx - 9, 109, 2, 5, '#7dd3fc');
    this.drawPixelRect(ctx, fx + 8, 109, 2, 5, '#7dd3fc');
    this.drawPixelRect(ctx, fx - 12, 116, 2, 6, '#38bdf8');
    this.drawPixelRect(ctx, fx + 11, 116, 2, 6, '#38bdf8');

    // Terracotta Planter Urns flanking the fountain
    for (const px of [fx - 46, fx + 46]) {
      this.drawPixelRect(ctx, px - 4, groundY - 12, 8, 12, '#c2410c');
      this.drawPixelRect(ctx, px - 5, groundY - 14, 10, 3, '#ea580c');
      this.drawProceduralBush(ctx, px, groundY - 16, 6, 5);
      this.drawPixelRect(ctx, px - 1, groundY - 17, 2, 2, '#fbbf24');
    }

    // =========================================================================
    // 3. CENTRAL MEDITERRANEAN TOWNHOUSE — STRICTLY SYMMETRICAL! (cx = 180)
    // Symmetrically framed from x = 108 to x = 252 (Width 144px, Height 122px)
    // =========================================================================
    const tcX = 180;
    const twHalf = 72; // Width 144, extends tcX - 72 (108) to tcX + 72 (252)

    this.drawPixelRect(ctx, tcX - twHalf, 64, twHalf * 2, groundY - 64, cCream);
    this.drawPixelLine(ctx, tcX - twHalf, 64, tcX - twHalf, groundY, cWhite);
    this.drawPixelLine(ctx, tcX + twHalf - 1, 64, tcX + twHalf - 1, groundY, cCreamSh);

    // Stone Quoins on Townhouse Corners (Symmetrical!)
    for (let qy = 64; qy < groundY - 10; qy += 12) {
      this.drawPixelRect(ctx, tcX - twHalf, qy, 4, 6, cCornice);
      this.drawPixelRect(ctx, tcX + twHalf - 4, qy, 4, 6, cCreamSh);
    }

    // Sloped Terracotta Roof (Symmetrically centered at tcX = 180!)
    this.drawPixelRect(ctx, tcX - twHalf - 2, 56, twHalf * 2 + 4, 10, cTerra);
    this.drawPixelRect(ctx, tcX - twHalf - 4, 53, twHalf * 2 + 8, 4, cTerraHi);
    this.drawPixelLine(ctx, tcX - twHalf - 4, 53, tcX + twHalf + 4, 53, '#ffedd5');
    this.drawPixelLine(ctx, tcX - twHalf - 4, 66, tcX + twHalf + 4, 66, cTerraDk);
    for (let rx = tcX - twHalf; rx < tcX + twHalf; rx += 8) {
      this.drawPixelLine(ctx, rx, 56, rx + 4, 66, cTerraDk);
      this.drawPixelLine(ctx, rx - 1, 56, rx + 3, 66, cTerraHi);
    }

    // Twin Symmetrical Brick Chimneys (Centered at tcX - 46 and tcX + 46!)
    for (const cx of [tcX - 46, tcX + 46]) {
      this.drawPixelRect(ctx, cx - 7, 32, 14, 24, '#c2410c');
      this.drawPixelRect(ctx, cx - 9, 29, 18, 4, '#ea580c');
      this.drawPixelLine(ctx, cx - 9, 29, cx + 9, 29, '#ffedd5');
      this.drawPixelRect(ctx, cx - 5, 31, 10, 2, '#451a03'); // Flue opening
    }

    // Second Floor: 3 Symmetrical Windows with French Blue Shutters (at tcX - 46, tcX, tcX + 46)
    for (const wx of [tcX - 46, tcX, tcX + 46]) {
      this.drawPixelRect(ctx, wx - 16, 76, 7, 24, cBlue); // Left shutter
      this.drawPixelRect(ctx, wx - 15, 78, 5, 20, '#1e40af');
      this.drawPixelRect(ctx, wx + 9, 76, 7, 24, cBlue);  // Right shutter
      this.drawPixelRect(ctx, wx + 10, 78, 5, 20, '#1e40af');

      this.drawPixelRect(ctx, wx - 8, 76, 16, 24, '#0f172a'); // Window frame
      this.drawPixelRect(ctx, wx - 7, 77, 14, 22, '#78c8ec'); // Glass pane
      this.drawPixelLine(ctx, wx, 77, wx, 98, '#ffffff'); // Vertical mullion
      this.drawPixelLine(ctx, wx - 7, 87, wx + 6, 87, '#ffffff'); // Transom
      this.drawPixelRect(ctx, wx - 10, 100, 20, 3, cCornice); // Stone sill

      // Window Box Planters
      this.drawPixelRect(ctx, wx - 9, 97, 18, 4, '#c2410c');
      this.drawProceduralBush(ctx, wx, 95, 8, 4);
      this.drawPixelRect(ctx, wx - 4, 94, 2, 2, '#f43f5e');
      this.drawPixelRect(ctx, wx + 2, 94, 2, 2, '#fbbf24');
      // Trailing ivy spilling below sill
      this.drawPixelLine(ctx, wx - 5, 101, wx - 5, 105, '#16a34a');
      this.drawPixelLine(ctx, wx + 4, 101, wx + 4, 106, '#16a34a');
    }

    // Ground Floor: Centered Grand French Arched Double Doors (at tcX = 180, w: 28)
    this.drawPixelRect(ctx, tcX - 14, 122, 28, groundY - 122, '#0f172a');
    this.drawPixelCircle(ctx, tcX, 122, 14, '#0f172a');
    this.drawPixelCircle(ctx, tcX, 122, 16, 'transparent', cCornice);
    // Doors
    this.drawPixelRect(ctx, tcX - 12, 124, 11, 44, cBlue);
    this.drawPixelRect(ctx, tcX + 1, 124, 11, 44, cBlue);
    this.drawPixelRect(ctx, tcX - 10, 126, 7, 20, '#0a1622');
    this.drawPixelRect(ctx, tcX + 3, 126, 7, 20, '#0a1622');
    this.drawPixelRect(ctx, tcX - 10, 150, 7, 14, '#1e40af');
    this.drawPixelRect(ctx, tcX + 3, 150, 7, 14, '#1e40af');
    this.drawPixelLine(ctx, tcX, 124, tcX, groundY - 2, '#0f172a', 1);
    // Golden brass handles
    this.drawPixelRect(ctx, tcX - 2, 144, 2, 7, '#fbbf24');
    this.drawPixelRect(ctx, tcX + 1, 144, 2, 7, '#fbbf24');
    // Door Stone Threshold flush at groundY = 170
    this.drawPixelRect(ctx, tcX - 16, groundY - 2, 32, 2, '#cbd5e1');

    // Ground Floor Symmetrical Side Windows (at tcX - 46 and tcX + 46)
    for (const wx of [tcX - 46, tcX + 46]) {
      this.drawPixelRect(ctx, wx - 15, 124, 6, 26, cBlue);
      this.drawPixelRect(ctx, wx + 9, 124, 6, 26, cBlue);
      this.drawPixelRect(ctx, wx - 8, 124, 16, 26, '#0f172a');
      this.drawPixelRect(ctx, wx - 7, 125, 14, 24, '#78c8ec');
      this.drawPixelLine(ctx, wx, 125, wx, 148, '#ffffff');
      this.drawPixelRect(ctx, wx - 10, 150, 20, 3, cCornice);
    }

    // Symmetrical Benches Flanking Central Entrance (x: 144..162 and x: 198..216)
    for (const bx of [tcX - 27, tcX + 27]) {
      this.drawPixelRect(ctx, bx - 9, 160, 2, groundY - 160, '#0f172a');
      this.drawPixelRect(ctx, bx + 7, 160, 2, groundY - 160, '#0f172a');
      this.drawPixelRect(ctx, bx - 11, 156, 22, 4, '#d97706');
      this.drawPixelLine(ctx, bx - 11, 156, bx + 11, 156, '#fef08a');
      this.drawPixelRect(ctx, bx - 10, 151, 20, 4, '#b45309');
    }

    // =========================================================================
    // 5. TOWER ON RIGHT — CLOCK DIAL & RECTANGLES REMOVED! (Converted to Greenery)
    // Sits at x: 266..310, y: 14..170. Pure classical campanile with lush climbing plants!
    // =========================================================================
    const towX = 288;
    this.drawPixelRect(ctx, towX - 22, 48, 44, groundY - 48, cCream);
    this.drawPixelRect(ctx, towX - 24, 44, 48, 4, cCornice);
    this.drawPixelLine(ctx, towX - 22, 48, towX - 22, groundY, cWhite);
    this.drawPixelLine(ctx, towX + 21, 48, towX + 21, groundY, cCreamSh);

    // Tower Belt Courses & Quoins
    for (let ty = 65; ty < groundY; ty += 20) {
      this.drawPixelLine(ctx, towX - 22, ty, towX + 21, ty, cGrout);
    }
    for (let qy = 48; qy < groundY - 10; qy += 10) {
      this.drawPixelRect(ctx, towX - 22, qy, 4, 5, cCornice);
      this.drawPixelRect(ctx, towX + 18, qy, 4, 5, cCreamSh);
    }

    // Arched Belfry Openings (y: 50..70)
    this.drawPixelRect(ctx, towX - 10, 52, 20, 16, '#0f172a');
    this.drawPixelCircle(ctx, towX, 52, 10, '#0f172a');
    this.drawPixelCircle(ctx, towX, 58, 4, '#d97706'); // Bell inside

    // Terracotta Pyramid Spire atop Tower (y: 14..44)
    this.drawPixelRect(ctx, towX - 24, 42, 48, 3, cTerraDk);
    ctx.fillStyle = cTerra;
    ctx.beginPath();
    ctx.moveTo(towX - 24, 42); ctx.lineTo(towX, 16); ctx.lineTo(towX + 24, 42);
    ctx.closePath(); ctx.fill();
    this.drawPixelLine(ctx, towX - 24, 42, towX, 16, cTerraHi, 2);
    this.drawPixelLine(ctx, towX, 16, towX + 24, 42, cTerraDk, 2);
    // Spire Finial Pole & Golden Ball
    this.drawPixelLine(ctx, towX, 16, towX, 7, '#475569', 2);
    this.drawPixelCircle(ctx, towX, 6, 3, '#fbbf24');

    // MIDDLE TOWER SECTION: CLOCK FACE REMOVED! Replaced with Classical Carved Stone Medallion
    this.drawPixelCircle(ctx, towX, 88, 12, '#ede2c8', '#cbd5e1');
    this.drawPixelCircle(ctx, towX, 88, 9, '#fcf6e5');
    this.drawPixelCircle(ctx, towX, 88, 4, '#d6c8ad');

    // LOWER TOWER SECTION: 2 RECTANGLES REMOVED! Replaced with Tasteful Green Trellis & Planters!
    // Wall Terracotta Planter Box (y: 122..128)
    this.drawPixelRect(ctx, towX - 10, 124, 20, 5, '#c2410c');
    this.drawPixelRect(ctx, towX - 11, 123, 22, 2, '#ea580c');
    this.drawProceduralBush(ctx, towX, 121, 9, 6);
    this.drawPixelRect(ctx, towX - 4, 120, 2, 2, '#f43f5e');
    this.drawPixelRect(ctx, towX + 3, 120, 2, 2, '#fbbf24');

    // Lush Vertical Climbing Ivy Vines on the Tower Wall (y: 72..168)
    for (let ty = 74; ty < groundY - 6; ty += 4) {
      const tx1 = towX - 12 + Math.floor(2.5 * Math.sin(ty * 0.4));
      this.drawPixelCircle(ctx, tx1, ty, 3, '#166534');
      this.drawPixelCircle(ctx, tx1 - 1, ty - 1, 2, '#22c55e');
      if (ty % 12 === 0) {
        this.drawPixelRect(ctx, tx1, ty, 2, 2, '#fb7185'); // Small blossom
      }
      if (ty > 130) {
        const tx2 = towX + 11 + Math.floor(2 * Math.sin(ty * 0.5));
        this.drawPixelCircle(ctx, tx2, ty, 3, '#15803d');
        this.drawPixelCircle(ctx, tx2 - 1, ty - 1, 2, '#4ade80');
      }
    }

    // =========================================================================
    // 6. RIGHT STONE ARCH GATEWAY (x: 316..356, y: 78..170)
    // =========================================================================
    this.drawPixelRect(ctx, 318, 78, 38, groundY - 78, cCream);
    this.drawPixelRect(ctx, 316, 74, 42, 4, cCornice);
    this.drawPixelLine(ctx, 318, 78, 318, groundY, cWhite);
    // Stone Gateway Archway opening
    this.drawPixelRect(ctx, 324, 108, 24, groundY - 108, '#0f172a');
    this.drawPixelCircle(ctx, 336, 108, 12, '#0f172a');
    this.drawPixelCircle(ctx, 336, 108, 14, 'transparent', cCornice);
    // Climbing ivy on gateway arch
    for (let iy = 80; iy < groundY - 10; iy += 4) {
      const ix = 320 + Math.floor(3 * Math.sin(iy * 0.4));
      this.drawPixelCircle(ctx, ix, iy, 3, '#166534');
      this.drawPixelCircle(ctx, ix - 1, iy - 1, 2, '#22c55e');
      if (iy % 12 === 0) {
        this.drawPixelRect(ctx, ix, iy, 2, 2, '#fb7185'); // Rose bloom
      }
    }

    // 7. Terracotta Flower Urns & Wildflowers along sidewalk
    for (const px of [108, 160, 204, 260, 314]) {
      this.drawPixelRect(ctx, px - 5, groundY - 14, 10, 14, '#c2410c');
      this.drawPixelRect(ctx, px - 6, groundY - 16, 12, 3, '#ea580c');
      this.drawProceduralBush(ctx, px, groundY - 18, 7, 6);
      this.drawPixelRect(ctx, px - 2, groundY - 20, 2, 2, '#f43f5e');
      this.drawPixelRect(ctx, px + 1, groundY - 19, 2, 2, '#fbbf24');
    }

    // 8. Ground Baseline Separation Line
    this.drawPixelLine(ctx, 10, groundY, totalW - 10, groundY, '#26364b');
  }

  private static drawPrintHouse(ctx: CanvasRenderingContext2D) {
    // =========================================================================
    // 03 PRINT HOUSE — Authentic Reference Architecture (260 x 165)
    // Directly matching reference art Strip 3 (Authentic Atelier & Print Shop):
    // - PROPORTIONS: Width 260, Height 165. Ground line at groundY = 150.
    // - GROUND CONTACT: Door bottom, bike wheels, bench, flower pots ALL sit
    //   directly on top of the sidewalk at groundY = 150! Sub-sidewalk plinth
    //   extends to y = 165 for 100% seamless, gap-free grounding.
    // - CLEAN DOORS: Solid dignified dark slate panels with NO excess glare/colors,
    //   ONLY a crisp golden yellow color block on the central door handles.
    // - LEFT (x: 16..90, y: 78..150): Low courtyard wall with stone coping & ivy,
    //   carved "IDEAS INTO THINGS" in 3 lines, parked vintage bicycle, mail cabinet & mint pot.
    // - CENTER (x: 90..166, y: 46..150): Artisan entrance facade. Rooftop signboard
    //   "PRINT HOUSE" centered at x = 128 right above the entrance double doors,
    //   flanked by classical carved stone urn pedestals.
    // - RIGHT (x: 168..248, y: 68..150): Vitrine exhibition window with interior art posters,
    //   front wooden park bench, right blue notice board, rooftop iron terrace railing with ivy,
    //   and outdoor metal fire-escape ladder.
    // - BACKGROUND (y: 8..78): Dense, lush Mediterranean tree canopy arching over the roof.
    // =========================================================================

    const groundY = 150;

    // 1. Background Lush Tree Crowns (Layered behind Rooftop & Wall)
    const treeNodes = [
      { cx: 14, cy: 52, rx: 16, ry: 15 },
      { cx: 32, cy: 40, rx: 20, ry: 18 },
      { cx: 54, cy: 28, rx: 22, ry: 19 },
      { cx: 78, cy: 20, rx: 24, ry: 20 },
      { cx: 104, cy: 16, rx: 25, ry: 20 },
      { cx: 128, cy: 14, rx: 26, ry: 20 },
      { cx: 152, cy: 16, rx: 25, ry: 20 },
      { cx: 178, cy: 22, rx: 24, ry: 19 },
      { cx: 204, cy: 30, rx: 22, ry: 18 },
      { cx: 228, cy: 42, rx: 20, ry: 18 },
      { cx: 248, cy: 56, rx: 16, ry: 16 }
    ];
    for (const t of treeNodes) {
      this.drawProceduralBush(ctx, t.cx, t.cy, t.rx, t.ry);
    }
    // Dense foliage fill behind roof parapet, terrace railing, and sign
    for (const t of [
      { cx: 26, cy: 62, rx: 18, ry: 16 },
      { cx: 48, cy: 54, rx: 20, ry: 18 },
      { cx: 72, cy: 46, rx: 22, ry: 18 },
      { cx: 96, cy: 42, rx: 22, ry: 18 },
      { cx: 116, cy: 36, rx: 24, ry: 19 },
      { cx: 140, cy: 36, rx: 24, ry: 19 },
      { cx: 164, cy: 42, rx: 22, ry: 18 },
      { cx: 186, cy: 48, rx: 22, ry: 18 },
      { cx: 208, cy: 54, rx: 20, ry: 18 },
      { cx: 230, cy: 60, rx: 18, ry: 16 }
    ]) {
      this.drawProceduralBush(ctx, t.cx, t.cy, t.rx, t.ry);
    }

    // 2. Foundation & Sub-sidewalk Plinth (y: 150..165)
    // Ensures seamless ground contact without gaps under the sidewalk
    this.drawPixelRect(ctx, 8, groundY, 244, 2, '#475569');
    this.drawPixelRect(ctx, 8, groundY + 2, 244, 13, '#cbd5e1');
    this.drawPixelRect(ctx, 8, groundY + 13, 244, 2, '#94a3b8');

    // Stone and wall palette
    const cWallCream = '#fbf8ee';
    const cWallShade = '#f0e8d5';
    const cWallDark = '#ded3bd';
    const cWallJoint = '#c8baa0';
    const cWallHi = '#ffffff';

    // Cinema Unified Blue Palette (Matching Marc Cinema standard)
    const cBlueHi = '#5eb6ed';
    const cBlueMain = '#2679bd';
    const cBlueDark = '#18598a';
    const cBlueDeep = '#0f3a5e';

    // =========================================================================
    // PART A: LEFT COURTYARD WALL (x: 16..90, y: 78..150)
    // =========================================================================
    // Left Stone Pier Column (x: 16..24, y: 72..150)
    this.drawPixelRect(ctx, 16, 74, 8, groundY - 74, cWallCream);
    this.drawPixelRect(ctx, 15, 72, 10, 3, '#ffffff');
    this.drawPixelRect(ctx, 15, 75, 10, 2, '#cbd5e1');
    this.drawPixelLine(ctx, 24, 75, 24, groundY, cWallJoint);

    // Wall Body (x: 24..90, y: 78..150)
    this.drawPixelRect(ctx, 24, 78, 66, groundY - 78, cWallCream);
    // Horizontal mortar joint lines on courtyard wall
    for (const y of [92, 106, 120, 134]) {
      this.drawPixelLine(ctx, 24, y, 90, y, cWallJoint);
      this.drawPixelLine(ctx, 24, y + 1, 90, y + 1, cWallHi);
    }

    // Wooden Pergola / Trellis Arbor Beam over courtyard wall (as in reference art)
    this.drawPixelRect(ctx, 18, 71, 74, 3, '#78350f'); // Main timber beam
    this.drawPixelLine(ctx, 18, 71, 92, 71, '#a16207'); // Top highlight
    this.drawPixelRect(ctx, 20, 74, 2, 4, '#78350f'); // Support post
    this.drawPixelRect(ctx, 88, 74, 2, 4, '#78350f');

    // Stone Coping Cap on Wall (x: 23..90, y: 75..79)
    this.drawPixelRect(ctx, 23, 75, 68, 2, '#ffffff');
    this.drawPixelRect(ctx, 23, 77, 68, 2, '#cbd5e1');
    this.drawPixelRect(ctx, 23, 79, 68, 1, '#94a3b8');

    // Cascading green ivy & flower blossoms over arbor and coping
    const ivyClusters = [
      { x: 22, y: 70, rx: 7, ry: 6 },
      { x: 30, y: 73, rx: 8, ry: 7 },
      { x: 34, y: 82, rx: 6, ry: 8 },
      { x: 36, y: 92, rx: 4, ry: 7 },
      { x: 44, y: 72, rx: 6, ry: 5 },
      { x: 68, y: 71, rx: 7, ry: 6 },
      { x: 74, y: 74, rx: 8, ry: 8 },
      { x: 78, y: 83, rx: 6, ry: 9 },
      { x: 80, y: 94, rx: 4, ry: 8 },
      { x: 86, y: 73, rx: 6, ry: 6 }
    ];
    for (const c of ivyClusters) {
      this.drawProceduralBush(ctx, c.x, c.y, c.rx, c.ry);
    }
    // Delicate flower dots blooming in ivy
    for (const fl of [
      { fx: 28, fy: 76, col: '#f43f5e' },
      { fx: 34, fy: 88, col: '#fbbf24' },
      { fx: 43, fy: 73, col: '#fb7185' },
      { fx: 72, fy: 77, col: '#f43f5e' },
      { fx: 78, fy: 89, col: '#fbbf24' },
      { fx: 81, fy: 99, col: '#f43f5e' }
    ]) {
      this.drawPixelRect(ctx, fl.fx, fl.fy, 2, 2, fl.col);
    }

    // Carved Narrative Text: "IDEAS INTO THINGS" (Clean 4x6 point font)
    this.renderPixelText4x6(ctx, 'IDEAS', 44, 94, '#1e293b', 2);
    this.renderPixelText4x6(ctx, 'INTO', 46, 106, '#1e293b', 2);
    this.renderPixelText4x6(ctx, 'THINGS', 40, 118, '#1e293b', 2);

    // Parked Vintage Bicycle (x: 26..56, y: 130..150)
    // Wheels rest directly on ground at groundY = 150!
    this.drawPixelCircle(ctx, 33, 141, 9, '#0f172a');
    this.drawPixelCircle(ctx, 33, 141, 7, '#fbf8ee');
    this.drawPixelCircle(ctx, 33, 141, 2, '#0f172a');

    this.drawPixelCircle(ctx, 53, 141, 9, '#0f172a');
    this.drawPixelCircle(ctx, 53, 141, 7, '#fbf8ee');
    this.drawPixelCircle(ctx, 53, 141, 2, '#0f172a');

    // Bicycle diamond frame
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(33, 141); ctx.lineTo(42, 132); // Seat stay
    ctx.lineTo(44, 141); ctx.lineTo(53, 141); // Chain stay
    ctx.moveTo(42, 132); ctx.lineTo(51, 132); // Top tube
    ctx.lineTo(53, 141); // Down tube
    ctx.stroke();

    // Saddle
    this.drawPixelRect(ctx, 40, 130, 6, 2, '#78350f');
    // Handlebars
    this.drawPixelRect(ctx, 50, 127, 2, 5, '#0f172a');
    this.drawPixelLine(ctx, 48, 127, 54, 127, '#0f172a');

    // Artisan Writer's Outdoor Display Table & Vintage Typewriter (x: 60..86, y: 120..150)
    // 1. Teak timber table sitting on ground
    this.drawPixelRect(ctx, 61, 137, 24, 3, '#b45309');
    this.drawPixelLine(ctx, 61, 137, 84, 137, '#d97706');
    this.drawPixelRect(ctx, 63, 140, 3, 10, '#78350f');
    this.drawPixelRect(ctx, 79, 140, 3, 10, '#78350f');
    this.drawPixelLine(ctx, 63, 144, 81, 144, '#78350f');

    // 2. Vintage Mechanical Typewriter (x: 63..74, y: 127..137)
    this.drawPixelRect(ctx, 64, 131, 10, 6, '#0f172a');
    this.drawPixelRect(ctx, 65, 132, 8, 4, '#1e293b');
    // Key rows
    this.drawPixelLine(ctx, 65, 134, 71, 134, '#f8fafc');
    this.drawPixelLine(ctx, 65, 135, 71, 135, '#cbd5e1');
    // Roller platen & carriage
    this.drawPixelRect(ctx, 63, 129, 12, 2, '#334155');
    this.drawPixelLine(ctx, 63, 129, 74, 129, '#64748b');
    // Paper sheet feeding out of roller
    this.drawPixelRect(ctx, 66, 121, 6, 8, '#ffffff');
    this.drawPixelLine(ctx, 67, 123, 70, 123, '#475569');
    this.drawPixelLine(ctx, 67, 125, 70, 125, '#475569');
    this.drawPixelLine(ctx, 67, 127, 70, 127, '#475569');

    // 3. Stack of Bound Books & Manuscripts on table (x: 75..83, y: 130..137)
    this.drawPixelRect(ctx, 76, 134, 8, 3, '#c2410c'); // Terracotta bottom book
    this.drawPixelLine(ctx, 76, 135, 83, 135, '#fef08a');
    this.drawPixelRect(ctx, 77, 131, 7, 3, '#0284c7'); // Azure top book
    this.drawPixelLine(ctx, 77, 132, 83, 132, '#ffffff');

    // Mint ceramic planter pot next to table (x: 84..90, y: 136..150)
    this.drawPixelRect(ctx, 84, 138, 7, 12, '#2dd4bf');
    this.drawPixelRect(ctx, 83, 136, 9, 2, '#5eead4');
    this.drawProceduralBush(ctx, 87, 132, 6, 6);
    this.drawPixelRect(ctx, 86, 130, 2, 2, '#f43f5e');

    // =========================================================================
    // PART B: MAIN BUILDING FACADE (x: 90..248, y: 78..150)
    // =========================================================================
    // Main wall body
    this.drawPixelRect(ctx, 90, 78, 158, groundY - 78, cWallCream);

    // Quoins on Far Right Corner (x: 242..248)
    for (let y = 78; y < groundY; y += 12) {
      const isAlt = ((y - 78) / 12) % 2 === 0;
      const qw = isAlt ? 6 : 4;
      this.drawPixelRect(ctx, 248 - qw, y, qw, 11, cWallShade);
      this.drawPixelLine(ctx, 248 - qw, y, 248, y, '#ffffff');
      this.drawPixelLine(ctx, 248 - qw, y + 11, 248, y + 11, cWallDark);
    }

    // Horizontal ashlar joint lines across main building facade
    for (const y of [92, 106, 120, 134]) {
      this.drawPixelLine(ctx, 90, y, 248, y, cWallJoint);
      this.drawPixelLine(ctx, 90, y + 1, 248, y + 1, cWallHi);
    }

    // Classical Main Cornice on Roof Parapet (x: 88..249, y: 76..81)
    this.drawPixelRect(ctx, 88, 76, 161, 2, '#ffffff');
    this.drawPixelRect(ctx, 88, 78, 161, 2, '#cbd5e1');
    this.drawPixelRect(ctx, 88, 80, 161, 1, '#94a3b8');

    // =========================================================================
    // PART C: ROOFTOP SIGNBOARD & BALUSTRADE (y: 46..81)
    // =========================================================================
    // Center Signboard Frame (x: 100..156, y: 46..78, w=56, h=32)
    // Centered at x = 128 right above the entrance door!
    this.drawPixelRect(ctx, 100, 46, 56, 32, '#78350f'); // Dark timber frame
    this.drawPixelRect(ctx, 101, 47, 54, 30, '#a16207'); // Warm wood rim
    this.drawPixelRect(ctx, 103, 49, 50, 26, '#faf7ee'); // Ivory sign face
    this.drawPixelRect(ctx, 103, 49, 50, 1, '#fef3c7');
    this.drawPixelRect(ctx, 103, 74, 50, 1, '#e5dccb');

    // Flanking Classical Stone Pedestals & Urn Finials
    // Left Pedestal (x: 91..99, y: 64..78)
    this.drawPixelRect(ctx, 91, 66, 8, 12, '#cbd5e1');
    this.drawPixelRect(ctx, 90, 64, 10, 2, '#ffffff');
    this.drawPixelCircle(ctx, 95, 60, 4, '#e2e8f0', '#94a3b8');
    this.drawPixelRect(ctx, 94, 57, 2, 3, '#94a3b8');

    // Right Pedestal (x: 157..165, y: 64..78)
    this.drawPixelRect(ctx, 157, 66, 8, 12, '#cbd5e1');
    this.drawPixelRect(ctx, 156, 64, 10, 2, '#ffffff');
    this.drawPixelCircle(ctx, 161, 60, 4, '#e2e8f0', '#94a3b8');
    this.drawPixelRect(ctx, 160, 57, 2, 3, '#94a3b8');

    // Right Rooftop Terrace Railing (x: 166..246, y: 68..78)
    this.drawPixelRect(ctx, 166, 68, 80, 2, '#1e293b'); // Top rail
    this.drawPixelRect(ctx, 166, 76, 80, 2, '#1e293b'); // Bottom rail
    for (let rx = 168; rx <= 244; rx += 5) {
      this.drawPixelRect(ctx, rx, 70, 1, 6, '#334155');
    }
    // Climbing ivy on terrace railing
    this.drawPixelRect(ctx, 172, 70, 10, 10, '#059669');
    this.drawPixelRect(ctx, 202, 69, 14, 12, '#10b981');
    this.drawPixelRect(ctx, 234, 71, 8, 10, '#047857');

    // Crisp Bold 5x7 Typography: PRINT / HOUSE
    // PRINT centered at x = 128: width = 33 -> startX = 112
    this.renderMarqueePixelText(ctx, 'PRINT', 112, 51, '#b91c1c', '#7f1d1d');
    // HOUSE centered at x = 128: width = 33 -> startX = 112
    this.renderMarqueePixelText(ctx, 'HOUSE', 112, 63, '#b91c1c', '#7f1d1d');

    // =========================================================================
    // PART D: ENTRANCE DOUBLE DOORS (x: 108..148, y: 84..150)
    // Centered at x = 128 directly below the signboard!
    // USER REQUIREMENTS:
    // 1. Door bottom MUST connect directly to ground at groundY = 150!
    // 2. Clean, dignified door with NO excess glare/color blocks.
    // 3. ONLY a single yellow/gold color block at the door handles!
    // =========================================================================
    // Deep Blue Thin Line Palette (Consistent with Museum steel framing design language)
    const cDbDeep = '#0f1a26';   // Deep boundary
    const cDbFrame = '#182b40';  // Deep blue steel frame
    const cDbLine = '#254263';   // Slender deep blue line highlight
    const cGlassDeep = '#09121b';
    const cGlassBody = '#0e1b27';

    // Recessed Stone Portal Niche (x: 107..149, y: 83..150)
    this.drawPixelRect(ctx, 107, 83, 42, groundY - 83, '#e5dccb');
    this.drawPixelLine(ctx, 107, 83, 148, 83, '#d4cbba');

    // Slender Deep Blue Steel Outer Frame (1px-2px thin lines!)
    this.drawPixelRect(ctx, 108, 84, 40, 2, cDbFrame);
    this.drawPixelLine(ctx, 108, 84, 147, 84, cDbLine);
    this.drawPixelRect(ctx, 108, 86, 2, groundY - 86, cDbFrame);
    this.drawPixelLine(ctx, 108, 86, 108, groundY, cDbDeep);
    this.drawPixelRect(ctx, 146, 86, 2, groundY - 86, cDbFrame);
    this.drawPixelLine(ctx, 147, 86, 147, groundY, cDbDeep);

    // Lintel Top Highlight
    this.drawPixelRect(ctx, 106, 82, 44, 1, '#ffffff');

    // Upper Transom Window (x: 110..146, y: 86..96) - ALL VERTICAL LINES REMOVED!
    this.drawPixelRect(ctx, 110, 86, 36, 10, cGlassDeep);
    this.drawPixelRect(ctx, 111, 87, 34, 8, cGlassBody);

    // Horizontal Divider Bar under Transom (Thin deep blue line)
    this.drawPixelRect(ctx, 108, 96, 40, 2, cDbFrame);
    this.drawPixelLine(ctx, 108, 96, 147, 96, cDbLine);

    // Main Double Doors (x: 110..146, y: 98..150, h=52, 100% Symmetrical around x=128)
    // Left Door Leaf (x: 110..127, w=17)
    this.drawPixelRect(ctx, 110, 98, 17, groundY - 98, cDbFrame);
    this.drawPixelRect(ctx, 112, 100, 13, groundY - 102, cGlassDeep);
    this.drawPixelRect(ctx, 113, 101, 11, 28, cGlassBody);       // Upper dark glass pane
    this.drawPixelLine(ctx, 111, 130, 126, 130, cDbLine);        // Thin horizontal rail
    this.drawPixelRect(ctx, 113, 132, 11, 14, cGlassBody);       // Lower panel pane
    this.drawPixelLine(ctx, 110, 98, 126, 98, cDbLine);          // Top line
    this.drawPixelLine(ctx, 110, 98, 110, groundY, cDbLine);     // Left stile line

    // Right Door Leaf (x: 129..146, w=17)
    this.drawPixelRect(ctx, 129, 98, 17, groundY - 98, cDbFrame);
    this.drawPixelRect(ctx, 131, 100, 13, groundY - 102, cGlassDeep);
    this.drawPixelRect(ctx, 132, 101, 11, 28, cGlassBody);       // Upper dark glass pane
    this.drawPixelLine(ctx, 130, 130, 145, 130, cDbLine);        // Thin horizontal rail
    this.drawPixelRect(ctx, 132, 132, 11, 14, cGlassBody);       // Lower panel pane
    this.drawPixelLine(ctx, 129, 98, 145, 98, cDbLine);          // Top line
    this.drawPixelLine(ctx, 145, 98, 145, groundY, cDbLine);     // Right stile line

    // Center Seam between doors
    this.drawPixelLine(ctx, 128, 98, 128, groundY, cDbDeep);

    // CRITICAL USER REQUIREMENT:
    // "只要有门把手处有色块就行，不要太多色块"
    // Golden Yellow Door Handles ONLY (x: 126..130, y: 120..131)
    this.drawPixelRect(ctx, 126, 120, 2, 11, '#f59e0b');
    this.drawPixelRect(ctx, 127, 120, 1, 11, '#fbbf24');
    this.drawPixelRect(ctx, 129, 120, 2, 11, '#f59e0b');
    this.drawPixelRect(ctx, 129, 120, 1, 11, '#fbbf24');

    // Flanking Wooden Notice Plaques / Sconces
    // Left Plaque (x: 98..104, y: 102..120)
    this.drawPixelRect(ctx, 98, 102, 6, 18, '#b45309');
    this.drawPixelRect(ctx, 99, 103, 4, 16, '#fef3c7');
    this.drawPixelLine(ctx, 99, 106, 102, 106, '#1e293b');
    this.drawPixelLine(ctx, 99, 110, 102, 110, '#dc2626');

    // Right Plaque (x: 152..158, y: 102..120)
    this.drawPixelRect(ctx, 152, 102, 6, 18, '#b45309');
    this.drawPixelRect(ctx, 153, 103, 4, 16, '#fef3c7');
    this.drawPixelLine(ctx, 153, 106, 156, 106, '#1e293b');
    this.drawPixelLine(ctx, 153, 110, 156, 110, '#3b82f6');

    // Terracotta Planter Pots Flanking Entrance
    // Left planter pot (x: 93..102, y: 136..150)
    this.drawPixelRect(ctx, 93, 138, 9, 12, '#c2410c');
    this.drawPixelRect(ctx, 92, 136, 11, 2, '#ea580c');
    this.drawProceduralBush(ctx, 97, 132, 7, 7);
    this.drawPixelRect(ctx, 96, 129, 2, 2, '#f43f5e');

    // Right large terracotta pot (x: 151..163, y: 132..150)
    this.drawPixelRect(ctx, 152, 135, 11, 15, '#c2410c');
    this.drawPixelRect(ctx, 151, 133, 13, 2, '#ea580c');
    this.drawProceduralBush(ctx, 157, 128, 9, 9);
    this.drawPixelRect(ctx, 155, 124, 2, 2, '#f43f5e');
    this.drawPixelRect(ctx, 159, 126, 2, 2, '#fbbf24');

    // =========================================================================
    // PART E: RIGHT VITRINE EXHIBITION WINDOW & BENCH (x: 168..220)
    // =========================================================================
    // Vitrine Steel Frame (x: 168..218, y: 84..146, w=50, h=62)
    this.drawPixelRect(ctx, 168, 84, 50, 62, '#0f172a');
    this.drawPixelRect(ctx, 170, 86, 46, 58, '#1b293c');
    this.drawPixelRect(ctx, 172, 88, 42, 54, '#091522'); // Deep glass interior

    // Transom division bar
    this.drawPixelLine(ctx, 172, 98, 213, 98, '#1e293b');
    this.drawPixelLine(ctx, 192, 88, 192, 98, '#1e293b');

    // Art posters displayed inside vitrine
    // Poster 1: Cream typographic specimen (x: 175..189, y: 102..126)
    this.drawPixelRect(ctx, 175, 102, 14, 24, '#fef3c7');
    this.drawPixelRect(ctx, 177, 105, 10, 3, '#1e293b');
    this.drawPixelRect(ctx, 177, 110, 10, 2, '#dc2626');
    this.drawPixelLine(ctx, 177, 115, 185, 115, '#64748b');
    this.drawPixelLine(ctx, 177, 119, 185, 119, '#64748b');

    // Poster 2: Cyan artistic poster (x: 195..209, y: 104..128)
    this.drawPixelRect(ctx, 195, 104, 14, 24, '#e0f2fe');
    this.drawPixelRect(ctx, 197, 107, 10, 9, '#2563eb');
    this.drawPixelCircle(ctx, 202, 111, 3, '#fbbf24');
    this.drawPixelLine(ctx, 197, 120, 207, 120, '#0f172a');

    // Wooden Park Bench in front of Vitrine (x: 166..220, y: 133..150)
    // Backrest slats
    this.drawPixelRect(ctx, 168, 133, 50, 3, '#b45309');
    this.drawPixelRect(ctx, 168, 137, 50, 3, '#d97706');
    // Seat plank
    this.drawPixelRect(ctx, 166, 141, 54, 3, '#f59e0b');
    this.drawPixelRect(ctx, 166, 143, 54, 1, '#b45309');
    // Cast-iron dark bench legs (resting directly on ground at groundY = 150!)
    this.drawPixelRect(ctx, 170, 144, 3, 6, '#1e293b');
    this.drawPixelRect(ctx, 214, 144, 3, 6, '#1e293b');
    this.drawPixelRect(ctx, 192, 144, 2, 6, '#1e293b');

    // =========================================================================
    // PART F: RIGHT WALL & OUTDOOR STRUCTURE (x: 220..256)
    // =========================================================================
    // Blue Poster Board mounted on right stone wall (x: 226..240, y: 98..124)
    this.drawPixelRect(ctx, 226, 98, 14, 26, cBlueDark);
    this.drawPixelRect(ctx, 227, 99, 12, 24, cBlueMain);
    this.drawPixelRect(ctx, 228, 100, 10, 22, '#ffffff');
    this.drawPixelRect(ctx, 230, 103, 6, 8, '#f59e0b');
    this.drawPixelLine(ctx, 230, 114, 236, 114, '#1e293b');

    // Outdoor Metal Ladder / Stairs Structure (x: 246..256, y: 46..150)
    this.drawPixelRect(ctx, 246, 46, 2, groundY - 46, '#334155');
    this.drawPixelRect(ctx, 254, 46, 2, groundY - 46, '#334155');
    for (let sy = 54; sy < groundY; sy += 8) {
      this.drawPixelLine(ctx, 246, sy, 255, sy, '#475569');
    }

    // Climbing ivy on right structure
    this.drawProceduralBush(ctx, 249, 138, 8, 10);
    this.drawPixelRect(ctx, 247, 136, 2, 2, '#f43f5e');
  }

  private static drawBrandMuseum(ctx: CanvasRenderingContext2D) {
    // =========================================================================
    // 04 BRAND & CREATIVE MUSEUM — Authentic Reference Architecture (260 x 165)
    // Directly matching reference art Strip 3:
    // - COLOR: Warm Sunny French Limestone (#fbf0de, #f4e5cb) with delicate ashlar joints.
    // - LEFT: Stepped projecting stone pylon bearing the royal-indigo/periwinkle
    //   manifesto board: "BRAND / PEOPLE / CULTURE / TOMORROW" with 4 corner standoff screws.
    // - CENTER: Recessed grand entrance double doors with metal sunshade louver,
    //   deep blue thin line steel frame, clean dark architectural glass, and
    //   ONLY golden brass door handles (NO other color blocks!).
    //   Door bottom connects directly to ground at groundY = 150 (0 gap).
    // - RIGHT: Monolithic ashlar sandstone wall engraved with:
    //   "A MORE / HUMAN / CREATIVE / WORLD" in dark petrol charcoal (#183c48).
    // - BENCH: Relocated to the RIGHT side of the building, sitting comfortably below
    //   the engraved text, resting firmly on the sidewalk.
    // - BOUNDARIES: Left courtyard with Victorian streetlamp & poster easel; right cypress & fence.
    // - GROUND: Perfectly connects to sidewalk at groundY = 150 with sub-sidewalk foundation.
    // =========================================================================

    const groundY = 150;

    // Palette
    const cSandBase = '#fbf0de';  // Warm French limestone
    const cSandAlt  = '#f4e5cb';  // Alternating stone course
    const cSandDark = '#d7c7a9';  // Soft mortar seam
    const cSandHi   = '#ffffff';  // Stone top relief highlight

    // 1. Lush Background Mediterranean Tree Canopy over Parapet (y: 6..44)
    const treeCanopy: Array<[number, number, number, number]> = [
      [38, 24, 20, 15], [66, 18, 24, 18], [98, 14, 26, 18],
      [132, 12, 28, 20], [168, 16, 26, 18], [202, 20, 24, 16],
      [234, 26, 20, 15], [252, 32, 16, 13]
    ];
    for (const [cx, cy, rx, ry] of treeCanopy) {
      this.drawProceduralBush(ctx, cx, cy, rx, ry);
    }

    // 2. Foundation sub-sidewalk anchoring (y: 150..165)
    this.drawPixelRect(ctx, 34, groundY, 204, 15, '#c5b89a');
    this.drawPixelLine(ctx, 34, groundY, 238, groundY, '#9e9174');

    // 3. Main Ashlar Sandstone Masonry Facades
    // Left Pylon: x: 38..102 (w=64), y: 34..150
    // Center Door Portal reveal: x: 102..160 (w=58), y: 42..150
    // Right Pylon: x: 160..232 (w=72), y: 42..150
    this.drawPixelRect(ctx, 38, 34, 64, groundY - 34, cSandBase);
    this.drawPixelRect(ctx, 102, 42, 58, groundY - 42, cSandAlt);
    this.drawPixelRect(ctx, 160, 42, 72, groundY - 42, cSandBase);

    // Alternating stone course fills
    for (let y = 48; y < groundY; y += 30) {
      this.drawPixelRect(ctx, 38, y, 64, 15, cSandAlt);
      this.drawPixelRect(ctx, 160, y, 72, 15, cSandAlt);
    }

    // Parapet Cornices
    // Left higher pylon cap (y: 32..36)
    this.drawPixelRect(ctx, 36, 32, 68, 2, cSandHi);
    this.drawPixelRect(ctx, 36, 34, 68, 2, '#eadbc2');
    this.drawPixelRect(ctx, 36, 36, 68, 2, '#c8b695');
    // Center & Right Parapet Cap (y: 40..44)
    this.drawPixelRect(ctx, 100, 40, 134, 2, cSandHi);
    this.drawPixelRect(ctx, 100, 42, 134, 2, '#eadbc2');
    this.drawPixelRect(ctx, 100, 44, 134, 2, '#c8b695');

    // Left Pylon Carved Classical Finial / Urn on Roof (x: 74..82, y: 21..32)
    this.drawPixelRect(ctx, 74, 30, 8, 2, cSandHi);
    this.drawPixelRect(ctx, 75, 26, 6, 4, cSandBase);
    this.drawPixelRect(ctx, 76, 24, 4, 2, cSandHi);
    this.drawPixelRect(ctx, 77, 21, 2, 3, '#cbd5e1');

    // Ashlar Block Joints on Left Pylon
    for (let y = 48; y < groundY; y += 15) {
      this.drawPixelLine(ctx, 38, y, 102, y, cSandDark);
      this.drawPixelLine(ctx, 38, y + 1, 102, y + 1, cSandHi);
    }
    const leftVerticals: Array<[number, number[]]> = [
      [34, [60, 82]], [49, [50, 72, 94]], [64, [60, 82]],
      [79, [50, 72, 94]], [94, [60, 82]], [109, [50, 72, 94]],
      [124, [60, 82]], [139, [50, 72, 94]]
    ];
    for (const [y, xs] of leftVerticals) {
      for (const x of xs) {
        this.drawPixelLine(ctx, x, y, x, y + 15, cSandDark);
      }
    }

    // Ashlar Block Joints on Right Pylon
    for (let y = 48; y < groundY; y += 15) {
      this.drawPixelLine(ctx, 160, y, 232, y, cSandDark);
      this.drawPixelLine(ctx, 160, y + 1, 232, y + 1, cSandHi);
    }
    const rightVerticals: Array<[number, number[]]> = [
      [42, [184, 208]], [57, [172, 196, 220]], [72, [184, 208]],
      [87, [172, 196, 220]], [102, [184, 208]], [117, [172, 196, 220]],
      [132, [184, 208]]
    ];
    for (const [y, xs] of rightVerticals) {
      for (const x of xs) {
        this.drawPixelLine(ctx, x, y, x, y + 15, cSandDark);
      }
    }

    // Shadow cast by projecting left pylon onto center door portal (x: 102..106, y: 44..150)
    this.drawPixelRect(ctx, 102, 44, 4, groundY - 44, 'rgba(15, 23, 42, 0.17)');

    // =========================================================================
    // 4. GIANT ROYAL INDIGO MANIFESTO PLAQUE (x: 46..98, y: 48..134)
    // =========================================================================
    this.drawPixelRect(ctx, 45, 47, 54, 88, '#14182b');
    this.drawPixelRect(ctx, 46, 48, 52, 86, '#262f50'); // Frame
    this.drawPixelRect(ctx, 47, 49, 50, 84, '#394674'); // Bevel
    this.drawPixelRect(ctx, 48, 50, 48, 82, '#505d92'); // Royal indigo plate
    this.drawPixelRect(ctx, 48, 50, 48, 38, '#58679f'); // Highlight

    // 4 Corner Hex Standoff Screws
    for (const [sx, sy] of [[48, 52], [93, 52], [48, 128], [93, 128]]) {
      this.drawPixelRect(ctx, sx, sy, 2, 2, '#e2e8f0');
      this.drawPixelLine(ctx, sx, sy, sx + 1, sy, '#ffffff');
    }

    // Thin stainless steel dividing line in middle
    this.drawPixelLine(ctx, 48, 92, 95, 92, '#384370');
    this.drawPixelLine(ctx, 48, 93, 95, 93, '#6f7fb8');

    // Manifesto Typography (Crisp 4x6 Pure Pixel Font, Centered)
    const manifestoLines: Array<[string, number]> = [
      ['BRAND', 58], ['PEOPLE', 74], ['CULTURE', 98], ['TOMORROW', 114]
    ];
    for (const [txt, yPos] of manifestoLines) {
      const tw = txt.length * 4 + (txt.length - 1) * 2;
      const tx = 48 + Math.floor((48 - tw) / 2);
      this.renderPixelText4x6(ctx, txt, tx, yPos + 1, '#2d3760', 2);
      this.renderPixelText4x6(ctx, txt, tx, yPos, '#ffffff', 2);
    }

    // Classical line-art arch motif at plaque bottom
    this.drawPixelLine(ctx, 63, 126, 81, 126, '#7e8ebf');
    this.drawPixelLine(ctx, 72, 123, 72, 126, '#7e8ebf');
    this.drawPixelCircle(ctx, 72, 122, 1, '#7e8ebf');

    // =========================================================================
    // 5. CENTER RECESSED ENTRANCE DOUBLE DOOR (x: 104..158, y: 46..150)
    // USER STRICT REQUIREMENT:
    // "门上的颜色太多了，说过两三遍了，只要门上有把手就行，其他颜色不需要。"
    // "门的底部需要跟地面是连接的。"
    // Clean architectural entrance with deep blue thin lines and golden handles ONLY!
    // =========================================================================

    // Deep Recessed Portal Jambs & Reveal Shadow (x: 104..158)
    this.drawPixelRect(ctx, 104, 46, 54, groundY - 46, '#151d28');
    this.drawPixelRect(ctx, 105, 48, 52, groundY - 48, '#0c1420');

    // Overhead Sunshade Louver Housing (y: 46..54)
    this.drawPixelRect(ctx, 104, 46, 54, 3, '#64748b');
    this.drawPixelRect(ctx, 104, 49, 54, 3, '#475569');
    this.drawPixelRect(ctx, 104, 52, 54, 2, '#1e293b');

    // Deep Blue Thin Line Steel Outer Framing (Consistent with Museum / Print House language!)
    const cSteelDeep  = '#0f1a26';
    const cSteelFrame = '#182635';
    const cSteelLine  = '#263b52';
    const cGlassDeep  = '#0b1622';
    const cGlassBody  = '#122232';

    this.drawPixelRect(ctx, 105, 54, 52, groundY - 54, cSteelFrame);
    this.drawPixelLine(ctx, 105, 54, 156, 54, cSteelLine);
    this.drawPixelLine(ctx, 105, 54, 105, groundY, cSteelLine);
    this.drawPixelLine(ctx, 156, 54, 156, groundY, cSteelDeep);

    // Bottom steel threshold sitting cleanly at groundY = 150 (0 gap to sidewalk!)
    this.drawPixelRect(ctx, 105, groundY - 1, 52, 2, cSteelDeep);

    // Horizontal Transom Steel Bar (y: 68..70)
    this.drawPixelRect(ctx, 105, 68, 52, 3, cSteelDeep);
    this.drawPixelLine(ctx, 105, 68, 156, 68, cSteelLine);

    // Upper Transom Window (x: 107..155, y: 56..68)
    this.drawPixelRect(ctx, 107, 56, 48, 12, cGlassDeep);
    this.drawPixelRect(ctx, 108, 57, 46, 10, cGlassBody);
    // Thin center mullion on transom
    this.drawPixelRect(ctx, 130, 56, 2, 12, cSteelFrame);

    // Main Entrance Double Doors (x: 107..155, y: 71..150, h=79)
    // Left Door Leaf (x: 107..130, w=23)
    this.drawPixelRect(ctx, 107, 71, 23, groundY - 71, cSteelFrame);
    this.drawPixelRect(ctx, 109, 73, 19, groundY - 75, cGlassDeep);
    this.drawPixelRect(ctx, 110, 74, 17, 34, cGlassBody);
    this.drawPixelLine(ctx, 108, 110, 129, 110, cSteelLine);
    this.drawPixelRect(ctx, 110, 112, 17, 34, cGlassBody);
    this.drawPixelLine(ctx, 107, 71, 129, 71, cSteelLine);
    this.drawPixelLine(ctx, 107, 71, 107, groundY, cSteelLine);

    // Right Door Leaf (x: 132..155, w=23)
    this.drawPixelRect(ctx, 132, 71, 23, groundY - 71, cSteelFrame);
    this.drawPixelRect(ctx, 134, 73, 19, groundY - 75, cGlassDeep);
    this.drawPixelRect(ctx, 135, 74, 17, 34, cGlassBody);
    this.drawPixelLine(ctx, 133, 110, 154, 110, cSteelLine);
    this.drawPixelRect(ctx, 135, 112, 17, 34, cGlassBody);
    this.drawPixelLine(ctx, 132, 71, 154, 71, cSteelLine);
    this.drawPixelLine(ctx, 154, 71, 154, groundY, cSteelLine);

    // Center Seam between doors
    this.drawPixelLine(ctx, 131, 71, 131, groundY, cSteelDeep);

    // CRITICAL USER REQUIREMENT:
    // "只要门上有把手就行，其他颜色不需要。"
    // Golden Yellow Door Handles ONLY (x: 129..133, y: 112..124)
    this.drawPixelRect(ctx, 129, 112, 2, 12, '#f59e0b');
    this.drawPixelRect(ctx, 129, 112, 1, 12, '#fbbf24');
    this.drawPixelRect(ctx, 132, 112, 2, 12, '#f59e0b');
    this.drawPixelRect(ctx, 133, 112, 1, 12, '#fbbf24');

    // Subtle 1px architectural glass sheen diagonal lines (NO colorful shapes!)
    this.drawPixelLine(ctx, 109, 75, 125, 91, 'rgba(255, 255, 255, 0.12)');
    this.drawPixelLine(ctx, 134, 75, 150, 91, 'rgba(255, 255, 255, 0.12)');

    // =========================================================================
    // 6. RIGHT MONOLITH WALL & RELOCATED BENCH (x: 160..232, w=72)
    // USER STRICT REQUIREMENT:
    // "还有就是把门口的座椅挪到建筑右侧。"
    // Upper section: Engraved typography "A MORE / HUMAN / CREATIVE / WORLD"
    // Lower section: Relocated wooden park bench resting firmly on ground!
    // =========================================================================
    const cEngraved = '#183c48';
    const cEngravedShadow = '#d0c3aa';

    const rightTextLines: Array<[string, number, number]> = [
      ['A MORE', 54, 2], ['HUMAN', 68, 2], ['CREATIVE', 82, 1], ['WORLD', 96, 2]
    ];
    for (const [txt, yPos, sp] of rightTextLines) {
      const tw = txt.length * 4 + (txt.length - 1) * sp;
      const tx = 160 + Math.floor((72 - tw) / 2);
      this.renderPixelText4x6(ctx, txt, tx + 1, yPos + 1, cEngravedShadow, sp);
      this.renderPixelText4x6(ctx, txt, tx, yPos, cEngraved, sp);
    }

    // Relocated Wooden Park Bench in front of the Right Wall (x: 168..224, y: 124..150, w=56)
    // Cast-iron curved legs & ground foot plates (y: 136..150)
    this.drawPixelRect(ctx, 172, 136, 3, 12, '#1e293b');
    this.drawPixelRect(ctx, 216, 136, 3, 12, '#1e293b');
    this.drawPixelRect(ctx, 170, 148, 7, 2, '#0f172a');
    this.drawPixelRect(ctx, 214, 148, 7, 2, '#0f172a');
    // Cast iron armrests
    this.drawPixelLine(ctx, 170, 130, 170, 136, '#1e293b', 2);
    this.drawPixelLine(ctx, 220, 130, 220, 136, '#1e293b', 2);
    // Bench Seat (Double teak wood slats: y: 134..138)
    this.drawPixelRect(ctx, 168, 134, 56, 3, '#c27838');
    this.drawPixelLine(ctx, 168, 134, 223, 134, '#df9b58');
    this.drawPixelRect(ctx, 168, 137, 56, 2, '#8c4e1d');
    // Bench Backrest (Upper & lower teak slats: y: 124..130)
    this.drawPixelRect(ctx, 170, 124, 52, 3, '#c27838');
    this.drawPixelLine(ctx, 170, 124, 221, 124, '#df9b58');
    this.drawPixelRect(ctx, 170, 128, 52, 3, '#c27838');
    this.drawPixelLine(ctx, 170, 128, 221, 128, '#8c4e1d');
    // Metal backrest brackets
    this.drawPixelRect(ctx, 176, 124, 2, 10, '#1e293b');
    this.drawPixelRect(ctx, 214, 124, 2, 10, '#1e293b');

    // =========================================================================
    // 7. RIGHT COURTYARD BOUNDARY (x: 232..260)
    // =========================================================================
    // Slender Mediterranean Cypress Tree
    this.drawPixelRect(ctx, 244, 80, 4, 70, '#593213');
    this.drawProceduralBush(ctx, 246, 72, 8, 26);
    this.drawProceduralBush(ctx, 246, 102, 10, 24);

    // Wooden garden fence
    this.drawPixelRect(ctx, 234, 132, 22, 2, '#78350f');
    this.drawPixelRect(ctx, 234, 140, 22, 2, '#78350f');
    this.drawPixelRect(ctx, 236, 126, 3, 24, '#593213');
    this.drawPixelRect(ctx, 246, 126, 3, 24, '#593213');
    this.drawPixelRect(ctx, 254, 126, 3, 24, '#593213');

    // =========================================================================
    // 8. LEFT COURTYARD (x: 0..44)
    // =========================================================================
    // Contemporary Bronze Ribbon/Mobius Sculpture on Polished Granite Pedestal (x: 4..16, y: 118..150)
    // Dark granite plinth
    this.drawPixelRect(ctx, 4, 138, 11, 12, '#1e293b');
    this.drawPixelLine(ctx, 4, 138, 14, 138, '#475569');
    this.drawPixelRect(ctx, 3, 148, 13, 2, '#0f172a');
    // Polished bronze looping geometric sculpture
    this.drawPixelRect(ctx, 7, 122, 5, 16, '#d97706');
    this.drawPixelRect(ctx, 5, 124, 9, 3, '#f59e0b');
    this.drawPixelLine(ctx, 6, 124, 13, 124, '#fef08a');
    this.drawPixelRect(ctx, 4, 127, 3, 8, '#b45309');
    this.drawPixelRect(ctx, 12, 127, 3, 8, '#f59e0b');
    this.drawPixelRect(ctx, 6, 134, 7, 3, '#d97706');
    this.drawPixelLine(ctx, 7, 136, 12, 136, '#78350f');

    // Ornate black streetlamp (x = 18, y: 68..150)
    this.drawPixelRect(ctx, 17, 85, 3, 65, '#1e293b');
    this.drawPixelLine(ctx, 17, 85, 17, groundY, '#334155');
    this.drawPixelRect(ctx, 14, 144, 9, 6, '#0f172a');
    this.drawPixelRect(ctx, 13, 72, 11, 14, '#0f172a');
    this.drawPixelRect(ctx, 14, 74, 9, 10, '#fef08a');
    this.drawPixelRect(ctx, 15, 75, 7, 8, '#ffffff');
    this.drawPixelRect(ctx, 14, 69, 9, 3, '#0f172a');
    this.drawPixelRect(ctx, 17, 67, 3, 2, '#0f172a');

    // Museum Poster Easel Sign (x: 27..43, y: 108..150)
    this.drawPixelRect(ctx, 30, 138, 2, 12, '#64748b');
    this.drawPixelRect(ctx, 38, 138, 2, 12, '#64748b');
    this.drawPixelRect(ctx, 27, 108, 16, 30, '#1e293b');
    this.drawPixelRect(ctx, 28, 109, 14, 28, '#ffffff');
    this.drawPixelRect(ctx, 30, 112, 10, 12, '#3b82f6');
    this.drawPixelCircle(ctx, 35, 118, 3, '#f97316');
    this.drawPixelLine(ctx, 30, 127, 38, 127, '#1e293b');
    this.drawPixelLine(ctx, 30, 131, 36, 131, '#64748b');

    // Recycling Bin / Trash Can (x: 20..27, y: 136..150)
    this.drawPixelRect(ctx, 20, 136, 7, 14, '#475569');
    this.drawPixelRect(ctx, 19, 134, 9, 2, '#334155');
    this.drawPixelRect(ctx, 21, 138, 5, 4, '#38bdf8');

    // =========================================================================
    // 9. CONTINUOUS WILDFLOWER GARDEN BEDS
    // =========================================================================
    // Left garden bed (x: 8..102, framing left courtyard & pylon)
    const leftBushes: Array<[number, number, number, number]> = [
      [12, 146, 8, 6], [24, 145, 10, 7], [36, 146, 12, 8],
      [48, 145, 13, 8], [64, 146, 14, 8], [80, 145, 13, 8],
      [96, 146, 10, 7]
    ];
    for (const [cx, cy, rx, ry] of leftBushes) {
      this.drawProceduralBush(ctx, cx, cy, rx, ry);
    }

    // Right garden bed (x: 162..258, framing right wall & fence, around bench legs)
    const rightBushes: Array<[number, number, number, number]> = [
      [164, 147, 6, 5], [228, 146, 10, 7], [242, 146, 12, 8], [254, 147, 8, 6]
    ];
    for (const [cx, cy, rx, ry] of rightBushes) {
      this.drawProceduralBush(ctx, cx, cy, rx, ry);
    }

    // Blooming Flower Blossoms
    const flowerDots: Array<[number, number, string]> = [
      [10, 143, '#f43f5e'], [16, 145, '#fbbf24'], [24, 142, '#e879f9'], [32, 145, '#ffffff'],
      [40, 142, '#f43f5e'], [48, 146, '#38bdf8'], [56, 141, '#fbbf24'], [64, 145, '#ffffff'],
      [72, 142, '#f43f5e'], [80, 146, '#e879f9'], [88, 143, '#fbbf24'], [94, 145, '#ffffff'],
      [164, 145, '#38bdf8'], [228, 144, '#fbbf24'], [236, 145, '#f43f5e'],
      [244, 142, '#ffffff'], [252, 145, '#e879f9']
    ];
    for (const [fx, fy, col] of flowerDots) {
      this.drawPixelRect(ctx, fx, fy, 2, 2, col);
    }

    // Climbing Ivy on Left Pylon Wall (x: 40..46, y: 110..144)
    for (const [iy, ix] of [[114, 40], [120, 42], [126, 41], [132, 40], [138, 42]]) {
      this.drawPixelCircle(ctx, ix, iy, 3, '#3b8750');
      this.drawPixelRect(ctx, ix, iy, 1, 1, '#f43f5e');
    }
  }

  // Bitmap font tables for authentic crisp pixel typography
  private static readonly PIXEL_FONT_3X5: Record<string, number[]> = {
    'A': [0b010, 0b101, 0b111, 0b101, 0b101],
    'B': [0b110, 0b101, 0b110, 0b101, 0b110],
    'C': [0b011, 0b100, 0b100, 0b100, 0b011],
    'D': [0b110, 0b101, 0b101, 0b101, 0b110],
    'E': [0b111, 0b100, 0b110, 0b100, 0b111],
    'F': [0b111, 0b100, 0b110, 0b100, 0b100],
    'G': [0b011, 0b100, 0b101, 0b101, 0b011],
    'H': [0b101, 0b101, 0b111, 0b101, 0b101],
    'I': [0b111, 0b010, 0b010, 0b010, 0b111],
    'J': [0b001, 0b001, 0b001, 0b101, 0b010],
    'K': [0b101, 0b110, 0b100, 0b110, 0b101],
    'L': [0b100, 0b100, 0b100, 0b100, 0b111],
    'M': [0b101, 0b111, 0b101, 0b101, 0b101],
    'N': [0b110, 0b101, 0b101, 0b101, 0b101],
    'O': [0b010, 0b101, 0b101, 0b101, 0b010],
    'P': [0b110, 0b101, 0b110, 0b100, 0b100],
    'Q': [0b010, 0b101, 0b101, 0b110, 0b011],
    'R': [0b110, 0b101, 0b110, 0b101, 0b101],
    'S': [0b011, 0b100, 0b010, 0b001, 0b110],
    'T': [0b111, 0b010, 0b010, 0b010, 0b010],
    'U': [0b101, 0b101, 0b101, 0b101, 0b111],
    'V': [0b101, 0b101, 0b101, 0b101, 0b010],
    'W': [0b101, 0b101, 0b101, 0b111, 0b101],
    'X': [0b101, 0b101, 0b010, 0b101, 0b101],
    'Y': [0b101, 0b101, 0b010, 0b010, 0b010],
    'Z': [0b111, 0b001, 0b010, 0b100, 0b111],
    ' ': [0b000, 0b000, 0b000, 0b000, 0b000]
  };

  private static readonly PIXEL_FONT_5X7_BOLD: Record<string, number[]> = {
    'A': [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
    'B': [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
    'C': [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
    'D': [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
    'E': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
    'F': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
    'G': [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
    'H': [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
    'I': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
    'J': [0b00111, 0b00010, 0b00010, 0b00010, 0b10010, 0b10010, 0b01100],
    'K': [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
    'L': [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
    'M': [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
    'N': [0b10001, 0b11001, 0b10101, 0b10101, 0b10011, 0b10011, 0b10001],
    'O': [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    'P': [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
    'Q': [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10011, 0b01111],
    'R': [0b11110, 0b10001, 0b10001, 0b11110, 0b11000, 0b10100, 0b10011],
    'S': [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
    'T': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
    'U': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    'V': [0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b01010, 0b00100],
    'W': [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
    'X': [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
    'Y': [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
    'Z': [0b11111, 0b00010, 0b00100, 0b01000, 0b10000, 0b10000, 0b11111],
    '.': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b01100, 0b01100],
    '-': [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
    '&': [0b01100, 0b10010, 0b01100, 0b01010, 0b10001, 0b10011, 0b01101],
    '★': [0b00100, 0b00100, 0b11111, 0b01110, 0b01110, 0b10001, 0b10001],
    ' ': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000]
  };

  private static readonly PIXEL_FONT_4X6: Record<string, number[]> = {
    'A': [0b0110, 0b1001, 0b1001, 0b1111, 0b1001, 0b1001],
    'B': [0b1110, 0b1001, 0b1110, 0b1001, 0b1001, 0b1110],
    'C': [0b0110, 0b1001, 0b1000, 0b1000, 0b1001, 0b0110],
    'D': [0b1110, 0b1001, 0b1001, 0b1001, 0b1001, 0b1110],
    'E': [0b1111, 0b1000, 0b1110, 0b1000, 0b1000, 0b1111],
    'F': [0b1111, 0b1000, 0b1110, 0b1000, 0b1000, 0b1000],
    'G': [0b0110, 0b1001, 0b1000, 0b1011, 0b1001, 0b0110],
    'H': [0b1001, 0b1001, 0b1111, 0b1001, 0b1001, 0b1001],
    'I': [0b1110, 0b0100, 0b0100, 0b0100, 0b0100, 0b1110],
    'J': [0b0010, 0b0010, 0b0010, 0b1010, 0b1010, 0b0100],
    'K': [0b1001, 0b1010, 0b1100, 0b1100, 0b1010, 0b1001],
    'L': [0b1000, 0b1000, 0b1000, 0b1000, 0b1000, 0b1111],
    'M': [0b1001, 0b1111, 0b1001, 0b1001, 0b1001, 0b1001],
    'N': [0b1001, 0b1101, 0b1011, 0b1001, 0b1001, 0b1001],
    'O': [0b0110, 0b1001, 0b1001, 0b1001, 0b1001, 0b0110],
    'P': [0b1110, 0b1001, 0b1001, 0b1110, 0b1000, 0b1000],
    'Q': [0b0110, 0b1001, 0b1001, 0b1001, 0b0110, 0b0001],
    'R': [0b1110, 0b1001, 0b1001, 0b1110, 0b1010, 0b1001],
    'S': [0b0111, 0b1000, 0b0110, 0b0001, 0b1001, 0b0110],
    'T': [0b1110, 0b0100, 0b0100, 0b0100, 0b0100, 0b0100],
    'U': [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b0110],
    'V': [0b1001, 0b1001, 0b1001, 0b1001, 0b0110, 0b0100],
    'W': [0b1001, 0b1001, 0b1001, 0b1111, 0b1111, 0b0110],
    'X': [0b1001, 0b1001, 0b0110, 0b0110, 0b1001, 0b1001],
    'Y': [0b1001, 0b1001, 0b0110, 0b0100, 0b0100, 0b0100],
    'Z': [0b1111, 0b0001, 0b0010, 0b0100, 0b1000, 0b1111],
    ' ': [0b0000, 0b0000, 0b0000, 0b0000, 0b0000, 0b0000],
    '·': [0b0000, 0b0000, 0b0110, 0b0110, 0b0000, 0b0000],
    '.': [0b0000, 0b0000, 0b0000, 0b0000, 0b0110, 0b0110],
    '-': [0b0000, 0b0000, 0b1111, 0b1111, 0b0000, 0b0000]
  };

  private static renderPixelText3x5(ctx: CanvasRenderingContext2D, text: string, startX: number, startY: number, color: string, tracking = 1) {
    let cx = startX;
    ctx.fillStyle = color;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const bitmap = this.PIXEL_FONT_3X5[ch] || this.PIXEL_FONT_3X5[' '];
      for (let r = 0; r < 5; r++) {
        const rowVal = bitmap[r];
        for (let c = 0; c < 3; c++) {
          if ((rowVal >> (2 - c)) & 1) {
            ctx.fillRect(cx + c, startY + r, 1, 1);
          }
        }
      }
      cx += 3 + tracking;
    }
  }

  private static renderPixelText4x6(ctx: CanvasRenderingContext2D, text: string, startX: number, startY: number, color: string, tracking = 2) {
    let cx = startX;
    ctx.fillStyle = color;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const bitmap = this.PIXEL_FONT_4X6[ch] || this.PIXEL_FONT_4X6[' '];
      for (let r = 0; r < 6; r++) {
        const rowVal = bitmap[r];
        for (let c = 0; c < 4; c++) {
          if ((rowVal >> (3 - c)) & 1) {
            ctx.fillRect(cx + c, startY + r, 1, 1);
          }
        }
      }
      cx += 4 + tracking;
    }
  }

  private static renderMarqueePixelText(
    ctx: CanvasRenderingContext2D,
    text: string,
    startX: number,
    startY: number,
    faceColor = '#ffffff',
    shadowColor = '#68130a'
  ) {
    // Drop shadow pass (crisp 1px down)
    let cx = startX;
    ctx.fillStyle = shadowColor;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const bitmap = this.PIXEL_FONT_5X7_BOLD[ch] || this.PIXEL_FONT_5X7_BOLD[' '];
      for (let r = 0; r < 7; r++) {
        const rowVal = bitmap[r];
        for (let c = 0; c < 5; c++) {
          if ((rowVal >> (4 - c)) & 1) {
            ctx.fillRect(cx + c, startY + r + 1, 1, 1);
          }
        }
      }
      cx += 5 + (ch === ' ' ? 2 : 2);
    }

    // Crisp white face pass
    cx = startX;
    ctx.fillStyle = faceColor;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const bitmap = this.PIXEL_FONT_5X7_BOLD[ch] || this.PIXEL_FONT_5X7_BOLD[' '];
      for (let r = 0; r < 7; r++) {
        const rowVal = bitmap[r];
        for (let c = 0; c < 5; c++) {
          if ((rowVal >> (4 - c)) & 1) {
            ctx.fillRect(cx + c, startY + r, 1, 1);
          }
        }
      }
      cx += 5 + (ch === ' ' ? 2 : 2);
    }
  }

  private static readonly PIXEL_FONT_6X9_BOLD: Record<string, number[]> = {
    'A': [0b0011100, 0b0110110, 0b1100011, 0b1100011, 0b1111111, 0b1111111, 0b1100011, 0b1100011, 0b1100011],
    'B': [0b1111110, 0b1100011, 0b1100011, 0b1111110, 0b1111110, 0b1100011, 0b1100011, 0b1111110, 0b0000000],
    'C': [0b0111110, 0b1100011, 0b1100000, 0b1100000, 0b1100000, 0b1100000, 0b1100011, 0b0111110, 0b0000000],
    'D': [0b1111100, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1111100, 0b0000000],
    'E': [0b1111111, 0b1100000, 0b1100000, 0b1111110, 0b1111110, 0b1100000, 0b1100000, 0b1111111, 0b0000000],
    'F': [0b1111111, 0b1100000, 0b1100000, 0b1111110, 0b1111110, 0b1100000, 0b1100000, 0b1100000, 0b0000000],
    'G': [0b0111110, 0b1100011, 0b1100000, 0b1101111, 0b1100011, 0b1100011, 0b1100011, 0b0111110, 0b0000000],
    'H': [0b1100011, 0b1100011, 0b1100011, 0b1111111, 0b1111111, 0b1100011, 0b1100011, 0b1100011, 0b1100011],
    'I': [0b1111110, 0b0011000, 0b0011000, 0b0011000, 0b0011000, 0b0011000, 0b0011000, 0b1111110, 0b0000000],
    'L': [0b1100000, 0b1100000, 0b1100000, 0b1100000, 0b1100000, 0b1100000, 0b1100000, 0b1111111, 0b0000000],
    'M': [0b1100011, 0b1110111, 0b1111111, 0b1101011, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1100011],
    'N': [0b1100011, 0b1110011, 0b1111011, 0b1101111, 0b1100111, 0b1100011, 0b1100011, 0b1100011, 0b1100011],
    'O': [0b0111110, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b0111110, 0b0000000],
    'P': [0b1111110, 0b1100011, 0b1100011, 0b1111110, 0b1100000, 0b1100000, 0b1100000, 0b1100000, 0b0000000],
    'R': [0b1111110, 0b1100011, 0b1100011, 0b1111110, 0b1111000, 0b1101100, 0b1100110, 0b1100011, 0b1100011],
    'S': [0b0111110, 0b1100011, 0b1100000, 0b0111110, 0b0000011, 0b0000011, 0b1100011, 0b0111110, 0b0000000],
    'T': [0b1111111, 0b1111111, 0b0001100, 0b0001100, 0b0001100, 0b0001100, 0b0001100, 0b0001100, 0b0001100],
    'U': [0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b0111110, 0b0000000],
    'V': [0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b0110110, 0b0110110, 0b0011100, 0b0011100, 0b0001000],
    'W': [0b1100011, 0b1100011, 0b1100011, 0b1100011, 0b1101011, 0b1111111, 0b1110111, 0b1100011, 0b0000000],
    'Y': [0b1100011, 0b1100011, 0b0110110, 0b0011100, 0b0001100, 0b0001100, 0b0001100, 0b0001100, 0b0001100],
    ' ': [0, 0, 0, 0, 0, 0, 0, 0, 0]
  };

  /**
   * Unified Marquee Bold 6x9 Pixel Font Renderer
   * Standardizes marquee signboard letter height across all landmark buildings!
   */
  private static renderUnifiedMarqueeText(
    ctx: CanvasRenderingContext2D,
    text: string,
    startX: number,
    startY: number,
    faceColor = '#ffffff',
    shadowColor = '#083344',
    tracking = 1
  ) {
    // Drop shadow pass (crisp 1px offset)
    let cx = startX;
    ctx.fillStyle = shadowColor;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const bitmap = this.PIXEL_FONT_6X9_BOLD[ch] || this.PIXEL_FONT_6X9_BOLD[' '];
      for (let r = 0; r < 9; r++) {
        const rowVal = bitmap[r];
        for (let c = 0; c < 7; c++) {
          if ((rowVal >> (6 - c)) & 1) {
            ctx.fillRect(cx + c, startY + r + 1, 1, 1);
          }
        }
      }
      cx += 7 + (ch === ' ' ? 2 : tracking);
    }

    // Face pass
    cx = startX;
    ctx.fillStyle = faceColor;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const bitmap = this.PIXEL_FONT_6X9_BOLD[ch] || this.PIXEL_FONT_6X9_BOLD[' '];
      for (let r = 0; r < 9; r++) {
        const rowVal = bitmap[r];
        for (let c = 0; c < 7; c++) {
          if ((rowVal >> (6 - c)) & 1) {
            ctx.fillRect(cx + c, startY + r, 1, 1);
          }
        }
      }
      cx += 7 + (ch === ' ' ? 2 : tracking);
    }
  }

  private static renderStudioMarqueeText(
    ctx: CanvasRenderingContext2D,
    text: string,
    startX: number,
    startY: number,
    faceColor = '#ffffff',
    shadowColor = '#083344',
    tracking = 2
  ) {
    this.renderUnifiedMarqueeText(ctx, text, startX, startY, faceColor, shadowColor, tracking);
  }

  private static readonly PIXEL_FONT_EXP: Record<string, number[]> = {
    'E': [
      0b1111111111,
      0b1111111111,
      0b1111000000,
      0b1111000000,
      0b1111000000,
      0b1111111100,
      0b1111111100,
      0b1111000000,
      0b1111000000,
      0b1111000000,
      0b1111000000,
      0b1111111111,
      0b1111111111,
      0b0000000000
    ],
    'X': [
      0b1111000111,
      0b1111001111,
      0b0111101110,
      0b0011111100,
      0b0001111000,
      0b0000110000,
      0b0000110000,
      0b0001111000,
      0b0011111100,
      0b0111101110,
      0b1111001111,
      0b1111000111,
      0b1110000011,
      0b0000000000
    ],
    'P': [
      0b1111111110,
      0b1111111111,
      0b1111000111,
      0b1111000111,
      0b1111000111,
      0b1111000111,
      0b1111111111,
      0b1111111110,
      0b1111000000,
      0b1111000000,
      0b1111000000,
      0b1111000000,
      0b1111000000,
      0b0000000000
    ],
    '.': [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111000000,
      0b1111000000,
      0b1111000000,
      0b1111000000,
      0b0000000000
    ]
  };

  private static renderLargeBoldExp(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    colFace = '#0284c7',
    colShadow = '#075985'
  ) {
    // Drop shadow pass
    let cx = startX;
    for (const ch of ['E', 'X', 'P', '.']) {
      const bmp = this.PIXEL_FONT_EXP[ch];
      const wCh = ch === '.' ? 5 : 10;
      ctx.fillStyle = colShadow;
      for (let r = 0; r < 14; r++) {
        const rowVal = bmp[r];
        for (let c = 0; c < wCh; c++) {
          if ((rowVal >> (9 - c)) & 1) {
            ctx.fillRect(cx + c, startY + r + 1, 1, 1);
          }
        }
      }
      cx += wCh + 2;
    }

    // Face pass
    cx = startX;
    for (const ch of ['E', 'X', 'P', '.']) {
      const bmp = this.PIXEL_FONT_EXP[ch];
      const wCh = ch === '.' ? 5 : 10;
      ctx.fillStyle = colFace;
      for (let r = 0; r < 14; r++) {
        const rowVal = bmp[r];
        for (let c = 0; c < wCh; c++) {
          if ((rowVal >> (9 - c)) & 1) {
            ctx.fillRect(cx + c, startY + r, 1, 1);
          }
        }
      }
      cx += wCh + 2;
    }
  }

  private static readonly PIXEL_FONT_ARCADE: Record<string, number[]> = {
    'A': [
      0b00011000,
      0b00111100,
      0b01111110,
      0b11000011,
      0b11000011,
      0b11000011,
      0b11111111,
      0b11111111,
      0b11000011,
      0b11000011,
      0b11000011
    ],
    'R': [
      0b11111100,
      0b11111110,
      0b11000111,
      0b11000011,
      0b11111110,
      0b11111100,
      0b11011100,
      0b11001110,
      0b11000111,
      0b11000011,
      0b11000011
    ],
    'C': [
      0b00111110,
      0b01111111,
      0b11110000,
      0b11000000,
      0b11000000,
      0b11000000,
      0b11000000,
      0b11000000,
      0b11110000,
      0b01111111,
      0b00111110
    ],
    'D': [
      0b11111100,
      0b11111110,
      0b11000111,
      0b11000011,
      0b11000011,
      0b11000011,
      0b11000011,
      0b11000011,
      0b11000111,
      0b11111110,
      0b11111100
    ],
    'E': [
      0b11111111,
      0b11111111,
      0b11000000,
      0b11000000,
      0b11111110,
      0b11111110,
      0b11000000,
      0b11000000,
      0b11000000,
      0b11111111,
      0b11111111
    ]
  };

  private static renderArcadeMarqueeText(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number
  ) {
    const word = ['A', 'R', 'C', 'A', 'D', 'E'];

    // Outer orange neon aura (1px offset)
    for (const dy of [-1, 0, 1]) {
      for (const dx of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        let cx = startX + dx;
        ctx.fillStyle = '#991b1b';
        for (const ch of word) {
          const bmp = this.PIXEL_FONT_ARCADE[ch];
          for (let r = 0; r < 11; r++) {
            const rowVal = bmp[r];
            for (let c = 0; c < 8; c++) {
              if ((rowVal >> (7 - c)) & 1) {
                ctx.fillRect(cx + c, startY + r + dy, 1, 1);
              }
            }
          }
          cx += 8 + 3;
        }
      }
    }

    // Warm neon gold/yellow face pass
    let cx = startX;
    for (const ch of word) {
      const bmp = this.PIXEL_FONT_ARCADE[ch];
      for (let r = 0; r < 11; r++) {
        const rowVal = bmp[r];
        for (let c = 0; c < 8; c++) {
          if ((rowVal >> (7 - c)) & 1) {
            ctx.fillStyle = (r === 0 || c === 0) ? '#ffffff' : (r < 5 ? '#fef08a' : '#fde047');
            ctx.fillRect(cx + c, startY + r, 1, 1);
          }
        }
      }
      cx += 8 + 3;
    }
  }

  private static drawProceduralBush(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
    const cShade = '#0f2a1d';
    const cDark = '#1b4332';
    const cMid = '#52a64c';
    const cLight = '#72be55';
    const cHi = '#9bd768';
    const cLeaf = '#bbf287';

    for (let y = cy - ry; y <= cy + ry; y++) {
      for (let x = cx - rx; x <= cx + rx; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const d2 = dx * dx + dy * dy;
        const noise = (Math.sin(x * 7 + y * 13) + Math.cos(x * 11 - y * 5)) * 0.08;
        if (d2 + noise <= 1.0) {
          const lightVal = -dx * 0.4 - dy * 0.7;
          let col = cMid;
          if (lightVal > 0.5) col = lightVal > 0.75 ? cLeaf : cHi;
          else if (lightVal > 0.1) col = cLight;
          else if (lightVal > -0.3) col = cMid;
          else if (lightVal > -0.6) col = cDark;
          else col = cShade;

          ctx.fillStyle = col;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  /**
   * Procedural Pixel Art Drawing for MARC CINEMA (Hero Building - V7 Grand Scale)
   * Pure Canvas 2D programmatic rendering with grand 260x165 proportions matching reference art 1:1:
   * 1. 1:1 Square monumental entrance double doors (52x50px)
   * 2. Grand glowing marquee lightbox spanning 90% of the central facade (156x28px)
   * 3. Bold, chunky "MARC CINEMA" coral red box (120x18px)
   * 4. 4 Large movie poster vitrines (each 20x32px) with distinct mini artwork and NO glare lines
   * 5. Rooftop penthouse village with balustrade, chimneys, potted plants, and lush forest trees
   * 6. Right stone annex wall with vertical typography "FILM / IDEAS / PEOPLE / YOU"
   * 7. Left complete tree with natural wooden trunk, branches, deep canopy, and "P" parking signpost
   * 8. Unified Marine Cobalt Blue palette across all blue architectural trim
   */
  private static drawMarcCinema(ctx: CanvasRenderingContext2D) {
    const cBlueHi = '#5eb6ed';
    const cBlueMain = '#2679bd';
    const cBlueDark = '#18598a';
    const cBlueDeep = '#0f3a5e';

    const cWallWhite = '#fafbfd';
    const cWallLight = '#f0f5fa';
    const cWallSoft = '#e1ebf4';

    const cStoneHi = '#e8e0d0';
    const cStoneMain = '#ded4c2';
    const cStoneShadow = '#c7baa3';
    const cStoneDark = '#a89b84';

    const cRedRim = '#ff7e6e';
    const cRedHi = '#f05241';
    const cRedMain = '#d63a2a';
    const cRedDark = '#9e2215';
    const cRedShadow = '#68130a';

    const cBarkDark = '#382415';
    const cBarkMain = '#543720';
    const cBarkHi = '#704b2c';

    // 1. Background Trees behind rooftops (Symmetrical canopy around central axis X = 120)
    const backTrees = [
      { x: 120, y: 8, rx: 22, ry: 20 },
      { x: 92, y: 12, rx: 20, ry: 19 },
      { x: 148, y: 12, rx: 20, ry: 19 },
      { x: 66, y: 18, rx: 19, ry: 18 },
      { x: 174, y: 18, rx: 19, ry: 18 },
      { x: 44, y: 26, rx: 17, ry: 17 },
      { x: 196, y: 26, rx: 17, ry: 17 },
      { x: 224, y: 34, rx: 18, ry: 19 },
      { x: 246, y: 46, rx: 16, ry: 18 }
    ];
    for (const t of backTrees) {
      this.drawProceduralBush(ctx, t.x, t.y, t.rx, t.ry);
    }

    // 2. Rooftop Village & Terrace (100% Symmetrical around central axis X = 120)
    // A. Left Wing Cottage: X = 54..92 (Width = 38, offset 28..66 from center)
    this.drawPixelRect(ctx, 54, 28, 38, 19, cWallLight);
    for (let i = 0; i < 9; i++) {
      const col = i % 2 === 0 ? '#e86646' : '#c94d30';
      this.drawPixelLine(ctx, 52 + i, 27 - i, 92 - i, 27 - i, col);
    }
    this.drawPixelLine(ctx, 52, 27, 92, 27, '#7a2712');
    // Left Wing Window with blue shutters & flower box (Centered at X = 73)
    this.drawPixelRect(ctx, 68, 30, 10, 11, cBlueMain);
    this.drawPixelRect(ctx, 70, 31, 6, 8, '#0a1622');
    this.drawPixelRect(ctx, 67, 39, 12, 3, '#c2410c');
    this.drawPixelLine(ctx, 67, 38, 78, 38, '#ea580c');
    this.drawPixelRect(ctx, 68, 37, 10, 3, '#059669');
    this.drawPixelRect(ctx, 69, 36, 8, 2, '#10b981');
    this.drawPixelLine(ctx, 69, 40, 69, 44, '#047857');
    this.drawPixelLine(ctx, 72, 40, 72, 45, '#059669');
    this.drawPixelLine(ctx, 75, 40, 75, 43, '#10b981');
    this.drawPixelRect(ctx, 71, 37, 2, 2, '#fb7185');

    // B. Center Tall Penthouse: X = 94..146 (Width = 52, centered at X = 120), Y = 22..46
    this.drawPixelRect(ctx, 94, 22, 53, 25, cWallWhite);
    for (let i = 0; i < 12; i++) {
      const col = i % 2 === 0 ? '#e86646' : '#c94d30';
      this.drawPixelLine(ctx, 92 + i, 21 - i, 148 - i, 21 - i, col);
    }
    this.drawPixelLine(ctx, 92, 21, 148, 21, '#7a2712');

    // Center 3 Windows: exactly centered at X = 120, flankers at 106 and 134
    for (const wx of [106, 120, 134]) {
      this.drawPixelRect(ctx, wx - 3, 26, 11, 13, cBlueMain);
      this.drawPixelRect(ctx, wx, 28, 5, 9, '#0a1622');

      // Terracotta window box planter under sill
      this.drawPixelRect(ctx, wx - 4, 38, 13, 3, '#c2410c');
      this.drawPixelLine(ctx, wx - 4, 37, wx + 8, 37, '#ea580c');

      // Overflowing lush greenery draping over window sills
      this.drawPixelRect(ctx, wx - 3, 36, 11, 3, '#059669');
      this.drawPixelRect(ctx, wx - 2, 35, 9, 2, '#10b981');
      this.drawPixelRect(ctx, wx - 1, 34, 7, 1, '#34d399');

      // Cascading trailing vines spilling downwards past sill
      this.drawPixelLine(ctx, wx - 2, 39, wx - 2, 44, '#047857');
      this.drawPixelLine(ctx, wx + 1, 39, wx + 1, 45, '#059669');
      this.drawPixelLine(ctx, wx + 4, 39, wx + 4, 43, '#10b981');
      this.drawPixelLine(ctx, wx + 6, 39, wx + 6, 44, '#047857');

      // Dainty flower dots in window boxes
      this.drawPixelRect(ctx, wx - 1, 36, 2, 2, '#fb7185');
      this.drawPixelRect(ctx, wx + 3, 37, 2, 2, '#ffffff');
    }

    // C. Right Wing Cottage: X = 148..186 (Width = 38, exact mirror of Left Wing!), Y = 28..46
    this.drawPixelRect(ctx, 148, 28, 38, 19, cWallLight);
    for (let i = 0; i < 9; i++) {
      const col = i % 2 === 0 ? '#e86646' : '#c94d30';
      this.drawPixelLine(ctx, 148 + i, 27 - i, 188 - i, 27 - i, col);
    }
    this.drawPixelLine(ctx, 148, 27, 188, 27, '#7a2712');
    // Right Wing Window with blue shutters & flower box (Centered at X = 167, mirror of left X = 73)
    this.drawPixelRect(ctx, 162, 30, 10, 11, cBlueMain);
    this.drawPixelRect(ctx, 164, 31, 6, 8, '#0a1622');
    this.drawPixelRect(ctx, 161, 39, 12, 3, '#c2410c');
    this.drawPixelLine(ctx, 161, 38, 172, 38, '#ea580c');
    this.drawPixelRect(ctx, 162, 37, 10, 3, '#059669');
    this.drawPixelRect(ctx, 163, 36, 8, 2, '#10b981');
    this.drawPixelLine(ctx, 164, 40, 164, 43, '#10b981');
    this.drawPixelLine(ctx, 167, 40, 167, 45, '#059669');
    this.drawPixelLine(ctx, 170, 40, 170, 44, '#047857');
    this.drawPixelRect(ctx, 166, 37, 2, 2, '#fb7185');

    // D. Symmetrical Balustrade Railing across terrace: X = 48..192 (Centered at X = 120), Y = 40..46
    this.drawPixelLine(ctx, 48, 40, 192, 40, '#1e293b');
    this.drawPixelLine(ctx, 48, 45, 192, 45, '#1e293b');
    for (let rx = 48; rx <= 192; rx += 4) {
      this.drawPixelLine(ctx, rx, 40, rx, 45, '#1e293b');
    }
    // Planters on terrace symmetrically placed around X = 120
    for (const bx of [56, 84, 156, 184]) {
      this.drawPixelRect(ctx, bx - 6, 41, 13, 4, '#c2410c');
      this.drawPixelRect(ctx, bx - 5, 39, 11, 3, '#059669');
      this.drawPixelLine(ctx, bx - 4, 38, bx + 4, 38, '#10b981');
      this.drawPixelLine(ctx, bx - 3, 44, bx - 3, 48, '#047857');
      this.drawPixelLine(ctx, bx, 44, bx, 49, '#059669');
      this.drawPixelLine(ctx, bx + 3, 44, bx + 3, 47, '#10b981');
      this.drawPixelRect(ctx, bx - 1, 39, 2, 2, '#fb7185');
      this.drawPixelRect(ctx, bx + 2, 40, 2, 2, '#fef08a');
    }

    // 3. Main Cinema Building Body: X = 35..205, Y = 46..150
    this.drawPixelRect(ctx, 35, 46, 171, 105, cWallLight);
    for (let tx = 36; tx < 204; tx += 4) {
      for (let ty = 48; ty < 148; ty += 4) {
        if ((tx + ty * 3) % 4 === 0) {
          ctx.fillStyle = cWallWhite;
          ctx.fillRect(tx, ty, 1, 1);
        } else if ((tx * 2 + ty) % 6 === 0) {
          ctx.fillStyle = cWallSoft;
          ctx.fillRect(tx, ty, 1, 1);
        }
      }
    }

    // Top Cornice
    this.drawPixelRect(ctx, 33, 46, 175, 4, cStoneHi);
    this.drawPixelLine(ctx, 33, 50, 207, 50, cStoneShadow);

    // Corner Quoins (Warm Stone)
    for (let qy = 52; qy < 146; qy += 11) {
      const qwL = Math.floor(qy / 11) % 2 === 0 ? 9 : 6;
      this.drawPixelRect(ctx, 35, qy, qwL + 1, 10, cStoneMain);
      this.drawPixelLine(ctx, 35, qy, 35 + qwL, qy, cStoneHi);
      this.drawPixelLine(ctx, 35 + qwL, qy, 35 + qwL, qy + 9, cStoneDark);
      this.drawPixelLine(ctx, 35, qy + 9, 35 + qwL, qy + 9, cStoneShadow);

      const qwR = Math.floor(qy / 11) % 2 === 1 ? 9 : 6;
      this.drawPixelRect(ctx, 205 - qwR, qy, qwR + 1, 10, cStoneMain);
      this.drawPixelLine(ctx, 205 - qwR, qy, 205, qy, cStoneHi);
      this.drawPixelLine(ctx, 205 - qwR, qy, 205 - qwR, qy + 9, cStoneDark);
      this.drawPixelLine(ctx, 205 - qwR, qy + 9, 205, qy + 9, cStoneShadow);
    }

    // Lower Dado Wainscot in VIBRANT MEDITERRANEAN AZURE BLUE (Y = 138..150)
    this.drawPixelRect(ctx, 35, 138, 171, 13, cBlueMain);
    this.drawPixelLine(ctx, 35, 137, 205, 137, cBlueDark);
    this.drawPixelLine(ctx, 35, 138, 205, 138, cBlueHi);
    this.drawPixelLine(ctx, 35, 149, 205, 149, cBlueDeep);
    for (let px = 55; px < 205; px += 24) {
      if (px < 95 || px > 145) {
        this.drawPixelLine(ctx, px, 139, px, 148, cBlueDark);
      }
    }

    // 4. Right Annex Wall: X = 205..252, Y = 70..150
    this.drawPixelRect(ctx, 205, 72, 48, 79, cWallSoft);
    for (let sy = 72; sy <= 150; sy++) {
      for (let sx = 205; sx <= 213; sx++) {
        const alphaT = (213 - sx) / 8.0;
        ctx.fillStyle = `rgba(160, 150, 135, ${alphaT * 0.8})`;
        ctx.fillRect(sx, sy, 1, 1);
      }
    }
    this.drawPixelRect(ctx, 203, 69, 52, 4, cStoneHi);
    this.drawPixelLine(ctx, 203, 73, 254, 73, cStoneDark);
    for (let my = 85; my < 145; my += 14) {
      this.drawPixelLine(ctx, 213, my, 252, my, cStoneShadow);
    }

    // Annex bushes
    // Annex bushes with delicate wildflower blossoms
    const annexBushes = [
      { bx: 214, by: 140, rx: 12, ry: 12 },
      { bx: 228, by: 136, rx: 14, ry: 14 },
      { bx: 242, by: 138, rx: 13, ry: 13 }
    ];
    for (const b of annexBushes) {
      this.drawProceduralBush(ctx, b.bx, b.by, b.rx, b.ry);
    }
    const flowers = [
      { fx: 216, fy: 142, col: '#f43f5e' },
      { fx: 222, fy: 145, col: '#fbbf24' },
      { fx: 230, fy: 138, col: '#f43f5e' },
      { fx: 236, fy: 144, col: '#fb7185' },
      { fx: 245, fy: 140, col: '#fef08a' },
      { fx: 249, fy: 145, col: '#ffffff' }
    ];
    for (const fl of flowers) {
      this.drawPixelRect(ctx, fl.fx, fl.fy, 2, 2, fl.col);
    }

    // 5. Marquee Structure (GRAND, BOLD, PROMINENT!)
    // Top trim over red box: X = 58..182, Y = 47..50
    this.drawPixelRect(ctx, 58, 47, 125, 4, cBlueHi);
    this.drawPixelLine(ctx, 58, 50, 182, 50, cBlueDark);

    // A. Vibrant Coral Red Sign Box: X = 60..180 (w=120), Y = 50..68 (h=18)
    this.drawPixelRect(ctx, 60, 50, 121, 19, cBlueDeep);
    this.drawPixelRect(ctx, 61, 51, 119, 17, cRedMain);
    this.drawPixelLine(ctx, 61, 51, 179, 51, cRedRim);
    this.drawPixelLine(ctx, 61, 52, 61, 66, cRedHi);
    this.drawPixelLine(ctx, 62, 67, 179, 67, cRedShadow);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(58, 68, 125, 3);

    // B. Lower White Lightbox: X = 42..198 (w=156), Y = 70..98 (h=28)
    this.drawPixelRect(ctx, 42, 70, 157, 29, cBlueMain);
    this.drawPixelLine(ctx, 42, 70, 198, 70, cBlueHi);
    this.drawPixelLine(ctx, 42, 71, 42, 97, cBlueHi);
    this.drawPixelLine(ctx, 198, 71, 198, 97, cBlueDark);
    this.drawPixelLine(ctx, 42, 98, 198, 98, cBlueDeep);

    // Lightbox Milk Glass Face
    this.drawPixelRect(ctx, 45, 72, 151, 25, '#fcfdfe');
    // Soft subdued track lines
    this.drawPixelLine(ctx, 47, 81, 193, 81, '#d0dce7');
    this.drawPixelLine(ctx, 47, 91, 193, 91, '#d0dce7');

    // Depth Shadow under Marquee cast onto wall (Y = 98..106)
    for (let sy = 98; sy <= 106; sy++) {
      const alpha = 0.55 * (1.0 - (sy - 98) / 8.0);
      ctx.fillStyle = `rgba(20, 35, 55, ${alpha})`;
      ctx.fillRect(35, sy, 171, 1);
    }

    // 6. ENTRANCE DOUBLE DOORS (GRAND SQUARE 1:1 ENTRANCE, Y = 98..150, h=52!)
    // Recessed Niche: X = 95..145 (w=50), Y = 98..150 (h=52)
    this.drawPixelRect(ctx, 95, 98, 51, 53, '#0b1320');
    for (let dy = 98; dy <= 103; dy++) {
      this.drawPixelLine(ctx, 95, dy, 145, dy, '#060b13');
    }
    this.drawPixelRect(ctx, 95, 98, 4, 53, '#060b13');

    // Transom Header: Y = 100..109
    this.drawPixelRect(ctx, 98, 100, 45, 10, cBlueDeep);
    this.drawPixelRect(ctx, 99, 101, 43, 8, cBlueDark);

    // Double Door Leaves: X = 99..119 and 121..141 (each w=20, h=40, reaching ground 150!)
    for (const door of [{ dx: 99, dw: 20 }, { dx: 121, dw: 20 }]) {
      this.drawPixelRect(ctx, door.dx, 110, door.dw + 1, 41, cBlueDark);
      // Upper tall glass pane (clean, solid dark architectural glass, NO glare lines!)
      this.drawPixelRect(ctx, door.dx + 2, 112, door.dw - 3, 20, '#0a1622');
      // Lower square pane (clean, NO glare lines!)
      this.drawPixelRect(ctx, door.dx + 2, 135, door.dw - 3, 12, '#0a1622');
      this.drawPixelLine(ctx, door.dx + 2, 133, door.dx + door.dw - 2, 133, cBlueDeep);
    }

    // Brass Handles & Kickplates (PRESERVED: crisp brass handles and kickplates)
    this.drawPixelRect(ctx, 118, 124, 2, 11, '#fbbf24');
    this.drawPixelRect(ctx, 122, 124, 2, 11, '#fbbf24');
    this.drawPixelRect(ctx, 99, 147, 21, 4, '#d97706');
    this.drawPixelRect(ctx, 121, 147, 21, 4, '#d97706');

    // 7. Mounted Poster Lightboxes (TALL & LARGE, Y = 104..138, h=34!)
    const posters = [
      { px: 46, py: 104, pw: 20, ph: 32, idx: 0 },
      { px: 70, py: 104, pw: 20, ph: 32, idx: 1 },
      { px: 150, py: 104, pw: 20, ph: 32, idx: 2 },
      { px: 174, py: 104, pw: 20, ph: 32, idx: 3 }
    ];
    for (const p of posters) {
      ctx.fillStyle = 'rgba(20, 35, 55, 0.4)';
      ctx.fillRect(p.px + 1, p.py + 1, p.pw, p.ph);
      this.drawPixelRect(ctx, p.px, p.py, p.pw + 1, p.ph + 1, cBlueDark);
      this.drawPixelRect(ctx, p.px + 1, p.py + 1, p.pw - 1, p.ph - 1, '#ffffff');
      this.drawPixelRect(ctx, p.px + 2, p.py + 2, p.pw - 3, p.ph - 3, '#0b1120');

      if (p.idx === 0) {
        this.drawPixelRect(ctx, p.px + 2, p.py + 2, p.pw - 3, p.ph - 3, '#1e1b4b');
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.px + 10, p.py + 11, 4, 0, Math.PI * 2);
        ctx.fill();
        this.drawPixelLine(ctx, p.px + 3, p.py + 12, p.px + 17, p.py + 9, '#38bdf8');
      } else if (p.idx === 1) {
        for (let row = 0; row < p.ph - 4; row++) {
          const t = row / (p.ph - 4);
          const r = Math.floor(225 * (1 - t) + 251 * t);
          const g = Math.floor(29 * (1 - t) + 146 * t);
          const b = Math.floor(72 * (1 - t) + 60 * t);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(p.px + 2, p.py + 2 + row, p.pw - 3, 1);
        }
        this.drawPixelRect(ctx, p.px + 6, p.py + 16, 4, 13, '#18181b');
        this.drawPixelRect(ctx, p.px + 11, p.py + 18, 4, 11, '#18181b');
      } else if (p.idx === 2) {
        this.drawPixelRect(ctx, p.px + 2, p.py + 2, p.pw - 3, p.ph - 3, '#030712');
        this.drawPixelRect(ctx, p.px + 4, p.py + 10, 6, 19, cBlueDark);
        this.drawPixelRect(ctx, p.px + 11, p.py + 6, 7, 23, cBlueMain);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(p.px + 7, p.py + 14, 1, 1);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(p.px + 14, p.py + 11, 1, 1);
      } else if (p.idx === 3) {
        for (let row = 0; row < 14; row++) {
          ctx.fillStyle = '#ffedd5';
          ctx.fillRect(p.px + 2, p.py + 2 + row, p.pw - 3, 1);
        }
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(p.px + 11, p.py + 7, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.moveTo(p.px + 4, p.py + 28);
        ctx.lineTo(p.px + 10, p.py + 13);
        ctx.lineTo(p.px + 16, p.py + 28);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Bench & Planter under left posters
    this.drawPixelRect(ctx, 46, 142, 25, 3, '#b45309');
    this.drawPixelRect(ctx, 48, 144, 3, 7, '#334155');
    this.drawPixelRect(ctx, 66, 144, 3, 7, '#334155');
    this.drawPixelRect(ctx, 75, 144, 9, 7, '#c2410c');
    this.drawProceduralBush(ctx, 79, 140, 6, 6);

    // Potted Plants along Right Half of Building (Under right posters, corner, and annex)
    // Pot 1: Terracotta planter with flower under right posters (X = 160)
    this.drawPixelRect(ctx, 159, 143, 11, 7, '#c2410c');
    this.drawPixelRect(ctx, 158, 142, 13, 2, '#ea580c');
    this.drawPixelRect(ctx, 160, 143, 9, 1, '#451a03');
    this.drawProceduralBush(ctx, 164, 138, 6, 6);
    this.drawPixelRect(ctx, 163, 136, 2, 2, '#f43f5e');

    // Pot 2: Round clipped shrub urn at building corner transition (X = 197)
    this.drawPixelRect(ctx, 196, 142, 11, 8, '#c2410c');
    this.drawPixelRect(ctx, 195, 141, 13, 2, '#ea580c');
    this.drawPixelRect(ctx, 197, 149, 9, 1, '#9a3412');
    this.drawProceduralBush(ctx, 201, 134, 7, 7);
    this.drawPixelRect(ctx, 200, 132, 2, 2, '#fbbf24');
    this.drawPixelRect(ctx, 203, 135, 1, 1, '#ffffff');

    // Pot 3: Coastal ceramic planter in front of right annex wall (X = 221)
    this.drawPixelRect(ctx, 221, 143, 11, 7, '#2679bd');
    this.drawPixelRect(ctx, 220, 142, 13, 2, '#5eb6ed');
    this.drawPixelRect(ctx, 222, 143, 9, 1, '#451a03');
    this.drawProceduralBush(ctx, 226, 137, 6, 6);
    this.drawPixelRect(ctx, 225, 135, 2, 2, '#fb7185');
    this.drawPixelRect(ctx, 228, 138, 2, 2, '#ffffff');

    // 8. Left Complete Tree with Trunk: X = 4..38, Y = 20..150
    // Root flare
    ctx.fillStyle = cBarkDark;
    ctx.beginPath();
    ctx.moveTo(18, 150); ctx.lineTo(28, 150); ctx.lineTo(26, 140); ctx.lineTo(20, 140);
    ctx.closePath();
    ctx.fill();
    // Main Trunk
    for (let ty = 75; ty < 146; ty++) {
      const tW = ty < 110 ? 5 : 6;
      this.drawPixelRect(ctx, 21, ty, tW, 1, cBarkMain);
      ctx.fillStyle = cBarkDark;
      ctx.fillRect(21, ty, 1, 1);
      ctx.fillStyle = cBarkHi;
      ctx.fillRect(21 + tW - 1, ty, 1, 1);
    }
    // Branches
    this.drawPixelLine(ctx, 22, 85, 10, 65, cBarkMain);
    this.drawPixelLine(ctx, 23, 85, 11, 65, cBarkMain);
    this.drawPixelLine(ctx, 24, 80, 34, 62, cBarkMain);
    this.drawPixelLine(ctx, 25, 80, 35, 62, cBarkMain);
    this.drawPixelLine(ctx, 23, 72, 22, 52, cBarkMain);

    // Canopy
    const treeCanopy = [
      { cx: 12, cy: 60, rx: 16, ry: 18 },
      { cx: 24, cy: 46, rx: 18, ry: 19 },
      { cx: 36, cy: 55, rx: 16, ry: 18 },
      { cx: 18, cy: 34, rx: 17, ry: 18 },
      { cx: 30, cy: 28, rx: 18, ry: 18 },
      { cx: 22, cy: 18, rx: 16, ry: 16 }
    ];
    for (const c of treeCanopy) {
      this.drawProceduralBush(ctx, c.cx, c.cy, c.rx, c.ry);
    }


    // 10. Pixel Typography (Bold, crystal clear letterforms)
    this.renderUnifiedMarqueeText(ctx, 'MARC CINEMA', 76, 54, '#ffffff', '#68130a', 1);
    this.renderPixelText4x6(ctx, 'GOOD STORIES', 85, 75, '#0f172a', 2);
    this.renderPixelText4x6(ctx, 'BRIGHTER PEOPLE', 76, 86, '#0f172a', 2);

    this.renderPixelText4x6(ctx, 'FILM', 217, 78, '#2a374a', 2);
    this.renderPixelText4x6(ctx, 'IDEAS', 214, 88, '#2a374a', 2);
    this.renderPixelText4x6(ctx, 'PEOPLE', 211, 98, '#2a374a', 1);
    this.renderPixelText4x6(ctx, 'YOU', 220, 108, '#2a374a', 2);

    // Sidewalk Ground Contact Shadow: Y = 150..152
    this.drawPixelLine(ctx, 4, 150, 256, 150, 'rgba(148, 163, 184, 0.7)');
    this.drawPixelLine(ctx, 4, 151, 256, 151, 'rgba(203, 213, 225, 0.5)');
  }

  private static drawExperimentLab(ctx: CanvasRenderingContext2D) {
    // 0. Sub-sidewalk Foundation & Bedrock (below ground line Y = 150..165)
    this.drawPixelRect(ctx, 0, 150, 260, 15, '#1e293b');
    this.drawPixelRect(ctx, 0, 150, 260, 2, '#94a3b8');

    // 1. Left Palm Tree & Courtyard (X: 2..44)
    this.drawLushPalmTree(ctx, 24, 150);

    // Planters and terracotta flower pots at base of palm (X: 10..36, Y: 135..150)
    this.drawPixelRect(ctx, 12, 142, 16, 8, '#b45309');
    this.drawPixelRect(ctx, 11, 141, 18, 2, '#d97706');
    this.drawPixelRect(ctx, 13, 143, 14, 1, '#451a03');
    this.drawProceduralBush(ctx, 20, 137, 9, 6);
    this.drawPixelRect(ctx, 17, 136, 2, 2, '#f43f5e');
    this.drawPixelRect(ctx, 22, 138, 2, 2, '#fbbf24');
    this.drawPixelRect(ctx, 25, 135, 2, 2, '#ffffff');

    // 2. Left White Plaster Wall Block ("EXP." wall, X: 44..110, Y: 58..150)
    // Wall surface (warm architectural concrete plaster)
    this.drawPixelRect(ctx, 44, 58, 66, 92, '#f4f5f1');
    // Parapet coping stone trim on top of left wall (Y: 55..59)
    this.drawPixelRect(ctx, 42, 55, 70, 4, '#e2e5df');
    this.drawPixelLine(ctx, 42, 55, 111, 55, '#ffffff');
    this.drawPixelLine(ctx, 42, 58, 111, 58, '#cbd1c8');
    this.drawPixelRect(ctx, 44, 59, 66, 2, '#d8ded5');

    // Architectural panel joint grid lines (subtle joint seams #d0d7cf)
    this.drawPixelLine(ctx, 88, 61, 88, 149, '#d0d7cf');
    this.drawPixelLine(ctx, 44, 84, 110, 84, '#d0d7cf');
    this.drawPixelLine(ctx, 44, 118, 110, 118, '#d0d7cf');
    // Tie-hole anchor rivets at panel points
    const rivets = [
      [47, 63], [86, 63], [90, 63], [107, 63],
      [47, 82], [86, 82], [90, 82], [107, 82],
      [47, 86], [86, 86], [90, 86], [107, 86],
      [47, 116], [86, 116], [90, 116], [107, 116],
      [47, 120], [86, 120], [90, 120], [107, 120],
      [47, 146], [86, 146], [90, 146], [107, 146]
    ];
    for (const [rx, ry] of rivets) {
      this.drawPixelRect(ctx, rx, ry, 2, 2, '#94a3b8');
    }

    // 3. Bold Pixel Typography on Left Wall
    // EXP. (Large bold 10x14 headline in vibrant cerulean teal)
    this.renderLargeBoldExp(ctx, 51, 65, '#0284c7', '#075985');

    // PLAY / TEST / FAIL / LEARN / REPEAT (dark slate 4x6 pixel typography)
    const wordX = 54;
    this.renderPixelText4x6(ctx, 'PLAY', wordX, 88, '#1e293b', 2);
    this.renderPixelText4x6(ctx, 'TEST', wordX, 98, '#1e293b', 2);
    this.renderPixelText4x6(ctx, 'FAIL', wordX, 108, '#1e293b', 2);
    this.renderPixelText4x6(ctx, 'LEARN', wordX, 122, '#1e293b', 2);
    this.renderPixelText4x6(ctx, 'REPEAT', wordX, 133, '#1e293b', 2);

    // 4. Climbing Ivy / Vines on Left Wall
    // Top coping vines wrapping around the rim
    for (let vy = 53; vy <= 62; vy++) {
      for (let vx = 43; vx <= 65; vx++) {
        if ((vx + vy * 3) % 4 === 0) {
          this.drawPixelRect(ctx, vx, vy, 2, 2, (vx + vy) % 2 === 0 ? '#15803d' : '#22c55e');
        }
      }
    }
    // Cascading ivy running down the left corner
    for (let vy = 58; vy <= 125; vy++) {
      const wIvy = vy < 85 ? 5 : (vy < 110 ? 4 : 3);
      for (let vx = 42; vx < 42 + wIvy; vx++) {
        if ((vx * 2 + vy * 3) % 4 !== 0) {
          this.drawPixelRect(ctx, vx, vy, 1, 1, vy % 2 === 0 ? '#166534' : '#15803d');
        }
      }
    }
    // Bush & flowers at base of left wall
    this.drawProceduralBush(ctx, 52, 145, 10, 6);
    this.drawPixelRect(ctx, 48, 143, 2, 2, '#f43f5e');
    this.drawPixelRect(ctx, 55, 145, 2, 2, '#fbbf24');

    // 5. Rooftop above Left Wall (Y: 18..55)
    // Metal balustrade railing (X: 46..110, Y: 43..55)
    this.drawPixelRect(ctx, 46, 43, 64, 2, '#1e293b');
    this.drawPixelLine(ctx, 46, 43, 110, 43, '#334155');
    this.drawPixelRect(ctx, 46, 53, 64, 2, '#1e293b');
    for (let rx = 48; rx <= 108; rx += 5) {
      this.drawPixelRect(ctx, rx, 45, 1, 8, '#334155');
    }

    // Classic Victorian Street Lantern Post (X: 68..76, Y: 18..44)
    this.drawPixelRect(ctx, 71, 33, 3, 12, '#1e293b');
    this.drawPixelRect(ctx, 70, 42, 5, 2, '#0f172a');
    this.drawPixelRect(ctx, 70, 32, 5, 2, '#334155');
    // Hexagonal lantern housing
    this.drawPixelRect(ctx, 68, 23, 9, 9, '#1e293b');
    // Glowing warm glass
    this.drawPixelRect(ctx, 69, 24, 7, 7, '#fef08a');
    this.drawPixelRect(ctx, 70, 25, 5, 5, '#fbbf24');
    this.drawPixelLine(ctx, 72, 24, 72, 30, '#b45309');
    // Roof cap & finial
    this.drawPixelRect(ctx, 67, 22, 11, 2, '#1e293b');
    this.drawPixelRect(ctx, 69, 20, 7, 2, '#0f172a');
    this.drawPixelRect(ctx, 71, 18, 3, 2, '#475569');
    this.drawPixelRect(ctx, 72, 16, 1, 2, '#94a3b8');

    // Corner finial urn post on left wall roof corner (X: 104..108, Y: 38..46)
    this.drawPixelRect(ctx, 105, 42, 4, 12, '#1e293b');
    this.drawPixelRect(ctx, 104, 40, 6, 2, '#334155');
    this.drawPixelRect(ctx, 105, 38, 4, 2, '#475569');

    // 6. Center Workshop Glass Entrance (X: 110..182, Y: 66..150)
    // Concrete lintel beam above glass facade (Y: 66..74)
    this.drawPixelRect(ctx, 110, 66, 72, 8, '#e2e5df');
    this.drawPixelLine(ctx, 110, 66, 181, 66, '#ffffff');
    this.drawPixelLine(ctx, 110, 73, 181, 73, '#cbd1c8');
    // Overgrown rooftop ivy along lintel top (Y: 62..68)
    for (let ivx = 111; ivx <= 181; ivx++) {
      if ((ivx * 5) % 7 < 5) {
        this.drawPixelRect(ctx, ivx, 63 + ((ivx * 3) % 4), 2, 2, ivx % 2 === 0 ? '#15803d' : '#22c55e');
      }
    }

    // Recessed dark steel portal frame (#182635)
    this.drawPixelRect(ctx, 110, 74, 72, 76, '#182635');
    this.drawPixelRect(ctx, 112, 76, 68, 74, '#0f172a');

    // Upper Transom Window (Y: 76..88, H: 12)
    // 3 clean architectural glass panes with subtle gradient
    for (const pxStart of [113, 136, 159]) {
      this.drawPixelRect(ctx, pxStart, 76, 20, 12, '#101f30');
      this.drawPixelLine(ctx, pxStart, 76, pxStart + 19, 76, '#1b2f44');
    }
    // Transom bar (horizontal steel divider)
    this.drawPixelRect(ctx, 110, 88, 72, 3, '#182635');
    this.drawPixelLine(ctx, 110, 88, 181, 88, '#263b52');

    // Lower Workshop Double Doors (Y: 91..150, H: 59)
    // Left door leaf (X: 113..144, W: 32)
    this.drawPixelRect(ctx, 113, 91, 32, 59, '#182635');
    for (let row = 0; row < 38; row++) {
      const tCol = row < 12 ? '#101f30' : (row < 26 ? '#0c1826' : '#09121d');
      this.drawPixelRect(ctx, 115, 93 + row, 28, 1, tCol);
    }
    this.drawPixelLine(ctx, 114, 132, 144, 132, '#263b52');
    this.drawPixelRect(ctx, 115, 134, 28, 15, '#09121d');

    // Right door leaf (X: 147..178, W: 32)
    this.drawPixelRect(ctx, 147, 91, 32, 59, '#182635');
    for (let row = 0; row < 38; row++) {
      const tCol = row < 12 ? '#101f30' : (row < 26 ? '#0c1826' : '#09121d');
      this.drawPixelRect(ctx, 149, 93 + row, 28, 1, tCol);
    }
    this.drawPixelLine(ctx, 148, 132, 178, 132, '#263b52');
    this.drawPixelRect(ctx, 149, 134, 28, 15, '#09121d');

    // Center meeting stiles seam
    this.drawPixelLine(ctx, 145, 91, 145, 150, '#0f172a');
    this.drawPixelLine(ctx, 146, 91, 146, 150, '#263b52');

    // Symmetrical Golden Brass Pull Handles ONLY (Y: 116..128, H: 12)
    // Symmetrical pull handles with zero other interior colors!
    this.drawPixelRect(ctx, 143, 116, 2, 12, '#fbbf24');
    this.drawPixelRect(ctx, 143, 116, 2, 2, '#f59e0b');
    this.drawPixelRect(ctx, 143, 126, 2, 2, '#d97706');

    this.drawPixelRect(ctx, 147, 116, 2, 12, '#fbbf24');
    this.drawPixelRect(ctx, 147, 116, 2, 2, '#f59e0b');
    this.drawPixelRect(ctx, 147, 126, 2, 2, '#d97706');

    // Door bottom threshold connecting seamlessly to ground 150 (0 gap!)
    this.drawPixelLine(ctx, 110, 150, 182, 150, '#263b52');

    // 7. Industrial Rooftop Installations (above center & right roof, Y: 16..66)
    // Stainless steel storage boiler tank (X: 124..143, Y: 38..66)
    this.drawPixelRect(ctx, 124, 40, 20, 26, '#94a3b8');
    this.drawPixelRect(ctx, 126, 41, 5, 24, '#cbd5e1');
    this.drawPixelRect(ctx, 138, 41, 5, 24, '#64748b');
    this.drawPixelRect(ctx, 123, 38, 22, 3, '#cbd5e1');
    this.drawPixelRect(ctx, 123, 64, 22, 2, '#475569');
    for (const rY of [44, 50, 56, 62]) {
      this.drawPixelRect(ctx, 127, rY, 1, 1, '#ffffff');
      this.drawPixelRect(ctx, 137, rY, 1, 1, '#334155');
    }

    // Industrial ventilation chimney stack / flue (X: 147..156, Y: 24..66)
    this.drawPixelRect(ctx, 149, 30, 6, 36, '#475569');
    this.drawPixelLine(ctx, 150, 30, 150, 65, '#64748b');
    this.drawPixelLine(ctx, 154, 30, 154, 65, '#334155');
    this.drawPixelRect(ctx, 145, 26, 14, 5, '#334155');
    this.drawPixelLine(ctx, 146, 26, 158, 26, '#64748b');
    this.drawPixelRect(ctx, 148, 24, 8, 2, '#64748b');
    this.drawPixelRect(ctx, 151, 22, 2, 2, '#94a3b8');

    // Rooftop foliage behind and around pipes
    this.drawProceduralBush(ctx, 160, 55, 12, 9);
    this.drawProceduralBush(ctx, 176, 53, 10, 8);

    // GIANT CHUNKY INVERTED-U LOOPING INDUSTRIAL DUCT PIPE (X: 166..200, Y: 16..66)
    const pw = 11;
    // Left vertical pipe (X: 166..176, Y: 24..66)
    this.drawPixelRect(ctx, 166, 24, pw, 42, '#334155');
    this.drawPixelRect(ctx, 167, 24, 3, 42, '#64748b');
    this.drawPixelRect(ctx, 174, 24, 3, 42, '#1e293b');
    for (const fly of [32, 46, 60]) {
      this.drawPixelRect(ctx, 165, fly, pw + 2, 3, '#475569');
      this.drawPixelLine(ctx, 165, fly, 165 + pw + 1, fly, '#94a3b8');
      this.drawPixelLine(ctx, 165, fly + 2, 165 + pw + 1, fly + 2, '#0f172a');
    }

    // Top horizontal pipe span (X: 172..194, Y: 16..26)
    this.drawPixelRect(ctx, 172, 16, 22, pw, '#334155');
    this.drawPixelLine(ctx, 172, 17, 193, 17, '#94a3b8');
    this.drawPixelLine(ctx, 172, 26, 193, 26, '#1e293b');

    // 90-degree Elbow top-left corner
    this.drawPixelRect(ctx, 166, 16, 11, 11, '#334155');
    this.drawPixelRect(ctx, 167, 17, 4, 4, '#94a3b8');

    // Right vertical pipe (X: 189..199, Y: 24..70)
    this.drawPixelRect(ctx, 189, 24, pw, 46, '#334155');
    this.drawPixelRect(ctx, 190, 24, 3, 46, '#64748b');
    this.drawPixelRect(ctx, 197, 24, 3, 46, '#1e293b');
    for (const fly of [32, 46, 62]) {
      this.drawPixelRect(ctx, 188, fly, pw + 2, 3, '#475569');
      this.drawPixelLine(ctx, 188, fly, 188 + pw + 1, fly, '#94a3b8');
      this.drawPixelLine(ctx, 188, fly + 2, 188 + pw + 1, fly + 2, '#0f172a');
    }

    // 90-degree Elbow top-right corner
    this.drawPixelRect(ctx, 189, 16, 11, 11, '#334155');
    this.drawPixelRect(ctx, 190, 17, 4, 4, '#94a3b8');

    // 8. Right Workshop Bay (X: 182..226, Y: 66..150)
    this.drawPixelRect(ctx, 182, 66, 44, 84, '#e2e5df');
    this.drawPixelLine(ctx, 182, 66, 225, 66, '#ffffff');
    this.drawPixelLine(ctx, 182, 149, 225, 149, '#cbd1c8');
    this.drawPixelLine(ctx, 225, 66, 225, 149, '#94a3b8');

    // Workshop bulletin/poster niche (X: 194..208, Y: 78..104)
    this.drawPixelRect(ctx, 194, 78, 15, 26, '#334155');
    this.drawPixelRect(ctx, 195, 79, 13, 24, '#f8fafc');
    this.drawPixelRect(ctx, 196, 80, 11, 14, '#0284c7');
    this.drawPixelRect(ctx, 199, 84, 5, 5, '#fbbf24');
    this.drawPixelLine(ctx, 197, 98, 205, 98, '#1e293b');
    this.drawPixelLine(ctx, 197, 100, 203, 100, '#64748b');

    // Luminous Plasma Condenser Tube & Tech Rack (X: 210..222, Y: 72..108)
    // Dark steel mounting brackets
    this.drawPixelRect(ctx, 209, 72, 13, 3, '#1e293b');
    this.drawPixelRect(ctx, 209, 105, 13, 3, '#1e293b');
    // Glass vacuum cylinder
    this.drawPixelRect(ctx, 210, 75, 11, 30, '#0f172a');
    this.drawPixelRect(ctx, 211, 76, 9, 28, '#083344');
    // Luminous glowing cyan & emerald plasma core
    this.drawPixelRect(ctx, 213, 77, 5, 26, '#06b6d4');
    this.drawPixelRect(ctx, 214, 78, 3, 24, '#67e8f9');
    this.drawPixelLine(ctx, 215, 79, 215, 100, '#ffffff');
    // Copper condenser helical wire coils
    for (const cy of [79, 85, 91, 97, 103]) {
      this.drawPixelRect(ctx, 210, cy, 11, 1, '#b45309');
      this.drawPixelRect(ctx, 212, cy, 7, 1, '#f59e0b');
    }
    // High-tech status LED rack (red, amber, green indicators)
    this.drawPixelRect(ctx, 222, 78, 3, 16, '#182635');
    this.drawPixelRect(ctx, 223, 80, 1, 2, '#22c55e'); // Green power LED
    this.drawPixelRect(ctx, 223, 84, 1, 2, '#fbbf24'); // Amber data LED
    this.drawPixelRect(ctx, 223, 88, 1, 2, '#ef4444'); // Red pulse LED
    this.drawPixelRect(ctx, 223, 92, 1, 2, '#38bdf8'); // Cyan link LED

    // Vertical pipe conduit down right bay
    this.drawPixelRect(ctx, 214, 66, 3, 50, '#64748b');
    this.drawPixelLine(ctx, 214, 66, 214, 115, '#94a3b8');
    this.drawPixelRect(ctx, 213, 115, 5, 4, '#475569');

    // 9. Wooden Park Bench in front of Right Bay (X: 184..218, Y: 125..150)
    // Cast iron legs & frame resting on ground 150
    this.drawPixelRect(ctx, 187, 134, 3, 16, '#1e293b');
    this.drawPixelRect(ctx, 213, 134, 3, 16, '#1e293b');
    // Armrests
    this.drawPixelRect(ctx, 185, 133, 4, 3, '#334155');
    this.drawPixelRect(ctx, 213, 133, 4, 3, '#334155');
    // Teak Wooden Slats (Backrest & Seat)
    this.drawPixelRect(ctx, 186, 126, 30, 3, '#d97706');
    this.drawPixelLine(ctx, 186, 126, 215, 126, '#fef08a');
    this.drawPixelRect(ctx, 186, 130, 30, 3, '#b45309');
    this.drawPixelRect(ctx, 185, 137, 32, 3, '#d97706');
    this.drawPixelLine(ctx, 185, 137, 216, 137, '#fef08a');
    this.drawPixelRect(ctx, 185, 140, 32, 2, '#92400e');

    // 10. Right Courtyard (X: 226..260)
    // Columnar cypress tree
    this.drawCypressTree(ctx, 242, 150);

    // Shrubbery & garden bed along base
    this.drawProceduralBush(ctx, 225, 144, 9, 6);
    this.drawPixelRect(ctx, 222, 142, 2, 2, '#f43f5e');
    this.drawPixelRect(ctx, 227, 145, 2, 2, '#fbbf24');

    // Silver outdoor recycling / trash bin (X: 226..236, Y: 130..150)
    this.drawPixelRect(ctx, 226, 130, 11, 20, '#94a3b8');
    this.drawPixelLine(ctx, 227, 130, 227, 149, '#cbd5e1');
    this.drawPixelLine(ctx, 236, 130, 236, 149, '#475569');
    this.drawPixelRect(ctx, 225, 128, 13, 3, '#cbd5e1');
    this.drawPixelRect(ctx, 228, 134, 7, 3, '#1e293b');

    // Retro Red Beverage Vending Machine (X: 238..257, Y: 104..150)
    this.drawPixelRect(ctx, 238, 104, 20, 46, '#dc2626');
    this.drawPixelRect(ctx, 239, 105, 18, 2, '#ef4444');
    this.drawPixelLine(ctx, 238, 105, 238, 149, '#b91c1c');
    this.drawPixelLine(ctx, 257, 105, 257, 149, '#991b1b');
    this.drawPixelRect(ctx, 238, 103, 20, 2, '#f8fafc');
    // Showcase window
    this.drawPixelRect(ctx, 240, 109, 16, 20, '#1e293b');
    this.drawPixelRect(ctx, 241, 110, 14, 18, '#0f172a');
    const drinkCols = ['#38bdf8', '#f87171', '#4ade80', '#fbbf24'];
    for (let i = 0; i < drinkCols.length; i++) {
      this.drawPixelRect(ctx, 242 + i * 3, 112, 2, 4, drinkCols[i]);
      this.drawPixelRect(ctx, 242 + i * 3, 120, 2, 4, drinkCols[i]);
    }
    // Coin slot & button area
    this.drawPixelRect(ctx, 241, 130, 14, 2, '#475569');
    this.drawPixelRect(ctx, 252, 133, 2, 3, '#fbbf24');
    // Dispensing chute flap
    this.drawPixelRect(ctx, 241, 140, 14, 7, '#1e293b');
    this.drawPixelRect(ctx, 242, 141, 12, 5, '#0f172a');
    // Legs resting on ground 150
    this.drawPixelRect(ctx, 239, 149, 3, 2, '#334155');
    this.drawPixelRect(ctx, 254, 149, 3, 2, '#334155');

    // Sidewalk Ground Contact Shadow: Y = 150..152
    this.drawPixelLine(ctx, 4, 150, 256, 150, 'rgba(148, 163, 184, 0.7)');
    this.drawPixelLine(ctx, 4, 151, 256, 151, 'rgba(203, 213, 225, 0.5)');
  }

  private static drawLushPalmTree(ctx: CanvasRenderingContext2D, trunkX: number, baseY: number) {
    const cBarkDark = '#381c06';
    const cBarkMid = '#78350f';
    const cBarkLight = '#a16207';
    const cBarkHi = '#ca8a04';

    const trunkPts: [number, number][] = [];
    for (let ty = 24; ty < baseY; ty++) {
      const prog = (ty - 24) / (baseY - 24);
      const curvX = trunkX + Math.floor(4 * Math.sin(prog * Math.PI));
      trunkPts.push([curvX, ty]);

      const tw = 6 + Math.floor(prog * 4);
      this.drawPixelRect(ctx, curvX - Math.floor(tw / 2), ty, tw, 1, cBarkMid);
      this.drawPixelRect(ctx, curvX - Math.floor(tw / 2), ty, 2, 1, cBarkDark);
      this.drawPixelRect(ctx, curvX + Math.floor(tw / 2) - 2, ty, 2, 1, ty % 3 === 0 ? cBarkHi : cBarkLight);
      if (ty % 4 === 0) {
        this.drawPixelRect(ctx, curvX - Math.floor(tw / 2), ty, tw, 1, cBarkDark);
      }
    }

    const [topX, topY] = trunkPts[0];
    const fronds: [number, number, number][] = [
      [-26, -14, -16],
      [-34, -2, -12],
      [-38, 12, -6],
      [-30, 24, 2],
      [-16, -20, -22],
      [16, -20, -22],
      [28, -12, -16],
      [34, 0, -12],
      [36, 14, -6],
      [26, 24, 2],
      [0, -22, -24],
      [-10, 4, -14],
      [10, 4, -14],
      [-20, -6, -16],
      [20, -6, -16]
    ];

    const cLeafDark = '#064e3b';
    const cLeafMid = '#059669';
    const cLeafLight = '#10b981';
    const cLeafHi = '#34d399';

    for (const [fdx, fdy, farch] of fronds) {
      const steps = 22;
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const fx = Math.floor(topX + t * fdx);
        const fy = Math.floor(topY + t * fdy + 4 * farch * (t - t * t));

        this.drawPixelRect(ctx, fx, fy, 1, 1, cLeafMid);
        const leafLen = Math.floor(5 * Math.sin(t * Math.PI)) + 1;
        for (let ll = 1; ll <= leafLen; ll++) {
          const col = ll === 1 && fdy < 0 ? cLeafHi : (ll < leafLen ? cLeafLight : cLeafDark);
          this.drawPixelRect(ctx, fx, fy + ll, 1, 1, col);
          if (t > 0.2 && t < 0.8) {
            this.drawPixelRect(ctx, fx + (fdx > 0 ? 1 : -1), fy - Math.floor(ll / 2), 1, 1, cLeafMid);
          }
        }
      }
    }

    this.drawProceduralBush(ctx, topX, topY, 14, 10);
  }

  private static drawCypressTree(ctx: CanvasRenderingContext2D, cx: number, baseY: number) {
    const cDark = '#022c22';
    const cMid = '#064e3b';
    const cLight = '#047857';
    const cHi = '#10b981';

    const topY = 12;
    const h = baseY - topY;
    for (let y = topY; y < baseY; y++) {
      const prog = (y - topY) / h;
      let w = 8;
      if (prog < 0.15) {
        w = Math.floor(2 + (prog / 0.15) * 6);
      } else if (prog < 0.7) {
        w = Math.floor(8 + ((prog - 0.15) / 0.55) * 8);
      } else {
        w = Math.floor(16 - ((prog - 0.7) / 0.3) * 4);
      }

      for (let x = cx - Math.floor(w / 2); x <= cx + Math.floor(w / 2); x++) {
        const dx = x - cx;
        const edge = Math.abs(dx) / (w / 2.0);
        let col = cMid;
        if (edge > 0.85) {
          col = cDark;
        } else if (dx < -w * 0.15) {
          col = (x + y) % 2 === 0 ? cDark : cMid;
        } else if (dx > w * 0.1) {
          col = (x * 2 + y) % 3 === 0 ? cHi : cLight;
        } else {
          col = (x + y) % 2 === 0 ? cLight : cMid;
        }
        this.drawPixelRect(ctx, x, y, 1, 1, col);
      }
    }
  }

  private static drawArcade(ctx: CanvasRenderingContext2D) {
    // 0. Sub-sidewalk Foundation & Bedrock (below ground line Y = 150..165)
    this.drawPixelRect(ctx, 0, 150, 260, 15, '#1e293b');
    this.drawPixelRect(ctx, 0, 150, 260, 2, '#94a3b8');

    // 1. ROOFTOP INSTALLATIONS & BACKGROUND ROOF ELEMENTS (Drawn FIRST so nothing ever obscures the sign!)
    // Rooftop Finials & Solar Cylindrical Water Skylight (X: 106..118, Y: 18..34)
    this.drawPixelRect(ctx, 106, 22, 12, 12, '#94a3b8');
    this.drawPixelRect(ctx, 107, 23, 4, 10, '#cbd5e1');
    this.drawPixelRect(ctx, 105, 20, 14, 2, '#cbd5e1');
    this.drawPixelRect(ctx, 111, 17, 2, 3, '#334155');

    // Industrial Flue Chimney with Conical Cap (X: 172..182, Y: 18..36)
    this.drawPixelRect(ctx, 175, 26, 6, 12, '#475569');
    this.drawPixelLine(ctx, 176, 26, 176, 37, '#64748b');
    this.drawPixelRect(ctx, 172, 23, 12, 3, '#334155');
    this.drawPixelRect(ctx, 174, 21, 8, 2, '#64748b');
    this.drawPixelRect(ctx, 177, 19, 2, 2, '#94a3b8');

    // Rooftop foliage (Placed on the left and right wings, NEVER touching the center sign!)
    this.drawProceduralBush(ctx, 62, 32, 8, 6);
    this.drawProceduralBush(ctx, 195, 33, 10, 6);

    // Rooftop Balustrade Railing (Only on left wing X: 52..72 and right wing X: 168..210)
    // Left wing railing
    this.drawPixelRect(ctx, 52, 36, 20, 2, '#b45309');
    this.drawPixelLine(ctx, 52, 36, 71, 36, '#fef08a');
    this.drawPixelRect(ctx, 52, 44, 20, 2, '#182635');
    for (let rx = 54; rx <= 70; rx += 5) {
      this.drawPixelRect(ctx, rx, 38, 1, 6, '#334155');
    }

    // Right wing railing
    this.drawPixelRect(ctx, 168, 36, 42, 2, '#b45309');
    this.drawPixelLine(ctx, 168, 36, 209, 36, '#fef08a');
    this.drawPixelRect(ctx, 168, 44, 42, 2, '#182635');
    for (let rx = 170; rx <= 208; rx += 6) {
      this.drawPixelRect(ctx, rx, 38, 1, 6, '#334155');
    }

    // 2. Left Courtyard (NO TREE on the left as requested by user!)
    // Victorian street lamppost on left courtyard (X: 24..30, Y: 44..150)
    this.drawPixelRect(ctx, 26, 60, 3, 90, '#1e293b');
    this.drawPixelRect(ctx, 25, 142, 5, 8, '#0f172a');
    this.drawPixelRect(ctx, 23, 48, 9, 12, '#1e293b');
    this.drawPixelRect(ctx, 24, 49, 7, 10, '#fef08a');
    this.drawPixelRect(ctx, 25, 50, 5, 8, '#fbbf24');
    this.drawPixelRect(ctx, 22, 46, 11, 2, '#1e293b');
    this.drawPixelRect(ctx, 26, 44, 3, 2, '#475569');

    // Stacked poster display easels mounted on post (X: 18..34, Y: 92..146)
    // Upper easel
    this.drawPixelRect(ctx, 19, 94, 14, 18, '#334155');
    this.drawPixelRect(ctx, 20, 95, 12, 16, '#f8fafc');
    this.drawPixelRect(ctx, 22, 98, 8, 4, '#ef4444');
    this.drawPixelLine(ctx, 22, 104, 28, 104, '#1e293b');
    this.drawPixelLine(ctx, 22, 107, 26, 107, '#64748b');
    // Lower easel
    this.drawPixelRect(ctx, 19, 116, 14, 20, '#334155');
    this.drawPixelRect(ctx, 20, 117, 12, 18, '#f8fafc');
    this.drawPixelRect(ctx, 22, 120, 8, 8, '#3b82f6');
    this.drawPixelLine(ctx, 22, 130, 28, 130, '#1e293b');

    // Classical French limestone transition pylon (X: 38..52, Y: 50..150)
    this.drawPixelRect(ctx, 38, 50, 14, 100, '#fcf6e5');
    this.drawPixelLine(ctx, 38, 50, 51, 50, '#ffffff');
    this.drawPixelLine(ctx, 38, 50, 38, 149, '#ffffff');
    this.drawPixelLine(ctx, 51, 50, 51, 149, '#d8caa5');
    for (let sy = 65; sy < 145; sy += 16) {
      this.drawPixelLine(ctx, 38, sy, 51, sy, '#d8caa5');
    }
    // Climbing ivy on pylon
    for (let vy = 50; vy <= 120; vy++) {
      if ((vy * 3) % 5 < 3) {
        this.drawPixelRect(ctx, 36 + (vy % 4), vy, 2, 2, vy % 2 === 0 ? '#15803d' : '#22c55e');
      }
    }
    // Low wooden chalkboard easel at pylon base
    this.drawPixelRect(ctx, 34, 132, 18, 18, '#78350f');
    this.drawPixelRect(ctx, 35, 133, 16, 16, '#1e293b');
    this.drawPixelLine(ctx, 36, 136, 48, 136, '#ffffff');
    this.drawPixelLine(ctx, 36, 140, 44, 140, '#f59e0b');

    // Potted plant / decorative flower planter on the far left sidewalk
    this.drawPixelRect(ctx, 10, 138, 10, 12, '#92400e');
    this.drawPixelRect(ctx, 9, 137, 12, 2, '#b45309');
    this.drawProceduralBush(ctx, 15, 133, 7, 5);
    this.drawPixelRect(ctx, 13, 131, 2, 2, '#fbbf24');
    this.drawPixelRect(ctx, 16, 133, 2, 2, '#f43f5e');

    // 3. Main Building: Klein Blue Steel Facade (X: 52..210, Y: 46..150)
    this.drawPixelRect(ctx, 52, 46, 158, 104, '#1d4ed8');
    this.drawPixelRect(ctx, 52, 48, 158, 3, '#1e40af');

    // Roof parapet coping trim (Y: 44..48)
    this.drawPixelRect(ctx, 50, 44, 162, 4, '#1e40af');
    this.drawPixelLine(ctx, 50, 44, 211, 44, '#60a5fa');
    this.drawPixelLine(ctx, 50, 47, 211, 47, '#172554');

    // Horizontal panel joint lines & bolted rivets
    this.drawPixelLine(ctx, 52, 78, 209, 78, '#1e3a8a');
    this.drawPixelLine(ctx, 52, 118, 209, 118, '#1e3a8a');
    for (let rx = 56; rx <= 208; rx += 18) {
      this.drawPixelRect(ctx, rx, 77, 2, 2, '#93c5fd');
      this.drawPixelRect(ctx, rx, 79, 2, 1, '#172554');
      this.drawPixelRect(ctx, rx, 117, 2, 2, '#93c5fd');
      this.drawPixelRect(ctx, rx, 119, 2, 1, '#172554');
    }

    // 4. Left Blue Wall Wing (X: 52..86)
    // Glowing Retro 8-bit Neon Emblem: "1UP" & Joystick (X: 58..78, Y: 50..64)
    this.drawPixelRect(ctx, 58, 51, 20, 14, '#0f172a');
    this.drawPixelRect(ctx, 59, 52, 18, 12, '#182635');
    // Neon pink outer border
    this.drawPixelLine(ctx, 59, 52, 76, 52, '#ec4899');
    this.drawPixelLine(ctx, 59, 63, 76, 63, '#ec4899');
    this.drawPixelLine(ctx, 59, 52, 59, 63, '#ec4899');
    this.drawPixelLine(ctx, 76, 52, 76, 63, '#ec4899');
    // Luminous 1UP typography in electric yellow & cyan
    this.renderPixelText4x6(ctx, '1UP', 62, 55, '#fef08a', 1);
    this.drawPixelRect(ctx, 72, 56, 2, 2, '#22c55e');
    this.drawPixelRect(ctx, 73, 58, 2, 2, '#38bdf8');

    // Framed Game Poster (X: 60..78, Y: 68..92)
    this.drawPixelRect(ctx, 60, 68, 18, 24, '#182635');
    this.drawPixelRect(ctx, 61, 69, 16, 22, '#f8fafc');
    this.drawPixelRect(ctx, 62, 70, 14, 12, '#3b82f6');
    this.drawPixelRect(ctx, 65, 74, 8, 8, '#f43f5e');
    this.drawPixelRect(ctx, 67, 76, 4, 4, '#fbbf24');
    this.drawPixelLine(ctx, 63, 85, 74, 85, '#1e293b');
    this.drawPixelLine(ctx, 63, 88, 70, 88, '#64748b');

    // Sky-Blue Retro Gachapon / Capsule Machine (X: 58..78, Y: 98..150)
    this.drawPixelRect(ctx, 58, 98, 20, 52, '#0284c7');
    this.drawPixelRect(ctx, 59, 99, 18, 2, '#38bdf8');
    this.drawPixelLine(ctx, 58, 99, 58, 149, '#0369a1');
    this.drawPixelLine(ctx, 77, 99, 77, 149, '#075985');
    this.drawPixelRect(ctx, 60, 103, 16, 22, '#182635');
    this.drawPixelRect(ctx, 61, 104, 14, 20, '#0f172a');
    const capCols = ['#f43f5e', '#fbbf24', '#22c55e', '#38bdf8', '#a855f7'];
    for (let i = 0; i < capCols.length; i++) {
      this.drawPixelRect(ctx, 62 + (i % 3) * 4, 106 + Math.floor(i / 3) * 8, 3, 3, capCols[i]);
      this.drawPixelRect(ctx, 63 + (i % 3) * 4, 106 + Math.floor(i / 3) * 8, 1, 1, '#ffffff');
    }
    this.drawPixelRect(ctx, 61, 128, 14, 2, '#334155');
    this.drawPixelRect(ctx, 67, 131, 4, 4, '#fbbf24');
    this.drawPixelRect(ctx, 61, 138, 14, 9, '#182635');
    this.drawPixelRect(ctx, 62, 139, 12, 7, '#0f172a');
    this.drawPixelRect(ctx, 59, 149, 3, 2, '#1e293b');
    this.drawPixelRect(ctx, 74, 149, 3, 2, '#1e293b');

    // 5. Center Storefront Entrance (X: 86..154, Y: 66..150, W: 68)
    this.drawPixelRect(ctx, 86, 66, 68, 84, '#182635');
    this.drawPixelRect(ctx, 88, 68, 64, 82, '#0f172a');

    // Upper Transom Window (Y: 68..82, H: 14)
    for (const pxStart of [89, 111, 133]) {
      this.drawPixelRect(ctx, pxStart, 68, 19, 14, '#101f30');
      this.drawPixelLine(ctx, pxStart, 68, pxStart + 18, 68, '#1b2f44');
    }
    this.drawPixelRect(ctx, 86, 82, 68, 3, '#182635');
    this.drawPixelLine(ctx, 86, 82, 153, 82, '#263b52');

    // Lower Symmetrical Double Doors (Y: 85..150, H: 65)
    // Left door leaf (X: 89..118, W: 30)
    this.drawPixelRect(ctx, 89, 85, 30, 65, '#182635');
    for (let row = 0; row < 42; row++) {
      const tCol = row < 14 ? '#101f30' : (row < 28 ? '#0c1826' : '#09121d');
      this.drawPixelRect(ctx, 91, 87 + row, 26, 1, tCol);
    }
    this.drawPixelLine(ctx, 90, 130, 118, 130, '#263b52');
    this.drawPixelRect(ctx, 91, 132, 26, 17, '#09121d');

    // Right door leaf (X: 121..150, W: 30)
    this.drawPixelRect(ctx, 121, 85, 30, 65, '#182635');
    for (let row = 0; row < 42; row++) {
      const tCol = row < 14 ? '#101f30' : (row < 28 ? '#0c1826' : '#09121d');
      this.drawPixelRect(ctx, 123, 87 + row, 26, 1, tCol);
    }
    this.drawPixelLine(ctx, 122, 130, 150, 130, '#263b52');
    this.drawPixelRect(ctx, 123, 132, 26, 17, '#09121d');

    // Center meeting stiles seam
    this.drawPixelLine(ctx, 119, 85, 119, 150, '#0f172a');
    this.drawPixelLine(ctx, 120, 85, 120, 150, '#263b52');

    // Symmetrical Golden Brass Pull Handles ONLY (Y: 114..126, H: 12)
    this.drawPixelRect(ctx, 117, 114, 2, 12, '#fbbf24');
    this.drawPixelRect(ctx, 117, 114, 2, 2, '#f59e0b');
    this.drawPixelRect(ctx, 117, 124, 2, 2, '#d97706');

    this.drawPixelRect(ctx, 121, 114, 2, 12, '#fbbf24');
    this.drawPixelRect(ctx, 121, 114, 2, 2, '#f59e0b');
    this.drawPixelRect(ctx, 121, 124, 2, 2, '#d97706');

    // Door bottom threshold connects to ground 150 (0 gap!)
    this.drawPixelLine(ctx, 86, 150, 154, 150, '#263b52');

    // 6. Right Blue Wall Wing & Typography (X: 154..210, Y: 46..150)
    // GAMES / IDEAS / FRIENDS (stacked crisp white typography)
    const wordX = 172;
    this.renderPixelText4x6(ctx, 'GAMES', wordX, 50, '#ffffff', 2);
    this.renderPixelText4x6(ctx, 'IDEAS', wordX, 61, '#ffffff', 2);
    this.renderPixelText4x6(ctx, 'FRIENDS', wordX, 72, '#ffffff', 1);

    // Golden wall plaque (X: 156..164, Y: 84..98)
    this.drawPixelRect(ctx, 156, 84, 8, 14, '#182635');
    this.drawPixelRect(ctx, 157, 85, 6, 12, '#fbbf24');
    this.drawPixelRect(ctx, 158, 87, 4, 8, '#d97706');

    // Framed bulletin/poster (X: 198..207, Y: 80..106)
    this.drawPixelRect(ctx, 198, 80, 10, 26, '#182635');
    this.drawPixelRect(ctx, 199, 81, 8, 24, '#f8fafc');
    this.drawPixelRect(ctx, 200, 83, 6, 12, '#0284c7');
    this.drawPixelLine(ctx, 200, 98, 205, 98, '#1e293b');

    // Wooden Planter Bench in front of Right Wall (X: 164..202, Y: 124..150)
    this.drawPixelRect(ctx, 166, 134, 3, 16, '#1e293b');
    this.drawPixelRect(ctx, 198, 134, 3, 16, '#1e293b');
    this.drawPixelRect(ctx, 164, 132, 38, 3, '#d97706');
    this.drawPixelLine(ctx, 164, 132, 201, 132, '#fef08a');
    this.drawPixelRect(ctx, 164, 135, 38, 2, '#92400e');
    this.drawPixelRect(ctx, 166, 143, 34, 2, '#b45309');

    // Lush potted flower garden on the bench table!
    this.drawProceduralBush(ctx, 172, 126, 7, 6);
    this.drawPixelRect(ctx, 170, 124, 2, 2, '#f43f5e');
    this.drawPixelRect(ctx, 174, 127, 2, 2, '#fbbf24');

    this.drawProceduralBush(ctx, 186, 124, 8, 7);
    this.drawPixelRect(ctx, 184, 122, 2, 2, '#f43f5e');
    this.drawPixelRect(ctx, 189, 125, 2, 2, '#ffffff');
    this.drawPixelRect(ctx, 187, 120, 2, 2, '#fbbf24');

    this.drawProceduralBush(ctx, 197, 128, 6, 5);
    this.drawPixelRect(ctx, 196, 127, 2, 2, '#38bdf8');

    // 7. Right Courtyard (X: 210..260)
    this.drawLushPalmTree(ctx, 224, 150);

    // Steel lamppost with vertical blue arcade banner (X: 232..244, Y: 32..150)
    this.drawPixelRect(ctx, 237, 34, 2, 116, '#182635');
    // Blue banner
    this.drawPixelRect(ctx, 229, 46, 17, 30, '#0284c7');
    this.drawPixelRect(ctx, 230, 47, 15, 28, '#0ea5e9');
    this.drawPixelRect(ctx, 232, 52, 11, 3, '#ffffff');
    this.drawPixelRect(ctx, 232, 58, 11, 3, '#fbbf24');
    this.drawPixelRect(ctx, 232, 64, 11, 3, '#ffffff');

    // Victorian lamppost on right courtyard (X: 248..254, Y: 38..150)
    this.drawPixelRect(ctx, 250, 54, 3, 96, '#1e293b');
    this.drawPixelRect(ctx, 249, 142, 5, 8, '#0f172a');
    this.drawPixelRect(ctx, 247, 42, 9, 12, '#1e293b');
    this.drawPixelRect(ctx, 248, 43, 7, 10, '#fef08a');
    this.drawPixelRect(ctx, 249, 44, 5, 8, '#fbbf24');
    this.drawPixelRect(ctx, 246, 40, 11, 2, '#1e293b');
    this.drawPixelRect(ctx, 250, 38, 3, 2, '#475569');

    // Outdoor recycling/trash bin (X: 240..248, Y: 130..150)
    this.drawPixelRect(ctx, 240, 130, 9, 20, '#334155');
    this.drawPixelLine(ctx, 241, 130, 241, 149, '#64748b');
    this.drawPixelRect(ctx, 239, 128, 11, 2, '#475569');
    this.drawPixelRect(ctx, 242, 133, 5, 3, '#0f172a');

    // 8. THE OUTDOOR ARCADE MARQUEE SIGN (DRAWN ON FRONT LAYER: 放在最外面，不要被遮挡)
    // Heavy industrial mounting struts attaching sign box to the facade
    for (const sx of [76, 96, 120, 144, 164]) {
      this.drawPixelRect(ctx, sx, 62, 3, 4, '#0f172a');
      this.drawPixelRect(ctx, sx + 1, 62, 1, 4, '#475569');
    }

    // Drop shadow cast by the protruding outdoor marquee sign onto the facade below
    this.drawPixelRect(ctx, 70, 62, 100, 4, 'rgba(15, 23, 42, 0.7)');

    // Outer 3D Marquee Sign Box Housing (X: 72..168, Y: 32..62, W: 96, H: 30)
    // Dark steel chassis
    this.drawPixelRect(ctx, 72, 32, 96, 30, '#0f172a');

    // Beveled light rim on top & left (creates outward 3D pop)
    this.drawPixelLine(ctx, 73, 33, 166, 33, '#fca5a5');
    this.drawPixelLine(ctx, 73, 33, 73, 60, '#fca5a5');

    // Shaded beveled edge on bottom & right
    this.drawPixelLine(ctx, 73, 61, 167, 61, '#7f1d1d');
    this.drawPixelLine(ctx, 167, 33, 167, 61, '#7f1d1d');

    // Rich crimson red marquee face
    this.drawPixelRect(ctx, 74, 34, 92, 27, '#dc2626');
    this.drawPixelRect(ctx, 75, 35, 90, 25, '#ef4444');

    // Subtle inner glowing border
    this.drawPixelLine(ctx, 75, 35, 164, 35, '#f87171');
    this.drawPixelLine(ctx, 75, 59, 164, 59, '#b91c1c');

    // 5 Glowing Neon Indicator Studs / Bulbs along top rim (Y: 29..32)
    for (const bx of [78, 98, 120, 142, 162]) {
      this.drawPixelRect(ctx, bx - 1, 29, 4, 3, '#0f172a');
      this.drawPixelRect(ctx, bx, 29, 2, 3, '#fbbf24');
      this.drawPixelRect(ctx, bx, 28, 2, 1, '#fef08a');
      this.drawPixelRect(ctx, bx, 30, 2, 1, '#ffffff');
    }

    // Glowing Neon ARCADE Text (Unified 9px bold font centered at X: 91, Y: 43)
    for (const dy of [-1, 0, 1]) {
      for (const dx of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        this.renderUnifiedMarqueeText(ctx, 'ARCADE', 91 + dx, 43 + dy, '#991b1b', '#991b1b', 3);
      }
    }
    this.renderUnifiedMarqueeText(ctx, 'ARCADE', 91, 43, '#fef08a', '#7f1d1d', 3);

    // Sidewalk Ground Contact Shadow: Y = 150..152
    this.drawPixelLine(ctx, 4, 150, 256, 150, 'rgba(148, 163, 184, 0.7)');
    this.drawPixelLine(ctx, 4, 151, 256, 151, 'rgba(203, 213, 225, 0.5)');
  }

  /**
   * High-fidelity painterly organic leaf mound cluster with multi-lobe highlights and leaf dapples
   */
  private static drawOrganicCanopyCluster(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    seed = 0
  ) {
    const cDeep = '#022c22';
    const cDark = '#064e3b';
    const cMid = '#047857';
    const cOlive = '#047857';
    const cLeaf = '#059669';
    const cLime = '#10b981';
    const cHi = '#34d399';
    const cSun = '#6ee7b7';

    const subLobes = [
      { lx: cx - rx * 0.35, ly: cy - ry * 0.3, lrx: rx * 0.55, lry: ry * 0.55 },
      { lx: cx + rx * 0.3, ly: cy - ry * 0.35, lrx: rx * 0.5, lry: ry * 0.5 },
      { lx: cx, ly: cy - ry * 0.45, lrx: rx * 0.5, lry: ry * 0.5 },
      { lx: cx - rx * 0.2, ly: cy + ry * 0.25, lrx: rx * 0.6, lry: ry * 0.55 },
      { lx: cx + rx * 0.3, ly: cy + ry * 0.2, lrx: rx * 0.55, lry: ry * 0.55 },
      { lx: cx, ly: cy, lrx: rx * 0.7, lry: ry * 0.65 }
    ];

    const minY = Math.floor(cy - ry - 3);
    const maxY = Math.ceil(cy + ry + 3);
    const minX = Math.floor(cx - rx - 3);
    const maxX = Math.ceil(cx + rx + 3);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        let minDist = 999.0;
        let closestLobe = subLobes[0];
        for (let i = 0; i < subLobes.length; i++) {
          const l = subLobes[i];
          const ldx = (x - l.lx) / l.lrx;
          const ldy = (y - l.ly) / l.lry;
          const d = ldx * ldx + ldy * ldy;
          if (d < minDist) {
            minDist = d;
            closestLobe = l;
          }
        }

        const leafJitter =
          Math.sin(x * 1.1 + seed * 2.3) * 0.12 + Math.cos(y * 1.3 - seed * 1.7) * 0.12;

        if (minDist + leafJitter <= 1.0) {
          const subDx = (x - closestLobe.lx) / closestLobe.lrx;
          const subDy = (y - closestLobe.ly) / closestLobe.lry;
          const normY = (y - cy) / ry;
          const normX = (x - cx) / rx;

          const lobeShade = -subDx * 0.4 - subDy * 0.75;
          const overallShade = -normX * 0.3 - normY * 0.6;
          const combined = lobeShade * 0.6 + overallShade * 0.4 + leafJitter * 0.25;

          let col = cDeep;
          if (combined > 0.5) {
            col = normY < -0.2 && subDy < -0.3 ? cSun : cHi;
          } else if (combined > 0.2) {
            col = cLime;
          } else if (combined > -0.1) {
            col = cLeaf;
          } else if (combined > -0.45) {
            col = cOlive;
          } else if (combined > -0.75) {
            col = cDark;
          } else {
            col = cDeep;
          }

          ctx.fillStyle = col;
          ctx.fillRect(x, y, 1, 1);

          // Leaflet speckle detail
          const hVal = (x * 41 + y * 67 + seed * 83) % 89;
          if (hVal < 18 && combined > 0.1) {
            ctx.fillStyle = combined > 0.3 ? cSun : cHi;
            ctx.fillRect(x, y, 1, 1);
          } else if (hVal > 75 && combined < -0.3) {
            ctx.fillStyle = cDeep;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  }

  /**
   * Full, majestic tropical fan palm tree matching authentic Mediterranean reference art
   */
  private static drawStudioPalmTree(ctx: CanvasRenderingContext2D, baseX: number, baseY: number) {
    const cBarkDark = '#381c06';
    const cBarkMid = '#78350f';
    const cBarkLight = '#a16207';
    const cBarkHi = '#ca8a04';

    const hubX = 74;
    const hubY = 18;

    // Curved fibrous trunk rising from behind parapet (baseY is roof at Y = 32)
    for (let ty = hubY; ty <= baseY; ty++) {
      const prog = (ty - hubY) / (baseY - hubY);
      const cx = Math.floor(hubX + Math.sin(prog * 1.5) * 4);
      const tw = 7 + Math.floor(prog * 2);

      this.drawPixelRect(ctx, cx - Math.floor(tw / 2), ty, tw, 1, cBarkMid);
      this.drawPixelRect(ctx, cx - Math.floor(tw / 2), ty, 2, 1, cBarkDark);
      this.drawPixelRect(ctx, cx + Math.floor(tw / 2) - 2, ty, 2, 1, ty % 2 === 0 ? cBarkHi : cBarkLight);
      if (ty % 3 === 0) {
        this.drawPixelRect(ctx, cx - Math.floor(tw / 2), ty, tw, 1, cBarkDark);
      }
    }

    const cPalmDeep = '#022c22';
    const cPalmDark = '#064e3b';
    const cPalmMid = '#047857';
    const cPalmOlive = '#047857';
    const cPalmLeaf = '#059669';
    const cPalmLime = '#10b981';
    const cPalmSun = '#34d399';
    const cPalmTip = '#6ee7b7';

    const renderPlumeFrond = (
      targetDx: number,
      targetDy: number,
      archH: number,
      widthScale: number,
      isBack: boolean
    ) => {
      const steps = 32;
      const points: { x: number; y: number; t: number }[] = [];
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = hubX + t * targetDx;
        const y = hubY + t * targetDy + 4 * archH * (t - t * t);
        points.push({ x, y, t });
      }

      for (let i = 0; i < points.length; i++) {
        const { x, y, t } = points[i];
        const bw = Math.floor(3.5 * widthScale * Math.sin(t * Math.PI));

        const spineCol = isBack ? cPalmDeep : cPalmOlive;
        ctx.fillStyle = spineCol;
        ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);

        for (let dy = 1; dy <= bw; dy++) {
          const sunCol = isBack
            ? cPalmDark
            : t < 0.6 && dy === bw
            ? cPalmSun
            : dy > Math.floor(bw / 2)
            ? cPalmLime
            : cPalmLeaf;
          ctx.fillStyle = sunCol;
          ctx.fillRect(Math.floor(x), Math.floor(y - dy), 1, 1);
        }

        for (let dy = 1; dy <= bw; dy++) {
          const shadeCol = isBack ? cPalmDeep : dy > 1 ? cPalmDark : cPalmMid;
          ctx.fillStyle = shadeCol;
          ctx.fillRect(Math.floor(x), Math.floor(y + dy), 1, 1);
        }

        // Feathered drooping leaflets
        if (i % 2 === 0 && t > 0.15 && t < 0.9) {
          const hangLen = Math.floor(4.0 * Math.sin(t * Math.PI)) + 1;
          for (let hl = 1; hl <= hangLen; hl++) {
            const col = isBack ? cPalmDeep : hl > 2 ? cPalmDark : cPalmLeaf;
            ctx.fillStyle = col;
            ctx.fillRect(
              Math.floor(x + (targetDx > 0 ? 1 : -1) * Math.floor(hl / 2)),
              Math.floor(y + bw + hl),
              1,
              1
            );
          }
        }

        // Leaflet tips on top edge pointing up
        if (i % 3 === 0 && t > 0.2 && t < 0.75 && !isBack) {
          ctx.fillStyle = cPalmTip;
          ctx.fillRect(Math.floor(x + (targetDx > 0 ? 1 : -1)), Math.floor(y - bw - 1), 1, 1);
        }
      }
    };

    // Background fronds
    const backFronds: [number, number, number, number][] = [
      [-46, 2, -10, 0.9],
      [-40, -14, -15, 1.0],
      [-22, -22, -18, 0.95],
      [0, -25, -20, 0.95],
      [22, -22, -18, 0.95],
      [40, -14, -15, 1.0],
      [46, 2, -10, 0.9],
      [-44, 12, -6, 0.85],
      [44, 12, -6, 0.85]
    ];
    for (const [dx, dy, ah, ws] of backFronds) {
      renderPlumeFrond(dx, dy, ah, ws, true);
    }

    // Foreground fronds
    const foreFronds: [number, number, number, number][] = [
      [-38, 16, -6, 1.1],
      [-40, 4, -11, 1.15],
      [-32, -8, -15, 1.1],
      [-16, -16, -17, 1.05],
      [16, -16, -17, 1.05],
      [32, -8, -15, 1.1],
      [40, 4, -11, 1.15],
      [38, 16, -6, 1.1],
      [-24, 18, -4, 1.0],
      [24, 18, -4, 1.0],
      [-8, 14, -4, 0.9],
      [8, 14, -4, 0.9],
      [0, -12, -14, 0.95]
    ];
    for (const [dx, dy, ah, ws] of foreFronds) {
      renderPlumeFrond(dx, dy, ah, ws, false);
    }

    // Dense crown heart
    for (let cy = 14; cy <= 22; cy++) {
      for (let cx = hubX - 5; cx <= hubX + 6; cx++) {
        if ((cx - hubX) ** 2 + (cy - hubY) ** 2 <= 16) {
          ctx.fillStyle = cPalmDark;
          ctx.fillRect(cx, cy, 1, 1);
        }
      }
    }
    for (let cy = 15; cy <= 21; cy++) {
      for (let cx = hubX - 3; cx <= hubX + 4; cx++) {
        if ((cx - hubX) ** 2 + (cy - hubY) ** 2 <= 8) {
          ctx.fillStyle = cPalmLeaf;
          ctx.fillRect(cx, cy, 1, 1);
        }
      }
    }
  }

  /**
   * Procedural Pixel Art Drawing for 08 MY STUDIO (Artist Workshop & Hillside Ascent)
   * 325 x 185 Canvas - Imposing Grand Scale with Higher Roofline, Wider Facade & Bold Sign
   * 1. 100% Transparent background (No opaque sky or boxy stamps)
   * 2. Building facade: Width = 210px (X: 28..238), Height = 138px (Y: 32..170)
   * 3. Roof parapet with stone coping at Y = 32, creating a grand, elevated silhouette
   * 4. Grand Petrol-Blue "MY STUDIO" 3D sign box (Width: 112px, Height: 26px, Y: 42..68)
   *    Bold 6x9 Marquee Typography with 1px drop shadow (Marc Cinema style)
   * 5. Double glass doors (Width: 84px, Height: 98px, Y: 72..170)
   *    Thin deep blue frame (#182635), dark glass, golden brass handles ONLY (#fbbf24), 0 ground gap
   * 6. Right wall typography: DESIGN / FILM / PHOTO / LIFE completely unobstructed
   * 7. Victorian street lamppost positioned on the LEFT side of building (X: 16)
   * 8. Natural Great Oak Tree on the right with NO red lanterns or structures (100% organic)
   * 9. Right side potted plants: ONLY ONE neat planter beside door frame (X: 160..172), leaving typography completely unblocked
   * 10. Grand monumental 2.5D stone staircase ascending with natural perspective and rustic wooden fence
   * 11. Wooden roadside billboard "A BRIGHTER TOMORROW" standing beside the stone steps on a single post
   * 12. Hillside garden with lush organic shrubs and wildflowers (zero hard vertical cutoffs)
   */
  private static drawMyStudio(ctx: CanvasRenderingContext2D) {
    // 0. Sub-sidewalk Foundation & Bedrock (below ground line Y = 170..185, width = 325)
    this.drawPixelRect(ctx, 0, 170, 325, 15, '#1e293b');
    this.drawPixelRect(ctx, 0, 170, 325, 2, '#94a3b8');

    // 1. Victorian Lamppost on the LEFT OF BUILDING (X = 16, rising from Y: 170 up to Y: 36)
    this.drawPixelRect(ctx, 14, 162, 5, 8, '#0f172a');
    this.drawPixelRect(ctx, 13, 168, 7, 2, '#1e293b');
    this.drawPixelRect(ctx, 15, 36, 3, 126, '#1e293b');
    this.drawPixelLine(ctx, 16, 36, 16, 162, '#334155');
    this.drawPixelRect(ctx, 13, 52, 7, 2, '#0f172a');
    this.drawPixelRect(ctx, 14, 94, 5, 2, '#0f172a');
    // Glowing hexagonal lantern head
    this.drawPixelRect(ctx, 12, 22, 9, 14, '#1e293b');
    this.drawPixelRect(ctx, 13, 23, 7, 12, '#fef08a');
    this.drawPixelRect(ctx, 14, 24, 5, 10, '#fbbf24');
    this.drawPixelRect(ctx, 15, 25, 3, 8, '#ffffff');
    this.drawPixelLine(ctx, 16, 23, 16, 34, '#d97706');
    this.drawPixelRect(ctx, 11, 20, 11, 2, '#1e293b');
    this.drawPixelRect(ctx, 13, 18, 7, 2, '#0f172a');
    this.drawPixelRect(ctx, 15, 16, 3, 2, '#475569');

    // Cobalt ceramic pot at lamppost base (X: 19..26)
    this.drawPixelRect(ctx, 19, 158, 8, 12, '#1d4ed8');
    this.drawPixelRect(ctx, 18, 156, 10, 2, '#3b82f6');
    this.drawPixelLine(ctx, 20, 159, 25, 159, '#60a5fa');
    this.drawOrganicCanopyCluster(ctx, 23, 150, 7, 6, 20);
    this.drawPixelRect(ctx, 21, 148, 2, 2, '#fbbf24');
    this.drawPixelRect(ctx, 25, 150, 2, 2, '#f43f5e');

    // 2. Great Oak Tree behind stairs on the RIGHT (Trunk at X: 294, Rooted at Y: 100)
    // (NO RED LANTERN, NO GAZEBO - 100% CLEAN NATURAL TREE!)
    for (let ty = 50; ty <= 101; ty++) {
      const prog = (ty - 50) / 52;
      const cx = Math.floor(294 + Math.sin(prog * 2.2) * 2);
      const tw = ty > 75 ? 8 : 6;
      this.drawPixelRect(ctx, cx - Math.floor(tw / 2), ty, tw, 1, '#451a03');
      this.drawPixelRect(ctx, cx - Math.floor(tw / 2), ty, 2, 1, '#270e02');
      this.drawPixelRect(ctx, cx + Math.floor(tw / 2) - 1, ty, 1, 1, '#78350f');
    }

    // Left branch reaching under canopy
    for (let bx = 270; bx <= 294; bx++) {
      const by = Math.floor(40 + (bx - 270) * 0.45);
      this.drawPixelRect(ctx, bx, by, 1, 4, '#451a03');
      this.drawPixelRect(ctx, bx, by, 1, 1, '#78350f');
    }

    // Right branch
    for (let bx = 294; bx <= 308; bx++) {
      const by = Math.floor(50 - (bx - 294) * 0.8);
      this.drawPixelRect(ctx, bx, by, 1, 3, '#451a03');
    }

    // Canopy clusters for Great Oak Tree (X: 256..316, Y: 6..72)
    this.drawOrganicCanopyCluster(ctx, 276, 26, 17, 14, 1);
    this.drawOrganicCanopyCluster(ctx, 298, 18, 18, 15, 3);
    this.drawOrganicCanopyCluster(ctx, 308, 30, 12, 13, 5);
    this.drawOrganicCanopyCluster(ctx, 266, 22, 14, 13, 2);
    this.drawOrganicCanopyCluster(ctx, 286, 14, 19, 14, 4);
    this.drawOrganicCanopyCluster(ctx, 302, 24, 14, 14, 6);
    this.drawOrganicCanopyCluster(ctx, 278, 36, 12, 11, 7);
    this.drawOrganicCanopyCluster(ctx, 294, 32, 15, 12, 8);
    this.drawOrganicCanopyCluster(ctx, 306, 42, 10, 10, 9);

    // 3. Garden Tree & Chimney behind Center-Right Roof (X: 186..236, Y: 12..48)
    this.drawPixelRect(ctx, 186, 28, 8, 16, '#eae0cc');
    this.drawPixelLine(ctx, 186, 28, 186, 43, '#ffffff');
    this.drawPixelLine(ctx, 193, 28, 193, 43, '#c7baa3');
    this.drawPixelRect(ctx, 185, 26, 10, 2, '#d8caa5');
    this.drawPixelRect(ctx, 188, 22, 4, 4, '#c2410c');
    this.drawPixelLine(ctx, 188, 22, 191, 22, '#ea580c');

    this.drawPixelRect(ctx, 212, 30, 5, 14, '#451a03');
    this.drawPixelRect(ctx, 212, 30, 1, 14, '#270e02');
    this.drawPixelRect(ctx, 216, 30, 1, 14, '#78350f');

    this.drawOrganicCanopyCluster(ctx, 200, 24, 15, 13, 11);
    this.drawOrganicCanopyCluster(ctx, 218, 18, 17, 14, 12);
    this.drawOrganicCanopyCluster(ctx, 232, 22, 13, 12, 13);
    this.drawOrganicCanopyCluster(ctx, 210, 30, 15, 11, 14);

    // 4. Tropical Date Palm Tree on Left Roof (Trunk at X: 80, Base Y: 32)
    this.drawStudioPalmTree(ctx, 80, 32);

    // 5. WIDER MAIN STUDIO FACADE: (X: 28..238, Y: 32..170, Width = 210px! Height = 138px)
    this.drawPixelRect(ctx, 28, 36, 210, 134, '#faf8f5');
    for (let wy = 40; wy < 170; wy += 4) {
      this.drawPixelLine(ctx, 28, wy, 237, wy, '#f5ebd7');
    }

    // Corner Quoins (Left: 28..36, Right: 230..238)
    this.drawPixelRect(ctx, 28, 36, 8, 134, '#eae0cc');
    this.drawPixelLine(ctx, 28, 36, 28, 169, '#ffffff');
    this.drawPixelLine(ctx, 35, 36, 35, 169, '#d8caa5');
    this.drawPixelRect(ctx, 230, 36, 8, 134, '#eae0cc');
    this.drawPixelLine(ctx, 237, 36, 237, 169, '#d8caa5');

    // Roof Parapet Coping Stone Trim at Y = 32..36 (X: 26..240, Width = 214px)
    this.drawPixelRect(ctx, 26, 32, 214, 4, '#eae0cc');
    this.drawPixelLine(ctx, 26, 32, 239, 32, '#ffffff');
    this.drawPixelLine(ctx, 26, 35, 239, 35, '#c7baa3');

    // Trailing ivy tendrils cascading over coping
    const ivyPoints = [
      [32, 4], [38, 7], [48, 3], [60, 8], [72, 5], [86, 6], [98, 4],
      [112, 5], [126, 7], [140, 6], [154, 8], [168, 5], [184, 7], [198, 4], [212, 6], [226, 5]
    ];
    for (const [ivX, ivLen] of ivyPoints) {
      for (let il = 0; il < ivLen; il++) {
        const col = il % 2 === 0 ? '#047857' : '#059669';
        this.drawPixelRect(ctx, ivX, 32 + il, 1, 1, il === ivLen - 1 ? '#34d399' : col);
        if (il > 1 && il % 2 === 1) {
          this.drawPixelRect(ctx, ivX + (il % 4 === 1 ? 1 : -1), 32 + il, 1, 1, '#064e3b');
        }
      }
    }

    // Architectural joint panel grid lines across the wider facade
    this.drawPixelLine(ctx, 36, 66, 230, 66, '#dfd2b8');
    this.drawPixelLine(ctx, 36, 116, 230, 116, '#dfd2b8');
    this.drawPixelLine(ctx, 164, 36, 164, 169, '#dfd2b8');
    for (const rx of [40, 164, 226]) {
      this.drawPixelRect(ctx, rx - 1, 65, 3, 3, '#cbbda3');
      this.drawPixelRect(ctx, rx, 66, 1, 1, '#78350f');
      this.drawPixelRect(ctx, rx - 1, 115, 3, 3, '#cbbda3');
      this.drawPixelRect(ctx, rx, 116, 1, 1, '#78350f');
    }

    // 6. GRAND & WIDER "MY STUDIO" SIGN BOX (Width = 112px, Height = 26px, X: 54..166, Y: 42..68)
    this.drawPixelRect(ctx, 52, 68, 116, 3, '#0f172a');
    this.drawPixelRect(ctx, 54, 42, 112, 26, '#0f172a');
    this.drawPixelLine(ctx, 55, 43, 164, 43, '#f1f5f9');
    this.drawPixelLine(ctx, 55, 43, 55, 66, '#f1f5f9');
    this.drawPixelLine(ctx, 56, 67, 165, 67, '#334155');
    this.drawPixelLine(ctx, 165, 43, 165, 67, '#334155');
    // Petrol blue / teal face
    this.drawPixelRect(ctx, 56, 44, 108, 22, '#0e7490');
    this.drawPixelLine(ctx, 56, 44, 163, 44, '#06b6d4');
    this.drawPixelLine(ctx, 56, 65, 163, 65, '#155e75');

    // BOLD MARQUEE PIXEL TEXT: "MY STUDIO" (79px wide, centered in 108px: X = 70, Y = 50)
    this.renderStudioMarqueeText(ctx, 'MY STUDIO', 70, 50, '#ffffff', '#083344', 2);

    // 7. WIDER STOREFRONT ENTRANCE & DOUBLE DOORS (Width = 84px, Height = 98px, X: 68..152, Y: 72..170)
    this.drawPixelRect(ctx, 68, 72, 84, 98, '#182635');
    this.drawPixelRect(ctx, 70, 74, 80, 96, '#0f172a');

    // Upper Transom Window (Y: 74..90, Height = 16)
    for (const tx of [71, 98, 125]) {
      this.drawPixelRect(ctx, tx, 74, 25, 16, '#101f30');
      this.drawPixelLine(ctx, tx, 74, tx + 24, 74, '#1b2f44');
    }
    this.drawPixelRect(ctx, 68, 90, 84, 4, '#182635');
    this.drawPixelLine(ctx, 68, 90, 151, 90, '#263b52');

    // Left door leaf (X: 70..109, Width = 40)
    this.drawPixelRect(ctx, 70, 94, 40, 76, '#182635');
    for (let row = 0; row < 50; row++) {
      const gCol = row < 16 ? '#101f30' : (row < 34 ? '#0c1826' : '#09121d');
      this.drawPixelRect(ctx, 72, 96 + row, 36, 1, gCol);
    }
    this.drawPixelLine(ctx, 71, 146, 109, 146, '#263b52');
    this.drawPixelRect(ctx, 72, 148, 36, 22, '#09121d');

    // Right door leaf (X: 111..150, Width = 40)
    this.drawPixelRect(ctx, 111, 94, 40, 76, '#182635');
    for (let row = 0; row < 50; row++) {
      const gCol = row < 16 ? '#101f30' : (row < 34 ? '#0c1826' : '#09121d');
      this.drawPixelRect(ctx, 113, 96 + row, 36, 1, gCol);
    }
    this.drawPixelLine(ctx, 110, 146, 150, 146, '#263b52');
    this.drawPixelRect(ctx, 113, 148, 36, 22, '#09121d');

    // Meeting stile seam at center
    this.drawPixelLine(ctx, 109, 94, 109, 170, '#0f172a');
    this.drawPixelLine(ctx, 110, 94, 110, 170, '#263b52');

    // Symmetrical Golden Brass Pull Handles ONLY (Y: 126..142, Height = 16)
    this.drawPixelRect(ctx, 107, 126, 2, 16, '#fbbf24');
    this.drawPixelRect(ctx, 107, 126, 2, 2, '#f59e0b');
    this.drawPixelRect(ctx, 107, 140, 2, 2, '#d97706');

    this.drawPixelRect(ctx, 112, 126, 2, 16, '#fbbf24');
    this.drawPixelRect(ctx, 112, 126, 2, 2, '#f59e0b');
    this.drawPixelRect(ctx, 112, 140, 2, 2, '#d97706');

    // Seamless threshold at Y = 170 (0 ground gap!)
    this.drawPixelLine(ctx, 68, 170, 152, 170, '#263b52');

    // 8. Sconce Wall Lamps
    for (const sx of [48, 164]) {
      this.drawPixelRect(ctx, sx - 2, 102, 3, 2, '#182635');
      this.drawPixelRect(ctx, sx, 100, 5, 9, '#1e293b');
      this.drawPixelRect(ctx, sx + 1, 101, 3, 7, '#fef08a');
      this.drawPixelRect(ctx, sx + 2, 102, 1, 2, '#ffffff');
      this.drawPixelRect(ctx, sx - 1, 109, 7, 2, '#d97706');
    }

    // 9. Right Wall Typography: DESIGN / FILM / PHOTO / LIFE (Centered in right wall, completely UNBLOCKED!)
    const typoX = 186;
    this.renderPixelText4x6(ctx, 'DESIGN', typoX, 74, '#1e293b', 1);
    this.renderPixelText4x6(ctx, 'FILM', typoX + 2, 88, '#1e293b', 2);
    this.renderPixelText4x6(ctx, 'PHOTO', typoX, 102, '#1e293b', 1);
    this.renderPixelText4x6(ctx, 'LIFE', typoX + 2, 116, '#1e293b', 2);

    // Left Planter (X: 32..46, Y: 154..170)
    this.drawPixelRect(ctx, 34, 156, 12, 14, '#c2410c');
    this.drawPixelRect(ctx, 33, 154, 14, 3, '#ea580c');
    this.drawPixelLine(ctx, 35, 157, 45, 157, '#f97316');
    this.drawPixelLine(ctx, 34, 169, 45, 169, '#7c2d12');
    this.drawOrganicCanopyCluster(ctx, 40, 146, 8, 7, 16);
    this.drawPixelRect(ctx, 37, 142, 2, 2, '#fb7185');
    this.drawPixelRect(ctx, 43, 144, 2, 2, '#f43f5e');

    // Creator's Vintage 35mm Rangefinder Camera on Tripod (X: 48..62, Y: 144..170)
    // Dark aluminum tripod legs touching the pavement at Y = 170
    this.drawPixelLine(ctx, 55, 153, 49, 170, '#1e293b');
    this.drawPixelLine(ctx, 55, 153, 55, 170, '#334155');
    this.drawPixelLine(ctx, 55, 153, 61, 170, '#1e293b');
    this.drawPixelRect(ctx, 53, 151, 5, 3, '#475569'); // Tripod head
    // Camera body (black leatherette & brushed chrome)
    this.drawPixelRect(ctx, 51, 145, 9, 6, '#0f172a');
    this.drawPixelLine(ctx, 51, 145, 59, 145, '#cbd5e1'); // Top plate
    this.drawPixelRect(ctx, 52, 147, 4, 3, '#334155');    // Lens barrel
    this.drawPixelRect(ctx, 53, 148, 2, 2, '#38bdf8');    // Glass reflection
    this.drawPixelRect(ctx, 57, 144, 2, 2, '#fbbf24');    // Shutter button

    // EXACTLY ONE POTTED PLANT ON THE RIGHT (X: 160..172, Y: 154..170)
    // Snug beside the right door frame, leaving DESIGN / FILM / PHOTO / LIFE completely UNBLOCKED!
    this.drawPixelRect(ctx, 161, 156, 12, 14, '#c2410c');
    this.drawPixelRect(ctx, 160, 154, 14, 3, '#ea580c');
    this.drawPixelLine(ctx, 162, 157, 172, 157, '#f97316');
    this.drawPixelLine(ctx, 161, 169, 172, 169, '#7c2d12');
    this.drawOrganicCanopyCluster(ctx, 166, 146, 8, 7, 19);
    this.drawPixelRect(ctx, 163, 142, 2, 2, '#f43f5e');
    this.drawPixelRect(ctx, 169, 144, 2, 2, '#fbbf24');

    // 10. 2.5D Grand Stone Staircase (X: 244..302, Y: 168 up to 88)
    // Left stepped cheek wall (balustrade)
    for (let st = 0; st < 14; st++) {
      const bY = 168 - st * 6;
      this.drawPixelRect(ctx, 242, bY - 4, 8, 10, '#eae0cc');
      this.drawPixelRect(ctx, 242, bY - 4, 8, 2, '#f8fafc');
      this.drawPixelLine(ctx, 242, bY - 4, 249, bY - 4, '#ffffff');
      this.drawPixelLine(ctx, 242, bY + 5, 249, bY + 5, '#c7baa3');
    }

    // 14 Stone steps with perspective
    for (let st = 0; st < 14; st++) {
      const stepY = 168 - st * 6;
      const stepStartX = 248 + Math.floor(st * 0.3);
      const stepEndX = 298 - Math.floor(st * 1.5);
      const stepW = stepEndX - stepStartX;
      this.drawPixelRect(ctx, stepStartX, stepY, stepW, 5, '#94a3b8');
      this.drawPixelLine(ctx, stepStartX, stepY + 4, stepEndX, stepY + 4, '#475569');
      this.drawPixelRect(ctx, stepStartX, stepY, 4, 5, '#64748b');
      this.drawPixelRect(ctx, stepStartX, stepY - 1, stepW, 2, '#f1f5f9');
      this.drawPixelLine(ctx, stepStartX, stepY - 1, stepEndX, stepY - 1, '#ffffff');
      if (stepW > 20) {
        this.drawPixelRect(ctx, stepStartX + Math.floor(stepW * 0.45), stepY - 1, 1, 6, '#64748b');
      }
    }

    // Right rustic timber post-and-rail fence
    const fencePosts = [
      [298, 164], [292, 144], [286, 124], [280, 104], [274, 88]
    ];
    for (const [px, py] of fencePosts) {
      this.drawPixelRect(ctx, px - 1, py - 12, 3, 14, '#78350f');
      this.drawPixelLine(ctx, px - 1, py - 12, px - 1, py + 1, '#b45309');
    }

    for (let i = 0; i < fencePosts.length - 1; i++) {
      const p1 = fencePosts[i];
      const p2 = fencePosts[i + 1];
      const cnt = p1[0] - p2[0];
      for (let s = 0; s <= cnt; s++) {
        const t = s / cnt;
        const rx = Math.floor(p1[0] - s);
        const ryTop = Math.floor(p1[1] - 10 + t * (p2[1] - p1[1]));
        const ryMid = Math.floor(p1[1] - 5 + t * (p2[1] - p1[1]));
        this.drawPixelRect(ctx, rx, ryTop, 1, 2, '#b45309');
        this.drawPixelRect(ctx, rx, ryMid, 1, 2, '#92400e');
      }
    }

    // 11. Lush Natural Hillside Garden (organic shrubs & wildflowers along stairs and slope)
    this.drawOrganicCanopyCluster(ctx, 302, 164, 10, 8, 21);
    this.drawOrganicCanopyCluster(ctx, 306, 150, 9, 8, 22);
    this.drawOrganicCanopyCluster(ctx, 304, 134, 9, 8, 23);
    this.drawOrganicCanopyCluster(ctx, 298, 116, 10, 8, 24);
    this.drawOrganicCanopyCluster(ctx, 292, 98, 10, 8, 25);
    this.drawOrganicCanopyCluster(ctx, 284, 106, 8, 7, 26);
    this.drawOrganicCanopyCluster(ctx, 276, 122, 9, 8, 27);

    const gardenFlowers: [number, number, string][] = [
      [298, 166, '#f43f5e'], [304, 162, '#fbbf24'], [308, 168, '#ffffff'],
      [302, 148, '#fb7185'], [306, 152, '#fef08a'], [298, 136, '#a855f7'],
      [302, 128, '#f43f5e'], [305, 122, '#38bdf8'], [294, 108, '#fbbf24'],
      [288, 110, '#f43f5e'], [292, 112, '#ffffff'], [280, 124, '#fbbf24'],
      [274, 122, '#f43f5e']
    ];
    for (const [fx, fy, col] of gardenFlowers) {
      this.drawPixelRect(ctx, fx, fy, 2, 2, col);
    }

    // 12. "A BRIGHTER TOMORROW" Wooden Billboard Sign (X: 268..308, Y: 68..96)
    // Sturdy square wooden post rooted into the shrubs
    this.drawPixelRect(ctx, 287, 96, 4, 38, '#78350f');
    this.drawPixelLine(ctx, 287, 96, 287, 133, '#b45309');
    this.drawPixelLine(ctx, 290, 96, 290, 133, '#451a03');

    this.drawPixelRect(ctx, 268, 68, 40, 28, '#475569');
    this.drawPixelRect(ctx, 269, 69, 38, 26, '#334155');
    this.drawPixelRect(ctx, 270, 70, 36, 24, '#fffdfa');
    this.drawPixelLine(ctx, 270, 70, 305, 70, '#f8fafc');
    this.drawPixelLine(ctx, 270, 93, 305, 93, '#f1f5f9');
    // 4 Corner rivets
    this.drawPixelRect(ctx, 271, 71, 1, 1, '#94a3b8');
    this.drawPixelRect(ctx, 304, 71, 1, 1, '#94a3b8');
    this.drawPixelRect(ctx, 271, 92, 1, 1, '#94a3b8');
    this.drawPixelRect(ctx, 304, 92, 1, 1, '#94a3b8');

    // Centered 3 lines:
    this.renderPixelText3x5(ctx, 'A', 287, 73, '#1e293b', 1);
    this.renderPixelText3x5(ctx, 'BRIGHTER', 272, 79, '#1e293b', 1);
    this.renderPixelText3x5(ctx, 'TOMORROW', 272, 85, '#1e293b', 1);

    // Sidewalk Ground Contact Shadow: Y = 170..172
    this.drawPixelLine(ctx, 4, 170, 320, 170, 'rgba(148, 163, 184, 0.7)');
    this.drawPixelLine(ctx, 4, 171, 320, 171, 'rgba(203, 213, 225, 0.5)');
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

  private static drawEntranceSign(ctx: CanvasRenderingContext2D) {
    const groundY = 56;
    // Wooden vertical posts with woodgrain texture
    this.drawPixelRect(ctx, 10, 24, 4, groundY - 24, '#78350f');
    this.drawPixelLine(ctx, 10, 24, 10, groundY, '#92400e');
    this.drawPixelRect(ctx, 40, 24, 4, groundY - 24, '#78350f');
    this.drawPixelLine(ctx, 40, 24, 40, groundY, '#92400e');

    // Wooden signboard (x: 2..52, y: 4..30)
    this.drawPixelRect(ctx, 2, 4, 50, 26, '#fef3c7');
    this.drawPixelRect(ctx, 1, 3, 52, 28, '#b45309');
    this.drawPixelRect(ctx, 2, 4, 50, 26, '#fef3c7');
    this.renderPixelText4x6(ctx, 'MY WORLD', 5, 11, '#0f172a', 0);
    // Arrow ->
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(38, 21); ctx.lineTo(44, 21); ctx.lineTo(41, 17);
    ctx.closePath(); ctx.fill();

    // Bush and wildflowers at base
    this.drawProceduralBush(ctx, 27, groundY - 6, 14, 8);
    this.drawPixelRect(ctx, 20, groundY - 10, 2, 2, '#fbbf24');
    this.drawPixelRect(ctx, 32, groundY - 8, 2, 2, '#f43f5e');
  }

  private static drawObservatory(ctx: CanvasRenderingContext2D) {
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      this.drawPixelRect(ctx, x, y, w, h, col);
    };
    const line = (x1: number, y1: number, x2: number, y2: number, col: string, width = 1) => {
      this.drawPixelLine(ctx, x1, y1, x2, y2, col, width);
    };
    const poly = (pts: [number, number][], fillCol: string, outlineCol?: string) => {
      ctx.fillStyle = fillCol;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.closePath();
      ctx.fill();
      if (outlineCol) {
        ctx.strokeStyle = outlineCol;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const drawCypress = (cx: number, baseY: number, height: number, width = 10) => {
      for (let y = baseY - height; y < baseY; y++) {
        const prog = (y - (baseY - height)) / height;
        let w = width;
        if (prog < 0.15) {
          w = Math.max(2, Math.floor(2 + (prog * width) / 0.15));
        } else if (prog > 0.8) {
          w = Math.max(2, Math.floor(width - (prog - 0.8) * 3 * width));
        }
        w = Math.max(2, w);
        const rx = cx - Math.floor(w / 2);
        rect(rx, y, w, 1, '#064e3b');
        rect(rx + 1, y, Math.max(1, Math.floor(w / 3)), 1, '#059669');
        rect(rx + 2, y, Math.max(1, Math.floor(w / 4)), 1, '#10b981');
        rect(rx + w - 2, y, 2, 1, '#022c22');
      }
    };

    // 0. Sub-sidewalk Bedrock (Y = 165..180, Width = 330)
    rect(0, 165, 330, 15, '#1e293b');
    rect(0, 165, 330, 2, '#94a3b8');

    // 1. Background Hillside Foliage & Cypresses
    drawCypress(22, 110, 68, 12);
    drawCypress(36, 120, 54, 10);
    drawCypress(292, 100, 72, 14);
    drawCypress(310, 110, 62, 11);

    this.drawProceduralBush(ctx, 16, 115, 16, 14);
    this.drawProceduralBush(ctx, 300, 95, 20, 16);
    this.drawProceduralBush(ctx, 316, 120, 15, 14);

    // 2. Left Observation Deck Retaining Wall & Terrace (X = 30..112, Y = 92..165)
    // Retaining stone wall
    rect(30, 92, 82, 73, '#ede6d4');
    rect(30, 92, 82, 3, '#fbf9f4');
    line(30, 95, 112, 95, '#b8b09e');

    // Ashlar stone masonry lines on left terrace wall
    for (let y = 104; y < 165; y += 10) {
      line(30, y, 112, y, '#d4cbb8');
    }
    for (let y = 104; y < 165; y += 20) {
      for (const x of [48, 70, 92]) {
        line(x, y, x, Math.min(165, y + 10), '#d4cbb8');
      }
    }
    for (let y = 114; y < 165; y += 20) {
      for (const x of [38, 59, 81, 102]) {
        line(x, y, x, Math.min(165, y + 10), '#d4cbb8');
      }
    }

    // Astronomical Star-Chart Bronze Plaque on Left Wall (X = 54..88, Y = 108..142)
    rect(53, 107, 36, 36, '#182635');
    rect(54, 108, 34, 34, '#0f172a');
    rect(56, 110, 30, 30, '#0c4a6e');
    line(56, 110, 85, 110, '#0284c7');
    // Constellation celestial grid & stars
    line(58, 125, 83, 125, '#0369a1');
    line(71, 112, 71, 137, '#0369a1');
    const stars: [number, number][] = [[62, 116], [68, 120], [76, 118], [81, 128], [73, 133], [64, 131]];
    for (let i = 0; i < stars.length - 1; i++) {
      line(stars[i][0], stars[i][1], stars[i + 1][0], stars[i + 1][1], '#38bdf8');
    }
    for (const [sx, sy] of stars) {
      rect(sx - 1, sy - 1, 3, 3, '#fbbf24');
      rect(sx, sy, 1, 1, '#ffffff');
    }
    // Moon crescent
    rect(78, 113, 4, 4, '#fef08a');
    rect(78, 113, 2, 4, '#0c4a6e');

    // Climbing English Ivy trailing over left terrace wall
    const ivyTrails: [number, number][] = [
      [34, 14], [44, 22], [52, 10], [92, 18], [102, 26], [108, 12]
    ];
    for (const [ix, ilen] of ivyTrails) {
      for (let il = 0; il < ilen; il++) {
        const col = il % 2 === 0 ? '#15803d' : '#22c55e';
        rect(ix + (il % 3) - 1, 92 + il, 2, 2, col);
        if (il % 4 === 0) {
          rect(ix + (il % 3), 92 + il, 1, 1, '#4ade80');
        }
      }
    }

    // Left Observation Deck Balustrade Railing (Y = 76..92, X = 32..112)
    rect(32, 76, 80, 3, '#d8caa5');
    rect(32, 76, 80, 1, '#fbf9f4');
    line(32, 79, 112, 79, '#b8b09e');
    rect(32, 89, 80, 3, '#d8caa5');
    line(32, 91, 112, 91, '#b8b09e');

    // Balusters
    for (let bx = 35; bx < 110; bx += 6) {
      rect(bx, 79, 3, 10, '#ede6d4');
      line(bx, 79, bx, 88, '#fbf9f4');
      line(bx + 2, 79, bx + 2, 88, '#b8b09e');
    }

    // Classical Victorian Lamppost on Observation Deck (X = 38, Y = 46..92)
    rect(37, 56, 3, 36, '#1e293b');
    line(38, 56, 38, 92, '#334155');
    rect(35, 88, 7, 4, '#0f172a');
    rect(34, 46, 9, 10, '#1e293b');
    rect(35, 47, 7, 8, '#fef08a');
    rect(36, 48, 5, 6, '#fbbf24');
    rect(33, 44, 11, 2, '#0f172a');
    rect(37, 42, 3, 2, '#475569');

    // Hero Astronomical Refractor Telescope on Left Deck (Pier at X = 74, Aimed Up-Left)
    // Heavy Cast-Iron Pier Base (X = 70..78, Y = 66..92)
    rect(72, 72, 6, 20, '#1e293b');
    line(73, 72, 73, 91, '#475569');
    line(76, 72, 76, 91, '#0f172a');
    rect(69, 88, 12, 4, '#0f172a');
    rect(70, 70, 10, 3, '#334155');
    // Equatorial Mount Head & Setting Circles
    rect(69, 63, 11, 7, '#334155');
    rect(71, 61, 7, 3, '#475569');
    rect(66, 65, 4, 5, '#cbd5e1'); // Counterweight
    rect(65, 67, 6, 2, '#94a3b8');
    // Telescope Tube (Aimed Upwards at ~35 degrees: from X = 88, Y = 70 up to X = 54, Y = 46)
    poly([[54, 46], [57, 43], [90, 67], [87, 71]], '#0284c7', '#0f172a');
    // Dew Shield / Objective Lens Hood (X = 50..56, Y = 42..49)
    poly([[49, 44], [53, 41], [57, 46], [53, 50]], '#38bdf8', '#0f172a');
    // Brass / Gold rings & Eyepiece focuser
    line(62, 51, 60, 54, '#fbbf24', 2);
    line(72, 58, 70, 61, '#fbbf24', 2);
    // Viewfinder mini-scope
    line(56, 41, 74, 54, '#cbd5e1', 2);
    rect(54, 40, 3, 2, '#38bdf8');
    // Eyepiece at bottom right
    rect(89, 69, 4, 4, '#1e293b');
    rect(92, 71, 4, 3, '#fbbf24');

    // 3. Center Main Observatory Facade (X = 112..218, Y = 68..165)
    rect(112, 68, 106, 97, '#fcf6e5');
    rect(112, 68, 106, 3, '#ffffff');

    // Corner Quoins on Center Block
    rect(112, 68, 6, 97, '#eae0cc');
    line(112, 68, 112, 164, '#ffffff');
    line(117, 68, 117, 164, '#d8caa5');
    rect(212, 68, 6, 97, '#eae0cc');
    line(212, 68, 212, 164, '#d8caa5');
    line(217, 68, 217, 164, '#c7baa3');

    // Ashlar Panel Grid Lines on Center Facade
    line(118, 96, 212, 96, '#e8ddc2');
    line(118, 126, 212, 126, '#e8ddc2');

    // 4. Low Stone Entrance Steps (X = 126..204, Y = 160..165)
    rect(126, 162, 78, 3, '#f1ede2');
    line(126, 162, 203, 162, '#ffffff');
    line(126, 164, 203, 164, '#d4cbb8');
    rect(130, 159, 70, 3, '#fbf9f4');
    line(130, 159, 199, 159, '#ffffff');
    line(130, 161, 199, 161, '#d4cbb8');

    // 5. Grand Storefront Entrance Double Doors (X = 138..192, W = 54, Y = 94..159, H = 65)
    rect(138, 94, 54, 65, '#182635');
    rect(140, 96, 50, 63, '#0f172a');

    // Arched Transom Window (Y = 96..110, H = 14)
    rect(142, 97, 46, 12, '#101f30');
    line(142, 97, 187, 97, '#1b2f44');
    // Transom cosmic glow & starlight spokes
    rect(164, 98, 2, 10, '#38bdf8');
    line(152, 103, 178, 103, '#38bdf8');
    rect(156, 100, 18, 6, '#0284c7');
    rect(163, 101, 4, 4, '#e0f2fe');

    // Transom bar separator
    rect(138, 109, 54, 3, '#182635');
    line(138, 109, 191, 109, '#263b52');

    // Left Door Leaf (X = 141..164, W = 24)
    rect(141, 112, 24, 47, '#182635');
    for (let row = 0; row < 32; row++) {
      const c = row < 10 ? '#101f30' : (row < 22 ? '#0c1826' : '#09121d');
      rect(143, 114 + row, 20, 1, c);
    }
    line(142, 146, 164, 146, '#263b52');
    rect(143, 147, 20, 11, '#09121d');

    // Right Door Leaf (X = 167..190, W = 24)
    rect(167, 112, 24, 47, '#182635');
    for (let row = 0; row < 32; row++) {
      const c = row < 10 ? '#101f30' : (row < 22 ? '#0c1826' : '#09121d');
      rect(169, 114 + row, 20, 1, c);
    }
    line(168, 146, 190, 146, '#263b52');
    rect(169, 147, 20, 11, '#09121d');

    // Meeting stile center seam
    line(165, 112, 165, 159, '#0f172a');
    line(166, 112, 166, 159, '#263b52');

    // Symmetrical Golden Brass Pull Handles (Y = 130..142, H = 12)
    rect(163, 130, 2, 12, '#fbbf24');
    rect(163, 130, 2, 2, '#f59e0b');
    rect(163, 140, 2, 2, '#d97706');

    rect(167, 130, 2, 12, '#fbbf24');
    rect(167, 130, 2, 2, '#f59e0b');
    rect(167, 140, 2, 2, '#d97706');

    // 6. Sconce Wall Lanterns flanking door (X = 124, 202)
    for (const sx of [124, 202]) {
      rect(sx - 2, 118, 3, 2, '#182635');
      rect(sx, 116, 5, 9, '#1e293b');
      rect(sx + 1, 117, 3, 7, '#fef08a');
      rect(sx + 2, 118, 1, 3, '#ffffff');
      rect(sx - 1, 125, 7, 2, '#d97706');
    }

    // Terracotta Planters flanking door (X = 118, 198)
    rect(119, 148, 10, 12, '#c2410c');
    rect(118, 146, 12, 2, '#ea580c');
    line(119, 148, 128, 148, '#f97316');
    this.drawProceduralBush(ctx, 124, 140, 7, 6);
    rect(122, 138, 2, 2, '#fbbf24');
    rect(125, 140, 2, 2, '#f43f5e');

    rect(199, 148, 10, 12, '#c2410c');
    rect(198, 146, 12, 2, '#ea580c');
    line(199, 148, 208, 148, '#f97316');
    this.drawProceduralBush(ctx, 204, 140, 7, 6);
    rect(202, 138, 2, 2, '#38bdf8');
    rect(205, 140, 2, 2, '#fbbf24');

    // Planter at Left Retaining Wall base (X = 26..38)
    rect(26, 150, 10, 15, '#c2410c');
    rect(25, 148, 12, 2, '#ea580c');
    this.drawProceduralBush(ctx, 31, 142, 8, 7);
    rect(29, 140, 2, 2, '#f43f5e');

    // 7. THE OUTDOOR HERO MARQUEE SIGN: "OBSERVATORY" (Width = 104px, Height = 25px)
    // Mounting struts & drop shadow
    for (const sx of [122, 148, 174, 200]) {
      rect(sx, 90, 2, 4, '#0f172a');
    }
    rect(111, 90, 108, 4, 'rgba(15, 23, 42, 0.6)');

    // Outer 3D Marquee Sign Box Housing (X = 113..217, W = 104, Y = 66..91, H = 25)
    rect(113, 66, 104, 25, '#0f172a');
    // Beveled highlight rim on top & left (Starlight Cyan pop!)
    line(114, 67, 215, 67, '#7dd3fc');
    line(114, 67, 114, 89, '#7dd3fc');
    // Shaded beveled edge on bottom & right
    line(114, 90, 216, 90, '#0369a1');
    line(216, 67, 216, 90, '#0369a1');
    // Rich Deep Midnight Cosmic Blue Marquee Face
    rect(115, 68, 100, 22, '#075985');
    rect(116, 69, 98, 20, '#0c4a6e');
    line(116, 69, 213, 69, '#0284c7');

    // Bold glowing text: "OBSERVATORY" (Unified 9px bold font, centered in 98px: startX = 121, Y = 74)
    this.renderUnifiedMarqueeText(ctx, 'OBSERVATORY', 121, 74, '#ffffff', '#082f49', 1);

    // Corner gold rivets on sign box
    rect(115, 68, 2, 2, '#fbbf24');
    rect(213, 68, 2, 2, '#fbbf24');
    rect(115, 88, 2, 2, '#d97706');
    rect(213, 88, 2, 2, '#d97706');

    // 8. THE GRAND OBSERVATORY DOME (Center X = 165, Base Y = 58, Radius = 44)
    // Dome drum / base ring (Y = 58..66)
    rect(118, 58, 94, 8, '#cbd5e1');
    line(118, 58, 211, 58, '#ffffff');
    line(118, 65, 211, 65, '#64748b');
    for (let dx = 122; dx < 210; dx += 6) {
      rect(dx, 60, 2, 4, '#94a3b8');
    }

    // Symmetrical Hemispherical Dome (R = 44, CX = 165, Base Y = 58)
    const cx = 165;
    const cy = 58;
    const r = 44;
    for (let y = cy - r; y < cy; y++) {
      const dy = y - cy;
      const halfW = Math.sqrt(Math.max(0, r * r - dy * dy));
      const xStart = Math.round(cx - halfW);
      const xEnd = Math.round(cx + halfW);
      const w = xEnd - xStart;
      if (w <= 0) continue;

      // Base metallic fill
      rect(xStart, y, w, 1, '#94a3b8');
      // Left highlight
      const hiW = Math.max(1, Math.floor(w * 0.35));
      rect(xStart + 2, y, hiW, 1, '#cbd5e1');
      rect(xStart + 3, y, Math.max(1, Math.floor(hiW / 2)), 1, '#e2e8f0');
      // Right shading
      const shW = Math.max(1, Math.floor(w * 0.3));
      rect(xEnd - shW, y, shW, 1, '#64748b');
      rect(xEnd - Math.max(1, Math.floor(shW / 2)), y, Math.max(1, Math.floor(shW / 2)), 1, '#475569');
    }

    // Curved Meridian Ribs on Dome
    for (const ribAngle of [-0.65, -0.3, 0.3, 0.65]) {
      for (let y = cy - r + 3; y < cy; y++) {
        const dy = y - cy;
        const curR = Math.sqrt(Math.max(0, r * r - dy * dy));
        const rx = Math.round(cx + curR * ribAngle);
        rect(rx, y, 2, 1, '#334155');
        rect(rx, y, 1, 1, '#cbd5e1');
      }
    }

    // Bold Observatory Observation Slit & Telescope
    // Slit shutter tracks (X = 157..173)
    rect(157, cy - r, 16, r, '#0a1120');
    line(157, cy - r, 157, cy, '#cbd5e1');
    line(172, cy - r, 172, cy, '#334155');
    // Shutter curved doors opened to reveal telescope
    rect(153, cy - r + 4, 4, r - 4, '#475569');
    rect(173, cy - r + 4, 4, r - 4, '#334155');

    // Starlight / interior cyan glow inside dark slit
    for (let gy = cy - r + 10; gy < cy - 6; gy += 4) {
      rect(161, gy, 8, 2, '#0369a1');
    }
    rect(163, cy - 14, 4, 4, '#38bdf8');

    // Giant Optical Telescope Barrel pointing out of dome slit!
    // (From X = 163, Y = 54 up-left to X = 146, Y = 24)
    poly([[144, 22], [149, 19], [167, 52], [162, 55]], '#0284c7', '#082f49');
    // Objective hood & brass rings
    poly([[142, 21], [147, 18], [150, 23], [145, 26]], '#38bdf8', '#082f49');
    line(152, 31, 155, 36, '#fbbf24', 2);

    // Outer Dark Outline around dome curve
    for (let deg = 0; deg <= 180; deg += 2) {
      const rad = (deg * Math.PI) / 180;
      const px = Math.round(cx - r * Math.cos(rad));
      const py = Math.round(cy - r * Math.sin(rad));
      rect(px, py, 1, 1, '#1e293b');
    }

    // 9. Floating Sky Poetic Inscription: NEW HORIZONS / SAME ME (Authentic to reference art!)
    this.renderPixelText3x5(ctx, 'NEW HORIZONS', 231, 23, '#0c4a6e', 1);
    this.renderPixelText3x5(ctx, 'NEW HORIZONS', 230, 22, '#0284c7', 1);
    this.renderPixelText3x5(ctx, 'SAME ME', 247, 33, '#0c4a6e', 1);
    this.renderPixelText3x5(ctx, 'SAME ME', 246, 32, '#0284c7', 1);

    // Right Wing Hillside Terrace Retaining Wall (X = 218..304, Y = 110..165)
    rect(218, 110, 86, 55, '#ede6d4');
    rect(218, 110, 86, 3, '#fbf9f4');
    line(218, 113, 304, 113, '#b8b09e');

    // Stone masonry lines on right terrace wall
    for (let y = 120; y < 165; y += 10) {
      line(218, y, 304, y, '#d4cbb8');
    }
    for (let y = 120; y < 165; y += 20) {
      for (const x of [236, 258, 280]) {
        line(x, y, x, Math.min(165, y + 10), '#d4cbb8');
      }
    }
    for (let y = 130; y < 165; y += 20) {
      for (const x of [226, 247, 269, 291]) {
        line(x, y, x, Math.min(165, y + 10), '#d4cbb8');
      }
    }

    // Gazebo Pavilion with Terracotta Roof (X = 244..288, Y = 78..110)
    // Sloped terracotta roof
    poly([[238, 86], [266, 74], [294, 86]], '#c2410c', '#7c2d12');
    line(240, 85, 266, 75, '#ea580c', 2);
    line(266, 75, 292, 85, '#9a3412', 2);
    rect(265, 71, 2, 4, '#fbbf24'); // Finial

    // White stone pillars
    for (const px of [244, 258, 272, 286]) {
      rect(px, 86, 3, 24, '#f8fafc');
      line(px, 86, px, 109, '#ffffff');
      line(px + 2, 86, px + 2, 109, '#cbd5e1');
    }

    // Arched bench inside gazebo
    rect(248, 98, 34, 12, '#ede6d4');
    rect(250, 100, 30, 10, '#1e293b');
    rect(252, 102, 26, 8, '#0284c7'); // View of azure sea

    // Terrace Balustrade Railing (Y = 106..112)
    rect(218, 106, 86, 3, '#eae0cc');
    line(218, 106, 304, 106, '#ffffff');
    line(218, 109, 304, 109, '#b8b09e');

    // Lush foliage around pavilion and retaining wall
    this.drawProceduralBush(ctx, 236, 146, 14, 12);
    this.drawProceduralBush(ctx, 296, 142, 16, 14);
    this.drawProceduralBush(ctx, 266, 154, 12, 10);
    rect(230, 142, 2, 2, '#f43f5e');
    rect(238, 145, 2, 2, '#fbbf24');
    rect(290, 138, 2, 2, '#38bdf8');
    rect(298, 140, 2, 2, '#f43f5e');
    rect(264, 150, 2, 2, '#fbbf24');
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

    // 2. Coastal White Wooden Post-and-Rail Guardrail (64 x 32) - Matching Strip 1 & 5
    const guardrailCanvas = scene.textures.createCanvas('prop_guardrail', 64, 32);
    if (guardrailCanvas) {
      const ctx = guardrailCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Two horizontal white rails
      this.drawPixelRect(ctx, 0, 8, 64, 4, '#ffffff');
      this.drawPixelRect(ctx, 0, 11, 64, 2, '#cbd5e1');
      this.drawPixelRect(ctx, 0, 18, 64, 4, '#ffffff');
      this.drawPixelRect(ctx, 0, 21, 64, 2, '#cbd5e1');
      // Left vertical post with beveled cap (x = 8..14)
      this.drawPixelRect(ctx, 9, 3, 6, 28, '#ffffff');
      this.drawPixelRect(ctx, 13, 3, 2, 28, '#cbd5e1');
      this.drawPixelRect(ctx, 8, 2, 8, 2, '#ffffff');
      this.drawPixelRect(ctx, 10, 0, 4, 2, '#ffffff');
      this.drawPixelRect(ctx, 8, 30, 8, 2, '#1e293b'); // Dark grounding base
      // Right vertical post with beveled cap (x = 42..48)
      this.drawPixelRect(ctx, 43, 3, 6, 28, '#ffffff');
      this.drawPixelRect(ctx, 47, 3, 2, 28, '#cbd5e1');
      this.drawPixelRect(ctx, 42, 2, 8, 2, '#ffffff');
      this.drawPixelRect(ctx, 44, 0, 4, 2, '#ffffff');
      this.drawPixelRect(ctx, 42, 30, 8, 2, '#1e293b'); // Dark grounding base
      guardrailCanvas.refresh();
    }

    // 3. Ornate Street Lamp with hanging flower baskets (36 x 84)
    const lampCanvas = scene.textures.createCanvas('prop_lamp', 36, 84);
    if (lampCanvas) {
      const ctx = lampCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Post
      this.drawPixelRect(ctx, 16, 18, 4, 62, '#1e293b');
      this.drawPixelRect(ctx, 12, 76, 12, 8, '#0f172a');
      // Lantern
      this.drawPixelRect(ctx, 10, 14, 16, 14, '#0f172a');
      this.drawPixelRect(ctx, 12, 16, 12, 10, '#fef08a');
      this.drawPixelRect(ctx, 14, 9, 8, 6, '#0f172a');
      // Hanging flower baskets on side arms with 4-tone green
      this.drawPixelRect(ctx, 4, 34, 8, 8, '#78350f');
      this.drawPixelRect(ctx, 3, 30, 10, 5, '#ef6453');
      this.drawPixelRect(ctx, 4, 28, 8, 3, '#72be55');
      this.drawPixelRect(ctx, 24, 34, 8, 8, '#78350f');
      this.drawPixelRect(ctx, 23, 30, 10, 5, '#f8cb47');
      this.drawPixelRect(ctx, 24, 28, 8, 3, '#72be55');
      lampCanvas.refresh();
    }

    // 4. Coastal Tree (64 x 110) - 4-Tone Lobed Reference Foliage
    const treeCanvas = scene.textures.createCanvas('prop_tree', 64, 110);
    if (treeCanvas) {
      const ctx = treeCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Trunk & base roots
      this.drawPixelRect(ctx, 28, 55, 8, 52, '#5c3a1e');
      this.drawPixelRect(ctx, 32, 55, 4, 52, '#382415'); // Right trunk shadow
      this.drawPixelRect(ctx, 24, 102, 16, 8, '#1e293b'); // Base grounding roots
      // Lobed foliage clusters (4-tone reference art palette)
      this.drawPixelCircle(ctx, 32, 45, 26, '#52a64c', '#1b4332');
      this.drawPixelCircle(ctx, 24, 32, 20, '#72be55', '#52a64c');
      this.drawPixelCircle(ctx, 40, 34, 18, '#52a64c', '#1b4332');
      this.drawPixelCircle(ctx, 28, 20, 16, '#9bd768', '#72be55');
      this.drawPixelCircle(ctx, 36, 18, 14, '#9bd768', '#72be55');
      this.drawPixelCircle(ctx, 30, 14, 8, '#bbf287', '#9bd768');
      treeCanvas.refresh();
    }

    // 5. Tall Cypress Tree for Future Hill (40 x 130) - Reference Architecture
    const cypressCanvas = scene.textures.createCanvas('prop_cypress', 40, 130);
    if (cypressCanvas) {
      const ctx = cypressCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Trunk base
      this.drawPixelRect(ctx, 18, 96, 4, 34, '#382415');
      this.drawPixelRect(ctx, 16, 124, 8, 6, '#1e293b');
      // Flame-shaped tall cypress body (Right shadow: #1b4332, Center: #52a64c, Left sunlit: #72be55 / #9bd768)
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(6, 105);
      ctx.lineTo(34, 105);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#52a64c';
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(8, 105);
      ctx.lineTo(26, 105);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#72be55';
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(10, 105);
      ctx.lineTo(19, 105);
      ctx.closePath();
      ctx.fill();

      // Highlight flecks on sunlit side
      ctx.fillStyle = '#9bd768';
      this.drawPixelRect(ctx, 14, 25, 4, 12, '#9bd768');
      this.drawPixelRect(ctx, 12, 45, 5, 18, '#9bd768');
      this.drawPixelRect(ctx, 11, 72, 6, 20, '#9bd768');
      cypressCanvas.refresh();
    }

    // 6. Mountain Stone Wall (64 x 48) - Ashlar stone masonry
    const wallCanvas = scene.textures.createCanvas('prop_stone_wall', 64, 48);
    if (wallCanvas) {
      const ctx = wallCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 0, 0, 64, 48, '#8b9cb0');
      this.drawPixelRect(ctx, 0, 0, 64, 3, '#cad5e2'); // Stone coping top
      ctx.strokeStyle = '#26364b';
      ctx.lineWidth = 1;
      // Horizontal masonry courses
      for (let y = 12; y < 48; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(64, y);
        ctx.stroke();
      }
      // Staggered vertical joints
      ctx.beginPath();
      ctx.moveTo(20, 0); ctx.lineTo(20, 12);
      ctx.moveTo(48, 0); ctx.lineTo(48, 12);
      ctx.moveTo(10, 12); ctx.lineTo(10, 24);
      ctx.moveTo(36, 12); ctx.lineTo(36, 24);
      ctx.moveTo(56, 12); ctx.lineTo(56, 24);
      ctx.moveTo(22, 24); ctx.lineTo(22, 36);
      ctx.moveTo(46, 24); ctx.lineTo(46, 36);
      ctx.stroke();
      wallCanvas.refresh();
    }

    // 7. Wildflowers & Grass (32 x 24) - 4-tone green & bright petals
    const grassCanvas = scene.textures.createCanvas('prop_grass', 32, 24);
    if (grassCanvas) {
      const ctx = grassCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 4, 10, 4, 14, '#52a64c');
      this.drawPixelRect(ctx, 12, 6, 4, 18, '#72be55');
      this.drawPixelRect(ctx, 20, 12, 4, 12, '#1b4332');
      this.drawPixelRect(ctx, 2, 22, 28, 2, '#1b4332'); // Grounding line
      // Blossoms
      this.drawPixelRect(ctx, 3, 7, 6, 5, '#ef4444');
      this.drawPixelRect(ctx, 11, 3, 6, 5, '#facc15');
      this.drawPixelRect(ctx, 19, 9, 6, 5, '#ffffff');
      grassCanvas.refresh();
    }

    // 8. Coastal Green Bush (44 x 28) - 4-Tone Lobed Reference Style
    const bushCanvas = scene.textures.createCanvas('prop_bush', 44, 28);
    if (bushCanvas) {
      const ctx = bushCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelCircle(ctx, 15, 16, 12, '#52a64c', '#1b4332');
      this.drawPixelCircle(ctx, 29, 15, 13, '#52a64c', '#1b4332');
      this.drawPixelCircle(ctx, 22, 10, 10, '#72be55', '#52a64c');
      this.drawPixelCircle(ctx, 16, 8, 6, '#9bd768');
      this.drawPixelCircle(ctx, 28, 7, 5, '#9bd768');
      this.drawPixelRect(ctx, 6, 26, 32, 2, '#1b4332'); // Grounding line
      // Tiny flower blossoms
      this.drawPixelRect(ctx, 10, 12, 3, 3, '#f59e0b');
      this.drawPixelRect(ctx, 22, 14, 3, 3, '#ef4444');
      this.drawPixelRect(ctx, 32, 12, 3, 3, '#ffffff');
      bushCanvas.refresh();
    }

    // 9. Large Fluffy Cumulus Cloud (130 x 42)
    const cloudLgCanvas = scene.textures.createCanvas('sky_cloud_large', 130, 42);
    if (cloudLgCanvas) {
      const ctx = cloudLgCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Shadow base (soft gray-blue)
      this.drawPixelCircle(ctx, 30, 26, 16, '#cbe3f7');
      this.drawPixelCircle(ctx, 60, 24, 20, '#cbe3f7');
      this.drawPixelCircle(ctx, 95, 26, 17, '#cbe3f7');
      this.drawPixelRect(ctx, 18, 24, 94, 14, '#cbe3f7');
      // Main cloud body (pure white)
      this.drawPixelCircle(ctx, 28, 20, 15, '#ffffff');
      this.drawPixelCircle(ctx, 58, 17, 19, '#ffffff');
      this.drawPixelCircle(ctx, 82, 19, 16, '#ffffff');
      this.drawPixelCircle(ctx, 104, 23, 12, '#ffffff');
      this.drawPixelRect(ctx, 16, 18, 92, 12, '#ffffff');
      // Sunlit rim highlight
      this.drawPixelCircle(ctx, 56, 14, 15, '#ffffff');
      this.drawPixelCircle(ctx, 80, 16, 13, '#ffffff');
      cloudLgCanvas.refresh();
    }

    // 10. Medium Cumulus Cloud (76 x 28)
    const cloudMedCanvas = scene.textures.createCanvas('sky_cloud_medium', 76, 28);
    if (cloudMedCanvas) {
      const ctx = cloudMedCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Shadow base
      this.drawPixelCircle(ctx, 20, 18, 11, '#cbe3f7');
      this.drawPixelCircle(ctx, 42, 17, 14, '#cbe3f7');
      this.drawPixelCircle(ctx, 60, 19, 10, '#cbe3f7');
      this.drawPixelRect(ctx, 12, 16, 52, 10, '#cbe3f7');
      // Cloud body
      this.drawPixelCircle(ctx, 18, 14, 10, '#ffffff');
      this.drawPixelCircle(ctx, 38, 12, 13, '#ffffff');
      this.drawPixelCircle(ctx, 56, 15, 9, '#ffffff');
      this.drawPixelRect(ctx, 10, 12, 50, 8, '#ffffff');
      cloudMedCanvas.refresh();
    }

    // 11. Small Wispy Cloud (44 x 16)
    const cloudSmCanvas = scene.textures.createCanvas('sky_cloud_small', 44, 16);
    if (cloudSmCanvas) {
      const ctx = cloudSmCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 4, 8, 36, 6, '#d9ebf9');
      this.drawPixelRect(ctx, 6, 5, 32, 6, '#ffffff');
      this.drawPixelCircle(ctx, 16, 6, 6, '#ffffff');
      this.drawPixelCircle(ctx, 28, 7, 5, '#ffffff');
      cloudSmCanvas.refresh();
    }

    // 12. Distant Sailboat on Ocean Horizon (24 x 26)
    const boatCanvas = scene.textures.createCanvas('prop_sailboat', 24, 26);
    if (boatCanvas) {
      const ctx = boatCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // White Mainsail (Triangle)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(11, 2);
      ctx.lineTo(2, 18);
      ctx.lineTo(11, 18);
      ctx.closePath();
      ctx.fill();
      // Jib Sail (Right Triangle)
      ctx.fillStyle = '#e2f0fb';
      ctx.beginPath();
      ctx.moveTo(13, 5);
      ctx.lineTo(13, 18);
      ctx.lineTo(21, 18);
      ctx.closePath();
      ctx.fill();
      // Mast
      this.drawPixelRect(ctx, 11, 2, 2, 18, '#334155');
      // Hull (Wooden Navy/Brown)
      this.drawPixelRect(ctx, 2, 19, 20, 4, '#1e293b');
      this.drawPixelRect(ctx, 4, 23, 16, 2, '#0f172a');
      // Water wake reflection
      this.drawPixelRect(ctx, 0, 24, 24, 1, '#7dd3fc');
      boatCanvas.refresh();
    }

    // 13. Dynamic Animated Seagull (Canonical 24x15 model matching user specification)
    // Any legacy reference to seagull_fly is unified to the exact same authentic seagull frames
    if (!scene.textures.exists('seagull_fly')) {
      const gullW = 24;
      const gullH = 15;
      const gullFlyCanvas = scene.textures.createCanvas('seagull_fly', gullW * 4, gullH);
      if (gullFlyCanvas) {
        const ctx = gullFlyCanvas.getContext();
        ctx.imageSmoothingEnabled = false;
        for (let f = 0; f < 4; f++) {
          this.drawSeagullFrame(ctx, gullW * f, f);
        }
        gullFlyCanvas.refresh();
        for (let f = 0; f < 4; f++) {
          gullFlyCanvas.add(f, 0, gullW * f, 0, gullW, gullH);
        }
      }
    }

    // 14. Dust Particle Effect for Braking / Dismounting (12 x 12)
    const dustCanvas = scene.textures.createCanvas('fx_dust', 12, 12);
    if (dustCanvas) {
      const ctx = dustCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelCircle(ctx, 6, 6, 5, '#cbd5e1');
      this.drawPixelCircle(ctx, 5, 5, 3, '#f1f5f9');
      dustCanvas.refresh();
    }

    // 15. Soft Ground Drop Shadow (38 x 8)
    const shadowCanvas = scene.textures.createCanvas('fx_shadow', 38, 8);
    if (shadowCanvas) {
      const ctx = shadowCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.beginPath();
      ctx.ellipse(19, 4, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.beginPath();
      ctx.ellipse(19, 4, 14, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      shadowCanvas.refresh();
    }

    // 16. Seaside Wooden Park Bench (38 x 22)
    const benchCanvas = scene.textures.createCanvas('prop_bench_seaside', 38, 22);
    if (benchCanvas) {
      const ctx = benchCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 4, 12, 4, 10, '#1e293b');
      this.drawPixelRect(ctx, 30, 12, 4, 10, '#1e293b');
      this.drawPixelRect(ctx, 2, 10, 34, 2, '#0f172a');
      this.drawPixelRect(ctx, 3, 3, 32, 3, '#d97706');
      this.drawPixelLine(ctx, 3, 3, 34, 3, '#fef08a');
      this.drawPixelRect(ctx, 3, 7, 32, 3, '#b45309');
      this.drawPixelRect(ctx, 2, 12, 34, 3, '#d97706');
      this.drawPixelLine(ctx, 2, 12, 35, 12, '#fef08a');
      this.drawPixelRect(ctx, 2, 15, 34, 2, '#92400e');
      this.drawPixelRect(ctx, 2, 8, 3, 5, '#334155');
      this.drawPixelRect(ctx, 33, 8, 3, 5, '#334155');
      benchCanvas.refresh();
    }

    // 17. Seaside Stone Bollard with Rope (32 x 20)
    const bollardCanvas = scene.textures.createCanvas('prop_bollard_rope', 32, 20);
    if (bollardCanvas) {
      const ctx = bollardCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 4, 6, 8, 14, '#f1f5f9');
      this.drawPixelRect(ctx, 4, 6, 2, 14, '#ffffff');
      this.drawPixelRect(ctx, 10, 6, 2, 14, '#94a3b8');
      this.drawPixelRect(ctx, 3, 4, 10, 3, '#1e293b');
      this.drawPixelRect(ctx, 5, 2, 6, 2, '#334155');
      this.drawPixelRect(ctx, 7, 7, 2, 2, '#f59e0b');
      this.drawPixelLine(ctx, 10, 8, 31, 9, '#b45309', 2);
      this.drawPixelLine(ctx, 10, 7, 31, 8, '#fbbf24', 1);
      bollardCanvas.refresh();
    }

    // 18. Terracotta Planter Urn (20 x 22)
    const urnCanvas = scene.textures.createCanvas('prop_planter_urn', 20, 22);
    if (urnCanvas) {
      const ctx = urnCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 5, 11, 10, 11, '#c2410c');
      this.drawPixelRect(ctx, 4, 10, 12, 2, '#ea580c');
      this.drawPixelRect(ctx, 5, 11, 2, 11, '#f97316');
      this.drawPixelRect(ctx, 13, 11, 2, 11, '#9a3412');
      this.drawProceduralBush(ctx, 10, 7, 7, 6);
      this.drawPixelRect(ctx, 6, 5, 2, 2, '#f43f5e');
      this.drawPixelRect(ctx, 11, 4, 2, 2, '#fbbf24');
      this.drawPixelRect(ctx, 8, 8, 2, 2, '#38bdf8');
      urnCanvas.refresh();
    }

    // 18b. Classical Carved Stone Milestone for Future Hill (32 x 40)
    const milestoneCanvas = scene.textures.createCanvas('prop_milestone', 32, 40);
    if (milestoneCanvas) {
      const ctx = milestoneCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Granite stone body with arched top
      this.drawPixelRect(ctx, 6, 10, 20, 28, '#eae0cc');
      this.drawPixelRect(ctx, 7, 10, 18, 28, '#fbf8ee');
      this.drawPixelLine(ctx, 6, 10, 6, 38, '#ffffff');
      this.drawPixelLine(ctx, 25, 10, 25, 38, '#c8baa0');
      // Arched cap
      this.drawPixelCircle(ctx, 16, 10, 10, '#fbf8ee', '#eae0cc');
      this.drawPixelRect(ctx, 4, 38, 24, 2, '#1e293b'); // Grounding base
      // Carved arrow & text: "MT. 5000" / "↗"
      this.drawPixelRect(ctx, 15, 6, 2, 8, '#0284c7');
      this.drawPixelLine(ctx, 13, 8, 16, 5, '#0284c7');
      this.drawPixelLine(ctx, 18, 8, 15, 5, '#0284c7');
      this.renderPixelText4x6(ctx, 'HILL', 10, 16, '#1e293b', 1);
      this.renderPixelText4x6(ctx, '5000', 10, 24, '#0369a1', 1);
      this.drawPixelLine(ctx, 8, 32, 23, 32, '#d4cbb8');
      milestoneCanvas.refresh();
    }

    // 18c. Weathered Granite Mountain Boulder with Coastal Moss (42 x 26)
    const boulderCanvas = scene.textures.createCanvas('prop_boulder', 42, 26);
    if (boulderCanvas) {
      const ctx = boulderCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      // Main boulder silhouette
      this.drawPixelCircle(ctx, 16, 15, 10, '#64748b', '#334155');
      this.drawPixelCircle(ctx, 26, 14, 11, '#64748b', '#334155');
      this.drawPixelCircle(ctx, 20, 10, 9, '#94a3b8', '#64748b');
      this.drawPixelRect(ctx, 6, 16, 30, 8, '#475569');
      this.drawPixelRect(ctx, 4, 23, 34, 3, '#1e293b'); // Ground contact shadow
      // Sunlit rock bevel highlight
      this.drawPixelLine(ctx, 14, 4, 24, 4, '#e2e8f0');
      this.drawPixelLine(ctx, 12, 6, 17, 10, '#cbd5e1');
      // Coastal green moss / lichen patches
      this.drawPixelRect(ctx, 10, 14, 6, 3, '#15803d');
      this.drawPixelRect(ctx, 11, 13, 4, 2, '#22c55e');
      this.drawPixelRect(ctx, 27, 12, 5, 3, '#15803d');
      this.drawPixelRect(ctx, 28, 11, 3, 2, '#86efac');
      boulderCanvas.refresh();
    }

    // 19. Pixel Speech Bubbles for In-World Prompts
    this.createSpeechBubble(scene, 'bubble_prompt_park', 'PARK');
    this.createSpeechBubble(scene, 'bubble_prompt_ride', 'RIDE');
    this.createSpeechBubble(scene, 'bubble_prompt_enter', 'ENTER');
    this.createSpeechBubble(scene, 'bubble_prompt_view', 'VIEW');
    this.createSpeechBubble(scene, 'bubble_prompt_watch', 'WATCH');
    this.createSpeechBubble(scene, 'bubble_prompt_read', 'READ');
    this.createSpeechBubble(scene, 'bubble_prompt_play', 'PLAY');
    this.createSpeechBubble(scene, 'bubble_prompt_cat', 'PET');
    this.createSpeechBubble(scene, 'bubble_prompt_look', 'LOOK');
  }

  private static createAmbientLifeTextures(scene: Phaser.Scene) {
    // 1. Seagull Sprite Sheet (4 frames of 24 x 15 -> 96 x 15)
    // Frame cycle: 0: Soaring Glide -> 1: Wings Up -> 2: Soaring Glide -> 3: Wings Down
    const gullW = 24;
    const gullH = 15;
    const gullCanvas = scene.textures.createCanvas('seagull_sheet', gullW * 4, gullH);
    if (gullCanvas) {
      const ctx = gullCanvas.getContext();
      ctx.imageSmoothingEnabled = false;

      for (let f = 0; f < 4; f++) {
        this.drawSeagullFrame(ctx, gullW * f, f);
      }

      gullCanvas.refresh();
      for (let f = 0; f < 4; f++) {
        gullCanvas.add(f, 0, gullW * f, 0, gullW, gullH);
      }
    }

    // 2. Coastal Studio Cat Sprite Sheet (4 frames of 28 x 20 -> 112 x 20)
    const catW = 28;
    const catH = 20;
    const catCanvas = scene.textures.createCanvas('cat_sheet', catW * 4, catH);
    if (catCanvas) {
      const ctx = catCanvas.getContext();
      ctx.imageSmoothingEnabled = false;

      // Frame 0: Sleeping loaf
      this.drawCatFrame(ctx, 0, 0);
      // Frame 1: Sleeping tail flick
      this.drawCatFrame(ctx, catW, 1);
      // Frame 2: Sitting upright looking at player
      this.drawCatFrame(ctx, catW * 2, 2);
      // Frame 3: Happy stretch / purr
      this.drawCatFrame(ctx, catW * 3, 3);

      catCanvas.refresh();
      catCanvas.add(0, 0, 0, 0, catW, catH);
      catCanvas.add(1, 0, catW, 0, catW, catH);
      catCanvas.add(2, 0, catW * 2, 0, catW, catH);
      catCanvas.add(3, 0, catW * 3, 0, catW, catH);
    }

    // 3. Observatory Summit Astronomical Telescope (36 x 44)
    const telCanvas = scene.textures.createCanvas('prop_telescope', 36, 44);
    if (telCanvas) {
      const ctx = telCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawTelescope(ctx, 0, 0);
      telCanvas.refresh();
    }

    // 4. Soft Wind Flower Petal (6 x 6)
    const petalCanvas = scene.textures.createCanvas('particle_petal', 6, 6);
    if (petalCanvas) {
      const ctx = petalCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 1, 1, 4, 4, '#fda4af');
      this.drawPixelRect(ctx, 2, 2, 2, 2, '#f43f5e');
      this.drawPixelRect(ctx, 2, 0, 2, 1, '#fecdd3');
      this.drawPixelRect(ctx, 0, 2, 1, 2, '#fecdd3');
      petalCanvas.refresh();
    }

    // 5. Pixel Heart Emote for Cat Interaction (10 x 10)
    const heartCanvas = scene.textures.createCanvas('particle_heart', 10, 10);
    if (heartCanvas) {
      const ctx = heartCanvas.getContext();
      ctx.imageSmoothingEnabled = false;
      this.drawPixelRect(ctx, 1, 1, 3, 3, '#f43f5e');
      this.drawPixelRect(ctx, 6, 1, 3, 3, '#f43f5e');
      this.drawPixelRect(ctx, 0, 3, 10, 3, '#f43f5e');
      this.drawPixelRect(ctx, 1, 6, 8, 2, '#f43f5e');
      this.drawPixelRect(ctx, 3, 8, 4, 1, '#e11d48');
      this.drawPixelRect(ctx, 4, 9, 2, 1, '#be123c');
      this.drawPixelRect(ctx, 2, 2, 1, 2, '#fecdd3');
      heartCanvas.refresh();
    }
  }

  private static readonly SEAGULL_PALETTE: Record<string, string> = {
    'W': '#ffffff', // Pure white plumage
    's': '#e2e8f0', // Soft slate underbelly
    'u': '#cbd5e1', // Shadow tone
    'S': '#94a3b8', // Slate grey wing mantle & tail
    'D': '#475569', // Dark slate wing flight feathers
    'K': '#0f172a', // Jet black primary wingtips
    'E': '#0f172a', // Dark eye
    'Y': '#f59e0b', // Amber yellow beak
    'O': '#d97706', // Hooked orange beak tip
  };

  private static readonly SEAGULL_FRAMES: string[][] = [
    // Frame 0: Soaring Glide (Arched wings catching sea breeze)
    [
      '........................',
      '..KDS...................',
      '...SSW........KW........',
      '....SWW......KWW........',
      '.....SWW....WWWW........',
      '......SWW..WWWW.........',
      '.......SWWWWWWWWWWW.....',
      '........WWWWWWWWWEWWYYO.',
      '..SSWWWWWWWWWWWWWWYY....',
      '.SSuuWWWWWWWWWWWW.......',
      '...sssssssss............',
      '........................',
      '........................',
      '........................',
      '........................',
    ],
    // Frame 1: Upstroke (Wings raised high in crisp V-formation)
    [
      '..K...........K.........',
      '..DK.........WK.........',
      '..DS.........WW.........',
      '...S........WW..........',
      '...SS......WWW..........',
      '....S.....WWW...........',
      '....SS...WWWW...........',
      '.....SW.WWWW.WWWW.......',
      '......SWWWWWWWWEWWYYO...',
      '..SSWWWWWWWWWWWWYY......',
      '.SSuuWWWWWWWWWW.........',
      '...sssssssss............',
      '........................',
      '........................',
      '........................',
    ],
    // Frame 2: Soaring Glide (Return to soaring pose)
    [
      '........................',
      '..KDS...................',
      '...SSW........KW........',
      '....SWW......KWW........',
      '.....SWW....WWWW........',
      '......SWW..WWWW.........',
      '.......SWWWWWWWWWWW.....',
      '........WWWWWWWWWEWWYYO.',
      '..SSWWWWWWWWWWWWWWYY....',
      '.SSuuWWWWWWWWWWWW.......',
      '...sssssssss............',
      '........................',
      '........................',
      '........................',
      '........................',
    ],
    // Frame 3: Downstroke (Wings arched down pushing air)
    [
      '........................',
      '........................',
      '............WWWWW.......',
      '..SSWWWWWWWWWWWWEWWYYO..',
      '.SSuuWWWWWWWWWWWWWYY....',
      '...sssssssssssss........',
      '.....SWWW...WWWW........',
      '....SWW......WWWW.......',
      '...SSW........WWW.......',
      '...SW..........WWW......',
      '..SS............WW......',
      '..S..............WK.....',
      '.DS...............K.....',
      '.DK.....................',
      '..K.....................',
    ]
  ];

  private static drawSeagullFrame(ctx: CanvasRenderingContext2D, ox: number, frame: number) {
    const matrix = this.SEAGULL_FRAMES[frame % this.SEAGULL_FRAMES.length];
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch !== '.') {
          const color = this.SEAGULL_PALETTE[ch];
          if (color) {
            this.drawPixelRect(ctx, ox + c, r, 1, 1, color);
          }
        }
      }
    }
  }

  private static drawCatFrame(ctx: CanvasRenderingContext2D, ox: number, frame: number) {
    if (frame === 0 || frame === 1) {
      // Sleeping Loaf
      this.drawPixelRect(ctx, ox + 3, 16, 20, 3, 'rgba(15, 23, 42, 0.4)');
      this.drawPixelRect(ctx, ox + 4, 8, 16, 9, '#ea580c');
      this.drawPixelRect(ctx, ox + 6, 6, 12, 3, '#ea580c');
      this.drawPixelRect(ctx, ox + 12, 11, 6, 6, '#fef3c7');
      this.drawPixelRect(ctx, ox + 8, 7, 2, 6, '#9a3412');
      this.drawPixelRect(ctx, ox + 14, 7, 2, 4, '#9a3412');
      this.drawPixelRect(ctx, ox + 16, 9, 7, 7, '#ea580c');
      this.drawPixelRect(ctx, ox + 17, 7, 2, 2, '#ea580c');
      this.drawPixelRect(ctx, ox + 21, 7, 2, 2, '#ea580c');
      this.drawPixelRect(ctx, ox + 18, 8, 1, 1, '#f472b6');
      this.drawPixelRect(ctx, ox + 22, 8, 1, 1, '#f472b6');
      this.drawPixelRect(ctx, ox + 19, 12, 2, 1, '#431407');
      if (frame === 0) {
        this.drawPixelRect(ctx, ox + 2, 13, 3, 3, '#ea580c');
      } else {
        this.drawPixelRect(ctx, ox + 1, 9, 3, 3, '#ea580c');
        this.drawPixelRect(ctx, ox + 2, 12, 3, 4, '#ea580c');
        this.drawPixelRect(ctx, ox + 1, 8, 2, 2, '#fef3c7');
      }
    } else if (frame === 2) {
      // Sitting upright
      this.drawPixelRect(ctx, ox + 3, 16, 18, 3, 'rgba(15, 23, 42, 0.4)');
      this.drawPixelRect(ctx, ox + 6, 8, 10, 9, '#ea580c');
      this.drawPixelRect(ctx, ox + 9, 10, 5, 7, '#fef3c7');
      this.drawPixelRect(ctx, ox + 7, 3, 9, 7, '#ea580c');
      this.drawPixelRect(ctx, ox + 7, 1, 2, 2, '#ea580c');
      this.drawPixelRect(ctx, ox + 13, 1, 2, 2, '#ea580c');
      this.drawPixelRect(ctx, ox + 8, 2, 1, 1, '#f472b6');
      this.drawPixelRect(ctx, ox + 14, 2, 1, 1, '#f472b6');
      this.drawPixelRect(ctx, ox + 8, 6, 2, 2, '#10b981');
      this.drawPixelRect(ctx, ox + 12, 6, 2, 2, '#10b981');
      this.drawPixelRect(ctx, ox + 9, 6, 1, 1, '#047857');
      this.drawPixelRect(ctx, ox + 13, 6, 1, 1, '#047857');
      this.drawPixelRect(ctx, ox + 10, 8, 2, 1, '#f472b6');
      this.drawPixelRect(ctx, ox + 7, 16, 3, 2, '#fef3c7');
      this.drawPixelRect(ctx, ox + 12, 16, 3, 2, '#fef3c7');
      this.drawPixelRect(ctx, ox + 15, 14, 3, 3, '#ea580c');
      this.drawPixelRect(ctx, ox + 17, 12, 2, 3, '#fef3c7');
    } else {
      // Happy Stretch & Purr
      this.drawPixelRect(ctx, ox + 2, 16, 22, 3, 'rgba(15, 23, 42, 0.4)');
      this.drawPixelRect(ctx, ox + 8, 6, 10, 7, '#ea580c');
      this.drawPixelRect(ctx, ox + 12, 8, 4, 6, '#fef3c7');
      this.drawPixelRect(ctx, ox + 18, 14, 6, 3, '#ea580c');
      this.drawPixelRect(ctx, ox + 22, 15, 3, 2, '#fef3c7');
      this.drawPixelRect(ctx, ox + 4, 9, 5, 8, '#ea580c');
      this.drawPixelRect(ctx, ox + 16, 9, 7, 6, '#ea580c');
      this.drawPixelRect(ctx, ox + 17, 7, 2, 2, '#ea580c');
      this.drawPixelRect(ctx, ox + 21, 7, 2, 2, '#ea580c');
      this.drawPixelRect(ctx, ox + 18, 11, 2, 1, '#431407');
      this.drawPixelRect(ctx, ox + 21, 11, 2, 1, '#431407');
      this.drawPixelRect(ctx, ox + 2, 3, 3, 8, '#ea580c');
      this.drawPixelRect(ctx, ox + 1, 2, 2, 2, '#fef3c7');
    }
  }

  private static drawTelescope(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawPixelRect(ctx, ox + 6, oy + 40, 24, 4, 'rgba(15, 23, 42, 0.45)');
    this.drawPixelLine(ctx, ox + 18, oy + 22, ox + 7, oy + 41, '#1e293b', 3);
    this.drawPixelLine(ctx, ox + 18, oy + 22, ox + 18, oy + 42, '#334155', 2);
    this.drawPixelLine(ctx, ox + 18, oy + 22, ox + 29, oy + 41, '#0f172a', 3);
    this.drawPixelRect(ctx, ox + 15, oy + 19, 7, 5, '#d97706');
    this.drawPixelRect(ctx, ox + 16, oy + 17, 5, 3, '#f59e0b');
    this.drawPixelLine(ctx, ox + 8, oy + 25, ox + 32, oy + 10, '#f59e0b', 6);
    this.drawPixelLine(ctx, ox + 10, oy + 24, ox + 31, oy + 11, '#fbbf24', 2);
    this.drawPixelLine(ctx, ox + 7, oy + 26, ox + 33, oy + 9, '#b45309', 1);
    this.drawPixelRect(ctx, ox + 30, oy + 7, 5, 6, '#38bdf8');
    this.drawPixelRect(ctx, ox + 32, oy + 8, 3, 4, '#e0f2fe');
    this.drawPixelRect(ctx, ox + 5, oy + 25, 4, 4, '#1e293b');
    this.drawPixelRect(ctx, ox + 3, oy + 26, 3, 2, '#475569');
  }

  private static createSpeechBubble(scene: Phaser.Scene, textureKey: string, text: string) {
    const isWatch = text === 'WATCH';
    const iconW = isWatch ? 12 : 0;
    const fullText = `K · ${text}`;
    const textW = fullText.length * 5 + iconW;
    const bubbleW = Math.max(62, 20 + textW);
    const bubbleH = 22;
    const canvas = scene.textures.createCanvas(textureKey, bubbleW, bubbleH);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;

      // Dark Navy / Black outer border (#0f172a)
      this.drawPixelRect(ctx, 2, 0, bubbleW - 4, 16, '#0f172a');
      this.drawPixelRect(ctx, 0, 2, bubbleW, 12, '#0f172a');

      // Deep Navy Blue Interior (#1e3a8a) matching reference sheet UI
      this.drawPixelRect(ctx, 2, 1, bubbleW - 4, 14, '#1e3a8a');
      this.drawPixelRect(ctx, 1, 2, bubbleW - 2, 12, '#1e3a8a');

      // Top subtle cyan highlight bevel (#38bdf8)
      this.drawPixelLine(ctx, 3, 1, bubbleW - 4, 1, '#38bdf8');

      // Downward pointer tail pointing at character's head
      const tailX = Math.floor(bubbleW / 2);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(tailX - 4, 15);
      ctx.lineTo(tailX + 4, 15);
      ctx.lineTo(tailX, 21);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(tailX - 3, 15);
      ctx.lineTo(tailX + 3, 15);
      ctx.lineTo(tailX, 19);
      ctx.closePath();
      ctx.fill();

      // Camera / Projector Icon for WATCH
      let textStartX = 8;
      if (isWatch) {
        this.drawPixelRect(ctx, 7, 5, 8, 6, '#ffffff');
        this.drawPixelRect(ctx, 8, 4, 6, 1, '#ffffff');
        this.drawPixelRect(ctx, 10, 6, 2, 2, '#1e3a8a');
        textStartX = 18;
      }

      // Crisp White Pixel Text: "E · PARK", "E · RIDE", "E · WATCH", etc.
      this.renderPixelText4x6(ctx, fullText, textStartX, 4, '#ffffff', 1);

      canvas.refresh();
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
