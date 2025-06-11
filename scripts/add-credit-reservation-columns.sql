-- Voeg kolommen toe voor credit reservering
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS requester_credit_reserved BOOLEAN DEFAULT false;
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS host_credit_reserved BOOLEAN DEFAULT false;

-- Update bestaande exchanges waar de requester al een credit heeft gebruikt
UPDATE exchanges SET requester_credit_reserved = true WHERE status != 'cancelled' AND status != 'rejected';
