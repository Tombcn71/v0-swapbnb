-- Wis alle exchanges
DELETE FROM exchanges;

-- Reset de sequence als je wilt dat IDs weer bij 1 beginnen
ALTER SEQUENCE exchanges_id_seq RESTART WITH 1;
