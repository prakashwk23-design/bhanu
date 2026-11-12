import { useEffect, useState } from 'react';
import { ArrowRight, Check, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useApp } from '../../lib/store';
import { TONES } from '../../lib/platforms';
import { Button, cx } from '../ui/Primitives';
import type { Tone } from '../../lib/types';

const STEPS = ['Reading the idea and any source link', 'Matching your brand voice', 'Tailoring 5 channel variants'];

const SAMPLES = [
  'We cut onboarding time by 40% by replacing live design reviews with async video walkthroughs.',
  'Hot take: your content calendar is too full to be good. We cap ours at three posts per channel.',
  'The three AI prompts we actually use every week to turn one idea into five channel-ready drafts.',
];

export function IdeaBar() {
  const { draft, updateDraft, runGeneration, generation, brandVoice, toast } = useApp();
  const [idea, setIdea] = useState(draft.idea);
  const [tone, setTone] = useState<Tone>(draft.tone);

  useEffect(() => {
    setIdea(draft.idea);
  }, [draft.id, draft.idea]);

  useEffect(() => {
    setTone(draft.tone);
  }, [draft.id, draft.tone]);

  const generate = () => {
    if (!idea.trim()) {
      toast('Add an idea first', 'Paste a rough thought or a URL and we will handle the rest.', 'warning');
      return;
    }
    updateDraft({ tone });
    runGeneration(idea, tone);
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500/50 via-violet-500/30 to-fuchsia-500/20 p-[1px] shadow-[0_16px_44px_-28px_rgba(99,102,241,0.9)]">
      <div className="rounded-[15px] bg-surface/95 p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_4px_14px_-4px_rgba(99,102,241,0.9)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="relative flex-1">
            <input
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') generate();
              }}
              placeholder="Type a rough idea or paste a URL — e.g. “we cut onboarding 40% with async reviews”"
              aria-label="Post idea or source URL"
              className="h-9 w-full rounded-lg border border-line/70 bg-app/50 pl-3 pr-16 text-[12.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line/60 bg-raised/80 px-1.5 py-0.5 font-mono text-[9.5px] text-faint">
              {/^https?:\/\//.test(idea.trim()) ? 'URL' : 'AI'}
            </span>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={generate}
            loading={generation.running}
            icon={generation.running ? undefined : <Wand2 className="h-3.5 w-3.5" />}
            className="shrink-0"
          >
            {generation.running ? 'Generating…' : 'Generate drafts'}
          </Button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">Tone</span>
          {TONES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setTone(option.id);
                updateDraft({ tone: option.id });
              }}
              title={option.hint}
              className={cx(
                'flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] transition-all duration-200',
                tone === option.id
                  ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-100 shadow-[0_0_16px_-8px_rgba(99,102,241,0.9)]'
                  : 'border-line/60 bg-app/40 text-muted hover:border-line hover:text-ink',
              )}
            >
              <span className="text-[11px] leading-none">{option.emoji}</span>
              {option.label}
            </button>
          ))}
          <span className="ml-auto hidden items-center gap-1 text-[10px] text-faint sm:flex">
            Brand voice v3 · {brandVoice.descriptors[0]}
          </span>
        </div>

        {generation.running ? (
          <div className="mt-3 space-y-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] p-2.5">
            {STEPS.map((step, index) => {
              const done = generation.step > index;
              const active = generation.step === index;
              return (
                <div key={step} className="flex items-center gap-2 text-[11px]">
                  {done ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : active ? (
                    <Loader2 className="h-3 w-3 animate-spin text-indigo-300" />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-faint" />
                  )}
                  <span className={cx(done ? 'text-muted' : active ? 'text-indigo-200' : 'text-faint')}>{step}</span>
                  {active && <span className="ml-auto h-1 w-16 overflow-hidden rounded-full bg-line/60"><span className="block h-full w-1/2 animate-pulseSoft rounded-full bg-indigo-400" /></span>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint/70">Try</span>
            <div className="flex flex-wrap gap-1">
              {SAMPLES.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setIdea(sample)}
                  className="group flex max-w-full items-center gap-1 truncate rounded-md border border-line/50 bg-app/30 px-1.5 py-0.5 text-[10px] text-muted transition-colors hover:border-indigo-400/40 hover:text-indigo-200"
                >
                  <ArrowRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="truncate">{sample.slice(0, 46)}…</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
