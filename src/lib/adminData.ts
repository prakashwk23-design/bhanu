import type { AdminViewId, ImpersonationWorkspace, PlanTier, PlatformId } from './types';

/* ------------------------------------------------------------------ tenants */

export type TenantStatus = 'Active' | 'Rate-limited' | 'Suspended';

export interface AdminWorkspace extends ImpersonationWorkspace {
  accounts: number;
  creditsUsed: number;
  creditsLimit: number;
  videoUsed: number;
  videoLimit: number;
  status: TenantStatus;
  joined: string;
  lastActive: string;
  mrr: number;
  sampleIdea: string;
  brandPersona: string;
}

export const adminWorkspaces: AdminWorkspace[] = [
  {
    id: 'northwind',
    name: 'Northwind Studio',
    plan: 'Agency',
    ownerName: 'Avery Reid',
    ownerEmail: 'avery@northwind.studio',
    initials: 'NS',
    tone: 'from-sky-400 to-indigo-600',
    brands: 3,
    accounts: 5,
    creditsUsed: 7420,
    creditsLimit: 10000,
    videoUsed: 142,
    videoLimit: 300,
    status: 'Active',
    joined: 'Mar 12, 2024',
    lastActive: 'Just now',
    mrr: 399,
    sampleIdea: 'The three-post queue rule that doubled our shipping cadence without adding meetings.',
    brandPersona: 'Confident operator who ships in public — allergic to fluff, generous with receipts.',
  },
  {
    id: 'helio',
    name: 'Helio Labs',
    plan: 'Pro',
    ownerName: 'Maya Chen',
    ownerEmail: 'maya@heliolabs.io',
    initials: 'HL',
    tone: 'from-violet-400 to-fuchsia-600',
    brands: 2,
    accounts: 4,
    creditsUsed: 6100,
    creditsLimit: 7500,
    videoUsed: 88,
    videoLimit: 150,
    status: 'Active',
    joined: 'Jun 02, 2024',
    lastActive: '4m ago',
    mrr: 149,
    sampleIdea: 'What we learned shipping a developer tool to 10,000 teams without a single paid ad.',
    brandPersona: 'Technical, precise and quietly funny. Show the benchmark, skip the hype.',
  },
  {
    id: 'cobalt',
    name: 'Cobalt & Co',
    plan: 'Free',
    ownerName: 'Chris Alvarez',
    ownerEmail: 'chris@cobaltandco.com',
    initials: 'CC',
    tone: 'from-cyan-400 to-blue-600',
    brands: 1,
    accounts: 2,
    creditsUsed: 2100,
    creditsLimit: 2500,
    videoUsed: 12,
    videoLimit: 30,
    status: 'Active',
    joined: 'Sep 18, 2025',
    lastActive: '21m ago',
    mrr: 0,
    sampleIdea: 'A tiny design studio tried publishing three times a week for a month. Here is what happened.',
    brandPersona: 'Warm, visual and low-key. Short sentences, strong point of view, no jargon.',
  },
  {
    id: 'noon',
    name: 'Studio Noon',
    plan: 'Pro',
    ownerName: 'Priya Raghavan',
    ownerEmail: 'priya@studionoon.co',
    initials: 'SN',
    tone: 'from-amber-400 to-orange-600',
    brands: 2,
    accounts: 3,
    creditsUsed: 4400,
    creditsLimit: 7500,
    videoUsed: 64,
    videoLimit: 150,
    status: 'Rate-limited',
    joined: 'Jan 09, 2025',
    lastActive: '8m ago',
    mrr: 149,
    sampleIdea: 'Our async review loop cut approval time from five days to one. The template is the whole trick.',
    brandPersona: 'Editorial and calm. Lead with the insight, never the announcement.',
  },
  {
    id: 'ledgerline',
    name: 'Ledgerline',
    plan: 'Agency',
    ownerName: 'Marcus Bell',
    ownerEmail: 'marcus@ledgerline.finance',
    initials: 'LL',
    tone: 'from-emerald-400 to-teal-600',
    brands: 5,
    accounts: 5,
    creditsUsed: 9300,
    creditsLimit: 15000,
    videoUsed: 212,
    videoLimit: 500,
    status: 'Active',
    joined: 'Nov 21, 2023',
    lastActive: '2m ago',
    mrr: 399,
    sampleIdea: 'Why finance teams should treat content like a reconciliation: fewer line items, checked monthly.',
    brandPersona: 'Credible, measured and plain-spoken. No hype, no emojis, always a number.',
  },
  {
    id: 'fieldnote',
    name: 'Fieldnote',
    plan: 'Free',
    ownerName: 'Sofia Marchetti',
    ownerEmail: 'sofia@fieldnote.design',
    initials: 'FN',
    tone: 'from-fuchsia-400 to-pink-600',
    brands: 1,
    accounts: 1,
    creditsUsed: 2400,
    creditsLimit: 2500,
    videoUsed: 28,
    videoLimit: 30,
    status: 'Active',
    joined: 'Feb 04, 2026',
    lastActive: '37m ago',
    mrr: 0,
    sampleIdea: 'Two designers, one Instagram account, and a rule against posting anything we would not frame.',
    brandPersona: 'Playful and visual. First person, small confessions, confident craft opinions.',
  },
  {
    id: 'arcember',
    name: 'Arc & Ember',
    plan: 'Pro',
    ownerName: 'Dara Okafor',
    ownerEmail: 'dara@arcember.studio',
    initials: 'AE',
    tone: 'from-violet-400 to-indigo-600',
    brands: 2,
    accounts: 3,
    creditsUsed: 3900,
    creditsLimit: 7500,
    videoUsed: 51,
    videoLimit: 150,
    status: 'Active',
    joined: 'Aug 14, 2024',
    lastActive: '12m ago',
    mrr: 149,
    sampleIdea: 'The carousel format we stopped using because the single image outperformed it twice.',
    brandPersona: 'Thoughtful and generous. Explain the decision, credit the team, invite disagreement.',
  },
  {
    id: 'kindred',
    name: 'Kindred Supply',
    plan: 'Free',
    ownerName: 'Leo Vance',
    ownerEmail: 'leo@kindred.supply',
    initials: 'KS',
    tone: 'from-lime-400 to-emerald-600',
    brands: 1,
    accounts: 2,
    creditsUsed: 900,
    creditsLimit: 2500,
    videoUsed: 4,
    videoLimit: 30,
    status: 'Active',
    joined: 'Oct 30, 2025',
    lastActive: '2h ago',
    mrr: 0,
    sampleIdea: 'We built a supply chain dashboard for fun. It now runs our entire back office.',
    brandPersona: 'Maker-first and transparent. Show the spreadsheet, admit the mess.',
  },
  {
    id: 'format',
    name: 'Format Works',
    plan: 'Agency',
    ownerName: 'Gia Moreno',
    ownerEmail: 'gia@formatworks.co',
    initials: 'FW',
    tone: 'from-rose-400 to-orange-500',
    brands: 4,
    accounts: 5,
    creditsUsed: 11400,
    creditsLimit: 15000,
    videoUsed: 361,
    videoLimit: 500,
    status: 'Rate-limited',
    joined: 'Apr 03, 2023',
    lastActive: '1m ago',
    mrr: 399,
    sampleIdea: 'The short-form hook that survived 42 posts and three audience changes.',
    brandPersona: 'Fast, funny and platform-native. Open with the visual, close with the takeaway.',
  },
  {
    id: 'sunday',
    name: 'Sunday Press',
    plan: 'Pro',
    ownerName: 'Noah Kim',
    ownerEmail: 'noah@sundaypress.co',
    initials: 'SP',
    tone: 'from-blue-400 to-indigo-600',
    brands: 2,
    accounts: 4,
    creditsUsed: 7200,
    creditsLimit: 7500,
    videoUsed: 129,
    videoLimit: 150,
    status: 'Active',
    joined: 'Jul 22, 2024',
    lastActive: '6m ago',
    mrr: 149,
    sampleIdea: 'A publishing schedule built around one weekly essay instead of five daily posts.',
    brandPersona: 'Literary but practical. Long-form instincts, tight sentences, zero clickbait.',
  },
  {
    id: 'vantage',
    name: 'Vantage Studio',
    plan: 'Free',
    ownerName: 'Iris Park',
    ownerEmail: 'iris@vantage.studio',
    initials: 'VS',
    tone: 'from-slate-400 to-slate-600',
    brands: 1,
    accounts: 1,
    creditsUsed: 2500,
    creditsLimit: 2500,
    videoUsed: 30,
    videoLimit: 30,
    status: 'Suspended',
    joined: 'Mar 17, 2026',
    lastActive: '3d ago',
    mrr: 0,
    sampleIdea: 'What we would charge for a brand sprint if we had to start the studio again tomorrow.',
    brandPersona: 'Direct and commercial. Talk about the work, the price and the trade-offs.',
  },
  {
    id: 'portside',
    name: 'Portside',
    plan: 'Pro',
    ownerName: 'Eli Brooks',
    ownerEmail: 'eli@portside.co',
    initials: 'PB',
    tone: 'from-teal-400 to-cyan-600',
    brands: 2,
    accounts: 2,
    creditsUsed: 1800,
    creditsLimit: 7500,
    videoUsed: 36,
    videoLimit: 150,
    status: 'Active',
    joined: 'Dec 05, 2024',
    lastActive: '44m ago',
    mrr: 149,
    sampleIdea: 'The 15-minute Friday update that replaced our three weekly syncs.',
    brandPersona: 'Plain-spoken operator. Short paragraphs, concrete numbers, dry humour.',
  },
  {
    id: 'monolith',
    name: 'Monolith',
    plan: 'Agency',
    ownerName: 'Zara Ali',
    ownerEmail: 'zara@monolith.agency',
    initials: 'MO',
    tone: 'from-purple-400 to-violet-600',
    brands: 6,
    accounts: 5,
    creditsUsed: 12800,
    creditsLimit: 15000,
    videoUsed: 420,
    videoLimit: 500,
    status: 'Active',
    joined: 'May 28, 2023',
    lastActive: 'Just now',
    mrr: 399,
    sampleIdea: 'Agency math: six clients, one production calendar, and the resourcing rule that saved the quarter.',
    brandPersona: 'Bold and strategic. Name the tension, bring the receipt, skip the preamble.',
  },
  {
    id: 'common',
    name: 'Common Thread',
    plan: 'Free',
    ownerName: 'Jules Martin',
    ownerEmail: 'jules@commonthread.co',
    initials: 'CT',
    tone: 'from-orange-400 to-amber-600',
    brands: 1,
    accounts: 3,
    creditsUsed: 1200,
    creditsLimit: 2500,
    videoUsed: 18,
    videoLimit: 30,
    status: 'Active',
    joined: 'Jan 15, 2026',
    lastActive: '5h ago',
    mrr: 0,
    sampleIdea: 'Our community newsletter grew 4x when we stopped chasing publishing volume.',
    brandPersona: 'Friendly and curious. Community-first, no growth-hack language.',
  },
];

