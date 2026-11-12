import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useApp } from '../../lib/store';
import { PLATFORM_ORDER, PLATFORMS } from '../../lib/platforms';
import { splitThread } from '../../lib/ai';
import type { PlatformId } from '../../lib/types';
import { Badge, Switch, cx } from '../ui/Primitives';
import { PlatformGlyph } from '../icons/PlatformGlyph';
import {
  InstagramMockup,
  LinkedInMockup,
  TikTokMockup,
  XMockup,
  YouTubeMockup,
  type MockupProps,
} from './PlatformMockups';

const FORMAT_LABEL: Record<PlatformId, string> = {
  linkedin: '16:9 feed',
  x: 'Thread',
  instagram: '4:5 feed',
  tiktok: '9:16',
  youtube: '9:16 · under 60s',
};

export function PreviewGrid() {
  const { draft, library } = useApp();
  const media = library.find((m) => m.id === draft.mediaId) ?? library[0];
  const [collapsed, setCollapsed] = useState<PlatformId[]>([]);

  const readiness = useMemo(() => {
    const over = draft.platforms.filter(
      (p) => p !== 'x' && (draft.overrides[p] ?? draft.master).length > PLATFORMS[p].limit,
    );
    return [
      {
        ok: over.length === 0,
        label: over.length ? `${over.length} channel${over.length > 1 ? 's' : ''} over limit` : 'All channels within limits',
      },
      { ok: Boolean(media), label: 'Media smart-cropped for 5 formats' },
      { ok: draft.firstComment && Boolean(draft.firstCommentText.trim()), label: 'First comment queued' },
    ];
  }, [draft, media]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-[13px] font-semibold tracking-tight text-ink">
            Live channel previews
            <span className="rounded-full border border-line/70 bg-raised/60 px-1.5 py-0.5 font-mono text-[9.5px] text-muted">
              {draft.platforms.length}/5
            </span>
          </h3>
          <p className="mt-0.5 text-[11px] text-muted">Native mockups with per-channel overrides · edits save instantly</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-faint">
            <Sparkles className="h-3 w-3 text-indigo-300" /> Auto-tailored
          </span>
          <span className="h-3 w-px bg-line/70" />
          <div className="flex items-center gap-1">
            {PLATFORM_ORDER.map((id) => {
              const active = draft.platforms.includes(id);
              return (
                <span
                  key={id}
                  title={`${PLATFORMS[id].name} ${active ? 'included' : 'excluded'}`}
                  className={cx('flex h-5 w-5 items-center justify-center rounded-md', active ? 'bg-raised text-ink' : 'text-faint/40')}
                >
                  <PlatformGlyph platform={id} className="h-2.5 w-2.5" />
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line/60 bg-surface/40 px-2.5 py-1.5">
        {readiness.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted">
            <span className={cx('h-1.5 w-1.5 rounded-full', item.ok ? 'bg-emerald-400' : 'bg-amber-400')} />
            {item.label}
          </span>
        ))}
        <span className="ml-auto hidden items-center gap-1 text-[10px] text-faint sm:flex">
          Publish readiness <ArrowUpRight className="h-2.5 w-2.5" />
        </span>
      </div>

      {draft.platforms.map((platform) => (
        <PlatformPreviewCard
          key={platform}
          platform={platform}
          open={!collapsed.includes(platform)}
          onToggleOpen={() =>
            setCollapsed((current) =>
              current.includes(platform) ? current.filter((p) => p !== platform) : [...current, platform],
            )
          }
          mockup={{
            text: draft.overrides[platform] ?? draft.master,
            media,
            focal: draft.focal,
            caption: draft.caption,
            carousel: draft.carousel,
            firstComment: draft.firstComment,
            firstCommentText: draft.firstCommentText,
          }}
        />
      ))}
    </div>
  );
}

function AutoTextArea({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 208)}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={3}
      aria-label={ariaLabel}
      className="w-full resize-none overflow-y-auto rounded-md border border-line/60 bg-app/50 px-2 py-1.5 text-[11px] leading-relaxed text-ink outline-none transition-colors focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-500/20"
    />
  );
}

