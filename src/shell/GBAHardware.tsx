import { useId } from 'react';

export type GBAControl = 'left' | 'right' | 'up' | 'down' | 'j' | 'k';
export type GBAPressedKeys = Record<GBAControl, boolean>;
export const GBA_COLORS = {
  'classic-grey': { label: '经典灰', swatch: '#b9c1b3', image: '/media/hardware/gba-physical-classic-grey.png' },
  indigo: { label: '经典紫', swatch: '#7160ae', image: '/media/hardware/gba-physical-indigo.png' },
  gold: { label: '香槟金', swatch: '#c3a36c', image: '/media/hardware/gba-physical-gold.png' },
} as const;
export type GBAColor = keyof typeof GBA_COLORS;

// Uniformly fit the photographed 1570 × 838 body into 800 × 450.
// All three photographs share the same aperture and control geometry.
const PHOTO_SCALE = 776 / 1570;
const PHOTO_X = 12 - 45 * PHOTO_SCALE;
const PHOTO_Y = (450 - 838 * PHOTO_SCALE) / 2 - 57 * PHOTO_SCALE;
type HardwareRect = [number, number, number, number];
const photoRect = (x: number, y: number, width: number, height: number): HardwareRect =>
  [PHOTO_X + x * PHOTO_SCALE, PHOTO_Y + y * PHOTO_SCALE, width * PHOTO_SCALE, height * PHOTO_SCALE];

export const GBA_LCD_RECT = photoRect(519, 238, 618, 405);
export const GBA_SMALL_HIT_AREAS = {
  start: photoRect(334, 581, 54, 54),
  select: photoRect(334, 661, 54, 54),
};
export const GBA_HIT_AREAS: Record<GBAControl, HardwareRect> = {
  up: photoRect(220, 310, 71, 61), down: photoRect(220, 441, 71, 60),
  left: photoRect(156, 374, 63, 72), right: photoRect(291, 374, 62, 72),
  j: photoRect(1265, 394, 108, 108), k: photoRect(1418, 336, 108, 108),
};
export const hardwarePosition = (x: number, y: number, width: number, height: number) => ({
  left: `${x / 8}%`, top: `${y / 4.5}%`, width: `${width / 8}%`, height: `${height / 4.5}%`,
});

// Display mask follows the physical silhouette, excluding stray cutout specks.
// Keep the original transparent photographs unmodified.
const silhouette = '1564,193 1548,165 1529,145 1509,131 1490,123 1443,115 1278,97 1212,67 1175,59 1147,57 506,58 454,66 387,96 207,116 167,124 145,135 120,157 104,179 95,202 102,226 100,236 88,252 68,374 54,500 45,645 45,677 50,704 63,732 77,751 96,769 124,785 167,786 461,870 529,880 640,889 763,894 898,894 1007,890 1141,879 1237,862 1327,832 1496,787 1527,789 1537,786 1566,768 1589,744 1606,712 1614,679 1610,559 1600,439 1576,262 1570,245 1562,237 1560,226 1566,210';
const cross = 'M 230 314 H 280 Q 292 314 292 327 V 373 H 337 Q 351 373 351 388 V 429 Q 351 444 336 444 H 291 V 489 Q 291 503 279 503 H 232 Q 219 503 219 489 V 444 H 173 Q 158 444 158 429 V 389 Q 158 375 173 375 H 219 V 327 Q 219 314 230 314 Z';

export function GBAHardware({ pressed, color }: { pressed: GBAPressedKeys; color: GBAColor }) {
  const id = useId().replace(/:/g, '');
  const directionPressed = pressed.up || pressed.down || pressed.left || pressed.right;
  return <svg className="gba-hardware" viewBox="0 0 800 450" aria-hidden="true" data-material="photographic">
    <g transform={`translate(${PHOTO_X} ${PHOTO_Y}) scale(${PHOTO_SCALE})`}>
      <defs><clipPath id={`${id}-silhouette`}><polygon points={silhouette} /></clipPath></defs>
      <image href={GBA_COLORS[color].image} width="1659" height="948" clipPath={`url(#${id}-silhouette)`} />
      {/* Press feedback darkens the photographed cap, retaining its real texture. */}
      <path d={cross} fill="#000" opacity={directionPressed ? .22 : 0} data-gba-pressed={directionPressed ? 'dpad' : undefined} />
      {([{ control: 'j', x: 1319, y: 448 }, { control: 'k', x: 1472, y: 390 }] as const).map(({ control, x, y }) =>
        <circle key={control} cx={x} cy={y} r="51" fill="#000" opacity={pressed[control] ? .2 : 0}
          data-gba-pressed={pressed[control] ? control : undefined} />)}
    </g>
  </svg>;
}