/* ------------------------------------------------------------------ revenue */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface RevenuePoint {
  date: string;
  label: string;
  revenue: number;
  llmCost: number;
  videoCost: number;
  compute: number;
  margin: number;
}

export const revenueSeries: RevenuePoint[] = Array.from({ length: 30 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 9, 14 + index));
  const revenue = Math.round(5520 + index * 21 + Math.sin(index / 2.2) * 390 + Math.cos(index / 4.1) * 180);
  const llmCost = Math.round(690 + Math.sin(index / 2.8 + 1) * 110 + index * 3.4);
  const videoCost = Math.round(318 + Math.cos(index / 3.3) * 84 + index * 1.8);
  const compute = llmCost + videoCost;
  return {
    date: date.toISOString().slice(0, 10),
    label: `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`,
    revenue,
    llmCost,
    videoCost,
    compute,
    margin: Math.round(((revenue - compute) / revenue) * 1000) / 10,
  };
});

export const executiveKpis = {
  mrr: 184_620,
  mrrGrowth: 12.4,
  workspaces: 1284,
  planMix: { Free: 812, Pro: 364, Agency: 108 },
  workspacesGrowth: 4.8,
  postsToday: 3842,
  postsGrowth: 8.1,
  grossMargin: 71.8,
  marginDelta: 2.3,
  infraCost: 52_140,
  llmCost: 34_880,
  videoCost: 17_260,
  arpa: 143.8,
};

