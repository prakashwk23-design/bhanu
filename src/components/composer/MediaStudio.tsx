import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  Download,
  ImagePlus,
  Layers,
  Loader2,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  Sparkles,
  Type,
  Upload,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { ASPECT_CLASS, ASPECT_PRESETS, CAPTION_STYLES } from '../../lib/platforms';
import type { CaptionStyle, FocalPoint, MediaAsset } from '../../lib/types';
import { buildCaptionTimeline, formatTimecode } from '../../lib/captions';
import { buildCrops, buildCropsZip, downloadBlob, formatBytes, type CropArtifact } from '../../lib/mediaProcessing';
import { getMediaServiceConfig, uploadToCloudinary } from '../../lib/mediaService';
import { errorMessage } from '../../lib/api';
import type { CloudinaryConfig } from '../../lib/apiTypes';
import { Badge, Button, Card, SectionTitle, Switch, cx } from '../ui/Primitives';
import { CarouselStrip, useCarouselSlices } from './CarouselPreview';
import { CaptionOverlay, TimedCaptionOverlay } from './CaptionOverlay';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const FRAME_HEIGHT: Record<string, number> = { '9:16': 400, '4:5': 380, '1:1': 330, '16:9': 300 };

function readDimensions(
  url: string,
  kind: 'image' | 'video',
): Promise<{ width: number; height: number; duration?: string; seconds?: number }> {
  return new Promise((resolve, reject) => {
    if (kind === 'image') {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Unable to read image'));
      img.src = url;
      return;
    }
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const seconds = Number.isFinite(video.duration) ? video.duration : 0;
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        seconds,
        duration: formatTimecode(seconds),
      });
    };
    video.onerror = () => reject(new Error('Unable to read video'));
    video.src = url;
  });
}

