import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Play,
  Repeat2,
  Send,
  Share2,
  ThumbsUp,
  Volume2,
} from 'lucide-react';
import type { CaptionConfig, FocalPoint, MediaAsset } from '../../lib/types';
import { splitThread } from '../../lib/ai';
import { cx } from '../ui/Primitives';
import { CaptionOverlay } from './CaptionOverlay';
import { useCarouselSlices } from './CarouselPreview';
import { MediaSurface } from './MediaSurface';

export interface MockupProps {
  text: string;
  media?: MediaAsset;
  focal: FocalPoint;
  caption: CaptionConfig;
  carousel: boolean;
  firstComment?: boolean;
  firstCommentText?: string;
}

function StudioAvatar({ size = 32, tone = 'from-[#0a66c2] to-[#004182]' }: { size?: number; tone?: string }) {
  return (
    <div
      className={cx('flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white', tone)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      NS
    </div>
  );
}

/* --------------------------------------------------------------- LinkedIn */

export function LinkedInMockup({ text, media, focal }: MockupProps) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 360;
  const shown = expanded || !long ? text : `${text.slice(0, 340).replace(/\s+\S*$/, '')}…`;

  return (
    <div className="overflow-hidden rounded-lg bg-[#f4f2ee] text-[#191919] ring-1 ring-black/10">
      <div className="bg-white">
        <div className="flex items-start gap-2 px-3 pt-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#0a66c2] to-[#004182] text-[10px] font-bold text-white">
            NS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold leading-4">Northwind Studio</p>
            <p className="truncate text-[10px] leading-3.5 text-[#5f6163]">
              Content systems for B2B SaaS · 2h · <Globe className="inline h-2.5 w-2.5 align-[-1px]" />
            </p>
          </div>
          <button className="shrink-0 text-[11.5px] font-semibold text-[#0a66c2]">+ Follow</button>
          <MoreHorizontal className="h-3.5 w-3.5 shrink-0 text-[#5f6163]" />
        </div>

        <div className="px-3 pb-2 pt-2">
          <p className="whitespace-pre-wrap break-words text-[12px] leading-[1.5]">
            {shown}
            {long && (
              <button onClick={() => setExpanded((v) => !v)} className="ml-1 text-[11px] font-medium text-[#5f6163] hover:underline">
                {expanded ? 'see less' : 'see more'}
              </button>
            )}
          </p>
        </div>

        {media && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e9e5df]">
            <MediaSurface media={media} focal={focal} mode="poster" alt="LinkedIn media preview" />
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-1 text-[10px] text-[#5f6163]">
            <span className="flex -space-x-1">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0a66c2] text-[7px] text-white">👍</span>
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#df704d] text-[7px] text-white">❤</span>
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#6dae4f] text-[7px] text-white">💡</span>
            </span>
            <span className="ml-1">412 · 38 comments</span>
          </div>
          <span className="text-[10px] text-[#5f6163]">28 reposts</span>
        </div>

        <div className="mx-3 grid grid-cols-4 border-t border-black/10 py-1.5 text-[10.5px] font-semibold text-[#5f6163]">
          {[
            { icon: ThumbsUp, label: 'Like' },
            { icon: MessageCircle, label: 'Comment' },
            { icon: Repeat2, label: 'Repost' },
            { icon: Send, label: 'Send' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center justify-center gap-1 rounded py-1 hover:bg-black/5">
              <Icon className="h-3 w-3" /> {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- X */

export function XMockup({ text, media, focal }: MockupProps) {
  const chunks = splitThread(text, 280);
  return (
    <div className="overflow-hidden rounded-lg bg-black text-[#e7e9ea] ring-1 ring-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="text-[10px] font-medium text-[#71767b]">
          {chunks.length > 1 ? `Thread · ${chunks.length} posts` : 'Post preview'}
        </span>
        <span className="flex items-center gap-1 rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] text-[#71767b]">
          <span className="h-1 w-1 rounded-full bg-emerald-400" /> Live preview
        </span>
      </div>
      {chunks.map((chunk, index) => (
        <div key={index} className="relative flex gap-2.5 px-3 pt-2.5">
          {index < chunks.length - 1 && <span className="absolute bottom-0 left-[28px] top-10 w-[2px] rounded bg-[#2f3336]" />}
          <StudioAvatar size={28} tone="from-slate-500 to-slate-700" />
          <div className="min-w-0 flex-1 pb-2">
            <div className="flex items-center gap-1 text-[11.5px]">
              <span className="font-bold text-white">Northwind</span>
              <BadgeCheck className="h-3 w-3 text-[#1d9bf0]" />
              <span className="text-[10.5px] text-[#71767b]">@northwindhq · 2h</span>
              <MoreHorizontal className="ml-auto h-3 w-3 text-[#71767b]" />
            </div>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-[12px] leading-[1.42] text-[#e7e9ea]">{chunk}</p>
            {media && index === 0 && (
              <div className="relative mt-2 aspect-[16/9] overflow-hidden rounded-xl border border-white/10">
                <MediaSurface media={media} focal={focal} mode="poster" alt="X media preview" />
              </div>
            )}
            <div className="mt-2 flex max-w-[85%] items-center justify-between text-[10px] text-[#71767b]">
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 24</span>
              <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" /> 86</span>
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> 412</span>
              <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" /> 38</span>
              <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /></span>
            </div>
          </div>
        </div>
      ))}
      <div className="border-t border-white/10 px-3 py-1.5 text-[9.5px] text-[#1d9bf0]">
        {chunks.length > 1 ? 'Each part posts automatically as a connected thread' : 'Show this thread'}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Instagram */

type IgMode = 'feed' | 'carousel' | 'reel';

export function InstagramMockup({ text, media, focal, caption, carousel, firstComment }: MockupProps) {
  const [mode, setMode] = useState<IgMode>(carousel ? 'carousel' : 'feed');
  const [slide, setSlide] = useState(0);
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dragStart = useRef<number | null>(null);
  const slices = useCarouselSlices(media, focal, mode === 'carousel');
  const shownText = expanded ? text : text.slice(0, 150);

  useEffect(() => {
    setMode((current) => {
      if (carousel) return 'carousel';
      return current === 'carousel' ? 'feed' : current;
    });
  }, [carousel]);

  useEffect(() => {
    setSlide(0);
  }, [slices.length]);

  const mediaBox = mode === 'reel' ? 'aspect-[9/16]' : 'aspect-[4/5]';
  const maxSlide = Math.max(0, slices.length - 1);

  return (
    <div className="mx-auto w-full max-w-[330px] overflow-hidden rounded-lg bg-white text-[#262626] ring-1 ring-black/10">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span className="rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1.5px]">
          <span className="block rounded-full bg-white p-[1.5px]">
            <StudioAvatar size={24} tone="from-[#f58529] to-[#8134af]" />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold">northwind.studio</p>
          <p className="truncate text-[9px] text-[#737373]">Original audio · northwindstudio</p>
        </div>
        <div className="flex items-center gap-0.5 rounded-md bg-[#efefef] p-0.5">
          {(['feed', 'carousel', 'reel'] as IgMode[]).map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={cx(
                'rounded px-1 py-0.5 text-[8px] font-semibold capitalize transition-colors',
                mode === item ? 'bg-white text-[#262626] shadow-sm' : 'text-[#737373]',
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <MoreHorizontal className="h-3.5 w-3.5 text-[#262626]" />
      </div>

      <div
        className={cx('relative w-full touch-pan-y overflow-hidden bg-[#efefef]', mediaBox, mode === 'carousel' && 'cursor-grab active:cursor-grabbing')}
        onPointerDown={(event) => {
          if (mode !== 'carousel') return;
          dragStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (mode !== 'carousel' || dragStart.current === null) return;
          const delta = event.clientX - dragStart.current;
          dragStart.current = null;
          if (Math.abs(delta) < 24) return;
          setSlide((current) => Math.max(0, Math.min(maxSlide, current + (delta < 0 ? 1 : -1))));
        }}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
      >
        {mode === 'carousel' && slices.length > 0 ? (
          <>
            <img
              src={slices[Math.min(slide, maxSlide)]}
              alt={`Carousel slide ${Math.min(slide, maxSlide) + 1}`}
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[8.5px] font-medium text-white">
              {Math.min(slide, maxSlide) + 1}/{slices.length} · 1080×1350
            </div>
            <button
              onClick={() => setSlide((current) => Math.max(0, current - 1))}
              aria-label="Previous slide"
              className="absolute left-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#262626] shadow"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={() => setSlide((current) => Math.min(maxSlide, current + 1))}
              aria-label="Next slide"
              className="absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#262626] shadow"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
              {slices.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={cx('h-1 w-1 rounded-full transition-colors', index === slide ? 'bg-white' : 'bg-white/45')}
                />
              ))}
            </div>
            <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2 py-0.5 text-[8px] text-white/90 backdrop-blur">
              Swipe
            </span>
          </>
        ) : (
          <>
            <MediaSurface
              media={media}
              focal={focal}
              mode={mode === 'reel' ? 'video' : 'poster'}
              alt="Instagram media preview"
            />
            {mode === 'reel' && (
              <>
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/55 to-transparent" />
                <div className="absolute inset-x-0 top-2 flex items-center justify-between px-2 text-[9px] font-semibold text-white">
                  <span className="rounded-full bg-black/40 px-1.5 py-0.5 backdrop-blur">Reels</span>
                  <Volume2 className="h-3 w-3" />
                </div>
                <button className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 backdrop-blur">
                  <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                </button>
                <CaptionOverlay caption={caption} compact />
              </>
            )}
            {mode === 'carousel' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 px-3 text-center text-[9px] text-white">
                Turn on the splitter to generate 1080×1350 slides
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5 px-2.5 pt-1.5 text-[#262626]">
        <button onClick={() => setLiked((v) => !v)} aria-label="Like">
          <Heart className={cx('h-4 w-4', liked && 'fill-[#ed4956] text-[#ed4956]')} />
        </button>
        <MessageCircle className="h-4 w-4" />
        <Send className="h-4 w-4" />
        <Bookmark className="ml-auto h-4 w-4" />
      </div>
      <div className="px-2.5 pb-2.5 pt-1">
        <p className="text-[10px] font-semibold">{liked ? '1,285' : '1,284'} likes</p>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-[10px] leading-[1.45]">
          <span className="font-semibold">northwind.studio</span> {shownText}
          {text.length > 150 && (
            <button onClick={() => setExpanded((v) => !v)} className="ml-1 text-[#737373]">
              {expanded ? 'less' : 'more'}
            </button>
          )}
        </p>
        <p className="mt-0.5 text-[9.5px] text-[#737373]">View all 62 comments</p>
        <p className="mt-0.5 text-[8.5px] uppercase tracking-wide text-[#c7c7c7]">2 hours ago</p>
        {firstComment && (
          <p className="mt-1 flex items-center gap-1 rounded bg-[#fafafa] px-1.5 py-1 text-[8.5px] text-[#737373]">
            <MessageCircle className="h-2.5 w-2.5" /> First comment queued automatically
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- TikTok */

export function TikTokMockup({ text, media, focal, caption }: MockupProps) {
  const lines = text.split('\n').filter(Boolean);
  return (
    <div className="mx-auto w-full max-w-[248px] overflow-hidden rounded-lg bg-black ring-1 ring-white/10">
      <div className="relative aspect-[9/16] w-full overflow-hidden">
        <MediaSurface media={media} focal={focal} mode="video" alt="TikTok media preview" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35" />
        <div className="absolute inset-x-0 top-2 flex items-center justify-between px-2 text-[9px] font-medium text-white/85">
          <span className="flex gap-2">
            <span className="text-white/55">Following</span>
            <span className="border-b border-white pb-0.5">For You</span>
          </span>
          <Play className="h-3 w-3" />
        </div>

        <CaptionOverlay caption={caption} compact />

        <div className="absolute bottom-9 right-1.5 flex flex-col items-center gap-2.5 text-white">
          <span className="flex flex-col items-center gap-0.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Heart className="h-3.5 w-3.5 fill-white" />
            </span>
            <span className="text-[8px] font-semibold">24.6K</span>
          </span>
          <span className="flex flex-col items-center gap-0.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <MessageCircle className="h-3.5 w-3.5 fill-white" />
            </span>
            <span className="text-[8px] font-semibold">812</span>
          </span>
          <span className="flex flex-col items-center gap-0.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Bookmark className="h-3.5 w-3.5 fill-white" />
            </span>
            <span className="text-[8px] font-semibold">1,204</span>
          </span>
          <span className="flex flex-col items-center gap-0.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Share2 className="h-3.5 w-3.5 fill-white" />
            </span>
            <span className="text-[8px] font-semibold">388</span>
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pr-9 text-white">
          <p className="text-[10px] font-semibold">@northwindstudio</p>
          <p className="mt-0.5 line-clamp-3 whitespace-pre-wrap break-words text-[9px] leading-[1.4] text-white/90">
            {lines.slice(0, 3).join(' ')}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[8.5px] text-white/80">
            <Music2 className="h-2.5 w-2.5" /> original sound — northwindstudio
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/25">
          <div className="h-full w-2/5 bg-white/85" />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- YouTube Shorts */

export function YouTubeMockup({ text, media, focal, caption }: MockupProps) {
  const title = text.split('\n').filter(Boolean)[0] ?? 'Untitled Short';
  return (
    <div className="mx-auto w-full max-w-[248px] overflow-hidden rounded-lg bg-black ring-1 ring-white/10">
      <div className="relative aspect-[9/16] w-full overflow-hidden">
        <MediaSurface media={media} focal={focal} mode="video" alt="YouTube Shorts media preview" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[8.5px] font-semibold text-white backdrop-blur">
          <span className="flex h-2.5 w-2.5 items-center justify-center rounded-[3px] bg-[#ff0000] text-[6px] font-bold">▶</span>
          Shorts
        </div>

        <CaptionOverlay caption={caption} compact />

        <div className="absolute bottom-10 right-2 flex flex-col items-center gap-2.5 text-white">
          {[
            { icon: ThumbsUp, value: '18K' },
            { icon: MessageCircle, value: '642' },
            { icon: Share2, value: 'Share' },
            { icon: Repeat2, value: 'Remix' },
          ].map(({ icon: Icon, value }) => (
            <span key={value} className="flex flex-col items-center gap-0.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[7.5px] font-medium">{value}</span>
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pr-10 text-white">
          <p className="line-clamp-2 text-[9.5px] font-semibold leading-snug">{title}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <StudioAvatar size={16} tone="from-[#ff0000] to-[#7f1d1d]" />
            <span className="text-[8.5px]">@northwindstudio</span>
            <span className="ml-auto rounded-full bg-white px-1.5 py-0.5 text-[7px] font-bold text-black">Subscribe</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/25">
          <div className="h-full w-1/3 bg-[#ff0000]" />
        </div>
      </div>
    </div>
  );
}
