import Phaser from 'phaser';
import { WalkingController } from '../player/WalkingController';
import { useWorldStore } from '../../store/useWorldStore';
import { pixelSound } from '../audio/PixelSoundManager';

/**
 * PrintHouseScene.ts
 * 
 * 100% PURE PROCEDURAL GBA PIXEL ART PLAYABLE INTERIOR SCENE (640 x 256)
 * - Camera Zoom: 1.4 (Identical scale to WorldScene exterior!)
 * - Architectural Cutaway / Dollhouse Perspective:
 *   - Room height: 160px (from floor y:224 to roof y:64) strictly matches exterior building height!
 *   - Above the roof (y: 0..64) is the bright Mediterranean blue sky with drifting clouds!
 *   - Rooftop terracotta coping, stone cornice, and cascading ivy crown the building.
 * - Hero Interactive Object:
 *   - GRAND, MAGNIFICENT OPEN MANUSCRIPT TOME (98px wide x 32px high) resting on an angled lectern!
 *   - Thick parchment pages with gold rim, curled leaves, and ruby red silk bookmark ribbon draped over desk edge.
 *   - Pulsing golden halo aura + floating badge "E · 查看文案作品"!
 * - Exact layout & furniture density directly from reference art:
 *   Left tall ficus tree with saucer, 5-tier packed bookcase with globe & ivy, writer's desk with laptop & banker lamp,
 *   Center panoramic 3-bay arched sea window, terracotta sill flower boxes, centerpiece reading table with book stacks,
 *   Right calligraphy plaque "文字的自我修养" with hanging ivy, clipboards, vintage mechanical typewriter,
 *   monstera planter with split leaves, far right bookshelves and tall houseplant.
 * - Flooring & Edge:
 *   Warm honed cream stone pavers, central cyan-blue & white geometric diamond runner rug,
 *   Blue & white checkered ceramic border tiles along the platform cutaway edge, dark steel girder beam beneath.
 * - Warm ambient lighting:
 *   4 industrial pendant lamps with amber illumination cones, laptop screen glow, banker's lamp.
 */
export class PrintHouseScene extends Phaser.Scene {
  private walker!: WalkingController;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;

  // Dynamic sky & window vista elements
  private outdoorClouds: { x: number; y: number; speed: number; width: number }[] = [];
  private windowClouds: { x: number; y: number; speed: number; width: number }[] = [];
  private dynamicGraphics!: Phaser.GameObjects.Graphics;

  // Floating interaction badges
  private deskPromptBadge!: Phaser.GameObjects.Container;
  private doorPromptBadge!: Phaser.GameObjects.Container;
  private bookAuraGlow!: Phaser.GameObjects.Arc;

  private lastActionTime = 0;
  private readonly groundY = 224;
  private readonly roomWidth = 640;
  private readonly roomHeight = 256;

  constructor() {
    super('PrintHouseScene');
  }

  create() {
    // 1. Setup Camera Zoom & Viewport (Zoom 1.4 = exact 1:1 scale with outdoor world!)
    this.cameras.main.setZoom(1.4);
    this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.fadeIn(250, 0, 0, 0);

    // 2. Generate Dense Room Textures matching authentic reference art
    this.generateInteriorTextures();

    // 3. Layer 1: Dynamic Sky (above roof) & Window Ocean Vista (behind window panes)
    this.dynamicGraphics = this.add.graphics();
    this.dynamicGraphics.setDepth(1);

    // Outdoor clouds (above roof line y: 0..58)
    this.outdoorClouds = [
      { x: 50, y: 20, speed: 6, width: 48 },
      { x: 220, y: 15, speed: 8, width: 60 },
      { x: 400, y: 24, speed: 7, width: 52 },
      { x: 560, y: 18, speed: 9, width: 54 }
    ];

    // Window vista clouds (behind window panes x: 246..394, y: 78..162)
    this.windowClouds = [
      { x: 258, y: 94, speed: 4, width: 28 },
      { x: 312, y: 88, speed: 6, width: 36 },
      { x: 368, y: 98, speed: 5, width: 26 }
    ];

    // 4. Layer 2: Main Studio Architecture & Dense Furnishings
    const roomBg = this.add.image(0, 0, 'tex_print_house_room_v6');
    roomBg.setOrigin(0, 0);
    roomBg.setDepth(5);

    // 5. Layer 3: Glowing Halo around the Grand Centerpiece Tome (x: 320, y: 172)
    this.bookAuraGlow = this.add.circle(320, 172, 26, 0xfde047, 0.35);
    this.bookAuraGlow.setDepth(6);
    this.tweens.add({
      targets: this.bookAuraGlow,
      scaleX: 1.5,
      scaleY: 1.3,
      alpha: 0.12,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 6. Layer 4: Player Walking Character
    // Spawns near the doorway at x = 90, grounded on the stone floor at groundY = 224
    this.walker = new WalkingController(this, 90, this.groundY);
    this.walker.setVisible(true);

    // Camera smoothly follows player across the 640px wide studio
    this.cameras.main.startFollow(this.walker.sprite, true, 0.08, 0.08);

    // 7. Layer 5: In-Game Floating Badges matching Reference Art
    // Desk Badge: "E · 查看文案作品"
    this.deskPromptBadge = this.createFloatingBadge(
      320,
      134,
      'E · 查看文案作品',
      '#0284c7',
      '#38bdf8'
    );
    this.deskPromptBadge.setDepth(30);
    this.deskPromptBadge.setVisible(false);

    // Doorway Badge: "E · 走出工坊"
    this.doorPromptBadge = this.createFloatingBadge(
      55,
      138,
      'E · 走出工坊',
      '#0f172a',
      '#38bdf8'
    );
    this.doorPromptBadge.setDepth(30);
    this.doorPromptBadge.setVisible(false);

    // 8. Setup Keyboard Inputs
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    // 9. Global Event Listeners for Store synchronization
    const onExitEvent = () => this.handleExitToStreet();
    window.addEventListener('exit-print-house-interior', onExitEvent);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('exit-print-house-interior', onExitEvent);
    });
  }

