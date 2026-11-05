-- Who removed a lead, and when. The name, email and message are not copied here.
CREATE TABLE lead_deletions (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  lead_type TEXT NOT NULL,
  deleted_by TEXT NOT NULL,
  deleted_at TEXT NOT NULL
);
