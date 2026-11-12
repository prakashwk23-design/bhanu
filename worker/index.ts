import { aiMeta, composeContent } from './ai';
import type { ComposeRequest } from '../src/lib/apiTypes';
import type { Post } from '../src/lib/types';
import {
  addReply,
  dbHealth,
  getTranscription,
  listAccounts,
  listConversations,
  listPosts,
  markAllRead,
  markThreadRead,
  patchPost,
  patchThread,
  saveTranscription,
  setAccountStatus,
  upsertPost,
  wordsToSrt,
} from './db';
import type { Env } from './env';
import { seedIfEmpty } from './seed';

const API_VERSION = '1.0.0';

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

function platformPath(value: string): string {
  return value.trim().toLowerCase();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    try {
      return await route(request, url, env);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status >= 500) console.error('api_error', error);
      return json(
        {
          error: error instanceof Error ? error.message : 'Internal error',
          ...(env.APP_ENV === 'development' && status >= 500
            ? { detail: error instanceof Error ? error.stack : String(error) }
            : {}),
        },
        status,
      );
    }
  },
};

async function route(request: Request, url: URL, env: Env): Promise<Response> {
  const segments = url.pathname.split('/').filter(Boolean).slice(1);
  const [resource, id, action] = segments;
  const method = request.method;

  if (resource === 'health' && method === 'GET') {
    const dbOk = await dbHealth(env);
    return json(
      { ok: dbOk, db: dbOk ? 'connected' : 'unavailable', ai: aiMeta(env), apiVersion: API_VERSION, time: new Date().toISOString() },
      dbOk ? 200 : 503,
    );
  }

  if (resource === 'bootstrap' && method === 'GET') {
    const seeded = await seedIfEmpty(env);
    const [accounts, posts, conversations] = await Promise.all([
      listAccounts(env.DB),
      listPosts(env.DB),
      listConversations(env.DB),
    ]);
    return json({
      accounts,
      posts,
      conversations,
      meta: { apiVersion: API_VERSION, seeded, ...aiMeta(env) },
    });
  }

  if (resource === 'accounts') {
    if (method === 'GET' && !id) return json({ accounts: await listAccounts(env.DB) });
    if (method === 'PATCH' && id) {
      const body = await readJson<{ connected?: boolean }>(request);
      if (typeof body.connected !== 'boolean') throw new HttpError(400, 'connected must be a boolean');
      await setAccountStatus(env.DB, platformPath(id), body.connected);
      return json({ ok: true, accounts: await listAccounts(env.DB) });
    }
  }

  if (resource === 'posts') {
    if (method === 'GET' && !id) return json({ posts: await listPosts(env.DB) });
    if (method === 'POST' && !id) {
      const body = await readJson<Post>(request);
      if (!body?.id || typeof body.id !== 'string') throw new HttpError(400, 'Post id is required');
      if (typeof body.master !== 'string') throw new HttpError(400, 'Post master copy is required');
      if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
        throw new HttpError(400, 'Post must target at least one platform');
      }
      const saved = await upsertPost(env.DB, body);
      return json({ post: saved }, 201);
    }
    if (method === 'PATCH' && id) {
      const body = await readJson<Partial<Post>>(request);
      const allowed: (keyof Post)[] = [
        'title', 'idea', 'tone', 'master', 'overrides', 'hashtags', 'firstComment', 'firstCommentText',
        'platforms', 'mediaId', 'aspect', 'focal', 'carousel', 'caption', 'status', 'scheduledAt',
        'publishedAt', 'metrics', 'evergreen', 'peak', 'mediaUrl',
      ];
      const patch: Partial<Post> = {};
      for (const key of allowed) {
        if (key in body) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (patch as Record<string, unknown>)[key] = (body as Record<string, unknown>)[key];
        }
      }
      const saved = await patchPost(env.DB, id, patch);
      if (!saved) throw new HttpError(404, 'Post not found');
      return json({ post: saved });
    }
  }

  if (resource === 'inbox') {
    if (method === 'GET' && !id) return json({ conversations: await listConversations(env.DB) });
    if (method === 'POST' && id === 'read-all') {
      await markAllRead(env.DB);
      return json({ ok: true });
    }
    if (method === 'POST' && id && action === 'read') {
      await markThreadRead(env.DB, id);
      return json({ ok: true });
    }
    if (method === 'POST' && id && action === 'reply') {
      const body = await readJson<{ content?: string }>(request);
      const content = body.content?.trim();
      if (!content) throw new HttpError(400, 'Reply content is required');
      if (content.length > 4000) throw new HttpError(400, 'Reply is too long');
      const message = await addReply(env.DB, id, content);
      if (!message) throw new HttpError(404, 'Conversation not found');
      return json({ ok: true, message }, 201);
    }
    if (method === 'PATCH' && id) {
      const body = await readJson<{ status?: 'open' | 'resolved'; label?: string }>(request);
      if (body.status && !['open', 'resolved'].includes(body.status)) {
        throw new HttpError(400, 'Invalid status');
      }
      await patchThread(env.DB, id, body);
      return json({ ok: true });
    }
  }

  if (resource === 'ai' && id === 'compose' && method === 'POST') {
    const body = await readJson<ComposeRequest>(request);
    if (!body?.idea || typeof body.idea !== 'string' || !body.idea.trim()) {
      throw new HttpError(400, 'idea is required');
    }
    if (body.idea.length > 4000) throw new HttpError(400, 'idea is too long');
    if (!body.tone || !['thought-leader', 'punchy', 'educational', 'witty'].includes(body.tone)) {
      throw new HttpError(400, 'tone must be one of thought-leader, punchy, educational, witty');
    }
    const brandVoice = body.brandVoice;
    if (!brandVoice || !Array.isArray(brandVoice.banned) || !Array.isArray(brandVoice.defaultHashtags)) {
      throw new HttpError(400, 'brandVoice is required');
    }
    const result = await composeContent({ idea: body.idea, tone: body.tone, brandVoice }, env);
    return json(result);
  }

  if (resource === 'media' && id === 'config' && method === 'GET') {
    const cloudName = env.CLOUDINARY_CLOUD_NAME ?? null;
    const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET ?? null;
    return json({
      cloudinary: {
        configured: Boolean(cloudName && uploadPreset),
        cloudName,
        uploadPreset,
        folder: env.CLOUDINARY_FOLDER ?? 'omnipost',
        uploadUrl: cloudName ? `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload` : null,
        videoTransformTemplate: 'c_fill,g_auto,ar_{aspect},w_{width},h_{height},q_auto,f_auto',
      },
      transcription: {
        webhookPath: '/api/webhooks/transcription',
        configured: Boolean(env.TRANSCRIPTION_WEBHOOK_SECRET),
      },
    });
  }

  if (resource === 'webhooks' && id === 'transcription' && method === 'POST') {
    const secret = env.TRANSCRIPTION_WEBHOOK_SECRET;
    if (!secret) {
      if (env.APP_ENV === 'production') {
        throw new HttpError(503, 'Transcription webhook is not configured');
      }
    } else {
      const headerSecret = request.headers.get('x-webhook-secret');
      const bearer = request.headers.get('authorization');
      if (headerSecret !== secret && bearer !== `Bearer ${secret}`) {
        throw new HttpError(401, 'Invalid webhook secret');
      }
    }

    const body = await readJson<{
      assetId?: string;
      language?: string;
      provider?: string;
      words?: { word?: string; start?: number; end?: number }[];
      srt?: string;
    }>(request);
    const assetId = body.assetId?.trim();
    if (!assetId) throw new HttpError(400, 'assetId is required');
    if (!Array.isArray(body.words) || body.words.length === 0) {
      throw new HttpError(400, 'words must contain at least one word');
    }
    if (body.words.length > 50_000) throw new HttpError(413, 'Transcript is too large');

    const words = body.words
      .filter((word) => typeof word.word === 'string' && Number.isFinite(word.start) && Number.isFinite(word.end))
      .map((word) => ({
        word: String(word.word).trim(),
        start: Math.max(0, Number(word.start)),
        end: Math.max(0, Number(word.end)),
      }));
    if (!words.length) throw new HttpError(400, 'No valid word timestamps supplied');

    const srt = typeof body.srt === 'string' && body.srt.trim() ? body.srt : wordsToSrt(words);
    await saveTranscription(
      env.DB,
      assetId,
      JSON.stringify(words),
      srt,
      body.language ?? null,
      body.provider ?? null,
    );
    return json({ ok: true, assetId, wordCount: words.length, srt }, 201);
  }

  if (resource === 'transcriptions' && id && method === 'GET') {
    const row = await getTranscription(env.DB, id);
    if (!row) throw new HttpError(404, 'Transcription not found');
    return json(row);
  }

  throw new HttpError(404, 'Not found');
}
