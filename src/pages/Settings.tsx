import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Rules state
  const [maxLoss, setMaxLoss] = useState<number>(20);
  const [maxProfit, setMaxProfit] = useState<number>(30);
  const [maxTrades, setMaxTrades] = useState<number>(5);
  const [defaultRisk, setDefaultRisk] = useState<number>(5);

  React.useEffect(() => {
    if (!user) return;
    const fetchRules = async () => {
      const { data, error } = await supabase
        .from('trading_rules')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setMaxLoss(data.max_daily_loss || 20);
        setMaxProfit(data.max_daily_profit || 30);
        setMaxTrades(data.max_trades_per_day || 5);
        setDefaultRisk(data.default_risk_per_trade || 5);
      }
    };
    fetchRules();
  }, [user]);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please log in');

    setLoading(true);
    
    // Check if rules exist first to handle insert vs update, or use upsert
    const { error } = await supabase
      .from('trading_rules')
      .upsert({
        user_id: user.id,
        max_daily_loss: maxLoss,
        max_daily_profit: maxProfit,
        max_trades_per_day: maxTrades,
        default_risk_per_trade: defaultRisk,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Failed to save rules: ' + error.message);
    } else {
      toast.success('Rules updated successfully');
    }
    
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
    setPwdLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-textMain">Trading Rules & Settings</h1>
        <p className="text-textMuted mt-1">Configure your daily limits and risk parameters to track discipline.</p>
      </div>

      <div className="bg-surface border border-surfaceHighlight rounded-xl overflow-hidden">
        <div className="p-6 border-b border-surfaceHighlight">
          <h2 className="text-lg font-medium text-textMain">Daily Risk Parameters</h2>
          <p className="text-sm text-textMuted mt-1">These values are used to calculate your daily discipline score.</p>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Max Daily Loss */}
            <div>
              <label htmlFor="maxLoss" className="block text-sm font-medium text-textMain mb-2">
                Maximum Daily Loss ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-textMuted sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="maxLoss"
                  value={maxLoss}
                  onChange={(e) => setMaxLoss(parseFloat(e.target.value))}
                  className="block w-full pl-7 rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-textMuted">If you exceed this loss, your discipline score drops significantly.</p>
            </div>

            {/* Max Daily Profit */}
            <div>
              <label htmlFor="maxProfit" className="block text-sm font-medium text-textMain mb-2">
                Daily Profit Target ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-textMuted sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="maxProfit"
                  value={maxProfit}
                  onChange={(e) => setMaxProfit(parseFloat(e.target.value))}
                  className="block w-full pl-7 rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-success focus:outline-none focus:ring-1 focus:ring-success sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-textMuted">Continuing to trade after reaching your target negatively impacts your score.</p>
            </div>

            {/* Max Trades */}
            <div>
              <label htmlFor="maxTrades" className="block text-sm font-medium text-textMain mb-2">
                Maximum Trades Per Day
              </label>
              <input
                type="number"
                id="maxTrades"
                value={maxTrades}
                onChange={(e) => setMaxTrades(parseInt(e.target.value))}
                className="block w-full rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
               <p className="mt-1 text-xs text-textMuted">Limits overtrading and revenge trading.</p>
            </div>

            {/* Default Risk */}
            <div>
              <label htmlFor="defaultRisk" className="block text-sm font-medium text-textMain mb-2">
                Default Risk Per Trade ($)
              </label>
               <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-textMuted sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="defaultRisk"
                  value={defaultRisk}
                  onChange={(e) => setDefaultRisk(parseFloat(e.target.value))}
                  className="block w-full pl-7 rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Trading Rules'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-surface border border-surfaceHighlight rounded-xl overflow-hidden mt-6">
        <div className="p-6 border-b border-surfaceHighlight">
          <h2 className="text-lg font-medium text-textMain">Account Security</h2>
          <p className="text-sm text-textMuted mt-1">Update your password here.</p>
        </div>
        
        <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label htmlFor="newPass" className="block text-sm font-medium text-textMain mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPass"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmPass" className="block text-sm font-medium text-textMain mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPass"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border border-surfaceHighlight bg-background px-3 py-2 text-textMain focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={pwdLoading}
              className="flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {pwdLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
