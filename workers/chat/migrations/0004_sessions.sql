-- One row per chat, with no visitor text and no IP address. Kept with no end date, so the numbers outlive the 90-day transcripts.
CREATE TABLE IF NOT EXISTS chat_sessions (
  session_id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  start_page TEXT NOT NULL DEFAULT '',
  last_page TEXT NOT NULL DEFAULT '',
  turns INTEGER NOT NULL DEFAULT 0,
  offered INTEGER NOT NULL DEFAULT 0,
  lead_sent INTEGER NOT NULL DEFAULT 0,
  -- active, lead, cap, off_topic, left, no_message. The nightly job settles anything still active.
  outcome TEXT NOT NULL DEFAULT 'active',
  -- Empty, or injection, gibberish, fast, off_topic. Set by the nightly job.
  flag TEXT NOT NULL DEFAULT '',
  -- A fixed topic id from the rubric. Null until the nightly job has labelled it.
  topic TEXT,
  settled INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS chat_sessions_started ON chat_sessions (started_at);
