import { useEffect, useState } from 'react';
import type { FocalPoint, MediaAsset } from '../../lib/types';
import { cx } from '../ui/Primitives';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

/**
 * Slices a wide source image into 2–4 sequential 1080×1350 carousel slides on
 * an offscreen canvas, respecting the focal point so the subject survives each
 * crop. Output is intentionally 1080×1350 — the size Instagram stores.
 */
export function useCarouselSlices(media: MediaAsset | undefined, focal: FocalPoint, enabled: boolean): string[] {
  const [slides, setSlides] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || !media || media.type === 'video') {
      setSlides([]);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = media.url;
    img.onload = () => {
      if (cancelled) return;
      const aspect = SLIDE_WIDTH / SLIDE_HEIGHT;
      let cropH = img.naturalHeight;
      let cropW = cropH * aspect;
      if (cropW > img.naturalWidth) {
        cropW = img.naturalWidth;
        cropH = cropW / aspect;
      }
      const count = clamp(Math.ceil(img.naturalWidth / cropW), 2, 4);
      const maxStartX = Math.max(0, img.naturalWidth - cropW);
      const maxStartY = Math.max(0, img.naturalHeight - cropH);
      const focalX = (focal.x / 100) * img.naturalWidth;
      const focalY = (focal.y / 100) * img.naturalHeight;
      const urls: string[] = [];

      for (let i = 0; i < count; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = SLIDE_WIDTH;
        canvas.height = SLIDE_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        const evenCenter = ((i + 0.5) / count) * img.naturalWidth;
        const center = evenCenter * 0.68 + focalX * 0.32;
        const sx = clamp(center - cropW / 2, 0, maxStartX);
        const sy = clamp(focalY - cropH / 2, 0, maxStartY);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);
        urls.push(canvas.toDataURL('image/jpeg', 0.9));
      }
      if (!cancelled) setSlides(urls);
    };
    img.onerror = () => {
      if (!cancelled) setSlides([]);
    };
    return () => {
      cancelled = true;
    };
  }, [media, focal.x, focal.y, enabled]);

  return slides;
}

export function CarouselStrip({
  slides,
  className,
  itemClassName,
  emptyLabel = 'Slicing…',
}: {
  slides: string[];
  className?: string;
  itemClassName?: string;
  emptyLabel?: string;
}) {
  if (!slides.length) {
    return (
      <div className={cx('flex h-20 items-center justify-center rounded-lg border border-dashed border-line/70 text-[10.5px] text-faint', className)}>
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className={cx('flex gap-2 overflow-x-auto pb-1 no-scrollbar', className)}>
      {slides.map((slide, index) => (
        <div key={index} className={cx('group relative shrink-0 overflow-hidden rounded-lg border border-line/60 bg-app', itemClassName)}>
          <img src={slide} alt={`Carousel slide ${index + 1}`} className="h-full w-full object-cover" />
          <span className="absolute left-1 top-1 rounded bg-black/70 px-1 py-0.5 font-mono text-[8.5px] font-semibold text-white">
            {index + 1}/{slides.length}
          </span>
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 font-mono text-[8px] text-white/80">
            1080×1350
          </span>
        </div>
      ))}
    </div>
  );
}