  private createFloatingBadge(
    x: number,
    y: number,
    text: string,
    bgColor: string,
    borderColor: string
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const padX = 8;
    const padY = 4;
    const textObj = this.add.text(0, -1, text, {
      fontFamily: "'Press Start 2P', 'Cubic 11', 'Zpix', monospace, sans-serif",
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    textObj.setOrigin(0.5, 0.5);

    const w = textObj.width + padX * 2;
    const h = textObj.height + padY * 2;

    const bg = this.add.graphics();
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(bgColor).color, 0.96);
    bg.lineStyle(1.5, Phaser.Display.Color.HexStringToColor(borderColor).color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);

    // Downward triangular pointer caret
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(bgColor).color, 0.96);
    bg.beginPath();
    bg.moveTo(-3.5, h / 2);
    bg.lineTo(3.5, h / 2);
    bg.lineTo(0, h / 2 + 3.5);
    bg.closePath();
    bg.fill();

    container.add([bg, textObj]);
    return container;
  }

  update(time: number, delta: number) {
    const store = useWorldStore.getState();
    const dt = delta / 1000;

    // 1. Render Sky & Window Live Vista (Outdoor clouds above roof, and sea waves through window)
    this.renderDynamicAtmosphere(time, dt);

    // 2. Handle Player Input & Movement
    const vInput = store.virtualInput;
    const leftPressed = (this.cursors?.left?.isDown ?? false) || (this.keyA?.isDown ?? false) || vInput.left;
    const rightPressed = (this.cursors?.right?.isDown ?? false) || (this.keyD?.isDown ?? false) || vInput.right;
    const actionPressed = (this.keyE?.isDown ?? false) || vInput.action;
    const escPressed = this.keyEsc?.isDown ?? false;

    // When the Book UI modal is open, freeze character walking so player can browse works
    if (store.isPrintHouseBookOpen) {
      this.walker.update(delta, false, false);
      this.deskPromptBadge.setVisible(false);
      this.doorPromptBadge.setVisible(false);

      if (escPressed && time - this.lastActionTime > 300) {
        this.lastActionTime = time;
        store.setPrintHouseBookOpen(false);
      }
      return;
    }

    // Walking movement within interior room boundaries (x: 40..600)
    this.walker.update(delta, leftPressed, rightPressed);
    if (this.walker.x < 40) this.walker.x = 40;
    if (this.walker.x > 600) this.walker.x = 600;
    this.walker.setPosition(this.walker.x, this.groundY);

    // 3. Proximity Interaction Checks
    const distToDesk = Math.abs(this.walker.x - 320);
    const nearDesk = distToDesk < 65;
    const nearDoor = this.walker.x < 75;

    if (nearDesk) {
      // Floating prompt badge above the Grand Tome: [E · 查看文案作品]
      this.deskPromptBadge.setPosition(320, 132 + Math.sin(time * 0.006) * 2.5);
      this.deskPromptBadge.setVisible(true);
      this.doorPromptBadge.setVisible(false);

      if (actionPressed && time - this.lastActionTime > 350) {
        this.lastActionTime = time;
        pixelSound.playInteract();
        store.setPrintHouseBookOpen(true);
      }
    } else if (nearDoor) {
      // Floating prompt badge above left doorway: [E · 走出工坊]
      this.doorPromptBadge.setPosition(55, 138 + Math.sin(time * 0.006) * 2.5);
      this.doorPromptBadge.setVisible(true);
      this.deskPromptBadge.setVisible(false);

      if ((actionPressed || escPressed) && time - this.lastActionTime > 350) {
        this.lastActionTime = time;
        this.handleExitToStreet();
      }
    } else {
      this.deskPromptBadge.setVisible(false);
      this.doorPromptBadge.setVisible(false);

      if (escPressed && time - this.lastActionTime > 350) {
        this.lastActionTime = time;
        this.handleExitToStreet();
      }
    }
  }

  private handleExitToStreet() {
    pixelSound.playInteract();
    this.cameras.main.fadeOut(200, 0, 0, 0);

    this.time.delayedCall(200, () => {
      this.scene.stop('PrintHouseScene');
      this.scene.resume('WorldScene');
      useWorldStore.getState().exitPrintHouseInterior();
    });
  }

