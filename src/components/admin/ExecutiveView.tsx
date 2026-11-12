import { useEffect, useRef, useState } from 'react';
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
  ArrowRight,
  Building2,
  CalendarClock,
  DollarSign,
  Download,
  Film,
  Percent,
  Send,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  UserPlus,
  Zap,
} from 'lucide-react';
import {
  activityCycle,
  activitySeed,
  executiveKpis,
  formatMoney,
  formatNumber,
  revenueSeries,
  type ActivityEvent,
  type ActivityType,
} from '../../lib/adminData';
import { useApp } from '../../lib/store';
import { cx } from '../ui/Primitives';
import { AdminButton, MiniBar, Panel, Pill, PlanPill, TONE_STYLES } from './AdminUI';

const ACTIVITY_ICON: Record<ActivityType, typeof UserPlus> = {
  signup: UserPlus,
  upgrade: ArrowUpRight,
  schedule: CalendarClock,
  alert: TriangleAlert,
  render: Film,
  prompt: SlidersHorizontal,
};

const ACTIVITY_TONE: Record<ActivityType, keyof typeof TONE_STYLES> = {
  signup: 'emerald',
  upgrade: 'indigo',
  schedule: 'violet',
  alert: 'amber',
  render: 'emerald',
  prompt: 'rose',
};

const RANGES = [
  { id: '7d', label: '7D', days: 7 },
  { id: '14d', label: '14D', days: 14 },
  { id: '30d', label: '30D', days: 30 },
] as const;

