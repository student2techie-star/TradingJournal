import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Trade } from '../types/trading';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const Trades = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchTrades = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('trade_date', { ascending: false });
        
      if (error) {
        toast.error('Failed to load trades');
      } else {
        setTrades(data || []);
      }
      setLoading(false);
    };

    fetchTrades();
  }, [user]);

  const filteredTrades = trades.filter(t => 
    t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.setup_types && t.setup_types[0]?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Trade History</h1>
          <p className="text-textMuted mt-1">View and filter all your recorded trades.</p>
        </div>
        
        <Link 
          to="/trades/new" 
          className="flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Trade
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-textMuted" />
          </div>
          <input
            type="text"
            placeholder="Search symbol, setup..."
            className="block w-full pl-10 rounded-md border border-surfaceHighlight bg-surface px-3 py-2 text-textMain focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center rounded-md border border-surfaceHighlight bg-surface px-4 py-2 text-sm font-medium text-textMain hover:bg-surfaceHighlight transition-colors">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-surfaceHighlight rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-textMain">
          <thead className="bg-surfaceHighlight/30 text-textMuted uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Symbol</th>
              <th className="px-6 py-4 font-medium">Direction</th>
              <th className="px-6 py-4 font-medium">Setup</th>
              <th className="px-6 py-4 font-medium">P&L</th>
              <th className="px-6 py-4 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surfaceHighlight">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-textMuted">Loading trades...</td></tr>
            ) : filteredTrades.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-textMuted">No trades found. Start logging!</td></tr>
            ) : filteredTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-surfaceHighlight/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{trade.trade_date}</td>
                <td className="px-6 py-4 font-medium">{trade.symbol}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${trade.direction === 'BUY' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
                    {trade.direction}
                  </span>
                </td>
                <td className="px-6 py-4 text-textMuted">{trade.setup_types?.join(', ')}</td>
                <td className={`px-6 py-4 font-bold ${trade.profit_loss && trade.profit_loss > 0 ? 'text-success' : 'text-danger'}`}>
                  {trade.profit_loss && trade.profit_loss > 0 ? '+' : ''}${trade.profit_loss?.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  {trade.planned_setup ? (
                    <span className="text-success text-xs font-medium flex items-center">✓ Planned</span>
                  ) : (
                    <span className="text-danger text-xs font-medium flex items-center">✕ Unplanned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};
