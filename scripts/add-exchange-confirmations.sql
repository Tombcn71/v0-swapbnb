-- Voeg confirmation kolommen toe aan exchanges
ALTER TABLE exchanges ADD COLUMN requester_confirmed BOOLEAN DEFAULT false;
ALTER TABLE exchanges ADD COLUMN host_confirmed BOOLEAN DEFAULT false;
ALTER TABLE exchanges ADD COLUMN stripe_payment_session_id TEXT;
ALTER TABLE exchanges ADD COLUMN payment_amount INTEGER;
