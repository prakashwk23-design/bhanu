import type { PlatformId } from './types';

export type RangeKey = '7d' | '30d' | '90d';

export interface SeriesPoint {
  label: string;
  fullDate: string;
  linkedin: number;
  x: number;
  instagram: number;
  tiktok: number;
  youtube: number;
}

const PLATFORM_BASE: Record<PlatformId, number> = {
  linkedin: 5200,
  x: 3400,
  instagram: 7100,
  tiktok: 9800,
  youtube: 2600,
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function buildSeries(days: number, step: number, seed: number): SeriesPoint[] {
  const rand = seededRandom(seed);
  const points: SeriesPoint[] = [];
  const total = Math.floor(days / step);
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  for (let i = total - 1; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(date.getDate() - i * step);
    const progress = (total - i) / total;
    const dow = date.getDay();
    const weekendBoost = dow === 0 || dow === 6 ? 0.82 : 1;
    const point: SeriesPoint = {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      linkedin: 0,
      x: 0,
      instagram: 0,
      tiktok: 0,
      youtube: 0,
    };
    (Object.keys(PLATFORM_BASE) as PlatformId[]).forEach((platform, idx) => {
      const base = PLATFORM_BASE[platform];
      const growth = 1 + progress * (platform === 'tiktok' ? 0.85 : platform === 'instagram' ? 0.5 : 0.24);
      const wave = 1 + Math.sin((i + idx) * 0.9) * 0.12;
      const noise = 0.86 + rand() * 0.3;
      point[platform] = Math.round(base * growth * wave * noise * weekendBoost * step * 0.92);
    });
    points.push(point);
  }
  return points;
}

export const ANALYTICS: Record<RangeKey, SeriesPoint[]> = {
  '7d': buildSeries(7, 1, 42),
  '30d': buildSeries(30, 2, 8731),
  '90d': buildSeries(90, 6, 55123),
};

export const RANGE_LABEL: Record<RangeKey, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

export function rangeTotals(range: RangeKey) {
  const rows = ANALYTICS[range];
  const sum = (key: PlatformId) => rows.reduce((acc, row) => acc + row[key], 0);
  const impressions = (['linkedin', 'x', 'instagram', 'tiktok', 'youtube'] as PlatformId[]).reduce(
    (acc, p) => acc + sum(p),
    0,
  );
  return { impressions, byPlatform: { linkedin: sum('linkedin'), x: sum('x'), instagram: sum('instagram'), tiktok: sum('tiktok'), youtube: sum('youtube') } };
}

export const PLATFORM_COLORS: Record<PlatformId, string> = {
  linkedin: '#60a5fa',
  x: '#cbd5e1',
  instagram: '#f472b6',
  tiktok: '#25f4ee',
  youtube: '#f87171',
};

export const KPI_BY_RANGE = {
  '7d': {
    impressions: 486_200,
    impressionsDelta: 12.4,
    engagement: 6.8,
    engagementDelta: 0.9,
    followers: 2_184,
    followersDelta: 8.1,
    timeSaved: 11.5,
    timeSavedDelta: 22.0,
  },
  '30d': {
    impressions: 1_942_800,
    impressionsDelta: 18.2,
    engagement: 6.2,
    engagementDelta: 1.4,
    followers: 9_640,
    followersDelta: 14.6,
    timeSaved: 46.2,
    timeSavedDelta: 31.0,
  },
  '90d': {
    impressions: 5_318_400,
    impressionsDelta: 27.9,
    engagement: 5.7,
    engagementDelta: 2.1,
    followers: 26_480,
    followersDelta: 19.3,
    timeSaved: 138.0,
    timeSavedDelta: 38.4,
  },
} as const;