/* ----------------------------------------------------------------- activity */

export type ActivityType = 'signup' | 'upgrade' | 'schedule' | 'alert' | 'render' | 'prompt';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  workspace: string;
  detail: string;
  meta?: string;
  time: string;
}

export const activitySeed: ActivityEvent[] = [
  { id: 'a1', type: 'upgrade', workspace: 'Helio Labs', detail: 'Upgraded Pro → Agency', meta: '+$250 MRR', time: '12s ago' },
  { id: 'a2', type: 'signup', workspace: 'Grain & Grid', detail: 'New workspace · Free trial', meta: '3 seats', time: '48s ago' },
  { id: 'a3', type: 'alert', workspace: 'Format Works', detail: 'AI credits at 92% of monthly quota', meta: '11.4k / 15k', time: '1m ago' },
  { id: 'a4', type: 'schedule', workspace: 'Monolith', detail: 'Bulk schedule · 24 posts queued', meta: '6 brands', time: '2m ago' },
  { id: 'a5', type: 'render', workspace: 'Monolith', detail: 'Whisper captions completed', meta: '4m 12s clip', time: '3m ago' },
  { id: 'a6', type: 'upgrade', workspace: 'Common Thread', detail: 'Upgraded Free → Pro', meta: '+$149 MRR', time: '4m ago' },
  { id: 'a7', type: 'prompt', workspace: 'Platform', detail: 'LinkedIn formatter v14.3 pushed live', meta: 'Super Admin', time: '6m ago' },
];

