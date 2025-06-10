-- Voeg is_quick_reply kolom toe aan messages tabel
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_quick_reply BOOLEAN DEFAULT FALSE;

-- Voeg quick_reply_used kolom toe aan exchanges tabel
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS quick_reply_used BOOLEAN DEFAULT FALSE;
