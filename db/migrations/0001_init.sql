-- OmniPost AI schema (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS social_accounts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  avatar_url TEXT,
  followers INTEGER NOT NULL DEFAULT 0,
  growth REAL NOT NULL DEFAULT 0,
  last_sync_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  master_prompt TEXT NOT NULL,
  master_copy TEXT NOT NULL,
  tone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'scheduled', 'published')),
  scheduled_for TEXT,
  published_at TEXT,
  first_comment TEXT,
  media_id TEXT,
  media_url TEXT,
  aspect_ratio TEXT,
  focal_x REAL NOT NULL DEFAULT 50,
  focal_y REAL NOT NULL DEFAULT 50,
  carousel INTEGER NOT NULL DEFAULT 0,
  captions_json TEXT,
  hashtags_json TEXT,
  platforms_json TEXT,
  metrics_json TEXT,
  peak_json TEXT,
  evergreen INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS post_variants (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  hashtags TEXT,
  aspect_ratio TEXT,
  focal_x REAL,
  focal_y REAL,
  media_url TEXT,
  captions_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (post_id, platform)
);

CREATE TABLE IF NOT EXISTS inbox_threads (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  kind TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_handle TEXT NOT NULL,
  initials TEXT,
  avatar_tone TEXT,
  bio TEXT,
  followers INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  member_since TEXT,
  post_title TEXT,
  post_excerpt TEXT,
  labels_json TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  sentiment TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inbox_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES inbox_threads(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_handle TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('comment', 'dm', 'mention')),
  content TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  direction TEXT NOT NULL DEFAULT 'in' CHECK (direction IN ('in', 'out')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transcriptions (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL UNIQUE,
  language TEXT,
  provider TEXT,
  srt TEXT,
  words_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_status_scheduled ON posts (status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_variants_post ON post_variants (post_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON inbox_messages (thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_threads_updated ON inbox_threads (updated_at);
