-- Voeg delete flags toe aan exchanges tabel
ALTER TABLE exchanges 
ADD COLUMN IF NOT EXISTS deleted_by_requester BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_by_host BOOLEAN DEFAULT FALSE;

-- Voeg is_quick_reply veld toe aan messages tabel als het nog niet bestaat
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_quick_reply BOOLEAN DEFAULT FALSE;
