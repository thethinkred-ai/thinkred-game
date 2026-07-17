import React from 'react';
import { useGame } from '../contexts/GameContext';
import { ACHIEVEMENTS } from '../../../shared/constants/game';

const TYPE_LABELS: Record<string, string> = {
  learning: 'Обучение',
  economic: 'Экономика',
  social: 'Общество',
  political: 'Политика',
};

const TYPE_COLORS: Record<string, string> = {
  learning: 'border-blue-500/30 bg-blue-500/5',
  economic: 'border-emerald-500/30 bg-emerald-500/5',
  social: 'border-amber-500/30 bg-amber-500/5',
  political: 'border-purple-500/30 bg-purple-500/5',
};

const TYPE_BADGE: Record<string, string> = {
  learning: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  economic: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  social: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  political: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export const AchievementsPage: React.FC = () => {
  const { gameState } = useGame();
  const unlockedSet = new Set(gameState.achievements);

  const entries = Object.entries(ACHIEVEMENTS);

  if (entries.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Достижения</h1>
        <p className="text-slate-400">Достижения не загружены.</p>
      </div>
    );
  }

  const unlockedCount = entries.filter(([key]) => unlockedSet.has(key)).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Достижения</h1>
          <p className="text-sm text-slate-400 mt-1">
            Разблокировано: {unlockedCount} / {entries.length}
          </p>
        </div>
        <div className="bg-gradient-to-r from-red-600/20 to-red-900/20 border border-red-500/20 rounded-xl px-4 py-2">
          <span className="text-lg font-bold text-red-400">{Math.round((unlockedCount / entries.length) * 100)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map(([key, achievement]) => {
          const unlocked = unlockedSet.has(key);
          return (
            <div
              key={key}
              className={`rounded-xl border p-4 transition-all ${
                unlocked
                  ? `${TYPE_COLORS[achievement.type]} border-opacity-50`
                  : 'border-slate-800/40 bg-slate-950/20 opacity-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-3xl flex-shrink-0 mt-1">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`font-bold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                      {achievement.name}
                    </h3>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TYPE_BADGE[achievement.type]}`}>
                      {TYPE_LABELS[achievement.type]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{achievement.description}</p>
                  <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
                    <span>+{achievement.rewardXp} XP</span>
                    {unlocked && <span className="text-emerald-400 font-medium">✓ Получено</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
