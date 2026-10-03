import { useId } from 'react';

export type GBAControl = 'left' | 'right' | 'up' | 'down' | 'j' | 'k';
export type GBAPressedKeys = Record<GBAControl, boolean>;
export const GBA_COLORS = {
  'classic-grey': { label: '经典灰', swatch: '#b9c1b3' },
  indigo: { label: '经典紫', swatch: '#7160ae' },
  gold: { label: '香槟金', swatch: '#c3a36c' },
} as const;
export type GBAColor = keyof typeof GBA_COLORS;

// All hardware and hit areas share the same 800 × 450 coordinate space.
// The widescreen aperture is 168,84 / 464 × 261; scene coordinates stay unchanged.
export const GBA_HIT_AREAS: Record<GBAControl, [number, number, number, number]> = {
  up: [63, 181, 28, 27], down: [63, 234, 28, 27],
  left: [37, 208, 27, 27], right: [90, 208, 27, 27],
  j: [679, 211, 44, 44], k: [722, 174, 44, 44],
};
export const hardwarePosition = (x: number, y: number, width: number, height: number) => ({
  left: `${x / 8}%`, top: `${y / 4.5}%`, width: `${width / 8}%`, height: `${height / 4.5}%`,
});

const body = 'M 150 36 C 118 34 74 35 46 49 Q 25 60 22 87 L 16 330 Q 15 379 43 394 C 113 426 231 432 400 436 C 569 432 687 426 757 394 Q 785 379 784 330 L 778 87 Q 775 60 754 49 C 726 35 682 34 650 36 C 578 25 491 24 400 24 C 309 24 222 25 150 36 Z';
const cross = 'M 66 184 Q 63 184 63 187 L 63 208 L 42 208 Q 39 208 39 211 L 39 232 Q 39 235 42 235 L 63 235 L 63 256 Q 63 259 66 259 L 88 259 Q 91 259 91 256 L 91 235 L 112 235 Q 115 235 115 232 L 115 211 Q 115 208 112 208 L 91 208 L 91 187 Q 91 184 88 184 Z';

