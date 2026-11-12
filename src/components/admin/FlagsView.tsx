import { useState } from 'react';
import {
  Check,
  CircleDot,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  featureFlagsSeed,
  promptDefaults,
  type FeatureFlag,
  type FormatterId,
} from '../../lib/adminData';
import type { PlanTier } from '../../lib/types';
import { useApp } from '../../lib/store';
import { cx } from '../ui/Primitives';
import { AdminButton, AdminRange, AdminToggle, MiniBar, Panel, Pill, PlanPill } from './AdminUI';

const FORMATTER_ORDER: FormatterId[] = ['linkedin', 'x', 'instagram', 'tiktok'];

const PLAN_ORDER: PlanTier[] = ['Free', 'Pro', 'Agency'];

const INITIAL_VERSIONS: Record<FormatterId, string> = {
  linkedin: 'v14.3',
  x: 'v12.1',
  instagram: 'v9.8',
  tiktok: 'v7.4',
};

function bumpVersion(version: string): string {
  const match = version.match(/v(\d+)\.(\d+)/);
  if (!match) return version;
  return `v${match[1]}.${Number(match[2]) + 1}`;
}

export function FlagsView() {
  const { toast } = useApp();
  const [prompts, setPrompts] = useState(promptDefaults);
  const [activeId, setActiveId] = useState<FormatterId>('linkedin');
  const [versions, setVersions] = useState(INITIAL_VERSIONS);
  const [promptDirty, setPromptDirty] = useState(false);
  const [flags, setFlags] = useState<FeatureFlag[]>(featureFlagsSeed);
  const [flagsDirty, setFlagsDirty] = useState(false);
  const [lastPublish, setLastPublish] = useState('2h ago');

  const active = prompts[activeId];

  const updatePrompt = (patch: Partial<typeof active>) => {
    setPrompts((previous) => ({
      ...previous,
      [activeId]: { ...previous[activeId], ...patch },
    }));
    setPromptDirty(true);
  };

  const pushPrompt = () => {
    const nextVersion = bumpVersion(versions[activeId]);
    setVersions((previous) => ({ ...previous, [activeId]: nextVersion }));
    setPromptDirty(false);
    setLastPublish('Just now');
    toast(
      'System prompt live',
      `${active.label} ${nextVersion} pushed to all plans · new generations use it immediately.`,
      'success',
    );
  };

  const restorePrompt = () => {
    setPrompts((previous) => ({ ...previous, [activeId]: promptDefaults[activeId] }));
    setPromptDirty(true);
    toast('Default restored', `${active.label} reset to the last committed prompt. Edit to preview before pushing.`);
  };

  const updateFlag = (id: string, tier: PlanTier, patch: Partial<{ enabled: boolean; rollout: number }>) => {
    setFlags((previous) =>
      previous.map((flag) =>
        flag.id === id
          ? { ...flag, tiers: { ...flag.tiers, [tier]: { ...flag.tiers[tier], ...patch } } }
          : flag,
      ),
    );
    setFlagsDirty(true);
  };

  const publishFlags = () => {
    setFlagsDirty(false);
    setLastPublish('Just now');
    toast(
      'Feature flags published',
      `${flags.length} flags updated · rollout evaluated at request time across all regions.`,
      'success',
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1460px] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-semibold tracking-tight text-white">Prompts & feature flags</h1>
              <Pill tone="emerald" dot>
                Live config
              </Pill>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Edit formatter prompts and tier rollouts · changes apply without redeploying the worker
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5">
              Last publish <span className="font-mono text-slate-200">{lastPublish}</span>
            </span>
            <Pill tone="indigo">
              <Zap className="h-2.5 w-2.5" /> 1.8s propagation
            </Pill>
          </div>
        </div>

        <div className="mt-3 grid gap-2.5 xl:grid-cols-[286px_minmax(0,1fr)]">
          <Panel padded={false} className="overflow-hidden">
            <div className="border-b border-slate-800/70 px-3.5 py-3">
              <h2 className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-100">
                <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-300" /> Formatter prompts
              </h2>
              <p className="mt-0.5 text-[9.5px] text-slate-500">Four live system prompts</p>
            </div>
            <div className="p-2">
              {FORMATTER_ORDER.map((id) => {
                const prompt = prompts[id];
                const isActive = activeId === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveId(id);
                      setPromptDirty(false);
                    }}
                    className={cx(
                      'mb-1 flex w-full items-start gap-2 rounded-lg border px-2.5 py-2.5 text-left transition-colors last:mb-0',
                      isActive
                        ? 'border-indigo-400/30 bg-indigo-500/[0.08]'
                        : 'border-transparent hover:border-slate-800 hover:bg-slate-900/60',
                    )}
                  >
                    <span
                      className={cx(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[8px] font-bold',
                        isActive ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-200' : 'border-slate-800 bg-slate-900 text-slate-500',
                      )}
                    >
                      {id === 'linkedin' ? 'IN' : id === 'instagram' ? 'IG' : id === 'tiktok' ? 'TT' : 'X'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate text-[10.5px] font-medium text-slate-200">{prompt.label}</span>
                        <span className="font-mono text-[8px] text-slate-600">{versions[id]}</span>
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[8.5px] text-slate-500">
                        {prompt.model} · temp {prompt.temperature.toFixed(2)}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[8px] text-slate-600">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" /> Live in all plans
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-slate-800/60 px-3 py-2.5 text-[8.5px] leading-relaxed text-slate-600">
              Prompts are versioned and cached at the edge. Publishing invalidates the formatter cache in every region.
            </div>
          </Panel>

          <Panel className="flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[12.5px] font-semibold text-slate-100">{active.label}</h2>
                  <Pill tone="emerald" dot>Live</Pill>
                  <span className="font-mono text-[9px] text-slate-600">{versions[activeId]}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Master system prompt · runs before every {active.label.replace(' Formatter', '').replace(' Threader', '').replace(' Caption', '').replace(' Hook', '')} generation
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 font-mono text-[8.5px] text-slate-400">
                  {active.model}
                </span>
                <Pill tone={promptDirty ? 'amber' : 'slate'}>{promptDirty ? 'Unsaved edit' : 'Synced'}</Pill>
              </div>
            </div>

            <textarea
              value={active.system}
              onChange={(event) => updatePrompt({ system: event.target.value })}
              aria-label={`${active.label} system prompt`}
              spellCheck={false}
              className="mt-3 min-h-[238px] w-full flex-1 resize-y rounded-lg border border-slate-800 bg-[#05080f] px-3 py-2.5 font-mono text-[10.5px] leading-[1.65] text-slate-300 outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">Temperature</span>
                  <span className="font-mono text-[10px] text-indigo-300">{active.temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={active.temperature}
                  onChange={(event) => updatePrompt({ temperature: Number(event.target.value) })}
                  aria-label={`${active.label} temperature`}
                  className="mt-2.5 w-full"
                />
                <div className="mt-1 flex items-center justify-between text-[8px] text-slate-600">
                  <span>Deterministic</span>
                  <span>Creative</span>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
                <div className="flex items-center justify-between text-[8.5px] text-slate-500">
                  <span>Prompt tokens</span>
                  <span className="font-mono text-slate-300">{Math.ceil(active.system.length / 4)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[8.5px] text-slate-500">
                  <span>Context cache</span>
                  <span className="font-mono text-emerald-300">Warm</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[8.5px] text-slate-500">
                  <span>Guardrails</span>
                  <span className="font-mono text-slate-300">On</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-3">
              <span className="flex items-center gap-1.5 text-[9px] text-slate-600">
                <Terminal className="h-2.5 w-2.5" />
                Applies to new generations · in-flight requests keep their prompt snapshot
              </span>
              <div className="flex items-center gap-1.5">
                <AdminButton
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw className="h-3 w-3" />}
                  onClick={restorePrompt}
                >
                  Restore default
                </AdminButton>
                <AdminButton
                  variant="primary"
                  size="sm"
                  icon={<Check className="h-3 w-3" />}
                  disabled={!promptDirty}
                  onClick={pushPrompt}
                >
                  Push live
                </AdminButton>
              </div>
            </div>
          </Panel>
        </div>

        <Panel padded={false} className="mt-2.5 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 px-4 py-3">
            <div>
              <h2 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-100">
                Feature flag matrix
                {flagsDirty && <Pill tone="amber" dot>Unsaved changes</Pill>}
              </h2>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Toggle per plan tier and dial rollout percentage · {flags.length} platform features
              </p>
            </div>
            <AdminButton
              variant="primary"
              size="sm"
              icon={<Zap className="h-3 w-3" />}
              disabled={!flagsDirty}
              onClick={publishFlags}
            >
              Publish flags
            </AdminButton>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-[minmax(260px,1.5fr)_repeat(3,minmax(150px,1fr))] border-b border-slate-800/70 bg-slate-950/30">
                <div className="px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">Feature</div>
                {PLAN_ORDER.map((tier) => (
                  <div key={tier} className="border-l border-slate-800/60 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <PlanPill plan={tier} />
                      <span className="font-mono text-[8.5px] text-slate-600">
                        {tier === 'Free' ? '812' : tier === 'Pro' ? '364' : '108'}
                      </span>
                    </div>
                    <p className="mt-1 text-[8px] text-slate-600">
                      {tier === 'Free' ? 'Acquisition' : tier === 'Pro' ? 'Growth' : 'Scale'}
                    </p>
                  </div>
                ))}
              </div>

              {flags.map((flag) => (
                <div
                  key={flag.id}
                  className="grid grid-cols-[minmax(260px,1.5fr)_repeat(3,minmax(150px,1fr))] border-b border-slate-800/50 last:border-b-0 hover:bg-slate-900/20"
                >
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10.5px] font-medium text-slate-200">{flag.label}</p>
                      <span className="rounded border border-slate-800 bg-slate-900 px-1 py-0.5 font-mono text-[7.5px] uppercase tracking-wide text-slate-600">
                        {flag.category}
                      </span>
                    </div>
                    <p className="mt-1 max-w-[330px] text-[9px] leading-relaxed text-slate-500">{flag.description}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      {PLAN_ORDER.map((tier) => (
                        <span
                          key={tier}
                          className={cx(
                            'h-1 w-6 rounded-full',
                            flag.tiers[tier].enabled ? 'bg-indigo-400/70' : 'bg-slate-800',
                          )}
                          title={`${tier}: ${flag.tiers[tier].enabled ? `${flag.tiers[tier].rollout}%` : 'off'}`}
                        />
                      ))}
                      <span className="ml-1 text-[8px] text-slate-600">tier coverage</span>
                    </div>
                  </div>

                  {PLAN_ORDER.map((tier) => {
                    const value = flag.tiers[tier];
                    return (
                      <div key={tier} className="flex flex-col justify-center border-l border-slate-800/60 px-3 py-3">
                        <div className="flex items-center justify-between">
                          <AdminToggle
                            checked={value.enabled}
                            label={`${flag.label} on ${tier}`}
                            onChange={(next) =>
                              updateFlag(flag.id, tier, { enabled: next, ...(next ? { rollout: Math.max(value.rollout, 25) } : { rollout: 0 }) })
                            }
                          />
                          <span className={cx('font-mono text-[9.5px]', value.enabled ? 'text-slate-300' : 'text-slate-600')}>
                            {value.enabled ? `${value.rollout}%` : 'Off'}
                          </span>
                        </div>
                        <AdminRange
                          value={value.rollout}
                          disabled={!value.enabled}
                          label={`${flag.label} rollout on ${tier}`}
                          onChange={(next) => updateFlag(flag.id, tier, { rollout: next })}
                        />
                        <div className="mt-1.5">
                          <MiniBar value={value.enabled ? value.rollout : 0} tone={tier === 'Agency' ? 'amber' : tier === 'Pro' ? 'indigo' : 'slate'} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[9px] text-slate-600">
            <span className="flex items-center gap-1">
              <CircleDot className="h-2.5 w-2.5 text-emerald-400" />
              Rollouts evaluated per request · eligible workspaces see changes within 1.8s
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> Flag changes are audit-logged with operator identity
            </span>
          </div>
        </Panel>

        <div className="h-4" />
      </div>
    </div>
  );
}
