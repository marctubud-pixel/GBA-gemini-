import { create } from 'zustand';
import { WorldLocation, WORLD_LOCATIONS } from '../data/locations';
import { WorldSegment, WORLD_SEGMENTS } from '../data/worldSegments';
import { PortfolioProject, PORTFOLIO_PROJECTS } from '../data/projects';
import { pixelSound } from '../game/audio/PixelSoundManager';
import type { InteriorId } from '../game/interiors/types';
import { useContentStore } from './useContentStore';

export type PlayerState = 'RIDING' | 'PARKING' | 'WALKING' | 'INTERACTING';
export type ViewMode = 'welcome' | 'game' | 'index' | 'info';
export type ShellType = 'retro-tv' | 'gba' | 'none';
export type LandmarkModalType = 'write-house' | 'brand-museum' | 'marc-cinema' | 'arcade' | 'my-hobby' | 'experiment-lab' | null;

interface WorldState {
  // Navigation & View
  currentView: ViewMode;
  infoReturnView: Exclude<ViewMode, 'info'>;
  closeInfo: () => void;
  returnToWelcome: () => void;
  isStarting: boolean;
  setStarting: (starting: boolean) => void;
  deviceShell: ShellType;
  soundEnabled: boolean;
  activeInterior: InteriorId | null;
  interiorPrompt: string | null;
  modalContext: string | null;
  enterInterior: (id: InteriorId) => void;
  exitInterior: () => void;
  setInteriorPrompt: (prompt: string | null) => void;

  // Active Landmark Modal (6 bespoke pixel UI experiences)
  activeLandmarkModal: LandmarkModalType;
  openLandmarkModal: (modal: Exclude<LandmarkModalType, null>, context?: string) => void;
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
  activeContentId: string | null;
  openContentOverlay: (id: string) => void;
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
  infoReturnView: 'welcome',
  closeInfo: () => get().setCurrentView(get().infoReturnView),
  returnToWelcome: () => {
    if (get().isStarting) return;
    if (get().activeInterior) get().exitInterior();
    pixelSound.playClose();
    set({ currentView: 'welcome', infoReturnView: 'welcome', playerState: 'RIDING',
      playerX: 200, playerY: 270, bikeSpeed: 0, currentSegment: WORLD_SEGMENTS[0],
      activeInterior: null, activeLandmarkModal: null, modalContext: null, interiorPrompt: null,
      isOverlayOpen: false, isPrintHouseInterior: false, isPrintHouseBookOpen: false,
      isPostcardOpen: false, isEndingModalOpen: false, activeProject: null, activeContentId: null,
      activeLocation: null, nearInteraction: null, nearParkingZone: null, nearParkedBike: false,
      virtualInput: { left: false, right: false, up: false, down: false, action: false, accelerate: false, brake: false } });
    window.dispatchEvent(new CustomEvent('teleport-player', { detail: { x: 200, state: 'RIDING' } }));
  },
  isStarting: false,
  setStarting: (isStarting) => set({ isStarting, virtualInput: { left: false, right: false, action: false } }),
  deviceShell: 'gba',
  soundEnabled: true,
  activeInterior: null,
  interiorPrompt: null,
  modalContext: null,
  enterInterior: (id) => {
    set({ activeInterior: id, interiorPrompt: null, activeLandmarkModal: null,
      modalContext: null, isOverlayOpen: false, isPrintHouseBookOpen: false,
      activeContentId: null, activeProject: null, isPostcardOpen: false, isEndingModalOpen: false,
      playerState: 'WALKING', currentView: 'game', nearInteraction: null,
      nearParkedBike: false, nearParkingZone: null,
      virtualInput: { left: false, right: false, action: false } });
    window.dispatchEvent(new CustomEvent('enter-interior', { detail: { id } }));
  },
  exitInterior: () => {
    const id = get().activeInterior;
    if (!id) return;
    set({ activeInterior: null, interiorPrompt: null, activeLandmarkModal: null,
      modalContext: null, isOverlayOpen: false, isPrintHouseBookOpen: false,
      activeContentId: null, activeProject: null,
      playerState: 'WALKING', virtualInput: { left: false, right: false, action: false } });
    window.dispatchEvent(new CustomEvent('exit-interior', { detail: { id } }));
  },
  setInteriorPrompt: (prompt) => { if (get().interiorPrompt !== prompt) set({ interiorPrompt: prompt }); },

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
  activeContentId: null,
  isOverlayOpen: false,
  isPostcardOpen: false,

