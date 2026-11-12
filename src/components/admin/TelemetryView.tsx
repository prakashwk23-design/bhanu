import {
  Activity,
  AudioLines,
  Clock3,
  Cloud,
  Cpu,
  Film,
  Images,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  formatMoney,
  formatNumber,
  formatTokenCount,
  mediaJobs,
  mediaSummary,
  modelMetrics,
  toneMetrics,
  type MediaJobStatus,
  type MediaJobType,
} from '../../lib/adminData';
import { cx } from '../ui/Primitives';
import { MiniBar, Panel, Pill, TableShell, Td, Th } from './AdminUI';

const MODEL_TONE = {
  'gpt-4o': 'from-emerald-400 to-teal-500',
  claude: 'from-amber-400 to-orange-500',
  gemini: 'from-sky-400 to-blue-500',
} as const;

const MEDIA_META: Record<MediaJobType, { label: string; icon: typeof Cloud; tone: 'indigo' | 'emerald' | 'violet'; bar: string }> = {
  cloudinary: { label: 'g_auto crop', icon: Cloud, tone: 'indigo', bar: 'bg-indigo-400' },
  whisper: { label: 'Whisper captions', icon: AudioLines, tone: 'emerald', bar: 'bg-emerald-400' },
  carousel: { label: 'Canvas split', icon: Images, tone: 'violet', bar: 'bg-violet-400' },
};

const MEDIA_STATUS: Record<MediaJobStatus, { label: string; tone: 'amber' | 'emerald' | 'rose' }> = {
  active: { label: 'Processing', tone: 'amber' },
  completed: { label: 'Completed', tone: 'emerald' },
  failed: { label: 'Failed', tone: 'rose' },
};

const totalTokens = modelMetrics.reduce((sum, model) => sum + model.tokens, 0);
const totalAiSpend = modelMetrics.reduce((sum, model) => sum + model.cost, 0);
const totalCalls = modelMetrics.reduce((sum, model) => sum + model.calls, 0);
const avgLatency = Math.round(
  modelMetrics.reduce((sum, model) => sum + model.latencyMs * model.calls, 0) / totalCalls,
);

