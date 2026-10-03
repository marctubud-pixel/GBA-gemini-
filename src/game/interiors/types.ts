export type InteriorId = 'print-house' | 'brand-museum' | 'marc-cinema' | 'arcade' | 'my-studio' | 'experiment-lab';

export type InteriorModal = 'write-house' | 'brand-museum' | 'marc-cinema' | 'arcade' | 'my-hobby' | 'experiment-lab';

export interface InteriorDrawAssets {
  /** Shared elapsed milliseconds; the same time always produces the same pixels. */
  time?: number;
}

export interface InteriorObjectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InteriorInteraction {
  x: number;
  radius: number;
  prompt: string;
  modal: InteriorModal;
  context?: string;
  /** The visible object, in the room's 960 × 320 canvas coordinates. */
  bounds: InteriorObjectBounds;
}

export interface InteriorDefinition {
  name: string;
  draw: (ctx: CanvasRenderingContext2D, assets?: InteriorDrawAssets) => void;
  interactions: readonly InteriorInteraction[];
}

export const INTERIOR_WIDTH = 960;
export const INTERIOR_HEIGHT = 320;
export const INTERIOR_WALK_Y = 270;
export const INTERIOR_ENTRY_X = 70;
export const INTERIOR_EXIT_X = 32;

export function isInteriorId(id: unknown): id is InteriorId {
  return id === 'print-house' || id === 'brand-museum' || id === 'marc-cinema' ||
    id === 'arcade' || id === 'my-studio' || id === 'experiment-lab';
}
