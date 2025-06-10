-- Wis alle exchanges en gerelateerde data
DELETE FROM exchanges;

-- Reset de sequence zodat IDs weer bij 1 beginnen
ALTER SEQUENCE exchanges_id_seq RESTART WITH 1;

-- Optioneel: wis ook gerelateerde berichten als die bestaan
-- DELETE FROM messages WHERE exchange_id IS NOT NULL;
