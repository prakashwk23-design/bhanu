import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Mail,
  RotateCcw,
  Search,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  UserRound,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import {
  adminWorkspaces,
  formatMoney,
  formatNumber,
  type AdminWorkspace,
  type TenantStatus,
} from '../../lib/adminData';
import type { PlanTier } from '../../lib/types';
import { useApp } from '../../lib/store';
import { cx } from '../ui/Primitives';
import {
  AdminButton,
  AdminDrawer,
  MiniBar,
  Panel,
  Pill,
  PlanPill,
  TableShell,
  Td,
  Th,
} from './AdminUI';

const PLAN_LIMITS: Record<PlanTier, { credits: number; video: number; mrr: number }> = {
  Free: { credits: 2500, video: 30, mrr: 0 },
  Pro: { credits: 7500, video: 150, mrr: 149 },
  Agency: { credits: 15000, video: 500, mrr: 399 },
};

const STATUS_TONE: Record<TenantStatus, 'emerald' | 'amber' | 'rose'> = {
  Active: 'emerald',
  'Rate-limited': 'amber',
  Suspended: 'rose',
};

function creditTone(used: number, limit: number) {
  const pct = (used / limit) * 100;
  if (pct >= 95) return 'rose' as const;
  if (pct >= 75) return 'amber' as const;
  return 'indigo' as const;
}

