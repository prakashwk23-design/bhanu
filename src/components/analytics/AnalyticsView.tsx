import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Download,
  Eye,
  Heart,
  Sparkles,
  TrendingUp,
  Users,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { ANALYTICS, KPI_BY_RANGE, PLATFORM_COLORS, RANGE_LABEL, type RangeKey } from '../../lib/analytics';
import { PLATFORM_ORDER, PLATFORMS, formatCompact } from '../../lib/platforms';
import type { PlatformId } from '../../lib/types';
import { Badge, Button, Card, Segmented, cx } from '../ui/Primitives';
import { PlatformGlyph } from '../icons/PlatformGlyph';

const RANGE_OPTIONS: { id: RangeKey; label: string }[] = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
];

export function AnalyticsView() {
  const { posts, remixPost, toast } = useApp();
  const [range, setRange] = useState<RangeKey>('30d');
  const [visible, setVisible] = useState<PlatformId[]>(PLATFORM_ORDER);

  const data = ANALYTICS[range];
  const kpi = KPI_BY_RANGE[range];
  const totals = useMemo(() => {
    return Object.fromEntries(
      PLATFORM_ORDER.map((platform) => [platform, data.reduce((acc, point) => acc + point[platform], 0)]),
    ) as Record<PlatformId, number>;
  }, [data]);
  const totalReach = PLATFORM_ORDER.reduce((acc, platform) => acc + totals[platform], 0);

  const spark = (key: 'impressions' | 'engagement' | 'followers' | 'timeSaved') =>
    data.map((point, index) => ({
      i: index,
      v:
        key === 'impressions'
          ? PLATFORM_ORDER.reduce((acc, platform) => acc + point[platform], 0)
          : key === 'engagement'
            ? 4.6 + Math.sin(index * 0.9) * 0.8 + index * 0.02
            : key === 'followers'
              ? 120 + index * 34 + Math.sin(index * 0.7) * 18
              : 1.1 + index * 0.16,
    }));

  const leaderboard = useMemo(
    () =>
      posts
        .filter((post) => post.metrics)
        .sort((a, b) => (b.metrics?.impressions ?? 0) - (a.metrics?.impressions ?? 0))
        .slice(0, 5),
    [posts],
  );

  const exportCsv = () => {
    const header = ['date', ...PLATFORM_ORDER].join(',');
    const rows = data.map((point) => [point.fullDate, ...PLATFORM_ORDER.map((p) => point[p])].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `omnipost-analytics-${range}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast('Analytics exported', `${RANGE_LABEL[range]} · per-channel reach in CSV.`, 'success');
  };

  const kpis = [
    {
      label: 'Total impressions',
      value: formatCompact(kpi.impressions),
      delta: kpi.impressionsDelta,
      icon: Eye,
      accent: 'text-indigo-300',
      spark: spark('impressions'),
    },
    {
      label: 'Engagement rate',
      value: `${kpi.engagement}%`,
      delta: kpi.engagementDelta,
      icon: Heart,
      accent: 'text-rose-300',
      spark: spark('engagement'),
    },
    {
      label: 'Follower growth',
      value: `+${formatCompact(kpi.followers)}`,
      delta: kpi.followersDelta,
      icon: Users,
      accent: 'text-emerald-300',
      spark: spark('followers'),
    },
    {
      label: 'Time saved',
      value: `${kpi.timeSaved}h`,
      delta: kpi.timeSavedDelta,
      icon: Clock3,
      accent: 'text-amber-300',
      spark: spark('timeSaved'),
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1180px] px-4 py-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-ink">Cross-platform analytics</h1>
            <p className="mt-0.5 text-[11px] text-muted">
              Attribution window 7 days · {RANGE_LABEL[range]} · last synced 4 minutes ago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Segmented options={RANGE_OPTIONS} value={range} onChange={setRange} />
            <Button variant="subtle" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((card) => {
            const up = card.delta >= 0;
            return (
              <Card key={card.label} className="relative overflow-hidden p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">{card.label}</p>
                    <p className="mt-1 text-[22px] font-semibold tracking-tight text-ink">{card.value}</p>
                  </div>
                  <span className={cx('flex h-7 w-7 items-center justify-center rounded-lg border border-line/60 bg-raised/60', card.accent)}>
                    <card.icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    className={cx(
                      'flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium',
                      up ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300',
                    )}
                  >
                    {up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {Math.abs(card.delta)}%
                  </span>
                  <span className="text-[10px] text-faint">vs previous period</span>
                </div>
                <div className="pointer-events-none mt-1 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={card.spark}>
                      <defs>
                        <linearGradient id={`spark-${card.label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#a5b4fc"
                        strokeWidth={1.4}
                        fill={`url(#spark-${card.label.replace(/\s/g, '')})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-2.5 grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* Reach chart */}
          <Card className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[12.5px] font-semibold text-ink">Reach by channel</h2>
                <p className="text-[10px] text-faint">
                  {formatCompact(totalReach)} impressions across {visible.length} channels
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {PLATFORM_ORDER.map((platform) => {
                  const active = visible.includes(platform);
                  return (
                    <button
                      key={platform}
                      onClick={() =>
                        setVisible((current) =>
                          current.includes(platform)
                            ? current.length === 1
                              ? current
                              : current.filter((p) => p !== platform)
                            : [...current, platform],
                        )
                      }
                      className={cx(
                        'flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9.5px] transition-colors',
                        active ? 'border-line/70 bg-raised/70 text-ink' : 'border-line/40 text-faint/60',
                      )}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: active ? PLATFORM_COLORS[platform] : '#475569' }}
                      />
                      {PLATFORMS[platform].short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 h-[264px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    {PLATFORM_ORDER.map((platform) => (
                      <linearGradient key={platform} id={`grad-${platform}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PLATFORM_COLORS[platform]} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={PLATFORM_COLORS[platform]} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="rgb(148 163 184 / 0.12)" strokeDasharray="3 4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#64748b', fontSize: 9.5 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgb(148 163 184 / 0.2)' }}
                    minTickGap={18}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 9.5 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => formatCompact(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgb(9 14 28 / 0.96)',
                      border: '1px solid rgb(71 85 105 / 0.6)',
                      borderRadius: 10,
                      fontSize: 11,
                      padding: '8px 10px',
                      boxShadow: '0 18px 40px -20px rgba(0,0,0,0.9)',
                    }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4, fontSize: 10.5 }}
                    itemStyle={{ padding: 0 }}
                    formatter={(value, name) => [formatCompact(Number(value ?? 0)), PLATFORMS[String(name) as PlatformId]?.name ?? String(name)]}
                  />
                  {visible.map((platform) => (
                    <Area
                      key={platform}
                      type="monotone"
                      dataKey={platform}
                      stroke={PLATFORM_COLORS[platform]}
                      strokeWidth={1.8}
                      fill={`url(#grad-${platform})`}
                      dot={false}
                      activeDot={{ r: 3, strokeWidth: 0 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Channel share */}
          <Card className="p-3">
            <h2 className="text-[12.5px] font-semibold text-ink">Channel share</h2>
            <p className="text-[10px] text-faint">Percentage of total reach</p>
            <div className="mt-2.5 space-y-2.5">
              {PLATFORM_ORDER.map((platform) => {
                const share = totalReach ? (totals[platform] / totalReach) * 100 : 0;
                return (
                  <div key={platform}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1.5 text-muted">
                        <PlatformGlyph platform={platform} className="h-2.5 w-2.5" />
                        {PLATFORMS[platform].name}
                      </span>
                      <span className="font-mono text-ink">{share.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${share}%`, background: PLATFORM_COLORS[platform] }}
                      />
                    </div>
                    <div className="mt-0.5 flex justify-between text-[9px] text-faint">
                      <span>{formatCompact(totals[platform])} reach</span>
                      <span className="text-emerald-400">+{(3 + share / 8).toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] px-2 py-1.5">
              <p className="flex items-center gap-1 text-[9.5px] font-medium text-indigo-200">
                <Sparkles className="h-2.5 w-2.5" /> TikTok is your compounding channel
              </p>
              <p className="mt-0.5 text-[9px] leading-relaxed text-indigo-200/70">
                +18.7% follower growth with the shortest median watch time. Shorts are the cheapest reach you have.
              </p>
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="mt-2.5 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 px-3 py-2">
            <div>
              <h2 className="text-[12.5px] font-semibold text-ink">Top performing posts</h2>
              <p className="text-[10px] text-faint">Ranked by impressions · remix the structure in one click</p>
            </div>
            <Badge className="border-violet-500/25 bg-violet-500/10 text-violet-200" dot="bg-violet-400">
              <TrendingUp className="h-2.5 w-2.5" /> 9.1% best ER
            </Badge>
          </div>

          <div className="divide-y divide-line/40">
            {leaderboard.map((post, index) => {
              return (
                <div
                  key={post.id}
                  className="flex flex-wrap items-center gap-2.5 px-3 py-2 transition-colors hover:bg-raised/20"
                >
                  <span
                    className={cx(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-semibold',
                      index === 0
                        ? 'bg-amber-400/20 text-amber-300'
                        : index === 1
                          ? 'bg-slate-400/20 text-slate-300'
                          : index === 2
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-raised/60 text-faint',
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[11.5px] font-medium text-ink">{post.title}</p>
                      <span className="flex shrink-0 items-center gap-1">
                        {post.platforms.map((platform) => (
                          <PlatformGlyph key={platform} platform={platform} className="h-2.5 w-2.5 text-faint" />
                        ))}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[9.5px] text-faint">{post.master.replace(/\n+/g, ' ')}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="font-mono text-[11px] text-ink">{formatCompact(post.metrics?.impressions ?? 0)}</p>
                    <p className="text-[9px] text-faint">impressions</p>
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="font-mono text-[11px] text-emerald-300">{post.metrics?.engagement}%</p>
                    <p className="text-[9px] text-faint">engagement</p>
                  </div>
                  <div className="hidden text-right lg:block">
                    <p className="font-mono text-[11px] text-muted">{formatCompact(post.metrics?.shares ?? 0)}</p>
                    <p className="text-[9px] text-faint">shares</p>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    icon={<Wand2 className="h-3 w-3" />}
                    onClick={() => remixPost(post)}
                    className="shrink-0"
                  >
                    Remix with AI
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 border-t border-line/50 bg-app/30 px-3 py-1.5 text-[9.5px] text-faint">
            <Sparkles className="h-2.5 w-2.5 text-indigo-300" />
            Remix keeps the winning structure — hook, proof, CTA — and rewrites the specifics for your next angle.
          </div>
        </Card>

        <div className="h-4" />
      </div>
    </div>
  );
}
