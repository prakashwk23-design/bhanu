import { DAY_LABELS, PEAK_SLOTS, PLATFORMS } from './platforms';
import type { BrandVoice, Conversation, PeakWindow, PlatformId, Tone } from './types';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'than', 'that', 'this', 'these', 'those', 'for', 'with',
  'without', 'from', 'into', 'onto', 'over', 'under', 'about', 'after', 'before', 'between', 'by', 'to', 'of',
  'in', 'on', 'at', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'done',
  'have', 'has', 'had', 'we', 'us', 'our', 'ours', 'you', 'your', 'they', 'them', 'their', 'it', 'its', 'i',
  'my', 'me', 'he', 'she', 'his', 'her', 'how', 'why', 'what', 'when', 'where', 'who', 'which', 'will',
  'would', 'can', 'could', 'should', 'may', 'might', 'must', 'not', 'no', 'yes', 'very', 'just', 'more',
  'most', 'much', 'many', 'some', 'any', 'all', 'every', 'each', 'per', 'via', 'using', 'used', 'use',
  'new', 'now', 'also', 'only', 'even', 'still', 'make', 'made', 'makes', 'get', 'got', 'gets', 'like',
  'one', 'two', 'three', 'four', 'five', 'first', 'last', 'next', 'out', 'up', 'down', 'so', 'because',
]);

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

