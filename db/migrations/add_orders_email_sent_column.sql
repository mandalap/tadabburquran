-- Add email_sent column to orders table
-- This column tracks whether confirmation email has been sent for an order

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'email_sent'
    ) THEN
        ALTER TABLE orders ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add index for faster queries on email_sent status
CREATE INDEX IF NOT EXISTS idx_orders_email_sent ON orders(email_sent);

-- Add comment for documentation
COMMENT ON COLUMN orders.email_sent IS 'Tracks whether confirmation email has been sent for this order';
