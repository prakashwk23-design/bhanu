import { useState } from 'react';
import {
  BadgeCheck,
  Ban,
  Building2,
  Check,
  ChevronRight,
  KeyRound,
  Link2,
  Plus,
  Save,
  ShieldCheck,
  Smile,
  Sparkles,
  Trash2,
  UserCog,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { PLATFORMS, formatCompact } from '../../lib/platforms';
import { Badge, Button, Card, Meter, SectionTitle, Switch, TextArea, TextInput, cx } from '../ui/Primitives';
import { PlatformGlyph } from '../icons/PlatformGlyph';

const DESCRIPTORS = ['Direct', 'Warm', 'Evidence-led', 'Dry humour', 'Editorial', 'Contrarian', 'Playful', 'Technical'];

const CTA_OPTIONS = [
  'Invite a specific next step',
  'Ask a question',
  'Drive to link in bio',
  'Soft sell · no ask',
];

export function SettingsView() {
  const { accounts, toggleAccount, brandVoice, updateBrandVoice, toast } = useApp();
  const [bannedInput, setBannedInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const connected = accounts.filter((a) => a.connected);

  const addBanned = () => {
    const word = bannedInput.trim().toLowerCase();
    if (!word || brandVoice.banned.includes(word)) return;
    updateBrandVoice({ banned: [...brandVoice.banned, word] });
    setBannedInput('');
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    updateBrandVoice({ defaultHashtags: [...brandVoice.defaultHashtags, tag.startsWith('#') ? tag : `#${tag}`] });
    setTagInput('');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1080px] px-4 py-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-ink">Brand voice & accounts</h1>
            <p className="mt-0.5 text-[11px] text-muted">
              {connected.length} of 5 channels connected · Northwind Studio · Pro workspace
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="h-3.5 w-3.5" />}
            onClick={() => toast('Brand voice saved', 'Applied to the next generation in the composer.', 'success')}
          >
            Save changes
          </Button>
        </div>

        {/* Accounts */}
        <Card className="mt-3 p-3">
          <SectionTitle
            step="01"
            title="Connected accounts"
            description="OmniPost publishes through each platform's native API."
            right={
              <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-300" dot="bg-emerald-400">
                {connected.length}/5 healthy
              </Badge>
            }
          />
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={cx(
                  'rounded-xl border p-2.5 transition-colors',
                  account.connected ? 'border-line/70 bg-app/30' : 'border-dashed border-line/60 bg-app/20',
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cx(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                      PLATFORMS[account.id].gradient,
                    )}
                  >
                    <PlatformGlyph platform={account.id} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-[12px] font-medium text-ink">
                      {PLATFORMS[account.id].name}
                      {account.connected && <BadgeCheck className="h-3 w-3 text-sky-400" />}
                    </p>
                    <p className="truncate text-[10px] text-faint">{account.connected ? account.handle : 'Not connected'}</p>
                  </div>
                  <Switch
                    size="sm"
                    checked={account.connected}
                    onChange={() => toggleAccount(account.id)}
                    label={`${account.connected ? 'Disconnect' : 'Connect'} ${PLATFORMS[account.id].name}`}
                  />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-[9.5px]">
                  <div className="rounded-md border border-line/50 bg-surface/40 px-1.5 py-1">
                    <p className="text-faint">Followers</p>
                    <p className="mt-0.5 font-mono text-[10.5px] text-ink">{formatCompact(account.followers)}</p>
                  </div>
                  <div className="rounded-md border border-line/50 bg-surface/40 px-1.5 py-1">
                    <p className="text-faint">Growth</p>
                    <p className={cx('mt-0.5 font-mono text-[10.5px]', account.connected ? 'text-emerald-300' : 'text-faint')}>
                      {account.connected ? `+${account.growth}%` : '—'}
                    </p>
                  </div>
                  <div className="rounded-md border border-line/50 bg-surface/40 px-1.5 py-1">
                    <p className="text-faint">Sync</p>
                    <p className="mt-0.5 truncate text-[10px] text-muted">{account.lastSync}</p>
                  </div>
                </div>
                {!account.connected && (
                  <button
                    onClick={() => toggleAccount(account.id)}
                    className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-md border border-indigo-400/30 bg-indigo-500/10 py-1 text-[10px] font-medium text-indigo-200 transition-colors hover:bg-indigo-500/20"
                  >
                    <Link2 className="h-3 w-3" /> Connect via OAuth
                  </button>
                )}
              </div>
            ))}

            <div className="flex flex-col justify-between rounded-xl border border-dashed border-line/60 bg-app/20 p-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line/60 bg-raised/60 text-faint">
                  <Plus className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12px] font-medium text-ink">Add a channel</p>
                  <p className="text-[10px] text-faint">Threads, Pinterest, Bluesky…</p>
                </div>
              </div>
              <button
                onClick={() => toast('Channel request noted', 'Threads and Bluesky are next on the roadmap.')}
                className="mt-2 flex items-center justify-between rounded-md border border-line/60 px-2 py-1 text-[10px] text-muted transition-colors hover:border-indigo-400/40 hover:text-indigo-200"
              >
                Request a channel <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </Card>

        {/* Brand voice */}
        <Card className="mt-2.5 p-3">
          <SectionTitle
            step="02"
            title="Brand voice"
            description="This profile is injected into every AI generation, reply and remix."
            right={
              <Badge className="border-violet-500/25 bg-violet-500/10 text-violet-200">
                <Wand2 className="h-2.5 w-2.5" /> v3 · trained on 42 posts
              </Badge>
            }
          />

          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-faint" htmlFor="persona">
                  Voice persona
                </label>
                <TextArea
                  id="persona"
                  value={brandVoice.persona}
                  onChange={(event) => updateBrandVoice({ persona: event.target.value })}
                  rows={3}
                  className="text-[11.5px]"
                />
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">Descriptors</p>
                <div className="flex flex-wrap gap-1">
                  {DESCRIPTORS.map((descriptor) => {
                    const active = brandVoice.descriptors.includes(descriptor);
                    return (
                      <button
                        key={descriptor}
                        onClick={() =>
                          updateBrandVoice({
                            descriptors: active
                              ? brandVoice.descriptors.filter((d) => d !== descriptor)
                              : [...brandVoice.descriptors, descriptor],
                          })
                        }
                        className={cx(
                          'flex items-center gap-1 rounded-md border px-1.5 py-1 text-[10.5px] transition-colors',
                          active
                            ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-100'
                            : 'border-line/60 text-muted hover:text-ink',
                        )}
                      >
                        {active && <Check className="h-2.5 w-2.5" />}
                        {descriptor}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-line/60 bg-app/30 p-2.5">
                {[
                  { key: 'formality' as const, label: 'Formality', hint: 'Casual ↔ Corporate' },
                  { key: 'playfulness' as const, label: 'Playfulness', hint: 'Serious ↔ Cheeky' },
                  { key: 'boldness' as const, label: 'Boldness', hint: 'Safe ↔ Contrarian' },
                  { key: 'emoji' as const, label: 'Emoji density', hint: 'None ↔ Generous' },
                ].map((slider) => (
                  <label key={slider.key} className="block">
                    <span className="flex items-baseline justify-between">
                      <span className="text-[10.5px] font-medium text-ink">{slider.label}</span>
                      <span className="font-mono text-[9.5px] text-faint">{brandVoice[slider.key]}%</span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={brandVoice[slider.key]}
                      onChange={(event) => updateBrandVoice({ [slider.key]: Number(event.target.value) })}
                      className="mt-1.5 w-full"
                      aria-label={slider.label}
                    />
                    <span className="text-[9px] text-faint">{slider.hint}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">
                  <Ban className="h-2.5 w-2.5" /> Never say
                </p>
                <div className="flex flex-wrap gap-1">
                  {brandVoice.banned.map((word) => (
                    <span
                      key={word}
                      className="flex items-center gap-1 rounded-md border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-200"
                    >
                      {word}
                      <button
                        onClick={() => updateBrandVoice({ banned: brandVoice.banned.filter((w) => w !== word) })}
                        aria-label={`Remove ${word}`}
                        className="text-rose-300/70 hover:text-rose-100"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-1.5 flex gap-1">
                  <TextInput
                    value={bannedInput}
                    onChange={(event) => setBannedInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addBanned();
                      }
                    }}
                    placeholder="Add a banned word…"
                    className="h-8 text-[11px]"
                  />
                  <Button variant="secondary" size="sm" onClick={addBanned}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-faint" htmlFor="cta">
                    Default CTA
                  </label>
                  <select
                    id="cta"
                    value={brandVoice.cta}
                    onChange={(event) => updateBrandVoice({ cta: event.target.value })}
                    className="h-8 w-full rounded-lg border border-line/70 bg-app/50 px-2 text-[11px] text-ink outline-none focus:border-indigo-400/60"
                  >
                    {CTA_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-faint" htmlFor="signature">
                    Signature
                  </label>
                  <TextInput
                    id="signature"
                    value={brandVoice.signature}
                    onChange={(event) => updateBrandVoice({ signature: event.target.value })}
                    className="h-8 text-[11px]"
                  />
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">Default hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {brandVoice.defaultHashtags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-md border border-line/60 bg-raised/50 px-1.5 py-0.5 text-[10px] text-muted"
                    >
                      {tag}
                      <button
                        onClick={() =>
                          updateBrandVoice({ defaultHashtags: brandVoice.defaultHashtags.filter((t) => t !== tag) })
                        }
                        aria-label={`Remove ${tag}`}
                        className="text-faint hover:text-ink"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-1.5 flex gap-1">
                  <TextInput
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="#StudioLife"
                    className="h-8 text-[11px]"
                  />
                  <Button variant="secondary" size="sm" onClick={addTag}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-line/60 bg-app/30 p-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-ink">Client approval required</p>
                    <p className="text-[10px] leading-relaxed text-faint">Anything scheduled waits for a reviewer before it goes live.</p>
                  </div>
                  <Switch
                    size="sm"
                    checked={brandVoice.approvalRequired}
                    onChange={(next) => updateBrandVoice({ approvalRequired: next })}
                    label="Require client approval"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 border-t border-line/50 pt-2">
                  <div>
                    <p className="text-[11px] font-medium text-ink">First comment automation</p>
                    <p className="text-[10px] leading-relaxed text-faint">Drop links and hashtag blocks into the first comment by default.</p>
                  </div>
                  <Switch
                    size="sm"
                    checked={brandVoice.autoFirstComment}
                    onChange={(next) => updateBrandVoice({ autoFirstComment: next })}
                    label="Enable first comment automation"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-2.5 grid gap-2.5 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'SOC 2 Type II', body: 'SSO, audit logs and role-based approvals on Pro.' },
            { icon: KeyRound, title: 'API access', body: 'Personal keys for Zapier, n8n and custom workflows.' },
            { icon: Building2, title: 'Brands & clients', body: 'Three brand voices live, unlimited drafts per client.' },
          ].map((item) => (
            <Card key={item.title} className="p-2.5">
              <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink">
                <item.icon className="h-3.5 w-3.5 text-indigo-300" /> {item.title}
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-faint">{item.body}</p>
              <div className="mt-2">
                <Meter value={item.title === 'Brands & clients' ? 100 : 72} tone={item.title === 'Brands & clients' ? 'emerald' : 'indigo'} />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-line/60 bg-surface/40 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line/60 bg-raised/60 text-faint">
              <UserCog className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11px] font-medium text-ink">Team access</p>
              <p className="text-[10px] text-faint">Avery Reid (owner) · 2 editors · 1 client reviewer</p>
            </div>
          </div>
          <button
            onClick={() => toast('Invite link copied', 'Anyone with the link can review drafts for 7 days.')}
            className="flex items-center gap-1 rounded-md border border-line/60 px-2 py-1 text-[10px] text-muted transition-colors hover:text-ink"
          >
            <Link2 className="h-3 w-3" /> Copy invite link
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-1 py-3 text-[9.5px] text-faint">
          <Sparkles className="h-2.5 w-2.5 text-indigo-300" />
          Brand voice changes are applied to the next generation — existing scheduled posts keep their original voice.
        </div>
      </div>
    </div>
  );
}