export function titleCase(word: string): string {
  return word
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

export function extractKeywords(input: string, count = 6): string[] {
  const words = input
    .replace(/https?:\/\/\S+/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s%]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
  const unique: string[] = [];
  for (const w of words) {
    if (!unique.includes(w)) unique.push(w);
    if (unique.length >= count) break;
  }
  return unique;
}

function sentenceCase(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, ' ').replace(/^["'“]|["'”]$/g, '');
  if (!trimmed) return '';
  const withPunctuation = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return withPunctuation.charAt(0).toUpperCase() + withPunctuation.slice(1);
}

function clause(input: string, maxWords = 14): string {
  const words = input.trim().replace(/\s+/g, ' ').split(' ');
  const trimmed = words.slice(0, maxWords).join(' ').replace(/[,;:]$/, '');
  return sentenceCase(trimmed.replace(/[.!?]+$/, ''));
}

function buildHashtags(input: string, brand?: BrandVoice, limit = 6): string[] {
  const keywords = extractKeywords(input, 6);
  const tags: string[] = [];
  const push = (tag: string) => {
    const clean = tag.replace(/[^#a-zA-Z0-9]/g, '');
    if (clean.length > 1 && !tags.some((t) => t.toLowerCase() === clean.toLowerCase())) tags.push(clean);
  };
  if (brand) brand.defaultHashtags.forEach(push);
  keywords.slice(0, 3).forEach((k) => push(`#${titleCase(k)}`));
  push('#BuildInPublic');
  push('#CreatorOps');
  return tags.slice(0, limit);
}

export interface GeneratedDraft {
  title: string;
  master: string;
  overrides: Partial<Record<PlatformId, string>>;
  hashtags: string[];
  firstCommentText: string;
}

interface ToneBlueprint {
  context: string;
  bullets: (focus: string) => string[];
  takeaway: string;
  cta: string;
  shortHook: string;
}

const BLUEPRINTS: Record<Tone, ToneBlueprint> = {
  'thought-leader': {
    context: "The result looks like a win. The mechanism is the actual story — and it's repeatable.",
    bullets: (focus) => [
      'One owner per artifact. Shared ownership is how good work goes quiet.',
      'Decisions are written down the moment they are made, not reconstructed later.',
      `${focus.charAt(0).toUpperCase() + focus.slice(1)} became the default path, not the exception.`,
    ],
    takeaway: 'Consistency compounds faster than intensity. Every time.',
    cta: "If you're rebuilding this next quarter, I'd like to compare notes — what's your current cadence?",
    shortHook: 'The interesting part is not the result. It is the operating rhythm that made it repeatable.',
  },
  punchy: {
    context: 'Everyone wants the outcome. Almost nobody wants the boring part that produces it.',
    bullets: () => ['Fewer approvals, faster loops.', 'Ship the smaller version first.', 'Let the receipts do the talking.'],
    takeaway: 'Boring systems win. Loud launches do not.',
    cta: 'Steal the loop. Tell me what breaks.',
    shortHook: 'No framework. No 12-step funnel. Just the unglamorous thing that worked.',
  },
  educational: {
    context: 'Here is the loop, in the order that actually mattered:',
    bullets: () => [
      'Write the one-line outcome before touching the work.',
      'Timebox the first pass to 25 minutes. Momentum beats polish.',
      'Share the rough version in public. Feedback arrives while it is still cheap.',
    ],
    takeaway: 'The system is the deliverable. The result is just proof.',
    cta: 'Save this for your next planning cycle — which step would you change?',
    shortHook: 'A four-step loop you can run in a single afternoon:',
  },
  witty: {
    context: 'Wild how much you can get done when the recurring meeting simply disappears.',
    bullets: () => ['Step 1: care.', 'Step 2: less.', 'Step 3: ship.'],
    takeaway: 'Turns out the secret is doing the thing. Annoying, I know.',
    cta: "I'll be here, quietly not scheduling a meeting about it.",
    shortHook: 'Turns out the strategy works better when you stop booking calls about the strategy.',
  },
};

let generationCounter = 0;

export function generateDrafts(idea: string, tone: Tone, brand?: BrandVoice): GeneratedDraft {
  generationCounter += 1;
  const cleaned = idea.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  const blueprint = BLUEPRINTS[tone];
  const seed = hashString(`${cleaned}::${tone}::${generationCounter}`);
  const keywords = extractKeywords(cleaned || 'social media operations', 6);
  const focus = keywords[0] ?? 'the workflow';
  const hashtags = buildHashtags(cleaned, brand);
  const opener = clause(cleaned || 'We rebuilt how our team ships content', 18);
  const bullets = blueprint.bullets(focus);
  const headlineWords = cleaned.split(/\s+/).slice(0, 7).join(' ').replace(/[.,:;]$/, '');

  const master = [
    opener,
    '',
    blueprint.context,
    '',
    ...bullets.map((b) => `→ ${b}`),
    '',
    blueprint.takeaway,
    '',
    blueprint.cta,
    '',
    hashtags.slice(0, 3).join(' '),
  ].join('\n');

  const title = headlineWords
    ? headlineWords.charAt(0).toUpperCase() + headlineWords.slice(1)
    : `New ${tone.replace('-', ' ')} post`;

  const xCore = `${opener} ${blueprint.shortHook}`;
  const xThread =
    tone === 'educational'
      ? [
          `${opener}`,
          blueprint.bullets(focus)
            .map((b, i) => `${i + 1}. ${b}`)
            .join('\n'),
          `${blueprint.takeaway}\n\n${blueprint.cta}`,
        ].join('\n\n')
      : `${xCore}\n\n${blueprint.takeaway}`;

  const instagramCaption = [
    opener,
    '',
    blueprint.context,
    '',
    `${bullets[0]}\n${bullets[1]}`,
    '',
    blueprint.cta,
    '',
    'Link in bio for the full breakdown.',
    '',
    '.',
    '.',
    '.',
    hashtags.join(' '),
  ].join('\n');

  const tiktokCaption = [
    `${opener} ${pick(['Watch this twice.', 'This one changed the quarter.', 'Nobody told us this part.'], seed)}`,
    '',
    ...bullets.slice(0, 2).map((b) => `• ${b.replace(/\.$/, '')}`),
    '',
    `${blueprint.takeaway}`,
    hashtags.slice(0, 4).join(' '),
    '#fyp #creatorops',
  ].join('\n');

  const youtubeDescription = [
    `${opener}`,
    '',
    blueprint.context,
    ...bullets.map((b) => `• ${b}`),
    '',
    `${blueprint.cta}`,
    '',
    hashtags.join(' '),
    '#Shorts',
  ].join('\n');

  const overrides: Partial<Record<PlatformId, string>> = {
    linkedin: master,
    x: xThread,
    instagram: instagramCaption,
    tiktok: tiktokCaption,
    youtube: youtubeDescription,
  };

  const slug = (keywords.slice(0, 3).join('-') || 'playbook').toLowerCase();
  const firstCommentText = `Full breakdown + the template we actually used → omnipost.ai/blog/${slug}\n\n${hashtags.slice(3).join(' ')}`;

  return { title, master, overrides, hashtags, firstCommentText };
}

export function suggestHashtags(input: string, brand?: BrandVoice): string[] {
  return buildHashtags(input, brand, 8);
}

export function splitThread(text: string, limit = 280): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= limit) return [trimmed];
  const chunks: string[] = [];
  let rest = trimmed;
  while (rest.length > limit) {
    let cut = rest.lastIndexOf('\n', limit);
    if (cut < limit * 0.45) {
      const sentence = rest.lastIndexOf('. ', limit);
      cut = sentence > limit * 0.4 ? sentence + 1 : rest.lastIndexOf(' ', limit);
    }
    if (cut <= 0) cut = limit;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

export interface QuickReply {
  label: string;
  text: string;
  icon: 'sparkles' | 'heart' | 'calendar' | 'link';
}

export function generateQuickReplies(conversation: Conversation, brand: BrandVoice): QuickReply[] {
  const firstName = conversation.senderName.split(' ')[0];
  const lastMessage = conversation.messages.filter((m) => m.from === 'them').at(-1)?.text ?? '';
  const terse = brand.formality < 45;
  const emoji = brand.emoji > 55 ? ' ✨' : '';

  if (/pric|cost|plan|budget|seat/i.test(lastMessage)) {
    return [
      {
        label: 'Answer with pricing',
        text: `Great question, ${firstName} — it's $29/seat per month with every channel included, no add-ons. Happy to set you up with a 14-day workspace so your team can test it on real drafts.`,
        icon: 'sparkles',
      },
      {
        label: 'Offer a walkthrough',
        text: `Happy to walk you through it, ${firstName} — 15 minutes, screen shared, and you'll leave with a working calendar. Want me to send a couple of times?${emoji}`,
        icon: 'calendar',
      },
      {
        label: 'Move to DM',
        text: `Just sent you a DM with the plan breakdown and a comparison against what you're using today${emoji}`,
        icon: 'link',
      },
    ];
  }

  if (conversation.kind === 'mention' || /love|great|amazing|brilliant|game.?changer/i.test(lastMessage)) {
    return [
      {
        label: 'Warm thank you',
        text: `This made our morning, ${firstName} — thank you. The ${brand.persona.split(' ')[0].toLowerCase()} playbook behind it is exactly what we're shipping next.`,
        icon: 'heart',
      },
      {
        label: 'Share the template',
        text: `Appreciate you, ${firstName}. Sending over the template we used — no email required, just take it.`,
        icon: 'link',
      },
      {
        label: 'Invite a collab',
        text: `Would love to have you try the next release before it goes public, ${firstName}. Want me to add you to the beta list?`,
        icon: 'sparkles',
      },
    ];
  }

  if (conversation.sentiment === 'question' || /\?$/.test(lastMessage)) {
    return [
      {
        label: 'Direct answer',
        text: terse
          ? `Yes — here's exactly how we do it, ${firstName}: one master draft, per-channel overrides, then peak-time scheduling. Two minutes to set up.`
          : `Yes, great question. The short version: we write once, tailor per channel, and let the scheduler pick the audience peak. I'm happy to show you the exact setup we use for teams your size.`,
        icon: 'sparkles',
      },
      {
        label: 'Point to resource',
        text: `We wrote the whole workflow up, ${firstName} — I'll drop the link here so you don't have to hunt for it.`,
        icon: 'link',
      },
      {
        label: 'Follow-up later',
        text: `Let me check with the team and come back to you today with a proper answer rather than a guess${emoji}`,
        icon: 'calendar',
      },
    ];
  }

  return [
    {
      label: 'Friendly + short',
      text: `Thanks for the note, ${firstName} — really glad it landed. Anything you'd want to see us cover next?${emoji}`,
      icon: 'heart',
    },
    {
      label: 'Add context',
      text: `One thing worth adding, ${firstName}: we tested this across three accounts before writing it up, and the pattern held every time.`,
      icon: 'sparkles',
    },
    {
      label: 'Book a time',
      text: `If it's useful, I can walk you through the setup on a quick call this week — no pitch, just the workflow.`,
      icon: 'calendar',
    },
  ];
}

function nextOccurrence(day: number, hour: number, minute: number, from: Date): Date {
  const next = new Date(from);
  next.setHours(hour, minute, 0, 0);
  let delta = (day - next.getDay() + 7) % 7;
  if (delta === 0 && next.getTime() <= from.getTime()) delta = 7;
  next.setDate(next.getDate() + delta);
  return next;
}

export function formatSlotTime(hour: number, minute: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${minute.toString().padStart(2, '0')} ${suffix}`;
}

export function peakWindowOptions(platforms: PlatformId[], from = new Date(), count = 3): PeakWindow[] {
  const candidates: PeakWindow[] = [];
  for (const platform of platforms) {
    for (const slot of PEAK_SLOTS[platform]) {
      const date = nextOccurrence(slot.day, slot.hour, slot.minute, from);
      candidates.push({
        platform,
        day: DAY_LABELS[slot.day],
        time: formatSlotTime(slot.hour, slot.minute),
        match: slot.match,
        iso: date.toISOString(),
      });
    }
  }
  const seen = new Set<string>();
  return candidates
    .sort((a, b) => b.match - a.match)
    .filter((c) => {
      const key = `${c.day}-${c.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, count);
}

export function nextPeakWindow(platforms: PlatformId[]): PeakWindow {
  return peakWindowOptions(platforms, new Date(), 3)[0];
}

export function formatPeak(peak: PeakWindow): string {
  return `${peak.match}% Engagement Match · ${peak.day} ${peak.time}`;
}

export function platformNames(platforms: PlatformId[]): string {
  return platforms.map((p) => PLATFORMS[p].name).join(' · ');
}
