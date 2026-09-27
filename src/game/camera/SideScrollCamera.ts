import Phaser from 'phaser';

export class SideScrollCamera {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private currentLookAheadX = 0;
  private readonly maxLookAhead = 40;

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
  }

  public update(targetX: number, targetY: number, facing: 1 | -1, isMoving: boolean) {
    // 1. Look-ahead calculation
    const targetLookAhead = isMoving ? facing * this.maxLookAhead : 0;
    this.currentLookAheadX += (targetLookAhead - this.currentLookAheadX) * 0.05;

    // 2. Desired camera center
    const desiredX = targetX + this.currentLookAheadX;
    // Follow Y slowly so the uphill elevation of Future Hill gently frames the scene
    const desiredY = targetY - 45; // Camera centered slightly above player feet

    // 3. Smooth Lerp
    const currentScrollX = this.camera.scrollX + this.camera.width / 2;
    const currentScrollY = this.camera.scrollY + this.camera.height / 2;

    const newScrollX = currentScrollX + (desiredX - currentScrollX) * 0.08;
    const newScrollY = currentScrollY + (desiredY - currentScrollY) * 0.05;

    // Center camera on smoothed position
    this.camera.centerOn(newScrollX, newScrollY);
  }

  public setBounds(minX: number, minY: number, width: number, height: number) {
    this.camera.setBounds(minX, minY, width, height);
  }
}
