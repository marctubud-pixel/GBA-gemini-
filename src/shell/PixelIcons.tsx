import React from 'react';

/**
 * PixelIcons.tsx
 * 
 * 100% Crisp GBA 16-Bit Pixel-Art SVG Icons
 * Replaces all OS emojis with authentic, resolution-aligned pixel icons.
 * All shapes use shapeRendering="crispEdges" with whole integer pixel coordinates.
 */

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// 1. Palm Tree (16 x 16)
export const PixelPalmTree: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Trunk */}
    <rect x="7" y="7" width="2" height="9" fill="#78350f" />
    <rect x="6" y="10" width="1" height="2" fill="#92400e" />
    <rect x="9" y="12" width="1" height="2" fill="#92400e" />
    {/* Fronds */}
    <rect x="6" y="2" width="4" height="2" fill="#15803d" />
    <rect x="4" y="3" width="8" height="2" fill="#16a34a" />
    <rect x="2" y="5" width="4" height="2" fill="#22c55e" />
    <rect x="10" y="5" width="4" height="2" fill="#22c55e" />
    <rect x="1" y="7" width="3" height="2" fill="#15803d" />
    <rect x="12" y="7" width="3" height="2" fill="#15803d" />
  </svg>
);

// 2. Seashell (14 x 14)
export const PixelShell: React.FC<IconProps> = ({ size = 14, className = '', color = '#fbcfe8' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    <rect x="3" y="2" width="8" height="2" fill={color} />
    <rect x="2" y="4" width="10" height="3" fill="#ffffff" />
    <rect x="1" y="7" width="12" height="3" fill={color} />
    <rect x="3" y="10" width="8" height="2" fill="#f472b6" />
    <rect x="5" y="12" width="4" height="2" fill="#db2777" />
    {/* Rib lines */}
    <rect x="4" y="4" width="1" height="6" fill="#ec4899" />
    <rect x="7" y="3" width="1" height="7" fill="#ec4899" />
    <rect x="9" y="4" width="1" height="6" fill="#ec4899" />
  </svg>
);

// 3. Flying Seagull (18 x 12) - Exact model matching game main scene
export const PixelSeagull: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg width={size} height={Math.round(size * (12 / 18))} viewBox="0 0 18 12" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Body */}
    <rect x="5" y="5" width="9" height="3" fill="#ffffff" />
    <rect x="6" y="8" width="6" height="2" fill="#cbd5e1" />
    {/* Eye & Beak */}
    <rect x="13" y="6" width="1" height="1" fill="#0f172a" />
    <rect x="14" y="6" width="3" height="2" fill="#ea580c" />
    {/* Wings Up */}
    <rect x="3" y="2" width="2" height="4" fill="#64748b" />
    <rect x="5" y="1" width="3" height="4" fill="#ffffff" />
    <rect x="8" y="2" width="3" height="3" fill="#ffffff" />
    {/* Tail */}
    <rect x="1" y="6" width="4" height="2" fill="#94a3b8" />
  </svg>
);

// 4. TVC Screen (14 x 12)
export const PixelTV: React.FC<IconProps> = ({ size = 14, className = '', color = '#0284c7' }) => (
  <svg width={size} height={Math.round(size * (12 / 14))} viewBox="0 0 14 12" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Antennas */}
    <rect x="3" y="0" width="1" height="2" fill="#64748b" />
    <rect x="4" y="1" width="1" height="1" fill="#64748b" />
    <rect x="9" y="0" width="1" height="2" fill="#64748b" />
    <rect x="8" y="1" width="1" height="1" fill="#64748b" />
    {/* Cabinet */}
    <rect x="1" y="2" width="12" height="9" fill={color} />
    <rect x="2" y="3" width="8" height="6" fill="#e0f2fe" />
    {/* Screen Glint */}
    <rect x="3" y="4" width="2" height="2" fill="#ffffff" />
    {/* Dials */}
    <rect x="11" y="4" width="1" height="1" fill="#ffffff" />
    <rect x="11" y="6" width="1" height="1" fill="#ffffff" />
    {/* Feet */}
    <rect x="2" y="11" width="2" height="1" fill="#0f172a" />
    <rect x="10" y="11" width="2" height="1" fill="#0f172a" />
  </svg>
);

