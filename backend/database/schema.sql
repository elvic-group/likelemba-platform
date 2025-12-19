-- Likelemba Database Schema
-- ROSCA (Rotating Savings Groups) Platform
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_e164 VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  locale VARCHAR(10) DEFAULT 'en',
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, banned
  pin_hash VARCHAR(255), -- 4-6 digit PIN for sensitive actions
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member', -- member, group_admin, platform_admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_e164);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- Auth sessions (OTP, device binding)
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  otp_hash VARCHAR(255),
  otp_expires_at TIMESTAMP,
  device_fingerprint VARCHAR(255),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires ON auth_sessions(otp_expires_at);

-- ============================================
-- GROUPS & MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  contribution_amount DECIMAL(15, 2) NOT NULL,
  frequency VARCHAR(50) NOT NULL, -- weekly, biweekly, monthly
  start_date DATE NOT NULL,
  members_count INTEGER NOT NULL,
  payout_order_type VARCHAR(50) DEFAULT 'random', -- random, choose, auction, manual
  rules_json JSONB DEFAULT '{}',
  invite_code VARCHAR(50) UNIQUE NOT NULL,
  invite_link VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active', -- active, completed, canceled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_groups_owner ON groups(owner_user_id);
CREATE INDEX idx_groups_invite_code ON groups(invite_code);
CREATE INDEX idx_groups_status ON groups(status);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- member, admin
  status VARCHAR(50) DEFAULT 'active', -- active, removed, left
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_status ON group_members(status);

-- ============================================
-- CYCLES (ROUNDS)
-- ============================================

CREATE TABLE IF NOT EXISTS cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payout_date DATE,
  payout_order_json JSONB DEFAULT '[]', -- Array of user IDs in payout order
  current_recipient_user_id UUID REFERENCES users(id),
  quorum_met BOOLEAN DEFAULT FALSE,
  quorum_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed, canceled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, cycle_number)
);

CREATE INDEX idx_cycles_group ON cycles(group_id);
CREATE INDEX idx_cycles_status ON cycles(status);
CREATE INDEX idx_cycles_due_date ON cycles(due_date);

-- ============================================
-- CONTRIBUTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL,
  due_at TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  late_fee DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, waived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contributions_cycle ON contributions(cycle_id);
CREATE INDEX idx_contributions_user ON contributions(user_id);
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_contributions_due_at ON contributions(due_at);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contribution_id UUID REFERENCES contributions(id) ON DELETE RESTRICT,
  provider VARCHAR(50) NOT NULL, -- stripe, mpesa, orange, tigo
  provider_ref VARCHAR(255) UNIQUE, -- Payment Intent ID, transaction ID, etc.
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, succeeded, failed, refunded
  raw_payload_json JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_contribution ON payments(contribution_id);
CREATE INDEX idx_payments_provider_ref ON payments(provider_ref);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- ESCROW
-- ============================================

CREATE TABLE IF NOT EXISTS escrow_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  balance_available DECIMAL(15, 2) DEFAULT 0,
  balance_frozen DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'KES',
  status VARCHAR(50) DEFAULT 'active', -- active, frozen, released, closed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, cycle_id)
);

CREATE INDEX idx_escrow_group ON escrow_accounts(group_id);
CREATE INDEX idx_escrow_cycle ON escrow_accounts(cycle_id);
CREATE INDEX idx_escrow_status ON escrow_accounts(status);

