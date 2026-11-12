import type { ComposeResponse } from './apiTypes';
import type { GeneratedDraft } from './ai';
import type { PlatformId } from './types';

/** Maps the server's structured compose response into the editor's draft shape. */
export function composeToDraft(result: ComposeResponse): GeneratedDraft {
  const linkedin = `${result.linkedin.copy}\n\n${result.linkedin.hashtags.join(' ')}`.trim();
  const x = result.x.posts.join('\n\n');
  const instagram = [
    result.instagram.caption,
    '',
    '.',
    '.',
    '.',
    result.instagram.hashtags.join(' '),
  ].join('\n');
  const tiktok = [
    result.tiktok.hook,
    '',
    result.tiktok.caption,
    '',
    result.tiktok.hashtags.join(' '),
  ].join('\n');
  const youtube = [
    result.youtube.hook,
    '',
    result.youtube.caption,
    '',
    result.youtube.hashtags.join(' '),
  ].join('\n');

  const hashtags = [
    ...new Set([
      ...result.instagram.hashtags,
      ...result.linkedin.hashtags,
      ...result.tiktok.hashtags,
    ]),
  ];

  const overrides: Partial<Record<PlatformId, string>> = {
    linkedin,
    x,
    instagram,
    tiktok,
    youtube,
  };

  return {
    title: result.title,
    master: result.linkedin.copy,
    overrides,
    hashtags,
    firstCommentText: result.firstComment,
  };
}
