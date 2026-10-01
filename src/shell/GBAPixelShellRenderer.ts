/**
 * GBAPixelShellRenderer.ts
 * 
 * 100% PURE PROCEDURAL PIXEL ART RENDERER FOR CLASSIC GBA (AGB-001) HARDWARE
 * Exact 800 x 450 Canvas Resolution with an Exact 16:9 Inner Screen Cutout:
 * - Total Console: 800 x 450
 * - Left Wing: 144px wide (with Cross D-Pad)
 * - Right Wing: 144px wide (with Diagonal Ruby A/B Buttons & Speaker Grill)
 * - Center Widescreen Lens: 512 x 288 (16:9 EXACT MATCH -> ZERO BLACK BARS!)
 * - Authentic Indigo/Glacier Palette with pixel stepped contours, dither and highlights
 */
export interface GBAPressedKeys {
  left?: boolean;
  right?: boolean;
  up?: boolean;
  down?: boolean;
  j?: boolean;
  k?: boolean;
}

export class GBAPixelShellRenderer {
  public static readonly TOTAL_WIDTH = 800;
  public static readonly TOTAL_HEIGHT = 450;
  public static readonly SCREEN_X = 144;
  public static readonly SCREEN_Y = 81;
  public static readonly SCREEN_WIDTH = 512;
  public static readonly SCREEN_HEIGHT = 288;

  public static render(canvas: HTMLCanvasElement, pressedKeys: GBAPressedKeys = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    canvas.width = this.TOTAL_WIDTH;
    canvas.height = this.TOTAL_HEIGHT;
    const w = this.TOTAL_WIDTH;
    const h = this.TOTAL_HEIGHT;
    ctx.clearRect(0, 0, w, h);

    const rect = (x: number, y: number, rw: number, rh: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(rw), Math.floor(rh));
    };

    const line = (x1: number, y1: number, x2: number, y2: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(Math.floor(x1), Math.floor(y1), Math.floor(x2 - x1 + 1), Math.floor(y2 - y1 + 1));
    };

    // Authentic AGB-001 Colors
    const cOutline = '#0c0f20';       // Outer pixel contour
    const cIndigoBody = '#38468c';     // Classic AGB Indigo purple-blue
    const cIndigoHi = '#5c6cbd';       // Top highlight bevel
    const cIndigoPeak = '#7b8be0';     // Peak sunny highlight
    const cIndigoDark = '#252e5e';     // Bottom shadow bevel
    const cIndigoDeep = '#161b3b';     // Deep shadow recess

    const cBumper = '#262f5e';         // Side grip bumper strip
    const cShoulder = '#8c98ba';       // L/R trigger slate
    const cShoulderHi = '#b5c0e2';     // L/R highlight
    const cShoulderDark = '#5d6783';   // L/R shadow

    const cLensOuter = '#161a28';      // Screen lens frame
    const cLensBorder = '#2a3248';     // Lens bevel
    const cLensInner = '#0a0d14';      // Screen cutout border

    const cDpad = '#151824';           // D-pad dark slate
    const cDpadHi = '#2f374e';         // D-pad highlight

    const cBtnRuby = '#9c2454';        // A/B button ruby red
    const cBtnRubyHi = '#d83a75';      // A/B highlight
    const cBtnRubyDark = '#59102c';    // A/B shadow

    const cPillBtn = '#1c2233';        // Select/Start rubber
    const cPillHi = '#38435f';

    // =========================================================================
    // 1. TOP L & R SHOULDER TRIGGERS
    // =========================================================================
    // Left L Button (x: 48..140, y: 16..42)
    rect(48, 20, 92, 22, cShoulder);
    rect(52, 16, 84, 4, cShoulder);
    rect(58, 14, 72, 2, cShoulder);
    // Highlights & Shadows
    line(58, 14, 130, 14, cShoulderHi);
    line(52, 16, 58, 16, cShoulderHi);
    line(48, 20, 52, 20, cShoulderHi);
    line(130, 15, 140, 22, cShoulderDark);
    // Outlines
    line(58, 13, 130, 13, cOutline);
    line(52, 15, 57, 15, cOutline);
    line(47, 19, 51, 19, cOutline);
    line(46, 20, 46, 42, cOutline);
    line(140, 14, 140, 42, cOutline);
    // "L" debossed text
    ctx.fillStyle = '#4a536b';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('L', 78, 28);

