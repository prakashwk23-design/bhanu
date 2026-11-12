import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Code2,
  Copy,
  RefreshCw,
  RotateCw,
  ShieldCheck,
  WifiOff,
  XCircle,
} from 'lucide-react';
import {
  apiHealth,
  failedJobs,
  type ApiHealth,
  type ApiState,
  type FailedJob,
} from '../../lib/adminData';
import { PLATFORMS } from '../../lib/platforms';
import type { PlatformId } from '../../lib/types';
import { useApp } from '../../lib/store';
import { cx } from '../ui/Primitives';
import { PlatformGlyph } from '../icons/PlatformGlyph';
import {
  AdminButton,
  AdminModal,
  MiniBar,
  Panel,
  Pill,
  PlanPill,
  TableShell,
  Td,
  Th,
} from './AdminUI';

const HEALTH_TONE: Record<ApiState, 'emerald' | 'amber' | 'rose'> = {
  operational: 'emerald',
  degraded: 'amber',
  outage: 'rose',
};

const OAUTH_COPY: Record<ApiHealth['oauth'], { label: string; tone: 'emerald' | 'amber' | 'rose' }> = {
  verified: { label: 'Webhook verified', tone: 'emerald' },
  expiring: { label: 'Token refresh due', tone: 'amber' },
  'action-required': { label: 'Action required', tone: 'rose' },
};

