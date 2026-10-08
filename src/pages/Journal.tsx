import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export const Journal = () => {
  const { user } = useAuth();
  const [groupedTrades, setGroupedTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchTrades = async () => {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('trade_date', { ascending: false });
        
      if (data) {
        const calculateScore = (t: any) => {
          let score = 100;
          if (!t.followed_plan) score -= 20;
          if (t.fomo) score -= 20;
          if (t.moved_stop_loss) score -= 20;
          if (t.revenge_trade) score -= 20;
          if (t.overtrade) score -= 20;
          return Math.max(0, score);
        };

        const grouped = data.reduce((acc: any, trade) => {
          const date = trade.trade_date;
          if (!acc[date]) {
            acc[date] = { date, trades: [], netPnl: 0, totalScore: 0 };
          }
          acc[date].trades.push(trade);
          acc[date].netPnl += (trade.profit_loss || 0);
          acc[date].totalScore += calculateScore(trade);
          return acc;
        }, {});

        const groupedArray = Object.values(grouped).map((g: any) => ({
          ...g,
          avgScore: Math.round(g.totalScore / g.trades.length)
        }));

        setGroupedTrades(groupedArray);
      }
      setLoading(false);
    };

    fetchTrades();
  }, [user]);

  const filteredTrades = groupedTrades.filter(day => {
    if (startDate && day.date < startDate) return false;
    if (endDate && day.date > endDate) return false;
    return true;
  });

  if (loading) {
    return <div className="p-6 text-center text-textMuted">Loading journal...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Daily Journal</h1>
          <p className="text-textMuted mt-1">Review your historical discipline and performance by day.</p>
        </div>

        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-surfaceHighlight/30 p-2 rounded-lg border border-surfaceHighlight/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-textMuted">From:</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background border border-surfaceHighlight rounded px-2 py-1 text-sm text-textMain focus:outline-none focus:border-primary [color-scheme:dark]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-textMuted">To:</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background border border-surfaceHighlight rounded px-2 py-1 text-sm text-textMain focus:outline-none focus:border-primary [color-scheme:dark]"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-danger hover:text-danger/80 px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {filteredTrades.length === 0 && (
          <div className="col-span-full text-center text-textMuted py-10">
            No trading days found for this period.
          </div>
        )}

        {filteredTrades.map((day) => (
          <div key={day.date} className={`bg-surface/40 backdrop-blur-md border border-surfaceHighlight rounded-xl p-6 hover:border-${day.avgScore >= 80 ? 'success' : 'danger'}/30 transition-colors cursor-pointer group`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-textMain font-medium">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {new Date(day.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${day.avgScore >= 80 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {day.avgScore} / 100
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-textMuted uppercase">Net P&L</p>
                <p className={`font-bold mt-1 ${day.netPnl >= 0 ? 'text-primary' : 'text-danger'}`}>
                  {day.netPnl >= 0 ? '+' : ''}${day.netPnl.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-textMuted uppercase">Trades</p>
                <p className={`font-bold mt-1 ${day.trades.length > 5 ? 'text-danger' : 'text-textMain'}`}>
                  {day.trades.length} / 5
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-surfaceHighlight flex items-center justify-between">
              <span className={`text-sm font-medium flex items-center gap-1 ${day.avgScore >= 80 ? 'text-success' : 'text-danger'}`}>
                {day.avgScore >= 80 
                  ? <><CheckCircle className="h-4 w-4" /> DISCIPLINED TRADER</>
                  : <><AlertTriangle className="h-4 w-4" /> INDISCIPLINED TRADER</>
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
