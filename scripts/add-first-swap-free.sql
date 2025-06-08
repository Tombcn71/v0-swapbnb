-- Stap 1: Voeg first_swap_free kolom toe
ALTER TABLE users ADD COLUMN first_swap_free BOOLEAN DEFAULT true;

-- Stap 2: Update alle bestaande users
UPDATE users SET first_swap_free = true;

-- Stap 3: Maak kolom NOT NULL
ALTER TABLE users ALTER COLUMN first_swap_free SET NOT NULL;
