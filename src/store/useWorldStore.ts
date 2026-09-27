import { create } from 'zustand';
import { WorldLocation, WORLD_LOCATIONS } from '../data/locations';
import { WorldSegment, WORLD_SEGMENTS } from '../data/worldSegments';
import { PortfolioProject, PORTFOLIO_PROJECTS } from '../data/projects';

export type PlayerState = 'RIDING' | 'PARKING' | 'WALKING' | 'INTERACTING';
export type ViewMode = 'welcome' | 'game' | 'index' | 'info';
export type ShellType = 'retro-tv' | 'gba' | 'none';

interface WorldState {
  // Navigation & View
  currentView: ViewMode;
  deviceShell: ShellType;
  soundEnabled: boolean;

  // Player gameplay state
  playerState: PlayerState;
  playerX: number;
  playerY: number;
  bikeSpeed: number;
  currentSegment: WorldSegment;

  // Proximity & Interactions
  nearParkingZone: WorldLocation | null;
  nearParkedBike: boolean;
  nearInteraction: WorldLocation | null;

  // Virtual inputs for on-screen controls
  virtualInput: { left: boolean; right: boolean; action: boolean };
  setVirtualInput: (input: Partial<{ left: boolean; right: boolean; action: boolean }>) => void;

  // Active Overlay / Content
  activeLocation: WorldLocation | null;
  activeProject: PortfolioProject | null;
  isOverlayOpen: boolean;

  // Actions
  setCurrentView: (view: ViewMode) => void;
  setDeviceShell: (shell: ShellType) => void;
  toggleSound: () => void;

  setPlayerState: (state: PlayerState) => void;
  updatePlayerPos: (x: number, y: number, speed: number) => void;
  setNearParkingZone: (location: WorldLocation | null) => void;
  setNearParkedBike: (isNear: boolean) => void;
  setNearInteraction: (location: WorldLocation | null) => void;

  openProjectOverlay: (project: PortfolioProject) => void;
  openLocationOverlay: (location: WorldLocation) => void;
  closeOverlay: () => void;

  // Direct teleport / fast travel (for index / deep links)
  teleportToLocation: (locationId: string) => void;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  currentView: 'welcome',
  deviceShell: 'retro-tv',
  soundEnabled: true,

  playerState: 'RIDING',
  playerX: 140,
  playerY: 270,
  bikeSpeed: 0,
  currentSegment: WORLD_SEGMENTS[0],

  nearParkingZone: null,
  nearParkedBike: false,
  nearInteraction: null,

  virtualInput: { left: false, right: false, action: false },
  setVirtualInput: (input) =>
    set((state) => ({
      virtualInput: { ...state.virtualInput, ...input }
    })),

  activeLocation: null,
  activeProject: null,
  isOverlayOpen: false,

  setCurrentView: (view) => set({ currentView: view }),
  setDeviceShell: (shell) => set({ deviceShell: shell }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  setPlayerState: (playerState) => set({ playerState }),

  updatePlayerPos: (x, y, speed) => {
    // Find matching segment
    const segment = WORLD_SEGMENTS.find((s) => x >= s.startX && x < s.endX) || WORLD_SEGMENTS[0];
    set({
      playerX: x,
      playerY: y,
      bikeSpeed: speed,
      currentSegment: segment
    });
  },

  setNearParkingZone: (location) => set({ nearParkingZone: location }),
  setNearParkedBike: (isNear) => set({ nearParkedBike: isNear }),
  setNearInteraction: (location) => set({ nearInteraction: location }),

  openProjectOverlay: (project) => {
    const loc = WORLD_LOCATIONS.find((l) => l.id === project.locationId) || null;
    set({
      activeProject: project,
      activeLocation: loc,
      isOverlayOpen: true,
      playerState: 'INTERACTING'
    });
  },

  openLocationOverlay: (location) => {
    const project = PORTFOLIO_PROJECTS.find((p) => p.locationId === location.id) || PORTFOLIO_PROJECTS[0];
    set({
      activeLocation: location,
      activeProject: project,
      isOverlayOpen: true,
      playerState: 'INTERACTING'
    });
  },

  closeOverlay: () => {
    set({
      isOverlayOpen: false,
      activeProject: null,
      activeLocation: null,
      playerState: 'WALKING'
    });
  },

  teleportToLocation: (locationId: string) => {
    const loc = WORLD_LOCATIONS.find((l) => l.id === locationId);
    if (!loc) return;
    set({
      currentView: 'game',
      playerState: 'WALKING',
      playerX: loc.parkingX + 30
    });
    // Dispatch custom event to notify Phaser scene
    window.dispatchEvent(new CustomEvent('teleport-player', { detail: { x: loc.parkingX + 30 } }));
  }
}));
