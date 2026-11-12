import type { AspectPreset, FocalPoint, MediaAsset } from './types';
import { createZip, type ZipEntry } from './zip';

export interface CropPreset {
  id: AspectPreset;
  label: string;
  width: number;
  height: number;
}

export const EXPORT_PRESETS: CropPreset[] = [
  { id: '9:16', label: 'Reels · Shorts · TikTok', width: 1080, height: 1920 },
  { id: '4:5', label: 'Instagram portrait', width: 1080, height: 1350 },
  { id: '1:1', label: 'Square feed', width: 1080, height: 1080 },
  { id: '16:9', label: 'X · LinkedIn landscape', width: 1920, height: 1080 },
];

export interface CropArtifact {
  preset: CropPreset;
  blob: Blob;
  url: string;
  bytes: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = url;
  });
}

function loadVideoFrame(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => reject(new Error('Video frame timed out')), 12_000);
    video.onloadeddata = () => {
      window.clearTimeout(timer);
      resolve(video);
    };
    video.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error('Could not load video'));
    };
    video.src = url;
  });
}

async function getSource(media: MediaAsset): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  if (media.type === 'video') {
    const video = await loadVideoFrame(media.url);
    const width = video.videoWidth || media.width;
    const height = video.videoHeight || media.height;
    if (!width || !height) throw new Error('Video has no readable frame');
    return { source: video, width, height };
  }
  const img = await loadImage(media.url);
  return { source: img, width: img.naturalWidth, height: img.naturalHeight };
}

async function cropFromSource(
  source: CanvasImageSource,
  width: number,
  height: number,
  focal: FocalPoint,
  preset: CropPreset,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = preset.width;
  canvas.height = preset.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const scale = Math.max(preset.width / width, preset.height / height);
  const cropW = preset.width / scale;
  const cropH = preset.height / scale;
  const sx = clamp((focal.x / 100) * width - cropW / 2, 0, Math.max(0, width - cropW));
  const sy = clamp((focal.y / 100) * height - cropH / 2, 0, Math.max(0, height - cropH));

  ctx.drawImage(source, sx, sy, cropW, cropH, 0, 0, preset.width, preset.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      'image/png',
    );
  });
}

export async function cropMedia(media: MediaAsset, focal: FocalPoint, preset: CropPreset): Promise<Blob> {
  const { source, width, height } = await getSource(media);
  return cropFromSource(source, width, height, focal, preset);
}

export async function buildCrops(media: MediaAsset, focal: FocalPoint): Promise<CropArtifact[]> {
  const { source, width, height } = await getSource(media);
  const artifacts: CropArtifact[] = [];
  for (const preset of EXPORT_PRESETS) {
    const blob = await cropFromSource(source, width, height, focal, preset);
    artifacts.push({ preset, blob, url: URL.createObjectURL(blob), bytes: blob.size });
  }
  return artifacts;
}

export async function buildCropsZip(
  artifacts: CropArtifact[],
  media: MediaAsset,
  focal: FocalPoint,
): Promise<Blob> {
  const entries: ZipEntry[] = [];
  for (const artifact of artifacts) {
    entries.push({
      name: `omnipost-${artifact.preset.id.replace(':', 'x')}-${artifact.preset.width}x${artifact.preset.height}.png`,
      data: new Uint8Array(await artifact.blob.arrayBuffer()),
    });
  }
  const manifest = {
    app: 'OmniPost AI',
    generatedAt: new Date().toISOString(),
    source: media.name,
    sourceDimensions: `${media.width}x${media.height}`,
    sourceType: media.type,
    focalPoint: { x: `${focal.x}%`, y: `${focal.y}%` },
    outputs: artifacts.map((artifact) => ({
      file: `omnipost-${artifact.preset.id.replace(':', 'x')}-${artifact.preset.width}x${artifact.preset.height}.png`,
      aspect: artifact.preset.id,
      width: artifact.preset.width,
      height: artifact.preset.height,
      bytes: artifact.bytes,
      usage: artifact.preset.label,
    })),
  };
  entries.push({ name: 'manifest.json', data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) });
  return createZip(entries);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
