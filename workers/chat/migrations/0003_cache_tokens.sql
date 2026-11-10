-- Prompt cache tokens per turn, so we can see the cache is hitting. input_tokens stays the total of all three.
ALTER TABLE chat_log ADD COLUMN cache_write_tokens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE chat_log ADD COLUMN cache_read_tokens INTEGER NOT NULL DEFAULT 0;
