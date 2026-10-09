import React, { useState } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const NewTrade = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form states
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState('BUY');
  const [profitLoss, setProfitLoss] = useState('');
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Psychology states
  const [followedPlan, setFollowedPlan] = useState(true);
  const [plannedSetup, setPlannedSetup] = useState(true);
  const [fomo, setFomo] = useState(false);
  const [movedStopLoss, setMovedStopLoss] = useState(false);
  const [revengeTrade, setRevengeTrade] = useState(false);
  const [overtrade, setOvertrade] = useState(false);
  const [lessonLearned, setLessonLearned] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('You must be logged in to save a trade.');

    setLoading(true);

    const { error } = await supabase.from('trades').insert({
      user_id: user.id,
      trade_date: tradeDate,
      symbol,
      direction,
      profit_loss: parseFloat(profitLoss),
      followed_plan: followedPlan,
      planned_setup: plannedSetup,
      fomo,
      moved_stop_loss: movedStopLoss,
      revenge_trade: revengeTrade,
      overtrade,
      lesson_learned: lessonLearned
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to save trade: ' + error.message);
    } else {
      toast.success('Trade logged successfully!');
      navigate('/trades');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/trades" className="p-2 bg-surface hover:bg-surfaceHighlight rounded-lg transition-colors border border-surfaceHighlight">
            <ArrowLeft className="h-5 w-5 text-textMuted" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-textMain">Log New Trade</h1>
            <p className="text-textMuted mt-1">Enter your trade execution details and psychology.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-surface border border-surfaceHighlight rounded-xl overflow-hidden">
          <div className="p-4 border-b border-surfaceHighlight bg-surfaceHighlight/10">
            <h2 className="font-medium text-textMain">Execution Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Date</label>
              <input required type="date" value={tradeDate} onChange={(e) => setTradeDate(e.target.value)} className="block w-full rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-primary focus:outline-none [color-scheme:dark]" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Instrument</label>
              <input required type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g. XAUUSD" className="block w-full rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-primary focus:outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Direction</label>
              <select value={direction} onChange={(e) => setDirection(e.target.value)} className="block w-full rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-primary focus:outline-none">
                <option value="BUY">BUY (Long)</option>
                <option value="SELL">SELL (Short)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Realized P&L ($)</label>
              <input required type="number" value={profitLoss} onChange={(e) => setProfitLoss(e.target.value)} step="0.01" className="block w-full rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-primary focus:outline-none" />
            </div>

          </div>
        </div>

        {/* Psychology Section */}
        <div className="bg-surface border border-surfaceHighlight rounded-xl overflow-hidden">
          <div className="p-4 border-b border-surfaceHighlight bg-surfaceHighlight/10">
            <h2 className="font-medium text-textMain">Trading Psychology & Plan</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={followedPlan} onChange={(e) => setFollowedPlan(e.target.checked)} className="h-5 w-5 rounded border-surfaceHighlight bg-background text-primary focus:ring-primary focus:ring-offset-background" />
                <span className="text-textMain text-sm">Did you follow your trading plan?</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={plannedSetup} onChange={(e) => setPlannedSetup(e.target.checked)} className="h-5 w-5 rounded border-surfaceHighlight bg-background text-primary focus:ring-primary focus:ring-offset-background" />
                <span className="text-textMain text-sm">Was this a planned setup?</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={fomo} onChange={(e) => setFomo(e.target.checked)} className="h-5 w-5 rounded border-surfaceHighlight bg-background text-primary focus:ring-primary focus:ring-offset-background" />
                <span className="text-textMain text-sm">Did you enter because of FOMO?</span>
              </label>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={movedStopLoss} onChange={(e) => setMovedStopLoss(e.target.checked)} className="h-5 w-5 rounded border-surfaceHighlight bg-background text-primary focus:ring-primary focus:ring-offset-background" />
                <span className="text-textMain text-sm">Did you move your Stop Loss?</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={revengeTrade} onChange={(e) => setRevengeTrade(e.target.checked)} className="h-5 w-5 rounded border-surfaceHighlight bg-background text-primary focus:ring-primary focus:ring-offset-background" />
                <span className="text-textMain text-sm">Did you revenge trade?</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={overtrade} onChange={(e) => setOvertrade(e.target.checked)} className="h-5 w-5 rounded border-surfaceHighlight bg-background text-primary focus:ring-primary focus:ring-offset-background" />
                <span className="text-textMain text-sm">Did you overtrade?</span>
              </label>
            </div>

          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-surface border border-surfaceHighlight rounded-xl overflow-hidden">
          <div className="p-4 border-b border-surfaceHighlight bg-surfaceHighlight/10">
            <h2 className="font-medium text-textMain">Notes</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Lesson Learned</label>
              <textarea value={lessonLearned} onChange={(e) => setLessonLearned(e.target.value)} rows={3} className="block w-full rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-primary focus:outline-none resize-none" placeholder="What did you learn from this trade?" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primaryHover transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Trade'}
          </button>
        </div>

      </form>
    </div>
  );
};
