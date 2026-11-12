import { useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Hash, MessageSquareText, Smile, Sparkles, X } from 'lucide-react';
import { useApp } from '../../lib/store';
import { suggestHashtags } from '../../lib/ai';
import { PLATFORMS } from '../../lib/platforms';
import { Card, SectionTitle, Switch, TextArea, cx } from '../ui/Primitives';

const EMOJIS = ['✨', '🚀', '🔥', '💡', '📈', '🧠', '🎯', '✅', '🙌', '👀', '💬', '⚡', '📌', '🎬', '🧵', '🛠️', '📊', '💜', '😅', '🤝', '⏱️', '🧩', '🥁', '🫡'];

export function MasterEditor() {
  const { draft, updateDraft, brandVoice } = useApp();
  const [panel, setPanel] = useState<'emoji' | 'hashtag' | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = useMemo(
    () => suggestHashtags(`${draft.idea} ${draft.master} ${draft.hashtags.join(' ')}`, brandVoice).filter((tag) => !draft.master.includes(tag)),
    [draft.idea, draft.master, draft.hashtags, brandVoice],
  );

  const limit = Math.max(...draft.platforms.map((p) => PLATFORMS[p].limit), 280);
  const count = draft.master.length;
  const over = count > limit;

  const insert = (text: string) => {
    updateDraft({ master: `${draft.master}${draft.master.endsWith(' ') || !draft.master ? '' : ' '}${text}` });
    setPanel(null);
    areaRef.current?.focus();
  };

  return (
    <Card className="relative p-4">
      <SectionTitle
        step="02"
        title="Master editor"
        description="One source of truth. Channel overrides are generated from this."
        right={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPanel(panel === 'emoji' ? null : 'emoji')}
              aria-label="Insert emoji"
              className={cx(
                'flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
                panel === 'emoji' ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-200' : 'border-line/60 text-muted hover:text-ink',
              )}
            >
              <Smile className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPanel(panel === 'hashtag' ? null : 'hashtag')}
              aria-label="Suggest hashtags"
              className={cx(
                'flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
                panel === 'hashtag' ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-200' : 'border-line/60 text-muted hover:text-ink',
              )}
            >
              <Hash className="h-3.5 w-3.5" />
            </button>
          </div>
        }
      />

      {panel === 'emoji' && (
        <>
          <button className="fixed inset-0 z-20 cursor-default" aria-label="Close emoji picker" onClick={() => setPanel(null)} />
          <div className="absolute right-3 top-12 z-30 w-[248px] animate-popIn rounded-xl border border-line/80 bg-surface p-2 shadow-pop">
            <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">Often used</p>
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => insert(emoji)}
                  className="flex h-7 items-center justify-center rounded-md text-[15px] transition-colors hover:bg-raised"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {panel === 'hashtag' && (
        <>
          <button className="fixed inset-0 z-20 cursor-default" aria-label="Close hashtag suggester" onClick={() => setPanel(null)} />
          <div className="absolute right-3 top-12 z-30 w-[288px] animate-popIn rounded-xl border border-line/80 bg-surface p-2.5 shadow-pop">
            <div className="flex items-center justify-between px-0.5 pb-2">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
                <Sparkles className="h-3 w-3 text-indigo-300" /> AI hashtags
              </p>
              <button onClick={() => setPanel(null)} aria-label="Close" className="text-faint hover:text-ink">
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    insert(tag);
                    updateDraft({ hashtags: Array.from(new Set([...draft.hashtags, tag])) });
                  }}
                  className="rounded-md border border-line/60 bg-raised/50 px-1.5 py-1 text-[10.5px] text-muted transition-colors hover:border-indigo-400/50 hover:text-indigo-200"
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="mt-2 border-t border-line/50 pt-2 text-[10px] leading-relaxed text-faint">
              Sorted by your top-performing posts + brand voice. Click to append.
            </p>
          </div>
        </>
      )}

      <div className="mt-3">
        <TextArea
          ref={areaRef}
          value={draft.master}
          onChange={(event) => updateDraft({ master: event.target.value })}
          placeholder="Write the master post. The AI will adapt hooks, length and hashtags per channel…"
          className="min-h-[172px] border-line/60 bg-app/40 text-[13px] leading-[1.62]"
          spellCheck
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10.5px] text-faint">
          <span className={cx('font-mono tabular-nums', over ? 'text-rose-300' : count > limit * 0.85 ? 'text-amber-300' : 'text-muted')}>
            {count.toLocaleString()}
          </span>
          <span>/ {limit.toLocaleString()}</span>
          <span className="h-3 w-px bg-line/70" />
          <span>{draft.master.trim() ? draft.master.trim().split(/\s+/).length : 0} words</span>
        </div>
        <span className="flex items-center gap-1 text-[10.5px] text-faint">
          <CornerDownLeft className="h-3 w-3" /> X thread auto-splits at 280
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-line/60 bg-app/40 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line/60 bg-raised/60 text-faint">
              <MessageSquareText className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[11.5px] font-medium text-ink">First-comment automation</p>
              <p className="text-[10.5px] leading-relaxed text-faint">
                Drops the link + hashtag block as the first comment after publishing.
              </p>
            </div>
          </div>
          <Switch
            size="sm"
            checked={draft.firstComment}
            onChange={(next) => updateDraft({ firstComment: next })}
            label="Toggle first comment automation"
          />
        </div>
        {draft.firstComment && (
          <div className="mt-2 animate-fadeIn">
            <TextArea
              value={draft.firstCommentText}
              onChange={(event) => updateDraft({ firstCommentText: event.target.value })}
              rows={2}
              placeholder="Link, extra hashtags or an extended CTA…"
              className="border-line/50 bg-app/60 text-[11.5px]"
            />
            <p className="mt-1 flex items-center gap-1 text-[10px] text-faint">
              <Hash className="h-2.5 w-2.5" /> Queued for LinkedIn, Instagram, X and YouTube · TikTok gets it as a pinned reply
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">Overrides</span>
        {draft.platforms.map((platform) => {
          const tailored = Boolean(draft.overrides[platform]);
          return (
            <span
              key={platform}
              className={cx(
                'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]',
                tailored ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : 'border-line/60 text-faint',
              )}
            >
              <span className={cx('h-1 w-1 rounded-full', tailored ? 'bg-emerald-400' : 'bg-faint/60')} />
              {PLATFORMS[platform].name} {tailored ? 'tailored' : 'uses master'}
            </span>
          );
        })}
      </div>
    </Card>
  );
}
