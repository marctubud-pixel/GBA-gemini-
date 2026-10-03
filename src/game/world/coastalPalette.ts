/** The coast's atmosphere is shared by gameplay and the journey menus. */
export const COASTAL_PALETTE = {
  skyTop: '#3584d4', skyHorizon: '#d0ebfc', horizon: '#bbe7fa',
  seaFar: '#1e608a', seaMid: '#277da1', seaNear: '#389aa6',
  waterNear: '#0284c7', waterMid: '#0369a1', waterDeep: '#075985',
  foam: '#ffffff', wave: '#7dd3fc', waveMid: '#38bdf8',
  mountainFar: '#608ea8', mountainMid: '#4a7f96', island: '#2d6874', islandLight: '#448d7d',
  stone: '#cad5e2', stoneLight: '#e2e8f0', stoneDark: '#64748b', ink: '#1e293b',
} as const;

export const coastalColor = (color: string) => Number.parseInt(color.slice(1), 16);
