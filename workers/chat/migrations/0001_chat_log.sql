-- Masked Ask Sparky chats, deleted after 30 days. No raw IP addresses, names or emails from the lead card.
CREATE TABLE IF NOT EXISTS chat_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  session_id TEXT NOT NULL,
  turn INTEGER NOT NULL,
  page TEXT NOT NULL DEFAULT '',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  action TEXT NOT NULL,
  decision TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS chat_log_created ON chat_log (created_at);
