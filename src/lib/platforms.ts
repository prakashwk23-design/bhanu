import type { PlatformId, Tone } from './types';

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  short: string;
  handleLabel: string;
  limit: number;
  limitLabel: string;
  accent: string;
  hex: string;
  gradient: string;
  defaultAspect: '9:16' | '4:5' | '1:1' | '16:9';
  audience: string;
}

export const PLATFORM_ORDER: PlatformId[] = ['linkedin', 'x', 'instagram', 'tiktok', 'youtube'];

export const PLATFORMS: Record<PlatformId, PlatformMeta> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    short: 'LI',
    handleLabel: 'Company page',
    limit: 3000,
    limitLabel: '3,000 characters',
    accent: 'text-[#4d9fff]',
    hex: '#0a66c2',
    gradient: 'from-[#0a66c2] to-[#3b82f6]',
    defaultAspect: '16:9',
    audience: 'B2B operators & founders',
  },
  x: {
    id: 'x',
    name: 'X',
    short: 'X',
    handleLabel: 'Post',
    limit: 280,
    limitLabel: '280 per post',
    accent: 'text-ink',
    hex: '#e7e9ea',
    gradient: 'from-slate-700 to-slate-500',
    defaultAspect: '16:9',
    audience: 'Tech & media insiders',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    short: 'IG',
    handleLabel: 'Caption',
    limit: 2200,
    limitLabel: '2,200 characters',
    accent: 'text-[#f472b6]',
    hex: '#e1306c',
    gradient: 'from-[#f58529] via-[#dd2a7b] to-[#8134af]',
    defaultAspect: '4:5',
    audience: 'Design & lifestyle',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    short: 'TT',
    handleLabel: 'Caption',
    limit: 2200,
    limitLabel: '2,200 characters',
    accent: 'text-[#25f4ee]',
    hex: '#25f4ee',
    gradient: 'from-[#25f4ee] to-[#fe2c55]',
    defaultAspect: '9:16',
    audience: 'Gen Z & early adopters',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Shorts',
    short: 'YT',
    handleLabel: 'Description',
    limit: 5000,
    limitLabel: '5,000 characters',
    accent: 'text-[#ff5c5c]',
    hex: '#ff0000',
    gradient: 'from-[#ff0000] to-[#b91c1c]',
    defaultAspect: '9:16',
    audience: 'Search-driven viewers',
  },
};

export const TONES: { id: Tone; label: string; hint: string; emoji: string }[] = [
  { id: 'thought-leader', label: 'Thought Leader', hint: 'Insight-forward, credible', emoji: '🧠' },
  { id: 'punchy', label: 'Punchy & Viral', hint: 'Short hooks, high contrast', emoji: '⚡' },
  { id: 'educational', label: 'Educational', hint: 'Frameworks and steps', emoji: '📐' },
  { id: 'witty', label: 'Witty', hint: 'Dry humour, sharp lines', emoji: '🪄' },
];

export const ASPECT_PRESETS: {
  id: '9:16' | '4:5' | '1:1' | '16:9';
  label: string;
  sub: string;
  ratio: number;
  platforms: PlatformId[];
}[] = [
  { id: '9:16', label: '9:16', sub: 'Reels · Shorts · TikTok', ratio: 9 / 16, platforms: ['tiktok', 'youtube', 'instagram'] },
  { id: '4:5', label: '4:5', sub: 'IG portrait feed', ratio: 4 / 5, platforms: ['instagram', 'linkedin'] },
  { id: '1:1', label: '1:1', sub: 'Square feed', ratio: 1, platforms: ['instagram', 'linkedin'] },
  { id: '16:9', label: '16:9', sub: 'X · LinkedIn landscape', ratio: 16 / 9, platforms: ['x', 'linkedin'] },
];

export const ASPECT_CLASS: Record<string, string> = {
  '9:16': 'aspect-[9/16]',
  '4:5': 'aspect-[4/5]',
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
};

export const CAPTION_STYLES = [
  { id: 'hormozi' as const, label: 'Hormozi Pop', hint: 'Bold, high contrast' },
  { id: 'minimal' as const, label: 'Minimal Clean', hint: 'Quiet and legible' },
  { id: 'neon' as const, label: 'Neon Highlight', hint: 'Glow + brand accent' },
];

export const STATUS_META: Record<
  string,
  { label: string; dot: string; chip: string; text: string }
> = {
  draft: {
    label: 'Draft',
    dot: 'bg-slate-400',
    chip: 'bg-slate-500/10 border-slate-500/30',
    text: 'text-slate-600 dark:text-slate-300',
  },
  pending: {
    label: 'Pending Approval',
    dot: 'bg-amber-400',
    chip: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-300',
  },
  scheduled: {
    label: 'Scheduled',
    dot: 'bg-indigo-400',
    chip: 'bg-indigo-500/10 border-indigo-500/30',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  published: {
    label: 'Published',
    dot: 'bg-emerald-400',
    chip: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
};

/** Typical high-engagement slots per platform, used by the AI peak-time scheduler. */
export const PEAK_SLOTS: Record<PlatformId, { day: number; hour: number; minute: number; match: number }[]> = {
  linkedin: [
    { day: 2, hour: 10, minute: 30, match: 94 },
    { day: 3, hour: 8, minute: 15, match: 89 },
    { day: 4, hour: 16, minute: 0, match: 84 },
  ],
  x: [
    { day: 2, hour: 9, minute: 0, match: 91 },
    { day: 4, hour: 12, minute: 30, match: 87 },
    { day: 1, hour: 17, minute: 45, match: 82 },
  ],
  instagram: [
    { day: 3, hour: 19, minute: 0, match: 96 },
    { day: 5, hour: 11, minute: 30, match: 90 },
    { day: 6, hour: 20, minute: 15, match: 85 },
  ],
  tiktok: [
    { day: 4, hour: 20, minute: 30, match: 97 },
    { day: 5, hour: 18, minute: 0, match: 92 },
    { day: 0, hour: 21, minute: 0, match: 88 },
  ],
  youtube: [
    { day: 5, hour: 17, minute: 0, match: 93 },
    { day: 6, hour: 10, minute: 0, match: 88 },
    { day: 3, hour: 20, minute: 0, match: 83 },
  ],
};

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `${n}`;
}

export function platformLabel(id: PlatformId): string {
  return PLATFORMS[id].name;
}
