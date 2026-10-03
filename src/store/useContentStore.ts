import { create } from 'zustand';
import { CONTENT_SEED } from '../data/contentSeed';
import type { ContentEntry } from '../data/contentTypes';
import { HttpContentRepository } from '../content/contentRepository';

interface ContentState {
  entries: ContentEntry[];
  status: 'local' | 'loading' | 'ready' | 'error';
  error: string | null;
  load: (refresh?: boolean) => Promise<void>;
}

const endpoint = (import.meta.env.VITE_CONTENT_URL as string | undefined) || '/api/content';
const repository = new HttpContentRepository(endpoint);

export const useContentStore = create<ContentState>((set, get) => ({
  entries: CONTENT_SEED,
  status: 'local',
  error: null,
  load: async (refresh = false) => {
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
