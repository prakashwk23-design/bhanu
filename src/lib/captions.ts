export interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

export interface CaptionChunk {
  start: number;
  end: number;
  words: CaptionWord[];
}

/**
 * Distributes caption words across the clip duration (weighted by word length)
 * and groups them into readable chunks, producing the timeline that drives the
 * word-by-word overlay while the video plays.
 */
export function buildCaptionTimeline(text: string, duration: number, chunkSize = 4): CaptionChunk[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length || !Number.isFinite(duration) || duration <= 0) return [];

  const weights = words.map((word) => 0.6 + Math.min(word.length, 12) / 10);
  const total = weights.reduce((acc, weight) => acc + weight, 0);
  let cursor = 0;
  const timed: CaptionWord[] = words.map((word, index) => {
    const span = (weights[index] / total) * duration;
    const start = cursor;
    cursor += span;
    return { word, start, end: start + span };
  });

  const chunks: CaptionChunk[] = [];
  for (let i = 0; i < timed.length; i += chunkSize) {
    const slice = timed.slice(i, i + chunkSize);
    chunks.push({ start: slice[0].start, end: slice[slice.length - 1].end, words: slice });
  }
  return chunks;
}

export function chunkAt(chunks: CaptionChunk[], time: number): CaptionChunk | null {
  if (!chunks.length) return null;
  for (const chunk of chunks) {
    if (time >= chunk.start && time <= chunk.end) return chunk;
  }
  if (time < chunks[0].start) return chunks[0];
  return chunks[chunks.length - 1];
}

export function formatTimecode(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
