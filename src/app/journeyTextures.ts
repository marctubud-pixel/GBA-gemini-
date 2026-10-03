import type Phaser from 'phaser';

type PixelTexture = { image: CanvasImageSource; x: number; y: number; width: number; height: number };
const textures = new Map<string, PixelTexture[]>();
const KEYS = ['sky_cloud_large', 'sky_cloud_medium', 'sky_cloud_small', 'seagull_sheet',
  'prop_sailboat', 'prop_tree', 'prop_cypress', 'prop_lamp', 'prop_bush', 'prop_planter_urn',
  'prop_bench_seaside', 'prop_bollard_rope', 'prop_stone_wall', 'prop_boulder',
  'landmark_observatory', 'bike_parked', 'bike_ride_sheet'];

/** Reuse the world's actual sprites, including the supplied character/bike sheets. */
export function registerJourneyTextures(manager: Phaser.Textures.TextureManager) {
  textures.clear();
  for (const key of KEYS) {
    if (!manager.exists(key)) continue;
    const texture = manager.get(key);
    const names = texture.getFrameNames();
    const frames = names.length ? names.map(name => texture.get(name)) : [texture.get()];
    textures.set(key, frames.map(frame => ({ image: frame.source.image as CanvasImageSource,
      x: frame.cutX, y: frame.cutY, width: frame.cutWidth, height: frame.cutHeight })));
  }
}

export function clearJourneyTextures() { textures.clear(); }

/** x/y anchor the bottom centre, matching world props. */
export function drawJourneyTexture(context: CanvasRenderingContext2D, key: string,
  x: number, y: number, scale = 1, frame = 0) {
  const frames = textures.get(key);
  if (!frames?.length) return false;
  const sprite = frames[((Math.floor(frame) % frames.length) + frames.length) % frames.length];
  const width = Math.round(sprite.width * scale), height = Math.round(sprite.height * scale);
  context.drawImage(sprite.image, sprite.x, sprite.y, sprite.width, sprite.height,
    Math.round(x - width / 2), Math.round(y - height), width, height);
  return true;
}