export const activityCycle: Omit<ActivityEvent, 'id' | 'time'>[] = [
  { type: 'signup', workspace: 'Halcyon Type', detail: 'New workspace · Free trial', meta: '2 seats' },
  { type: 'schedule', workspace: 'Ledgerline', detail: 'Bulk schedule · 18 posts queued', meta: '5 brands' },
  { type: 'render', workspace: 'Format Works', detail: 'Cloudinary g_auto crop finished', meta: '9:16 · 1.2 GB' },
  { type: 'alert', workspace: 'Studio Noon', detail: 'Rate limit reached on Instagram Graph', meta: '429 · auto-retry' },
  { type: 'upgrade', workspace: 'Portside', detail: 'Upgraded Pro → Agency', meta: '+$250 MRR' },
  { type: 'signup', workspace: 'Marrow & Co', detail: 'New workspace · Agency trial', meta: '5 seats' },
];

/* --------------------------------------------------------------- API health */

export type ApiState = 'operational' | 'degraded' | 'outage';

export interface ApiHealth {
  platform: PlatformId;
  latency: number;
  uptime: number;
  capacity: number;
  oauth: 'verified' | 'expiring' | 'action-required';
  state: ApiState;
  note: string;
}

export const apiHealth: ApiHealth[] = [
  { platform: 'linkedin', latency: 142, uptime: 99.98, capacity: 82, oauth: 'verified', state: 'operational', note: 'Webhook verified 2m ago' },
  { platform: 'x', latency: 208, uptime: 99.91, capacity: 61, oauth: 'verified', state: 'operational', note: 'v2 write access active' },
  { platform: 'instagram', latency: 264, uptime: 99.72, capacity: 38, oauth: 'expiring', state: 'degraded', note: 'Token refresh due in 6 days' },
  { platform: 'tiktok', latency: 388, uptime: 99.42, capacity: 24, oauth: 'action-required', state: 'degraded', note: 'Direct Post review pending' },
  { platform: 'youtube', latency: 176, uptime: 99.96, capacity: 74, oauth: 'verified', state: 'operational', note: 'Quota resets in 9h' },
];

/* ------------------------------------------------------------- failed jobs */