export function ExecutiveView() {
  const { toast } = useApp();
  const [range, setRange] = useState<'7d' | '14d' | '30d'>('30d');
  const days = RANGES.find((item) => item.id === range)?.days ?? 30;
  const data = revenueSeries.slice(-days);
  const latest = data[data.length - 1];
  const revenueTotal = data.reduce((sum, point) => sum + point.revenue, 0);
  const computeTotal = data.reduce((sum, point) => sum + point.compute, 0);
  const tooltipStyle = {
    background: 'rgb(7 11 19 / 0.97)',
    border: '1px solid rgb(51 65 85 / 0.8)',
    borderRadius: 10,
    fontSize: 11,
    padding: '8px 10px',
    boxShadow: '0 18px 40px -20px rgba(0,0,0,0.9)',
  };

  const exportCsv = () => {
    const header = 'date,revenue,llm_cost,video_cost,compute,gross_margin_pct';
    const rows = data.map((point) =>
      [point.date, point.revenue, point.llmCost, point.videoCost, point.compute, point.margin].join(','),
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `omnipost-unit-economics-${range}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast('Economics exported', `${days} days of revenue vs compute in CSV.`, 'success');
  };

  const kpis = [
    {
      label: 'Monthly recurring revenue',
      value: formatMoney(executiveKpis.mrr, true),
      delta: executiveKpis.mrrGrowth,
      sub: `${formatMoney(executiveKpis.mrr * 12, true)} ARR · ${formatNumber(executiveKpis.workspaces)} accounts`,
      icon: DollarSign,
      tone: 'indigo' as const,
    },
    {
      label: 'Active workspaces',
      value: formatNumber(executiveKpis.workspaces),
      delta: executiveKpis.workspacesGrowth,
      sub: `${executiveKpis.planMix.Free} Free · ${executiveKpis.planMix.Pro} Pro · ${executiveKpis.planMix.Agency} Agency`,
      icon: Building2,
      tone: 'violet' as const,
    },
    {
      label: 'Posts published today',
      value: formatNumber(executiveKpis.postsToday),
      delta: executiveKpis.postsGrowth,
      sub: 'Across 5 networks · 99.2% publish success',
      icon: Send,
      tone: 'emerald' as const,
    },
    {
      label: 'Gross margin',
      value: `${executiveKpis.grossMargin}%`,
      delta: executiveKpis.marginDelta,
      sub: `Compute ${formatMoney(executiveKpis.infraCost)} · 28.2% of revenue`,
      icon: Percent,
      tone: 'amber' as const,
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1460px] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-semibold tracking-tight text-white">Executive command</h1>
              <Pill tone="emerald" dot>
                Live
              </Pill>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Unit economics, platform throughput and infrastructure spend · updated 14s ago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
              {RANGES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRange(item.id)}
                  className={cx(
                    'h-6 rounded-md px-2 text-[10px] font-medium transition-colors',
                    range === item.id ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-300',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <AdminButton variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={exportCsv}>
              Export
            </AdminButton>
          </div>
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const positive = kpi.delta >= 0;
            return (
              <Panel key={kpi.label} className="relative overflow-hidden p-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">{kpi.label}</p>
                    <p className="mt-1 text-[23px] font-semibold tracking-tight text-white">{kpi.value}</p>
                  </div>
                  <span
                    className={cx(
                      'flex h-7 w-7 items-center justify-center rounded-lg border',
                      kpi.tone === 'indigo' && 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300',
                      kpi.tone === 'violet' && 'border-violet-500/20 bg-violet-500/10 text-violet-300',
                      kpi.tone === 'emerald' && 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
                      kpi.tone === 'amber' && 'border-amber-500/20 bg-amber-500/10 text-amber-300',
                    )}
                  >
                    <kpi.icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={cx(
                      'flex items-center gap-0.5 rounded px-1 py-0.5 text-[9.5px] font-medium',
                      positive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300',
                    )}
                  >
                    {positive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {Math.abs(kpi.delta)}%
                  </span>
                  <span className="truncate text-[9.5px] text-slate-600">{kpi.sub}</span>
                </div>
              </Panel>
            );
          })}
        </div>

        <div className="mt-2.5 grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_370px]">
          <Panel className="p-0">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 px-4 py-3">
              <div>
                <h2 className="text-[12.5px] font-semibold text-slate-100">Revenue vs infrastructure compute</h2>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  LLM tokens + Cloudinary renders vs subscription revenue · last {days} days
                </p>
              </div>
              <div className="flex items-center gap-3 text-[9.5px]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Revenue
                  <span className="font-mono text-slate-500">{formatMoney(revenueTotal, true)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Compute
                  <span className="font-mono text-slate-500">{formatMoney(computeTotal, true)}</span>
                </span>
              </div>
            </div>

            <div className="h-[288px] w-full px-1 pb-1 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="adminCompute" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgb(51 65 85 / 0.32)" strokeDasharray="3 4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgb(51 65 85 / 0.5)' }}
                    minTickGap={22}
                  />
                  <YAxis
                    yAxisId="revenue"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
                    width={46}
                  />
                  <YAxis
                    yAxisId="compute"
                    orientation="right"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `$${(value / 1000).toFixed(1)}k`}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4, fontSize: 10 }}
                    itemStyle={{ padding: 0 }}
                    formatter={(value, name) => [formatMoney(Number(value ?? 0)), String(name)]}
                  />
                  <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#a5b4fc"
                    strokeWidth={1.9}
                    fill="url(#adminRevenue)"
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                  <Area
                    yAxisId="compute"
                    type="monotone"
                    dataKey="compute"
                    name="Compute cost"
                    stroke="#fbbf24"
                    strokeWidth={1.6}
                    fill="url(#adminCompute)"
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 px-4 py-2">
              <span className="flex items-center gap-1.5 text-[9.5px] text-slate-500">
                <Zap className="h-2.5 w-2.5 text-amber-300" />
                Latest day: {formatMoney(latest.revenue)} revenue · {formatMoney(latest.compute)} compute ·{' '}
                <span className="text-emerald-300">{latest.margin}% margin</span>
              </span>
              <span className="flex items-center gap-3 font-mono text-[9px] text-slate-600">
                <span>LLM {formatMoney(latest.llmCost)}</span>
                <span>Video {formatMoney(latest.videoCost)}</span>
              </span>
            </div>
          </Panel>

          <ActivityStream />
        </div>

        <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Panel>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[12.5px] font-semibold text-slate-100">Unit economics</h2>
                <p className="mt-0.5 text-[10px] text-slate-500">Subscription revenue minus token and render spend</p>
              </div>
              <Pill tone="indigo">
                <Percent className="h-2.5 w-2.5" /> {executiveKpis.grossMargin}% gross margin
              </Pill>
            </div>

            <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900">
              <div className="inline-block h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: '71.8%' }} />
              <div className="inline-block h-full bg-amber-400/80" style={{ width: '18.9%' }} />
              <div className="inline-block h-full bg-violet-500/70" style={{ width: '9.3%' }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Gross profit</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> LLM inference</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> Video rendering</span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ['Subscription revenue', formatMoney(executiveKpis.mrr), '100% of MRR', 'text-slate-100'],
                ['Gross profit', formatMoney(executiveKpis.mrr - executiveKpis.infraCost), `${executiveKpis.grossMargin}% margin`, 'text-emerald-300'],
                ['LLM inference', `-${formatMoney(executiveKpis.llmCost)}`, '2.84M tokens today', 'text-amber-300'],
                ['Video rendering', `-${formatMoney(executiveKpis.videoCost)}`, '4,820 minutes rendered', 'text-violet-300'],
              ].map(([label, value, sub, tone]) => (
                <div key={label} className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">{label}</p>
                  <p className={cx('mt-0.5 font-mono text-[15px] font-semibold', tone)}>{value}</p>
                  <p className="mt-0.5 text-[9px] text-slate-600">{sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-slate-800/60 pt-2.5 text-[9.5px] text-slate-500">
              <span>ARPA <span className="font-mono text-slate-200">${executiveKpis.arpa}</span></span>
              <span>LTV / CAC <span className="font-mono text-emerald-300">4.7x</span></span>
              <span>Net revenue retention <span className="font-mono text-slate-200">118%</span></span>
              <span>CAC payback <span className="font-mono text-slate-200">8.4 mo</span></span>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[12.5px] font-semibold text-slate-100">Plan mix</h2>
                <p className="mt-0.5 text-[10px] text-slate-500">Active workspaces by subscription tier</p>
              </div>
              <Pill tone="violet">
                <Sparkles className="h-2.5 w-2.5" /> 108 agency
              </Pill>
            </div>

            <div className="mt-3 space-y-3">
              {(['Agency', 'Pro', 'Free'] as const).map((plan) => {
                const count = executiveKpis.planMix[plan];
                const share = (count / executiveKpis.workspaces) * 100;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlanPill plan={plan} />
                        <span className="text-[9.5px] text-slate-600">{formatNumber(count)} workspaces</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-300">{share.toFixed(1)}%</span>
                    </div>
                    <MiniBar value={share} tone={plan === 'Agency' ? 'amber' : plan === 'Pro' ? 'indigo' : 'slate'} className="mt-1.5" />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] p-2.5">
              <p className="flex items-center gap-1.5 text-[9.5px] font-medium text-indigo-200">
                <Sparkles className="h-2.5 w-2.5" /> Agency is the margin engine
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-indigo-200/60">
                8.4% of workspaces generate 23.4% of MRR. Expansion revenue is up 18% month over month.
              </p>
            </div>

            <button className="mt-2.5 flex w-full items-center justify-between rounded-lg border border-slate-800 px-2.5 py-2 text-[10px] text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200">
              Open tenant manager
              <ArrowRight className="h-3 w-3" />
            </button>
          </Panel>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}

function ActivityStream() {
  const [events, setEvents] = useState<ActivityEvent[]>(activitySeed);
  const cursor = useRef(0);
  const counter = useRef(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = activityCycle[cursor.current % activityCycle.length];
      cursor.current += 1;
      counter.current += 1;
      setEvents((previous) =>
        [
          { ...next, id: `live-${counter.current}`, time: 'Just now' },
          ...previous.map((event, index) => (index === 0 && event.time === 'Just now' ? { ...event, time: '8s ago' } : event)),
        ].slice(0, 8),
      );
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Panel padded={false} className="flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-100">
            Live activity
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          </h2>
          <p className="mt-0.5 text-[10px] text-slate-500">Signups, upgrades, schedules and quota alerts</p>
        </div>
        <Pill tone="emerald" dot>
          Streaming
        </Pill>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-slate-800/50 overflow-y-auto">
        {events.map((event, index) => {
          const Icon = ACTIVITY_ICON[event.type];
          const tone = ACTIVITY_TONE[event.type];
          return (
            <div
              key={event.id}
              className={cx(
                'flex items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-slate-900/40',
                index === 0 && event.time === 'Just now' && 'animate-slideIn bg-indigo-500/[0.03]',
              )}
            >
              <span
                className={cx(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                  TONE_STYLES[tone].chip,
                )}
              >
                <Icon className="h-3 w-3" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10.5px] font-medium text-slate-200">{event.workspace}</p>
                <p className="truncate text-[9.5px] text-slate-500">{event.detail}</p>
              </div>
              <div className="shrink-0 text-right">
                {event.meta && <p className="font-mono text-[9px] text-slate-400">{event.meta}</p>}
                <p className="text-[8.5px] text-slate-600">{event.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800/70 px-4 py-2 text-[9px] text-slate-600">
        <span>Streaming from 1,284 workspaces</span>
        <button className="flex items-center gap-1 text-slate-400 transition-colors hover:text-slate-200">
          Audit log <ArrowRight className="h-2.5 w-2.5" />
        </button>
      </div>
    </Panel>
  );
}
