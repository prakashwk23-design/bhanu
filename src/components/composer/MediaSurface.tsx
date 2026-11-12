import type { CSSProperties } from 'react';
import type { FocalPoint, MediaAsset } from '../../lib/types';
import { cx } from '../ui/Primitives';

/**
 * One renderer for both stills and clips. Images are always cropped with
 * object-fit/object-position, videos get the same treatment via their native
 * renderer so the focal point stays consistent across every mockup.
 */
export function MediaSurface({
  media,
  focal,
  mode = 'poster',
  className,
  alt,
  style,
}: {
  media?: MediaAsset;
  focal: FocalPoint;
  mode?: 'poster' | 'video';
  className?: string;
  alt?: string;
  style?: CSSProperties;
}) {
  const shared = {
    className: cx('h-full w-full object-cover', className),
    style: { objectPosition: `${focal.x}% ${focal.y}%`, ...style } as CSSProperties,
  };

  if (!media) {
    return <div className={cx('h-full w-full bg-gradient-to-br from-slate-800 to-slate-900', className)} />;
  }

  if (media.type === 'video') {
    return (
      <video
        src={media.url}
        preload="auto"
        muted
        loop
        playsInline
        autoPlay={mode === 'video'}
        className={shared.className}
        style={shared.style}
        aria-label={alt ?? media.name}
      />
    );
  }

  return <img src={media.url} alt={alt ?? media.name} className={shared.className} style={shared.style} draggable={false} />;
}