  /**
   * Dynamic Atmosphere:
   * 1. Outdoor Sunny Sky with Drifting Clouds above the roof (y: 0..62)
   * 2. Window Vista (Ocean waves, clouds, hillside village) behind window panes (y: 78..162)
   */
  private renderDynamicAtmosphere(time: number, dt: number) {
    const g = this.dynamicGraphics;
    g.clear();

    const w = this.roomWidth;

    // =========================================================================
    // 1. OUTDOOR SKY ABOVE ROOFTOP (y: 0..62 across entire 640px width)
    // =========================================================================
    g.fillGradientStyle(0x38bdf8, 0x38bdf8, 0xbae6fd, 0xbae6fd, 1);
    g.fillRect(0, 0, w, 62);

    // Drifting Outdoor Clouds
    g.fillStyle(0xffffff, 0.92);
    for (const c of this.outdoorClouds) {
      c.x += c.speed * dt;
      if (c.x > w + 40) {
        c.x = -c.width;
      }
      g.fillEllipse(c.x, c.y, c.width, 12);
      g.fillEllipse(c.x + 6, c.y - 4, c.width * 0.7, 10);
      g.fillEllipse(c.x - 8, c.y + 2, c.width * 0.55, 8);
    }

    // =========================================================================
    // 2. WINDOW VISTA BEHIND BAY WINDOW (x: 246..394, y: 78..162)
    // =========================================================================
    const wx1 = 246;
    const wy1 = 78;
    const ww = 148;
    const wh = 84;

    // Window Sky Gradient
    g.fillGradientStyle(0x0ea5e9, 0x0ea5e9, 0xbae6fd, 0xbae6fd, 1);
    g.fillRect(wx1, wy1, ww, wh);

    // Window Clouds
    g.fillStyle(0xffffff, 0.9);
    for (const c of this.windowClouds) {
      c.x += c.speed * dt;
      if (c.x > wx1 + ww + 15) {
        c.x = wx1 - c.width;
      }
      g.fillEllipse(c.x, c.y, c.width, 8);
      g.fillEllipse(c.x + 3, c.y - 2, c.width * 0.65, 6);
    }

    // Distant Mountain Headland
    g.fillStyle(0x64748b, 1);
    g.beginPath();
    g.moveTo(wx1, 116);
    g.lineTo(wx1 + 36, 104);
    g.lineTo(wx1 + 75, 118);
    g.lineTo(wx1 + 75, wy1 + wh);
    g.lineTo(wx1, wy1 + wh);
    g.closePath();
    g.fillPath();

    // Turquoise Mediterranean Ocean
    g.fillGradientStyle(0x0284c7, 0x0284c7, 0x38bdf8, 0x38bdf8, 1);
    g.fillRect(wx1, 116, ww, wy1 + wh - 116);

    // Ocean Wave Ripples
    g.fillStyle(0xffffff, 0.78);
    const waveSin = Math.sin(time * 0.003) * 2;
    for (const [rx, ry, rw] of [
      [254, 122, 22],
      [288, 127, 28],
      [335, 124, 25],
      [268, 136, 26],
      [314, 140, 30],
      [354, 134, 22]
    ]) {
      g.fillRect(rx + waveSin, ry, rw, 1);
    }

    // Sunlit Terracotta Coastal Village on Right Hillside
    for (const [hx, hy] of [
      [348, 110], [362, 104], [376, 108],
      [356, 120], [370, 116], [382, 118]
    ]) {
      // White wall
      g.fillStyle(0xffffff, 1);
      g.fillRect(hx, hy, 12, 10);
      g.fillStyle(0xcbd5e1, 1);
      g.fillRect(hx + 9, hy + 2, 3, 8);
      // Blue window
      g.fillStyle(0x0284c7, 1);
      g.fillRect(hx + 3, hy + 3, 4, 4);
      // Terracotta pitched roof
      g.fillStyle(0xea580c, 1);
      g.beginPath();
      g.moveTo(hx - 2, hy);
      g.lineTo(hx + 6, hy - 5);
      g.lineTo(hx + 14, hy);
      g.closePath();
      g.fillPath();
      // Green cypress tree
      g.fillStyle(0x15803d, 1);
      g.beginPath();
      g.moveTo(hx - 4, hy + 10);
      g.lineTo(hx - 1, hy - 4);
      g.lineTo(hx + 1, hy + 10);
      g.closePath();
      g.fillPath();
    }
  }

  /**
   * Pure procedural pixel art generation for room interior (640 x 256).
   * Exact authentic match to exterior GBA architecture style, palette, and reference art density!
   */
  private generateInteriorTextures() {
    if (this.textures.exists('tex_print_house_room_v6')) {
      this.textures.remove('tex_print_house_room_v6');
    }

    const w = this.roomWidth;
    const h = this.roomHeight;
    const groundY = this.groundY; // 224
    const roofY = 64;             // Room height = 160px (matching exterior building height!)

    const c = this.textures.createCanvas('tex_print_house_room_v6', w, h);
    if (!c) return;

    const ctx = c.getContext();
    ctx.imageSmoothingEnabled = false;

    // Rich warm Mediterranean plaster wall palette
    const cWallCream = '#f7f0e0';
    const cWallShade = '#f2e8d3';
    const cWoodOak = '#92400e';
    const cWoodDark = '#78350f';
    const cWoodHighlight = '#d97706';
    const cSlateFrame = '#1e293b';

    // =========================================================================
    // 1. SKY AREA IS CLEARED FOR DYNAMIC SKY GRAPHICS (y: 0..62)
    // =========================================================================
    ctx.clearRect(0, 0, w, 62);

    // =========================================================================
    // 2. ROOFTOP CORNICE, PARAPET & CASING (y: 52..64)
    // =========================================================================
    // Terracotta Roof Coping Cap (matching exterior Print House rooftop!)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(0, 52, w, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 52, w, 1); // sunny highlight
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, 55, w, 1); // shadow line