function PlatformPreviewCard({
  platform,
  mockup,
  open,
  onToggleOpen,
}: {
  platform: PlatformId;
  mockup: MockupProps;
  open: boolean;
  onToggleOpen: () => void;
}) {
  const { draft, setOverride, resetOverride, togglePlatform } = useApp();
  const meta = PLATFORMS[platform];
  const override = draft.overrides[platform];
  const hasOverride = typeof override === 'string';
  const text = override ?? draft.master;
  const count = text.length;
  const thread = platform === 'x' ? splitThread(text, 280) : [];
  const worst = thread.length ? Math.max(...thread.map((part) => part.length)) : count;
  const over = platform === 'x' ? worst > 280 : count > meta.limit;
  const near = platform === 'x' ? worst > 250 : count > meta.limit * 0.9;

  return (
    <div className={cx('overflow-hidden rounded-2xl border bg-surface/50 backdrop-blur-xl transition-colors', open ? 'border-line/70' : 'border-line/50')}>
      <div className="flex items-center gap-2 border-b border-line/50 px-3 py-2">
        <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-white', meta.gradient)}>
          <PlatformGlyph platform={platform} className="h-3 w-3" />
        </span>
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold leading-4 text-ink">{meta.name}</p>
          <p className="text-[9.5px] leading-3 text-faint">
            {FORMAT_LABEL[platform]} · {meta.audience}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {hasOverride ? (
            <Badge className="hidden border-emerald-500/25 bg-emerald-500/10 text-emerald-300 sm:inline-flex" dot="bg-emerald-400">
              Tailored
            </Badge>
          ) : (
            <Badge className="hidden border-line/60 bg-raised/60 text-faint sm:inline-flex">From master</Badge>
          )}
          <span className={cx('font-mono text-[10px] tabular-nums', over ? 'text-rose-300' : near ? 'text-amber-300' : 'text-faint')}>
            {platform === 'x'
              ? `${thread.length > 1 ? `${thread.length}× · ` : ''}${worst}/280`
              : `${count.toLocaleString()}/${meta.limit.toLocaleString()}`}
          </span>
          <Switch
            size="sm"
            checked={draft.platforms.includes(platform)}
            onChange={() => togglePlatform(platform)}
            label={`Include ${meta.name}`}
          />
          <button
            onClick={onToggleOpen}
            aria-label={open ? `Collapse ${meta.name} preview` : `Expand ${meta.name} preview`}
            className="flex h-5 w-5 items-center justify-center rounded text-faint transition-colors hover:text-ink"
          >
            <ChevronDown className={cx('h-3.5 w-3.5 transition-transform', !open && '-rotate-90')} />
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fadeIn">
          <div className="border-b border-line/40 px-3 py-2">
            <div className="flex items-center justify-between gap-2 pb-1">
              <span className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-faint">
                <Wand2 className="h-2.5 w-2.5 text-indigo-300" /> Channel copy
              </span>
              {hasOverride && (
                <button
                  onClick={() => resetOverride(platform)}
                  className="flex items-center gap-1 rounded px-1 py-0.5 text-[9.5px] text-faint transition-colors hover:text-ink"
                >
                  <RotateCcw className="h-2.5 w-2.5" /> Use AI version
                </button>
              )}
            </div>
            <AutoTextArea
              value={text}
              onChange={(next) => setOverride(platform, next)}
              ariaLabel={`${meta.name} copy override`}
            />
            <div className="mt-1 flex items-center justify-between text-[9px] text-faint">
              <span>
                {platform === 'x'
                  ? thread.length > 1
                    ? `Will publish as a ${thread.length}-post thread`
                    : 'Fits in a single post'
                  : `${meta.limitLabel} · trimmed automatically on publish`}
              </span>
              {hasOverride && <span>Saved as override</span>}
            </div>
          </div>

          <div className="bg-app/40 p-2.5">
            {platform === 'linkedin' && <LinkedInMockup {...mockup} />}
            {platform === 'x' && <XMockup {...mockup} />}
            {platform === 'instagram' && <InstagramMockup {...mockup} />}
            {platform === 'tiktok' && <TikTokMockup {...mockup} />}
            {platform === 'youtube' && <YouTubeMockup {...mockup} />}
          </div>
        </div>
      )}
    </div>
  );
}
