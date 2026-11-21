-- Links a chat lead to its chat, so the leads site can open the transcript. Empty for forms and for older chat leads.
ALTER TABLE leads ADD COLUMN chat_session_id TEXT;
CREATE INDEX IF NOT EXISTS leads_chat_session ON leads (chat_session_id);