    // Carved Stone Cornice Band
    ctx.fillStyle = '#faf6ec';
    ctx.fillRect(0, 56, w, 4);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 60, w, 3);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 63, w, 1);

    // Overhanging Green Ivy & Blossoms spilling over roof edge
    for (let ix = 12; ix < w; ix += 34) {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(ix, 58, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(ix - 3, 56, 3, 3);
      ctx.fillRect(ix + 2, 57, 2, 2);
      if (ix % 68 === 0) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(ix - 1, 58, 2, 2);
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(ix + 1, 58, 2, 2);
      }
    }

    // =========================================================================
    // 3. ROOM INTERIOR BACK WALL (y: 64..224, Height = 160px!)
    // =========================================================================
    ctx.fillStyle = cWallCream;
    ctx.fillRect(0, roofY, w, groundY - roofY);

    // Subtle horizontal plaster render lines
    ctx.fillStyle = cWallShade;
    for (let y = roofY + 8; y < groundY; y += 6) {
      ctx.fillRect(0, y, w, 1);
    }

    // Vertical plaster panel divisions every ~120px
    for (let px = 120; px < w; px += 120) {
      ctx.fillStyle = cWallShade;
      ctx.fillRect(px, roofY, 1, groundY - roofY);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(px + 1, roofY, 1, groundY - roofY);
    }

    // Chair rail / wainscoting line at y: 150
    ctx.fillStyle = cWoodDark;
    ctx.fillRect(0, 150, w, 2);
    ctx.fillStyle = cWoodOak;
    ctx.fillRect(0, 151, w, 1);

    // Heavy Industrial Steel I-Beam underneath ceiling (y: 64..72)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, roofY, w, 8);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, roofY + 1, w, 2);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, roofY + 7, w, 1);

    // Steel Rivets along main beam
    for (let rx = 12; rx < w; rx += 24) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(rx, roofY + 1, 4, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(rx + 1, roofY + 1, 2, 2);
      
      // Second row
      ctx.fillStyle = '#475569';
      ctx.fillRect(rx + 12, roofY + 4, 4, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(rx + 13, roofY + 4, 2, 2);
    }

    // Electrical Conduit Pipe with support brackets (y: 74..76)
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, roofY + 10, w, 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, roofY + 10, w, 1);
    for (let px = 28; px < w; px += 48) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px - 1, roofY + 8, 3, 5);
    }

    // Vertical industrial pipes on corners
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, roofY + 8, 3, groundY - roofY - 8);
    ctx.fillRect(w - 7, roofY + 8, 3, groundY - roofY - 8);

    // =========================================================================
    // 4. HONED STONE FLOOR & CUTAWAY STAGE PLATFORM (y: 224..256)
    // =========================================================================
    // Honed Stone Pavers Floor (Warm buff limestone with staggered grout lines)
    ctx.fillStyle = '#f8f5ee';
    ctx.fillRect(0, groundY, w, 16);
    ctx.fillStyle = '#ede5d5';
    ctx.fillRect(0, groundY + 8, w, 8);

    // Horizontal tile grout line
    ctx.fillStyle = '#cfc5b3';
    ctx.fillRect(0, groundY + 8, w, 1);
    // Vertical tile grout lines (staggered masonry bond)
    for (let fx = 0; fx < w; fx += 28) {
      ctx.fillRect(fx, groundY, 1, 8);
      ctx.fillRect(fx + 14, groundY + 8, 1, 8);
    }

    // Dark Wood Skirting / Baseboard
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, groundY - 3, w, 3);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, groundY - 1, w, 1);

    // -------------------------------------------------------------------------
    // Center Woven Mediterranean Blue Geometric Runner Rug (x: 215..425, y: 224..239)
    // Intricately matching reference image with cyan & white diamond tile motif!
    // -------------------------------------------------------------------------
    const rugX = 215;
    const rugW = 210;
    const rugH = 15;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(rugX, groundY, rugW, rugH);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(rugX + 2, groundY + 1, rugW - 4, rugH - 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(rugX + 3, groundY + 2, rugW - 6, rugH - 4);
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(rugX + 4, groundY + 3, rugW - 8, rugH - 6);

    // Intricate geometric diamond mosaic pattern inside rug
    for (let rx = rugX + 7; rx < rugX + rugW - 7; rx += 10) {
      // White diamond outline
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(rx + 4, groundY + 4);
      ctx.lineTo(rx + 8, groundY + 7.5);
      ctx.lineTo(rx + 4, groundY + 11);
      ctx.lineTo(rx, groundY + 7.5);
      ctx.closePath();
      ctx.fill();

      // Cyan diamond center
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(rx + 4, groundY + 5.5);
      ctx.lineTo(rx + 6.5, groundY + 7.5);
      ctx.lineTo(rx + 4, groundY + 9.5);
      ctx.lineTo(rx + 1.5, groundY + 7.5);
      ctx.closePath();
      ctx.fill();
    }

    // Fringe tassels on left and right ends of the rug
    for (let fy = groundY + 2; fy < groundY + rugH - 2; fy += 2) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rugX - 2, fy, 2, 1);
      ctx.fillRect(rugX + rugW, fy, 2, 1);
    }

    // -------------------------------------------------------------------------
    // Cutaway Stage Edge: Mediterranean Blue & White Ceramic Border Tiles (y: 240..246)
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, groundY + 16, w, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, groundY + 16, w, 1);
    for (let tx = 0; tx < w; tx += 8) {
      // Alternating blue & white ceramic tiles
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tx, groundY + 17, 4, 4);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(tx + 4, groundY + 17, 4, 4);
      // Center tiny diamond dot
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(tx + 1, groundY + 18, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tx + 5, groundY + 18, 2, 2);
    }

    // Heavy Industrial Steel Girder Support Beam Under Stage (y: 246..256)
    ctx.fillStyle = '#092548';
    ctx.fillRect(0, groundY + 22, w, 10);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, groundY + 22, w, 1); // metallic highlight
    ctx.fillStyle = '#051426';
    ctx.fillRect(0, groundY + 31, w, 1);
    for (let bx = 0; bx < w; bx += 32) {
      ctx.fillStyle = '#051426';
      ctx.fillRect(bx, groundY + 23, 3, 9);
      // Girder rivet studs
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx + 1, groundY + 24, 1, 1);
      ctx.fillRect(bx + 1, groundY + 29, 1, 1);
    }

    // =========================================================================
    // 5. CENTER PANORAMIC BAY WINDOW & SILL (x: 244..396, y: 78..162)
    // =========================================================================
    // Clear area for live dynamic ocean/sky vista
    ctx.clearRect(246, 78, 148, 84);

    // Outer dark slate window frame
    ctx.strokeStyle = cSlateFrame;
    ctx.lineWidth = 3;
    ctx.strokeRect(244, 77, 152, 86);

    // 3-bay vertical mullions
    ctx.fillStyle = cSlateFrame;
    ctx.fillRect(294, 77, 3, 86);
    ctx.fillRect(344, 77, 3, 86);

    // Arch tops for the 3 window panes
    ctx.fillStyle = cSlateFrame;
    for (let wx of [270, 320, 370]) {
      ctx.beginPath();
      ctx.arc(wx, 77, 24, 0, Math.PI, false);
      ctx.fill();
    }
    // Curtain rod
    ctx.fillStyle = '#475569';
    ctx.fillRect(234, 76, 172, 2);
    ctx.fillStyle = '#1e293b';
    for(let kx of [236, 320, 402]) {
      ctx.fillRect(kx, 75, 2, 4);
    }

    // Sturdy Window Sill Ledge (y: 161..165)
    ctx.fillStyle = '#334155';
    ctx.fillRect(238, 161, 164, 5);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(238, 161, 164, 1);

    // Terracotta Flower Planter Boxes & Books on Window Sill
    for (const [px, pc] of [
      [248, '#ea580c'],
      [306, '#b45309'],
      [366, '#ea580c']
    ] as [number, string][]) {
      ctx.fillStyle = pc;
      ctx.fillRect(px, 153, 26, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 1, 152, 28, 1);
      // Bushy foliage & floral blooms
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.ellipse(px + 13, 147, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(px + 13, 148, 17, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(px + 11, 145, 12, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Blossom dots
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px + 5, 147, 2, 2);
      ctx.fillRect(px + 17, 148, 2, 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 11, 145, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 20, 146, 2, 2);
      ctx.fillStyle = '#a855f7'; // Purple
      ctx.fillRect(px + 8, 143, 2, 2);
      ctx.fillStyle = '#ffffff'; // White
      ctx.fillRect(px + 14, 142, 2, 2);
    }

    // Stacked books on window sill between planters
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(280, 157, 12, 4);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(281, 153, 10, 4);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(340, 157, 14, 4);

    // =========================================================================
    // 6. LEFT WING: CORNER PIER, LANTERN & TALL FICUS TREE (x: 0..48)
    // =========================================================================
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, roofY, 12, groundY - roofY);
    ctx.fillStyle = '#334155';
    ctx.fillRect(10, roofY, 2, groundY - roofY);

    // Wall Lantern
    ctx.fillStyle = '#d97706';
    ctx.fillRect(14, 88, 4, 3);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(13, 91, 6, 8);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(13, 91, 6, 8);

    // Tall Ficus Tree in Terracotta Planter with Saucer (x: 18..46, y: 110..224)
    // Saucer
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(20, 222, 28, 2);
    // Pot
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(22, 198);
    ctx.lineTo(44, 198);
    ctx.lineTo(41, 222);
    ctx.lineTo(25, 222);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(20, 196, 26, 3);
    // Tree Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(31, 138, 4, 60);
    // Lush Layered Foliage Canopies
    for (const [fy, r] of [
      [180, 16.8], [162, 19.2], [144, 20.4], [126, 18], [112, 15.6], [100, 14], [96, 12]
    ]) {
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.ellipse(33, fy + 2, r, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(33, fy, r * 0.9, r * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(31, fy - 2, r * 0.7, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.fillRect(32, fy - 4, 3, 2);
    }
    // Small herb/succulent pot beside tree
    ctx.fillStyle = '#b45309';
    ctx.fillRect(44, 214, 8, 10);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(48, 212, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // =========================================================================
    // 7. BOOKSHELF ZONE: 5-TIER PACKED OAK BOOKCASE (x: 52..144, y: 64..224)
    // =========================================================================
    ctx.fillStyle = cWoodOak;
    ctx.fillRect(52, 64, 92, 160);
    ctx.fillStyle = cWoodHighlight;
    ctx.fillRect(52, 64, 92, 3);
    ctx.fillStyle = cWoodDark;
    ctx.fillRect(52, 64, 4, 160);
    ctx.fillRect(140, 64, 4, 160);

    // Shelves (ys: 96, 128, 160, 192, 222)
    const shelfYs = [96, 128, 160, 192, 222];
    for (const sy of shelfYs) {
      ctx.fillStyle = cWoodDark;
      ctx.fillRect(56, sy, 84, 3);
      ctx.fillStyle = cWoodHighlight;
      ctx.fillRect(56, sy, 84, 1);
    }

    // Top shelf trailing plant
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(64, 76, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let vy = 78; vy <= 140; vy += 9) {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(51, vy, 2, 2);
    }
    // Tier 1 Books (y: 72..96)
    for (const [bx, bw, bc] of [
      [76, 7, '#b91c1c'], [84, 6, '#1e3a8a'], [91, 8, '#ca8a04'],
      [100, 7, '#15803d'], [108, 9, '#7c3aed'], [118, 8, '#ea580c'], [127, 7, '#0284c7']
    ] as [number, number, string][]) {
      ctx.fillStyle = bc;
      ctx.fillRect(bx, 73, bw, 23);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(bx + 1, 74, bw - 2, 2);
    }

    // Tier 2 (y: 100..128): Antique Blue Globe & Hardcover Books
    ctx.fillStyle = '#78350f';
    ctx.fillRect(68, 116, 3, 12);
    ctx.beginPath();
    ctx.arc(69, 110, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(67, 108, 4, 3);
    for (const [bx, bw, bc] of [
      [82, 8, '#0284c7'], [91, 7, '#16a34a'], [99, 9, '#d97706'],
      [109, 8, '#9333ea'], [118, 9, '#e11d48'], [128, 8, '#334155']
    ] as [number, number, string][]) {
      ctx.fillStyle = bc;
      ctx.fillRect(bx, 102, bw, 26);
    }

    // Tier 3 (y: 132..160): Wooden Drawers & Stacked Manuscripts
    ctx.fillStyle = '#b45309';
    ctx.fillRect(58, 136, 34, 24);
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(58, 136, 34, 24);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(73, 146, 4, 2); // brass pull
    for (const [bx, bw, bc] of [
      [96, 7, '#0f172a'], [104, 8, '#2563eb'], [113, 8, '#ea580c'],
      [122, 7, '#059669'], [130, 7, '#ca8a04']
    ] as [number, number, string][]) {
      ctx.fillStyle = bc;
      ctx.fillRect(bx, 134, bw, 26);
    }

    // Tier 4 (y: 164..192): Thick Binders & File Boxes
    for (const [bx, bw, bc] of [
      [58, 11, '#1e3a8a'], [70, 11, '#b91c1c'], [82, 10, '#15803d'],
      [93, 12, '#334155'], [106, 12, '#78350f'], [119, 10, '#d97706'], [130, 9, '#0284c7']
    ] as [number, number, string][]) {
      ctx.fillStyle = bc;
      ctx.fillRect(bx, 166, bw, 26);
    }

    // Tier 5 (y: 196..222): Storage Crates & Archive Bundles
    ctx.fillStyle = '#b45309';
    ctx.fillRect(58, 196, 36, 26);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(60, 206, 32, 2.5);
    for (const [bx, bw, bc] of [
      [100, 10, '#0f172a'], [111, 12, '#1e3a8a'], [124, 12, '#b91c1c']
    ] as [number, number, string][]) {
      ctx.fillStyle = bc;
      ctx.fillRect(bx, 196, bw, 26);
    }

    // =========================================================================
    // 8. LEFT WORKSTATION: DESK, CHAIR, LAPTOP, BANKER LAMP (x: 150..235)
    // =========================================================================
    ctx.fillStyle = cWoodOak;
    ctx.fillRect(150, 172, 76, 5);
    ctx.fillStyle = cWoodHighlight;
    ctx.fillRect(150, 172, 76, 1);
    ctx.fillStyle = cWoodDark;
    ctx.fillRect(154, 177, 4, 47);
    ctx.fillRect(218, 177, 4, 47);
    ctx.fillRect(150, 177, 76, 8); // desk drawer
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(186, 180, 4, 2); // brass pull

    // Wooden Chair (x: 172..196)
    ctx.fillStyle = cWoodDark;
    ctx.fillRect(174, 185, 18, 3.5); // seat
    ctx.fillRect(175, 188, 2.5, 36); // legs
    ctx.fillRect(189, 188, 2.5, 36);
    ctx.fillRect(175, 164, 2.5, 21); // backrest
    ctx.fillRect(189, 164, 2.5, 21);
    ctx.fillRect(174, 164, 18, 2.5);

    // Open Modern Laptop with glowing blue screen (x: 180..198)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(180, 170, 15, 2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(181, 158, 13, 12);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(182, 160, 11, 8); // glowing cyan screen
    // Ambient cyan glow reflection on desk
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(176, 172, 24, 3);

    // Green Banker's Lamp (x: 156..170)
    ctx.fillStyle = '#d97706';
    ctx.fillRect(160, 168, 6, 4); // brass base
    ctx.fillRect(162, 158, 2, 10); // neck
    ctx.fillStyle = '#15803d';
    ctx.fillRect(156, 154, 14, 6); // green glass shade
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(160, 160, 6, 2); // glowing bulb

    // Stacked Manuscripts & Pencil Cup (x: 202..218)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(202, 168, 12, 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(205, 166, 8, 1);
    ctx.fillRect(198, 169, 10, 1);
    ctx.fillRect(196, 171, 9, 1);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(216, 164, 5, 8); // pencil cup
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(217, 160, 1.5, 5);

    // Coffee Mug (x: 205, y: 167)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(205, 163, 6, 6); // mug body
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(211, 165, 2, 3); // handle

    // Wall Art Above Desk (y: 84..135)
    // Picture 1: Seaside Landscape (x: 160..192, y: 88..108)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(160, 88, 30, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(162, 90, 26, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(163, 91, 24, 8); // sky
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(163, 99, 24, 7); // sea
    // Picture 2: Blueprint (x: 196..222, y: 92..114)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(196, 92, 24, 22);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(198, 94, 20, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(201, 98, 14, 1);
    ctx.fillRect(201, 104, 14, 1);
    // Wall Hanging Planter Shelf (x: 170..215, y: 72..80)
    ctx.fillStyle = cWoodDark;
    ctx.fillRect(170, 74, 45, 2.5);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(176, 68, 10, 6);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(181, 66, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // =========================================================================
    // 9. CENTERPIECE: READING TABLE & GRAND PROMINENT TOME (x: 260..380)
    // =========================================================================
    // Solid Honey Oak Table (Table top at y: 188, chest level of 54px character!)
    ctx.fillStyle = cWoodOak;
    ctx.fillRect(260, 188, 120, 6);
    ctx.fillStyle = cWoodHighlight;
    ctx.fillRect(260, 188, 120, 1.5);
    ctx.fillStyle = cWoodDark;
    ctx.fillRect(260, 194, 120, 2);
    // Turned Table Legs
    for (const lx of [268, 364]) {
      ctx.fillStyle = cWoodDark;
      ctx.fillRect(lx, 196, 8, 28);
      ctx.fillStyle = cWoodOak;
      ctx.fillRect(lx + 2, 196, 4, 28);
    }
    // Stretcher Rung
    ctx.fillStyle = '#5c270a';
    ctx.fillRect(276, 212, 88, 3);

    // Angled Oak Lectern / Cradle (x: 268..372, y: 178..188)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(270, 178, 100, 10); // lectern back
    ctx.fillStyle = '#b45309';
    ctx.fillRect(266, 184, 108, 4); // lectern lip

    // -------------------------------------------------------------------------
    // THE GRAND, HERO OPEN MANUSCRIPT TOME (98px Wide x 32px High!)
    // Perfectly scaled: Top of book at y: 164 (head level of 54px character!)
    // -------------------------------------------------------------------------
    const bookX = 271;
    const bookY = 157;
    const bookW = 98;
    const bookH = 31;
    const pageW = 46;

    // 1. Outer Dark Leather Binding
    ctx.fillStyle = '#0c4a6e';
    ctx.beginPath();
    ctx.roundRect(bookX, bookY, bookW, bookH, 4);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(bookX + 1.5, bookY + 1.5, bookW - 3, bookH - 3, 3);
    ctx.fill();

    // 2. Multi-Layer Stacked Fanned Page Edges (showing paper thickness)
    for (let i = 2; i >= 0; i--) {
      const off = i * 1.5;
      ctx.fillStyle = i === 1 ? '#d6cbb7' : '#f1ebdc';
      ctx.beginPath();
      ctx.roundRect(bookX + 3 - off, bookY + 3 - off, bookW - 6 + off * 2, bookH - 6 + off * 2, 2);
      ctx.fill();
    }

    // 3. Left Parchment Page (x: bookX + 4 .. bookX + 4 + pageW)
    const lpGrad = ctx.createLinearGradient(bookX + 4, 0, bookX + 4 + pageW, 0);
    lpGrad.addColorStop(0, '#fefbf3');
    lpGrad.addColorStop(0.85, '#fefbf3');
    lpGrad.addColorStop(1, '#e2d5c3'); // shadow near spine
    ctx.fillStyle = lpGrad;
    ctx.beginPath();
    ctx.roundRect(bookX + 4, bookY + 3, pageW, bookH - 6, [3, 0, 0, 3]);
    ctx.fill();

    // 4. Right Parchment Page (x: bookX + 48 .. bookX + 48 + pageW)
    const rpGrad = ctx.createLinearGradient(bookX + 48, 0, bookX + 48 + pageW, 0);
    rpGrad.addColorStop(0, '#e2d5c3'); // shadow near spine
    rpGrad.addColorStop(0.15, '#fefbf3');
    rpGrad.addColorStop(1, '#fefbf3');
    ctx.fillStyle = rpGrad;
    ctx.beginPath();
    ctx.roundRect(bookX + 48, bookY + 3, pageW, bookH - 6, [0, 3, 3, 0]);
    ctx.fill();

    // 5. Center Spine Crease & Shadow
    ctx.fillStyle = '#8c7864';
    ctx.fillRect(bookX + 48, bookY + 3, 2, bookH - 6);
    ctx.fillStyle = 'rgba(140, 120, 100, 0.25)';
    ctx.fillRect(bookX + 45, bookY + 3, 3, bookH - 6);
    ctx.fillRect(bookX + 50, bookY + 3, 3, bookH - 6);

    // 6. Delicate Calligraphy Lines on Parchment Pages
    ctx.fillStyle = '#64748b';
    for (const ly of [bookY + 7, bookY + 11, bookY + 15, bookY + 19]) {
      ctx.fillRect(bookX + 8, ly, 35, 1.2);
      ctx.fillRect(bookX + 53, ly, 35, 1.2);
    }
    // Bottom poetic indentation
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(bookX + 12, bookY + 23, 27, 1);
    ctx.fillRect(bookX + 57, bookY + 23, 27, 1);

    // 7. Ruby Red Silk Bookmark Ribbon cascading gracefully over desk edge
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(bookX + 48, bookY + 4, 3, 24);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bookX + 48, bookY + 4, 1, 24); // highlight
    ctx.fillStyle = '#b91c1c';
    // Ribbon hanging down over table lip
    ctx.fillRect(bookX + 48, bookY + 28, 3, 16);
    // Notched ribbon tail (V-cut)
    ctx.beginPath();
    ctx.moveTo(bookX + 48, bookY + 44);
    ctx.lineTo(bookX + 49.5, bookY + 41);
    ctx.lineTo(bookX + 51, bookY + 44);
    ctx.lineTo(bookX + 51, bookY + 39);
    ctx.lineTo(bookX + 48, bookY + 39);
    ctx.closePath();
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    // Stacked hardcover books under table beside legs (matching reference image!)
    // Left stack under table (x: 264..282)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(264, 218, 18, 4);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(265, 214, 16, 4);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(266, 210, 14, 4);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(267, 206, 12, 4);

    // Right stack under table (x: 358..376)
    ctx.fillStyle = '#334155';
    ctx.fillRect(358, 218, 18, 4);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(359, 214, 16, 4);
    ctx.fillStyle = '#9333ea';
    ctx.fillRect(360, 210, 14, 4);

    // =========================================================================
    // 10. RIGHT WORKSTATION: CALLIGRAPHY, TYPEWRITER & MONSTERA (x: 410..550)
    // =========================================================================
    // Majestic Calligraphy Plaque: 《文字的自我修养》 (x: 418..532, y: 74..104)
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(418, 74, 114, 30);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.strokeRect(418, 74, 114, 30);
    ctx.fillStyle = '#b45309';
    ctx.strokeRect(420, 76, 110, 26);
    // Red seal stamp on right
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(520, 82, 6, 6);
    // Chinese Calligraphy text: 文字的自我修养
    ctx.fillStyle = '#0f172a';
    ctx.font = "bold 11px 'Cubic 11', 'Zpix', monospace, sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('文字的自我修养', 472, 89);

    // Hanging Ivy Shelf directly above plaque with cascading vines (x: 430..520, y: 64..72)
    ctx.fillStyle = cWoodDark;
    ctx.fillRect(430, 68, 90, 2.5);
    ctx.fillStyle = '#15803d';
    for (const px of [440, 475, 510]) {
      ctx.beginPath();
      ctx.ellipse(px, 66, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let vy = 68; vy < 78; vy += 4) {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(px - 1, vy, 2, 2);
      }
    }

    // Row of 4 Pinned Clipboards under plaque (x: 426..526, y: 110..144)
    for (let i = 0; i < 4; i++) {
      const cx = 428 + i * 25;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx, 110, 18, 24);
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#fef08a';
      ctx.fillRect(cx + 2, 114, 14, 18);
      ctx.fillStyle = i === 1 ? '#0284c7' : '#ef4444';
      ctx.fillRect(cx + 7, 110, 3, 3); // pin
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx + 4, 118, 10, 1);
      ctx.fillRect(cx + 4, 122, 10, 1);
    }

    // Artisan Writer's Desk & Typewriter (x: 440..518, y: 172..224)
    ctx.fillStyle = cWoodOak;
    ctx.fillRect(440, 182, 78, 5);
    ctx.fillStyle = cWoodHighlight;
    ctx.fillRect(440, 182, 78, 1);
    ctx.fillStyle = cWoodDark;
    ctx.fillRect(444, 187, 4, 37);
    ctx.fillRect(510, 187, 4, 37);

    // Mechanical Typewriter (x: 458..492)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(460, 172, 30, 10);
    ctx.fillStyle = '#334155';
    ctx.fillRect(462, 174, 26, 7);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(463, 178, 24, 2); // keys
    // Emerging typed manuscript sheet
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(468, 162, 14, 12);
    ctx.fillStyle = '#475569';
    ctx.fillRect(470, 165, 10, 1);
    ctx.fillRect(470, 168, 8, 1);

    // Stacked Manuscripts & Glass Paperweight (x: 496..512)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(496, 178, 14, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(503, 177, 3, 0, Math.PI * 2);
    ctx.fill();

    // Small potted succulent (x: 500, y: 178)
    ctx.fillStyle = '#ea580c'; // Terracotta pot
    ctx.fillRect(498, 176, 6, 4);
    ctx.fillStyle = '#22c55e'; // Green rosette
    ctx.beginPath();
    ctx.ellipse(501, 175, 4, 2, 0, 0, Math.PI*2);
    ctx.fill();

    // Small articulated arm lamp (x: 520, y: 170)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(518, 180, 8, 2); // Base
    ctx.fillRect(521, 172, 2, 8); // Arm
    ctx.fillStyle = '#475569';
    ctx.fillRect(516, 170, 8, 4); // Head
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(518, 174, 4, 1); // Bulb

    // Wooden Round Stool (x: 424..442, y: 198..224)
    ctx.fillStyle = cWoodOak;
    ctx.fillRect(424, 200, 18, 3.5);
    ctx.fillStyle = cWoodDark;
    ctx.fillRect(426, 203, 2.5, 21);
    ctx.fillRect(437, 203, 2.5, 21);

    // Floor Planter: Earthenware Pot with Broad Monstera Leaves (x: 524..556)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(528, 196);
    ctx.lineTo(552, 196);
    ctx.lineTo(548, 224);
    ctx.lineTo(532, 224);
    ctx.closePath();
    ctx.fill();
    // Broad Monstera leaves with realistic notches
    for (const [lx, ly, rx, ry, col] of [
      [538, 184, 17.5, 12.5, '#15803d'],
      [534, 172, 15, 11.25, '#16a34a'],
      [546, 166, 16.25, 12.5, '#22c55e'],
      [538, 158, 12.5, 8.75, '#4ade80']
    ] as [number, number, number, number, string][]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(lx, ly, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 3 small flower blossoms to monstera leaves
    ctx.fillStyle = '#f472b6'; // pink
    ctx.fillRect(534, 172, 2, 2);
    ctx.fillRect(546, 164, 2, 2);
    ctx.fillStyle = '#fef08a'; // yellow
    ctx.fillRect(540, 180, 2, 2);

    // =========================================================================
    // 11. FAR RIGHT ZONE: WALL SHELVES, LAMP & TALL HOUSEPLANT (x: 558..640)
    // =========================================================================
    ctx.fillStyle = cWoodOak;
    ctx.fillRect(562, 84, 52, 2.5);
    ctx.fillRect(562, 118, 52, 2.5);
    ctx.fillRect(562, 152, 52, 2.5);
    for (const [bx, bw, bc] of [
      [564, 7, '#b91c1c'], [572, 8, '#1e3a8a'], [581, 7, '#ca8a04'], [590, 8, '#15803d'],
      [564, 9, '#0284c7'], [575, 8, '#d97706'], [585, 7, '#7c3aed'],
      [564, 10, '#334155'], [576, 11, '#b91c1c'], [589, 9, '#059669']
    ] as [number, number, string][]) {
      ctx.fillStyle = bc;
      ctx.fillRect(bx, bx < 575 ? 88 : 122, bw, 18);
    }
    // Tall Floor Houseplant (x: 605..635, y: 130..224)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(610, 202, 20, 22);
    ctx.fillStyle = '#15803d';
    for (const py of [188, 170, 152, 136]) {
      ctx.beginPath();
      ctx.ellipse(620, py, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(618, py - 2, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // =========================================================================
    // 12. FOUR INDUSTRIAL PENDANT CEILING LAMPS (x: 75, 235, 405, 565)
    // =========================================================================
    for (const lx of [75, 235, 405, 565]) {
      // Drop cord hanging from beam at roofY (y: 64)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lx, roofY + 6);
      ctx.lineTo(lx, roofY + 26);
      ctx.stroke();

      // Brass Socket
      ctx.fillStyle = '#d97706';
      ctx.fillRect(lx - 2.5, roofY + 26, 5, 3.5);

      // Black conical shade
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(lx - 12, roofY + 38);
      ctx.lineTo(lx + 12, roofY + 38);
      ctx.lineTo(lx + 4, roofY + 29);
      ctx.lineTo(lx - 4, roofY + 29);
      ctx.closePath();
      ctx.fill();

      // Glowing bulb
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(lx, roofY + 38, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Ambient warm amber light cone
      const coneGrad = ctx.createLinearGradient(0, roofY + 38, 0, groundY);
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
      coneGrad.addColorStop(1, 'rgba(254, 240, 138, 0.01)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(lx - 3, roofY + 38);
      ctx.lineTo(lx + 3, roofY + 38);
      ctx.lineTo(lx + 44, groundY);
      ctx.lineTo(lx - 44, groundY);
      ctx.closePath();
      ctx.fill();

      // Warm glow patch on the floor
      ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'; // Amber glow
      ctx.fillRect(lx - 20, groundY, 40, 8);
    }

    // Shadow lines beneath table, desk, bookshelf
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(52, groundY, 92, 1); // Bookshelf
    ctx.fillRect(150, groundY, 76, 1); // Left Desk area
    ctx.fillRect(260, groundY, 120, 1); // Reading Table
    ctx.fillRect(440, groundY, 78, 1); // Right Desk

    c.refresh();
  }
}
