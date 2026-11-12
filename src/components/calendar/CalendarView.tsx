import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  LayoutGrid,
  List,
  Plus,
  Repeat2,
  Search,
  Sparkles,
  Timer,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { PEAK_SLOTS, PLATFORM_ORDER, PLATFORMS, formatCompact } from '../../lib/platforms';
import { formatSlotTime } from '../../lib/ai';
import type { PlatformId, Post, WorkflowStatus } from '../../lib/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  Segmented,
  Select,
  StatusBadge,
  Switch,
  cx,
} from '../ui/Primitives';
import { PlatformGlyph } from '../icons/PlatformGlyph';
import { MediaSurface } from '../composer/MediaSurface';

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);

const postIso = (post: Post) => post.scheduledAt ?? post.publishedAt ?? null;

function formatTime(iso: string | null): string {
  if (!iso) return 'Unscheduled';
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Not scheduled';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const STATUS_OPTIONS: { id: 'all' | WorkflowStatus; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'draft', label: 'Draft' },
  { id: 'pending', label: 'Pending approval' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'published', label: 'Published' },
];

export function CalendarView() {
  const { posts, library, calendarMode, setCalendarMode, toggleEvergreen, setPostStatus, remixPost, newDraft } = useApp();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [platforms, setPlatforms] = useState<PlatformId[]>(PLATFORM_ORDER);
  const [status, setStatus] = useState<'all' | WorkflowStatus>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Post | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (post) =>
        post.platforms.some((p) => platforms.includes(p)) &&
        (status === 'all' || post.status === status) &&
        (!q || post.title.toLowerCase().includes(q) || post.master.toLowerCase().includes(q)),
    );
  }, [posts, platforms, status, query]);

  const byDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of filtered) {
      const iso = post.scheduledAt ?? post.publishedAt;
      if (!iso) continue;
      const date = new Date(iso);
      const key = dayKey(date);
      const list = map.get(key) ?? [];
      list.push(post);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const at = new Date(a.scheduledAt ?? a.publishedAt ?? 0).getTime();
        const bt = new Date(b.scheduledAt ?? b.publishedAt ?? 0).getTime();
        return at - bt;
      });
    }
    return map;
  }, [filtered]);

  const peakForDay = (date: Date) => {
    let best: { match: number; platform: PlatformId; time: string } | null = null;
    for (const platform of platforms) {
      for (const slot of PEAK_SLOTS[platform]) {
        if (slot.day !== date.getDay()) continue;
        if (!best || slot.match > best.match) best = { match: slot.match, platform, time: formatSlotTime(slot.hour, slot.minute) };
      }
    }
    return best;
  };

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((gridStart.getDay() + daysInMonth) / 7) * 7;
  const monthCells = Array.from({ length: cellCount }, (_, index) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + index);
    return d;
  });

  const weekStart = new Date(cursor);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekCells = Array.from({ length: 7 }, (_, index) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + index);
    return d;
  });

  const shift = (direction: number) => {
    const next = new Date(cursor);
    if (calendarMode === 'week') next.setDate(next.getDate() + direction * 7);
    else next.setMonth(next.getMonth() + direction);
    setCursor(next);
  };

  const label =
    calendarMode === 'week'
      ? `${weekCells[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekCells[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const counts = {
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    pending: posts.filter((p) => p.status === 'pending').length,
    published: posts.filter((p) => p.status === 'published').length,
    evergreen: posts.filter((p) => p.evergreen).length,
  };

  const topEvergreen = useMemo(
    () =>
      posts
        .filter((p) => p.status === 'published' && p.metrics)
        .sort((a, b) => (b.metrics?.engagement ?? 0) - (a.metrics?.engagement ?? 0))
        .slice(0, 3),
    [posts],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h1 className="text-[13px] font-semibold tracking-tight text-ink">Content calendar</h1>
          <Badge className="border-indigo-500/25 bg-indigo-500/10 text-indigo-200" dot="bg-indigo-400">
            {counts.scheduled} scheduled
          </Badge>
          <Badge className="border-amber-500/25 bg-amber-500/10 text-amber-200" dot="bg-amber-400">
            {counts.pending} awaiting approval
          </Badge>
          <span className="hidden text-[10px] text-faint lg:block">
            {counts.published} published · {counts.evergreen} on the evergreen shelf
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Segmented
            size="sm"
            value={calendarMode === 'queue' ? 'queue' : calendarMode}
            onChange={(mode) => setCalendarMode(mode)}
            options={[
              { id: 'month', label: 'Month', icon: <CalendarDays className="h-3 w-3" /> },
              { id: 'week', label: 'Week', icon: <LayoutGrid className="h-3 w-3" /> },
              { id: 'queue', label: 'Queue', icon: <List className="h-3 w-3" /> },
            ]}
          />
          <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={newDraft}>
            New post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line/40 px-4 py-2">
        <div className="flex items-center gap-1 rounded-lg border border-line/60 bg-app/40 p-0.5">
          {PLATFORM_ORDER.map((id) => {
            const active = platforms.includes(id);
            return (
              <button
                key={id}
                onClick={() =>
                  setPlatforms((current) =>
                    current.includes(id)
                      ? current.length === 1
                        ? current
                        : current.filter((p) => p !== id)
                      : [...current, id],
                  )
                }
                title={`${PLATFORMS[id].name} ${active ? 'visible' : 'hidden'}`}
                className={cx(
                  'flex h-6 items-center gap-1 rounded-md px-1.5 text-[10px] transition-colors',
                  active ? 'bg-raised text-ink' : 'text-faint/50 hover:text-muted',
                )}
              >
                <PlatformGlyph platform={id} className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">{PLATFORMS[id].short}</span>
              </button>
            );
          })}
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value as 'all' | WorkflowStatus)} className="w-[152px]">
          {STATUS_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search queue…"
            aria-label="Search calendar"
            className="h-8 w-[168px] rounded-lg border border-line/60 bg-app/40 pl-7 pr-2 text-[11px] text-ink outline-none focus:border-indigo-400/50"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 text-[10px] text-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Draft
          <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" /> Pending
          <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400" /> Scheduled
          <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" /> Published
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {calendarMode !== 'queue' && (
          <div className="mb-2.5 flex items-center gap-1.5">
            <button
              onClick={() => shift(-1)}
              aria-label="Previous period"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line/60 text-muted transition-colors hover:text-ink"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => shift(1)}
              aria-label="Next period"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line/60 text-muted transition-colors hover:text-ink"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <h2 className="ml-1.5 text-[13px] font-semibold tracking-tight text-ink">{label}</h2>
            <button
              onClick={() => setCursor(new Date())}
              className="ml-1 rounded-md border border-line/60 px-2 py-1 text-[10px] text-muted transition-colors hover:text-ink"
            >
              Today
            </button>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-faint">
              <Sparkles className="h-3 w-3 text-indigo-300" /> AI peak windows shown per day
            </span>
          </div>
        )}

        {calendarMode === 'month' && (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 border-b border-line/60 bg-app/40">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthCells.map((date, index) => {
                const list = byDay.get(dayKey(date)) ?? [];
                const peak = peakForDay(date);
                const isToday = sameDay(date, new Date());
                const inMonth = date.getMonth() === cursor.getMonth();
                return (
                  <div
                    key={index}
                    className={cx(
                      'min-h-[104px] border-b border-r border-line/40 p-1.5 transition-colors hover:bg-raised/20',
                      !inMonth && 'bg-app/30',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cx(
                          'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10.5px] font-medium',
                          isToday ? 'bg-indigo-500 text-white' : inMonth ? 'text-ink' : 'text-faint/50',
                        )}
                      >
                        {date.getDate()}
                      </span>
                      {peak && inMonth && (
                        <span className="flex items-center gap-0.5 rounded bg-indigo-500/10 px-1 py-0.5 text-[8px] font-medium text-indigo-300">
                          <Flame className="h-2 w-2" /> {peak.match}%
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-1">
                      {list.slice(0, 2).map((post) => (
                        <button
                          key={post.id}
                          onClick={() => setSelected(post)}
                          className="group flex w-full items-start gap-1 rounded-md border border-line/50 bg-surface/70 px-1 py-1 text-left transition-colors hover:border-indigo-400/40"
                        >
                          <span className={cx('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', statusDot(post.status))} />
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 block text-[9px] leading-[1.25] text-muted group-hover:text-ink">
                              {post.title}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-[8px] text-faint">
                              {post.platforms.slice(0, 3).map((p) => (
                                <PlatformGlyph key={p} platform={p} className="h-2 w-2" />
                              ))}
                              {post.scheduledAt && <span>· {formatTime(post.scheduledAt)}</span>}
                            </span>
                          </span>
                        </button>
                      ))}
                      {list.length > 2 && (
                        <button onClick={() => setSelected(list[2])} className="px-1 text-[8.5px] text-faint hover:text-ink">
                          +{list.length - 2} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {calendarMode === 'week' && (
          <div className="grid gap-2 md:grid-cols-7">
            {weekCells.map((date) => {
              const list = byDay.get(dayKey(date)) ?? [];
              const peak = peakForDay(date);
              const isToday = sameDay(date, new Date());
              return (
                <div key={dayKey(date)} className="rounded-xl border border-line/60 bg-surface/40">
                  <div className={cx('border-b border-line/50 px-2 py-1.5', isToday && 'bg-indigo-500/10')}>
                    <p className="text-[9.5px] uppercase tracking-[0.1em] text-faint">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={cx('text-[15px] font-semibold leading-5', isToday ? 'text-indigo-200' : 'text-ink')}>{date.getDate()}</p>
                    {peak && (
                      <span className="mt-1 flex items-center gap-1 rounded border border-indigo-500/25 bg-indigo-500/10 px-1 py-0.5 text-[8px] text-indigo-200">
                        <Flame className="h-2 w-2" /> {peak.match}% · {peak.time}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 p-1.5">
                    {list.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => setSelected(post)}
                        className="w-full rounded-lg border border-line/60 bg-app/50 p-1.5 text-left transition-colors hover:border-indigo-400/40"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[8.5px] text-faint">{formatTime(postIso(post))}</span>
                          <span className={cx('h-1.5 w-1.5 rounded-full', statusDot(post.status))} />
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[9.5px] leading-snug text-ink">{post.title}</p>
                        <div className="mt-1 flex items-center gap-1">
                          {post.platforms.slice(0, 4).map((p) => (
                            <PlatformGlyph key={p} platform={p} className="h-2 w-2 text-faint" />
                          ))}
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={newDraft}
                      className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-line/60 py-1.5 text-[9px] text-faint transition-colors hover:border-indigo-400/40 hover:text-indigo-200"
                    >
                      <Plus className="h-2.5 w-2.5" /> Slot
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {calendarMode === 'queue' && (
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line/60 px-3 py-2">
                <h2 className="text-[12px] font-semibold text-ink">Queue · {filtered.length} posts</h2>
                <span className="text-[10px] text-faint">Sorted by next publish time</span>
              </div>
              <div className="divide-y divide-line/40">
                {[...filtered]
                  .sort(
                    (a, b) =>
                      new Date(postIso(a) ?? '9999-12-31').getTime() -
                      new Date(postIso(b) ?? '9999-12-31').getTime(),
                  )
                  .map((post) => {
                    const media = library.find((m) => m.id === post.mediaId) ?? library[0];
                    return (
                      <div key={post.id} className="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-raised/20">
                        <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md border border-line/60 bg-app">
                          {media && <MediaSurface media={media} focal={post.focal} mode="poster" alt="" />}
                        </div>
                        <button onClick={() => setSelected(post)} className="min-w-0 flex-1 text-left">
                          <p className="truncate text-[11.5px] font-medium text-ink">{post.title}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9.5px] text-faint">
                            <span className="flex items-center gap-1">
                              {post.platforms.map((p) => (
                                <PlatformGlyph key={p} platform={p} className="h-2.5 w-2.5" />
                              ))}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-2.5 w-2.5" />
                              {postIso(post) ? `${formatDate(postIso(post))} · ${formatTime(postIso(post))}` : 'Unscheduled draft'}
                            </span>
                            {post.peak && (
                              <span className="flex items-center gap-0.5 text-indigo-300">
                                <Flame className="h-2.5 w-2.5" /> {post.peak.match}% match
                              </span>
                            )}
                          </div>
                        </button>
                        {post.metrics && (
                          <span className="hidden text-right text-[9.5px] text-faint md:block">
                            <span className="block font-mono text-muted">{formatCompact(post.metrics.impressions)}</span>
                            {post.metrics.engagement}% ER
                          </span>
                        )}
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge status={post.status} />
                          {post.status === 'published' && (
                            <span title="Recycle evergreen">
                              <Switch size="sm" checked={Boolean(post.evergreen)} onChange={() => toggleEvergreen(post.id)} label="Recycle evergreen" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {!filtered.length && (
                  <EmptyState
                    icon={<CalendarDays className="h-4 w-4" />}
                    title="Nothing matches those filters"
                    description="Clear the platform or status filters, or start a new draft in the composer."
                    action={<Button variant="primary" size="sm" onClick={newDraft}>New post</Button>}
                  />
                )}
              </div>
            </Card>

            <Card className="h-fit p-3">
              <div className="flex items-center gap-1.5">
                <Repeat2 className="h-3.5 w-3.5 text-emerald-300" />
                <h3 className="text-[12px] font-semibold text-ink">Recycle evergreen</h3>
              </div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-faint">
                Keep proven posts in rotation. We resurface them with a fresh hook once the audience fatigue score drops.
              </p>
              <div className="mt-2.5 space-y-2">
                {topEvergreen.map((post) => (
                  <div key={post.id} className="rounded-lg border border-line/60 bg-app/40 p-2">
                    <p className="line-clamp-2 text-[10.5px] leading-snug text-ink">{post.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[9px] text-faint">
                      <span className="font-mono text-emerald-300">{post.metrics?.engagement}% ER</span>
                      <span className="font-mono">{formatCompact(post.metrics?.impressions ?? 0)} impressions</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[9.5px] text-muted">
                        <Switch size="sm" checked={Boolean(post.evergreen)} onChange={() => toggleEvergreen(post.id)} label={`Recycle ${post.title}`} />
                        Recycling
                      </span>
                      <button
                        onClick={() => setPostStatus(post.id, 'scheduled')}
                        className="rounded border border-line/60 px-1.5 py-0.5 text-[9px] text-muted transition-colors hover:border-indigo-400/40 hover:text-indigo-200"
                      >
                        Queue next peak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] px-2 py-1.5 text-[9.5px] leading-relaxed text-indigo-200/90">
                <Timer className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                Recycled posts are rewritten by AI before they go out — never verbatim.
              </div>
            </Card>
          </div>
        )}
      </div>

      <PostDetailModal
        post={selected}
        onClose={() => setSelected(null)}
        onApprove={(post) => {
          setPostStatus(post.id, 'scheduled');
          setSelected(null);
        }}
        onPublish={(post) => {
          setPostStatus(post.id, 'published');
          setSelected(null);
        }}
        onRemix={(post) => {
          remixPost(post);
          setSelected(null);
        }}
      />
    </div>
  );
}

function statusDot(status: WorkflowStatus) {
  return status === 'published'
    ? 'bg-emerald-400'
    : status === 'scheduled'
      ? 'bg-indigo-400'
      : status === 'pending'
        ? 'bg-amber-400'
        : 'bg-slate-400';
}

function PostDetailModal({
  post,
  onClose,
  onApprove,
  onPublish,
  onRemix,
}: {
  post: Post | null;
  onClose: () => void;
  onApprove: (post: Post) => void;
  onPublish: (post: Post) => void;
  onRemix: (post: Post) => void;
}) {
  const { toggleEvergreen, library } = useApp();
  if (!post) return null;
  const media = library.find((m) => m.id === post.mediaId) ?? library[0];

  return (
    <Modal
      open
      onClose={onClose}
      title={post.title}
      description={`${formatDate(postIso(post))} · ${post.platforms.map((p) => PLATFORMS[p].name).join(' · ')}`}
      width="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>
          <Button variant="subtle" size="md" onClick={() => onRemix(post)}>
            Open in composer
          </Button>
          {post.status !== 'published' && (
            <Button variant="outline" size="md" onClick={() => onApprove(post)}>
              Approve & schedule
            </Button>
          )}
          {post.status !== 'published' && (
            <Button variant="primary" size="md" onClick={() => onPublish(post)}>
              Publish now
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={post.status} />
        {post.peak && (
          <Badge className="border-indigo-500/25 bg-indigo-500/10 text-indigo-200" dot="bg-indigo-400">
            <Flame className="h-2.5 w-2.5" /> {post.peak.match}% peak match · {post.peak.time}
          </Badge>
        )}
        {post.metrics && (
          <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
            {formatCompact(post.metrics.impressions)} impressions · {post.metrics.engagement}% ER
          </Badge>
        )}
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted">
          <Switch size="sm" checked={Boolean(post.evergreen)} onChange={() => toggleEvergreen(post.id)} label="Recycle evergreen" />
          Recycle evergreen
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-lg border border-line/60 bg-app/40">
          {media && <MediaSurface media={media} focal={post.focal} mode="poster" alt={post.title} />}
        </div>
        <div>
          <p className="max-h-52 overflow-y-auto whitespace-pre-wrap rounded-lg border border-line/60 bg-app/40 p-2.5 text-[11.5px] leading-relaxed text-muted">
            {post.master}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {post.hashtags.map((tag) => (
              <span key={tag} className="rounded border border-line/60 bg-raised/50 px-1.5 py-0.5 text-[10px] text-muted">
                {tag}
              </span>
            ))}
          </div>
          {post.firstComment && post.firstCommentText && (
            <p className="mt-2 rounded-lg border border-line/50 bg-app/30 px-2 py-1.5 text-[10px] text-faint">
              <span className="font-semibold text-muted">First comment: </span>
              {post.firstCommentText}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
