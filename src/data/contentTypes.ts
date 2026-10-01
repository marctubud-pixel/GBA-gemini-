export type ContentKind = 'writing' | 'brand' | 'film' | 'game-experience' | 'game-project' | 'hobby' | 'experiment' | 'general';
export type ContentStatus = 'in-progress' | 'completed' | 'planned';

export interface ContentAttachment {
  id: string;
  title: string;
  url: string;
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  alt?: string;
  poster?: string;
}

export interface ContentEntry {
  id: string;
  kind: ContentKind;
  category: string;
  title: string;
  subtitle?: string;
  description: string;
  body?: string;
  date?: string;
  duration?: string;
  hours?: number;
  englishTitle?: string;
  cover?: MediaAsset;
  media: MediaAsset[];
  demoUrl?: string;
  tags: string[];
  locationId?: string;
  section?: 'IDEA' | 'WORDS' | 'LIFE';
  caseStudy?: { heading: string; text: string }[];
  isSample?: boolean;
  status?: ContentStatus;
  fileSize?: string;
  documentUrl?: string;
  attachments?: ContentAttachment[];
}

export interface ContentDocument {
  version: 1;
  entries: ContentEntry[];
}

// A future CMS can return this document from VITE_CONTENT_URL. Media URLs can
// point to its object storage; UI and game logic do not depend on the provider.
export interface ContentRepository {
  load(signal?: AbortSignal): Promise<ContentDocument>;
}
