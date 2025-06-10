-- Voeg read_at kolom toe aan messages tabel
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Voeg quick reply kolommen toe aan exchanges tabel
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS quick_reply_used BOOLEAN DEFAULT FALSE;
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS quick_replies_shown BOOLEAN DEFAULT FALSE;

-- Voeg is_quick_reply kolom toe aan messages tabel
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_quick_reply BOOLEAN DEFAULT FALSE;

-- Voeg deleted_by kolommen toe voor soft delete functionaliteit
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS deleted_by_requester BOOLEAN DEFAULT FALSE;
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS deleted_by_host BOOLEAN DEFAULT FALSE;
