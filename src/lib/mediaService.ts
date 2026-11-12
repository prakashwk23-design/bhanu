import type { AspectPreset } from './types';
import type {
  CloudinaryConfig,
  MediaServiceConfig,
  TranscriptionPayload,
  TranscriptionWord,
} from './apiTypes';
import { api } from './api';

export const ASPECT_DIMENSIONS: Record<AspectPreset, { width: number; height: number; ar: string }> = {
  '9:16': { width: 1080, height: 1920, ar: '9:16' },
  '4:5': { width: 1080, height: 1350, ar: '4:5' },
  '1:1': { width: 1080, height: 1080, ar: '1:1' },
  '16:9': { width: 1920, height: 1080, ar: '16:9' },
};

export function getMediaServiceConfig(): Promise<MediaServiceConfig> {
  return api.mediaConfig();
}

/**
 * Builds a Cloudinary delivery URL that performs AI subject tracking
 * (`g_auto`) into an exact social crop. Works for video and image assets.
 */
export function buildCloudinaryCropUrl(
  publicId: string,
  resourceType: 'image' | 'video',
  aspect: AspectPreset,
  cloudName: string,
): string {
  const { width, height, ar } = ASPECT_DIMENSIONS[aspect];
  const transform = `c_fill,g_auto,ar_${ar},w_${width},h_${height},q_auto,f_auto`;
  const extension = resourceType === 'video' ? 'mp4' : 'jpg';
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transform}/${publicId}.${extension}`;
}

export function cloudinaryVideoTransform(aspect: AspectPreset): string {
  const { width, height, ar } = ASPECT_DIMENSIONS[aspect];
  return `c_fill,g_auto,ar_${ar},w_${width},h_${height},q_auto,f_auto`;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Uploads through an unsigned Cloudinary preset. Cloudinary serves the file;
 * crops are generated on delivery with `c_fill,g_auto` via buildCloudinaryCropUrl.
 */
export async function uploadToCloudinary(
  file: File,
  resourceType: 'image' | 'video',
  config: CloudinaryConfig,
): Promise<CloudinaryUploadResult> {
  if (!config.configured || !config.uploadUrl || !config.uploadPreset) {
    throw new Error('Cloudinary is not configured');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', config.uploadPreset);
  form.append('folder', config.folder);

  const response = await fetch(config.uploadUrl, { method: 'POST', body: form });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${detail.slice(0, 180)}`);
  }
  const payload = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    resource_type?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
  if (!payload.secure_url || !payload.public_id) {
    throw new Error('Cloudinary response did not include an asset URL');
  }
  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    resourceType: payload.resource_type === 'video' ? 'video' : resourceType,
    width: payload.width,
    height: payload.height,
    duration: payload.duration,
  };
}

export function wordsToSrt(words: TranscriptionWord[]): string {
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

export function buildTranscriptionPayload(
  assetId: string,
  words: TranscriptionWord[],
  options: { language?: string; provider?: string; srt?: string } = {},
): TranscriptionPayload {
  return {
    assetId,
    words,
    language: options.language,
    provider: options.provider ?? 'cloudinary',
    srt: options.srt ?? wordsToSrt(words),
  };
}

export const TRANSCRIPTION_WEBHOOK_PATH = '/api/webhooks/transcription';

/** Local fallback used when no transcript has been delivered by the webhook yet. */
export function wordsFromCaption(text: string, durationSeconds: number): TranscriptionWord[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const totalWeight = words.reduce((sum, word) => sum + Math.max(3, word.length), 0);
  const duration = Math.max(1, durationSeconds);
  let cursor = 0;
  return words.map((word) => {
    const weight = Math.max(3, word.length);
    const start = (cursor / totalWeight) * duration;
    cursor += weight;
    const end = (cursor / totalWeight) * duration;
    return { word, start: Number(start.toFixed(2)), end: Number(end.toFixed(2)) };
  });
}
