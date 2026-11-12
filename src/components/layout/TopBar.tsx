import { Bell, ChevronRight, Command, Menu, Moon, Plus, ShieldCheck, Sun, TrendingUp } from 'lucide-react';
import { useApp } from '../../lib/store';
import { PLATFORM_ORDER, PLATFORMS, formatCompact } from '../../lib/platforms';
import { Button, IconButton, cx } from '../ui/Primitives';
import { PlatformGlyph } from '../icons/PlatformGlyph';

const VIEW_META: Record<string, { title: string; subtitle: string }> = {
  composer: { title: 'AI Composer', subtitle: 'Write once, tailor everywhere' },
  calendar: { title: 'Calendar & Queue', subtitle: 'Predictive smart scheduling' },
  inbox: { title: 'Unified Inbox', subtitle: 'Every comment, DM and mention' },
  analytics: { title: 'Cross-Platform Analytics', subtitle: 'Reach, engagement and growth' },
  settings: { title: 'Connected Accounts', subtitle: 'Brand voice and channel settings' },
};

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { view, theme, setTheme, accounts, setView, newDraft, toggleAccount, unreadCount, toast, apiStatus, activeWorkspace, setPortal } = useApp();
  const meta = VIEW_META[view];
  const connected = accounts.filter((a) => a.connected);
  const totalFollowers = connected.reduce((acc, a) => acc + a.followers, 0);

  return (
    <header className="relative z-30 flex h-[58px] shrink-0 items-center gap-3 border-b border-line/60 bg-app/70 px-3 backdrop-blur-xl sm:px-5">
      <button
        onClick={onMenu}
        aria-label="Open navigation"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line/60 text-muted lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10.5px] text-faint">
          <span>{activeWorkspace.name}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-muted">{meta.title}</span>
        </div>
        <p className="truncate text-[13px] font-semibold tracking-tight text-ink">{meta.subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Connected accounts */}
        <div className="hidden items-center rounded-full border border-line/70 bg-surface/60 px-1.5 py-1 xl:flex">
          {PLATFORM_ORDER.map((id) => {
            const account = accounts.find((a) => a.id === id);
            return (
              <button
                key={id}
                onClick={() => setView('settings')}
                title={`${PLATFORMS[id].name} · ${account?.connected ? `${formatCompact(account.followers)} followers` : 'Not connected'}`}
                aria-label={`${PLATFORMS[id].name} account status`}
                className="group relative flex h-6 w-6 items-center justify-center rounded-full transition-transform hover:z-10 hover:-translate-y-0.5"
              >
                <span
                  className={cx(
                    'flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
                    account?.connected
                      ? 'border-line/60 bg-app/60 text-ink'
                      : 'border-dashed border-line/80 bg-transparent text-faint/60',
                  )}
                >
                  <PlatformGlyph platform={id} className="h-3 w-3" />
                </span>
                <span
                  className={cx(
                    'absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-app',
                    account?.connected ? 'bg-emerald-400' : 'bg-slate-600',
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-1 rounded-full border border-line/70 bg-surface/60 px-2.5 py-1.5 md:flex">
          <TrendingUp className="h-3 w-3 text-emerald-400" />
          <span className="font-mono text-[10.5px] text-muted">{formatCompact(totalFollowers)}</span>
          <span className="text-[10px] text-faint">reachable</span>
        </div>

        <div
          title={
            apiStatus === 'online'
              ? 'Cloudflare D1 database connected'
              : apiStatus === 'offline'
                ? 'API offline — showing local seed data'
                : 'Connecting to the API'
          }
          className={cx(
            'hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 lg:flex',
            apiStatus === 'online'
              ? 'border-emerald-500/25 bg-emerald-500/10'
              : 'border-amber-500/25 bg-amber-500/10',
          )}
        >
          <span
            className={cx(
              'h-1.5 w-1.5 rounded-full',
              apiStatus === 'online' ? 'bg-emerald-400' : 'bg-amber-400',
              apiStatus === 'connecting' && 'animate-pulse',
            )}
          />
          <span className="text-[10px] text-muted">
            {apiStatus === 'online' ? 'D1 live' : apiStatus === 'offline' ? 'Offline seed' : 'Connecting'}
          </span>
        </div>

        <button
          onClick={() => setPortal('admin')}
          title="Switch to the Super Admin Portal"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-400/45 bg-indigo-500/15 px-2 py-1.5 text-[10.5px] font-semibold text-indigo-100 shadow-[0_0_18px_-8px_rgba(99,102,241,0.9)] transition-colors hover:border-indigo-300/60 hover:bg-indigo-500/25 sm:px-2.5"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
          <span className="hidden xl:inline">Admin Portal</span>
          <span className="hidden min-[420px]:inline xl:hidden">Admin</span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulseSoft" />
        </button>

        <div className="hidden h-5 w-px bg-line/70 sm:block" />

        <IconButton
          label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hidden sm:flex"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </IconButton>

        <button
          onClick={() => {
            setView('inbox');
            toast(`${unreadCount} conversations need a reply`, 'AI quick replies are ready for all of them.');
          }}
          aria-label="Notifications"
          title="Notifications"
          className="relative hidden h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted transition-colors hover:border-line/70 hover:bg-raised/70 hover:text-ink sm:flex"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 ring-2 ring-app" />}
        </button>

        <div className="hidden items-center gap-1.5 rounded-lg border border-line/70 bg-surface/60 px-2 py-1 text-[10px] text-faint lg:flex">
          <Command className="h-3 w-3" /> <span>K</span>
        </div>

        <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={newDraft} className="shrink-0">
          <span className="hidden sm:inline">New Post</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </header>
  );
}
