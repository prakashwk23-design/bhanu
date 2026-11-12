import type {
  Account,
  CaptionConfig,
  Conversation,
  InboxKind,
  Message,
  PlatformId,
  Post,
  PostMetrics,
  Tone,
  WorkflowStatus,
} from '../src/lib/types';
import type { Env } from './env';

export interface PostRow {
  id: string;
  title: string;
  master_prompt: string;
  master_copy: string;
  tone: string;
  status: string;
  scheduled_for: string | null;
  published_at: string | null;
  first_comment: string | null;
  media_id: string | null;
  media_url: string | null;
  aspect_ratio: string | null;
  focal_x: number;
  focal_y: number;
  carousel: number;
  captions_json: string | null;
  hashtags_json: string | null;
  platforms_json: string | null;
  metrics_json: string | null;
  peak_json: string | null;
  evergreen: number;
  created_at: string;
  updated_at: string;
}

export interface VariantRow {
  id: string;
  post_id: string;
  platform: string;
  content: string;
  hashtags: string | null;
  aspect_ratio: string | null;
  focal_x: number | null;
  focal_y: number | null;
  media_url: string | null;
  captions_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountRow {
  id: string;
  platform: string;
  name: string;
  handle: string;
  status: string;
  avatar_url: string | null;
  followers: number;
  growth: number;
  last_sync_at: string | null;
}

export interface ThreadRow {
  id: string;
  platform: string;
  kind: string;
  sender_name: string;
  sender_handle: string;
  initials: string | null;
  avatar_tone: string | null;
  bio: string | null;
  followers: number;
  location: string | null;
  member_since: string | null;
  post_title: string | null;
  post_excerpt: string | null;
  labels_json: string | null;
  status: string;
  sentiment: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  thread_id: string;
  platform: string;
  sender_name: string;
  sender_handle: string;
  message_type: string;
  content: string;
  is_read: number;
  direction: string;
  created_at: string;
}

export const DEFAULT_CAPTION: CaptionConfig = {
  enabled: false,
  text: '',
  style: 'hormozi',
  size: 26,
  position: 74,
};

const PLATFORMS: PlatformId[] = ['linkedin', 'x', 'instagram', 'tiktok', 'youtube'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function asPlatform(value: string): PlatformId {
  return PLATFORMS.includes(value as PlatformId) ? (value as PlatformId) : 'linkedin';
}

function asTone(value: string): Tone {
  return ['thought-leader', 'punchy', 'educational', 'witty'].includes(value) ? (value as Tone) : 'thought-leader';
}

function asStatus(value: string): WorkflowStatus {
  return ['draft', 'pending', 'scheduled', 'published'].includes(value)
    ? (value as WorkflowStatus)
    : 'draft';
}

export function mapPost(row: PostRow, variants: VariantRow[]): Post {
  const platforms = parseJson<PlatformId[]>(row.platforms_json, variants.map((v) => asPlatform(v.platform)));
  const overrides: Partial<Record<PlatformId, string>> = {};
  for (const variant of variants) overrides[asPlatform(variant.platform)] = variant.content;
  const caption = { ...DEFAULT_CAPTION, ...parseJson<Partial<CaptionConfig>>(row.captions_json, {}) };

  return {
    id: row.id,
    title: row.title,
    idea: row.master_prompt,
    tone: asTone(row.tone),
    master: row.master_copy,
    overrides,
    hashtags: parseJson<string[]>(row.hashtags_json, []),
    firstComment: Boolean(row.first_comment),
    firstCommentText: row.first_comment ?? '',
    platforms: platforms.length ? platforms : [...PLATFORMS],
    mediaId: row.media_id ?? 'm-city',
    aspect: (row.aspect_ratio as Post['aspect']) ?? '4:5',
    focal: { x: row.focal_x ?? 50, y: row.focal_y ?? 50 },
    carousel: Boolean(row.carousel),
    caption,
    status: asStatus(row.status),
    scheduledAt: row.scheduled_for,
    publishedAt: row.published_at,
    metrics: parseJson<PostMetrics | undefined>(row.metrics_json, undefined),
    evergreen: Boolean(row.evergreen),
    peak: parseJson<Post['peak']>(row.peak_json, undefined),
    mediaUrl: row.media_url ?? undefined,
  };
}

export function mapAccount(row: AccountRow): Account {
  return {
    id: asPlatform(row.platform),
    name: row.name,
    handle: row.handle,
    followers: row.followers,
    connected: row.status === 'connected',
    growth: row.growth,
    lastSync: row.last_sync_at ?? (row.status === 'connected' ? 'Connected' : 'Not connected'),
  };
}

export function formatMessageAt(iso: string): string {
  const date = new Date(iso);
  const hours = date.getUTCHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${DAY_LABELS[date.getUTCDay()]} ${hour}:${String(date.getUTCMinutes()).padStart(2, '0')} ${suffix}`;
}

export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  if (diff < 60_000) return 'Just now';
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return 'Last week';
}

export function mapConversation(thread: ThreadRow, rows: MessageRow[]): Conversation {
  const sorted = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const messages: Message[] = sorted.map((message) => ({
    id: message.id,
    from: message.direction === 'out' ? 'me' : 'them',
    text: message.content,
    at: formatMessageAt(message.created_at),
  }));
  const latest = sorted.at(-1)?.created_at ?? thread.updated_at;
  const initials =
    thread.initials ||
    thread.sender_name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return {
    id: thread.id,
    platform: asPlatform(thread.platform),
    kind: thread.kind as InboxKind,
    senderName: thread.sender_name,
    senderHandle: thread.sender_handle,
    initials,
    avatarTone: thread.avatar_tone ?? 'from-indigo-500 to-violet-500',
    bio: thread.bio ?? '',
    followers: thread.followers,
    location: thread.location ?? '',
    memberSince: thread.member_since ?? '',
    messages,
    unread: sorted.some((m) => m.direction === 'in' && !m.is_read),
    pinned: false,
    postTitle: thread.post_title ?? '',
    postExcerpt: thread.post_excerpt ?? '',
    status: thread.status === 'resolved' ? 'resolved' : 'open',
    labels: parseJson<string[]>(thread.labels_json, []),
    sentiment: (thread.sentiment as Conversation['sentiment']) ?? 'neutral',
    timeAgo: timeAgo(latest),
  };
}

export async function listAccounts(db: D1Database): Promise<Account[]> {
  const { results } = await db
    .prepare('SELECT * FROM social_accounts ORDER BY rowid ASC')
    .all<AccountRow>();
  return results.map(mapAccount);
}

export async function listPosts(db: D1Database): Promise<Post[]> {
  const [{ results: posts }, { results: variants }] = await Promise.all([
    db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all<PostRow>(),
    db.prepare('SELECT * FROM post_variants').all<VariantRow>(),
  ]);
  const byPost = new Map<string, VariantRow[]>();
  for (const variant of variants) {
    const list = byPost.get(variant.post_id) ?? [];
    list.push(variant);
    byPost.set(variant.post_id, list);
  }
  return posts.map((row) => mapPost(row, byPost.get(row.id) ?? []));
}

export async function getPost(db: D1Database, id: string): Promise<Post | null> {
  const row = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first<PostRow>();
  if (!row) return null;
  const { results } = await db
    .prepare('SELECT * FROM post_variants WHERE post_id = ?')
    .bind(id)
    .all<VariantRow>();
  return mapPost(row, results);
}

export async function listConversations(db: D1Database): Promise<Conversation[]> {
  const [{ results: threads }, { results: messages }] = await Promise.all([
    db.prepare('SELECT * FROM inbox_threads ORDER BY updated_at DESC').all<ThreadRow>(),
    db.prepare('SELECT * FROM inbox_messages ORDER BY created_at ASC').all<MessageRow>(),
  ]);
  const byThread = new Map<string, MessageRow[]>();
  for (const message of messages) {
    const list = byThread.get(message.thread_id) ?? [];
    list.push(message);
    byThread.set(message.thread_id, list);
  }
  return threads.map((thread) => mapConversation(thread, byThread.get(thread.id) ?? []));
}

export async function upsertPost(db: D1Database, post: Post): Promise<Post> {
  const now = new Date().toISOString();
  const platforms = post.platforms.length ? post.platforms : (['linkedin'] as PlatformId[]);
  const createdAt = post.publishedAt ?? now;

  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        `INSERT INTO posts
          (id, title, master_prompt, master_copy, tone, status, scheduled_for, published_at, first_comment,
           media_id, media_url, aspect_ratio, focal_x, focal_y, carousel, captions_json, hashtags_json,
           platforms_json, metrics_json, peak_json, evergreen, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title, master_prompt = excluded.master_prompt, master_copy = excluded.master_copy,
           tone = excluded.tone, status = excluded.status, scheduled_for = excluded.scheduled_for,
           published_at = excluded.published_at, first_comment = excluded.first_comment,
           media_id = excluded.media_id, media_url = excluded.media_url, aspect_ratio = excluded.aspect_ratio,
           focal_x = excluded.focal_x, focal_y = excluded.focal_y, carousel = excluded.carousel,
           captions_json = excluded.captions_json, hashtags_json = excluded.hashtags_json,
           platforms_json = excluded.platforms_json, metrics_json = excluded.metrics_json,
           peak_json = excluded.peak_json, evergreen = excluded.evergreen, updated_at = excluded.updated_at`,
      )
      .bind(
        post.id,
        post.title,
        post.idea || post.master,
        post.master,
        post.tone,
        post.status,
        post.scheduledAt,
        post.publishedAt ?? null,
        post.firstComment ? post.firstCommentText : null,
        post.mediaId ?? null,
        post.mediaUrl ?? null,
        post.aspect,
        post.focal.x,
        post.focal.y,
        post.carousel ? 1 : 0,
        JSON.stringify(post.caption ?? DEFAULT_CAPTION),
        JSON.stringify(post.hashtags ?? []),
        JSON.stringify(platforms),
        post.metrics ? JSON.stringify(post.metrics) : null,
        post.peak ? JSON.stringify(post.peak) : null,
        post.evergreen ? 1 : 0,
        createdAt,
        now,
      ),
    db.prepare('DELETE FROM post_variants WHERE post_id = ?').bind(post.id),
  ];

  for (const platform of platforms) {
    statements.push(
      db
        .prepare(
          `INSERT INTO post_variants
            (id, post_id, platform, content, hashtags, aspect_ratio, focal_x, focal_y, media_url, captions_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          `${post.id}:${platform}`,
          post.id,
          platform,
          post.overrides[platform] ?? post.master,
          (post.hashtags ?? []).join(' '),
          post.aspect,
          post.focal.x,
          post.focal.y,
          post.mediaUrl ?? null,
          JSON.stringify(post.caption ?? DEFAULT_CAPTION),
          createdAt,
          now,
        ),
    );
  }

  await db.batch(statements);
  const saved = await getPost(db, post.id);
  if (!saved) throw new Error('Post was not saved');
  return saved;
}

export async function patchPost(db: D1Database, id: string, patch: Partial<Post>): Promise<Post | null> {
  const existing = await getPost(db, id);
  if (!existing) return null;
  const merged: Post = {
    ...existing,
    ...patch,
    id: existing.id,
    focal: patch.focal ?? existing.focal,
    caption: patch.caption ?? existing.caption,
    platforms: patch.platforms ?? existing.platforms,
    overrides: patch.overrides ?? existing.overrides,
    publishedAt:
      patch.status === 'published' && !patch.publishedAt ? new Date().toISOString() : (patch.publishedAt ?? existing.publishedAt),
  };
  return upsertPost(db, merged);
}

export async function setAccountStatus(db: D1Database, platform: string, connected: boolean): Promise<void> {
  await db
    .prepare('UPDATE social_accounts SET status = ?, last_sync_at = ? WHERE platform = ?')
    .bind(connected ? 'connected' : 'disconnected', connected ? 'Just now' : 'Not connected', platform)
    .run();
}

export async function markThreadRead(db: D1Database, threadId: string): Promise<void> {
  await db.prepare('UPDATE inbox_messages SET is_read = 1 WHERE thread_id = ?').bind(threadId).run();
}

export async function markAllRead(db: D1Database): Promise<void> {
  await db.prepare('UPDATE inbox_messages SET is_read = 1').run();
}

export async function addReply(
  db: D1Database,
  threadId: string,
  content: string,
): Promise<{ id: string; from: 'me'; text: string; at: string } | null> {
  const thread = await db.prepare('SELECT * FROM inbox_threads WHERE id = ?').bind(threadId).first<ThreadRow>();
  if (!thread) return null;
  const now = new Date().toISOString();
  const id = `msg-${crypto.randomUUID()}`;
  await db.batch([
    db
      .prepare(
        `INSERT INTO inbox_messages
          (id, thread_id, platform, sender_name, sender_handle, message_type, content, is_read, direction, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'out', ?)`,
      )
      .bind(id, threadId, thread.platform, 'Avery Reid', '@northwind-studio', thread.kind, content, now),
    db.prepare("UPDATE inbox_messages SET is_read = 1 WHERE thread_id = ? AND direction = 'in'").bind(threadId),
    db.prepare('UPDATE inbox_threads SET updated_at = ? WHERE id = ?').bind(now, threadId),
  ]);
  return { id, from: 'me', text: content, at: formatMessageAt(now) };
}

export async function patchThread(
  db: D1Database,
  threadId: string,
  patch: { status?: 'open' | 'resolved'; label?: string },
): Promise<void> {
  const thread = await db
    .prepare('SELECT * FROM inbox_threads WHERE id = ?')
    .bind(threadId)
    .first<ThreadRow>();
  if (!thread) return;
  const labels = parseJson<string[]>(thread.labels_json, []);
  if (patch.label && !labels.includes(patch.label)) labels.push(patch.label);
  await db
    .prepare('UPDATE inbox_threads SET labels_json = ?, status = ?, updated_at = ? WHERE id = ?')
    .bind(
      JSON.stringify(labels),
      patch.status ?? thread.status,
      new Date().toISOString(),
      threadId,
    )
    .run();
}

export async function saveTranscription(
  db: D1Database,
  assetId: string,
  wordsJson: string,
  srt: string,
  language: string | null,
  provider: string | null,
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO transcriptions (id, asset_id, language, provider, srt, words_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(asset_id) DO UPDATE SET
         language = excluded.language, provider = excluded.provider, srt = excluded.srt,
         words_json = excluded.words_json, updated_at = excluded.updated_at`,
    )
    .bind(`tr:${assetId}`, assetId, language, provider, srt, wordsJson, now, now)
    .run();
}

export async function getTranscription(db: D1Database, assetId: string) {
  return db.prepare('SELECT * FROM transcriptions WHERE asset_id = ?').bind(assetId).first();
}

export function wordsToSrt(words: { word: string; start: number; end: number }[]): string {
  const stamp = (seconds: number) => {
    const ms = Math.max(0, Math.round(seconds * 1000));
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const rest = ms % 1000;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(rest).padStart(3, '0')}`;
  };
  return words
    .map((word, index) => `${index + 1}\n${stamp(word.start)} --> ${stamp(word.end)}\n${word.word}\n`)
    .join('\n');
}

export async function dbHealth(env: Env): Promise<boolean> {
  try {
    await env.DB.prepare('SELECT 1').first();
    return true;
  } catch {
    return false;
  }
}
