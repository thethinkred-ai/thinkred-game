import React from 'react';
import { useGame } from '../contexts/GameContext';

export const ProgressPanel: React.FC = () => {
  const { gameState, loading, error } = useGame();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
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

  const getPeriodProgress = () => {
    const periods = ['feudalism', 'early_capitalism', 'industrial_revolution', 'monopoly_capitalism', 'imperialism', 'modern_capitalism', 'socialism_transition', 'communism'];
    const currentIndex = periods.indexOf(gameState.currentPeriod);
    return ((currentIndex + 1) / periods.length) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Прогресс</h1>
          <p className="text-gray-600">Ваше развитие в игре и обучении</p>
        </div>
      </div>

      {/* Уровень и опыт */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Уровень и опыт</h2>
          <p className="text-sm text-gray-600">Ваш текущий уровень развития</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Уровень {gameState.level}</h3>
              <p className="text-gray-600">Экономический стратег</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">{gameState.experience}</div>
              <div className="text-sm text-gray-600">опыт</div>
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
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{gameState.enterprises.length}</div>
              <div className="text-sm text-gray-600">Предприятий создано</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{gameState.currentEvents.length}</div>
              <div className="text-sm text-gray-600">Событий пройдено</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{gameState.unlockedFeatures.length}</div>
              <div className="text-sm text-gray-600">Функций разблокировано</div>
            </div>
          </div>
        </div>
      </div>

      {/* Исторические периоды */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Исторические периоды</h2>
          <p className="text-sm text-gray-600">Ваш путь через историю</p>
        </div>
        
        <div className="space-y-3">
          {[
            { key: 'feudalism', label: 'Феодализм', description: 'XV-XVIII века' },
            { key: 'early_capitalism', label: 'Ранний капитализм', description: 'XVIII-XIX века' },
            { key: 'industrial_revolution', label: 'Промышленная революция', description: 'XIX век' },
            { key: 'monopoly_capitalism', label: 'Монополистический капитализм', description: 'Начало XX века' },
            { key: 'imperialism', label: 'Империализм', description: 'XX век' },
            { key: 'modern_capitalism', label: 'Современный капитализм', description: 'XX-XXI века' },
            { key: 'socialism_transition', label: 'Переход к социализму', description: 'Будущее' },
            { key: 'communism', label: 'Коммунизм', description: 'Коммунистическое общество' },
          ].map((period, index) => {
            const isCompleted = index < ['feudalism', 'early_capitalism', 'industrial_revolution', 'monopoly_capitalism', 'imperialism', 'modern_capitalism', 'socialism_transition', 'communism'].indexOf(gameState.currentPeriod);
            const isCurrent = period.key === gameState.currentPeriod;
            const isLocked = index > ['feudalism', 'early_capitalism', 'industrial_revolution', 'monopoly_capitalism', 'imperialism', 'modern_capitalism', 'socialism_transition', 'communism'].indexOf(gameState.currentPeriod);
            
            return (
              <div 
                key={period.key}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isCurrent ? 'border-red-500 bg-red-50' : 
                  isCompleted ? 'border-green-500 bg-green-50' : 
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isCurrent ? 'bg-red-500 text-white' : 
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      isCurrent ? 'text-red-800' : 
                      isCompleted ? 'text-green-800' : 
                      'text-gray-600'
                    }`}>
                      {period.label}
                    </h3>
                    <p className="text-sm text-gray-600">{period.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {isCurrent && (
                    <span className="text-sm font-medium text-red-600">Текущий</span>
                  )}
                  {isCompleted && (
                    <span className="text-sm font-medium text-green-600">Завершен</span>
                  )}
                  {isLocked && (
                    <span className="text-sm font-medium text-gray-500">Заблокирован</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Общий прогресс</span>
            <span>{getPeriodProgress().toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getPeriodProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Разблокированные функции */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Разблокированные функции</h2>
          <p className="text-sm text-gray-600">Доступные возможности</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.unlockedFeatures.includes('basic_enterprises') && (
            <div className="achievement-card">
              <div className="achievement-icon bg-green-100">
                <span className="text-green-600">🏭</span>
              </div>
              <div className="achievement-content">
                <div className="achievement-title">Базовые предприятия</div>
                <div className="achievement-description">Мануфактуры и фермы</div>
              </div>
            </div>
          )}
          
          {gameState.unlockedFeatures.includes('advanced_enterprises') && (
            <div className="achievement-card">
              <div className="achievement-icon bg-blue-100">
                <span className="text-blue-600">🏗️</span>
              </div>
              <div className="achievement-content">
                <div className="achievement-title">Продвинутые предприятия</div>
                <div className="achievement-description">Фабрики и шахты</div>
              </div>
            </div>
          )}
          
          {gameState.unlockedFeatures.includes('research') && (
            <div className="achievement-card">
              <div className="achievement-icon bg-purple-100">
                <span className="text-purple-600">🔬</span>
              </div>
              <div className="achievement-content">
                <div className="achievement-title">Исследования</div>
                <div className="achievement-description">Технологическое развитие</div>
              </div>
            </div>
          )}
          
          {gameState.unlockedFeatures.includes('international_trade') && (
            <div className="achievement-card">
              <div className="achievement-icon bg-yellow-100">
                <span className="text-yellow-600">🌍</span>
              </div>
              <div className="achievement-content">
                <div className="achievement-title">Международная торговля</div>
                <div className="achievement-description">Глобальные рынки</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Достижения */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Достижения</h2>
          <p className="text-sm text-gray-600">Ваши награды и accomplishments</p>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-3xl">🏆</span>
          </div>
          <p>Достижения будут доступны после начала игры</p>
        </div>
      </div>

      {/* Статистика обучения */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Обучение</h2>
          <p className="text-sm text-gray-600">Ваш прогресс в изучении политэкономии</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Изученные концепции</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Товар и стоимость</span>
                <span className="text-sm text-green-600">✓ Изучено</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Прибавочная стоимость</span>
                <span className="text-sm text-green-600">✓ Изучено</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Норма прибыли</span>
                <span className="text-sm text-yellow-600">В процессе</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Концентрация капитала</span>
                <span className="text-sm text-gray-400">Не изучено</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Практические навыки</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Управление предприятием</span>
                <span className="text-sm text-green-600">✓ Освоено</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Экономический анализ</span>
                <span className="text-sm text-yellow-600">В процессе</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Принятие решений</span>
                <span className="text-sm text-yellow-600">В процессе</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Кризисное управление</span>
                <span className="text-sm text-gray-400">Не изучено</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