// 5. Price Tag (14 x 14)
export const PixelTag: React.FC<IconProps> = ({ size = 14, className = '', color = '#0284c7' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    <rect x="4" y="1" width="6" height="2" fill={color} />
    <rect x="2" y="3" width="10" height="8" fill={color} />
    <rect x="4" y="11" width="6" height="2" fill={color} />
    {/* Hole */}
    <rect x="6" y="3" width="2" height="2" fill="#ffffff" />
    {/* Inner Label Area */}
    <rect x="4" y="6" width="6" height="4" fill="#ffffff" />
    <rect x="5" y="7" width="4" height="1" fill={color} />
    <rect x="5" y="9" width="3" height="1" fill={color} />
  </svg>
);

// 6. Shopping Cart (14 x 14)
export const PixelCart: React.FC<IconProps> = ({ size = 14, className = '', color = '#0284c7' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Handle & Frame */}
    <rect x="1" y="2" width="3" height="1" fill={color} />
    <rect x="3" y="3" width="1" height="6" fill={color} />
    {/* Basket */}
    <rect x="4" y="4" width="9" height="5" fill="#e0f2fe" />
    <rect x="4" y="4" width="9" height="1" fill={color} />
    <rect x="12" y="4" width="1" height="5" fill={color} />
    <rect x="4" y="8" width="9" height="1" fill={color} />
    <rect x="7" y="5" width="1" height="3" fill={color} />
    <rect x="10" y="5" width="1" height="3" fill={color} />
    {/* Bottom Chassis & Wheels */}
    <rect x="3" y="10" width="8" height="1" fill="#0f172a" />
    <rect x="4" y="11" width="2" height="2" fill="#0f172a" />
    <rect x="9" y="11" width="2" height="2" fill="#0f172a" />
  </svg>
);

// 7. Users / Audience (14 x 14)
export const PixelUsers: React.FC<IconProps> = ({ size = 14, className = '', color = '#0284c7' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Main Person (Right/Center) */}
    <rect x="5" y="2" width="4" height="4" fill={color} />
    <rect x="4" y="7" width="6" height="6" fill={color} />
    <rect x="5" y="8" width="4" height="2" fill="#ffffff" />
    {/* Secondary Person (Left/Back) */}
    <rect x="1" y="4" width="3" height="3" fill="#60a5fa" />
    <rect x="0" y="8" width="3" height="5" fill="#60a5fa" />
    {/* Third Person (Right/Back) */}
    <rect x="10" y="4" width="3" height="3" fill="#60a5fa" />
    <rect x="11" y="8" width="3" height="5" fill="#60a5fa" />
  </svg>
);

// 8. Retro Gamepad (16 x 10)
export const PixelGamepad: React.FC<IconProps> = ({ size = 16, className = '', color = '#0284c7' }) => (
  <svg width={size} height={Math.round(size * (10 / 16))} viewBox="0 0 16 10" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Controller Body */}
    <rect x="1" y="1" width="14" height="8" fill="#e2e8f0" />
    <rect x="0" y="2" width="16" height="6" fill="#e2e8f0" />
    <rect x="0" y="2" width="16" height="1" fill="#ffffff" />
    <rect x="0" y="7" width="16" height="1" fill="#94a3b8" />
    {/* D-Pad on Left */}
    <rect x="3" y="3" width="1" height="3" fill="#0f172a" />
    <rect x="2" y="4" width="3" height="1" fill="#0f172a" />
    {/* Action Buttons on Right */}
    <rect x="12" y="3" width="1" height="1" fill="#ef4444" />
    <rect x="10" y="4" width="1" height="1" fill="#3b82f6" />
    <rect x="12" y="5" width="1" height="1" fill="#f59e0b" />
    <rect x="11" y="6" width="1" height="1" fill="#22c55e" />
  </svg>
);

