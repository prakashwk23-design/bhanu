export type PlatformId = 'linkedin' | 'x' | 'instagram' | 'tiktok' | 'youtube';

export type Tone = 'thought-leader' | 'punchy' | 'educational' | 'witty';

export type WorkflowStatus = 'draft' | 'pending' | 'scheduled' | 'published';

export type AspectPreset = '9:16' | '4:5' | '1:1' | '16:9';

export type CaptionStyle = 'hormozi' | 'minimal' | 'neon';

export type InboxKind = 'comment' | 'dm' | 'mention';

export type ViewId = 'composer' | 'calendar' | 'inbox' | 'analytics' | 'settings';

export type Portal = 'workspace' | 'admin';

export type AdminViewId = 'executive' | 'tenants' | 'publishing' | 'telemetry' | 'flags';

export type PlanTier = 'Free' | 'Pro' | 'Agency';

export interface WorkspaceProfile {
  id: string;
  name: string;
  plan: PlanTier;
  ownerName: string;
  ownerEmail: string;
  initials: string;
  tone: string;
  brands: number;
}

export interface ImpersonationWorkspace extends WorkspaceProfile {
  sampleIdea: string;
  brandPersona: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  width: number;
  height: number;
  duration?: string;
  durationSeconds?: number;
  size: string;
  tags: string[];
}

export interface FocalPoint {
  x: number;
  y: number;
}

export interface CaptionConfig {
  enabled: boolean;
  text: string;
  style: CaptionStyle;
  size: number;
  position: number;
}

export interface PostMetrics {
  impressions: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface Post {
  id: string;
  title: string;
  idea: string;
  tone: Tone;
  master: string;
  overrides: Partial<Record<PlatformId, string>>;
  hashtags: string[];
  firstComment: boolean;
  firstCommentText: string;
  platforms: PlatformId[];
  mediaId: string;
  aspect: AspectPreset;
  focal: FocalPoint;
  carousel: boolean;
  caption: CaptionConfig;
  status: WorkflowStatus;
  scheduledAt: string | null;
  publishedAt?: string | null;
  metrics?: PostMetrics;
  evergreen?: boolean;
  peak?: { label: string; match: number; time: string };
  mediaUrl?: string;
}

export interface Account {
  id: PlatformId;
  name: string;
  handle: string;
  followers: number;
  connected: boolean;
  growth: number;
  lastSync: string;
}

export interface BrandVoice {
  persona: string;
  descriptors: string[];
  formality: number;
  playfulness: number;
  boldness: number;
  emoji: number;
  banned: string[];
  cta: string;
  signature: string;
  defaultHashtags: string[];
  approvalRequired: boolean;
  autoFirstComment: boolean;
}

export interface Message {
  id: string;
  from: 'them' | 'me';
  text: string;
  at: string;
}

export interface Conversation {
  id: string;
  platform: PlatformId;
  kind: InboxKind;
  senderName: string;
  senderHandle: string;
  initials: string;
  avatarTone: string;
  bio: string;
  followers: number;
  location: string;
  memberSince: string;
  messages: Message[];
  unread: boolean;
  pinned: boolean;
  postTitle: string;
  postExcerpt: string;
  status: 'open' | 'resolved';
  labels: string[];
  sentiment: 'positive' | 'neutral' | 'question';
  timeAgo: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  description?: string;
  tone: 'default' | 'success' | 'warning';
}

export interface PeakWindow {
  platform: PlatformId;
  day: string;
  time: string;
  match: number;
  iso: string;
}

export type CalendarMode = 'month' | 'week' | 'queue';