    // Right R Button (x: w - 140..w - 48, y: 16..42)
    const rx = w - 140;
    rect(rx, 20, 92, 22, cShoulder);
    rect(rx + 4, 16, 84, 4, cShoulder);
    rect(rx + 10, 14, 72, 2, cShoulder);
    // Highlights & Shadows
    line(rx + 10, 14, rx + 82, 14, cShoulderHi);
    line(rx, 20, rx + 10, 16, cShoulderHi);
    line(rx + 82, 15, rx + 92, 22, cShoulderDark);
    // Outlines
    line(rx + 10, 13, rx + 82, 13, cOutline);
    line(rx, 14, rx, 42, cOutline);
    line(rx + 92, 20, rx + 92, 42, cOutline);
    // "R" debossed text
    ctx.fillStyle = '#4a536b';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('R', rx + 62, 28);

    // =========================================================================
    // 2. MAIN AGB-001 BODY HOUSING
    // Wide horizontal console with ergonomic flared side wings & bottom curve
    // =========================================================================
    const bx = 16;
    const by = 30;
    const bw = w - 32;
    const bh = h - 48;

    // Body Base Fill (Stepped ergonomic pixel shape)
    rect(bx + 40, by, bw - 80, bh, cIndigoBody);
    rect(bx + 20, by + 14, bw - 40, bh - 28, cIndigoBody);
    rect(bx + 8, by + 32, bw - 16, bh - 64, cIndigoBody);
    rect(bx, by + 56, bw, bh - 112, cIndigoBody);

    // Ergonomic Bottom Inward Curve
    rect(bx + 100, by + bh - 6, bw - 200, 6, cIndigoBody);
    rect(bx + 140, by + bh, bw - 280, 5, cIndigoBody);

    // Top Curve
    rect(bx + 80, by - 4, bw - 160, 4, cIndigoBody);
    rect(bx + 120, by - 8, bw - 240, 4, cIndigoBody);

    // Top Highlight Bevels
    line(bx + 120, by - 8, bx + bw - 120, by - 8, cIndigoPeak);
    line(bx + 80, by - 4, bx + 120, by - 4, cIndigoHi);
    line(bx + bw - 120, by - 4, bx + bw - 80, by - 4, cIndigoHi);
    line(bx + 40, by, bx + 80, by, cIndigoHi);
    line(bx + bw - 80, by, bx + bw - 40, by, cIndigoHi);

    // Left Grip Highlight
    line(bx + 20, by + 14, bx + 40, by, cIndigoHi);
    line(bx + 8, by + 32, bx + 20, by + 14, cIndigoHi);
    line(bx, by + 56, bx + 8, by + 32, cIndigoHi);
    line(bx, by + 56, bx, by + bh - 56, cIndigoHi);

    // Bottom & Right Shadow Bevels
    line(bx, by + bh - 56, bx + 8, by + bh - 32, cIndigoDark);
    line(bx + 8, by + bh - 32, bx + 20, by + bh - 14, cIndigoDark);
    line(bx + 20, by + bh - 14, bx + 40, by + bh, cIndigoDark);
    line(bx + 40, by + bh, bx + 100, by + bh - 6, cIndigoDark);
    line(bx + 100, by + bh - 6, bx + 140, by + bh, cIndigoDark);
    line(bx + 140, by + bh + 4, bx + bw - 140, by + bh + 4, cIndigoDeep);
    line(bx + bw - 140, by + bh + 4, bx + bw - 100, by + bh - 6, cIndigoDark);
    line(bx + bw, by + 56, bx + bw, by + bh - 56, cIndigoDark);

