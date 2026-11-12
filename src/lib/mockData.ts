import type {
  AspectPreset,
  BrandVoice,
  Conversation,
  MediaAsset,
  PlatformId,
  Post,
  Tone,
} from './types';

export const mediaAssets: MediaAsset[] = [
  {
    id: 'm-city',
    name: 'city-night.png',
    type: 'image',
    url: '/media/city-night.png',
    width: 1280,
    height: 720,
    size: '887 KB',
    tags: ['skyline', 'night', 'moody'],
  },
  {
    id: 'm-ridge',
    name: 'studio-reel.mp4',
    type: 'video',
    url: '/media/studio-reel.mp4',
    width: 960,
    height: 540,
    duration: '0:05',
    durationSeconds: 5.06,
    size: '1.1 MB',
    tags: ['studio', 'reel', 'video'],
  },
  {
    id: 'm-studio',
    name: 'studio-product.png',
    type: 'image',
    url: '/media/studio-product.png',
    width: 1080,
    height: 1350,
    size: '1.6 MB',
    tags: ['product', 'studio', 'portrait'],
  },
];

export function getMedia(id: string): MediaAsset {
  return mediaAssets.find((m) => m.id === id) ?? mediaAssets[0];
}

export const defaultBrandVoice: BrandVoice = {
  persona: 'Confident operator who ships in public — allergic to fluff, generous with receipts.',
  descriptors: ['Direct', 'Warm', 'Evidence-led', 'Dry humour'],
  formality: 45,
  playfulness: 62,
  boldness: 74,
  emoji: 35,
  banned: ['synergy', 'leverage', 'game-changer', 'ninja'],
  cta: 'Invite a specific next step',
  signature: '— The Northwind Studio team',
  defaultHashtags: ['#NorthwindStudio', '#CreatorOps'],
  approvalRequired: true,
  autoFirstComment: true,
};

const DEFAULT_FOCAL = { x: 50, y: 46 };

function draftSeed(partial: Partial<Post> & Pick<Post, 'id' | 'title' | 'master'>): Post {
  return {
    idea: '',
    tone: 'thought-leader',
    overrides: {},
    hashtags: ['#CreatorOps', '#BuildInPublic', '#ContentStrategy'],
    firstComment: true,
    firstCommentText: 'Full workflow + template → omnipost.ai/blog/creator-ops',
    platforms: ['linkedin', 'x', 'instagram', 'tiktok', 'youtube'],
    mediaId: 'm-ridge',
    aspect: '4:5' as AspectPreset,
    focal: DEFAULT_FOCAL,
    carousel: false,
    caption: {
      enabled: false,
      text: 'Write once. Tailor everywhere.',
      style: 'hormozi',
      size: 26,
      position: 74,
    },
    status: 'draft',
    scheduledAt: null,
    ...partial,
  };
}

