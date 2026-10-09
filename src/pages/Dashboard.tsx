import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  ShieldAlert,
  CheckCircle,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState({
    maxLoss: 20,
    maxProfit: 30,
    maxTrades: 5
  });

  React.useEffect(() => {
    if (!user) return;

    const fetchTradesAndRules = async () => {
      const [tradesRes, rulesRes] = await Promise.all([
        supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('trade_date', { ascending: true }),
        supabase
          .from('trading_rules')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      setTrades(tradesRes.data || []);
      
      if (rulesRes.data) {
        setRules({
          maxLoss: rulesRes.data.max_daily_loss || 20,
          maxProfit: rulesRes.data.max_daily_profit || 30,
          maxTrades: rulesRes.data.max_trades_per_day || 5
        });
      }
      
      setLoading(false);
    };

    fetchTradesAndRules();
  }, [user]);

  // Dynamic Date and Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const currentDateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Calculate real metrics
  const todaysTrades = trades.filter(t => t.trade_date === new Date().toISOString().split('T')[0]);
  const todaysPnl = todaysTrades.reduce((acc, t) => acc + (t.profit_loss || 0), 0);

  const totalTrades = trades.length;
  const wins = trades.filter(t => t.profit_loss > 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(2) : '0.00';

  // Calculate Bull / Bear bias
  const buyProfit = trades.filter(t => t.direction === 'BUY').reduce((acc, t) => acc + (t.profit_loss || 0), 0);
  const sellProfit = trades.filter(t => t.direction === 'SELL').reduce((acc, t) => acc + (t.profit_loss || 0), 0);
  const marketBias = buyProfit >= sellProfit ? 'BULL' : 'BEAR';

  const calculateScore = (t: any) => {
    let score = 100;
    if (!t.followed_plan) score -= 20;
    if (t.fomo) score -= 20;
    if (t.moved_stop_loss) score -= 20;
    if (t.revenge_trade) score -= 20;
    if (t.overtrade) score -= 20;
    return Math.max(0, score);
  };

  const todaysScore = todaysTrades.length > 0
    ? Math.round(todaysTrades.reduce((acc, t) => acc + calculateScore(t), 0) / todaysTrades.length)
    : 100;

  const chartData = trades.reduce((acc: any[], trade) => {
    const existing = acc.find(d => d.name === trade.trade_date);
    const score = calculateScore(trade);
    if (existing) {
      existing.score = Math.round((existing.score + score) / 2);
    } else {
      acc.push({ name: trade.trade_date, score });
    }
    return acc;
  }, []);

  const bullImageUrl = `${import.meta.env.BASE_URL}bull.png`;
  const bearImageUrl = `${import.meta.env.BASE_URL}bear.png`;
  const backgroundUrl = marketBias === 'BULL' ? bullImageUrl : bearImageUrl;

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Dynamic Background Image */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-center bg-no-repeat bg-fixed bg-[length:60%] mix-blend-screen"
        style={{ backgroundImage: `url('${backgroundUrl}')` }}
      />

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-6">

        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-textMain">{greeting}, Trader</h1>
            <p className="text-textMuted mt-1">Here's your trading discipline summary for today.</p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-4">
            <div className="px-4 py-2 bg-surfaceHighlight/40 backdrop-blur-md rounded-lg border border-surfaceHighlight/50">
              <span className="text-sm text-textMuted">Date:</span>
              <span className="ml-2 font-medium">{currentDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Top Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Discipline Card */}
          <div className="bg-surface border border-surfaceHighlight rounded-xl p-6 relative overflow-hidden group hover:border-success/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textMuted text-sm font-medium uppercase tracking-wider">Today's Discipline</p>
                <h2 className="text-5xl font-bold mt-2 text-textMain">{todaysScore}<span className="text-2xl text-textMuted">/100</span></h2>
              </div>
              <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <div className="mt-6 flex items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${todaysScore >= 80 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {todaysScore >= 80 ? '✓ DISCIPLINED TRADER' : '✕ INDISCIPLINED'}
              </span>
            </div>
          </div>

          {/* P&L Card */}
          <div className="bg-surface border border-surfaceHighlight rounded-xl p-6 relative overflow-hidden hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textMuted text-sm font-medium uppercase tracking-wider">Today's P&L</p>
                <h2 className={`text-5xl font-bold mt-2 ${todaysPnl >= 0 ? 'text-primary' : 'text-danger'}`}>
                  {todaysPnl >= 0 ? '+' : ''}${todaysPnl.toFixed(2)}
                </h2>
              </div>
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-sm text-textMuted">Overall Win Rate:</span>
              <span className="font-medium text-textMain">{winRate}%</span>
            </div>
          </div>
        </div>

        {/* Rule Trackers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Trade Limit */}
          <div className="bg-surface border border-surfaceHighlight rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-textMuted" />
                <h3 className="font-medium text-textMain">Trades Today</h3>
              </div>
              <span className="text-lg font-bold">{todaysTrades.length} / {rules.maxTrades}</span>
            </div>
            <div className="w-full bg-background rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min((todaysTrades.length / rules.maxTrades) * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-textMuted mt-3">You have {Math.max(rules.maxTrades - todaysTrades.length, 0)} trades remaining.</p>
          </div>

          {/* Loss Limit */}
          <div className="bg-surface border border-surfaceHighlight rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-textMuted" />
                <h3 className="font-medium text-textMain">Loss Limit</h3>
              </div>
              <span className="text-lg font-bold text-danger">${Math.abs(Math.min(todaysPnl, 0)).toFixed(2)} / ${rules.maxLoss}</span>
            </div>
            <div className="w-full bg-background rounded-full h-2.5">
              <div className="bg-danger h-2.5 rounded-full" style={{ width: `${Math.min((Math.abs(Math.min(todaysPnl, 0)) / rules.maxLoss) * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-textMuted mt-3">Risk remaining: ${(rules.maxLoss - Math.abs(Math.min(todaysPnl, 0))).toFixed(2)}</p>
          </div>

          {/* Profit Target */}
          <div className="bg-surface border border-surfaceHighlight rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-textMuted" />
                <h3 className="font-medium text-textMain">Profit Target</h3>
              </div>
              <span className="text-lg font-bold text-success">${Math.max(todaysPnl, 0).toFixed(2)} / ${rules.maxProfit}</span>
            </div>
            <div className="w-full bg-background rounded-full h-2.5">
              <div className="bg-success h-2.5 rounded-full" style={{ width: `${Math.min((Math.max(todaysPnl, 0) / rules.maxProfit) * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-textMuted mt-3">+${Math.max(rules.maxProfit - todaysPnl, 0).toFixed(2)} to reach target.</p>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Discipline Trend */}
          <div className="lg:col-span-2 bg-surface border border-surfaceHighlight rounded-xl p-6">
            <h3 className="font-medium text-textMain mb-6">Discipline Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#1A1A1A', color: '#FFFFFF' }}
                    itemStyle={{ color: '#00FF66' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#00FF66"
                    strokeWidth={3}
                    dot={{ fill: '#00FF66', strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Violations */}
          <div className="bg-surface border border-surfaceHighlight rounded-xl p-6">
            <h3 className="font-medium text-textMain mb-4">Critical Violations</h3>

            <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-3">
              <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <p className="text-textMuted text-sm">No critical violations recently.<br />Keep up the good work!</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
