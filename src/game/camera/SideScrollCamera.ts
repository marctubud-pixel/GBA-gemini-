import Phaser from 'phaser';

export class SideScrollCamera {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private targetZoom = 1.4;

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
    this.camera.setZoom(1.4);
  }

  public initCenter(targetX: number, targetY: number) {
    this.camera.centerOn(targetX, targetY - 85);
  }

  public setTargetZoom(zoom: number) {
    this.targetZoom = zoom;
  }

  public get currentCamera(): Phaser.Cameras.Scene2D.Camera {
    return this.camera;
  }

  public update(targetX: number, targetY: number, facing: 1 | -1, isMoving: boolean, delta: number = 16.6) {
    const dt = Math.min(delta / 1000, 0.033);

    // 1. Smooth Zoom transition
    const currentZoom = this.camera.zoom;
    if (Math.abs(currentZoom - this.targetZoom) > 0.002) {
      const zoomLerp = 1 - Math.exp(-6 * dt);
      this.camera.setZoom(currentZoom + (this.targetZoom - currentZoom) * zoomLerp);
    }

    // 2. Desired camera center:
    // Horizontally: follow player directly (desiredX = targetX)
    // This completely eliminates:
    // - Camera wobble / rebound / rocking when stopping
    // - Micro-stutter caused by camera lerp rounding discrepancies
    const desiredX = targetX;

    // Vertically: smoothly follow ground contour (framed cleanly matching reference art: ample sky above, narrow sea below)
    const desiredY = targetY - 85;
    const currentScrollY = this.camera.scrollY + this.camera.height / 2;
    const yLerp = 1 - Math.exp(-6 * dt);
    const newScrollY = currentScrollY + (desiredY - currentScrollY) * yLerp;

    // Center camera on target
    this.camera.centerOn(desiredX, newScrollY);
  }

  public setBounds(minX: number, minY: number, width: number, height: number) {
    this.camera.setBounds(minX, minY, width, height);
  }
}