function at(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const LI_1 = `We cut onboarding time by 40% by replacing live design reviews with async video walkthroughs.

The result looks like a win. The mechanism is the actual story — and it's repeatable.

→ One owner per artifact. Shared ownership is how good work goes quiet.
→ Decisions are written down the moment they are made.
→ Walkthroughs became the default path, not the exception.

Consistency compounds faster than intensity. Every time.

If you're rebuilding this next quarter, I'd like to compare notes — what's your current cadence?

#CreatorOps #AsyncDesign #BuildInPublic`;

const LI_2 = `Our content calendar used to be a museum of good intentions.

Twelve drafts, zero shipped. Everything waiting on "one more review".

So we capped the queue at three posts per channel and made the fourth slot a remix of something that already worked.

→ Fewer approvals, faster loops.
→ Ship the smaller version first.
→ Let the receipts do the talking.

Boring systems win. Loud launches do not.

Steal the loop. Tell me what breaks.`;

const X_1 = `We cut onboarding by 40% by killing live design reviews.

Async video walkthroughs + written decisions = fewer meetings, faster sign-off.

The boring version of this post is the one that actually worked.`;

const X_2 = `A four-step loop you can run in a single afternoon:

1. Write the one-line outcome first.
2. Timebox the first pass to 25 minutes.
3. Share the rough version publicly.
4. Fix what breaks, not what might.

Save this for your next planning cycle.`;

const IG_1 = `Three posts a week beat twelve drafts every time.

Our queue used to be a museum of good intentions: everything waiting on one more review, nothing actually shipped.

→ One owner per artifact.
→ Decisions written down immediately.
→ Remix what already worked instead of starting from zero.

Boring systems win. Loud launches don't.

Which one of these would you fix first?

Link in bio for the full workflow.

.
.
.
#CreatorOps #ContentStrategy #SocialMediaManager #BuildInPublic #DesignOps`;

const TT_1 = `POV: you stopped scheduling meetings about your content calendar.

We capped the queue at 3 posts per channel. Shipping doubled.

• One owner per artifact
• Timebox the first pass to 25 minutes

Boring systems win.

#creatorops #contentstrategy #socialmediamanager #fyp`;

const YT_1 = `Our content queue was a museum of good intentions — until we capped it at three posts per channel.

In this Short: the exact weekly loop, the review we removed, and the metric that told us it worked.

Save this for your next planning cycle.

#CreatorOps #ContentStrategy #Shorts`;

export const seedPosts: Post[] = [
  draftSeed({
    id: 'p-01',
    title: 'We cut onboarding by 40% with async reviews',
    idea: 'We cut onboarding time by 40% by replacing live design reviews with async video walkthroughs.',
    tone: 'thought-leader',
    master: LI_1,
    overrides: { linkedin: LI_1, x: X_1, instagram: IG_1, tiktok: TT_1, youtube: YT_1 },
    platforms: ['linkedin', 'x', 'instagram'],
    mediaId: 'm-ridge',
    aspect: '16:9',
    focal: { x: 58, y: 42 },
    status: 'scheduled',
    scheduledAt: at(1, 10, 30),
    peak: { label: 'Tue 10:30 AM', match: 94, time: 'Tue 10:30 AM' },
  }),
  draftSeed({
    id: 'p-02',
    title: 'The three-post queue rule',
    idea: 'Why we capped our content queue at three posts per channel.',
    tone: 'punchy',
    master: LI_2,
    overrides: { linkedin: LI_2, x: X_2, instagram: IG_1 },
    platforms: ['linkedin', 'instagram', 'tiktok'],
    mediaId: 'm-studio',
    aspect: '4:5',
    focal: { x: 50, y: 40 },
    status: 'scheduled',
    scheduledAt: at(2, 19, 0),
    peak: { label: 'Wed 7:00 PM', match: 96, time: 'Wed 7:00 PM' },
  }),
  draftSeed({
    id: 'p-03',
    title: 'Async design review template',
    idea: 'The async design review template our whole team now uses.',
    tone: 'educational',
    master: `A four-step async review system that survives a busy quarter:

1. Record a 5-minute walkthrough of the decision.
2. Write the open questions directly under the video.
3. Reviewers respond in writing within 24 hours.
4. The owner ships the decision, not the compromise.

The system is the deliverable. The result is just proof.

Save this for your next planning cycle — which step would you change?`,
    overrides: {
      linkedin:
        'A four-step async review system that survives a busy quarter:\n\n1. Record a 5-minute walkthrough of the decision.\n2. Write the open questions directly under the video.\n3. Reviewers respond in writing within 24 hours.\n4. The owner ships the decision, not the compromise.\n\nThe system is the deliverable. The result is just proof.',
      x: 'A four-step async review loop you can run tomorrow:\n\n1. Record 5 minutes, not 50.\n2. Put questions under the video.\n3. Written responses in 24h.\n4. The owner decides.\n\nThe system is the deliverable.',
      instagram:
        'The async review loop that survives a busy quarter 📐\n\nRecord five minutes. Ask questions in writing. Decide in 24 hours.\n\nThe system is the deliverable.',
    },
    platforms: ['linkedin', 'x', 'instagram', 'youtube'],
    mediaId: 'm-city',
    aspect: '1:1',
    focal: { x: 44, y: 52 },
    status: 'pending',
    scheduledAt: at(3, 9, 0),
    peak: { label: 'Thu 9:00 AM', match: 91, time: 'Thu 9:00 AM' },
  }),
  draftSeed({
    id: 'p-04',
    title: 'Rebrand, without the relaunch theatre',
    idea: 'What we learned running a rebrand without a big relaunch moment.',
    tone: 'witty',
    master: 'We rebranded in six weeks and told almost nobody.\n\nNo countdown. No manifesto video. No "chapter two" deck.\n\nJust a quieter, sharper product and a note to the people who already cared.\n\nTurns out the secret is doing the thing. Annoying, I know.',
    platforms: ['linkedin', 'x'],
    mediaId: 'm-studio',
    aspect: '16:9',
    focal: { x: 52, y: 44 },
    status: 'pending',
    scheduledAt: at(4, 8, 15),
    peak: { label: 'Wed 8:15 AM', match: 89, time: 'Wed 8:15 AM' },
  }),
  draftSeed({
    id: 'p-05',
    title: 'Behind the studio lighting setup',
    idea: 'A look behind our studio lighting setup and why we changed it.',
    tone: 'educational',
    master: 'Three lights, one reflector, and a lot of tape.\n\nOur whole studio setup fits in the back of a car — and it out-performs the rented space we used last year.\n\nHere is the exact layout:',
    platforms: ['instagram', 'tiktok', 'youtube'],
    mediaId: 'm-studio',
    aspect: '9:16',
    focal: { x: 50, y: 38 },
    status: 'draft',
    caption: {
      enabled: true,
      text: 'One light in front. One behind. That is the whole trick.',
      style: 'hormozi',
      size: 24,
      position: 72,
    },
  }),
  draftSeed({
    id: 'p-06',
    title: 'Prompts we actually use every week',
    idea: 'The three AI prompts we actually use every single week.',
    tone: 'punchy',
    master: 'Three prompts. Every week. No prompt library required.\n\n→ Rewrite this for a skeptical operator.\n→ Cut 30% and keep the sharpest line.\n→ Turn this into a five-part thread with proof.\n\nSteal them.',
    platforms: ['x', 'tiktok', 'youtube'],
    mediaId: 'm-ridge',
    aspect: '9:16',
    focal: { x: 62, y: 40 },
    status: 'draft',
  }),
  draftSeed({
    id: 'p-07',
    title: 'We killed our weekly status meeting',
    idea: 'We replaced our weekly status meeting with a written async update.',
    tone: 'thought-leader',
    master:
      'We killed our weekly status meeting and replaced it with a 200-word written update.\n\nNobody missed it. Not one person.\n\n→ One owner per artifact.\n→ Decisions written down the moment they happen.\n→ The update became the default, not the exception.\n\nConsistency compounds faster than intensity.',
    platforms: ['linkedin', 'x'],
    mediaId: 'm-city',
    aspect: '16:9',
    status: 'published',
    publishedAt: at(-2, 10, 30),
    metrics: { impressions: 184_300, engagement: 6.4, likes: 9_420, comments: 612, shares: 1_284 },
    evergreen: true,
  }),
  draftSeed({
    id: 'p-08',
    title: 'Onboarding in fourteen minutes',
    idea: 'How we got activation down to fourteen minutes.',
    tone: 'educational',
    master: 'Our activation flow went from 41 minutes to 14.\n\nWe deleted four screens, not added two.',
    platforms: ['linkedin', 'instagram', 'x'],
    mediaId: 'm-studio',
    aspect: '4:5',
    status: 'published',
    publishedAt: at(-4, 19, 0),
    metrics: { impressions: 96_400, engagement: 5.1, likes: 4_210, comments: 288, shares: 540 },
  }),
  draftSeed({
    id: 'p-09',
    title: 'The carousel that broke our record',
    idea: 'The nine-slide carousel that became our best performing post.',
    tone: 'witty',
    master: 'Nine slides. Zero charts. One very stubborn opinion about content calendars.',
    platforms: ['instagram', 'linkedin'],
    mediaId: 'm-ridge',
    aspect: '4:5',
    status: 'published',
    publishedAt: at(-7, 19, 30),
    metrics: { impressions: 142_800, engagement: 8.2, likes: 11_980, comments: 742, shares: 2_106 },
    evergreen: true,
  }),
  draftSeed({
    id: 'p-10',
    title: 'Your content calendar is too full',
    idea: 'Hot take: your content calendar is too full to be good.',
    tone: 'punchy',
    master: 'Hot take: your content calendar is too full to be good.\n\nTwelve drafts. Zero shipped. Everything waiting on one more review.',
    platforms: ['x'],
    mediaId: 'm-city',
    aspect: '16:9',
    status: 'published',
    publishedAt: at(-9, 9, 0),
    metrics: { impressions: 78_900, engagement: 7.3, likes: 5_140, comments: 410, shares: 892 },
  }),
  draftSeed({
    id: 'p-11',
    title: 'Q3 analytics teardown',
    idea: 'A teardown of what actually drove reach in Q3.',
    tone: 'educational',
    master: 'We pulled every Q3 post into one sheet. Three patterns explained 71% of reach.',
    platforms: ['linkedin', 'x', 'youtube'],
    mediaId: 'm-studio',
    aspect: '1:1',
    status: 'published',
    publishedAt: at(-13, 11, 30),
    metrics: { impressions: 51_200, engagement: 4.4, likes: 2_180, comments: 164, shares: 302 },
  }),
  draftSeed({
    id: 'p-12',
    title: 'How we run async demos',
    idea: 'The async demo format our sales team uses on every call.',
    tone: 'thought-leader',
    master: 'Every demo at Northwind is 6 minutes, recorded, and captioned.\n\nClose rate went up 12%.',
    platforms: ['linkedin', 'instagram'],
    mediaId: 'm-ridge',
    aspect: '4:5',
    status: 'published',
    publishedAt: at(-17, 16, 45),
    metrics: { impressions: 63_100, engagement: 5.6, likes: 3_402, comments: 244, shares: 618 },
  }),
  draftSeed({
    id: 'p-13',
    title: '5 hooks that stopped the scroll',
    idea: 'Five hooks that consistently stop the scroll on short form.',
    tone: 'punchy',
    master: 'Five hooks. Tested across 42 posts. These are the ones that held attention past 3 seconds.',
    platforms: ['tiktok', 'youtube', 'instagram'],
    mediaId: 'm-city',
    aspect: '9:16',
    status: 'published',
    publishedAt: at(-21, 20, 30),
    metrics: { impressions: 210_400, engagement: 9.1, likes: 18_240, comments: 1_102, shares: 3_488 },
  }),
  draftSeed({
    id: 'p-14',
    title: 'What we learned shipping 42 posts',
    idea: 'Everything we learned shipping 42 posts in one quarter.',
    tone: 'witty',
    master: '42 posts in 90 days. The only thing that scaled was the template.',
    platforms: ['linkedin', 'x'],
    mediaId: 'm-studio',
    aspect: '16:9',
    status: 'published',
    publishedAt: at(-28, 8, 15),
    metrics: { impressions: 88_600, engagement: 6.0, likes: 4_820, comments: 356, shares: 744 },
  }),
];

export const initialDraft: Post = draftSeed({
  id: 'draft-active',
  title: 'Our content queue used to be a museum of good intentions',
  idea: 'We capped our content queue at three posts per channel and shipping doubled.',
  tone: 'thought-leader',
  master: `Our content queue used to be a museum of good intentions.

Twelve drafts, zero shipped. Everything waiting on "one more review".

So we capped the queue at three posts per channel and made the fourth slot a remix of something that already worked.

→ Fewer approvals, faster loops.
→ Ship the smaller version first.
→ Let the receipts do the talking.

Boring systems win. Loud launches do not.

Steal the loop. Tell me what breaks.`,
  overrides: {
    linkedin: `Our content queue used to be a museum of good intentions.

Twelve drafts, zero shipped. Everything waiting on "one more review".

So we capped the queue at three posts per channel and made the fourth slot a remix of something that already worked.

→ Fewer approvals, faster loops.
→ Ship the smaller version first.
→ Let the receipts do the talking.

Boring systems win. Loud launches do not.

Steal the loop. Tell me what breaks.

#CreatorOps #ContentStrategy #BuildInPublic`,
    x: `Our content queue was a museum of good intentions.

Twelve drafts. Zero shipped. Everything waiting on "one more review".

We capped it at 3 per channel. Shipping doubled.

The boring version is the one that worked.`,
    instagram: `Three posts a week beat twelve drafts every time.

→ One owner per artifact.
→ Decisions written down immediately.
→ Remix what already worked instead of starting from zero.

Boring systems win. Which would you fix first?

Link in bio for the full workflow.

.
.
.
#CreatorOps #ContentStrategy #BuildInPublic`,
    tiktok: `POV: you capped your content queue at 3 posts per channel.

Shipping doubled. Meetings didn't.

#creatorops #contentstrategy #fyp`,
  },
  hashtags: ['#CreatorOps', '#ContentStrategy', '#BuildInPublic', '#SocialOps'],
  mediaId: 'm-ridge',
  aspect: '4:5',
  focal: { x: 58, y: 42 },
  platforms: ['linkedin', 'x', 'instagram', 'tiktok', 'youtube'],
  status: 'draft',
});

export const defaultAccounts = [
  {
    id: 'linkedin' as PlatformId,
    name: 'Northwind Studio',
    handle: '@northwind-studio',
    followers: 48_200,
    connected: true,
    growth: 6.4,
    lastSync: '2 min ago',
  },
  {
    id: 'x' as PlatformId,
    name: 'Northwind',
    handle: '@northwindhq',
    followers: 21_940,
    connected: true,
    growth: 3.1,
    lastSync: '5 min ago',
  },
  {
    id: 'instagram' as PlatformId,
    name: 'northwind.studio',
    handle: '@northwind.studio',
    followers: 67_300,
    connected: true,
    growth: 9.2,
    lastSync: '1 min ago',
  },
  {
    id: 'tiktok' as PlatformId,
    name: 'northwindstudio',
    handle: '@northwindstudio',
    followers: 112_800,
    connected: true,
    growth: 18.7,
    lastSync: '8 min ago',
  },
  {
    id: 'youtube' as PlatformId,
    name: 'Northwind Studio',
    handle: '@northwindstudio',
    followers: 34_600,
    connected: false,
    growth: 2.4,
    lastSync: 'Not connected',
  },
];

const now = Date.now();

export const seedConversations: Conversation[] = [
  {
    id: 'c-1',
    platform: 'linkedin',
    kind: 'comment',
    senderName: 'Priya Raghavan',
    senderHandle: 'VP Marketing · Northwind rival',
    initials: 'PR',
    avatarTone: 'from-sky-400 to-blue-600',
    bio: 'VP Marketing at Latchline. Building a content team of four, obsessed with reusable systems.',
    followers: 18_400,
    location: 'Austin, TX',
    memberSince: 'Mar 2021',
    unread: true,
    pinned: true,
    postTitle: 'We killed our weekly status meeting',
    postExcerpt: 'We killed our weekly status meeting and replaced it with a 200-word written update…',
    status: 'open',
    labels: ['High intent', 'Template request'],
    sentiment: 'question',
    timeAgo: '12m',
    messages: [
      {
        id: 'c1-m1',
        from: 'them',
        text: `This is the exact problem we're stuck on. Our weekly review has become a status meeting with better branding. How did you structure the written update so people actually read it?`,
        at: 'Mon 09:12',
      },
      {
        id: 'c1-m2',
        from: 'me',
        text: `It's three headings and a hard 200-word cap: decided, changed, blocked. No preamble, no status-by-status.`,
        at: 'Mon 09:26',
      },
      {
        id: 'c1-m3',
        from: 'them',
        text: `That's helpful — do you have the template you could share?`,
        at: 'Mon 09:41',
      },
    ],
  },
  {
    id: 'c-2',
    platform: 'instagram',
    kind: 'dm',
    senderName: 'Sofia Marchetti',
    senderHandle: '@sofia.builds',
    initials: 'SM',
    avatarTone: 'from-fuchsia-400 to-pink-600',
    bio: 'Founder of a two-person design studio in Milan. Runs Instagram as the main funnel.',
    followers: 9_120,
    location: 'Milan, IT',
    memberSince: 'Jan 2022',
    unread: true,
    pinned: false,
    postTitle: 'The three-post queue rule',
    postExcerpt: 'Three posts a week beat twelve drafts every time…',
    status: 'open',
    labels: ['Pricing', 'SMB'],
    sentiment: 'question',
    timeAgo: '48m',
    messages: [
      {
        id: 'c2-m1',
        from: 'them',
        text: `Ciao! We're a studio of two and this looks like exactly what we need. What does pricing look like for two seats?`,
        at: 'Mon 08:56',
      },
    ],
  },
  {
    id: 'c-3',
    platform: 'x',
    kind: 'mention',
    senderName: 'Leo Vance',
    senderHandle: '@dev_leo',
    initials: 'LV',
    avatarTone: 'from-emerald-400 to-teal-600',
    bio: 'Staff engineer. Writes about developer experience and ships in public.',
    followers: 24_800,
    location: 'Berlin, DE',
    memberSince: 'Sep 2019',
    unread: false,
    pinned: false,
    postTitle: '5 hooks that stopped the scroll',
    postExcerpt: 'Five hooks. Tested across 42 posts…',
    status: 'open',
    labels: ['Advocate'],
    sentiment: 'positive',
    timeAgo: '2h',
    messages: [
      {
        id: 'c3-m1',
        from: 'them',
        text: `@northwindhq this thread is the most practical thing I've read on content ops all quarter. The "one owner per artifact" rule is criminally underrated.`,
        at: 'Mon 07:33',
      },
      {
        id: 'c3-m2',
        from: 'me',
        text: `Appreciate that, Leo — it came from getting it wrong for about six months first.`,
        at: 'Mon 07:48',
      },
      {
        id: 'c3-m3',
        from: 'them',
        text: `Any chance you're writing up the full system? Would happily share it with my team.`,
        at: 'Mon 08:02',
      },
    ],
  },
  {
    id: 'c-4',
    platform: 'tiktok',
    kind: 'comment',
    senderName: 'Gia Moreno',
    senderHandle: '@growthwithgia',
    initials: 'GM',
    avatarTone: 'from-rose-400 to-orange-500',
    bio: 'Growth creator. 180K followers across short-form. Reviews tools for operators.',
    followers: 186_000,
    location: 'Los Angeles, CA',
    memberSince: 'Jun 2020',
    unread: true,
    pinned: false,
    postTitle: '5 hooks that stopped the scroll',
    postExcerpt: 'POV: you capped your content queue at 3 posts per channel…',
    status: 'open',
    labels: ['Creator', 'Collab'],
    sentiment: 'positive',
    timeAgo: '3h',
    messages: [
      {
        id: 'c4-m1',
        from: 'them',
        text: `The 3-second hook breakdown is unreal. Would you be open to doing a duet series on this? I think our audiences overlap hard.`,
        at: 'Sun 22:14',
      },
    ],
  },
  {
    id: 'c-5',
    platform: 'linkedin',
    kind: 'dm',
    senderName: 'Marcus Bell',
    senderHandle: 'Head of Content · Meridian',
    initials: 'MB',
    avatarTone: 'from-amber-400 to-yellow-600',
    bio: 'Runs content for a 40-person B2B SaaS. Evaluating tools for a Q1 rollout.',
    followers: 31_200,
    location: 'London, UK',
    memberSince: 'Nov 2018',
    unread: false,
    pinned: true,
    postTitle: 'Async design review template',
    postExcerpt: 'A four-step async review system that survives a busy quarter…',
    status: 'open',
    labels: ['Enterprise', 'Demo booked'],
    sentiment: 'question',
    timeAgo: '5h',
    messages: [
      {
        id: 'c5-m1',
        from: 'them',
        text: `We're looking at three tools for Q1. The multi-channel preview is the piece our team keeps asking for — can you support five brands in one workspace?`,
        at: 'Sun 16:40',
      },
      {
        id: 'c5-m2',
        from: 'me',
        text: `Yes — workspaces are unlimited, brand voices are per-brand, and approvals can be scoped to a client. Happy to show you on Thursday.`,
        at: 'Sun 17:02',
      },
      {
        id: 'c5-m3',
        from: 'them',
        text: `Thursday works. Send the invite and I'll bring our content lead.`,
        at: 'Sun 17:20',
      },
    ],
  },
  {
    id: 'c-6',
    platform: 'youtube',
    kind: 'comment',
    senderName: 'Dara Okafor',
    senderHandle: '@darabuilds',
    initials: 'DO',
    avatarTone: 'from-violet-400 to-indigo-600',
    bio: 'Product designer learning content ops in public. Watches every Shorts teardown.',
    followers: 3_400,
    location: 'Toronto, CA',
    memberSince: 'Feb 2023',
    unread: false,
    pinned: false,
    postTitle: 'The carousel that broke our record',
    postExcerpt: 'Nine slides. Zero charts. One very stubborn opinion…',
    status: 'resolved',
    labels: ['Answered'],
    sentiment: 'positive',
    timeAgo: '1d',
    messages: [
      {
        id: 'c6-m1',
        from: 'them',
        text: `The part about remixing instead of starting fresh is such a good reframe. How do you decide which post is worth remixing?`,
        at: 'Sun 11:08',
      },
      {
        id: 'c6-m2',
        from: 'me',
        text: `Anything above 1.5x your median engagement for two consecutive posts. We keep an evergreen shelf and remix the top three each month.`,
        at: 'Sun 11:41',
      },
      {
        id: 'c6-m3',
        from: 'them',
        text: `That's a great rule. Thank you!`,
        at: 'Sun 11:52',
      },
    ],
  },
  {
    id: 'c-7',
    platform: 'instagram',
    kind: 'mention',
    senderName: 'Studio North',
    senderHandle: '@studio.north',
    initials: 'SN',
    avatarTone: 'from-cyan-400 to-sky-600',
    bio: 'Independent brand studio. Reposts the work they wish they had made.',
    followers: 41_700,
    location: 'Copenhagen, DK',
    memberSince: 'Apr 2020',
    unread: true,
    pinned: false,
    postTitle: 'Behind the studio lighting setup',
    postExcerpt: 'Three lights, one reflector, and a lot of tape…',
    status: 'open',
    labels: ['UGC', 'Brand'],
    sentiment: 'positive',
    timeAgo: '1d',
    messages: [
      {
        id: 'c7-m1',
        from: 'them',
        text: `We featured your lighting breakdown in our stories today — the DIY tape rig is doing numbers 😄 Would you be up for a joint live session?`,
        at: 'Sun 09:22',
      },
    ],
  },
];

export const TONE_OPTIONS_DEFAULT: Tone = 'thought-leader';
export const seededNow = now;
