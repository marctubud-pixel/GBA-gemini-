/**
 * PrintHouseInteriorRenderer.ts
 * 
 * 100% PURE PROCEDURAL CANVAS PIXEL ART for Print House (Write House) Interior
 * Strict Ironclad Principle: ZERO static image crops / ZERO pasted textures.
 * Every pixel, brick, book spine, leaf, and window vista is generated via code!
 */

export class PrintHouseInteriorRenderer {
  /**
   * Render the complete Print House interior room onto a Canvas 2D context.
   * Target canvas size: 680 x 200 (or scaled 1024 x 300)
   */
  public static renderInterior(
    ctx: CanvasRenderingContext2D,
    w: number = 680,
    h: number = 200,
    time: number = 0
  ) {
    ctx.imageSmoothingEnabled = false;

    // =========================================================================
    // 1. BASE WALL (Warm sunny Mediterranean plaster wall)
    // =========================================================================
    ctx.fillStyle = '#fbf8ee';
    ctx.fillRect(0, 0, w, h);

    // Subtle horizontal plaster render lines
    ctx.fillStyle = '#f0e8d5';
    for (let y = 18; y < 168; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    // =========================================================================
    // 2. CEILING & INDUSTRIAL STRUCTURAL BEAMS (y: 0..24)
    // =========================================================================
    // Heavy Steel I-Beam
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 14);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 2, w, 2);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 13, w, 2);

    // Steel Rivets along I-Beam
    for (let rx = 14; rx < w; rx += 28) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(rx, 5, 4, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(rx + 1, 6, 2, 2);
    }

    // Electrical Conduit Pipe with brackets
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 19, w, 3);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 19, w, 1);
    for (let px = 30; px < w; px += 64) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px - 2, 17, 4, 7);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(px - 1, 18, 2, 2);
    }

    // =========================================================================
    // 3. FLOOR & PLATFORM (y: 166..200)
    // =========================================================================
    // Slate Baseboard
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 164, w, 4);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 164, w, 1);

    // Warm Honed Stone Pavers
    ctx.fillStyle = '#f8f5ee';
    ctx.fillRect(0, 168, w, 16);
    // Vertical tile grout lines
    ctx.fillStyle = '#cfc5b3';
    for (let fx = 0; fx < w; fx += 26) {
      ctx.fillRect(fx, 168, 1, 8);
      ctx.fillRect(fx + 13, 176, 1, 8);
    }
    ctx.fillRect(0, 176, w, 1);

    // Mediterranean Blue & White Checkered Border Ceramic Tiles
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 184, w, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 184, w, 1);
    for (let tx = 0; tx < w; tx += 8) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tx, 185, 3, 3);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(tx + 4, 185, 3, 3);
    }

    // Platform Blue Ground Edge Girder
    ctx.fillStyle = '#092548';
    ctx.fillRect(0, 189, w, 11);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 189, w, 1);
    for (let bx = 0; bx < w; bx += 32) {
      ctx.fillStyle = '#051426';
      ctx.fillRect(bx, 190, 2, 10);
    }

    // Mediterranean Blue Geometric Woven Runner Rug (Center: x = 250..430)
    const rugX = 250;
    const rugW = 180;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(rugX, 168, rugW, 14);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(rugX + 2, 169, rugW - 4, 12);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(rugX + 3, 170, rugW - 6, 10);

    // Intricate diamond woven motifs
    for (let rx = rugX + 8; rx < rugX + rugW - 8; rx += 10) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(rx + 4, 171);
      ctx.lineTo(rx + 8, 175);
      ctx.lineTo(rx + 4, 179);
      ctx.lineTo(rx, 175);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(rx + 4, 172.5);
      ctx.lineTo(rx + 6.5, 175);
      ctx.lineTo(rx + 4, 177.5);
      ctx.lineTo(rx + 1.5, 175);
      ctx.closePath();
      ctx.fill();
    }

    // =========================================================================
    // 4. BIG CENTER PANORAMIC WINDOW (x: 246..434, y: 28..138)
    // =========================================================================
    const wx1 = 246;
    const wy1 = 28;
    const wx2 = 434;
    const wy2 = 138;
    const winW = wx2 - wx1;
    const winH = wy2 - wy1;

    // Sky Gradient inside window
    const skyGrad = ctx.createLinearGradient(0, wy1, 0, wy2);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.5, '#7dd3fc');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(wx1, wy1, winW, winH);

    // Drifting Puffy White Cumulus Clouds
    const cloudShift = (time * 0.008) % 180;
    for (const [baseX, cy, cw] of [[260, 48, 36], [320, 38, 46], [385, 54, 32]]) {
      let cx = wx1 + ((baseX - wx1 + cloudShift) % (winW + 40)) - 20;
      if (cx > wx1 - 20 && cx < wx2 + 20) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.beginPath();
        ctx.ellipse(cx + cw / 2, cy, cw / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx + cw / 2, cy - 3, cw / 3, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Distant Headlands / Islands on horizon
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(wx1, 95);
    ctx.lineTo(wx1 + 35, 78);
    ctx.lineTo(wx1 + 75, 96);
    ctx.lineTo(wx1 + 75, wy2);
    ctx.lineTo(wx1, wy2);
    ctx.fill();

    // Deep Turquoise Mediterranean Ocean (y: 92..138)
    const seaGrad = ctx.createLinearGradient(0, 92, 0, 138);
    seaGrad.addColorStop(0, '#0284c7');
    seaGrad.addColorStop(0.4, '#0ea5e9');
    seaGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(wx1, 92, winW, wy2 - 92);

    // Wave ripples
    const waveWave = Math.sin(time * 0.003);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (const [lineX, lineY, lineW] of [
      [265, 100, 24], [315, 96, 32], [370, 104, 26], [290, 112, 38], [345, 120, 28]
    ]) {
      const sx = lineX + waveWave * 3;
      ctx.fillRect(sx, lineY, lineW, 1);
    }

    // Sunlit Terracotta Coastal Village on right side of window
    for (const [hx, hy] of [[372, 86], [390, 80], [408, 84], [382, 98], [402, 94], [418, 90]]) {
      // Whitewashed walls
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hx, hy, 14, 12);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(hx + 10, hy, 4, 12);
      // Blue window
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(hx + 3, hy + 4, 6, 5);
      // Terracotta pitched roof
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(hx - 2, hy);
      ctx.lineTo(hx + 7, hy - 6);
      ctx.lineTo(hx + 16, hy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(hx + 7, hy - 6, 9, 6);
      // Cypress tree
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(hx - 5, hy + 12);
      ctx.lineTo(hx - 2, hy - 5);
      ctx.lineTo(hx + 1, hy + 12);
      ctx.closePath();
      ctx.fill();
    }

    // Window Mullions & Outer Frame
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(wx1, wy1, winW, winH);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(308, wy1, 3, winH);
    ctx.fillRect(372, wy1, 3, winH);

    // Window Sill Ledge
    ctx.fillStyle = '#334155';
    ctx.fillRect(wx1 - 4, wy2, winW + 8, 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(wx1 - 4, wy2, winW + 8, 1);

    // Planters & Flower Boxes on Window Sill
    for (const [px, pc] of [
      [wx1 + 10, '#ea580c'],
      [wx2 - 32, '#ea580c'],
      [335, '#b45309']
    ] as [number, string][]) {
      ctx.fillStyle = pc;
      ctx.fillRect(px, wy2 - 9, 22, 9);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 1, wy2 - 11, 24, 2);
      // Foliage & Blossoms
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(px + 11, wy2 - 16, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(px + 9, wy2 - 18, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px + 4, wy2 - 17, 2, 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 14, wy2 - 16, 2, 2);
    }

    // =========================================================================
    // 5. CENTERPIECE READING DESK & GRAND TOME (x: 290..390, y: 115..172)
    // =========================================================================
    // Oak Table Top
    ctx.fillStyle = '#92400e';
    ctx.fillRect(290, 142, 100, 7);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(290, 142, 100, 1);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(290, 148, 100, 1);

    // Turned Table Legs
    for (const lx of [298, 380]) {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(lx, 149, 7, 23);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(lx + 1, 149, 3, 23);
    }
    // Stretcher
    ctx.fillStyle = '#5c270a';
    ctx.fillRect(302, 163, 76, 3);

    // Sloped Wooden Reading Lectern
    ctx.fillStyle = '#78350f';
    ctx.fillRect(296, 134, 88, 8);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(294, 140, 92, 3);

    // GRAND OPEN MANUSCRIPT TOME (92px Wide x 28px High)
    const bx = 296;
    const by = 116;
    const bw = 88;
    const bh = 26;

    // Leather binding
    ctx.fillStyle = '#0c4a6e';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 3);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(bx + 1, by + 1, bw - 2, bh - 2, 2);
    ctx.fill();

    // Stacked paper pages
    ctx.fillStyle = '#f1ebdc';
    ctx.fillRect(bx + 3, by + 2, bw - 6, bh - 4);

    // Left page
    ctx.fillStyle = '#fefbf3';
    ctx.fillRect(bx + 4, by + 3, 38, bh - 6);
    // Right page
    ctx.fillStyle = '#fefbf3';
    ctx.fillRect(bx + 46, by + 3, 38, bh - 6);

    // Spine crease
    ctx.fillStyle = '#8c7864';
    ctx.fillRect(bx + 42, by + 3, 2, bh - 6);

    // Calligraphy lines
    ctx.fillStyle = '#94a3b8';
    for (const ty of [by + 6, by + 10, by + 14, by + 18]) {
      ctx.fillRect(bx + 7, ty, 30, 1.2);
      ctx.fillRect(bx + 49, ty, 30, 1.2);
    }

    // Crimson Silk Bookmark Ribbon trailing down over desk
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(bx + 42, by + 4, 3, 26);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bx + 42, by + 4, 1, 26);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(bx + 42, by + 30);
    ctx.lineTo(bx + 43.5, by + 28);
    ctx.lineTo(bx + 45, by + 30);
    ctx.lineTo(bx + 45, by + 26);
    ctx.lineTo(bx + 42, by + 26);
    ctx.closePath();
    ctx.fill();

    // Stacked Hardcover Books beside desk
    // Left stack (x: 274)
    for (const [sBy, sBc] of [
      [167, '#1e3a8a'],
      [163, '#b91c1c'],
      [159, '#15803d'],
      [155, '#ca8a04']
    ] as [number, string][]) {
      ctx.fillStyle = sBc;
      ctx.fillRect(272, sBy, 16, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(274, sBy + 1, 12, 1);
    }
    // Right stack (x: 390)
    for (const [sBy, sBc] of [
      [167, '#334155'],
      [163, '#0284c7'],
      [159, '#9333ea']
    ] as [number, string][]) {
      ctx.fillStyle = sBc;
      ctx.fillRect(390, sBy, 16, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(392, sBy + 1, 12, 1);
    }
  }

  /**
   * Render the open book frame procedurally onto a Canvas 2D context.
   * Target size: 720 x 440 (Pixel-perfect match to reference art!)
   */
  public static renderBookFrame(
    ctx: CanvasRenderingContext2D,
    w: number = 720,
    h: number = 440
  ) {
    ctx.imageSmoothingEnabled = false;

    const padX = 26;
    const padY = 16;
    const cw = w - padX * 2;
    const ch = h - padY * 2;
    const cx = Math.floor(w / 2);

    // 1. Outer Dark Leather Outline
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.roundRect(padX, padY, cw, ch, 16);
    ctx.fill();

    // 2. Primary Royal Mediterranean Blue Leather Body
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(padX + 3.5, padY + 3.5, cw - 7, ch - 7, 13);
    ctx.fill();

    // 3. Highlight Bevel along leather inner edge
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(padX + 5, padY + 5, cw - 10, ch - 10, 12);
    ctx.stroke();

    // Bottom Center Spine Notch
    ctx.fillStyle = '#082f49';
    ctx.fillRect(cx - 24, padY + ch - 6, 48, 10);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(cx - 22, padY + ch - 4, 44, 6);

    // 4. Stacked Multi-Layered Page Edges (showing authentic volume thickness — 6 layers!)
    const pagePadX = padX + 16;
    const pagePadY = padY + 14;
    const pw = cw - 32;
    const ph = ch - 28;

    for (let i = 6; i >= 0; i--) {
      const offset = i * 2;
      const colors = ['#f5f0e4', '#d6cbb7', '#ece5d5', '#c9bca8', '#f0ead8', '#d0c3af', '#f5f0e4'];
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.roundRect(pagePadX - offset, pagePadY - offset, pw + offset * 2, ph + offset * 2, 8);
      ctx.fill();
    }

    // 5. Main Open Ivory/Parchment Pages Surface with warm aged parchment feel
    const pageGrad = ctx.createLinearGradient(0, pagePadY, 0, pagePadY + ph);
    pageGrad.addColorStop(0, '#fefcf7');
    pageGrad.addColorStop(0.3, '#fefdfa');
    pageGrad.addColorStop(0.7, '#faf5ec');
    pageGrad.addColorStop(1, '#f3ece0');
    ctx.fillStyle = pageGrad;
    ctx.beginPath();
    ctx.roundRect(pagePadX, pagePadY, pw, ph, 8);
    ctx.fill();

    // Subtle horizontal ruled lines for authenticity
    ctx.fillStyle = 'rgba(200, 185, 160, 0.12)';
    for (let ry = pagePadY + 20; ry < pagePadY + ph - 20; ry += 18) {
      ctx.fillRect(pagePadX + 8, ry, pw - 16, 1);
    }

    // 6. Center Spine Divide & Curvature Gradient Shadow (wider, more realistic)
    ctx.fillStyle = '#a8937e';
    ctx.fillRect(cx - 1.5, pagePadY, 1, ph);
    ctx.fillStyle = '#7a6b5c';
    ctx.fillRect(cx - 0.5, pagePadY, 1, ph);
    ctx.fillStyle = '#8c7864';
    ctx.fillRect(cx + 0.5, pagePadY, 1, ph);
    ctx.fillStyle = '#a8937e';
    ctx.fillRect(cx + 1.5, pagePadY, 1, ph);

    for (let step = 2; step <= 26; step++) {
      const alpha = (1 - step / 26.0) * 0.22;
      ctx.fillStyle = `rgba(140, 120, 100, ${alpha})`;
      ctx.fillRect(cx - step, pagePadY, 1, ph);
      ctx.fillRect(cx + step, pagePadY, 1, ph);
    }

    // Corner Filigree Ornaments (richer with nested L-shapes and dot accents)
    ctx.strokeStyle = '#c9b89e';
    ctx.lineWidth = 1.5;
    for (const [cornX, cornY, dirX, dirY] of [
      [pagePadX + 14, pagePadY + 14, 1, 1],
      [pagePadX + pw - 14, pagePadY + 14, -1, 1],
      [pagePadX + 14, pagePadY + ph - 14, 1, -1],
      [pagePadX + pw - 14, pagePadY + ph - 14, -1, -1]
    ]) {
      // Outer L-bracket
      ctx.beginPath();
      ctx.moveTo(cornX, cornY);
      ctx.lineTo(cornX + dirX * 18, cornY);
      ctx.moveTo(cornX, cornY);
      ctx.lineTo(cornX, cornY + dirY * 18);
      ctx.stroke();
      // Inner nested L
      ctx.strokeStyle = '#d8cbb6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cornX + dirX * 4, cornY + dirY * 4);
      ctx.lineTo(cornX + dirX * 14, cornY + dirY * 4);
      ctx.moveTo(cornX + dirX * 4, cornY + dirY * 4);
      ctx.lineTo(cornX + dirX * 4, cornY + dirY * 14);
      ctx.stroke();
      // Corner diamond dot
      ctx.fillStyle = '#c9b89e';
      ctx.beginPath();
      ctx.moveTo(cornX + dirX * 2, cornY + dirY * 2);
      ctx.lineTo(cornX + dirX * 4, cornY);
      ctx.lineTo(cornX + dirX * 6, cornY + dirY * 2);
      ctx.lineTo(cornX + dirX * 4, cornY + dirY * 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c9b89e';
      ctx.lineWidth = 1.5;
    }

    // 7. Top Center Brass Clasp / Clamp with ornate embossing (matching reference art)
    // Outer dark brass frame
    ctx.fillStyle = '#92400e';
    ctx.fillRect(cx - 22, padY - 3, 44, 22);
    // Main brass body
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - 20, padY - 1, 40, 18);
    // Polished brass inner
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx - 18, padY + 1, 36, 14);
    // Top highlight bevel
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx - 16, padY + 2, 32, 1);
    // Embossed side grooves
    ctx.fillStyle = '#d97706';
    ctx.fillRect(cx - 16, padY + 5, 2, 6);
    ctx.fillRect(cx + 14, padY + 5, 2, 6);
    // Center medallion
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(cx, padY + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(cx, padY + 8, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx - 1, padY + 7, 2, 2);
    // Side wing brackets
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - 28, padY + 4, 8, 3);
    ctx.fillRect(cx + 20, padY + 4, 8, 3);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(cx - 26, padY + 5, 4, 1);
    ctx.fillRect(cx + 22, padY + 5, 4, 1);

    // 8. Climbing Pixel Art Ivy Vines & Flower Blossoms flanking left & right edges
    // Rich, lush climbing foliage matching the abundant reference art!
    for (let vy = padY + 8; vy < padY + ch - 12; vy += 14) {
      // Left Ivy vine with natural waviness
      const leftWave = Math.sin(vy * 0.08) * 3;
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(padX + 5 + leftWave, vy);
      ctx.quadraticCurveTo(padX + 7, vy + 7, padX + 6 + leftWave, vy + 14);
      ctx.stroke();

      // Left Leaves — layered from dark to bright for depth
      const leafX = padX - 4 + leftWave;
      ctx.fillStyle = '#0a3622';
      ctx.beginPath();
      ctx.ellipse(leafX - 2, vy + 2, 9, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.ellipse(leafX, vy + 3, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(leafX + 1, vy + 4, 7, 4.5, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(leafX + 2, vy + 5, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tiny highlight speck
      ctx.fillStyle = '#86efac';
      ctx.fillRect(padX + 5, vy + 5, 2, 2);

      // Small tendril curl on left
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(padX - 8, vy + 8, 3, 0, Math.PI * 1.2);
      ctx.stroke();

      // Right Ivy vine with waviness
      const rx = padX + cw;
      const rightWave = Math.sin((vy + 40) * 0.08) * 3;
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rx - 5 + rightWave, vy);
      ctx.quadraticCurveTo(rx - 7, vy + 7, rx - 6 + rightWave, vy + 14);
      ctx.stroke();

      // Right Leaves
      const rleafX = rx + 4 - rightWave;
      ctx.fillStyle = '#0a3622';
      ctx.beginPath();
      ctx.ellipse(rleafX + 2, vy + 2, 9, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.ellipse(rleafX, vy + 3, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(rleafX - 1, vy + 4, 7, 4.5, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(rleafX - 2, vy + 5, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.fillRect(rx - 7, vy + 5, 2, 2);

      // Small tendril curl on right
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rx + 8, vy + 8, 3, Math.PI, Math.PI * 2.2);
      ctx.stroke();

      // Flower Blossoms — 4 varieties cycling
      const vStep = Math.floor(vy / 14);
      if (vStep % 4 === 0) {
        // Golden yellow flower
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(padX - 7, vy + 1, 4, 3);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(padX - 6, vy + 2, 2, 1);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(rx + 4, vy + 1, 4, 3);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(rx + 5, vy + 2, 2, 1);
      } else if (vStep % 4 === 1) {
        // Coral pink blossom
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(padX - 8, vy, 5, 4);
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(padX - 7, vy + 1, 3, 2);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(rx + 4, vy, 5, 4);
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(rx + 5, vy + 1, 3, 2);
      } else if (vStep % 4 === 2) {
        // Orange bud
        ctx.fillStyle = '#f97316';
        ctx.fillRect(padX - 6, vy + 1, 3, 3);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(rx + 5, vy + 1, 3, 3);
      } else {
        // Purple violet flower
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(padX - 7, vy + 1, 4, 3);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(padX - 6, vy + 2, 2, 1);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(rx + 4, vy + 1, 4, 3);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(rx + 5, vy + 2, 2, 1);
      }
    }
  }

  /**
   * Render the project card thumbnail illustration procedurally onto Canvas 2D.
   * Target size: 240 x 110 (Rich Mediterranean coastal village with sea, sky, clouds, and houses!)
   */
  public static renderThumbnail(
    ctx: CanvasRenderingContext2D,
    w: number = 240,
    h: number = 110,
    category: string = 'tvc'
  ) {
    ctx.imageSmoothingEnabled = false;

    // 1. Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    if (category === 'brand') {
      sky.addColorStop(0, '#0284c7');
      sky.addColorStop(1, '#bae6fd');
    } else {
      sky.addColorStop(0, '#38bdf8');
      sky.addColorStop(1, '#bae6fd');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 2. Fluffy white cumulus clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    for (const [cx, cy, cw] of [[32, 22, 42], [115, 16, 52], [195, 24, 34]]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, cw / 2, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx + 2, cy - 3, cw / 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Distant blue-gray mountain headlands
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(48, 38);
    ctx.lineTo(105, 56);
    ctx.lineTo(105, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 4. Sparkling Turquoise Ocean
    const ocean = ctx.createLinearGradient(0, 50, 0, h);
    ocean.addColorStop(0, '#0284c7');
    ocean.addColorStop(0.4, '#0ea5e9');
    ocean.addColorStop(1, '#38bdf8');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 50, w, h - 50);

    // 5. Wave ripple streaks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (const [wx, wy, wl] of [
      [14, 58, 24], [64, 66, 32], [24, 78, 28], [72, 86, 36], [32, 96, 26]
    ]) {
      ctx.fillRect(wx, wy, wl, 1.5);
    }

    // 6. Coastal Terracotta & Blue-Roofed Town on right hillside
    for (const [hx, hy] of [
      [125, 42], [148, 34], [174, 40], [202, 36],
      [136, 56], [162, 50], [188, 58], [214, 52],
      [150, 74], [176, 68], [204, 76]
    ]) {
      // White wall
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hx, hy, 18, 15);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(hx + 14, hy, 4, 15); // shade

      // Mediterranean Blue Window
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(hx + 4, hy + 5, 6, 6);
      // Window highlight
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(hx + 5, hy + 6, 2, 2);

      // Terracotta pitched roof
      ctx.fillStyle = category === 'brand' ? '#b45309' : '#ea580c';
      ctx.beginPath();
      ctx.moveTo(hx - 2, hy);
      ctx.lineTo(hx + 9, hy - 8);
      ctx.lineTo(hx + 20, hy);
      ctx.closePath();
      ctx.fill();

      // Roof shade
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(hx + 9, hy - 8, 11, 8);

      // Green cypress tree
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(hx - 6, hy + 15);
      ctx.lineTo(hx - 2, hy - 6);
      ctx.lineTo(hx + 2, hy + 15);
      ctx.closePath();
      ctx.fill();
      // Cypress highlight
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(hx - 3, hy, 2, 4);
    }

    // 7. Small sailboat on the ocean
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(72, 62, 12, 4);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(78, 62);
    ctx.lineTo(78, 48);
    ctx.lineTo(86, 60);
    ctx.closePath();
    ctx.fill();
    // Mast
    ctx.fillStyle = '#78350f';
    ctx.fillRect(77, 48, 1.5, 18);

    // 8. Sun glare sparkles on water
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (const [sx, sy] of [
      [45, 70], [85, 82], [55, 90], [100, 74], [30, 86]
    ]) {
      ctx.fillRect(sx, sy, 3, 1);
      ctx.fillRect(sx + 1, sy - 1, 1, 3);
    }

    // 9. Small flowering bushes near waterfront houses
    for (const [bx, by] of [[140, 70], [190, 72], [210, 66]]) {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(bx, by, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(bx - 1, by - 1, 2, 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(bx + 2, by, 2, 2);
    }
  }
}
