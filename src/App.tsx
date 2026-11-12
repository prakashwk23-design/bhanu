import { useState } from 'react';
import { AppProvider, useApp } from './lib/store';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastHost } from './components/layout/ToastHost';
import { ComposerView } from './components/composer/ComposerView';
import { CalendarView } from './components/calendar/CalendarView';
import { InboxView } from './components/inbox/InboxView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminPortal } from './components/admin/AdminPortal';

function Workspace() {
  const { view, theme } = useApp();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className={`relative flex h-screen overflow-hidden bg-app text-ink ${theme}`}>
      {/* Ambient light */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 -top-40 h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-fuchsia-600/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[280px] w-[520px] rounded-full bg-violet-600/[0.07] blur-[120px]" />
      </div>

      <Sidebar mobileOpen={mobileNav} onClose={() => setMobileNav(false)} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMobileNav(true)} />
        <main className="min-h-0 flex-1">
          <div key={view} className="h-full animate-fadeIn">
            {view === 'composer' && <ComposerView />}
            {view === 'calendar' && <CalendarView />}
            {view === 'inbox' && <InboxView />}
            {view === 'analytics' && <AnalyticsView />}
            {view === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      <ToastHost />
    </div>
  );
}

function PortalRouter() {
  const { portal } = useApp();
  return portal === 'admin' ? <AdminPortal /> : <Workspace />;
}

export default function App() {
  return (
    <AppProvider>
      <PortalRouter />
    </AppProvider>
  );
}
