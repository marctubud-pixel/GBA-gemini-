import Phaser from 'phaser';
import { pixelSound } from '../audio/PixelSoundManager';

export class BikeController {
  public sprite: Phaser.GameObjects.Sprite;
  public velocityX = 0;
  public facing: 1 | -1 = 1; // 1 = right, -1 = left

  private readonly baseMaxSpeed = 255;
  private readonly slowZoneMaxSpeed = 165;
  private readonly acceleration = 510;
  private readonly deceleration = 413;
  private readonly brakeDeceleration = 1250; // Active brake friction (K key)

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x, y, 'bike_ride_sheet', 0);
    this.sprite.setOrigin(0.5, 1.0);
    this.sprite.setDepth(20);

    // Create animation if not already created
    if (!scene.anims.exists('bike_pedal')) {
      const frames = scene.anims.generateFrameNumbers('bike_ride_sheet', { start: 0, end: 3 });
      if (frames && frames.length > 0) {
        scene.anims.create({
          key: 'bike_pedal',
          frames: frames,
          frameRate: 10,
          repeat: -1
        });
      }
    }
  }

  public update(
    delta: number,
    leftPressed: boolean,
    rightPressed: boolean,
    acceleratePressed: boolean,
    brakePressed: boolean,
    isSlowZone: boolean,
    slopeFactor: number
  ) {
    const dt = Math.min(delta / 1000, 0.033);
    const targetMaxSpeed = (isSlowZone ? this.slowZoneMaxSpeed : this.baseMaxSpeed) * slopeFactor;

    if (brakePressed) {
      // Active Brake (K key): Rapid emergency deceleration
      if (this.velocityX > 0) {
        this.velocityX = Math.max(0, this.velocityX - this.brakeDeceleration * dt);
      } else if (this.velocityX < 0) {
        this.velocityX = Math.min(0, this.velocityX + this.brakeDeceleration * dt);
      }
    } else if (acceleratePressed || (rightPressed && !leftPressed)) {
      // Accelerate (J key or Right / D): Accelerate forward (right)
      this.facing = 1;
      this.sprite.setFlipX(false);
      this.velocityX = Math.min(this.velocityX + this.acceleration * dt, targetMaxSpeed);
    } else if (leftPressed && !rightPressed) {
      // Steer / pedal left
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

    // Animation & Continuous Sound state
    if (Math.abs(this.velocityX) > 15) {
      if (!this.sprite.anims.isPlaying) {
        this.sprite.play('bike_pedal');
      }
      // Speed up animation rate proportionally to velocity
      const animRate = Math.max(4, Math.min(14, (Math.abs(this.velocityX) / targetMaxSpeed) * 12));
      this.sprite.anims.timeScale = animRate / 10;

      // Play smooth continuous road rolling whir and chain purr
      const speedRatio = Math.min(1.0, Math.abs(this.velocityX) / this.baseMaxSpeed);
      pixelSound.updateBikeRoll(speedRatio);
    } else {
      this.sprite.stop();
      this.sprite.setFrame(0);
      pixelSound.updateBikeRoll(0);
    }
  }

  public setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
  }

  public setRotation(angle: number) {
    this.sprite.setRotation(angle);
  }

  public setVisible(visible: boolean) {
    this.sprite.setVisible(visible);
    if (!visible) {
      this.velocityX = 0;
      this.sprite.stop();
      pixelSound.stopBikeRoll();
    }
  }

  public get x(): number {
    return this.sprite.x;
  }

  public set x(value: number) {
    this.sprite.x = value;
  }

  public get y(): number {
    return this.sprite.y;
  }

  public set y(value: number) {
    this.sprite.y = value;
  }
}
