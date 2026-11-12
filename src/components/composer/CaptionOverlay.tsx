import type { CaptionConfig } from '../../lib/types';
import { chunkAt, type CaptionChunk } from '../../lib/captions';
import { cx } from '../ui/Primitives';

/** Word-by-word karaoke captions driven by video.currentTime. */
export function TimedCaptionOverlay({
  caption,
  chunks,
  currentTime,
  compact = false,
}: {
  caption: CaptionConfig;
  chunks: CaptionChunk[];
  currentTime: number;
  compact?: boolean;
}) {
  const chunk = chunkAt(chunks, currentTime);
  if (!caption.enabled || !chunk) return null;

  let activeIndex = chunk.words.findIndex((word) => currentTime < word.end);
  if (activeIndex === -1) activeIndex = chunk.words.length - 1;
  const size = compact ? Math.max(9, caption.size * 0.62) : caption.size;
  const wrapperStyle = { top: `${caption.position}%`, transform: 'translateY(-50%)' };

  const renderWords = (style: 'hormozi' | 'minimal' | 'neon') =>
    chunk.words.map((word, index) => {
      const active = index === activeIndex;
      if (style === 'hormozi') {
        return (
          <span key={`${word.word}-${index}`} className="inline-block">
            <span
              className={cx(
                'box-decoration-clone px-[2px] transition-colors duration-150',
                active ? 'bg-yellow-300 text-black' : 'text-white',
              )}
              style={active ? undefined : { textShadow: '0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 6px 18px rgba(0,0,0,0.65)' }}
            >
              {word.word}
            </span>{' '}
          </span>
        );
      }
      if (style === 'neon') {
        return (
          <span key={`${word.word}-${index}`} className="inline-block">
            <span
              className={cx(
                'rounded-[3px] px-[2px] transition-all duration-150',
                active ? 'bg-fuchsia-400 text-black' : 'text-white/60',
              )}
            >
              {word.word}
            </span>{' '}
          </span>
        );
      }
      return (
        <span key={`${word.word}-${index}`} className="inline-block">
          <span
            className={cx(
              'transition-colors duration-150',
              active ? 'font-semibold text-white' : 'text-white/55',
            )}
          >
            {word.word}
          </span>{' '}
        </span>
      );
    });

  if (caption.style === 'hormozi') {
    return (
      <div className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4" style={wrapperStyle}>
        <p className="max-w-[92%] text-center font-black uppercase leading-[1.12] tracking-tight text-white" style={{ fontSize: size }}>
          {renderWords('hormozi')}
        </p>
      </div>
    );
  }

  if (caption.style === 'neon') {
    return (
      <div className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4" style={wrapperStyle}>
        <p
          className="max-w-[92%] rounded-md border border-violet-300/70 bg-violet-600/45 px-2.5 py-1 text-center font-bold leading-snug shadow-[0_0_22px_rgba(139,92,246,0.85)] backdrop-blur-[2px]"
          style={{ fontSize: size }}
        >
          {renderWords('neon')}
        </p>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4" style={wrapperStyle}>
      <p
        className="max-w-[92%] rounded-sm bg-black/60 px-2.5 py-1 text-center font-medium leading-snug text-white backdrop-blur-[2px]"
        style={{ fontSize: size }}
      >
        {renderWords('minimal')}
      </p>
    </div>
  );
}

export function CaptionOverlay({
  caption,
  compact = false,
  className,
}: {
  caption: CaptionConfig;
  compact?: boolean;
  className?: string;
}) {
  if (!caption.enabled || !caption.text.trim()) return null;
  const words = caption.text.trim().split(/\s+/);
  const tail = words.pop() ?? '';
  const head = words.join(' ');
  const size = compact ? Math.max(9, caption.size * 0.62) : caption.size;

  if (caption.style === 'hormozi') {
    return (
      <div
        className={cx('pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4', className)}
        style={{ top: `${caption.position}%`, transform: 'translateY(-50%)' }}
      >
        <p
          className="max-w-[92%] text-center font-black uppercase leading-[1.12] tracking-tight text-white"
          style={{ fontSize: size, textShadow: '0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 6px 18px rgba(0,0,0,0.65)' }}
        >
          {head}{' '}
          <span className="box-decoration-clone rounded-[3px] bg-yellow-300 px-1.5 text-black" style={{ textShadow: 'none' }}>
            {tail}
          </span>
        </p>
      </div>
    );
  }

  if (caption.style === 'neon') {
    return (
      <div
        className={cx('pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4', className)}
        style={{ top: `${caption.position}%`, transform: 'translateY(-50%)' }}
      >
        <p
          className="max-w-[92%] rounded-md border border-violet-300/70 bg-violet-600/45 px-2.5 py-1 text-center font-bold leading-snug text-white shadow-[0_0_22px_rgba(139,92,246,0.85)] backdrop-blur-[2px]"
          style={{ fontSize: size }}
        >
          {caption.text}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cx('pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4', className)}
      style={{ top: `${caption.position}%`, transform: 'translateY(-50%)' }}
    >
      <p
        className="max-w-[92%] rounded-sm bg-black/60 px-2.5 py-1 text-center font-medium leading-snug text-white backdrop-blur-[2px]"
        style={{ fontSize: size }}
      >
        {caption.text}
      </p>
    </div>
  );
}