    // Outer Pixel Contour Outline
    ctx.strokeStyle = cOutline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx + 120, by - 9);
    ctx.lineTo(bx + bw - 120, by - 9);
    ctx.lineTo(bx + bw - 80, by - 5);
    ctx.lineTo(bx + bw - 40, by - 1);
    ctx.lineTo(bx + bw - 20, by + 13);
    ctx.lineTo(bx + bw - 8, by + 31);
    ctx.lineTo(bx + bw, by + 55);
    ctx.lineTo(bx + bw, by + bh - 55);
    ctx.lineTo(bx + bw - 8, by + bh - 31);
    ctx.lineTo(bx + bw - 20, by + bh - 13);
    ctx.lineTo(bx + bw - 40, by + bh + 1);
    ctx.lineTo(bx + bw - 100, by + bh - 5);
    ctx.lineTo(bx + bw - 140, by + bh + 5);
    ctx.lineTo(bx + 140, by + bh + 5);
    ctx.lineTo(bx + 100, by + bh - 5);
    ctx.lineTo(bx + 40, by + bh + 1);
    ctx.lineTo(bx + 20, by + bh - 13);
    ctx.lineTo(bx + 8, by + bh - 31);
    ctx.lineTo(bx, by + bh - 55);
    ctx.lineTo(bx, by + 55);
    ctx.lineTo(bx + 8, by + 31);
    ctx.lineTo(bx + 20, by + 13);
    ctx.lineTo(bx + 40, by - 1);
    ctx.lineTo(bx + 80, by - 5);
    ctx.closePath();
    ctx.stroke();

    // Side Ergonomic Bumper Accent Strips (Classic AGB-001 side bumper insets)
    rect(bx + 3, by + 64, 7, bh - 128, cBumper);
    rect(bx + bw - 10, by + 64, 7, bh - 128, cBumper);

    // =========================================================================
    // 3. SCREEN LENS FRAME (Centered around the 16:9 screen cutout)
    // =========================================================================
    const sx = this.SCREEN_X;
    const sy = this.SCREEN_Y;
    const sw = this.SCREEN_WIDTH;
    const sh = this.SCREEN_HEIGHT;

    // Lens Outer Border
    const lx = sx - 16;
    const ly = sy - 28;
    const lw = sw + 32;
    const lh = sh + 52;

    rect(lx, ly, lw, lh, cLensOuter);
    // Subtle trapezoid flare on lens left/right
    rect(lx - 5, ly + 14, lw + 10, lh - 28, cLensOuter);
    // Lens Bevel Highlights
    line(lx - 5, ly + 14, lx, ly, cLensBorder);
    line(lx, ly, lx + lw, ly, cLensBorder);
    line(lx + lw, ly, lx + lw + 5, ly + 14, cLensBorder);
    line(lx - 5, ly + 14, lx - 5, ly + lh - 14, cLensBorder);
    line(lx - 5, ly + lh - 14, lx, ly + lh, cOutline);
    line(lx, ly + lh, lx + lw, ly + lh, cOutline);
    line(lx + lw, ly + lh, lx + lw + 5, ly + lh - 14, cOutline);

    // Screen Inner Cutout Border (Where the 16:9 game displays)
    rect(sx - 3, sy - 3, sw + 6, sh + 6, cLensInner);
    line(sx - 3, sy - 3, sx + sw + 3, sy - 3, '#38425d');
    line(sx - 3, sy - 3, sx - 3, sy + sh + 3, '#38425d');

    // Power LED Indicator (Top left of lens)
    const ledX = lx + 24;
    const ledY = ly + 11;
    rect(ledX - 1, ledY - 1, 6, 6, '#0f172a');
    rect(ledX, ledY, 4, 4, '#22c55e');
    rect(ledX + 1, ledY + 1, 2, 2, '#86efac');
    // Power LED glow halo
    ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(ledX + 2, ledY + 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // "POWER" Text
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('POWER', ledX + 11, ledY + 4);

    // "GAME BOY ADVANCE" Metallic Script Logo (Bottom of lens)
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold italic 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME BOY ADVANCE', lx + lw / 2, ly + lh - 8);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('GAME BOY ADVANCE', lx + lw / 2, ly + lh - 9);

    // Clear the exact 16:9 screen cutout so game canvas shows through with 0 black bars!
    ctx.clearRect(sx, sy, sw, sh);

    // =========================================================================
    // 4. LEFT WING: RECESSED DISH & INTERACTIVE PIXEL D-PAD
    // =========================================================================
    const dpadCenterX = Math.floor(bx + (lx - bx) / 2) + 2;
    const dpadCenterY = Math.floor(by + bh * 0.46);

    // Recessed circular dish
    ctx.fillStyle = cIndigoDeep;
    ctx.beginPath();
    ctx.arc(dpadCenterX, dpadCenterY, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = cIndigoDark;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Cross D-Pad Dimensions
    const dArmW = 22;
    const dArmH = 28;

    const isL = !!pressedKeys.left;
    const isR = !!pressedKeys.right;
    const isU = !!pressedKeys.up;
    const isD = !!pressedKeys.down;
    const isJ = !!pressedKeys.j;
    const isK = !!pressedKeys.k;

    // Center Cross Hub
    rect(dpadCenterX - dArmW / 2, dpadCenterY - dArmW / 2, dArmW, dArmW, cDpad);

    // Left Arm
    if (isL) {
      // Glow halo
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(dpadCenterX - dArmH - 2, dpadCenterY - dArmW / 2 - 1, dArmH - dArmW / 2 + 3, dArmW + 2);
      // Depressed & Lit Body
      rect(dpadCenterX - dArmH + 1, dpadCenterY - dArmW / 2 + 1.5, dArmH - dArmW / 2, dArmW - 1, '#1b3459');
      line(dpadCenterX - dArmH + 1, dpadCenterY - dArmW / 2 + 1.5, dpadCenterX - dArmW / 2, dpadCenterY - dArmW / 2 + 1.5, '#38bdf8');
    } else {
      rect(dpadCenterX - dArmH, dpadCenterY - dArmW / 2, dArmH - dArmW / 2 + 1, dArmW, cDpad);
      line(dpadCenterX - dArmH, dpadCenterY - dArmW / 2, dpadCenterX - dArmW / 2, dpadCenterY - dArmW / 2, cDpadHi);
      line(dpadCenterX - dArmH, dpadCenterY - dArmW / 2, 1, dArmW, cDpadHi);
    }

    // Right Arm
    if (isR) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(dpadCenterX + dArmW / 2 - 1, dpadCenterY - dArmW / 2 - 1, dArmH - dArmW / 2 + 3, dArmW + 2);
      rect(dpadCenterX + dArmW / 2 - 1, dpadCenterY - dArmW / 2 + 1.5, dArmH - dArmW / 2, dArmW - 1, '#1b3459');
      line(dpadCenterX + dArmW / 2, dpadCenterY - dArmW / 2 + 1.5, dpadCenterX + dArmH - 1, dpadCenterY - dArmW / 2 + 1.5, '#38bdf8');
    } else {
      rect(dpadCenterX + dArmW / 2, dpadCenterY - dArmW / 2, dArmH - dArmW / 2, dArmW, cDpad);
      line(dpadCenterX + dArmW / 2, dpadCenterY - dArmW / 2, dpadCenterX + dArmH, dpadCenterY - dArmW / 2, cDpadHi);
    }

    // Up Arm
    if (isU) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(dpadCenterX - dArmW / 2 - 1, dpadCenterY - dArmH - 2, dArmW + 2, dArmH - dArmW / 2 + 3);
      rect(dpadCenterX - dArmW / 2 + 0.5, dpadCenterY - dArmH + 1.5, dArmW - 1, dArmH - dArmW / 2, '#1b3459');
      line(dpadCenterX - dArmW / 2 + 0.5, dpadCenterY - dArmH + 1.5, dpadCenterX + dArmW / 2 - 0.5, dpadCenterY - dArmH + 1.5, '#38bdf8');
    } else {
      rect(dpadCenterX - dArmW / 2, dpadCenterY - dArmH, dArmW, dArmH - dArmW / 2 + 1, cDpad);
      line(dpadCenterX - dArmW / 2, dpadCenterY - dArmH, dArmW, 1, cDpadHi);
      line(dpadCenterX - dArmW / 2, dpadCenterY - dArmH, 1, dArmH - dArmW / 2, cDpadHi);
    }

    // Down Arm
    if (isD) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(dpadCenterX - dArmW / 2 - 1, dpadCenterY + dArmW / 2 - 1, dArmW + 2, dArmH - dArmW / 2 + 3);
      rect(dpadCenterX - dArmW / 2 + 0.5, dpadCenterY + dArmW / 2 + 1.5, dArmW - 1, dArmH - dArmW / 2, '#1b3459');
    } else {
      rect(dpadCenterX - dArmW / 2, dpadCenterY + dArmW / 2, dArmW, dArmH - dArmW / 2, cDpad);
      line(dpadCenterX - dArmW / 2, dpadCenterY + dArmW / 2, 1, dArmH - dArmW / 2, cDpadHi);
    }

    // Center circular indentation dish on D-pad
    ctx.fillStyle = '#0b0d14';
    ctx.beginPath();
    ctx.arc(dpadCenterX, dpadCenterY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Directional Triangles
    // Up
    ctx.fillStyle = isU ? '#ffffff' : '#475569';
    const uOff = isU ? 2 : 0;
    ctx.beginPath();
    ctx.moveTo(dpadCenterX, dpadCenterY - dArmH + 5 + uOff);
    ctx.lineTo(dpadCenterX - 5, dpadCenterY - dArmH + 11 + uOff);
    ctx.lineTo(dpadCenterX + 5, dpadCenterY - dArmH + 11 + uOff);
    ctx.fill();

    // Down
    ctx.fillStyle = isD ? '#ffffff' : '#475569';
    const dOff = isD ? 2 : 0;
    ctx.beginPath();
    ctx.moveTo(dpadCenterX, dpadCenterY + dArmH - 5 + dOff);
    ctx.lineTo(dpadCenterX - 5, dpadCenterY + dArmH - 11 + dOff);
    ctx.lineTo(dpadCenterX + 5, dpadCenterY + dArmH - 11 + dOff);
    ctx.fill();

    // Left
    ctx.fillStyle = isL ? '#ffffff' : '#475569';
    const lOff = isL ? 1 : 0;
    ctx.beginPath();
    ctx.moveTo(dpadCenterX - dArmH + 5 + lOff, dpadCenterY + (isL ? 1 : 0));
    ctx.lineTo(dpadCenterX - dArmH + 11 + lOff, dpadCenterY - 5 + (isL ? 1 : 0));
    ctx.lineTo(dpadCenterX - dArmH + 11 + lOff, dpadCenterY + 5 + (isL ? 1 : 0));
    ctx.fill();

    // Right
    ctx.fillStyle = isR ? '#ffffff' : '#475569';
    const rOff = isR ? -1 : 0;
    ctx.beginPath();
    ctx.moveTo(dpadCenterX + dArmH - 5 + rOff, dpadCenterY + (isR ? 1 : 0));
    ctx.lineTo(dpadCenterX + dArmH - 11 + rOff, dpadCenterY - 5 + (isR ? 1 : 0));
    ctx.lineTo(dpadCenterX + dArmH - 11 + rOff, dpadCenterY + 5 + (isR ? 1 : 0));
    ctx.fill();

    // =========================================================================
    // 5. RIGHT WING: DIAGONAL RUBY J & K BUTTONS
    // =========================================================================
    const btnCenterX = Math.floor(lx + lw + (w - (lx + lw) - bx) / 2) - 2;
    const btnCenterY = Math.floor(by + bh * 0.44);

    // Diagonal Recessed Oval Dish
    ctx.fillStyle = cIndigoDeep;
    ctx.beginPath();
    ctx.ellipse(btnCenterX, btnCenterY, 40, 30, -0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = cIndigoDark;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // J Button (Lower Left: Accelerate / Start)
    const jX = btnCenterX - 18;
    const jY = btnCenterY + 12;
    const btnR = 14;
    drawGBAButton(ctx, jX, jY, btnR, 'J', isJ, cBtnRuby, cBtnRubyHi, cBtnRubyDark);

    // K Button (Upper Right: Brake / Action / Enter)
    const kX = btnCenterX + 18;
    const kY = btnCenterY - 12;
    drawGBAButton(ctx, kX, kY, btnR, 'K', isK, cBtnRuby, cBtnRubyHi, cBtnRubyDark);

    function drawGBAButton(
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      label: string,
      isPressed: boolean,
      body: string,
      hi: string,
      dark: string
    ) {
      if (isPressed) {
        const pressY = cy + 2.5;

        // Glowing outer halo
        c.fillStyle = 'rgba(255, 45, 110, 0.45)';
        c.beginPath();
        c.arc(cx, pressY, r + 5, 0, Math.PI * 2);
        c.fill();

        // Flattened 1px shadow
        c.fillStyle = '#0f1325';
        c.beginPath();
        c.arc(cx, pressY + 1, r, 0, Math.PI * 2);
        c.fill();

        // Electric neon ruby face
        c.fillStyle = '#ff2b75';
        c.beginPath();
        c.arc(cx, pressY, r, 0, Math.PI * 2);
        c.fill();

        // Highlight crest
        c.fillStyle = '#ff8ab3';
        c.beginPath();
        c.arc(cx, pressY - 1, r - 3, Math.PI * 0.9, Math.PI * 2.1);
        c.fill();

        // Glowing label
        c.fillStyle = '#ffffff';
        c.font = 'bold 12px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.shadowColor = '#ffe4ec';
        c.shadowBlur = 4;
        c.fillText(label, cx, pressY + 1);
        c.shadowBlur = 0;
      } else {
        // Full 3.5px drop shadow
        c.fillStyle = '#0f1325';
        c.beginPath();
        c.arc(cx, cy + 3.5, r, 0, Math.PI * 2);
        c.fill();

        // Matte ruby body
        c.fillStyle = body;
        c.beginPath();
        c.arc(cx, cy, r, 0, Math.PI * 2);
        c.fill();

        // Highlight
        c.fillStyle = hi;
        c.beginPath();
        c.arc(cx, cy - 2, r - 3, Math.PI * 0.9, Math.PI * 2.1);
        c.fill();

        c.fillStyle = body;
        c.beginPath();
        c.arc(cx, cy, r - 2, 0, Math.PI * 2);
        c.fill();

        // White label
        c.fillStyle = '#ffffff';
        c.font = 'bold 12px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(label, cx, cy + 1);
      }
    }

    // =========================================================================
    // 6. SPEAKER GRILL (6-Hole Arc near bottom-right)
    // =========================================================================
    const spkX = btnCenterX + 8;
    const spkY = by + bh - 48;
    const speakerHoles = [
      [-14, -5], [-5, -9], [5, -13],
      [-19, 5], [-10, 1], [-1, -3]
    ];
    for (const [ox, oy] of speakerHoles) {
      rect(spkX + ox, spkY + oy, 4, 4, '#101426');
      rect(spkX + ox + 1, spkY + oy + 1, 2, 2, '#1b223d');
    }

    // =========================================================================
    // 7. BOTTOM CENTER: ANGLED RUBBER SELECT & START PILLS
    // =========================================================================
    const ctrlY = by + bh - 24;
    // SELECT (Left)
    drawPillButton(ctx, dpadCenterX + 32, ctrlY, -25, 'SELECT');
    // START (Right)
    drawPillButton(ctx, dpadCenterX + 78, ctrlY, -25, 'START');

    function drawPillButton(
      c: CanvasRenderingContext2D,
      px: number,
      py: number,
      deg: number,
      txt: string
    ) {
      c.save();
      c.translate(px, py);
      c.rotate((deg * Math.PI) / 180);
      rect(-12, -4, 24, 7, cPillBtn);
      line(-12, -4, 12, -4, cPillHi);
      c.restore();

      c.fillStyle = '#818fb5';
      c.font = 'bold 7px monospace';
      c.textAlign = 'center';
      c.fillText(txt, px, py + 14);
    }
  }
}
