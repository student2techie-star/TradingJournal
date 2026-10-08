import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, BarChart3, Settings, LogOut, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

export const Layout = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [marketBias, setMarketBias] = useState<'BULL' | 'BEAR' | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchTrades = async () => {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);
        
      if (data) {
        const buyProfit = data.filter(t => t.direction === 'BUY').reduce((acc, t) => acc + (t.profit_loss || 0), 0);
        const sellProfit = data.filter(t => t.direction === 'SELL').reduce((acc, t) => acc + (t.profit_loss || 0), 0);
        setMarketBias(buyProfit >= sellProfit ? 'BULL' : 'BEAR');
      }
    };
    fetchTrades();
  }, [user]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Trades', href: '/trades', icon: Activity },
    { name: 'Journal', href: '/journal', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden w-64 flex-col bg-surface border-r border-surfaceHighlight md:flex">
        <div className="flex h-16 items-center px-6">
          <Activity className="h-8 w-8 text-primary" />
          <span className="ml-3 text-xl font-bold tracking-wider text-textMain">DISCIPLINE</span>
        </div>
        
        <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-textMuted hover:bg-surfaceHighlight hover:text-textMain'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-textMuted group-hover:text-textMain'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-surfaceHighlight space-y-2">
          {/* Trader Behavior Widget */}
          {marketBias && (
            <div className="flex flex-col items-center justify-center p-3 mb-4 text-center relative">
              <span className="text-xs text-textMuted uppercase tracking-wider font-bold mb-2">Trader Behavior</span>
              <img 
                src={marketBias === 'BULL' ? '/bull.png' : '/bear.png'} 
                alt={marketBias}
                className="w-36 h-36 object-contain mb-2 drop-shadow-lg mix-blend-screen"
              />
              <div className={`flex items-center text-sm font-bold ${marketBias === 'BULL' ? 'text-success' : 'text-danger'}`}>
                {marketBias === 'BULL' ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
                {marketBias} MARKET
              </div>
            </div>
          )}

          <button
            onClick={() => signOut()}
            className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-textMuted transition-colors hover:bg-surfaceHighlight hover:text-textMain"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-textMuted" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background focus:outline-none pb-16 md:pb-0 pt-16 md:pt-0">
        <Outlet />
      </main>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-16 justify-between items-center border-b border-surfaceHighlight bg-surface/80 backdrop-blur-md px-4">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold tracking-wider text-textMain">DISCIPLINE</span>
        </div>
        {marketBias && (
          <div className="flex items-center">
            <img 
              src={marketBias === 'BULL' ? '/bull.png' : '/bear.png'} 
              alt={marketBias}
              className="w-8 h-8 object-contain mr-2 mix-blend-screen"
            />
            <span className={`text-xs font-bold ${marketBias === 'BULL' ? 'text-success' : 'text-danger'}`}>
              {marketBias}
            </span>
          </div>
        )}
      </div>

      {/* Mobile bottom nav (simplified) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 justify-around items-center border-t border-surfaceHighlight bg-surface/90 backdrop-blur-md pb-safe">
        {navigation.slice(0, 5).map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center w-full h-full p-2 ${isActive ? 'text-primary' : 'text-textMuted'}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