  activeLandmarkModal: null,
  isPrintHouseInterior: false,
  isPrintHouseBookOpen: false,

  openLandmarkModal: (modal, context) => {
    pixelSound.playInteract();
    set({
      activeLandmarkModal: modal,
      modalContext: context || null,
      isPrintHouseBookOpen: modal === 'write-house',
      playerState: 'INTERACTING'
    });
  },

  closeLandmarkModal: () => {
    pixelSound.playClose();
    set({
      activeLandmarkModal: null,
      modalContext: null,
      isPrintHouseBookOpen: false,
      playerState: 'WALKING'
    });
  },

  setCurrentView: (view) => {
    if (get().isStarting) return;
    const from = get().currentView;
    set({ currentView: view,
      ...(view === 'info' && from !== 'info' ? { infoReturnView: from } : {}),
      virtualInput: { left: false, right: false, action: false } });
  },
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
      activeContentId: null,
      activeLocation: loc,
      isOverlayOpen: true,
      playerState: 'INTERACTING'
    });
  },

  openContentOverlay: (id) => {
    const entry = useContentStore.getState().entries.find(item => item.id === id);
    if (!entry) return;
    pixelSound.playInteract();
    set({ activeContentId: id, activeProject: null,
      activeLocation: WORLD_LOCATIONS.find(loc => loc.id === entry.locationId) || null,
      isOverlayOpen: true, playerState: 'INTERACTING' });
  },

  openLocationOverlay: (location) => {
    const content = useContentStore.getState();
    const entry = content.entries.find(item => item.locationId === location.id);
    if (entry) { get().openContentOverlay(entry.id); return; }
    pixelSound.playInteract();
    const project = content.status === 'ready' ? null : PORTFOLIO_PROJECTS.find((p) => p.locationId === location.id) || null;
    set({
      activeLocation: location,
      activeProject: project,
      activeContentId: null,
      isOverlayOpen: true,
      playerState: 'INTERACTING'
    });
  },

  closeOverlay: () => {
    pixelSound.playClose();
    set({
      isOverlayOpen: false,
      activeProject: null,
      activeContentId: null,
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
      isEndingModalOpen: false, currentView: 'game', playerState: 'RIDING',
      playerX: 200, playerY: 270, bikeSpeed: 0, currentSegment: WORLD_SEGMENTS[0],
      activeInterior: null, activeLandmarkModal: null, modalContext: null, interiorPrompt: null,
      isOverlayOpen: false, isPrintHouseBookOpen: false, isPostcardOpen: false,
      activeProject: null, activeContentId: null, activeLocation: null,
      nearInteraction: null, nearParkingZone: null, nearParkedBike: false,
      virtualInput: { left: false, right: false, action: false }
    });
    window.dispatchEvent(new CustomEvent('teleport-player', { detail: { x: 200, state: 'RIDING' } }));
  },

  teleportToLocation: (locationId: string) => {
    const loc = WORLD_LOCATIONS.find((l) => l.id === locationId);
    if (!loc) return;
    if (get().activeInterior) get().exitInterior();
    pixelSound.playMount();
    set({
      currentView: 'game',
      playerState: 'WALKING',
      playerX: loc.parkingX + 30,
      activeLandmarkModal: null, modalContext: null, isOverlayOpen: false,
      activeContentId: null, activeProject: null, isPrintHouseBookOpen: false,
      isPostcardOpen: false, isEndingModalOpen: false,
      virtualInput: { left: false, right: false, action: false }
    });
    // Dispatch custom event to notify Phaser scene
    window.dispatchEvent(new CustomEvent('teleport-player', { detail: { x: loc.parkingX + 30 } }));
  }
}));
