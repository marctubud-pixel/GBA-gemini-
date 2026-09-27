import Phaser from 'phaser';

export class BikeController {
  public sprite: Phaser.GameObjects.Sprite;
  public velocityX = 0;
  public facing: 1 | -1 = 1; // 1 = right, -1 = left

  private readonly baseMaxSpeed = 190;
  private readonly slowZoneMaxSpeed = 110;
  private readonly acceleration = 340;
  private readonly deceleration = 420;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x, y, 'bike_ride_sheet', 0);
    this.sprite.setOrigin(0.5, 0.95);
    this.sprite.setDepth(20);

    // Create animation if not already created
    if (!scene.anims.exists('bike_pedal')) {
      scene.anims.create({
        key: 'bike_pedal',
        frames: scene.anims.generateFrameNumbers('bike_ride_sheet', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
  }

  public update(
    delta: number,
    leftPressed: boolean,
    rightPressed: boolean,
    isSlowZone: boolean,
    slopeFactor: number
  ) {
    const dt = delta / 1000;
    const targetMaxSpeed = (isSlowZone ? this.slowZoneMaxSpeed : this.baseMaxSpeed) * slopeFactor;

    if (rightPressed && !leftPressed) {
      this.facing = 1;
      this.sprite.setFlipX(false);
      this.velocityX = Math.min(this.velocityX + this.acceleration * dt, targetMaxSpeed);
    } else if (leftPressed && !rightPressed) {
      this.facing = -1;
      this.sprite.setFlipX(true);
      this.velocityX = Math.max(this.velocityX - this.acceleration * dt, -targetMaxSpeed);
    } else {
      // Natural deceleration / coasting friction
      if (this.velocityX > 0) {
        this.velocityX = Math.max(0, this.velocityX - this.deceleration * dt);
      } else if (this.velocityX < 0) {
        this.velocityX = Math.min(0, this.velocityX + this.deceleration * dt);
      }
    }

    // Move sprite
    this.sprite.x += this.velocityX * dt;

    // Animation state
    if (Math.abs(this.velocityX) > 15) {
      if (!this.sprite.anims.isPlaying) {
        this.sprite.play('bike_pedal');
      }
      // Speed up animation rate proportionally to velocity
      const animRate = Math.max(4, Math.min(14, (Math.abs(this.velocityX) / targetMaxSpeed) * 12));
      this.sprite.anims.timeScale = animRate / 10;
    } else {
      this.sprite.stop();
      this.sprite.setFrame(0);
    }
  }

  public setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
  }

  public setVisible(visible: boolean) {
    this.sprite.setVisible(visible);
    if (!visible) {
      this.velocityX = 0;
      this.sprite.stop();
    }
  }

  public get x(): number {
    return this.sprite.x;
  }

  public get y(): number {
    return this.sprite.y;
  }
}
