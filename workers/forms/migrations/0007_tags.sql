-- Chat captures can be a lead, feedback and a feature request at once. Comma-separated, empty for forms.
ALTER TABLE leads ADD COLUMN tags TEXT NOT NULL DEFAULT '';