// 9. Film Reel / Clapperboard (14 x 14)
export const PixelFilm: React.FC<IconProps> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Clapper Top */}
    <rect x="1" y="1" width="12" height="4" fill="#0f172a" />
    <rect x="2" y="1" width="2" height="4" fill="#ffffff" />
    <rect x="6" y="1" width="2" height="4" fill="#ffffff" />
    <rect x="10" y="1" width="2" height="4" fill="#ffffff" />
    {/* Slate Bottom */}
    <rect x="1" y="5" width="12" height="8" fill="#0284c7" />
    <rect x="3" y="7" width="4" height="1" fill="#ffffff" />
    <rect x="3" y="9" width="8" height="1" fill="#ffffff" />
  </svg>
);

// 10. Vintage Camera (14 x 12)
export const PixelCamera: React.FC<IconProps> = ({ size = 14, className = '', color = '#0284c7' }) => (
  <svg width={size} height={Math.round(size * (12 / 14))} viewBox="0 0 14 12" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Shutter Button & Flash */}
    <rect x="3" y="1" width="2" height="1" fill="#0f172a" />
    <rect x="9" y="0" width="3" height="2" fill="#94a3b8" />
    {/* Camera Body */}
    <rect x="1" y="2" width="12" height="9" fill={color} />
    <rect x="1" y="4" width="12" height="4" fill="#0f172a" />
    {/* Lens */}
    <rect x="5" y="4" width="4" height="4" fill="#94a3b8" />
    <rect x="6" y="5" width="2" height="2" fill="#0284c7" />
    <rect x="6" y="5" width="1" height="1" fill="#ffffff" />
  </svg>
);

// 11. Open Book (14 x 12)
export const PixelBook: React.FC<IconProps> = ({ size = 14, className = '' }) => (
  <svg width={size} height={Math.round(size * (12 / 14))} viewBox="0 0 14 12" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Pages Left */}
    <rect x="1" y="2" width="5" height="8" fill="#fffdf7" />
    <rect x="1" y="10" width="6" height="1" fill="#0284c7" />
    {/* Spine */}
    <rect x="6" y="2" width="2" height="9" fill="#0369a1" />
    {/* Pages Right */}
    <rect x="8" y="2" width="5" height="8" fill="#fffdf7" />
    <rect x="7" y="10" width="6" height="1" fill="#0284c7" />
    {/* Text Lines */}
    <rect x="2" y="4" width="3" height="1" fill="#94a3b8" />
    <rect x="2" y="6" width="3" height="1" fill="#94a3b8" />
    <rect x="9" y="4" width="3" height="1" fill="#94a3b8" />
    <rect x="9" y="6" width="3" height="1" fill="#94a3b8" />
  </svg>
);

// 12. Vinyl Record (14 x 14)
export const PixelDisc: React.FC<IconProps> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    <rect x="3" y="1" width="8" height="12" fill="#0f172a" />
    <rect x="1" y="3" width="12" height="8" fill="#0f172a" />
    <rect x="2" y="2" width="10" height="10" fill="#1e293b" />
    {/* Grooves */}
    <rect x="4" y="4" width="6" height="6" fill="#0f172a" />
    {/* Center Label */}
    <rect x="5" y="5" width="4" height="4" fill="#0284c7" />
    <rect x="6" y="6" width="2" height="2" fill="#fef08a" />
  </svg>
);

// 13. Bicycle (16 x 12)
export const PixelBike: React.FC<IconProps> = ({ size = 16, className = '', color = '#0284c7' }) => (
  <svg width={size} height={Math.round(size * (12 / 16))} viewBox="0 0 16 12" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Rear Wheel */}
    <rect x="1" y="6" width="4" height="5" fill="#0f172a" />
    <rect x="2" y="7" width="2" height="3" fill="#ffffff" />
    {/* Front Wheel */}
    <rect x="11" y="6" width="4" height="5" fill="#0f172a" />
    <rect x="12" y="7" width="2" height="3" fill="#ffffff" />
    {/* Frame */}
    <rect x="3" y="8" width="6" height="1" fill={color} />
    <rect x="5" y="4" width="2" height="5" fill={color} />
    <rect x="5" y="4" width="6" height="1" fill={color} />
    <rect x="10" y="4" width="2" height="5" fill={color} />
    {/* Saddle & Handlebar */}
    <rect x="4" y="3" width="3" height="1" fill="#78350f" />
    <rect x="10" y="2" width="3" height="1" fill="#0f172a" />
  </svg>
);

