-- Readable lead numbers. The existing id column stays the key for every database action.
ALTER TABLE leads ADD COLUMN public_id TEXT;

UPDATE leads
SET public_id = (
  SELECT 'L-' || printf('%04d', COUNT(*))
  FROM leads AS older
  WHERE older.created_at < leads.created_at
     OR (older.created_at = leads.created_at AND older.id <= leads.id)
)
WHERE public_id IS NULL;

CREATE TABLE lead_numbers (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_assigned INTEGER NOT NULL
);

INSERT INTO lead_numbers (id, last_assigned)
SELECT 1, COUNT(*) FROM leads;

CREATE UNIQUE INDEX leads_public_id ON leads (public_id);
