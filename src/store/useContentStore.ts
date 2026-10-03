import { create } from 'zustand';
import { CONTENT_SEED } from '../data/contentSeed';
import type { ContentDocument, ContentEntry } from '../data/contentTypes';
import { HttpContentRepository } from '../content/contentRepository';
import { getPreviewToken } from '../content/projectPreview';

interface ContentState {
  entries: ContentEntry[];
  status: 'local' | 'loading' | 'ready' | 'error';
  error: string | null;
  load: (refresh?: boolean) => Promise<void>;
  setPreviewDocument: (document: ContentDocument) => void;
}

const endpoint = (import.meta.env.VITE_CONTENT_URL as string | undefined) || '/api/content';
const repository = new HttpContentRepository(endpoint);

export const useContentStore = create<ContentState>((set, get) => ({
  entries: CONTENT_SEED,
  status: 'local',
  error: null,
  setPreviewDocument: document => set({ entries: document.entries, status: 'ready', error: null }),
  load: async (refresh = false) => {
    // A draft preview must never be replaced by saved content on focus or storage events.
    if (getPreviewToken()) return;
    if (get().status === 'loading' || (!refresh && get().status === 'ready')) return;
    set({ status: 'loading', error: null });
    try {
      const doc = await repository.load();
      set({ entries: doc.entries, status: 'ready', error: null });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : '内容加载失败' });
    }
  }
}));

// Another admin tab can update the collection without restarting the game.
window.addEventListener('storage', event => { if (event.key === 'portfolio-content-updated') void useContentStore.getState().load(true); });
window.addEventListener('focus', () => { void useContentStore.getState().load(true); });
