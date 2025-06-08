-- Voeg first_swap_free toe aan users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_swap_free BOOLEAN DEFAULT true;

-- Verwijder credit gerelateerde kolommen uit exchanges
ALTER TABLE exchanges DROP COLUMN IF EXISTS requester_credits_paid;
ALTER TABLE exchanges DROP COLUMN IF EXISTS host_credits_paid;

-- Voeg Stripe payment session tracking toe
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS stripe_payment_session_id VARCHAR(255);
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS payment_amount INTEGER DEFAULT 0;

-- Update bestaande users om first_swap_free op true te zetten
UPDATE users SET first_swap_free = true WHERE first_swap_free IS NULL;

-- Maak first_swap_free NOT NULL
ALTER TABLE users ALTER COLUMN first_swap_free SET NOT NULL;
