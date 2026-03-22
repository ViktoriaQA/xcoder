-- Додавання wallet_id до recurring_subscriptions таблиці
-- Це поле потрібно для зберігання ID гаманця Monobank

-- Перевірка чи існує колонка wallet_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recurring_subscriptions' AND column_name = 'wallet_id'
    ) THEN
        ALTER TABLE recurring_subscriptions 
        ADD COLUMN wallet_id TEXT NOT NULL DEFAULT '';
        
        -- Створення індексу для wallet_id
        CREATE INDEX IF NOT EXISTS idx_recurring_subscriptions_wallet_id 
        ON recurring_subscriptions(wallet_id);
        
        -- Додавання коментаря
        COMMENT ON COLUMN recurring_subscriptions.wallet_id IS 'Monobank wallet ID for storing user cards';
        
        RAISE NOTICE 'wallet_id column added to recurring_subscriptions table';
    ELSE
        RAISE NOTICE 'wallet_id column already exists in recurring_subscriptions table';
    END IF;
END $$;

-- Оновлення існуючих записів з wallet_id на основі user_id
UPDATE recurring_subscriptions 
SET wallet_id = 'user_' || user_id::text 
WHERE wallet_id = '' OR wallet_id IS NULL;