export function MediaStudio() {
  const { draft, updateDraft, library, addMedia, toast } = useApp();
  const media = library.find((m) => m.id === draft.mediaId) ?? library[0];
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media?.durationSeconds ?? 0);
  const [muted, setMuted] = useState(true);
  const [crops, setCrops] = useState<CropArtifact[]>([]);
  const [cropsBusy, setCropsBusy] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [cloudinary, setCloudinary] = useState<CloudinaryConfig | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const draggingRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cropsRef = useRef<CropArtifact[]>([]);

  const isVideo = media?.type === 'video';
  const preset = ASPECT_PRESETS.find((p) => p.id === draft.aspect) ?? ASPECT_PRESETS[1];
  const caption = draft.caption;
  const slides = useCarouselSlices(media, draft.focal, draft.carousel && !isVideo);
  const effectiveDuration = duration || media?.durationSeconds || 5;
  const timeline = useMemo(
    () => buildCaptionTimeline(caption.text, effectiveDuration),
    [caption.text, effectiveDuration],
  );
  const activeCue = timeline.findIndex((chunk) => currentTime >= chunk.start && currentTime <= chunk.end);
  const activeCueData = activeCue >= 0 ? timeline[activeCue] : timeline[0];
  const activeWordIndex = activeCueData
    ? Math.max(0, activeCueData.words.findIndex((word) => currentTime < word.end))
    : 0;
  const wordsBefore = timeline.slice(0, Math.max(0, activeCue)).reduce((acc, cue) => acc + cue.words.length, 0);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(media?.durationSeconds ?? 0);
    if (videoRef.current) videoRef.current.currentTime = 0;
  }, [media?.id, media?.durationSeconds]);

  useEffect(() => {
    let active = true;
    getMediaServiceConfig()
      .then((config) => {
        if (active) setCloudinary(config.cloudinary);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Canvas-export every preset whenever the media or focal point changes.
  useEffect(() => {
    if (!media) return;
    let cancelled = false;
    setCropsBusy(true);
    const timer = window.setTimeout(async () => {
      try {
        const next = await buildCrops(media, draft.focal);
        if (cancelled) {
          next.forEach((artifact) => URL.revokeObjectURL(artifact.url));
          return;
        }
        cropsRef.current.forEach((artifact) => URL.revokeObjectURL(artifact.url));
        cropsRef.current = next;
        setCrops(next);
      } catch {
        if (!cancelled) setCrops([]);
      } finally {
        if (!cancelled) setCropsBusy(false);
      }
    }, 260);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [media, draft.focal.x, draft.focal.y]);

  useEffect(
    () => () => {
      cropsRef.current.forEach((artifact) => URL.revokeObjectURL(artifact.url));
    },
    [],
  );

  useEffect(() => {
    if (isVideo && videoRef.current) videoRef.current.muted = muted;
  }, [isVideo, muted, media?.id]);

  const applyFocal = (clientX: number, clientY: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    updateDraft({ focal: { x: Math.round(x), y: Math.round(y) } });
  };

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const kind = file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : null;
    if (!kind) {
      toast('That file type is not supported', 'Upload a PNG, JPG, WebP, MP4 or MOV file.', 'warning');
      return;
    }
    setUploading(true);
    let url = URL.createObjectURL(file);
    let pipeline: 'local' | 'cloudinary' = 'local';
    if (cloudinary?.configured) {
      try {
        const uploaded = await uploadToCloudinary(file, kind, cloudinary);
        URL.revokeObjectURL(url);
        url = uploaded.secureUrl;
        pipeline = 'cloudinary';
      } catch (error) {
        toast(
          'Cloudinary upload failed',
          `${errorMessage(error)} · using the local copy instead.`,
          'warning',
        );
      }
    }
    try {
      const meta = await readDimensions(url, kind);
      const asset: MediaAsset = {
        id: `upload-${Date.now()}`,
        name: file.name,
        type: kind,
        url,
        width: meta.width,
        height: meta.height,
        duration: meta.duration,
        durationSeconds: meta.seconds,
        size: formatBytes(file.size),
        tags: pipeline === 'cloudinary' ? ['uploaded', 'cloudinary'] : ['uploaded'],
      };
      addMedia(asset);
      updateDraft({
        mediaId: asset.id,
        aspect: kind === 'video' ? '9:16' : draft.aspect,
        caption: kind === 'video' ? { ...draft.caption, enabled: true } : draft.caption,
      });
      toast(
        'Media added to the studio',
        `${file.name} · ${meta.width}×${meta.height}${meta.duration ? ` · ${meta.duration}` : ''}${
          pipeline === 'cloudinary' ? ' · Cloudinary AI crops ready' : ''
        }`,
        'success',
      );
    } catch {
      toast('Could not read that file', 'Try a different image or video.', 'warning');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  };

  const seek = (value: number) => {
    setCurrentTime(value);
    if (videoRef.current) videoRef.current.currentTime = value;
  };

  const downloadArtifact = (artifact: CropArtifact) => {
    downloadBlob(
      artifact.blob,
      `omnipost-${artifact.preset.id.replace(':', 'x')}-${artifact.preset.width}x${artifact.preset.height}.png`,
    );
  };

  const downloadZip = async () => {
    if (!media || !crops.length) return;
    setZipping(true);
    try {
      const zip = await buildCropsZip(crops, media, draft.focal);
      downloadBlob(zip, `omnipost-crops-${media.name.replace(/\.[^.]+$/, '')}.zip`);
      toast(
        'Crop bundle downloaded',
        `${crops.length} PNGs + manifest.json · exact platform dimensions.`,
        'success',
      );
    } finally {
      setZipping(false);
    }
  };

  const focalLabel: FocalPoint = draft.focal;

  return (
    <Card className="p-4">
      <SectionTitle
        step="03"
        title="Smart visual & video studio"
        description="One upload, every aspect ratio — focal point, captions and exports stay in sync."
        right={
          <Badge className="border-indigo-500/25 bg-indigo-500/10 text-indigo-200" dot="bg-indigo-400">
            {preset.label} crop
          </Badge>
        }
      />

      {/* Library */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {library.slice(0, 6).map((asset) => {
          const active = asset.id === draft.mediaId;
          return (
            <button
              key={asset.id}
              onClick={() =>
                updateDraft({
                  mediaId: asset.id,
                  caption: { ...draft.caption, enabled: asset.type === 'video' ? draft.caption.enabled : false },
                })
              }
              className={cx(
                'group relative overflow-hidden rounded-lg border text-left transition-all',
                active ? 'border-indigo-400/70 ring-2 ring-indigo-500/25' : 'border-line/60 hover:border-line',
              )}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-app">
                {asset.type === 'video' ? (
                  <div className="relative h-full w-full">
                    <video
                      src={asset.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 backdrop-blur">
                        <Play className="ml-0.5 h-3 w-3 fill-white text-white" />
                      </span>
                    </span>
                  </div>
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                <span className="truncate text-[9.5px] text-muted">
                  {asset.name.replace(/\.(png|jpe?g|webp|mp4|mov)$/i, '')}
                </span>
                {asset.type === 'video' ? (
                  <span className="flex items-center gap-0.5 text-[9px] text-faint">
                    <Video className="h-2.5 w-2.5" /> {asset.duration}
                  </span>
                ) : (
                  <span className="font-mono text-[9px] text-faint">
                    {asset.width}×{asset.height}
                  </span>
                )}
              </div>
              {active && (
                <span className="absolute right-1 top-1 rounded bg-indigo-500 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white">
                  In use
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Uploader */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') fileRef.current?.click();
        }}
        className={cx(
          'mt-2 flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed px-3 py-2.5 transition-colors',
          dragging ? 'border-indigo-400/80 bg-indigo-500/10' : 'border-line/70 bg-app/30 hover:border-indigo-400/40 hover:bg-app/50',
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-line/60 bg-raised/60 text-faint">
          <Upload className={cx('h-3.5 w-3.5', uploading && 'animate-pulseSoft')} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-medium text-ink">
            {uploading ? 'Reading media…' : 'Drop an image or video, or click to upload'}
          </p>
          <p className="text-[10px] text-faint">
            {cloudinary?.configured
              ? 'PNG, JPG, WebP, MP4, MOV · Cloudinary preset connected · AI subject-tracking crops'
              : 'PNG, JPG, WebP, MP4, MOV · up to 200 MB · processed locally in your browser'}
          </p>
        </div>
        <span className="hidden items-center gap-1 rounded-md border border-line/60 bg-raised/60 px-2 py-1 text-[10px] text-muted sm:flex">
          <ImagePlus className="h-3 w-3" /> Browse
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {/* Preview */}
      <div className="mt-3 rounded-xl border border-line/60 bg-app/30 p-3">
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-1.5 text-[10.5px] text-faint">
            <Maximize2 className="h-3 w-3" /> Drag anywhere to set the focal point
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <span className="rounded border border-line/60 bg-raised/60 px-1.5 py-0.5">x {focalLabel.x}%</span>
            <span className="rounded border border-line/60 bg-raised/60 px-1.5 py-0.5">y {focalLabel.y}%</span>
            <button
              onClick={() => updateDraft({ focal: { x: 50, y: 50 } })}
              className="flex items-center gap-1 rounded border border-line/60 px-1.5 py-0.5 text-faint transition-colors hover:text-ink"
            >
              <RotateCcw className="h-2.5 w-2.5" /> Reset
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            ref={frameRef}
            onPointerDown={(event) => {
              draggingRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              applyFocal(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (draggingRef.current) applyFocal(event.clientX, event.clientY);
            }}
            onPointerUp={() => {
              draggingRef.current = false;
            }}
            onPointerCancel={() => {
              draggingRef.current = false;
            }}
            className={cx(
              'relative touch-none select-none overflow-hidden rounded-lg border border-line/70 bg-slate-950/60 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.9)]',
              ASPECT_CLASS[draft.aspect],
            )}
            style={{ height: FRAME_HEIGHT[draft.aspect], maxWidth: '100%' }}
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={media?.url}
                muted={muted}
                loop
                playsInline
                preload="auto"
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || media?.durationSeconds || 0)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: `${focalLabel.x}% ${focalLabel.y}%` }}
              />
            ) : (
              <img
                src={media?.url}
                alt={media?.name ?? 'Selected media'}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: `${focalLabel.x}% ${focalLabel.y}%` }}
              />
            )}

            {/* Video chrome + player controls */}
            {isVideo && (
              <>
                <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/65 to-transparent p-2">
                  <span className="flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur">
                    <Video className="h-2.5 w-2.5" /> {media?.width}×{media?.height} · {formatTimecode(effectiveDuration)}
                  </span>
                  <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white/80 backdrop-blur">
                    {caption.enabled ? `Captions · word sync` : 'No captions'}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={playing ? 'Pause video' : 'Play video'}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={togglePlay}
                  className={cx(
                    'absolute left-1/2 top-1/2 z-30 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur transition-opacity hover:bg-black/60',
                    playing ? 'opacity-0 focus-visible:opacity-100' : 'opacity-100',
                  )}
                >
                  {playing ? <Pause className="h-4 w-4 fill-white" /> : <Play className="ml-0.5 h-4 w-4 fill-white" />}
                </button>

                <div
                  className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2 pb-1.5 pt-5"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? 'Pause' : 'Play'}
                    className="flex h-5 w-5 items-center justify-center rounded text-white/90 hover:text-white"
                  >
                    {playing ? <Pause className="h-3 w-3 fill-white" /> : <Play className="h-3 w-3 fill-white" />}
                  </button>
                  <span className="shrink-0 font-mono text-[8.5px] text-white/80">
                    {formatTimecode(currentTime)} / {formatTimecode(effectiveDuration)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0.1, effectiveDuration)}
                    step={0.01}
                    value={Math.min(currentTime, effectiveDuration)}
                    onChange={(event) => seek(Number(event.target.value))}
                    aria-label="Seek video"
                    className="h-1 min-w-0 flex-1 accent-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => setMuted((value) => !value)}
                    aria-label={muted ? 'Unmute video' : 'Mute video'}
                    className="flex h-5 w-5 items-center justify-center rounded text-white/90 hover:text-white"
                  >
                    {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </button>
                </div>
              </>
            )}

            {isVideo ? (
              <TimedCaptionOverlay caption={caption} chunks={timeline} currentTime={currentTime} />
            ) : (
              <CaptionOverlay caption={caption} />
            )}

            {/* Focal crosshair */}
            <div className="pointer-events-none absolute inset-0 z-40">
              <div className="absolute inset-y-0 w-px bg-white/25" style={{ left: `${focalLabel.x}%` }} />
              <div className="absolute inset-x-0 h-px bg-white/25" style={{ top: `${focalLabel.y}%` }} />
              <div
                className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-black/20 backdrop-blur-[1px]"
                style={{ left: `${focalLabel.x}%`, top: `${focalLabel.y}%` }}
              >
                <div className="relative h-3.5 w-3.5">
                  <span className="absolute left-1/2 top-0 h-3.5 w-px -translate-x-1/2 bg-white" />
                  <span className="absolute top-1/2 left-0 h-px w-3.5 -translate-y-1/2 bg-white" />
                  <span className="absolute inset-0 rounded-full border border-white/90" />
                </div>
              </div>
            </div>

            <div
              className={cx(
                'pointer-events-none absolute left-2 z-30 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-white/80 backdrop-blur',
                isVideo ? 'top-11' : 'bottom-2',
              )}
            >
              {preset.label} · safe crop
            </div>
          </div>
        </div>

        {/* Aspect presets */}
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">Aspect ratio</p>
          <div className="grid grid-cols-4 gap-1.5">
            {ASPECT_PRESETS.map((option) => {
              const active = draft.aspect === option.id;
              const gy = option.ratio >= 1 ? 16 / option.ratio : 16;
              return (
                <button
                  key={option.id}
                  onClick={() => updateDraft({ aspect: option.id })}
                  title={option.sub}
                  className={cx(
                    'group flex flex-col items-center gap-1 rounded-lg border px-1 py-1.5 transition-all',
                    active ? 'border-indigo-400/60 bg-indigo-500/10' : 'border-line/60 bg-app/30 hover:border-line hover:bg-raised/50',
                  )}
                >
                  <span className="flex h-5 items-center justify-center">
                    <span
                      className={cx('rounded-[2px] border', active ? 'border-indigo-300 bg-indigo-400/25' : 'border-faint/70 bg-raised')}
                      style={{ height: Math.min(20, gy), width: Math.min(20, gy * option.ratio), aspectRatio: String(option.ratio) }}
                    />
                  </span>
                  <span className={cx('font-mono text-[10.5px] font-semibold', active ? 'text-indigo-200' : 'text-muted')}>
                    {option.label}
                  </span>
                  <span className="hidden max-w-full truncate text-[8.5px] text-faint sm:block">{option.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Canvas crop exports */}
        <div className="mt-3 rounded-xl border border-line/60 bg-app/40 p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink">
                Download cropped assets
                <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-300">Canvas · PNG</Badge>
                {cropsBusy && (
                  <span className="flex items-center gap-1 text-[9px] text-indigo-300">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> rendering
                  </span>
                )}
              </p>
              <p className="text-[10px] leading-relaxed text-faint">
                Exact platform pixels, cut around x {focalLabel.x}% · y {focalLabel.y}%
                {isVideo ? ' using the video frame' : ''}.
              </p>
            </div>
            <Button
              variant="secondary"
              size="xs"
              icon={zipping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Archive className="h-3 w-3" />}
              onClick={() => void downloadZip()}
              disabled={!crops.length || zipping}
            >
              Download all (.zip)
            </Button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {cropsBusy && !crops.length
              ? [0, 1, 2, 3].map((index) => (
                  <div key={index} className="h-[104px] animate-pulseSoft rounded-lg border border-line/60 bg-raised/40" />
                ))
              : crops.map((artifact) => (
                  <div key={artifact.preset.id} className="group overflow-hidden rounded-lg border border-line/60 bg-surface/60">
                    <div className="relative h-[62px] w-full overflow-hidden bg-app">
                      <img src={artifact.url} alt={`${artifact.preset.id} crop preview`} className="h-full w-full object-cover" />
                      <span className="absolute left-1 top-1 rounded bg-black/65 px-1 py-0.5 font-mono text-[8px] text-white">
                        {artifact.preset.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() => downloadArtifact(artifact)}
                        className="min-w-0 text-left"
                        title={`Download ${artifact.preset.width}×${artifact.preset.height} PNG`}
                      >
                        <p className="truncate font-mono text-[9px] text-ink">
                          {artifact.preset.width}×{artifact.preset.height}
                        </p>
                        <p className="truncate text-[8px] text-faint">{formatBytes(artifact.bytes)}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadArtifact(artifact)}
                        aria-label={`Download ${artifact.preset.width}x${artifact.preset.height} PNG`}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-faint transition-colors hover:bg-raised hover:text-ink"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[9px] text-faint">
            <Layers className="h-2.5 w-2.5" />
            {cropsBusy ? 'Rendering canvas crops…' : `${crops.length} PNGs ready · click any tile to download it individually`}
          </p>
        </div>
      </div>

      {/* Carousel splitter */}
      <div className="mt-3 rounded-xl border border-line/60 bg-app/30 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line/60 bg-raised/60 text-faint">
              <Scissors className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink">
                Carousel splitter
                {draft.carousel && slides.length > 0 && (
                  <Badge className="border-violet-500/25 bg-violet-500/10 text-violet-200">
                    {slides.length} slides · 1080×1350
                  </Badge>
                )}
              </p>
              <p className="text-[10.5px] leading-relaxed text-faint">
                {isVideo
                  ? 'Carousel slicing works on panoramic images — video is cropped per channel instead.'
                  : 'Slices a wide image into 2–4 swipeable 4:5 slides (1080×1350).'}
              </p>
            </div>
          </div>
          <Switch
            size="sm"
            checked={draft.carousel && !isVideo}
            disabled={isVideo}
            onChange={(next) => updateDraft({ carousel: next })}
            label="Toggle carousel splitter"
          />
        </div>
        {draft.carousel && !isVideo && (
          <div className="mt-2.5 animate-fadeIn">
            <CarouselStrip slides={slides} itemClassName="h-[120px] w-[96px]" emptyLabel="Slicing with canvas…" />
            <p className="mt-1 flex items-center gap-1 text-[9.5px] text-faint">
              <Layers className="h-2.5 w-2.5" /> {slides.length} sequential 1080×1350 crops from {media?.width}×{media?.height} at the
              current focal point
            </p>
          </div>
        )}
      </div>

      {/* Caption overlay */}
      <div className="mt-3 rounded-xl border border-line/60 bg-app/30 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line/60 bg-raised/60 text-faint">
              <Type className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[11.5px] font-medium text-ink">Caption overlay</p>
              <p className="text-[10.5px] leading-relaxed text-faint">
                {isVideo
                  ? 'Word-by-word subtitles locked to video.currentTime.'
                  : 'Static subtitle bar — switch to the sample reel for word sync.'}
              </p>
            </div>
          </div>
          <Switch
            size="sm"
            checked={caption.enabled}
            onChange={(next) => updateDraft({ caption: { ...caption, enabled: next } })}
            label="Toggle caption overlay"
          />
        </div>

        {caption.enabled && (
          <div className="mt-2.5 animate-fadeIn space-y-2.5">
            <input
              value={caption.text}
              onChange={(event) => updateDraft({ caption: { ...caption, text: event.target.value } })}
              placeholder="Caption text…"
              aria-label="Caption text"
              className="h-8 w-full rounded-lg border border-line/60 bg-app/60 px-2.5 text-[11.5px] text-ink outline-none focus:border-indigo-400/60"
            />
            <div className="flex flex-wrap items-center gap-1">
              {CAPTION_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => updateDraft({ caption: { ...caption, style: style.id as CaptionStyle } })}
                  className={cx(
                    'rounded-md border px-1.5 py-1 text-[10px] transition-colors',
                    caption.style === style.id
                      ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-100'
                      : 'border-line/60 text-muted hover:text-ink',
                  )}
                >
                  {style.label}
                </button>
              ))}
              <span className="ml-auto flex items-center gap-1 text-[9.5px] text-faint">
                <Sparkles className="h-2.5 w-2.5 text-indigo-300" /> {timeline.length} {timeline.length === 1 ? 'cue' : 'cues'} · auto-timed
              </span>
            </div>

            {isVideo && timeline.length > 0 && (
              <div className="rounded-lg border border-line/50 bg-app/40 p-1.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-faint">Cue timeline</span>
                  <span className="font-mono text-[9px] text-muted">
                    {formatTimecode(currentTime)} / {formatTimecode(effectiveDuration)} · word {wordsBefore + activeWordIndex + 1} of{' '}
                    {timeline.reduce((acc, cue) => acc + cue.words.length, 0)}
                  </span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                  {timeline.map((cue, index) => (
                    <button
                      key={`${cue.start}-${index}`}
                      onClick={() => seek(cue.start + 0.01)}
                      className={cx(
                        'shrink-0 rounded border px-1.5 py-0.5 text-[9px] transition-colors',
                        index === activeCue
                          ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-100'
                          : 'border-line/50 text-faint hover:text-ink',
                      )}
                    >
                      <span className="mr-1 font-mono text-[8px] opacity-70">{formatTimecode(cue.start)}</span>
                      {cue.words.map((word) => word.word).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="flex items-center justify-between text-[9.5px] font-semibold uppercase tracking-[0.1em] text-faint">
                  Font size <span className="font-mono text-muted">{caption.size}px</span>
                </span>
                <input
                  type="range"
                  min={14}
                  max={44}
                  value={caption.size}
                  onChange={(event) => updateDraft({ caption: { ...caption, size: Number(event.target.value) } })}
                  className="mt-1.5 w-full"
                  aria-label="Caption font size"
                />
              </label>
              <label className="block">
                <span className="flex items-center justify-between text-[9.5px] font-semibold uppercase tracking-[0.1em] text-faint">
                  Position <span className="font-mono text-muted">{caption.position}%</span>
                </span>
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={caption.position}
                  onChange={(event) => updateDraft({ caption: { ...caption, position: Number(event.target.value) } })}
                  className="mt-1.5 w-full"
                  aria-label="Caption vertical position"
                />
              </label>
            </div>
            <p className="flex items-center gap-1 text-[9.5px] text-faint">
              <Play className="h-2.5 w-2.5" /> Press play in the preview — the active word advances with the clip instead of a
              fixed timer.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