export function PublishingView() {
  const { toast } = useApp();
  const [health, setHealth] = useState<ApiHealth[]>(apiHealth);
  const [jobs, setJobs] = useState<FailedJob[]>(failedJobs);
  const [retrying, setRetrying] = useState<Record<string, boolean>>({});
  const [inspect, setInspect] = useState<FailedJob | null>(null);
  const [lastCheck, setLastCheck] = useState('14s ago');
  const [platformFilter, setPlatformFilter] = useState<'all' | PlatformId>('all');

  const filteredJobs = jobs.filter((job) => platformFilter === 'all' || job.platform === platformFilter);
  const degraded = health.filter((item) => item.state !== 'operational').length;

  const refreshToken = (platform: PlatformId) => {
    setHealth((previous) =>
      previous.map((item) =>
        item.platform === platform
          ? { ...item, oauth: 'verified', note: 'OAuth token refreshed just now', state: item.uptime >= 99.5 ? 'operational' : 'degraded' }
          : item,
      ),
    );
    toast('OAuth token refreshed', `${PLATFORMS[platform].name} · webhook re-verified and write scope restored.`, 'success');
  };

  const retryJob = (job: FailedJob) => {
    setRetrying((previous) => ({ ...previous, [job.id]: true }));
    window.setTimeout(() => {
      setJobs((previous) => previous.filter((item) => item.id !== job.id));
      setRetrying((previous) => {
        const next = { ...previous };
        delete next[job.id];
        return next;
      });
      toast('Job requeued', `${job.workspace} · ${PLATFORMS[job.platform].name} publish retry accepted.`, 'success');
    }, 1300);
    toast('Retrying publish job', `${job.id} · forcing token refresh and re-running validation.`);
  };

  const forceTokenRefresh = (job: FailedJob) => {
    refreshToken(job.platform);
    toast('Token refreshed for job', `${job.id} · retry is now safe to run.`, 'success');
  };

  const copyPayload = async () => {
    if (!inspect) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(inspect.payload, null, 2));
      toast('Payload copied', 'JSON is on your clipboard.', 'success');
    } catch {
      toast('Could not copy payload', 'Select the JSON manually from the inspector.', 'warning');
    }
  };

  const refreshHealth = () => {
    setHealth((previous) =>
      previous.map((item) => ({
        ...item,
        latency: Math.max(80, item.latency + Math.round((Math.random() - 0.5) * 34)),
      })),
    );
    setLastCheck('Just now');
    toast('Health probe complete', '5 platform APIs responded · 2 degraded, 0 outages.', 'success');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1460px] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-semibold tracking-tight text-white">Publishing & API health</h1>
              <Pill tone={degraded ? 'amber' : 'emerald'} dot>
                {degraded ? `${degraded} degraded` : 'All nominal'}
              </Pill>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Five network integrations · checked {lastCheck} · retry window 30 minutes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-[10px] text-slate-500 sm:block">
              Dead letters <span className="font-mono text-rose-300">{jobs.length}</span>
            </span>
            <AdminButton variant="secondary" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={refreshHealth}>
              Refresh probes
            </AdminButton>
          </div>
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3 min-[1380px]:grid-cols-5">
          {health.map((item) => {
            const meta = PLATFORMS[item.platform];
            const OAuthIcon = item.oauth === 'verified' ? ShieldCheck : AlertTriangle;
            return (
              <Panel key={item.platform} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200">
                      <PlatformGlyph platform={item.platform} className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-100">{meta.name}</p>
                      <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-slate-600">{meta.handleLabel}</p>
                    </div>
                  </div>
                  <Pill tone={HEALTH_TONE[item.state]} dot>
                    {item.state === 'operational' ? 'Healthy' : item.state === 'degraded' ? 'Degraded' : 'Outage'}
                  </Pill>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[18px] font-semibold leading-none text-slate-100">
                      {item.latency}
                      <span className="ml-0.5 text-[9px] font-normal text-slate-500">ms</span>
                    </p>
                    <p className="mt-1 text-[8.5px] text-slate-600">p95 write latency</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] text-emerald-300">{item.uptime}%</p>
                    <p className="text-[8.5px] text-slate-600">30-day uptime</p>
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[8.5px]">
                    <span className="text-slate-500">Rate-limit capacity</span>
                    <span className="font-mono text-slate-300">{item.capacity}%</span>
                  </div>
                  <MiniBar
                    value={item.capacity}
                    tone={item.capacity < 30 ? 'rose' : item.capacity < 50 ? 'amber' : 'emerald'}
                    className="mt-1"
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-slate-800/60 pt-2">
                  <span className={cx('flex min-w-0 items-center gap-1 text-[8.5px]', item.oauth === 'verified' ? 'text-emerald-300/80' : item.oauth === 'expiring' ? 'text-amber-300/90' : 'text-rose-300/90')}>
                    <OAuthIcon className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{OAUTH_COPY[item.oauth].label}</span>
                  </span>
                  {item.oauth !== 'verified' && (
                    <button
                      onClick={() => refreshToken(item.platform)}
                      className="shrink-0 text-[8.5px] font-medium text-indigo-300 hover:text-indigo-200"
                    >
                      Refresh
                    </button>
                  )}
                </div>
                <p className="mt-1 truncate text-[8px] text-slate-600" title={item.note}>{item.note}</p>
              </Panel>
            );
          })}
        </div>

        <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_290px]">
          <Panel padded={false} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 px-4 py-3">
              <div>
                <h2 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-100">
                  Failed & stuck jobs
                  <Pill tone="rose">{jobs.length} in DLQ</Pill>
                </h2>
                <p className="mt-0.5 text-[10px] text-slate-500">Scheduled posts that exhausted automatic retries</p>
              </div>
              <select
                value={platformFilter}
                onChange={(event) => setPlatformFilter(event.target.value as 'all' | PlatformId)}
                aria-label="Filter jobs by platform"
                className="h-8 rounded-lg border border-slate-800 bg-slate-950/60 px-2 text-[10.5px] text-slate-300 outline-none focus:border-indigo-500/50"
              >
                <option value="all">All platforms</option>
                {Object.values(PLATFORMS).map((platform) => (
                  <option key={platform.id} value={platform.id}>{platform.name}</option>
                ))}
              </select>
            </div>

            <TableShell minWidthClass="min-w-[840px]">
              <thead>
                <tr>
                  <Th className="pl-4">Workspace</Th>
                  <Th>Platform</Th>
                  <Th>Error</Th>
                  <Th>Time</Th>
                  <Th className="text-right pr-4">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="group transition-colors hover:bg-slate-900/40">
                    <Td className="pl-4">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-slate-100">{job.workspace}</p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <PlanPill plan={job.plan} />
                            <span className="font-mono text-[8px] text-slate-600">{job.id}</span>
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="flex items-center gap-1.5 text-[10.5px] text-slate-300">
                        <PlatformGlyph platform={job.platform} className="h-3 w-3 text-slate-500" />
                        {PLATFORMS[job.platform].name}
                      </span>
                    </Td>
                    <Td className="max-w-[340px]">
                      <p className="flex items-center gap-1.5 text-[10.5px] font-medium text-rose-300">
                        {job.code.startsWith('429') ? <Clock3 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {job.code}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[9.5px] text-slate-500">{job.message}</p>
                    </Td>
                    <Td className="whitespace-nowrap text-[9.5px] text-slate-500">{job.time}</Td>
                    <Td className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <AdminButton
                          size="xs"
                          variant="secondary"
                          icon={<RotateCw className={cx('h-2.5 w-2.5', retrying[job.id] && 'animate-spin')} />}
                          disabled={Boolean(retrying[job.id])}
                          onClick={() => retryJob(job)}
                        >
                          {retrying[job.id] ? 'Retrying' : 'Retry'}
                        </AdminButton>
                        <button
                          onClick={() => forceTokenRefresh(job)}
                          title="Force token refresh"
                          aria-label={`Force token refresh for ${job.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 text-slate-500 hover:border-indigo-500/30 hover:text-indigo-300"
                        >
                          <ShieldCheck className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setInspect(job)}
                          title="Inspect payload JSON"
                          aria-label={`Inspect payload for ${job.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 text-slate-500 hover:border-indigo-500/30 hover:text-indigo-300"
                        >
                          <Code2 className="h-3 w-3" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
                {!filteredJobs.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400/70" />
                      <p className="mt-2 text-[11px] text-slate-400">Dead-letter queue is clear.</p>
                      <p className="text-[9px] text-slate-600">Every scheduled job published or retried successfully.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </TableShell>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 px-4 py-2 text-[9px] text-slate-600">
              <span className="flex items-center gap-1"><RefreshCw className="h-2.5 w-2.5" /> Auto-retry: 3 attempts with exponential backoff</span>
              <span>{jobs.length} failed today · 18 auto-recovered</span>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-[12.5px] font-semibold text-slate-100">Queue posture</h2>
            <p className="mt-0.5 text-[10px] text-slate-500">Rolling 60-minute publish throughput</p>

            <div className="mt-3 space-y-2.5">
              {[
                ['Published', 1240, 'emerald'],
                ['Retried', 84, 'amber'],
                ['In flight', 37, 'indigo'],
                ['Dead letters', 6, 'rose'],
              ].map(([label, value, tone]) => {
                const max = 1240;
                return (
                  <div key={String(label)}>
                    <div className="flex items-center justify-between text-[9.5px]">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-mono text-slate-300">{value}</span>
                    </div>
                    <MiniBar value={(Number(value) / max) * 100} tone={tone as 'emerald'} className="mt-1" />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-2.5">
              <p className="flex items-center gap-1 text-[9.5px] font-medium text-amber-200">
                <AlertTriangle className="h-2.5 w-2.5" /> Instagram token expires in 6 days
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-amber-200/60">
                Rotate before Nov 18 to avoid automatic publishing failures for 41 workspaces.
              </p>
              <AdminButton
                size="xs"
                variant="amber"
                className="mt-2"
                icon={<RefreshCw className="h-2.5 w-2.5" />}
                onClick={() => refreshToken('instagram')}
              >
                Refresh now
              </AdminButton>
            </div>

            <div className="mt-3 space-y-1.5 border-t border-slate-800/60 pt-2.5 text-[9px] text-slate-500">
              <div className="flex items-center justify-between"><span>Edge regions</span><span className="font-mono text-slate-300">12 / 12</span></div>
              <div className="flex items-center justify-between"><span>Webhook consumers</span><span className="font-mono text-emerald-300">Healthy</span></div>
              <div className="flex items-center justify-between"><span>Outbox lag</span><span className="font-mono text-slate-300">0.8s</span></div>
              <div className="flex items-center justify-between"><span>Last incident</span><span className="font-mono text-slate-300">14d ago</span></div>
            </div>
          </Panel>
        </div>

        <div className="h-4" />
      </div>

      <AdminModal
        open={Boolean(inspect)}
        onClose={() => setInspect(null)}
        title={inspect ? `Payload · ${inspect.id}` : 'Job payload'}
        subtitle={inspect ? `${inspect.workspace} · ${PLATFORMS[inspect.platform].name} · ${inspect.code}` : undefined}
        footer={
          <>
            <AdminButton variant="secondary" size="sm" icon={<Copy className="h-3 w-3" />} onClick={copyPayload}>
              Copy JSON
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              icon={<RotateCw className="h-3 w-3" />}
              onClick={() => {
                if (inspect) retryJob(inspect);
                setInspect(null);
              }}
            >
              Retry job
            </AdminButton>
          </>
        }
      >
        {inspect && (
          <div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
              {[
                ['Attempts', String(inspect.payload.attempt ?? 2)],
                ['Workspace', inspect.workspace],
                ['Platform', PLATFORMS[inspect.platform].name],
                ['Failure', inspect.time],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/50 p-2">
                  <p className="text-[8px] uppercase tracking-[0.1em] text-slate-600">{label}</p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-300">{value}</p>
                </div>
              ))}
            </div>
            <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-[#05080f] p-3 font-mono text-[10.5px] leading-relaxed text-slate-300">
              {JSON.stringify(inspect.payload, null, 2)}
            </pre>
            <p className="mt-2 flex items-center gap-1 text-[9px] text-slate-600">
              <WifiOff className="h-2.5 w-2.5" /> Payload retained for 30 days · contains no access tokens
            </p>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
