import { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Bell,
  Building2,
  ChevronRight,
  Command,
  Cpu,
  Gauge,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { ADMIN_VIEW_META, adminWorkspaces, failedJobs, featureFlagsSeed, mediaSummary } from '../../lib/adminData';
import type { AdminViewId } from '../../lib/types';
import { useApp } from '../../lib/store';
import { cx } from '../ui/Primitives';
import { ToastHost } from '../layout/ToastHost';
import { AdminButton, Pill } from './AdminUI';
import { ExecutiveView } from './ExecutiveView';
import { TenantsView } from './TenantsView';
import { PublishingView } from './PublishingView';
import { TelemetryView } from './TelemetryView';
import { FlagsView } from './FlagsView';

const ADMIN_NAV: {
  id: AdminViewId;
  label: string;
  hint: string;
  icon: typeof Gauge;
  group: string;
  badge?: string;
}[] = [
  { id: 'executive', label: 'Command & economics', hint: 'MRR, margin, live pulse', icon: Gauge, group: 'Command' },
  { id: 'tenants', label: 'Tenants & quotas', hint: 'Workspaces, plans, limits', icon: Building2, group: 'Operations', badge: String(adminWorkspaces.length) },
  { id: 'publishing', label: 'Publishing & API', hint: 'Queue health, dead letters', icon: Activity, group: 'Operations', badge: String(failedJobs.length) },
  { id: 'telemetry', label: 'AI & media telemetry', hint: 'Tokens, renders, latency', icon: Cpu, group: 'Platform', badge: String(mediaSummary.active) },
  { id: 'flags', label: 'Prompts & flags', hint: 'Live config, rollout', icon: SlidersHorizontal, group: 'Platform', badge: String(featureFlagsSeed.length) },
];

export function AdminPortal() {
  const { adminView, setAdminView, setPortal, activeWorkspace, toast } = useApp();
  const [mobileNav, setMobileNav] = useState(false);
  const meta = ADMIN_VIEW_META[adminView];

  const exitToWorkspace = () => {
    setPortal('workspace');
    toast('Customer workspace', `Returned to ${activeWorkspace.name}.`, 'success');
  };

  const navigate = (view: AdminViewId) => {
    setAdminView(view);
    setMobileNav(false);
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#04070d] font-sans text-slate-200">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 -top-48 h-[460px] w-[460px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-[380px] w-[380px] rounded-full bg-emerald-500/[0.05] blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[520px] rounded-full bg-violet-600/[0.06] blur-[130px]" />
        <div className="absolute inset-0 bg-noise opacity-40" />
      </div>

      <AdminSidebar
        active={adminView}
        onNavigate={navigate}
        onExit={exitToWorkspace}
        mobileOpen={mobileNav}
        onClose={() => setMobileNav(false)}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-slate-800/80 bg-[#05080f]/80 px-3 backdrop-blur-xl sm:px-5">
          <button
            onClick={() => setMobileNav(true)}
            aria-label="Open admin navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="flex items-center gap-1 text-amber-300/90">
                <ShieldCheck className="h-3 w-3" /> Super Admin
              </span>
              <ChevronRight className="h-3 w-3" />
              <span>{meta.crumb}</span>
            </div>
            <p className="truncate text-[13px] font-semibold tracking-tight text-slate-100">{meta.title}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 xl:flex">
              <Search className="h-3 w-3 text-slate-500" />
              <input
                aria-label="Search control plane"
                placeholder="Search workspaces, jobs, flags…"
                className="w-44 bg-transparent text-[10.5px] text-slate-200 outline-none placeholder:text-slate-600"
              />
              <span className="flex items-center gap-0.5 rounded border border-slate-800 px-1 font-mono text-[9px] text-slate-500">
                <Command className="h-2.5 w-2.5" /> K
              </span>
            </div>

            <Pill tone="emerald" dot className="hidden lg:inline-flex">
              Production · us-east
            </Pill>

            {activeWorkspace.id !== 'northwind' && (
              <Pill tone="amber" dot className="hidden 2xl:inline-flex">
                Impersonating {activeWorkspace.name}
              </Pill>
            )}

            <button
              aria-label="Admin notifications"
              className="relative hidden h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-colors hover:border-slate-800 hover:bg-slate-900 hover:text-slate-100 sm:flex"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-[#05080f]" />
            </button>

            <div className="hidden items-center gap-2 border-l border-slate-800 pl-2.5 md:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-[10px] font-bold text-slate-950">
                RO
              </span>
              <div className="hidden text-left xl:block">
                <p className="text-[10.5px] font-medium text-slate-200">Root operator</p>
                <p className="text-[9px] text-slate-500">ops@omnipost.ai</p>
              </div>
            </div>

            <AdminButton
              variant="amber"
              size="sm"
              icon={<ArrowLeft className="h-3.5 w-3.5" />}
              onClick={exitToWorkspace}
              className="shadow-[0_0_22px_-10px_rgba(251,191,36,0.7)]"
            >
              <span className="hidden sm:inline">Switch to workspace</span>
              <span className="sm:hidden">Workspace</span>
            </AdminButton>
          </div>
        </header>

        <main className="relative z-10 min-h-0 flex-1 overflow-hidden">
          <div key={adminView} className="h-full animate-fadeIn">
            {adminView === 'executive' && <ExecutiveView />}
            {adminView === 'tenants' && <TenantsView />}
            {adminView === 'publishing' && <PublishingView />}
            {adminView === 'telemetry' && <TelemetryView />}
            {adminView === 'flags' && <FlagsView />}
          </div>
        </main>
      </div>

      <ToastHost />
    </div>
  );
}

function AdminSidebar({
  active,
  onNavigate,
  onExit,
  mobileOpen,
  onClose,
}: {
  active: AdminViewId;
  onNavigate: (view: AdminViewId) => void;
  onExit: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const groups = ['Command', 'Operations', 'Platform'];

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={cx(
          'z-50 flex h-full w-[258px] shrink-0 flex-col border-r border-slate-800/80 bg-[#05080f]/95 backdrop-blur-2xl',
          'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:shadow-2xl max-lg:transition-transform',
          mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        )}
      >
        <div className="flex h-[58px] shrink-0 items-center gap-2.5 border-b border-slate-800/70 px-4">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] border border-amber-400/30 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-[0_6px_20px_-8px_rgba(251,146,60,0.8)]">
            <ShieldCheck className="h-4 w-4 text-slate-950" strokeWidth={2.4} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-[#05080f]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold tracking-tight text-white">OmniPost</p>
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.22em] text-amber-300/80">Control plane</p>
          </div>
          <button onClick={onClose} aria-label="Close navigation" className="text-slate-500 hover:text-slate-200 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 border-b border-slate-800/60 px-4 py-2">
          <span className="flex items-center gap-1 rounded border border-amber-400/20 bg-amber-400/[0.06] px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-amber-300">
            <Sparkles className="h-2.5 w-2.5" /> Super admin
          </span>
          <span className="font-mono text-[8.5px] text-slate-600">v1.0</span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group} className="mb-5 last:mb-0">
              <p className="mb-1.5 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">{group}</p>
              <nav className="flex flex-col gap-0.5">
                {ADMIN_NAV.filter((item) => item.group === group).map((item) => {
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={cx(
                        'group relative flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors',
                        isActive ? 'bg-indigo-500/10 text-slate-100' : 'text-slate-400 hover:bg-slate-900/70 hover:text-slate-100',
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                      )}
                      <item.icon className={cx('h-[15px] w-[15px] shrink-0', isActive ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300')} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11.5px] font-medium">{item.label}</span>
                        <span className="block truncate text-[9px] text-slate-600">{item.hint}</span>
                      </span>
                      {item.badge && (
                        <span
                          className={cx(
                            'flex h-[17px] min-w-[17px] items-center justify-center rounded-full border px-1 font-mono text-[9px]',
                            isActive
                              ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-200'
                              : 'border-slate-800 bg-slate-900 text-slate-500',
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">System pulse</span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-emerald-400" /> Nominal
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              {[
                ['API uptime', '99.98%'],
                ['Publish queue', '7 stuck'],
                ['D1 replicas', '3 healthy'],
                ['Open incidents', '0'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{label}</span>
                  <span className={cx('font-mono', value === '7 stuck' ? 'text-amber-300' : 'text-slate-300')}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            </div>
            <p className="mt-1.5 text-[8.5px] leading-relaxed text-slate-600">Compute spend 71.8% gross margin · 12 edge regions</p>
          </div>
        </div>

        <div className="border-t border-slate-800/70 p-3">
          <button
            onClick={onExit}
            className="flex w-full items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-2 text-left text-[10.5px] text-slate-400 transition-colors hover:border-amber-400/30 hover:text-amber-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Exit to customer workspace
            <ChevronRight className="ml-auto h-3 w-3" />
          </button>
          <div className="mt-2.5 flex items-center gap-2.5 px-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-[10px] font-bold text-slate-950">
              RO
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-slate-200">Root operator</p>
              <p className="truncate text-[9px] text-slate-500">Super admin · all tenants</p>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>
      </aside>
    </>
  );
}
