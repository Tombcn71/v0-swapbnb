-- Check current credits for all users
SELECT 
    u.id,
    u.name,
    u.email,
    u.credits,
    u.created_at as user_created
FROM users u
ORDER BY u.created_at DESC;

-- Check credit transactions
SELECT 
    ct.id,
    ct.user_id,
    u.name,
    ct.amount,
    ct.transaction_type,
    ct.description,
    ct.created_at
FROM credits_transactions ct
JOIN users u ON ct.user_id = u.id
ORDER BY ct.created_at DESC;

-- Check for users with 0 credits but no welcome transaction
SELECT 
    u.id,
    u.name,
    u.email,
    u.credits,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM credits_transactions ct 
            WHERE ct.user_id = u.id AND ct.transaction_type = 'welcome'
        ) THEN 'Has welcome transaction'
        ELSE 'Missing welcome transaction'
    END as welcome_status
FROM users u
WHERE u.credits = 0 OR u.credits IS NULL;
