-- How Sparky filed each turn: any mix of lead, feedback and feature_request.
ALTER TABLE chat_log ADD COLUMN capture TEXT NOT NULL DEFAULT '';
