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

export interface CoverLayout {
  ratio: '4:3' | '16:9' | '9:16' | '1:1' | 'original';
  fit: 'contain' | 'cover';
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
  /** Independent of the full-size project media / PDF presentation. */
  coverLayout?: CoverLayout;
  media: MediaAsset[];
  demoUrl?: string;
  tags: string[];
  locationId?: string;
  section?: 'IDEA' | 'WORDS' | 'LIFE';
  caseStudy?: { heading: string; text: string }[];
  isSample?: boolean;
  source?: string;
  status?: ContentStatus;
  fileSize?: string;
  documentUrl?: string;
  attachments?: ContentAttachment[];
  /** Omitted for the existing gallery; PDF and links open directly from details. */
  detail?: { type: 'pdf' | 'link'; url: string };
  presentation?: 'portrait' | 'landscape' | 'square' | 'original';
}

export interface ContentDocument {
  version: 1;
  entries: ContentEntry[];
}

// A local backend or future CMS returns this document. Media URLs can
// point to its object storage; UI and game logic do not depend on the provider.
export interface ContentRepository {
  load(signal?: AbortSignal): Promise<ContentDocument>;
}
