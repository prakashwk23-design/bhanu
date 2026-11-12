import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Inbox,
  PanelLeftClose,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import type { ViewId } from '../../lib/types';
import { cx, Meter } from '../ui/Primitives';
import { Avatar } from '../ui/Primitives';

const NAV: { id: ViewId; label: string; hint: string; icon: typeof Sparkles }[] = [
  { id: 'composer', label: 'AI Composer', hint: 'Media studio', icon: Sparkles },
  { id: 'calendar', label: 'Calendar & Queue', hint: 'Smart scheduling', icon: CalendarDays },
  { id: 'inbox', label: 'Unified Inbox', hint: 'Comments & DMs', icon: Inbox },
  { id: 'analytics', label: 'Analytics', hint: 'Cross-platform', icon: BarChart3 },
  { id: 'settings', label: 'Brand & Accounts', hint: 'Voice settings', icon: SlidersHorizontal },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { view, setView, sidebarCollapsed, toggleSidebar, unreadCount, posts, newDraft, activeWorkspace } = useApp();
  const scheduled = posts.filter((p) => p.status === 'scheduled').length;
  const pending = posts.filter((p) => p.status === 'pending').length;
  const collapsed = sidebarCollapsed;

  const badgeFor = (id: ViewId) => {
    if (id === 'inbox' && unreadCount > 0) return unreadCount;
    if (id === 'calendar' && scheduled + pending > 0) return scheduled + pending;
    return null;
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={cx(
          'z-50 flex h-full shrink-0 flex-col border-r border-line/60 bg-surface/50 backdrop-blur-2xl transition-[width,transform] duration-300',
          collapsed ? 'w-[74px]' : 'w-[250px]',
          'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:shadow-pop',
          mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className={cx('flex h-[58px] items-center gap-2.5 border-b border-line/50 px-4', collapsed && 'justify-center px-0')}>
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_6px_18px_-6px_rgba(99,102,241,0.9)]">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2.2} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-surface" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold tracking-tight text-ink">OmniPost AI</p>
              <p className="truncate text-[10px] uppercase tracking-[0.14em] text-faint">Command center</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="hidden h-7 w-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-raised hover:text-ink lg:flex"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Workspace switcher */}
        {!collapsed ? (
          <button className="mx-3 mt-3 flex items-center gap-2.5 rounded-xl border border-line/60 bg-raised/40 px-2.5 py-2 text-left transition-colors hover:border-line hover:bg-raised/80">
            <Avatar initials={activeWorkspace.initials} size={26} tone={activeWorkspace.tone} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium text-ink">{activeWorkspace.name}</p>
              <p className="truncate text-[10px] text-faint">
                {activeWorkspace.plan} workspace · {activeWorkspace.brands} brands
              </p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-faint" />
          </button>
        ) : (
          <div className="mt-3 flex justify-center">
            <Avatar initials={activeWorkspace.initials} size={30} tone={activeWorkspace.tone} />
          </div>
        )}

        <div className={cx('mt-5 px-3', collapsed && 'px-2')}>
          {!collapsed && <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint/80">Workspace</p>}
          <nav className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const active = view === item.id;
              const badge = badgeFor(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    onClose();
                  }}
                  title={collapsed ? item.label : undefined}
                  className={cx(
                    'group relative flex items-center gap-2.5 rounded-[10px] py-2 text-left transition-all duration-200',
                    collapsed ? 'justify-center px-0' : 'px-2',
                    active
                      ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/5 text-ink'
                      : 'text-muted hover:bg-raised/60 hover:text-ink',
                  )}
                >
                  {active && <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />}
                  <item.icon
                    className={cx('h-[15px] w-[15px] shrink-0 transition-colors', active ? 'text-indigo-300' : 'text-faint group-hover:text-muted')}
                    strokeWidth={2}
                  />
                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{item.label}</span>
                      {badge ? (
                        <span
                          className={cx(
                            'flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                            item.id === 'inbox'
                              ? 'bg-indigo-500 text-white'
                              : 'border border-line/70 bg-raised text-muted',
                          )}
                        >
                          {badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {!collapsed && (
          <div className="mx-3 mt-5 rounded-xl border border-line/60 bg-app/40 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">
                <Zap className="h-3 w-3 text-amber-300" /> AI credits
              </span>
              <span className="font-mono text-[10.5px] text-muted">7,420 / 10k</span>
            </div>
            <Meter value={74} className="mt-2" />
            <p className="mt-2 text-[10px] leading-relaxed text-faint">
              2,580 generations left this month · resets Dec 1
            </p>
            <button className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-md border border-indigo-400/30 bg-indigo-500/10 py-1.5 text-[10.5px] font-medium text-indigo-700 transition-colors hover:bg-indigo-500/20 dark:text-indigo-200">
              <Plus className="h-3 w-3" /> Add credits
            </button>
          </div>
        )}

        <div className="mt-auto border-t border-line/50 p-3">
          <div className={cx('flex items-center gap-2.5', collapsed && 'justify-center')}>
            <div className="relative">
              <Avatar initials={activeWorkspace.ownerName.split(' ').map((p) => p.charAt(0)).join('').slice(0, 2)} size={30} tone="from-emerald-400 to-teal-600" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-surface" />
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-ink">{activeWorkspace.ownerName}</p>
                  <p className="truncate text-[10px] text-faint">
                    {activeWorkspace.ownerName === 'Avery Reid' ? 'Head of Content' : 'Workspace owner'}
                  </p>
                </div>
                <button
                  onClick={newDraft}
                  aria-label="New post"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-raised hover:text-ink"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {collapsed && (
            <button
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="mt-2 flex w-full items-center justify-center rounded-md py-1.5 text-faint transition-colors hover:bg-raised hover:text-ink"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
