import type { Account, BrandVoice, Conversation, Post, Tone } from './types';

export interface ComposeRequest {
  idea: string;
  tone: Tone;
  brandVoice: Pick<
    BrandVoice,
    'persona' | 'descriptors' | 'formality' | 'playfulness' | 'boldness' | 'emoji' | 'banned' | 'cta' | 'defaultHashtags'
  >;
}

export interface ComposeLinkedIn {
  hook: string;
  copy: string;
  hashtags: string[];
}

export interface ComposeX {
  mode: 'single' | 'thread';
  posts: string[];
}

export interface ComposeInstagram {
  caption: string;
  hashtags: string[];
}

export interface ComposeShortForm {
  hook: string;
  caption: string;
  hashtags: string[];
}

export interface ComposeResponse {
  title: string;
  linkedin: ComposeLinkedIn;
  x: ComposeX;
  instagram: ComposeInstagram;
  tiktok: ComposeShortForm;
  youtube: ComposeShortForm;
  firstComment: string;
  engine: 'llm' | 'structured';
  provider: string;
  model?: string;
  warning?: string;
}

export interface ApiMeta {
  apiVersion: string;
  seeded: boolean;
  aiConfigured: boolean;
  aiEngine: 'llm' | 'structured';
  aiModel: string;
}

export interface BootstrapResponse {
  accounts: Account[];
  posts: Post[];
  conversations: Conversation[];
  meta: ApiMeta;
}

export interface CloudinaryConfig {
  configured: boolean;
  cloudName: string | null;
  uploadPreset: string | null;
  folder: string;
  uploadUrl: string | null;
  videoTransformTemplate: string;
}

export interface TranscriptionConfig {
  webhookPath: string;
  configured: boolean;
}

export interface MediaServiceConfig {
  cloudinary: CloudinaryConfig;
  transcription: TranscriptionConfig;
}

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionPayload {
  assetId: string;
  language?: string;
  provider?: string;
  words: TranscriptionWord[];
  srt?: string;
}

export type { Account, Conversation, Post, Tone };
