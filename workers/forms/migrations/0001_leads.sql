-- One table for both forms (FR-906). Beta rows fill business_type and first_task. Enquiry rows fill topic and message.
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('beta', 'enquiry')),
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

CREATE INDEX leads_type_created ON leads (type, created_at DESC);
