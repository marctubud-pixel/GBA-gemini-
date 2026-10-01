import { create } from 'zustand';
import { CONTENT_SEED } from '../data/contentSeed';
import type { ContentEntry } from '../data/contentTypes';
import { HttpContentRepository } from '../content/contentRepository';

interface ContentState {
  entries: ContentEntry[];
  status: 'sample' | 'loading' | 'ready' | 'error';
  error: string | null;
  load: () => Promise<void>;
}

const endpoint = import.meta.env.VITE_CONTENT_URL as string | undefined;
const repository = endpoint ? new HttpContentRepository(endpoint) : null;

export const useContentStore = create<ContentState>((set, get) => ({
  entries: CONTENT_SEED,
  status: 'sample',
  error: null,
  load: async () => {
    if (!repository || get().status === 'loading' || get().status === 'ready') return;
    set({ status: 'loading', error: null });
    try {
      const doc = await repository.load();
      set({ entries: doc.entries, status: 'ready', error: null });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : '内容加载失败' });
    }
  }
}));
