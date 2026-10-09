import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export const Analytics = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchTrades = async () => {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('trade_date', { ascending: true });
        
      setTrades(data || []);
      setLoading(false);
    };

    fetchTrades();
  }, [user]);

  // Calculate metrics
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.profit_loss > 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  
  const netPnl = trades.reduce((acc, t) => acc + (t.profit_loss || 0), 0);
  
  const calculateScore = (t: any) => {
    let score = 100;
    if (!t.followed_plan) score -= 20;
    if (t.fomo) score -= 20;
    if (t.moved_stop_loss) score -= 20;
    if (t.revenge_trade) score -= 20;
    if (t.overtrade) score -= 20;
    return Math.max(0, score);
  };
  
  const avgScore = totalTrades > 0 
    ? Math.round(trades.reduce((acc, t) => acc + calculateScore(t), 0) / totalTrades)
    : 100;

  // Group trades by date for the chart
  const pnlData = trades.reduce((acc: any[], trade) => {
    const existing = acc.find(d => d.date === trade.trade_date);
    if (existing) {
      existing.pnl += (trade.profit_loss || 0);
    } else {
      acc.push({ date: trade.trade_date, pnl: (trade.profit_loss || 0) });
    }
    return acc;
  }, []);

  const grossProfit = trades.filter(t => t.profit_loss > 0).reduce((acc, t) => acc + t.profit_loss, 0);
  const grossLoss = Math.abs(trades.filter(t => t.profit_loss <= 0).reduce((acc, t) => acc + t.profit_loss, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00';

  // Last 25 trades sequence
  const recentTradesSequence = trades.slice(-25).map(t => t.profit_loss > 0 ? 'W' : 'L');

  if (loading) {
    return <div className="p-6 text-center text-textMuted">Loading analytics...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Analytics & Performance</h1>
          <p className="text-textMuted mt-1">Deep dive into your trading metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface/40 backdrop-blur-md border border-surfaceHighlight p-4 rounded-xl">
          <p className="text-xs text-textMuted uppercase mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-textMain">{winRate}%</p>
        </div>
        <div className="bg-surface/40 backdrop-blur-md border border-surfaceHighlight p-4 rounded-xl">
          <p className="text-xs text-textMuted uppercase mb-1">Net P&L</p>
          <p className={`text-2xl font-bold ${netPnl >= 0 ? 'text-primary' : 'text-danger'}`}>
            {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
          </p>
        </div>
        <div className="bg-surface/40 backdrop-blur-md border border-surfaceHighlight p-4 rounded-xl">
          <p className="text-xs text-textMuted uppercase mb-1">Profit Factor</p>
          <p className={`text-2xl font-bold ${parseFloat(profitFactor) >= 1 ? 'text-success' : 'text-danger'}`}>
            {profitFactor}
          </p>
        </div>
        <div className="bg-surface/40 backdrop-blur-md border border-surfaceHighlight p-4 rounded-xl">
          <p className="text-xs text-textMuted uppercase mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-textMain">{totalTrades}</p>
        </div>
        <div className="bg-surface/40 backdrop-blur-md border border-surfaceHighlight p-4 rounded-xl">
          <p className="text-xs text-textMuted uppercase mb-1">Avg Score</p>
          <p className={`text-2xl font-bold ${avgScore >= 80 ? 'text-success' : 'text-danger'}`}>{avgScore}</p>
        </div>
      </div>

      {/* Recent Sequence */}
      {recentTradesSequence.length > 0 && (
        <div className="bg-surface/40 backdrop-blur-md border border-surfaceHighlight rounded-xl p-6 overflow-hidden">
          <h3 className="font-medium text-textMain mb-4">Recent Form (Last {recentTradesSequence.length} Trades)</h3>
          <div className="flex flex-wrap gap-2">
            {recentTradesSequence.map((result, idx) => (
              <span 
                key={idx} 
                className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                  result === 'W' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                }`}
              >
                {result}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Daily P&L Chart */}
      <div className="bg-surface/40 backdrop-blur-md border border-surfaceHighlight rounded-xl p-6">
        <h3 className="font-medium text-textMain mb-6">Daily P&L</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pnlData}>
              <defs>
                <linearGradient id="colorPnlPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00D2FF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPnlNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3333" stopOpacity={0}/>
                  <stop offset="95%" stopColor="#FF3333" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
              <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#1A1A1A', color: '#FFFFFF', borderRadius: '8px' }}
                itemStyle={{ color: '#00D2FF' }}
              />
              <Area 
                type="monotone" 
                dataKey="pnl" 
                stroke="#00D2FF" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPnlPos)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
