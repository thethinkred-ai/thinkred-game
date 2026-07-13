import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { gameState, loading, error, refreshGameState } = useGame();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-900/40 bg-red-950/10 p-8 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Ошибка загрузки данных</h3>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <button 
          onClick={refreshGameState}
          className="btn btn-primary"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const totalProfit = gameState.enterprises.reduce((sum, e) => sum + e.profit, 0);
  const totalWorkers = gameState.enterprises.reduce((sum, e) => sum + e.workers, 0);
  const avgSurplusValue = gameState.enterprises.length > 0 
    ? gameState.enterprises.reduce((sum, e) => sum + e.surplusValue, 0) / gameState.enterprises.length 
    : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Дашборд</h1>
          <p className="text-sm text-slate-400 mt-1">Обзор вашей экономической империи</p>
        </div>
        <button 
          onClick={refreshGameState}
          className="btn btn-secondary flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Обновить</span>
        </button>
      </div>

      {/* Ключевые показатели */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="stat-label">Общая прибыль</span>
              <p className="stat-value text-emerald-400">
                ${totalProfit.toLocaleString()}
              </p>
              <div className="stat-change stat-change-positive">
                <span>📈</span>
                <span>+12.5% за месяц</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="stat-label">Всего рабочих</span>
              <p className="stat-value text-blue-400">
                {totalWorkers.toLocaleString()}
              </p>
              <div className="stat-change stat-change-positive">
                <span>📈</span>
                <span>+8.2% за месяц</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="stat-label">Прибавочная стоимость (ср.)</span>
              <p className="stat-value text-rose-400">
                ${avgSurplusValue.toLocaleString()}
              </p>
              <div className="stat-change stat-change-negative">
                <span>📉</span>
                <span>-2.1% за месяц</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="stat-label">Всего предприятий</span>
              <p className="stat-value text-purple-400">
                {gameState.enterprises.length}
              </p>
              <div className="stat-change stat-change-positive">
                <span>📈</span>
                <span>+1 за месяц</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏭</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="stat-label font-bold text-yellow-500">Ваш Уровень</span>
              <p className="stat-value text-yellow-400">
                {gameState.level}
              </p>
              <p className="text-xs text-slate-400 font-semibold pt-1">
                {gameState.experience} / {gameState.level * 100} XP
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-xl">⭐</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="stat-label">Активные события</span>
              <p className="stat-value text-amber-400">
                {gameState.currentEvents.length}
              </p>
              <p className="text-xs text-slate-400 font-semibold pt-1">
                {gameState.currentEvents.length > 0 ? 'Требуют решения' : 'Все спокойно'}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">📢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Текущие события */}
      {gameState.currentEvents.length > 0 && (
        <div className="card border-amber-900/30 bg-gradient-to-r from-slate-900/60 to-amber-950/10">
          <div className="card-header border-amber-900/25">
            <h2 className="card-title text-amber-400">
              <span>📢</span>
              <span>Текущие кризисные события</span>
            </h2>
            <span className="text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">Важно</span>
          </div>
          
          <div className="space-y-4">
            {gameState.currentEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-amber-500/30 transition-all duration-150">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">{event.title}</h3>
                    <p className="text-sm text-slate-400">{event.description}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 self-start md:self-auto">
                    {(event.type as string).includes('economic') && 'Экономика'}
                    {(event.type as string).includes('social') && 'Социум'}
                    {(event.type as string).includes('political') && 'Политика'}
                    {(event.type as string).includes('technological') && 'Технологии'}
                    {(event.type as string).includes('labor') && 'Труд'}
                    {(event.type as string).includes('war') && 'Война'}
                    {(event.type as string).includes('market') && 'Рынок'}
                  </span>
                </div>
              </div>
            ))}
            
            {gameState.currentEvents.length > 3 && (
              <div className="text-center pt-2">
                <Link 
                  to="/events" 
                  className="text-red-400 hover:text-red-300 text-sm font-semibold flex items-center justify-center gap-1"
                >
                  Посмотреть все события ({gameState.currentEvents.length}) →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Предприятия */}
      {gameState.enterprises.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Ваша промышленная империя</h2>
            <Link to="/enterprises" className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider">Все фабрики</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameState.enterprises.slice(0, 3).map((enterprise) => (
              <div key={enterprise.id} className="p-5 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-slate-700/80 hover:bg-slate-950/60 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{enterprise.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1 inline-block">
                      {enterprise.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-emerald-400">
                      +${enterprise.profit.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Чистая Прибыль</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-900 text-center">
                  <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                    <div className="text-sm font-bold text-white">{enterprise.workers}</div>
                    <div className="text-[10px] text-slate-400">Рабочие</div>
                  </div>
                  <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                    <div className="text-sm font-bold text-white">{enterprise.production}</div>
                    <div className="text-[10px] text-slate-400">Продукция</div>
                  </div>
                  <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                    <div className="text-sm font-bold text-white">${enterprise.wageRate}</div>
                    <div className="text-[10px] text-slate-400">Зарплата</div>
                  </div>
                  <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                    <div className="text-sm font-bold text-emerald-400">${enterprise.surplusValue}</div>
                    <div className="text-[10px] text-slate-400">Приб. стоимость</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Экономические индикаторы */}
      {gameState.economicIndicators && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span>📊</span>
              <span>Макроэкономические индикаторы</span>
            </h2>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Состояние рынка</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center space-y-1">
              <div className="text-2xl font-black text-white">
                {(gameState.economicIndicators.gdp / 1000000).toFixed(1)}M
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ВВП системы</div>
            </div>
            
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center space-y-1">
              <div className="text-2xl font-black text-blue-400">
                {(gameState.economicIndicators.unemploymentRate * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Безработица</div>
            </div>
            
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center space-y-1">
              <div className="text-2xl font-black text-emerald-400">
                {(gameState.economicIndicators.profitRate * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Норма прибыли</div>
            </div>
            
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center space-y-1">
              <div className="text-2xl font-black text-rose-400">
                {(gameState.economicIndicators.inflationRate * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Инфляция</div>
            </div>
            
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center space-y-1">
              <div className="text-2xl font-black text-amber-500">
                {(gameState.economicIndicators.concentrationIndex * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Концентрация капитала</div>
            </div>
            
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center space-y-1">
              <div className="text-lg font-black text-purple-400 uppercase tracking-wider py-1">
                {gameState.economicIndicators.crisisCycle.phase === 'expansion' && 'Подъем'}
                {gameState.economicIndicators.crisisCycle.phase === 'depression' && 'Депрессия'}
                {gameState.economicIndicators.crisisCycle.phase === 'crisis' && 'Кризис'}
                {gameState.economicIndicators.crisisCycle.phase === 'recovery' && 'Оживление'}
                {gameState.economicIndicators.crisisCycle.phase === 'boom' && 'Бум'}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Фаза цикла</div>
            </div>
          </div>
        </div>
      )}

      {/* Быстрые действия */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Командный центр империи</h2>
          <p className="text-xs text-slate-400 font-medium">Быстрый доступ к операциям</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/enterprises"
            className="btn btn-primary text-center py-3 flex items-center justify-center gap-2"
          >
            <span>🏭</span>
            <span>Создать предприятие</span>
          </Link>
          
          <Link 
            to="/events"
            className="btn btn-secondary text-center py-3 flex items-center justify-center gap-2"
          >
            <span>📢</span>
            <span>Решить события</span>
          </Link>
          
          <Link 
            to="/economy"
            className="btn btn-secondary text-center py-3 flex items-center justify-center gap-2"
          >
            <span>📊</span>
            <span>Политэкономия</span>
          </Link>
          
          <Link 
            to="/progress"
            className="btn btn-secondary text-center py-3 flex items-center justify-center gap-2"
          >
            <span>⭐</span>
            <span>Технический прогресс</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
