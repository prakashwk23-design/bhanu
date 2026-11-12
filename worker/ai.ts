import type { ComposeRequest, ComposeResponse, ComposeShortForm } from '../src/lib/apiTypes';
import type { Tone } from '../src/lib/types';
import type { Env } from './env';

const VALID_TONES: Tone[] = ['thought-leader', 'punchy', 'educational', 'witty'];

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'that', 'this', 'these', 'those', 'for', 'with',
  'from', 'into', 'over', 'under', 'about', 'after', 'before', 'between', 'by', 'to', 'of', 'in', 'on',
  'at', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'have', 'has',
  'had', 'we', 'us', 'our', 'you', 'your', 'they', 'them', 'their', 'it', 'its', 'i', 'my', 'me',
  'how', 'why', 'what', 'when', 'where', 'who', 'which', 'will', 'would', 'can', 'could', 'should',
  'may', 'might', 'must', 'not', 'no', 'yes', 'very', 'just', 'more', 'most', 'much', 'many', 'some',
  'any', 'all', 'every', 'each', 'per', 'via', 'using', 'used', 'use', 'new', 'now', 'also', 'only',
  'even', 'still', 'make', 'made', 'makes', 'get', 'got', 'gets', 'like', 'one', 'two', 'three', 'four',
  'five', 'first', 'last', 'next', 'out', 'up', 'down', 'so', 'because',
]);

interface ToneBlueprint {
  context: string;
  bullets: (focus: string) => string[];
  takeaway: string;
  cta: string;
  shortHook: string;
}

