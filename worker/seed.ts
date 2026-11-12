import { defaultAccounts, seedConversations, seedPosts } from '../src/lib/mockData';
import type { PlatformId } from '../src/lib/types';
import type { Env } from './env';

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

/** Seeds a fresh D1 database with the demo workspace. Idempotent. */
export async function seedIfEmpty(env: Env): Promise<boolean> {
  const db = env.DB;
  const counts = await db
    .prepare('SELECT (SELECT COUNT(*) FROM posts) AS posts, (SELECT COUNT(*) FROM inbox_threads) AS threads')
    .first<{ posts: number; threads: number }>();
  if (counts && counts.posts > 0) return false;

  const now = Date.now();
  const statements: D1PreparedStatement[] = [];

  for (const account of defaultAccounts) {
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO social_accounts
            (id, platform, name, handle, status, avatar_url, followers, growth, last_sync_at)
           VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
        )
        .bind(
          account.id,
          account.id,
          account.name,
          account.handle,
          account.connected ? 'connected' : 'disconnected',
          account.followers,
          account.growth,
          account.lastSync,
        ),
    );
  }

  seedPosts.forEach((post, index) => {
    const createdAt = post.publishedAt ?? post.scheduledAt ?? iso(-index * 86_400_000);
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO posts
            (id, title, master_prompt, master_copy, tone, status, scheduled_for, published_at, first_comment,
             media_id, media_url, aspect_ratio, focal_x, focal_y, carousel, captions_json, hashtags_json,
             platforms_json, metrics_json, peak_json, evergreen, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          post.mediaId,
          post.mediaUrl ?? null,
          post.aspect,
          post.focal.x,
          post.focal.y,
          post.carousel ? 1 : 0,
          JSON.stringify(post.caption),
          JSON.stringify(post.hashtags),
          JSON.stringify(post.platforms),
          post.metrics ? JSON.stringify(post.metrics) : null,
          post.peak ? JSON.stringify(post.peak) : null,
          post.evergreen ? 1 : 0,
          createdAt,
          iso(0),
        ),
    );

    for (const platform of post.platforms) {
      const content = post.overrides[platform] ?? post.master;
      statements.push(
        db
          .prepare(
            `INSERT OR IGNORE INTO post_variants
              (id, post_id, platform, content, hashtags, aspect_ratio, focal_x, focal_y, media_url, captions_json, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            `${post.id}:${platform}`,
            post.id,
            platform,
            content,
            post.hashtags.join(' '),
            post.aspect,
            post.focal.x,
            post.focal.y,
            post.mediaUrl ?? null,
            JSON.stringify(post.caption),
            createdAt,
            iso(0),
          ),
      );
    }
  });

  seedConversations.forEach((conversation, threadIndex) => {
    const base = now - (threadIndex + 1) * 3_600_000;
    const threadCreated = new Date(base - 6 * 3_600_000).toISOString();
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO inbox_threads
            (id, platform, kind, sender_name, sender_handle, initials, avatar_tone, bio, followers, location,
             member_since, post_title, post_excerpt, labels_json, status, sentiment, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          conversation.id,
          conversation.platform,
          conversation.kind,
          conversation.senderName,
          conversation.senderHandle,
          conversation.initials,
          conversation.avatarTone,
          conversation.bio,
          conversation.followers,
          conversation.location,
          conversation.memberSince,
          conversation.postTitle,
          conversation.postExcerpt,
          JSON.stringify(conversation.labels),
          conversation.status,
          conversation.sentiment,
          threadCreated,
          new Date(base + conversation.messages.length * 600_000).toISOString(),
        ),
    );

    conversation.messages.forEach((message, messageIndex) => {
      const isLastInbound =
        message.from === 'them' &&
        conversation.messages.slice(messageIndex + 1).every((m) => m.from !== 'them');
      const isRead = !conversation.unread || !isLastInbound;
      statements.push(
        db
          .prepare(
            `INSERT OR IGNORE INTO inbox_messages
              (id, thread_id, platform, sender_name, sender_handle, message_type, content, is_read, direction, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            message.id,
            conversation.id,
            conversation.platform,
            message.from === 'me' ? 'Avery Reid' : conversation.senderName,
            message.from === 'me' ? '@northwind-studio' : conversation.senderHandle,
            conversation.kind,
            message.text,
            isRead ? 1 : 0,
            message.from === 'me' ? 'out' : 'in',
            new Date(base + messageIndex * 600_000).toISOString(),
          ),
      );
    });
  });

  // D1 batch is transactional; keep chunks comfortably below statement limits.
  const chunkSize = 40;
  for (let i = 0; i < statements.length; i += chunkSize) {
    await db.batch(statements.slice(i, i + chunkSize));
  }

  return true;
}

export type { PlatformId };
