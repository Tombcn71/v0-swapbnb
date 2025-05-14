-- Voeg een image kolom toe aan de users tabel als deze nog niet bestaat
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;