export function TelemetryView() {
  const kpis = [
    {
      label: 'AI compute spend',
      value: formatMoney(totalAiSpend),
      sub: `${formatTokenCount(totalTokens)} tokens · ${formatNumber(totalCalls)} calls`,
      icon: Cpu,
      accent: 'text-indigo-300',
      delta: '+14.2%',
    },
    {
      label: 'Media render spend',
      value: formatMoney(mediaSummary.spend),
      sub: `${formatNumber(mediaSummary.minutesRendered)} min rendered this month`,
      icon: Film,
      accent: 'text-violet-300',
      delta: '+6.8%',
    },
    {
      label: 'Avg compose latency',
      value: `${(avgLatency / 1000).toFixed(2)}s`,
      sub: 'Weighted across models and tones',
      icon: Clock3,
      accent: 'text-amber-300',
      delta: '−182ms',
    },
    {
      label: 'Renders today',
      value: formatNumber(mediaSummary.rendersToday),
      sub: `${mediaSummary.queueDepth} queued · ${mediaSummary.successRate}% success`,
      icon: Zap,
      accent: 'text-emerald-300',
      delta: '+9.4%',
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1460px] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-semibold tracking-tight text-white">AI & media telemetry</h1>
              <Pill tone="indigo" dot>
                Current billing cycle
              </Pill>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Token usage, model latency and render economics across Composer and Smart Media Studio
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5">
              AI / media split <span className="font-mono text-slate-200">{Math.round((totalAiSpend / (totalAiSpend + mediaSummary.spend)) * 100)} / {Math.round((mediaSummary.spend / (totalAiSpend + mediaSummary.spend)) * 100)}</span>
            </span>
          </div>
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Panel key={kpi.label} className="p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">{kpi.label}</p>
                  <p className="mt-1 text-[23px] font-semibold tracking-tight text-white">{kpi.value}</p>
                </div>
                <span className={cx('flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70', kpi.accent)}>
                  <kpi.icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={cx('rounded px-1 py-0.5 text-[9.5px] font-medium', kpi.delta.startsWith('−') ? 'bg-emerald-500/10 text-emerald-300' : 'bg-indigo-500/10 text-indigo-300')}>
                  {kpi.delta}
                </span>
                <span className="truncate text-[9.5px] text-slate-600">{kpi.sub}</span>
              </div>
            </Panel>
          ))}
        </div>

        <div className="mt-2.5 grid gap-2.5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <Panel padded={false} className="overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-800/70 px-4 py-3">
              <div>
                <h2 className="text-[12.5px] font-semibold text-slate-100">AI Composer · model performance</h2>
                <p className="mt-0.5 text-[10px] text-slate-500">Token spend and latency by formatter model</p>
              </div>
              <Pill tone="indigo">
                <Sparkles className="h-2.5 w-2.5" /> {formatTokenCount(totalTokens)} tokens
              </Pill>
            </div>
            <TableShell minWidthClass="min-w-[700px]">
              <thead>
                <tr>
                  <Th className="pl-4">Model</Th>
                  <Th>Calls</Th>
                  <Th>Tokens</Th>
                  <Th className="w-[170px]">Avg latency</Th>
                  <Th>Cost</Th>
                  <Th className="pr-4">Share</Th>
                </tr>
              </thead>
              <tbody>
                {modelMetrics.map((model) => (
                  <tr key={model.id} className="transition-colors hover:bg-slate-900/40">
                    <Td className="pl-4">
                      <div className="flex items-center gap-2">
                        <span className={cx('h-7 w-1 rounded-full bg-gradient-to-b', MODEL_TONE[model.id as keyof typeof MODEL_TONE] ?? 'from-slate-500 to-slate-700')} />
                        <div>
                          <p className="text-[11px] font-medium text-slate-100">{model.name}</p>
                          <p className="text-[8.5px] text-slate-600">{model.vendor} · ${model.costPer1k}/1k output</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono text-[10px]">{formatNumber(model.calls)}</Td>
                    <Td className="font-mono text-[10px]">{formatTokenCount(model.tokens)}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-mono text-[10px] text-slate-300">{(model.latencyMs / 1000).toFixed(2)}s</span>
                        <MiniBar value={(model.latencyMs / 2200) * 100} tone={model.latencyMs > 1700 ? 'amber' : 'indigo'} />
                      </div>
                    </Td>
                    <Td className="font-mono text-[10px] text-slate-200">{formatMoney(model.cost)}</Td>
                    <Td className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{model.share}%</span>
                        <MiniBar value={model.share} tone={model.share > 40 ? 'indigo' : 'violet'} className="w-12" />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[9px] text-slate-600">
              <span>Claude carries the X threader · GPT-4o handles LinkedIn and IG</span>
              <span className="font-mono">${(totalAiSpend / 30 / 1000).toFixed(2)}/hr blended</span>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[12.5px] font-semibold text-slate-100">Tone presets</h2>
                <p className="mt-0.5 text-[10px] text-slate-500">Usage and latency by tone</p>
              </div>
              <Pill tone="violet">4 presets</Pill>
            </div>

            <div className="mt-3 space-y-3">
              {toneMetrics.map((tone) => (
                <div key={tone.tone}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-300">{tone.tone}</span>
                    <span className="font-mono text-[9px] text-slate-500">{formatTokenCount(tone.tokens)} tokens</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <MiniBar value={tone.share * 2.2} tone={tone.tone === 'Witty' ? 'violet' : 'indigo'} />
                    <span className="w-7 text-right font-mono text-[9px] text-slate-400">{tone.share}%</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[8.5px] text-slate-600">
                    <span>{formatNumber(tone.calls)} calls · {(tone.latencyMs / 1000).toFixed(2)}s avg</span>
                    <span className="font-mono">{formatMoney(tone.cost)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] px-2.5 py-2 text-[9px] leading-relaxed text-indigo-200/70">
              Thought Leader drives 42% of spend but the highest save rate. Witty is 3.4× cheaper per accepted draft.
            </div>
          </Panel>
        </div>

        <div className="mt-2.5 grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_290px]">
          <Panel padded={false} className="overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800/70 px-4 py-3">
              <div>
                <h2 className="text-[12.5px] font-semibold text-slate-100">Media pipeline</h2>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Cloudinary subject tracking, Whisper captions and canvas carousel splits
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Pill tone="amber" dot>{mediaSummary.active} active</Pill>
                <Pill tone="emerald">{mediaSummary.successRate}% success</Pill>
              </div>
            </div>

            <TableShell minWidthClass="min-w-[830px]">
              <thead>
                <tr>
                  <Th className="pl-4">Asset</Th>
                  <Th>Pipeline</Th>
                  <Th>Workspace</Th>
                  <Th>Status</Th>
                  <Th>Duration</Th>
                  <Th>Size delta</Th>
                  <Th className="pr-4">Cost</Th>
                </tr>
              </thead>
              <tbody>
                {mediaJobs.map((job) => {
                  const media = MEDIA_META[job.type];
                  const status = MEDIA_STATUS[job.status];
                  const delta = job.inputMb - job.outputMb;
                  return (
                    <tr key={job.id} className="transition-colors hover:bg-slate-900/40">
                      <Td className="pl-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-500">
                            <media.icon className="h-3 w-3" />
                          </span>
                          <div>
                            <p className="max-w-[150px] truncate text-[10.5px] font-medium text-slate-200">{job.asset}</p>
                            <p className="font-mono text-[8px] text-slate-600">{job.id}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Pill tone={media.tone}>
                          <span className={cx('h-1.5 w-1.5 rounded-full', media.bar)} /> {media.label}
                        </Pill>
                      </Td>
                      <Td className="text-[10px] text-slate-400">{job.workspace}</Td>
                      <Td>
                        <Pill tone={status.tone} dot={job.status === 'active'}>
                          {status.label}
                        </Pill>
                      </Td>
                      <Td className="font-mono text-[10px] text-slate-400">{job.duration}</Td>
                      <Td>
                        {job.outputMb ? (
                          <span className="font-mono text-[10px] text-emerald-300">−{formatNumber(Math.round(delta))} MB</span>
                        ) : (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                      </Td>
                      <Td className="pr-4 font-mono text-[10px] text-slate-300">${job.cost.toFixed(2)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableShell>
            <div className="flex items-center justify-between px-4 py-2 text-[9px] text-slate-600">
              <span>Whisper jobs write word-level captions to D1</span>
              <span>{mediaSummary.queueDepth} queued · 2 workers / region</span>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-[12.5px] font-semibold text-slate-100">Pipeline mix</h2>
            <p className="mt-0.5 text-[10px] text-slate-500">Share of render minutes</p>

            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900">
              <div className="inline-block h-full bg-indigo-400" style={{ width: `${mediaSummary.cloudinaryShare}%` }} />
              <div className="inline-block h-full bg-emerald-400" style={{ width: `${mediaSummary.whisperShare}%` }} />
              <div className="inline-block h-full bg-violet-400" style={{ width: `${mediaSummary.carouselShare}%` }} />
            </div>
            <div className="mt-2 space-y-1.5">
              {[
                ['Cloudinary g_auto', mediaSummary.cloudinaryShare, 'bg-indigo-400'],
                ['Whisper captions', mediaSummary.whisperShare, 'bg-emerald-400'],
                ['Canvas carousel', mediaSummary.carouselShare, 'bg-violet-400'],
              ].map(([label, value, color]) => (
                <div key={String(label)} className="flex items-center justify-between text-[9px]">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className={cx('h-1.5 w-1.5 rounded-full', String(color))} /> {label}
                  </span>
                  <span className="font-mono text-slate-300">{value}%</span>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-2.5">
              {[
                ['Renders today', formatNumber(mediaSummary.rendersToday)],
                ['Minutes', formatNumber(mediaSummary.minutesRendered)],
                ['Queue', String(mediaSummary.queueDepth)],
                ['Spend', formatMoney(mediaSummary.spend)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[8px] uppercase tracking-[0.1em] text-slate-600">{label}</p>
                  <p className="mt-0.5 font-mono text-[12px] text-slate-200">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-slate-800 bg-slate-950/40 px-2.5 py-2 text-[8.5px] leading-relaxed text-slate-500">
              <Activity className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-400" />
              g_auto crops are saving 71% of source bytes on average. Whisper averages $0.006 per minute.
            </div>
          </Panel>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