export function GBAHardware({ pressed, color }: { pressed: GBAPressedKeys; color: GBAColor }) {
  const id = useId().replace(/:/g, '');
  const paint = (name: string) => `url(#${id}-${name})`;
  const directionPressed = pressed.up || pressed.down || pressed.left || pressed.right;
  const tiltX = pressed.right ? 1.2 : pressed.left ? -1.2 : 0;
  const tiltY = pressed.down ? 1.2 : pressed.up ? -1.2 : 0;
  return <svg className="gba-hardware" viewBox="0 0 800 450" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-plastic`} x1="0" y1="0" x2=".2" y2="1">
        <stop offset="0" stopColor="var(--gba-plastic-0)" /><stop offset=".16" stopColor="var(--gba-plastic-1)" />
        <stop offset=".5" stopColor="var(--gba-plastic-2)" /><stop offset=".82" stopColor="var(--gba-plastic-3)" /><stop offset="1" stopColor="var(--gba-plastic-4)" />
      </linearGradient>
      <radialGradient id={`${id}-light`} cx=".32" cy=".05" r=".9">
        <stop stopColor="#ffffff" stopOpacity=".27" /><stop offset=".5" stopColor="#eceee7" stopOpacity=".07" /><stop offset="1" stopColor="#343b33" stopOpacity=".3" />
      </radialGradient>
      <linearGradient id={`${id}-rim`} x2="0" y2="1"><stop stopColor="var(--gba-rim-hi)" /><stop offset=".18" stopColor="var(--gba-rim-mid)" /><stop offset="1" stopColor="var(--gba-rim-dark)" /></linearGradient>
      <linearGradient id={`${id}-lens`} x2=".25" y2="1"><stop stopColor="#28282d" /><stop offset=".4" stopColor="#101014" /><stop offset="1" stopColor="#25252a" /></linearGradient>
      <linearGradient id={`${id}-lensEdge`} x2="0" y2="1"><stop stopColor="var(--gba-rim-dark)" /><stop offset=".5" stopColor="var(--gba-plastic-3)" /><stop offset="1" stopColor="var(--gba-rim-hi)" /></linearGradient>
      <linearGradient id={`${id}-button`} x2=".25" y2="1"><stop stopColor="var(--gba-button-hi)" /><stop offset=".22" stopColor="var(--gba-button-mid)" /><stop offset=".6" stopColor="var(--gba-button-low)" /><stop offset="1" stopColor="var(--gba-button-edge)" /></linearGradient>
      <linearGradient id={`${id}-pressed`} x2="0" y2="1"><stop stopColor="var(--gba-button-low)" /><stop offset="1" stopColor="var(--gba-button-mid)" /></linearGradient>
      <linearGradient id={`${id}-silverShoulder`} x2=".15" y2="1"><stop stopColor="#f2f1ed" /><stop offset=".4" stopColor="#bdc1ba" /><stop offset="1" stopColor="#8b9188" /></linearGradient>
      <linearGradient id={`${id}-leftShoulder`} x2=".15" y2="1"><stop stopColor="#6cab7c" /><stop offset=".4" stopColor="#288450" /><stop offset="1" stopColor="#195d38" /></linearGradient>
      <linearGradient id={`${id}-rightShoulder`} x2=".15" y2="1"><stop stopColor="#6d80c9" /><stop offset=".4" stopColor="#3e52a4" /><stop offset="1" stopColor="#263a7b" /></linearGradient>
      <radialGradient id={`${id}-yellow`} cx=".35" cy=".22" r=".9"><stop stopColor="#f6dd6a" /><stop offset=".5" stopColor="#d8bc3a" /><stop offset="1" stopColor="#a58619" /></radialGradient>
      <radialGradient id={`${id}-red`} cx=".35" cy=".22" r=".9"><stop stopColor="#f68062" /><stop offset=".5" stopColor="#cc442c" /><stop offset="1" stopColor="#912a20" /></radialGradient>
      <radialGradient id={`${id}-recess`}><stop offset=".65" stopColor="var(--gba-plastic-3)" /><stop offset=".88" stopColor="var(--gba-rim-dark)" /><stop offset="1" stopColor="var(--gba-rim-mid)" /></radialGradient>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" seed="12" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <clipPath id={`${id}-bodyClip`}><path d={body} /></clipPath>
      <filter id={`${id}-buttonShadow`} x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="2.5" stdDeviation="1.2" floodOpacity=".65" /></filter>
    </defs>

    {/* Rear housing, shoulder triggers, seam, and curved front injection mould. */}
    <path d={body} transform="translate(0 7)" fill="var(--gba-rim-dark)" stroke="var(--gba-seam)" strokeWidth="3" />
    {[false, true].map(right => <g key={String(right)} transform={right ? 'translate(800 0) scale(-1 1)' : undefined}>
      <path d="M 34 69 C 34 36 73 20 121 22 L 151 35 L 135 52 Z" fill={paint(color === 'classic-grey' ? right ? 'rightShoulder' : 'leftShoulder' : 'silverShoulder')} stroke="var(--gba-seam)" strokeWidth="2" />
      <path d="M 47 45 C 68 26 110 22 137 31" fill="none" stroke="#f9faff" strokeOpacity=".5" strokeWidth="2" />
    </g>)}
    <path d={body} fill={paint('plastic')} stroke={paint('rim')} strokeWidth="3" />
    <path d={body} fill={paint('light')} />
    <g clipPath={paint('bodyClip')} opacity={color === 'gold' ? '.2' : '.14'} style={{ mixBlendMode: 'soft-light' }}><rect width="800" height="450" filter={paint('grain')} /></g>
    <path d="M 22 126 L 21 329 Q 19 374 45 387 M 778 126 L 779 329 Q 781 374 755 387" fill="none" stroke="var(--gba-seam)" strokeOpacity=".55" strokeWidth="2" />
    <path d="M 24 188 L 29 88 Q 30 65 51 55 C 81 40 113 41 141 42 M 154 39 C 232 28 319 30 400 29 C 481 30 568 28 646 39" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="1.6" />
    <path d="M 47 397 C 118 424 231 428 400 429 C 569 428 682 424 753 397" fill="none" stroke="#f0f2ec" strokeOpacity=".25" />

    {/* Recessed smoked glass lens and a separate bevel around the LCD. */}
    <rect x="148" y="58" width="504" height="335" rx="18" fill="var(--gba-rim-dark)" stroke="var(--gba-rim-hi)" strokeOpacity=".42" strokeWidth="1.5" />
    <rect x="150" y="60" width="500" height="331" rx="17" fill={paint('lensEdge')} />
    <rect x="152" y="62" width="496" height="327" rx="15" fill={paint('lens')} stroke="#08090e" strokeWidth="2" />
    <path d="M 167 64 H 632 Q 645 64 645 79 V 151" fill="none" stroke="#fff" strokeOpacity=".12" />
    <rect x="165" y="81" width="470" height="267" rx="2" fill="#030405" stroke="#6e6e78" strokeOpacity=".45" />
    <path d="M 157 72 L 305 65 L 245 79 L 166 79 Z" fill="#fff" opacity=".06" />
    <text x="400" y="384" textAnchor="middle" fill="#c2c2c8" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fontStyle="italic" letterSpacing="1.7">GAME BOY ADVANCE</text>
    <rect x="370" y="32" width="60" height="16" rx="8" fill="none" stroke="var(--gba-rim-dark)" strokeWidth=".8" />
    <text x="400" y="44" textAnchor="middle" fill="var(--gba-mark)" fillOpacity=".8" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" letterSpacing=".6">Nintendo</text>
    <text x="69" y="53" fill="var(--gba-mark)" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700">L</text>
    <text x="724" y="53" fill="var(--gba-mark)" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700">R</text>

    {/* D-pad: engraved directional marks with a tilted, depressed surface. */}
    <path d={cross} fill="var(--gba-seam)" stroke="var(--gba-rim-hi)" strokeOpacity=".3" strokeWidth="4" />
    <path d={cross} transform="translate(0 2)" fill="#11131c" stroke="#262736" strokeWidth="2" />
    <g transform={`translate(${tiltX} ${tiltY})`}>
      <path d={cross} fill={paint(directionPressed ? 'pressed' : 'button')} stroke="var(--gba-button-edge)" strokeWidth="1.4" filter={directionPressed ? undefined : paint('buttonShadow')} />
      <path d="M 65 206 V 188 Q 65 186 68 186 H 87 M 43 210 H 62" fill="none" stroke="#b3b6bd" strokeOpacity={directionPressed ? '.12' : '.3'} />
      <circle cx="77" cy="222" r="9.5" fill="var(--gba-button-low)" stroke="var(--gba-button-edge)" strokeWidth=".8" />
      <path d="M 71 223 A 7 7 0 0 1 81 216" fill="none" stroke="#84868d" strokeOpacity=".2" />
      <g fill="var(--gba-button-edge)" stroke="#898c93" strokeOpacity=".15" strokeWidth=".6"><path d="M 73 199 L 77 193 L 81 199 Z" /><path d="M 73 245 L 77 251 L 81 245 Z" /><path d="M 52 217 L 46 221 L 52 225 Z" /><path d="M 102 217 L 108 221 L 102 225 Z" /></g>
    </g>

    {/* Original diagonal A/B placement. Keyboard actions remain K/J. */}

    {([{ control: 'j', x: 701, y: 233, label: 'B' }, { control: 'k', x: 744, y: 196, label: 'A' }] as const).map(({ control, x, y, label }) => <g key={control}>
      <circle cx={x} cy={y + 1.5} r="22" fill="var(--gba-rim-dark)" stroke="var(--gba-rim-hi)" strokeOpacity=".5" />
      <g transform={`translate(0 ${pressed[control] ? 2 : 0})`}>
        <circle cx={x} cy={y} r="20" fill={paint(color === 'classic-grey' ? control === 'j' ? 'yellow' : 'red' : pressed[control] ? 'pressed' : 'button')} stroke={color === 'classic-grey' ? control === 'j' ? '#9c852c' : '#a93b2c' : 'var(--gba-button-edge)'} strokeWidth="1.1" filter={pressed[control] ? undefined : paint('buttonShadow')} />
        <path d={`M ${x - 15} ${y - 8} A 17 17 0 0 1 ${x + 7} ${y - 15}`} fill="none" stroke="#fffbda" strokeOpacity={pressed[control] ? '.08' : '.25'} />
        <text x={x} y={y + 5} textAnchor="middle" fill={color === 'classic-grey' ? control === 'j' ? '#ae9229' : '#9a3024' : 'var(--gba-button-edge)'} stroke="#fff3c9" strokeOpacity=".18" strokeWidth=".6" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="16">{label}</text>
      </g>
    </g>)}
    <circle cx="715" cy="108" r="4.5" fill="#606a5b" stroke="#d4dacd" strokeWidth="1" />
    <circle cx="715" cy="107.5" r="2.7" fill="#91e887" />
    <circle cx="714.4" cy="106.7" r=".9" fill="#f4ffda" opacity=".85" />
    <text x="730" y="110" fill="var(--gba-mark)" fontFamily="Arial, sans-serif" fontSize="5.5" letterSpacing=".6">POWER</text>

    {/* Parallel speaker slots on the lower right, like the reference shell. */}
    {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(695 ${294 + i * 10}) rotate(-14)`}>
      <rect width="53" height="3.3" rx="1.65" fill="var(--gba-seam)" />
      <path d="M 2 3.5 H 51" stroke="var(--gba-rim-hi)" strokeOpacity=".65" strokeWidth=".8" />
    </g>)}
  </svg>;
}
