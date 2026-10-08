export type DisciplineStatus = 'DISCIPLINED TRADER' | 'MOSTLY DISCIPLINED' | 'CAUTION' | 'INDISCIPLINED TRADER';
export type TradeResult = 'WIN' | 'LOSS' | 'BREAKEVEN';
export type TradeDirection = 'BUY' | 'SELL';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  timezone: string;
  currency: string;
}

export interface TradingRules {
  id: string;
  user_id: string;
  max_daily_loss: number | null;
  max_daily_profit: number | null;
  max_trades_per_day: number | null;
  default_risk_per_trade: number | null;
}

export interface Trade {
  id: string;
  user_id: string;
  trade_date: string;
  trade_time: string | null;
  symbol: string;
  direction: TradeDirection;
  session: string | null;
  setup_types: string[] | null;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  exit_price: number | null;
  lot_size: number | null;
  risk_amount: number | null;
  risk_percent: number | null;
  profit_loss: number | null;
  r_multiple: number | null;
  result: TradeResult | null;
  
  before_emotion: string | null;
  after_emotion: string | null;
  
  followed_plan: boolean | null;
  planned_setup: boolean | null;
  fomo: boolean | null;
  moved_stop_loss: boolean | null;
  moved_take_profit: boolean | null;
  revenge_trade: boolean | null;
  overtrade: boolean | null;
  
  trade_reason: string | null;
  market_analysis: string | null;
  entry_reason: string | null;
  exit_reason: string | null;
  
  what_went_well: string | null;
  what_went_wrong: string | null;
  lesson_learned: string | null;
  
  override_used: boolean;
  override_reason: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  id: string;
  user_id: string;
  trade_date: string;
  
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
  
  gross_profit: number;
  gross_loss: number;
  net_profit: number;
  
  win_rate: number | null;
  average_win: number | null;
  average_loss: number | null;
  
  largest_win: number | null;
  largest_loss: number | null;
  
  total_r: number | null;
  average_r: number | null;
  
  discipline_score: number | null;
  
  risk_management_score: number | null;
  trade_frequency_score: number | null;
  profit_protection_score: number | null;
  trading_plan_score: number | null;
  
  discipline_status: DisciplineStatus | null;
  
  daily_loss_limit_breached: boolean;
  daily_profit_target_reached: boolean;
  trade_limit_breached: boolean;
  
  rule_violations: number;
  
  daily_reflection: string | null;
  
  created_at: string;
  updated_at: string;
}
