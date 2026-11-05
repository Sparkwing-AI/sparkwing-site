-- Repeat-source hint and approximate location. The hash is HMAC-SHA-256, never a raw IP.
-- Older rows stay empty. Nothing here is required for a lead to save.
ALTER TABLE leads ADD COLUMN ip_hash TEXT;
ALTER TABLE leads ADD COLUMN detected_country TEXT;
ALTER TABLE leads ADD COLUMN detected_region TEXT;
CREATE INDEX leads_ip_hash ON leads (ip_hash);
