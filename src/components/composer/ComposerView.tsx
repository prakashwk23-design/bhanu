import { useMemo, useState } from 'react';
import { CalendarClock, Check, ChevronRight, CircleDot, Clock3, Send, Sparkles, Timer, Wand2, X } from 'lucide-react';
import { useApp } from '../../lib/store';
import { formatPeak, peakWindowOptions } from '../../lib/ai';
import { PLATFORMS } from '../../lib/platforms';
import { Badge, Button, Modal, StatusBadge, cx } from '../ui/Primitives';
import { PlatformGlyph } from '../icons/PlatformGlyph';
import { IdeaBar } from './IdeaBar';
import { MasterEditor } from './MasterEditor';
import { MediaStudio } from './MediaStudio';
import { PreviewGrid } from './PreviewGrid';

export function ComposerView() {
  const { draft, saveDraft, sendForApproval, scheduleAt, publishNow, remixOf, clearRemix, generation } = useApp();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const peaks = useMemo(() => peakWindowOptions(draft.platforms, new Date(), 3), [draft.platforms]);
  const [selectedSlot, setSelectedSlot] = useState(0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Composer header */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line/50 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="text-[13px] font-semibold tracking-tight text-ink">Composer</h1>
          <StatusBadge status={draft.status} />
          {remixOf && (
            <span className="flex max-w-[280px] items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 py-0.5 pl-2 pr-1 text-[10px] text-violet-200">
              <Wand2 className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">Remixing “{remixOf.title}”</span>
              <button onClick={clearRemix} aria-label="Clear remix source" className="rounded-full p-0.5 hover:bg-violet-500/20">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-faint">
          <span className="hidden items-center gap-1 sm:flex">
            <CircleDot className="h-2.5 w-2.5 text-emerald-400" /> Autosaved just now
          </span>
          <span className="hidden h-3 w-px bg-line/70 sm:block" />
          <span className="flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-indigo-300" /> Brand voice v3
          </span>
          <span className="hidden h-3 w-px bg-line/70 md:block" />
          <span className="hidden font-mono md:inline">draft #{draft.id.replace(/\D/g, '').slice(0, 4) || '0001'}</span>
        </div>
      </div>

      {/* Split workspace */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
        <section className="min-w-0 shrink-0 space-y-3 px-4 py-3 xl:w-[50%] xl:overflow-y-auto xl:border-r xl:border-line/50 2xl:w-[47%]">
          <IdeaBar />
          <MasterEditor />
          <MediaStudio />
          <div className="flex items-center gap-2 px-1 pb-1 text-[10px] text-faint">
            <Wand2 className="h-3 w-3 text-indigo-300" />
            Every change re-crops and re-times the preview on the right. No refresh, no tabs.
          </div>
        </section>

        <section className="min-w-0 flex-1 px-4 py-3 xl:overflow-y-auto">
          <PreviewGrid />
          <div className="h-4" />
        </section>
      </div>

      {/* Action bar */}
      <div className="relative z-20 shrink-0 border-t border-line/60 bg-app/85 px-3 py-2.5 backdrop-blur-xl sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex -space-x-1">
              {draft.platforms.map((id) => (
                <span
                  key={id}
                  className={cx(
                    'flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-white ring-2 ring-app',
                    PLATFORMS[id].gradient,
                  )}
                >
                  <PlatformGlyph platform={id} className="h-2.5 w-2.5" />
                </span>
              ))}
            </div>
            <div className="leading-tight">
              <p className="text-[10.5px] font-medium text-ink">{draft.platforms.length} channels ready</p>
              <p className="text-[9.5px] text-faint">
                {draft.status === 'published' ? 'Published · first comments sent' : 'Smart crops + captions applied'}
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="md" onClick={saveDraft}>
              Save draft
            </Button>
            <Button variant="subtle" size="md" onClick={sendForApproval} icon={<Send className="h-3.5 w-3.5" />}>
              <span className="hidden sm:inline">Send for client approval</span>
              <span className="sm:hidden">Approval</span>
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSelectedSlot(0);
                setScheduleOpen(true);
              }}
              icon={<Sparkles className="h-3.5 w-3.5" />}
            >
              <span className="hidden md:inline">Smart schedule</span>
              <span className="md:hidden">Schedule</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={generation.running}
              onClick={() => publishNow()}
              icon={<Send className="h-3.5 w-3.5" />}
            >
              Publish everywhere now
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Smart schedule · AI peak window"
        description="Predicted from your last 90 days of engagement plus live audience activity per channel."
        width="max-w-xl"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<CalendarClock className="h-3.5 w-3.5" />}
              onClick={() => {
                const peak = peaks[selectedSlot];
                scheduleAt(peak.iso, `${peak.day} ${peak.time}`, peak.match);
                setScheduleOpen(false);
              }}
            >
              Schedule at {peaks[selectedSlot]?.day} {peaks[selectedSlot]?.time}
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {peaks.map((peak, index) => {
            const active = selectedSlot === index;
            return (
              <button
                key={`${peak.day}-${peak.time}`}
                onClick={() => setSelectedSlot(index)}
                className={cx(
                  'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all',
                  active
                    ? 'border-indigo-400/60 bg-indigo-500/10 shadow-[0_0_24px_-14px_rgba(99,102,241,0.9)]'
                    : 'border-line/60 bg-app/40 hover:border-line',
                )}
              >
                <span className={cx('flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br text-white', PLATFORMS[peak.platform].gradient)}>
                  <PlatformGlyph platform={peak.platform} className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-ink">
                    {peak.day} · {peak.time}
                    <span className="ml-1.5 font-normal text-muted">{PLATFORMS[peak.platform].name} peak</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-faint">{formatPeak(peak)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-line/60 sm:block">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                      style={{ width: `${peak.match}%` }}
                    />
                  </span>
                  <span
                    className={cx(
                      'flex h-4 w-4 items-center justify-center rounded-full border',
                      active ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-line',
                    )}
                  >
                    {active && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-line/60 bg-app/40 p-2.5">
          {[
            { icon: Timer, label: 'Best window', value: `${peaks[0]?.match ?? 94}% match` },
            { icon: Clock3, label: 'Queue delay', value: `${peaks[0]?.day} ${peaks[0]?.time}` },
            { icon: ChevronRight, label: 'Channels', value: `${draft.platforms.length} synced` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="h-3 w-3 shrink-0 text-faint" />
              <div className="min-w-0">
                <p className="truncate text-[9px] uppercase tracking-wide text-faint">{label}</p>
                <p className="truncate text-[10.5px] font-medium text-ink">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] px-2.5 py-2 text-[10px] leading-relaxed text-indigo-200/90">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
          Peak windows shift with daylight saving and when a channel posts more than twice a day. We re-check 30 minutes
          before publish.
        </div>
      </Modal>
    </div>
  );
}
