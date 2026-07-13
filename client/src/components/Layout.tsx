import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { gameState } = useGame();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', label: 'Дашборд', icon: '📊' },
    { path: '/enterprises', label: 'Предприятия', icon: '🏭' },
    { path: '/events', label: 'События', icon: '📢' },
    { path: '/economy', label: 'Экономика', icon: '📈' },
    { path: '/progress', label: 'Прогресс', icon: '⭐' },
  ];

  return (
    <div className="layout">
      {/* Premium Navbar */}
      <header className="header">
        <div className="header-content">
          <div className="header-top">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-950/20">
                <span className="text-white font-black text-lg">TR</span>
              </div>
              <div>
                <div className="header-title tracking-tight text-white font-black">ThinkRed</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Simulator</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="header-nav hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`header-link ${
                    isActive(item.path)
                      ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500 px-3 py-2 rounded-t-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-200">
                  {user?.first_name} {user?.last_name || 'Игрок'}
                </div>
                <div className="text-xs text-red-400 font-medium">
                  Уровень {gameState.level}
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary py-1.5 px-3 text-xs"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="main-content">
        {/* Left Control Sidebar */}
        <aside className="sidebar">
          {/* Historical Period Widget */}
          <div className="bg-gradient-to-b from-slate-950/50 to-slate-900/20 border border-slate-800/60 rounded-xl p-4 shadow-inner">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Историческая Эпоха</h3>
            <div className="text-sm font-bold text-red-400 flex items-center space-x-2">
              <span className="text-lg">🏛️</span>
              <span>
                {gameState.currentPeriod === 'early_capitalism' && 'Ранний капитализм'}
                {gameState.currentPeriod === 'industrial_revolution' && 'Пром. революция'}
                {gameState.currentPeriod === 'monopoly_capitalism' && 'Монополии'}
                {gameState.currentPeriod === 'imperialism' && 'Империализм'}
                {gameState.currentPeriod === 'modern_capitalism' && 'Современность'}
                {gameState.currentPeriod === 'socialism_transition' && 'Переход к социализму'}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold px-1">Глобальный статус</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-slate-950/30 border border-slate-800/40 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Предприятия</span>
                <span className="text-sm font-bold text-white">{gameState.enterprises.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/30 border border-slate-800/40 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Общий опыт</span>
                <span className="text-sm font-bold text-white">{gameState.experience} XP</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/30 border border-slate-800/40 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Новые события</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  gameState.currentEvents.length > 0 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-slate-800/50 text-slate-500'
                }`}>
                  {gameState.currentEvents.length}
                </span>
              </div>
            </div>
          </div>

          {/* Unlocked Capabilities */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold px-1">Доступные технологии</h3>
            <div className="space-y-1.5">
              {gameState.unlockedFeatures.includes('basic_enterprises') && (
                <div className="text-xs text-emerald-400 flex items-center space-x-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-lg">
                  <span>✓</span>
                  <span>Базовые производства</span>
                </div>
              )}
              {gameState.unlockedFeatures.includes('advanced_enterprises') && (
                <div className="text-xs text-emerald-400 flex items-center space-x-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-lg">
                  <span>✓</span>
                  <span>Продвинутые фабрики</span>
                </div>
              )}
              {gameState.unlockedFeatures.includes('research') && (
                <div className="text-xs text-emerald-400 flex items-center space-x-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-lg">
                  <span>✓</span>
                  <span>Научные исследования</span>
                </div>
              )}
              {gameState.unlockedFeatures.includes('international_trade') && (
                <div className="text-xs text-emerald-400 flex items-center space-x-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-lg">
                  <span>✓</span>
                  <span>Внешняя торговля</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Central Component Panel */}
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
