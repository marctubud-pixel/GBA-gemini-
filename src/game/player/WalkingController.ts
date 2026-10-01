import Phaser from 'phaser';
import { pixelSound } from '../audio/PixelSoundManager';

export class WalkingController {
  public sprite: Phaser.GameObjects.Sprite;
  public velocityX = 0;
  public facing: 1 | -1 = 1;

  private readonly walkSpeed = 113;
  private footstepTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x, y, 'character_walk_sheet', 0);
    this.sprite.setOrigin(0.5, 1.0);
    this.sprite.setDepth(21);
    this.sprite.setVisible(false);

    // Animations
    if (!scene.anims.exists('char_walk')) {
      const frames = scene.anims.generateFrameNumbers('character_walk_sheet', { start: 0, end: 3 });
      if (frames && frames.length > 0) {
        scene.anims.create({
          key: 'char_walk',
          frames: frames,
          frameRate: 8,
          repeat: -1
        });
      }
    }

    if (!scene.anims.exists('char_idle')) {
      const frames = scene.anims.generateFrameNumbers('character_idle_sheet', { start: 0, end: 1 });
      if (frames && frames.length > 0) {
        scene.anims.create({
          key: 'char_idle',
          frames: frames,
          frameRate: 2,
          repeat: -1
        });
      }
    }
  }

  public update(delta: number, leftPressed: boolean, rightPressed: boolean) {
    const dt = Math.min(delta / 1000, 0.033);

    if (rightPressed && !leftPressed) {
      this.facing = 1;
      this.sprite.setFlipX(false);
      this.velocityX = this.walkSpeed;
      if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim?.key !== 'char_walk') {
        this.sprite.play('char_walk');
      }
    } else if (leftPressed && !rightPressed) {
      this.facing = -1;
      this.sprite.setFlipX(true);
      this.velocityX = -this.walkSpeed;
      if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim?.key !== 'char_walk') {
        this.sprite.play('char_walk');
      }
    } else {
      this.velocityX = 0;
      if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim?.key !== 'char_idle') {
        this.sprite.play('char_idle');
      }
      this.footstepTimer = 0;
    }

    // Play footstep sounds synchronized with the 8fps walk cycle
    if (Math.abs(this.velocityX) > 10) {
      this.footstepTimer += delta;
      if (this.footstepTimer >= 240) {
        this.footstepTimer = 0;
        pixelSound.playFootstep();
      }
    }

    this.sprite.x += this.velocityX * dt;
  }

  public setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
  }

  public setVisible(visible: boolean) {
    this.sprite.setVisible(visible);
    if (!visible) {
      this.velocityX = 0;
      this.sprite.stop();
    } else {
      this.sprite.play('char_idle');
    }
  }

  public setAlpha(alpha: number) {
    this.sprite.setAlpha(alpha);
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