export interface FailedJobRequest {
  method: 'POST' | 'PUT' | 'PATCH';
  endpoint: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export interface FailedJobMedia {
  asset: string;
  source: string;
  aspect: string;
  transformation: string;
  focal: { x: number; y: number };
  crop: { x: number; y: number; width: number; height: number };
}

export interface FailedJobResponse {
  status: number;
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  details: Record<string, unknown>;
}

export interface FailedJob {
  id: string;
  workspace: string;
  plan: PlanTier;
  platform: PlatformId;
  code: string;
  message: string;
  time: string;
  request: FailedJobRequest;
  media: FailedJobMedia;
  response: FailedJobResponse;
}

export const failedJobs: FailedJob[] = [
  {
    id: 'job-9041',
    workspace: 'Helio Labs',
    plan: 'Pro',
    platform: 'instagram',
    code: '401 OAuth Token Expired',
    message: 'The access token for @heliolabs expired before the scheduled publish.',
    time: '2m ago',
    request: {
      method: 'POST',
      endpoint: 'https://graph.facebook.com/v21.0/17841400935241/media',
      headers: { Authorization: 'Bearer •••• redacted', 'Content-Type': 'application/json' },
      body: {
        media_type: 'CAROUSEL',
        children: [
          'https://res.cloudinary.com/omnipost/image/upload/c_fill,w_1080,h_1350,g_auto:subject/v1/helio/slide-01.jpg',
          'https://res.cloudinary.com/omnipost/image/upload/c_fill,w_1080,h_1350,g_auto:subject/v1/helio/slide-02.jpg',
          'https://res.cloudinary.com/omnipost/image/upload/c_fill,w_1080,h_1350,g_auto:subject/v1/helio/slide-03.jpg',
        ],
        caption: 'What we learned shipping a developer tool to 10,000 teams without a single paid ad.',
        share_to_feed: true,
        scheduled_publish_time: 1762930800,
      },
    },
    media: {
      asset: 'carousel-4x5.mp4',
      source: '1920×1080',
      aspect: '4:5',
      transformation: 'c_fill,w_1080,h_1350,g_auto:subject',
      focal: { x: 52, y: 38 },
      crop: { x: 0, y: 122, width: 1080, height: 1350 },
    },
    response: {
      status: 401,
      code: 'OAuthException',
      message: 'Error validating access token: Session has expired on Thursday, 12-Nov-26 08:00:00 PST.',
      requestId: 'IGQVJXm3n8a2f1',
      retryable: false,
      details: { error_subcode: 463, type: 'OAuthException', fbtrace_id: 'A1b2C3d4E5f' },
    },
  },
  {
    id: 'job-9038',
    workspace: 'Format Works',
    plan: 'Agency',
    platform: 'tiktok',
    code: '429 Rate Limit Exceeded',
    message: 'Daily Direct Post allotment exhausted. Job paused until 00:00 UTC.',
    time: '6m ago',
    request: {
      method: 'POST',
      endpoint: 'https://open.tiktokapis.com/v2/post/publish/video/init/',
      headers: { Authorization: 'Bearer •••• redacted', 'Content-Type': 'application/json' },
      body: {
        post_info: {
          title: 'The short-form hook that survived 42 posts and three audience changes.',
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_comment: false,
          video_cover_timestamp_ms: 1200,
        },
        source_info: { source: 'FILE_UPLOAD', video_size: 18_400_000, chunk_size: 18_400_000, total_chunk_count: 1 },
      },
    },
    media: {
      asset: 'hook-cut-9x16.mp4',
      source: '3840×2160',
      aspect: '9:16',
      transformation: 'c_fill,w_1080,h_1920,g_auto',
      focal: { x: 48, y: 42 },
      crop: { x: 960, y: 0, width: 1080, height: 1920 },
    },
    response: {
      status: 429,
      code: 'rate_limit_exceeded',
      message: 'Daily Direct Post quota exhausted for this creator account.',
      requestId: 'tt-req-9f31c2',
      retryable: true,
      details: { retry_after: 3600, log_id: '20261112092314A9F31C2' },
    },
  },
  {
    id: 'job-9033',
    workspace: 'Sunday Press',
    plan: 'Pro',
    platform: 'linkedin',
    code: 'Media Aspect Ratio Rejected',
    message: 'LinkedIn rejected a 1080×1920 upload for the company page format.',
    time: '11m ago',
    request: {
      method: 'POST',
      endpoint: 'https://api.linkedin.com/rest/images?action=initializeUpload',
      headers: { Authorization: 'Bearer •••• redacted', 'LinkedIn-Version': '202611' },
      body: {
        initializeUploadRequest: {
          owner: 'urn:li:organization:91827364',
          fileSizeBytes: 2_481_920,
          uploadUrlExpiresIn: 3600,
        },
      },
    },
    media: {
      asset: 'vertical-cover.png',
      source: '1080×1920',
      aspect: '9:16',
      transformation: 'c_fill,w_1200,h_627,g_auto',
      focal: { x: 50, y: 31 },
      crop: { x: 0, y: 646, width: 1080, height: 565 },
    },
    response: {
      status: 422,
      code: 'INVALID_MEDIA_ASPECT_RATIO',
      message: 'The uploaded image aspect ratio is not supported for company page shares.',
      requestId: 'li-req-7a20fd',
      retryable: true,
      details: { field: 'initializeUploadRequest', supported: ['1.91:1', '1:1'], received: '0.56:1' },
    },
  },
  {
    id: 'job-9027',
    workspace: 'Cobalt & Co',
    plan: 'Free',
    platform: 'x',
    code: '403 Duplicate Content',
    message: 'X rejected the thread as a duplicate of a post published 18 minutes earlier.',
    time: '18m ago',
    request: {
      method: 'POST',
      endpoint: 'https://api.x.com/2/tweets',
      headers: { Authorization: 'OAuth 1.0a •••• redacted', 'Content-Type': 'application/json' },
      body: {
        text: 'A tiny design studio tried publishing three times a week for a month. Here is what happened. 1/4',
        reply: { in_reply_to_tweet_id: '1856294011223344556' },
        media: { media_ids: ['1856294011223344557'] },
      },
    },
    media: {
      asset: 'thread-cover.png',
      source: '1600×900',
      aspect: '16:9',
      transformation: 'c_fill,w_1200,h_675,g_auto',
      focal: { x: 44, y: 50 },
      crop: { x: 0, y: 113, width: 1600, height: 675 },
    },
    response: {
      status: 403,
      code: 'duplicate_content',
      message: 'You are not allowed to create a Tweet with duplicate content.',
      requestId: 'x-req-4bd920',
      retryable: false,
      details: { duplicate_of: '1856288822011903112', rule: 'duplicate_content' },
    },
  },
  {
    id: 'job-9019',
    workspace: 'Ledgerline',
    plan: 'Agency',
    platform: 'youtube',
    code: '401 Quota Exceeded',
    message: 'YouTube Data API daily upload quota reached. Retry scheduled after reset.',
    time: '26m ago',
    request: {
      method: 'POST',
      endpoint: 'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status',
      headers: { Authorization: 'Bearer •••• redacted', 'Content-Type': 'application/json' },
      body: {
        snippet: {
          title: 'Why finance teams should treat content like a reconciliation',
          description: 'Fewer line items, checked monthly.',
          categoryId: '22',
          tags: ['finance', 'contentops', 'shorts'],
        },
        status: { privacyStatus: 'public', selfDeclaredMadeForKids: false },
      },
    },
    media: {
      asset: 'shorts-9x16.mp4',
      source: '1080×1920',
      aspect: '9:16',
      transformation: 'c_fill,w_1080,h_1920,g_auto',
      focal: { x: 50, y: 44 },
      crop: { x: 0, y: 0, width: 1080, height: 1920 },
    },
    response: {
      status: 403,
      code: 'quotaExceeded',
      message: 'The request cannot be completed because you have exceeded your quota.',
      requestId: 'yt-req-6c14b8',
      retryable: true,
      details: { quota_remaining: 0, quota_reset: '2026-11-12T08:00:00Z', domain: 'youtube.quota' },
    },
  },
  {
    id: 'job-9011',
    workspace: 'Arc & Ember',
    plan: 'Pro',
    platform: 'instagram',
    code: 'Media Processing Timeout',
    message: 'Cloudinary render did not finish within the 180s publish window.',
    time: '34m ago',
    request: {
      method: 'POST',
      endpoint: 'https://graph.facebook.com/v21.0/17841400112233/media',
      headers: { Authorization: 'Bearer •••• redacted', 'Content-Type': 'application/json' },
      body: {
        image_url: 'https://res.cloudinary.com/omnipost/image/upload/c_fill,w_1080,h_1350,g_auto/v1/arcember/editorial-cover.jpg',
        caption: 'The carousel format we stopped using because the single image outperformed it twice.',
        media_type: 'IMAGE',
      },
    },
    media: {
      asset: 'behind-scenes.mov',
      source: '2560×1440',
      aspect: '4:5',
      transformation: 'c_fill,w_1080,h_1350,g_auto:subject',
      focal: { x: 60, y: 46 },
      crop: { x: 0, y: 153, width: 1080, height: 1350 },
    },
    response: {
      status: 504,
      code: 'media_processing_timeout',
      message: 'The media could not be processed within 180 seconds.',
      requestId: 'IGQVJY8c2e4a91',
      retryable: true,
      details: { render_id: 'cld-render-88213', timeout_seconds: 180, stage: 'g_auto_subject_crop' },
    },
  },
];

/* ----------------------------------------------------------- AI telemetry */

export interface ModelMetric {
  id: string;
  name: string;
  vendor: string;
  calls: number;
  tokens: number;
  latencyMs: number;
  costPer1k: number;
  cost: number;
  share: number;
}

export const modelMetrics: ModelMetric[] = [
  { id: 'gpt-4o', name: 'GPT-4o', vendor: 'OpenAI', calls: 41_280, tokens: 12_400_000, latencyMs: 1420, costPer1k: 0.31, cost: 3844, share: 44 },
  { id: 'claude', name: 'Claude 3.5 Sonnet', vendor: 'Anthropic', calls: 28_940, tokens: 9_840_000, latencyMs: 1840, costPer1k: 0.3, cost: 2952, share: 35 },
  { id: 'gemini', name: 'Gemini 1.5 Pro', vendor: 'Google', calls: 18_460, tokens: 6_120_000, latencyMs: 1120, costPer1k: 0.125, cost: 765, share: 21 },
];

export interface ToneMetric {
  tone: string;
  calls: number;
  tokens: number;
  latencyMs: number;
  cost: number;
  share: number;
}

export const toneMetrics: ToneMetric[] = [
  { tone: 'Thought Leader', calls: 38_420, tokens: 11_900_000, latencyMs: 1510, cost: 3210, share: 42 },
  { tone: 'Punchy & Viral', calls: 24_180, tokens: 6_240_000, latencyMs: 1280, cost: 1650, share: 26 },
  { tone: 'Educational', calls: 19_740, tokens: 7_080_000, latencyMs: 1660, cost: 2010, share: 22 },
  { tone: 'Witty', calls: 8_340, tokens: 3_140_000, latencyMs: 1190, cost: 691, share: 10 },
];

export type MediaJobType = 'cloudinary' | 'whisper' | 'carousel';
export type MediaJobStatus = 'active' | 'completed' | 'failed';

export interface MediaJob {
  id: string;
  type: MediaJobType;
  workspace: string;
  asset: string;
  status: MediaJobStatus;
  duration: string;
  inputMb: number;
  outputMb: number;
  cost: number;
}

export const mediaJobs: MediaJob[] = [
  { id: 'm-8801', type: 'cloudinary', workspace: 'Monolith', asset: 'campaign-cut.mp4', status: 'active', duration: '00:42', inputMb: 1840, outputMb: 420, cost: 0.84 },
  { id: 'm-8796', type: 'whisper', workspace: 'Format Works', asset: 'hook-cut.mp4', status: 'active', duration: '01:06', inputMb: 620, outputMb: 618, cost: 0.12 },
  { id: 'm-8788', type: 'carousel', workspace: 'Sunday Press', asset: 'panorama-city.png', status: 'completed', duration: '00:08', inputMb: 9.4, outputMb: 4.1, cost: 0.02 },
  { id: 'm-8781', type: 'cloudinary', workspace: 'Ledgerline', asset: 'quarterly-reel.mp4', status: 'completed', duration: '01:24', inputMb: 3200, outputMb: 560, cost: 1.36 },
  { id: 'm-8774', type: 'whisper', workspace: 'Northwind Studio', asset: 'studio-reel.mp4', status: 'completed', duration: '00:05', inputMb: 11, outputMb: 9.8, cost: 0.03 },
  { id: 'm-8769', type: 'carousel', workspace: 'Studio Noon', asset: 'editorial-wide.png', status: 'completed', duration: '00:06', inputMb: 7.8, outputMb: 3.6, cost: 0.02 },
  { id: 'm-8761', type: 'cloudinary', workspace: 'Arc & Ember', asset: 'behind-scenes.mov', status: 'failed', duration: '02:18', inputMb: 5400, outputMb: 0, cost: 0 },
  { id: 'm-8754', type: 'whisper', workspace: 'Helio Labs', asset: 'demo-walkthrough.mp4', status: 'completed', duration: '03:12', inputMb: 940, outputMb: 936, cost: 0.22 },
];

export const mediaSummary = {
  rendersToday: 1248,
  active: 2,
  queueDepth: 7,
  successRate: 99.2,
  spend: 214.8,
  minutesRendered: 4820,
  cloudinaryShare: 58,
  whisperShare: 27,
  carouselShare: 15,
};

/* --------------------------------------------------------------- prompts */

export type FormatterId = 'linkedin' | 'x' | 'instagram' | 'tiktok';

export interface PromptConfig {
  id: FormatterId;
  label: string;
  model: string;
  temperature: number;
  system: string;
}

export const promptDefaults: Record<FormatterId, PromptConfig> = {
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn Formatter',
    model: 'gpt-4o',
    temperature: 0.6,
    system: `You are a B2B editorial strategist writing for LinkedIn.
Open with one specific, credible hook — never a question.
Use short paragraphs separated by blank lines.
Include 3 concrete insights, each with proof or a receipt.
Close with a direct invitation to compare notes.
Maximum 3 hashtags. No emojis unless the brand voice allows them.`,
  },
  x: {
    id: 'x',
    label: 'X Threader',
    model: 'claude-3-5-sonnet',
    temperature: 0.8,
    system: `You are a sharp tech commentator writing for X.
Default to a single punchy post under 280 characters.
If the idea needs proof, build a numbered thread of 3-5 posts, each under 270 characters.
Number every thread post as 1/N. No hashtags. No thread emoji. No engagement bait.`,
  },
  instagram: {
    id: 'instagram',
    label: 'IG Caption',
    model: 'gpt-4o',
    temperature: 0.85,
    system: `You are a visual storyteller writing Instagram captions.
Lead with a line that earns the first swipe-stop.
Use line breaks, one concrete example, and a soft CTA to save or share.
Return exactly 5 niche hashtags. Place them after a dot break, never inline.
Match the brand's emoji level — never add decorative emoji to a restrained voice.`,
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok Hook',
    model: 'gemini-1-5-pro',
    temperature: 0.9,
    system: `You write short-form hooks that survive the first 1.5 seconds.
Return a spoken hook under 90 characters, then a 2-3 sentence caption.
Prioritise a visual promise or a tension over a summary.
Use at most 4 hashtags. Never explain the joke.`,
  },
};

