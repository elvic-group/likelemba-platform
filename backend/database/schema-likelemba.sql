-- Likelemba Database Schema
-- ROSCA (Rotating Savings Groups) Platform
-- PostgreSQL Database Schema
-- Uses 'likelemba' schema to avoid conflicts with existing tables

-- Create schema
CREATE SCHEMA IF NOT EXISTS likelemba;
SET search_path TO likelemba, public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_e164 VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  locale VARCHAR(10) DEFAULT 'en',
  status VARCHAR(50) DEFAULT 'active',
  pin_hash VARCHAR(255),
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member',
  current_service VARCHAR(50),
  current_step VARCHAR(50),
  context JSONB,
  session_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON likelemba.users(phone_e164);
CREATE INDEX IF NOT EXISTS idx_users_status ON likelemba.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON likelemba.users(role);

-- Auth sessions
CREATE TABLE IF NOT EXISTS likelemba.auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES likelemba.users(id) ON DELETE CASCADE,
  otp_hash VARCHAR(255),
  otp_expires_at TIMESTAMP,
  device_fingerprint VARCHAR(255),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON likelemba.auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON likelemba.auth_sessions(otp_expires_at);

-- ============================================
-- GROUPS & MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES likelemba.users(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  contribution_amount DECIMAL(15, 2) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  members_count INTEGER NOT NULL,
  payout_order_type VARCHAR(50) DEFAULT 'random',
  rules_json JSONB DEFAULT '{}',
  invite_code VARCHAR(50) UNIQUE NOT NULL,
  invite_link VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_owner ON likelemba.groups(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON likelemba.groups(invite_code);
CREATE INDEX IF NOT EXISTS idx_groups_status ON likelemba.groups(status);

CREATE TABLE IF NOT EXISTS likelemba.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES likelemba.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES likelemba.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON likelemba.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON likelemba.group_members(user_id);

-- ============================================
-- CYCLES & CONTRIBUTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES likelemba.groups(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payout_date DATE,
  payout_order_json JSONB DEFAULT '[]',
  current_recipient_user_id UUID REFERENCES likelemba.users(id),
  quorum_met BOOLEAN DEFAULT FALSE,
  quorum_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, cycle_number)
);

CREATE INDEX IF NOT EXISTS idx_cycles_group ON likelemba.cycles(group_id);
CREATE INDEX IF NOT EXISTS idx_cycles_status ON likelemba.cycles(status);
CREATE INDEX IF NOT EXISTS idx_cycles_due_date ON likelemba.cycles(due_date);

CREATE TABLE IF NOT EXISTS likelemba.contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES likelemba.cycles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES likelemba.users(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL,
  due_at TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  late_fee DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contributions_cycle ON likelemba.contributions(cycle_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON likelemba.contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON likelemba.contributions(status);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contribution_id UUID REFERENCES likelemba.contributions(id) ON DELETE RESTRICT,
  provider VARCHAR(50) NOT NULL,
  provider_ref VARCHAR(255) UNIQUE,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  status VARCHAR(50) DEFAULT 'pending',
  platform_commission DECIMAL(15, 2) DEFAULT 0,
  commission_rate DECIMAL(5, 4) DEFAULT 0.05,
  stripe_fee DECIMAL(15, 2) DEFAULT 0,
  stripe_fee_details JSONB,
  net_amount DECIMAL(15, 2),
  raw_payload_json JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_contribution ON likelemba.payments(contribution_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON likelemba.payments(provider_ref);

-- ============================================
-- ESCROW
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.escrow_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES likelemba.groups(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES likelemba.cycles(id) ON DELETE CASCADE,
  balance_available DECIMAL(15, 2) DEFAULT 0,
  balance_frozen DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'KES',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, cycle_id)
);

CREATE INDEX IF NOT EXISTS idx_escrow_group ON likelemba.escrow_accounts(group_id);
CREATE INDEX IF NOT EXISTS idx_escrow_cycle ON likelemba.escrow_accounts(cycle_id);

CREATE TABLE IF NOT EXISTS likelemba.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  escrow_account_id UUID REFERENCES likelemba.escrow_accounts(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PAYOUTS
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES likelemba.cycles(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES likelemba.users(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  provider VARCHAR(50),
  provider_ref VARCHAR(255),
  status VARCHAR(50) DEFAULT 'scheduled',
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_cycle ON likelemba.payouts(cycle_id);
CREATE INDEX IF NOT EXISTS idx_payouts_recipient ON likelemba.payouts(recipient_user_id);

-- ============================================
-- REFUNDS & DISPUTES
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES likelemba.payments(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  reason TEXT,
  status VARCHAR(50) DEFAULT 'requested',
  requested_by_user_id UUID REFERENCES likelemba.users(id),
  approved_by_user_id UUID REFERENCES likelemba.users(id),
  provider_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likelemba.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES likelemba.groups(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES likelemba.cycles(id) ON DELETE CASCADE,
  opened_by_user_id UUID REFERENCES likelemba.users(id) ON DELETE RESTRICT,
  dispute_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'opened',
  outcome VARCHAR(50),
  outcome_amount DECIMAL(15, 2),
  resolved_by_user_id UUID REFERENCES likelemba.users(id),
  resolved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likelemba.dispute_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID REFERENCES likelemba.disputes(id) ON DELETE CASCADE,
  evidence_type VARCHAR(50),
  file_url VARCHAR(500),
  description TEXT,
  uploaded_by_user_id UUID REFERENCES likelemba.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- LEDGER (Event Store)
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.ledger_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  occurred_at TIMESTAMP DEFAULT NOW(),
  actor_type VARCHAR(50),
  actor_id UUID,
  subject_type VARCHAR(50),
  subject_id UUID,
  group_id UUID REFERENCES likelemba.groups(id) ON DELETE SET NULL,
  cycle_id UUID REFERENCES likelemba.cycles(id) ON DELETE SET NULL,
  payload_json JSONB NOT NULL,
  hash_chain VARCHAR(255),
  previous_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_events_event_id ON likelemba.ledger_events(event_id);
CREATE INDEX IF NOT EXISTS idx_ledger_events_event_type ON likelemba.ledger_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ledger_events_occurred_at ON likelemba.ledger_events(occurred_at);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES likelemba.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  related_group_id UUID REFERENCES likelemba.groups(id) ON DELETE SET NULL,
  related_cycle_id UUID REFERENCES likelemba.cycles(id) ON DELETE SET NULL,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likelemba.scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contribution_id UUID REFERENCES likelemba.contributions(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50),
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AI AGENT
-- ============================================

CREATE TABLE IF NOT EXISTS likelemba.conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES likelemba.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  intent_json JSONB,
  tool_calls_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION likelemba.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON likelemba.users
  FOR EACH ROW EXECUTE FUNCTION likelemba.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON likelemba.groups
  FOR EACH ROW EXECUTE FUNCTION likelemba.update_updated_at_column();

CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON likelemba.cycles
  FOR EACH ROW EXECUTE FUNCTION likelemba.update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON likelemba.contributions
  FOR EACH ROW EXECUTE FUNCTION likelemba.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON likelemba.payments
  FOR EACH ROW EXECUTE FUNCTION likelemba.update_updated_at_column();

CREATE TRIGGER update_escrow_accounts_updated_at BEFORE UPDATE ON likelemba.escrow_accounts
  FOR EACH ROW EXECUTE FUNCTION likelemba.update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON likelemba.payouts
  FOR EACH ROW EXECUTE FUNCTION likelemba.update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON likelemba.refunds
  FOR EACH ROW EXECUTE FUNCTION likelemba.update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON likelemba.disputes
  FOR EACH ROW EXECUTE FUNCTION likelemba.update_updated_at_column();