// 14. Robot Figure (14 x 14)
export const PixelRobot: React.FC<IconProps> = ({ size = 14, className = '', color = '#0284c7' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Head & Antenna */}
    <rect x="6" y="1" width="2" height="1" fill="#f59e0b" />
    <rect x="4" y="2" width="6" height="4" fill={color} />
    <rect x="5" y="3" width="1" height="1" fill="#ffffff" />
    <rect x="8" y="3" width="1" height="1" fill="#ffffff" />
    {/* Torso */}
    <rect x="3" y="6" width="8" height="5" fill="#3b82f6" />
    <rect x="5" y="7" width="4" height="2" fill="#e0f2fe" />
    {/* Arms */}
    <rect x="1" y="6" width="2" height="4" fill={color} />
    <rect x="11" y="6" width="2" height="4" fill={color} />
    {/* Legs */}
    <rect x="4" y="11" width="2" height="2" fill="#0f172a" />
    <rect x="8" y="11" width="2" height="2" fill="#0f172a" />
  </svg>
);

// 15. Classic Lighthouse (12 x 16)
export const PixelLighthouse: React.FC<IconProps> = ({ size = 12, className = '' }) => (
  <svg width={size} height={Math.round(size * (16 / 12))} viewBox="0 0 12 16" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Lantern Top */}
    <rect x="5" y="1" width="2" height="2" fill="#fef08a" />
    <rect x="4" y="3" width="4" height="2" fill="#0284c7" />
    {/* Tower */}
    <rect x="3" y="5" width="6" height="3" fill="#ffffff" />
    <rect x="3" y="8" width="6" height="3" fill="#ef4444" />
    <rect x="2" y="11" width="8" height="3" fill="#ffffff" />
    {/* Base */}
    <rect x="1" y="14" width="10" height="2" fill="#0f172a" />
  </svg>
);

// 16. Artist Palette (14 x 14)
export const PixelPalette: React.FC<IconProps> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    <rect x="3" y="1" width="8" height="12" fill="#d97706" />
    <rect x="1" y="3" width="12" height="8" fill="#d97706" />
    {/* Paint blobs */}
    <rect x="3" y="3" width="2" height="2" fill="#ef4444" />
    <rect x="6" y="2" width="2" height="2" fill="#3b82f6" />
    <rect x="9" y="3" width="2" height="2" fill="#22c55e" />
    <rect x="9" y="6" width="2" height="2" fill="#fef08a" />
    {/* Thumb hole */}
    <rect x="4" y="8" width="2" height="2" fill="#ffffff" />
  </svg>
);

// 17. 8-Bit Pixel Speaker (14 x 12)
export const PixelSpeaker: React.FC<IconProps> = ({ size = 14, className = '', color = '#0284c7' }) => (
  <svg width={size} height={Math.round(size * (12 / 14))} viewBox="0 0 14 12" shapeRendering="crispEdges" className={`inline-block ${className}`}>
    {/* Speaker Box */}
    <rect x="1" y="4" width="3" height="4" fill={color} />
    {/* Cone */}
    <rect x="4" y="3" width="2" height="6" fill={color} />
    <rect x="6" y="2" width="2" height="8" fill={color} />
    <rect x="8" y="1" width="1" height="10" fill={color} />
    {/* Sound Waves */}
    <rect x="10" y="3" width="1" height="6" fill="#38bdf8" />
    <rect x="12" y="1" width="1" height="10" fill="#38bdf8" />
  </svg>
);