-- Escrow transactions (deposits, releases, freezes)
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  escrow_account_id UUID REFERENCES escrow_accounts(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- deposit, release, freeze, unfreeze
  amount DECIMAL(15, 2) NOT NULL,
  reference_id UUID, -- payment_id, payout_id, dispute_id
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_escrow_transactions_account ON escrow_transactions(escrow_account_id);
CREATE INDEX idx_escrow_transactions_type ON escrow_transactions(transaction_type);

-- ============================================
-- PAYOUTS
-- ============================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  provider VARCHAR(50), -- stripe, mpesa, orange, tigo, bank
  provider_ref VARCHAR(255),
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, processing, completed, failed
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payouts_cycle ON payouts(cycle_id);
CREATE INDEX idx_payouts_recipient ON payouts(recipient_user_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_scheduled_at ON payouts(scheduled_at);

-- ============================================
-- REFUNDS
-- ============================================

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  reason TEXT,
  status VARCHAR(50) DEFAULT 'requested', -- requested, approved, executed, completed, failed, rejected
  requested_by_user_id UUID REFERENCES users(id),
  approved_by_user_id UUID REFERENCES users(id),
  provider_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_requested_by ON refunds(requested_by_user_id);

-- ============================================
-- DISPUTES
-- ============================================

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  opened_by_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  dispute_type VARCHAR(50) NOT NULL, -- payment_not_recorded, wrong_recipient, organizer_fraud, other
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'opened', -- opened, investigating, resolved, closed
  outcome VARCHAR(50), -- refund, chargeback, dismissed, partial_refund
  outcome_amount DECIMAL(15, 2),
  resolved_by_user_id UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_disputes_group ON disputes(group_id);
CREATE INDEX idx_disputes_cycle ON disputes(cycle_id);
CREATE INDEX idx_disputes_opened_by ON disputes(opened_by_user_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- Dispute evidence (screenshots, receipts, etc.)
CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  evidence_type VARCHAR(50), -- screenshot, receipt, message, other
  file_url VARCHAR(500),
  description TEXT,
  uploaded_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dispute_evidence_dispute ON dispute_evidence(dispute_id);

-- ============================================
-- LEDGER (Event Store - Append Only)
-- ============================================

CREATE TABLE IF NOT EXISTS ledger_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(255) UNIQUE NOT NULL, -- External event ID for idempotency
  event_type VARCHAR(100) NOT NULL,
  occurred_at TIMESTAMP DEFAULT NOW(),
  actor_type VARCHAR(50), -- user, system, admin
  actor_id UUID,
  subject_type VARCHAR(50), -- contribution, payment, payout, refund, dispute
  subject_id UUID,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  cycle_id UUID REFERENCES cycles(id) ON DELETE SET NULL,
  payload_json JSONB NOT NULL,
  hash_chain VARCHAR(255), -- For tamper detection
  previous_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ledger_events_event_id ON ledger_events(event_id);
CREATE INDEX idx_ledger_events_event_type ON ledger_events(event_type);
CREATE INDEX idx_ledger_events_occurred_at ON ledger_events(occurred_at);
CREATE INDEX idx_ledger_events_group ON ledger_events(group_id);
CREATE INDEX idx_ledger_events_cycle ON ledger_events(cycle_id);
CREATE INDEX idx_ledger_events_subject ON ledger_events(subject_type, subject_id);

-- ============================================
-- NOTIFICATIONS & REMINDERS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- reminder, payment_received, payout_scheduled, dispute_opened, etc.
  title VARCHAR(255),
  message TEXT,
  related_group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  related_cycle_id UUID REFERENCES cycles(id) ON DELETE SET NULL,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- Scheduled reminders
CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contribution_id UUID REFERENCES contributions(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50), -- due_soon, overdue, escalation
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, canceled
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scheduled_reminders_contribution ON scheduled_reminders(contribution_id);
CREATE INDEX idx_scheduled_reminders_scheduled_at ON scheduled_reminders(scheduled_at);
CREATE INDEX idx_scheduled_reminders_status ON scheduled_reminders(status);

-- ============================================
-- AI AGENT CONVERSATION HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  intent_json JSONB, -- Extracted intent if applicable
  tool_calls_json JSONB, -- Tool calls made by agent
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversation_history_user ON conversation_history(user_id);
CREATE INDEX idx_conversation_history_created_at ON conversation_history(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_accounts_updated_at BEFORE UPDATE ON escrow_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Create platform admin user (password: admin123 - change in production)
-- INSERT INTO users (phone_e164, display_name, role) 
-- VALUES ('+1234567890', 'Platform Admin', 'platform_admin')
-- ON CONFLICT (phone_e164) DO NOTHING;