export function TenantsView() {
  const { impersonateWorkspace, toast } = useApp();
  const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>(adminWorkspaces);
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState<'All' | PlanTier>('All');
  const [status, setStatus] = useState<'All' | TenantStatus>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = workspaces.find((workspace) => workspace.id === selectedId) ?? null;
  const attention = workspaces.filter((workspace) => workspace.status !== 'Active').length;

  const filtered = useMemo(
    () =>
      workspaces.filter((workspace) => {
        const haystack = `${workspace.name} ${workspace.ownerEmail} ${workspace.ownerName}`.toLowerCase();
        if (query && !haystack.includes(query.toLowerCase())) return false;
        if (plan !== 'All' && workspace.plan !== plan) return false;
        if (status !== 'All' && workspace.status !== status) return false;
        return true;
      }),
    [workspaces, query, plan, status],
  );

  const patchWorkspace = (id: string, patch: Partial<AdminWorkspace>) => {
    setWorkspaces((previous) => previous.map((workspace) => (workspace.id === id ? { ...workspace, ...patch } : workspace)));
  };

  const grantCredits = (workspace: AdminWorkspace) => {
    patchWorkspace(workspace.id, { creditsLimit: workspace.creditsLimit + 2500 });
    toast('Bonus credits granted', `${workspace.name} · +2,500 AI credits added to this cycle.`, 'success');
  };

  const resetVideo = (workspace: AdminWorkspace) => {
    patchWorkspace(workspace.id, { videoUsed: 0 });
    toast('Video quota reset', `${workspace.name} · render minutes restored to ${workspace.videoLimit}.`, 'success');
  };

  const changePlan = (workspace: AdminWorkspace, nextPlan: PlanTier) => {
    if (workspace.plan === nextPlan) return;
    patchWorkspace(workspace.id, {
      plan: nextPlan,
      creditsLimit: PLAN_LIMITS[nextPlan].credits,
      videoLimit: PLAN_LIMITS[nextPlan].video,
      mrr: PLAN_LIMITS[nextPlan].mrr,
    });
    toast('Subscription changed', `${workspace.name} moved ${workspace.plan} → ${nextPlan}.`, 'success');
  };

  const toggleSuspension = (workspace: AdminWorkspace) => {
    const next: TenantStatus = workspace.status === 'Suspended' ? 'Active' : 'Suspended';
    patchWorkspace(workspace.id, { status: next });
    toast(
      next === 'Suspended' ? 'Workspace suspended' : 'Workspace reactivated',
      `${workspace.name} · publishing ${next === 'Suspended' ? 'paused immediately' : 'restored'}.`,
      next === 'Suspended' ? 'warning' : 'success',
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1460px] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-semibold tracking-tight text-white">Tenants & quota manager</h1>
              <Pill tone="amber" dot>
                {attention} need attention
              </Pill>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {workspaces.length} sampled workspaces · AI credits, render minutes and plan entitlements
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5">
              MRR in view <span className="font-mono text-slate-200">{formatMoney(filtered.reduce((sum, item) => sum + item.mrr, 0))}</span>
            </span>
            <span className="hidden rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 sm:inline">
              Agency <span className="font-mono text-slate-200">{workspaces.filter((item) => item.plan === 'Agency').length}</span>
            </span>
          </div>
        </div>

        <Panel padded={false} className="mt-3 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/70 px-3 py-2.5">
            <div className="flex h-8 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 md:max-w-[340px]">
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search workspace, owner or email…"
                aria-label="Search workspaces"
                className="w-full bg-transparent text-[11px] text-slate-200 outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <select
                value={plan}
                onChange={(event) => setPlan(event.target.value as 'All' | PlanTier)}
                aria-label="Filter by plan"
                className="h-8 rounded-lg border border-slate-800 bg-slate-950/60 px-2 text-[10.5px] text-slate-300 outline-none focus:border-indigo-500/50"
              >
                <option value="All">All plans</option>
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Agency">Agency</option>
              </select>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as 'All' | TenantStatus)}
                aria-label="Filter by status"
                className="h-8 rounded-lg border border-slate-800 bg-slate-950/60 px-2 text-[10.5px] text-slate-300 outline-none focus:border-indigo-500/50"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Rate-limited">Rate-limited</option>
                <option value="Suspended">Suspended</option>
              </select>
              <span className="ml-1 text-[9.5px] text-slate-600">{filtered.length} results</span>
            </div>
          </div>

          <TableShell>
            <thead>
              <tr>
                <Th className="pl-4">Workspace</Th>
                <Th>Plan</Th>
                <Th>Social</Th>
                <Th className="w-[180px]">AI credits</Th>
                <Th className="w-[170px]">Video rendered</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((workspace) => {
                const creditPct = (workspace.creditsUsed / workspace.creditsLimit) * 100;
                const videoPct = (workspace.videoUsed / workspace.videoLimit) * 100;
                return (
                  <tr
                    key={workspace.id}
                    onClick={() => setSelectedId(workspace.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') setSelectedId(workspace.id);
                    }}
                    tabIndex={0}
                    className="group cursor-pointer transition-colors hover:bg-slate-900/40 focus:bg-slate-900/50 focus:outline-none"
                  >
                    <Td className="pl-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cx(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[9px] font-bold text-white',
                            workspace.tone,
                          )}
                        >
                          {workspace.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11.5px] font-medium text-slate-100">{workspace.name}</p>
                          <p className="truncate text-[9.5px] text-slate-500">{workspace.ownerEmail}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><PlanPill plan={workspace.plan} /></Td>
                    <Td>
                      <span className="flex items-center gap-1 text-[10.5px] text-slate-400">
                        <Users className="h-3 w-3 text-slate-600" /> {workspace.accounts}
                        <span className="text-slate-600">/ 5</span>
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-between text-[9.5px]">
                        <span className="font-mono text-slate-300">{formatNumber(workspace.creditsUsed)}</span>
                        <span className="text-slate-600">/ {formatNumber(workspace.creditsLimit)}</span>
                      </div>
                      <MiniBar value={creditPct} tone={creditTone(workspace.creditsUsed, workspace.creditsLimit)} className="mt-1" />
                    </Td>
                    <Td>
                      <div className="flex items-center justify-between text-[9.5px]">
                        <span className="font-mono text-slate-300">{workspace.videoUsed} min</span>
                        <span className="text-slate-600">/ {workspace.videoLimit}</span>
                      </div>
                      <MiniBar value={videoPct} tone={videoPct > 90 ? 'amber' : 'emerald'} className="mt-1" />
                    </Td>
                    <Td>
                      <Pill tone={STATUS_TONE[workspace.status]} dot>
                        {workspace.status}
                      </Pill>
                    </Td>
                    <Td className="whitespace-nowrap text-[10px] text-slate-500">{workspace.joined}</Td>
                    <Td>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-700 transition-colors group-hover:text-indigo-300" />
                    </Td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[11px] text-slate-500">
                    No workspaces match those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </TableShell>

          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[9px] text-slate-600">
            <span>Last synced 14s ago · quota counters refresh every 5 minutes</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5" /> Admin actions are written to the audit log
            </span>
          </div>
        </Panel>

        <div className="h-4" />
      </div>

      <AdminDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        label={selected ? `${selected.name} tenant detail` : 'Tenant detail'}
      >
        {selected && (
          <>
            <div className="flex items-start justify-between border-b border-slate-800/70 px-4 py-3">
              <div>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-slate-600">Tenant detail</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-300">Workspace ID · {selected.id}</p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close tenant detail"
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="flex items-start gap-3">
                <span
                  className={cx(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-lg',
                    selected.tone,
                  )}
                >
                  {selected.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="truncate text-[15px] font-semibold text-white">{selected.name}</h2>
                    <PlanPill plan={selected.plan} />
                    <Pill tone={STATUS_TONE[selected.status]} dot>{selected.status}</Pill>
                  </div>
                  <p className="mt-0.5 truncate text-[10.5px] text-slate-500">
                    {selected.ownerName} · {selected.ownerEmail}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-slate-600">
                    <CalendarDays className="h-2.5 w-2.5" /> Joined {selected.joined} · active {selected.lastActive}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Monthly revenue', value: selected.mrr ? formatMoney(selected.mrr) : '—', sub: selected.plan === 'Free' ? 'Free tier' : 'per month', icon: CreditCard },
                  { label: 'Brands', value: String(selected.brands), sub: 'brand voices', icon: Building2 },
                  { label: 'Social accounts', value: `${selected.accounts} / 5`, sub: 'connected', icon: Users },
                  { label: 'Lifetime posts', value: formatNumber(120 + selected.creditsUsed / 3), sub: 'published', icon: Sparkles },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-slate-800/70 bg-slate-950/40 p-2.5">
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.08em] text-slate-500">
                      <stat.icon className="h-2.5 w-2.5" /> {stat.label}
                    </div>
                    <p className="mt-1 text-[15px] font-semibold text-slate-100">{stat.value}</p>
                    <p className="text-[8.5px] text-slate-600">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    <Zap className="h-3 w-3 text-amber-300" /> AI credits
                  </span>
                  <span className="font-mono text-[10px] text-slate-300">
                    {formatNumber(selected.creditsUsed)} / {formatNumber(selected.creditsLimit)}
                  </span>
                </div>
                <MiniBar
                  value={(selected.creditsUsed / selected.creditsLimit) * 100}
                  tone={creditTone(selected.creditsUsed, selected.creditsLimit)}
                  className="mt-2"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] text-slate-600">
                    {Math.round((selected.creditsUsed / selected.creditsLimit) * 100)}% of monthly allotment
                  </span>
                  <AdminButton size="xs" variant="secondary" icon={<Sparkles className="h-2.5 w-2.5" />} onClick={() => grantCredits(selected)}>
                    Grant 2,500
                  </AdminButton>
                </div>
              </div>

              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    <Video className="h-3 w-3 text-violet-300" /> Video rendered
                  </span>
                  <span className="font-mono text-[10px] text-slate-300">
                    {selected.videoUsed} / {selected.videoLimit} min
                  </span>
                </div>
                <MiniBar
                  value={(selected.videoUsed / selected.videoLimit) * 100}
                  tone={(selected.videoUsed / selected.videoLimit) > 0.9 ? 'amber' : 'emerald'}
                  className="mt-2"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] text-slate-600">Cloudinary g_auto + Whisper minutes</span>
                  <AdminButton size="xs" variant="secondary" icon={<RotateCcw className="h-2.5 w-2.5" />} onClick={() => resetVideo(selected)}>
                    Reset quota
                  </AdminButton>
                </div>
              </div>

              <AdminButton
                variant="primary"
                size="md"
                block
                icon={<UserRound className="h-3.5 w-3.5" />}
                onClick={() => {
                  impersonateWorkspace(selected);
                  setSelectedId(null);
                }}
                className="mt-3"
              >
                Impersonate workspace
              </AdminButton>
              <p className="mt-1.5 text-center text-[8.5px] leading-relaxed text-slate-600">
                Switches to the customer view with {selected.name}&apos;s workspace profile and a pre-loaded campaign draft.
              </p>

              <div className="mt-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">Subscription tier</p>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {(['Free', 'Pro', 'Agency'] as PlanTier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => changePlan(selected, tier)}
                      className={cx(
                        'rounded-lg border px-2 py-2 text-left transition-colors',
                        selected.plan === tier
                          ? 'border-indigo-400/40 bg-indigo-500/10'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700',
                      )}
                    >
                      <span className="block text-[10px] font-medium text-slate-200">{tier}</span>
                      <span className="block font-mono text-[9px] text-slate-500">
                        {PLAN_LIMITS[tier].credits / 1000}k credits · {PLAN_LIMITS[tier].video}m
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div>
                  <p className="text-[10px] font-medium text-slate-300">Workspace access</p>
                  <p className="mt-0.5 text-[9px] text-slate-600">
                    {selected.status === 'Suspended' ? 'Publishing and generation are paused.' : 'Publishing and generation are enabled.'}
                  </p>
                </div>
                <AdminButton
                  size="xs"
                  variant={selected.status === 'Suspended' ? 'primary' : 'danger'}
                  icon={selected.status === 'Suspended' ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldOff className="h-2.5 w-2.5" />}
                  onClick={() => toggleSuspension(selected)}
                >
                  {selected.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                </AdminButton>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-950/30 px-3 py-2 text-[8.5px] text-slate-600">
                <Mail className="h-3 w-3 shrink-0" />
                Changes apply immediately and are logged against root operator.
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/70 px-4 py-2.5">
              <span className="flex items-center gap-1 text-[9px] text-slate-600">
                <ArrowUpRight className="h-2.5 w-2.5" /> {formatMoney(selected.mrr * 12)} annual value
              </span>
              <AdminButton size="sm" variant="ghost" onClick={() => setSelectedId(null)}>
                Close
              </AdminButton>
            </div>
          </>
        )}
      </AdminDrawer>
    </div>
  );
}
