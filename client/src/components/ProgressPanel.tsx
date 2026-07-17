import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { StepikCoursePanel } from './stepik/StepikCoursePanel';

const PERIOD_LABELS: Record<string, { label: string; era: string }> = {
  feudalism: { label: 'Феодализм', era: 'XV–XVIII вв.' },
  early_capitalism: { label: 'Ранний капитализм', era: 'XVIII–XIX вв.' },
  industrial_revolution: { label: 'Промышленная революция', era: 'XIX в.' },
  monopoly_capitalism: { label: 'Монополистический капитализм', era: 'Начало XX в.' },
  imperialism: { label: 'Империализм', era: 'XX в.' },
  modern_capitalism: { label: 'Современный капитализм', era: 'XX–XXI вв.' },
  socialism_transition: { label: 'Переход к социализму', era: 'Будущее' },
  communism: { label: 'Коммунизм', era: 'Коммунистическое общество' },
};

const PERIOD_ORDER = [
  'feudalism', 'early_capitalism', 'industrial_revolution',
  'monopoly_capitalism', 'imperialism', 'modern_capitalism',
  'socialism_transition', 'communism',
];

export const ProgressPanel: React.FC = () => {
  const { gameState, periodStatus, loading, error, advancePeriod } = useGame();
  const [advancing, setAdvancing] = useState(false);
  const [advanceMessage, setAdvanceMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Ошибка загрузки данных: {error}</p>
      </div>
    );
  }

  const experienceToNextLevel = gameState.level * 100 - gameState.experience;
  const progressPercentage = (gameState.experience / (gameState.level * 100)) * 100;

  const currentIdx = PERIOD_ORDER.indexOf(gameState.currentPeriod);
  const periodProgress = ((currentIdx + 1) / PERIOD_ORDER.length) * 100;

  const handleAdvancePeriod = async () => {
    setAdvancing(true);
    setAdvanceMessage(null);
    try {
      const result = await advancePeriod();
      setAdvanceMessage(result.message);
      if (result.advanced && result.newPeriod) {
        setAdvanceMessage(`Переход в эпоху «${PERIOD_LABELS[result.newPeriod]?.label || result.newPeriod}» завершён!`);
      }
    } catch {
      setAdvanceMessage('Ошибка при переходе эпохи');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Прогресс</h1>
          <p className="text-slate-400">Ваше развитие в игре и обучении</p>
        </div>
      </div>

      <StepikCoursePanel completedLessons={gameState.completedLessons} />

      {/* Уровень и опыт */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Уровень и опыт</h2>
          <p className="text-sm text-slate-400">Ваш текущий уровень развития</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-100">Уровень {gameState.level}</h3>
              <p className="text-slate-400">Экономический стратег</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-slate-100">{gameState.experience}</div>
              <div className="text-sm text-slate-400">опыт</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Прогресс до следующего уровня</span>
              <span>{experienceToNextLevel} опыта</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-950/30 border border-slate-800/40 rounded-lg">
              <div className="text-xl font-bold text-slate-100">{gameState.enterprises.length}</div>
              <div className="text-sm text-slate-400">Предприятий создано</div>
            </div>
            <div className="p-4 bg-slate-950/30 border border-slate-800/40 rounded-lg">
              <div className="text-xl font-bold text-slate-100">{gameState.completedLessons.length}</div>
              <div className="text-sm text-slate-400">Уроков Stepik</div>
            </div>
            <div className="p-4 bg-slate-950/30 border border-slate-800/40 rounded-lg">
              <div className="text-xl font-bold text-slate-100">{gameState.unlockedFeatures.length}</div>
              <div className="text-sm text-slate-400">Функций разблокировано</div>
            </div>
          </div>
        </div>
      </div>

      {/* Исторические периоды */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Исторические периоды</h2>
          <p className="text-sm text-slate-400">Ваш путь через историю</p>
        </div>
        
        <div className="space-y-3">
          {PERIOD_ORDER.map((periodKey, index) => {
            const info = PERIOD_LABELS[periodKey];
            const isCompleted = index < currentIdx;
            const isCurrent = periodKey === gameState.currentPeriod;
            const isLocked = index > currentIdx;
            
            return (
              <div 
                key={periodKey}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  isCurrent ? 'border-red-500/50 bg-red-950/20' : 
                  isCompleted ? 'border-emerald-500/30 bg-emerald-950/10' : 
                  'border-slate-800/40 bg-slate-950/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                    isCurrent ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 
                    'bg-slate-800/40 text-slate-500 border border-slate-700/30'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      isCurrent ? 'text-slate-100' : 
                      isCompleted ? 'text-slate-300' : 
                      'text-slate-500'
                    }`}>
                      {info.label}
                    </h3>
                    <p className="text-xs text-slate-500">{info.era}</p>
                  </div>
                </div>
                <div>
                  {isCurrent && (
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                      Текущий
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                      Завершён
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-xs font-medium text-slate-600">Заблокирован</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Общий прогресс</span>
            <span>{periodProgress.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${periodProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Кнопка перехода эпохи */}
      {periodStatus && (
        <div className="card border-amber-900/30 bg-gradient-to-r from-slate-900/60 to-amber-950/10">
          <div className="card-header border-amber-900/25">
            <h2 className="card-title text-amber-400">
              <span>⏳</span>
              <span>Смена эпохи</span>
            </h2>
          </div>
          
          {advanceMessage && (
            <div className={`mx-4 mb-4 p-3 rounded-lg text-sm ${
              advanceMessage.includes('завершён') 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : advanceMessage.includes('Ошибка') || advanceMessage.includes('не')
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {advanceMessage}
            </div>
          )}
          
          {periodStatus.nextPeriod ? (
            <div className="space-y-4">
              <div className="px-4">
                <p className="text-sm text-slate-400 mb-1">
                  Следующая эпоха: <span className="text-slate-200 font-medium">{PERIOD_LABELS[periodStatus.nextPeriod]?.label || periodStatus.nextPeriod}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Прогресс: {(periodStatus.overallProgress * 100).toFixed(0)}%
                </p>
                <div className="progress-bar mt-2">
                  <div 
                    className="progress-fill"
                    style={{ width: `${periodStatus.overallProgress * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Условия перехода */}
              <div className="px-4 space-y-2">
                {periodStatus.conditions.map((cond, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{cond.label}</span>
                    <span className={cond.met ? 'text-emerald-400' : 'text-slate-500'}>
                      {cond.current} {cond.required}
                      {cond.met ? ' ✓' : ''}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="px-4 pb-4">
                <button
                  onClick={handleAdvancePeriod}
                  disabled={!periodStatus.canAdvance || advancing}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                    periodStatus.canAdvance && !advancing
                      ? 'bg-amber-500 text-black hover:bg-amber-400 cursor-pointer'
                      : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {advancing ? 'Переход...' : 
                   periodStatus.canAdvance ? `Перейти в «${PERIOD_LABELS[periodStatus.nextPeriod]?.label || periodStatus.nextPeriod}»` :
                   'Выполните все условия для перехода'}
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4 text-center text-slate-400 text-sm">
              Вы достигли финальной эпохи — Коммунизм!
            </div>
          )}
        </div>
      )}

      {/* Разблокированные функции */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Разблокированные функции</h2>
          <p className="text-sm text-slate-400">Доступные возможности</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'basic_enterprises', label: 'Базовые предприятия', desc: 'Мануфактуры и фермы', icon: '🏭', color: 'emerald' },
            { key: 'advanced_enterprises', label: 'Продвинутые предприятия', desc: 'Фабрики и шахты', icon: '🏗️', color: 'blue' },
            { key: 'research', label: 'Исследования', desc: 'Технологическое развитие', icon: '🔬', color: 'purple' },
            { key: 'international_trade', label: 'Международная торговля', desc: 'Глобальные рынки', icon: '🌍', color: 'amber' },
          ].filter((f) => gameState.unlockedFeatures.includes(f.key)).map((feature) => (
            <div key={feature.key} className={`p-4 bg-${feature.color}-500/5 border border-${feature.color}-500/20 rounded-lg`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <div className="font-medium text-slate-200">{feature.label}</div>
                  <div className="text-xs text-slate-400">{feature.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Статистика обучения */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Обучение</h2>
          <p className="text-sm text-slate-400">Ваш прогресс в изучении политэкономии</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-950/30 border border-slate-800/40 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Пройденные уроки</h3>
            <div className="space-y-2">
              {['lesson_1', 'lesson_2', 'lesson_3', 'lesson_4', 'lesson_5', 'lesson_6', 'lesson_7', 'lesson_8'].map((lesson) => {
                const completed = gameState.completedLessons.includes(lesson);
                return (
                  <div key={lesson} className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{lesson.replace('_', ' ')}</span>
                    <span className={`text-sm ${completed ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {completed ? '✓ Пройдено' : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 bg-slate-950/30 border border-slate-800/40 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Обзор</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Эпоха</span>
                <span className="text-sm text-slate-200 font-medium">{PERIOD_LABELS[gameState.currentPeriod]?.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Уровень</span>
                <span className="text-sm text-slate-200 font-medium">{gameState.level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Опыт</span>
                <span className="text-sm text-slate-200 font-medium">{gameState.experience}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Предприятия</span>
                <span className="text-sm text-slate-200 font-medium">{gameState.enterprises.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Уроки</span>
                <span className="text-sm text-slate-200 font-medium">{gameState.completedLessons.length} / 8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
