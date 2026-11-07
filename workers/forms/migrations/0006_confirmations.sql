-- When the confirmation email went to the visitor. Empty when none was sent.
ALTER TABLE leads ADD COLUMN confirmation_sent_at TEXT;
CREATE INDEX IF NOT EXISTS leads_email_created ON leads (email, created_at);
