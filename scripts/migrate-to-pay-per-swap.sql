-- Voeg first_swap_free toe aan users tabel
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_swap_free BOOLEAN DEFAULT true;

-- Voeg confirmation kolommen toe aan exchanges tabel
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS requester_confirmed BOOLEAN DEFAULT false;
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS host_confirmed BOOLEAN DEFAULT false;
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS stripe_payment_session_id TEXT;
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS payment_amount INTEGER;

-- Zet alle bestaande gebruikers op first_swap_free = true
UPDATE users SET first_swap_free = true WHERE first_swap_free IS NULL;

-- Maak de kolom NOT NULL
ALTER TABLE users ALTER COLUMN first_swap_free SET NOT NULL;