const BLUEPRINTS: Record<Tone, ToneBlueprint> = {
  'thought-leader': {
    context:
      'The result looks like a win. The mechanism is the actual story — and it is repeatable by any team willing to run it.',
    bullets: (focus) => [
      'One owner per artifact. Shared ownership is how good work quietly stalls.',
      'Decisions are written down the moment they are made, not reconstructed from memory a week later.',
      `${focus.charAt(0).toUpperCase() + focus.slice(1)} became the default path, not the exception.`,
    ],
    takeaway: 'Consistency compounds faster than intensity. That is the whole edge.',
    cta: "If you're rebuilding this next quarter, I'd like to compare notes — what does your current cadence look like?",
    shortHook:
      'The interesting part is not the result. It is the operating rhythm that made the result repeatable.',
  },
  punchy: {
    context: 'Everyone wants the outcome. Almost nobody wants the boring part that produces it.',
    bullets: () => [
      'Fewer approvals. Faster loops.',
      'Ship the smaller version first.',
      'Let the receipts do the talking.',
    ],
    takeaway: 'Boring systems win. Loud launches do not.',
    cta: 'Steal the loop. Tell me what breaks.',
    shortHook: 'No framework. No twelve-step funnel. Just the unglamorous thing that worked.',
  },
  educational: {
    context: 'Here is the loop, in the order that actually mattered:',
    bullets: () => [
      'Write the one-line outcome before touching the work.',
      'Timebox the first pass to 25 minutes. Momentum beats polish.',
      'Share the rough version publicly while feedback is still cheap.',
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

function normalizeSpace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function extractKeywords(input: string, count = 6): string[] {
  const words = input
    .replace(/https?:\/\/\S+/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
  return [...new Set(words)].slice(0, count);
}

function titleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function sentenceCase(input: string): string {
  const trimmed = normalizeSpace(input).replace(/^["'“]|["'”]$/g, '');
  if (!trimmed) return '';
  const punctuated = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return punctuated.charAt(0).toUpperCase() + punctuated.slice(1);
}

function clause(input: string, maxWords = 18): string {
  const words = normalizeSpace(input).split(' ');
  return sentenceCase(words.slice(0, maxWords).join(' ').replace(/[,;:]$/, '').replace(/[.!?]+$/, ''));
}

function trimTo(text: string, max: number): string {
  const clean = normalizeSpace(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const boundary = cut.lastIndexOf(' ');
  return `${cut.slice(0, boundary > max * 0.55 ? boundary : max - 1).trimEnd()}…`;
}

function applyBanned(text: string, banned: string[]): string {
  if (!banned.length) return text;
  let output = text;
  for (const word of banned) {
    if (!word.trim()) continue;
    const pattern = new RegExp(`\\b${word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    output = output.replace(pattern, '').replace(/[ \t]{2,}/g, ' ');
  }
  return output.replace(/\n{3,}/g, '\n\n').trim();
}

function buildTags(idea: string, brand: ComposeRequest['brandVoice'], count: number): string[] {
  const tags: string[] = [];
  const push = (tag: string) => {
    const clean = tag.replace(/[^#a-zA-Z0-9]/g, '');
    if (clean.length > 1 && !tags.some((existing) => existing.toLowerCase() === clean.toLowerCase())) {
      tags.push(clean);
    }
  };
  brand.defaultHashtags.forEach(push);
  ['#ContentStrategy', '#CreatorEconomy', '#SocialMediaTips', '#MarketingOps'].forEach(push);
  extractKeywords(idea, 5)
    .filter((keyword) => !['capped', 'doubled', 'weekly', 'meetings', 'output', 'shipped', 'shipping', 'speed', 'posts', 'channel', 'update'].includes(keyword))
    .slice(0, 2)
    .forEach((keyword) => push(`#${titleCase(keyword)}`));
  return tags.slice(0, count);
}

function slugify(input: string): string {
  return (
    normalizeSpace(input)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 4)
      .join('-') || 'playbook'
  );
}

function structuredCompose(request: ComposeRequest): ComposeResponse {
  const { idea, tone, brandVoice } = request;
  const cleaned = normalizeSpace(idea);
  const blueprint = BLUEPRINTS[tone];
  const focus = extractKeywords(cleaned, 3)[0] ?? 'the workflow';
  const opener = clause(cleaned || 'We rebuilt how our team ships content', 18);
  const bullets = blueprint.bullets(focus);
  const hashtags = buildTags(cleaned, brandVoice, 5);
  const emoji = brandVoice.emoji > 60 ? ' ✨' : '';
  const titleWords = cleaned.split(' ').slice(0, 8).join(' ');
  const title = titleWords
    ? titleWords.charAt(0).toUpperCase() + titleWords.slice(1)
    : 'Untitled campaign';

  const linkedinCopy = [
    opener,
    blueprint.context,
    ...bullets,
    blueprint.takeaway,
    blueprint.cta,
  ].join('\n\n');

  const xPosts: string[] = [];
  const wantsThread = tone === 'educational' || cleaned.length > 150;
  if (wantsThread) {
    const raw = [
      opener,
      bullets.map((bullet, index) => `${index + 1}. ${bullet}`).join('\n'),
      `${blueprint.takeaway}\n\n${blueprint.cta}`,
    ];
    raw.forEach((post, index) => {
      xPosts.push(trimTo(`${index + 1}/${raw.length} ${post}`, 275));
    });
  } else {
    xPosts.push(trimTo(`${opener} ${blueprint.shortHook} ${blueprint.takeaway}`, 275));
  }

  const instagramCaption = [
    `${opener.replace(/\.$/, '')}${emoji}`,
    blueprint.context,
    `${bullets[0]}\n${bullets[1]}`,
    blueprint.cta,
    'Link in bio for the full breakdown.',
  ].join('\n\n');

  const tiktok: ComposeShortForm = {
    hook: `${blueprint.shortHook}${emoji}`,
    caption: trimTo(`${opener} ${blueprint.takeaway}`, 180),
    hashtags: hashtags.slice(0, 3),
  };

  const youtube: ComposeShortForm = {
    hook: blueprint.shortHook,
    caption: [
      opener,
      blueprint.context,
      ...bullets.map((bullet) => `• ${bullet}`),
      blueprint.cta,
    ].join('\n'),
    hashtags: hashtags.slice(0, 4),
  };

  const firstComment = `Full breakdown + the template we actually used → omnipost.ai/blog/${slugify(cleaned)}\n\n${hashtags
    .slice(3)
    .join(' ')}`;

  return {
    title: applyBanned(title, brandVoice.banned),
    linkedin: {
      hook: applyBanned(opener, brandVoice.banned),
      copy: applyBanned(linkedinCopy, brandVoice.banned),
      hashtags: hashtags.slice(0, 3),
    },
    x: { mode: wantsThread ? 'thread' : 'single', posts: xPosts.map((post) => applyBanned(post, brandVoice.banned)) },
    instagram: {
      caption: applyBanned(instagramCaption, brandVoice.banned),
      hashtags,
    },
    tiktok: {
      ...tiktok,
      hook: applyBanned(tiktok.hook, brandVoice.banned),
      caption: applyBanned(tiktok.caption, brandVoice.banned),
    },
    youtube: {
      ...youtube,
      hook: applyBanned(youtube.hook, brandVoice.banned),
      caption: applyBanned(youtube.caption, brandVoice.banned),
    },
    firstComment: applyBanned(firstComment, brandVoice.banned),
    engine: 'structured',
    provider: 'built-in-structured',
  };
}

interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: string;
}

function llmConfig(env: Env): LlmConfig | null {
  const apiKey = env.ZAI_API_KEY || env.AI_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: (env.ZAI_API_BASE || env.AI_API_BASE || 'https://api.z.ai/api/paas/v4').replace(/\/+$/, ''),
    model: env.AI_MODEL || 'glm-4-flash',
    provider: env.ZAI_API_KEY ? 'zai' : 'openai-compatible',
  };
}

export function aiMeta(env: Env): {
  aiConfigured: boolean;
  aiEngine: 'llm' | 'structured';
  aiModel: string;
} {
  const config = llmConfig(env);
  return {
    aiConfigured: Boolean(config),
    aiEngine: config ? 'llm' : 'structured',
    aiModel: config?.model ?? 'built-in-structured',
  };
}

const SYSTEM_PROMPT = `You are OmniPost AI, a senior social strategist. Return ONLY a JSON object, no markdown fences, with this exact shape:
{
  "title": string,
  "linkedin": { "hook": string, "copy": string, "hashtags": string[] },
  "x": { "mode": "single" | "thread", "posts": string[] },
  "instagram": { "caption": string, "hashtags": string[] },
  "tiktok": { "hook": string, "caption": string, "hashtags": string[] },
  "youtube": { "hook": string, "caption": string, "hashtags": string[] },
  "firstComment": string
}
Rules:
- linkedin.copy: 700-1300 chars, professional hook first, then short paragraphs separated by blank lines, scannable insights, one clear CTA.
- x.posts: 1-4 posts, each under 270 characters. If thread, prefix each with "1/3", "2/3", etc. If single, return one punchy post.
- instagram.caption: engaging, line breaks, CTA, link-in-bio line. instagram.hashtags must contain EXACTLY 5 niche hashtags starting with "#".
- tiktok: a short spoken hook (under 90 chars) plus a caption under 180 chars.
- youtube: a Shorts hook plus a search-friendly description.
- Respect the brand voice. Never use banned words. Match emoji level.
- firstComment: a useful follow-up comment with a resource URL.`;

async function callLlm(config: LlmConfig, request: ComposeRequest): Promise<unknown> {
  const userPrompt = JSON.stringify({
    idea: request.idea,
    tone: request.tone,
    brandVoice: {
      ...request.brandVoice,
      descriptors: request.brandVoice.descriptors,
    },
  });

  const call = async (withJsonMode: boolean) =>
    fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.75,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        ...(withJsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    });

  let response = await call(true);
  if (!response.ok && (response.status === 400 || response.status === 422)) {
    response = await call(false);
  }
  if (!response.ok) {
    throw new Error(`LLM request failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('LLM returned an empty completion');
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function asText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeTags(value: unknown, fallback: string[], count: number): string[] {
  const tags: string[] = [];
  const push = (raw: unknown) => {
    if (typeof raw !== 'string') return;
    const clean = raw.startsWith('#') ? raw : `#${raw}`;
    const safe = clean.replace(/[^#a-zA-Z0-9]/g, '');
    if (safe.length > 1 && !tags.some((tag) => tag.toLowerCase() === safe.toLowerCase())) tags.push(safe);
  };
  if (Array.isArray(value)) value.forEach(push);
  if (tags.length < count) fallback.forEach(push);
  return tags.slice(0, count);
}

function normalizeCompose(raw: unknown, fallback: ComposeResponse, brandBanned: string[]): ComposeResponse {
  const root = asObject(raw);
  const linkedin = asObject(root.linkedin);
  const x = asObject(root.x);
  const instagram = asObject(root.instagram);
  const tiktok = asObject(root.tiktok);
  const youtube = asObject(root.youtube);

  const rawXPosts = Array.isArray(x.posts)
    ? x.posts.filter((post): post is string => typeof post === 'string' && post.trim().length > 0)
    : [];
  const baseXPosts = (rawXPosts.length ? rawXPosts : fallback.x.posts).slice(0, 5);
  const alreadyNumbered = baseXPosts.length > 1 && /^1\/\d+/.test(baseXPosts[0]);
  const xPosts = baseXPosts.map((post, index) => {
    const numbered =
      baseXPosts.length > 1 && !alreadyNumbered ? `${index + 1}/${baseXPosts.length} ${post}` : post;
    return applyBanned(trimTo(numbered, 275), brandBanned);
  });
  const xMode = xPosts.length > 1 ? 'thread' : 'single';

  const shortForm = (
    source: Record<string, unknown>,
    fb: ComposeShortForm,
  ): ComposeShortForm => ({
    hook: applyBanned(asText(source.hook, fb.hook), brandBanned),
    caption: applyBanned(asText(source.caption, fb.caption), brandBanned),
    hashtags: normalizeTags(source.hashtags, fb.hashtags, 3),
  });

  return {
    title: applyBanned(asText(root.title, fallback.title), brandBanned),
    linkedin: {
      hook: applyBanned(asText(linkedin.hook, fallback.linkedin.hook), brandBanned),
      copy: applyBanned(asText(linkedin.copy, fallback.linkedin.copy), brandBanned),
      hashtags: normalizeTags(linkedin.hashtags, fallback.linkedin.hashtags, 3),
    },
    x: { mode: xMode, posts: xPosts },
    instagram: {
      caption: applyBanned(asText(instagram.caption, fallback.instagram.caption), brandBanned),
      hashtags: normalizeTags(instagram.hashtags, fallback.instagram.hashtags, 5),
    },
    tiktok: shortForm(tiktok, fallback.tiktok),
    youtube: shortForm(youtube, fallback.youtube),
    firstComment: applyBanned(asText(root.firstComment, fallback.firstComment), brandBanned),
    engine: 'llm',
    provider: 'unknown',
  };
}

export async function composeContent(request: ComposeRequest, env: Env): Promise<ComposeResponse> {
  const normalizedRequest: ComposeRequest = {
    idea: normalizeSpace(request.idea).slice(0, 4000),
    tone: VALID_TONES.includes(request.tone) ? request.tone : 'thought-leader',
    brandVoice: request.brandVoice,
  };
  const fallback = structuredCompose(normalizedRequest);
  const config = llmConfig(env);
  if (!config) return fallback;

  try {
    const raw = await callLlm(config, normalizedRequest);
    const normalized = normalizeCompose(raw, fallback, normalizedRequest.brandVoice.banned);
    return { ...normalized, engine: 'llm', provider: config.provider, model: config.model };
  } catch (error) {
    console.warn('llm_fallback', error);
    return {
      ...fallback,
      warning: `Live model unavailable (${error instanceof Error ? error.message : 'unknown error'}). Served validated structured copy instead.`,
    };
  }
}
