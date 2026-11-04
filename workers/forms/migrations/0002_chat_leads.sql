-- Chat leads use the same table (FR-906). SQLite cannot change a CHECK, so the table is rebuilt.
CREATE TABLE leads_next (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('beta', 'enquiry', 'chat')),
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business TEXT,
  country TEXT,
  topic TEXT,
  message TEXT,
  business_type TEXT,
  first_task TEXT,
  source_page TEXT,
  contact_consent_at TEXT NOT NULL,
  marketing_consent INTEGER NOT NULL DEFAULT 0 CHECK (marketing_consent IN (0, 1)),
  marketing_consent_at TEXT,
  consent_wording_version TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Accepted', 'Declined')),
  notes TEXT NOT NULL DEFAULT ''
);

INSERT INTO leads_next (
  id, type, created_at, name, email, business, country, topic, message, business_type, first_task,
  source_page, contact_consent_at, marketing_consent, marketing_consent_at, consent_wording_version, status, notes
)
SELECT
  id, type, created_at, name, email, business, country, topic, message, business_type, first_task,
  source_page, contact_consent_at, marketing_consent, marketing_consent_at, consent_wording_version, status, notes
FROM leads;

DROP TABLE leads;
ALTER TABLE leads_next RENAME TO leads;
CREATE INDEX leads_type_created ON leads (type, created_at DESC);
