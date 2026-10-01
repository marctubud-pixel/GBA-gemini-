import { create } from 'zustand';
import { WorldLocation, WORLD_LOCATIONS } from '../data/locations';
import { WorldSegment, WORLD_SEGMENTS } from '../data/worldSegments';
import { PortfolioProject, PORTFOLIO_PROJECTS } from '../data/projects';
import { pixelSound } from '../game/audio/PixelSoundManager';

export type PlayerState = 'RIDING' | 'PARKING' | 'WALKING' | 'INTERACTING';
export type ViewMode = 'welcome' | 'game' | 'index' | 'info';
export type ShellType = 'retro-tv' | 'gba' | 'none';
export type LandmarkModalType = 'write-house' | 'brand-museum' | 'marc-cinema' | 'arcade' | 'my-hobby' | null;

interface WorldState {
  // Navigation & View
  currentView: ViewMode;
  deviceShell: ShellType;
  soundEnabled: boolean;

  // Active Landmark Modal (5 bespoke pixel UI experiences)
  activeLandmarkModal: LandmarkModalType;
  openLandmarkModal: (modal: Exclude<LandmarkModalType, null>) => void;
  closeLandmarkModal: () => void;

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
  virtualInput: {
    left: boolean;
    right: boolean;
    up?: boolean;
    down?: boolean;
    accelerate?: boolean;
    brake?: boolean;
    action: boolean;
  };
  setVirtualInput: (input: Partial<{
    left: boolean;
    right: boolean;
    up?: boolean;
    down?: boolean;
    accelerate?: boolean;
    brake?: boolean;
    action: boolean;
  }>) => void;

  // Active Overlay / Content
  activeLocation: WorldLocation | null;
  activeProject: PortfolioProject | null;
  isOverlayOpen: boolean;
  isPostcardOpen: boolean;

  // Print House / Write House Playable Interior & Modal Backward Compat
  isPrintHouseInterior: boolean;
  isPrintHouseBookOpen: boolean;

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

  openPostcard: () => void;
  closePostcard: () => void;

  // Print House / Write House Direct Modal Actions
  enterPrintHouseInterior: () => void;
  exitPrintHouseInterior: () => void;
  setPrintHouseBookOpen: (open: boolean) => void;
  openPrintHouseModal: () => void;
  closePrintHouseModal: () => void;

  // Ending Tour Ride-out & "谢谢参观" Modal Actions
  isEndingModalOpen: boolean;
  triggerEndingRide: () => void;
  openEndingModal: () => void;
  closeEndingModal: () => void;

  // Direct teleport / fast travel (for index / deep links)
  teleportToLocation: (locationId: string) => void;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  currentView: 'welcome',
  deviceShell: 'gba',
  soundEnabled: true,

  playerState: 'RIDING',
  playerX: 200,
  playerY: 270,
  bikeSpeed: 0,
  currentSegment: WORLD_SEGMENTS[0],

  nearParkingZone: null,
  nearParkedBike: false,
  nearInteraction: null,

  virtualInput: { left: false, right: false, up: false, down: false, accelerate: false, brake: false, action: false },
  setVirtualInput: (input) =>
    set((state) => ({
      virtualInput: { ...state.virtualInput, ...input }
    })),

  activeLocation: null,
  activeProject: null,
  isOverlayOpen: false,
  isPostcardOpen: false,

  activeLandmarkModal: null,
  isPrintHouseInterior: false,
  isPrintHouseBookOpen: false,

  openLandmarkModal: (modal) => {
    pixelSound.playInteract();
    set({
      activeLandmarkModal: modal,
      isPrintHouseBookOpen: modal === 'write-house',
      playerState: 'INTERACTING'
    });
  },

  closeLandmarkModal: () => {
    pixelSound.playClose();
    set({
      activeLandmarkModal: null,
      isPrintHouseBookOpen: false,
      playerState: 'WALKING'
    });
  },

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
    pixelSound.playInteract();
    const loc = WORLD_LOCATIONS.find((l) => l.id === project.locationId) || null;
    set({
      activeProject: project,
      activeLocation: loc,
      isOverlayOpen: true,
      playerState: 'INTERACTING'
    });
  },

  openLocationOverlay: (location) => {
    pixelSound.playInteract();
    const project = PORTFOLIO_PROJECTS.find((p) => p.locationId === location.id) || PORTFOLIO_PROJECTS[0];
    set({
      activeLocation: location,
      activeProject: project,
      isOverlayOpen: true,
      playerState: 'INTERACTING'
    });
  },

  closeOverlay: () => {
    pixelSound.playClose();
    set({
      isOverlayOpen: false,
      activeProject: null,
      activeLocation: null,
      playerState: 'WALKING'
    });
  },

  openPostcard: () => {
    pixelSound.playInteract();
    set({
      isPostcardOpen: true,
      playerState: 'INTERACTING'
    });
  },

  closePostcard: () => {
    pixelSound.playClose();
    set({
      isPostcardOpen: false,
      playerState: 'WALKING'
    });
  },

  enterPrintHouseInterior: () => {
    pixelSound.playInteract();
    set({
      isPrintHouseInterior: true,
      isPrintHouseBookOpen: false,
      isOverlayOpen: false,
      playerState: 'WALKING'
    });
    window.dispatchEvent(new CustomEvent('enter-print-house-interior'));
  },

  exitPrintHouseInterior: () => {
    pixelSound.playClose();
    set({
      isPrintHouseInterior: false,
      isPrintHouseBookOpen: false,
      playerState: 'WALKING'
    });
    window.dispatchEvent(new CustomEvent('exit-print-house-interior'));
  },

  setPrintHouseBookOpen: (open: boolean) => {
    if (open) {
      get().openLandmarkModal('write-house');
    } else {
      get().closeLandmarkModal();
    }
  },

  openPrintHouseModal: () => {
    get().openLandmarkModal('write-house');
  },

  closePrintHouseModal: () => {
    get().closeLandmarkModal();
  },

  isEndingModalOpen: false,

  triggerEndingRide: () => {
    // Notify WorldScene to play the bike ride-out animation
    window.dispatchEvent(new CustomEvent('play-ending-ride-out'));
  },

  openEndingModal: () => {
    pixelSound.playInteract();
    set({
      isEndingModalOpen: true,
      playerState: 'INTERACTING'
    });
  },

  closeEndingModal: () => {
    pixelSound.playClose();
    set({
      isEndingModalOpen: false,
      playerState: 'RIDING'
    });
    // Teleport back to start or allow continuous ride
    window.dispatchEvent(new CustomEvent('teleport-player', { detail: { x: 200 } }));
  },

  teleportToLocation: (locationId: string) => {
    const loc = WORLD_LOCATIONS.find((l) => l.id === locationId);
    if (!loc) return;
    pixelSound.playMount();
    set({
      currentView: 'game',
      playerState: 'WALKING',
      playerX: loc.parkingX + 30
    });
    // Dispatch custom event to notify Phaser scene
    window.dispatchEvent(new CustomEvent('teleport-player', { detail: { x: loc.parkingX + 30 } }));
  }
}));