/* ---------------------------------------------------------- feature flags */

export interface FeatureFlag {
  id: string;
  label: string;
  description: string;
  category: string;
  tiers: Record<PlanTier, { enabled: boolean; rollout: number }>;
}

export const featureFlagsSeed: FeatureFlag[] = [
  {
    id: 'captions',
    label: 'Smart Video Auto-Captions',
    description: 'Whisper transcription with word-level timing synced to the studio player.',
    category: 'Media',
    tiers: { Free: { enabled: true, rollout: 60 }, Pro: { enabled: true, rollout: 100 }, Agency: { enabled: true, rollout: 100 } },
  },
  {
    id: 'carousel',
    label: 'Carousel Splitter',
    description: 'Canvas slices wide images into 2–4 swipeable 1080×1350 carousel slides.',
    category: 'Media',
    tiers: { Free: { enabled: false, rollout: 0 }, Pro: { enabled: true, rollout: 100 }, Agency: { enabled: true, rollout: 100 } },
  },
  {
    id: 'approval',
    label: 'Client Approval Portals',
    description: 'Shareable review links with comment threads and per-channel sign-off.',
    category: 'Workflow',
    tiers: { Free: { enabled: false, rollout: 0 }, Pro: { enabled: true, rollout: 80 }, Agency: { enabled: true, rollout: 100 } },
  },
  {
    id: 'evergreen',
    label: 'Evergreen Post Recycler',
    description: 'Automatically re-queue top performers when the calendar has gaps.',
    category: 'Scheduling',
    tiers: { Free: { enabled: true, rollout: 25 }, Pro: { enabled: true, rollout: 60 }, Agency: { enabled: true, rollout: 100 } },
  },
  {
    id: 'first-comment',
    label: 'First-Comment Automation',
    description: 'Attach the resource link and hashtag block as the first comment on publish.',
    category: 'Publishing',
    tiers: { Free: { enabled: false, rollout: 0 }, Pro: { enabled: true, rollout: 45 }, Agency: { enabled: true, rollout: 90 } },
  },
];

/* ---------------------------------------------------------------- helpers */

export const ADMIN_VIEW_META: Record<AdminViewId, { title: string; subtitle: string; crumb: string }> = {
  executive: { title: 'Executive command', subtitle: 'Revenue, margin and platform pulse', crumb: 'Command' },
  tenants: { title: 'Tenants & quotas', subtitle: 'Every workspace, plan and limit', crumb: 'Tenants' },
  publishing: { title: 'Publishing & API health', subtitle: 'Queue integrity across five networks', crumb: 'Publishing' },
  telemetry: { title: 'AI & media telemetry', subtitle: 'Token, render and latency economics', crumb: 'Telemetry' },
  flags: { title: 'Prompts & feature flags', subtitle: 'Live configuration, zero redeploys', crumb: 'Platform' },
};

export function formatMoney(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
    return `$${value.toFixed(0)}`;
  }
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatTokenCount(value: number): string {
  return value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${(value / 1_000).toFixed(0)}k`;
}
