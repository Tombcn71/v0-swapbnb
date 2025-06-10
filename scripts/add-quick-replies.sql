-- Voeg quick reply velden toe aan exchanges tabel
ALTER TABLE exchanges 
ADD COLUMN IF NOT EXISTS quick_replies_shown BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS quick_reply_used BOOLEAN DEFAULT FALSE;

-- Voeg is_quick_reply veld toe aan messages tabel
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_quick_reply BOOLEAN DEFAULT FALSE;

-- Update bestaande exchanges om quick_replies_shown op true te zetten voor pending swaps
UPDATE exchanges 
SET quick_replies_shown = TRUE 
WHERE status = 'pending';
