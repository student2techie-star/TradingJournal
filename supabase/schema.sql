-- supabase/schema.sql

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trading_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_daily_loss NUMERIC(12,2),
  max_daily_profit NUMERIC(12,2),
  max_trades_per_day INTEGER,
  default_risk_per_trade NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  trade_time TIMESTAMPTZ,
  symbol TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('BUY', 'SELL')),
  session TEXT,
  setup_types TEXT[],
  lot_size NUMERIC(12,4),
  risk_amount NUMERIC(12,2),
  risk_percent NUMERIC(8,4),
  profit_loss NUMERIC(12,2),
  before_emotion TEXT,
  after_emotion TEXT,
  followed_plan BOOLEAN,
  planned_setup BOOLEAN,
  fomo BOOLEAN,
  moved_stop_loss BOOLEAN,
  moved_take_profit BOOLEAN,
  revenge_trade BOOLEAN,
  overtrade BOOLEAN,
  lesson_learned TEXT,
  override_used BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  breakeven_trades INTEGER DEFAULT 0,
  gross_profit NUMERIC(12,2) DEFAULT 0,
  gross_loss NUMERIC(12,2) DEFAULT 0,
  net_profit NUMERIC(12,2) DEFAULT 0,
  win_rate NUMERIC(8,2),
  average_win NUMERIC(12,2),
  average_loss NUMERIC(12,2),
  largest_win NUMERIC(12,2),
  largest_loss NUMERIC(12,2),
  total_r NUMERIC(12,4),
  average_r NUMERIC(12,4),
  discipline_score NUMERIC(5,2),
  risk_management_score NUMERIC(5,2),
  trade_frequency_score NUMERIC(5,2),
  profit_protection_score NUMERIC(5,2),
  trading_plan_score NUMERIC(5,2),
  discipline_status TEXT,
  daily_loss_limit_breached BOOLEAN DEFAULT FALSE,
  daily_profit_target_reached BOOLEAN DEFAULT FALSE,
  trade_limit_breached BOOLEAN DEFAULT FALSE,
  rule_violations INTEGER DEFAULT 0,
  daily_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trade_date)
);

CREATE INDEX idx_trades_user_date ON trades(user_id, trade_date);
CREATE INDEX idx_trades_user_symbol ON trades(user_id, symbol);
CREATE INDEX idx_trades_user_created ON trades(user_id, created_at);
CREATE INDEX idx_daily_summary_user_date ON daily_summaries(user_id, trade_date);
