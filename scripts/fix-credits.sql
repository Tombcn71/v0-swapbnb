-- Reset credits to 1 for users who should have welcome credit but don't
UPDATE users 
SET credits = 1 
WHERE (credits = 0 OR credits IS NULL)
AND NOT EXISTS (
    SELECT 1 FROM credits_transactions ct 
    WHERE ct.user_id = users.id AND ct.transaction_type = 'welcome'
);

-- Add welcome transaction for users who got the credit but don't have the transaction record
INSERT INTO credits_transactions (user_id, amount, transaction_type, description, created_at)
SELECT 
    u.id,
    1,
    'welcome',
    'Welkom credit voor nieuwe gebruiker (herstel)',
    NOW()
FROM users u
WHERE u.credits >= 1
AND NOT EXISTS (
    SELECT 1 FROM credits_transactions ct 
    WHERE ct.user_id = u.id AND ct.transaction_type = 'welcome'
);

-- Verify the fix
SELECT 
    u.id,
    u.name,
    u.credits,
    COUNT(ct.id) as transaction_count
FROM users u
LEFT JOIN credits_transactions ct ON u.id = ct.user_id
GROUP BY u.id, u.name, u.credits
ORDER BY u.created_at DESC;
