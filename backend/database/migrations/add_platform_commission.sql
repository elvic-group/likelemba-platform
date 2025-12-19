-- Migration: Add Platform Commission Tracking
-- Date: 2024-12-19
-- Description: Adds commission fields to payments table and creates platform_commissions table

-- Add commission fields to payments table
ALTER TABLE likelemba.payments 
ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 4) DEFAULT 0.05,
ADD COLUMN IF NOT EXISTS stripe_fee DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_fee_details JSONB,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(15, 2);

-- Create platform commissions tracking table
CREATE TABLE IF NOT EXISTS likelemba.platform_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES likelemba.payments(id) ON DELETE RESTRICT,
  contribution_id UUID REFERENCES likelemba.contributions(id) ON DELETE RESTRICT,
  group_id UUID REFERENCES likelemba.groups(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES likelemba.cycles(id) ON DELETE CASCADE,
  gross_amount DECIMAL(15, 2) NOT NULL,
  commission_amount DECIMAL(15, 2) NOT NULL,
  commission_rate DECIMAL(5, 4) NOT NULL,
  net_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  status VARCHAR(50) DEFAULT 'collected', -- collected, refunded
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_payment ON likelemba.platform_commissions(payment_id);
CREATE INDEX IF NOT EXISTS idx_commissions_contribution ON likelemba.platform_commissions(contribution_id);
CREATE INDEX IF NOT EXISTS idx_commissions_group ON likelemba.platform_commissions(group_id);
CREATE INDEX IF NOT EXISTS idx_commissions_cycle ON likelemba.platform_commissions(cycle_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON likelemba.platform_commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created ON likelemba.platform_commissions(created_at);

-- Add comment
COMMENT ON TABLE likelemba.platform_commissions IS 'Tracks platform commission collected from each payment';
COMMENT ON COLUMN likelemba.payments.platform_commission IS 'Platform commission amount (5% default)';
COMMENT ON COLUMN likelemba.payments.commission_rate IS 'Commission rate as decimal (0.05 = 5%)';
COMMENT ON COLUMN likelemba.payments.stripe_fee IS 'Stripe processing fee (deducted by Stripe)';
COMMENT ON COLUMN likelemba.payments.stripe_fee_details IS 'Stripe fee breakdown (JSON: percentage, fixed, card type)';
COMMENT ON COLUMN likelemba.payments.net_amount IS 'Net amount after commission (goes to escrow)';

