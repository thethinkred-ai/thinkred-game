import React from 'react';
import { useGame } from '../contexts/GameContext';

export const EconomicIndicators: React.FC = () => {
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

  const indicators = gameState.economicIndicators;
  const marketState = gameState.marketState;

  if (!indicators || !marketState) {
    return (
      <div className="card text-center">
        <div className="py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Данные недоступны</h3>
          <p className="text-gray-600">
            Экономические индикаторы будут доступны после создания предприятий
          </p>
        </div>
      </div>
    );
  }

  const getCrisisPhaseColor = (phase: string) => {
    const colors = {
      expansion: 'text-green-600',
      boom: 'text-blue-600',
      crisis: 'text-red-600',
      depression: 'text-gray-600',
      recovery: 'text-yellow-600',
    };
    return colors[phase as keyof typeof colors] || 'text-gray-600';
  };

  const getCrisisPhaseLabel = (phase: string) => {
    const labels = {
      expansion: 'Экспансия',
      boom: 'Бум',
      crisis: 'Кризис',
      depression: 'Депрессия',
      recovery: 'Восстановление',
    };
    return labels[phase as keyof typeof labels] || phase;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Экономические индикаторы</h1>
          <p className="text-gray-600">Анализ состояния экономики и рынка</p>
        </div>
      </div>

      {/* Основные макроэкономические показатели */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Макроэкономические показатели</h2>
          <p className="text-sm text-gray-600">Ключевые индикаторы экономики</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">
              ${(indicators.gdp / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600 mt-2">ВВП</div>
            <div className="text-xs text-gray-500 mt-1">
              Валовой внутренний продукт
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className={`text-3xl font-bold ${indicators.unemploymentRate > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
              {(indicators.unemploymentRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">Безработица</div>
            <div className="text-xs text-gray-500 mt-1">
              Уровень безработицы
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className={`text-3xl font-bold ${indicators.inflationRate > 0.05 ? 'text-red-600' : 'text-green-600'}`}>
              {(indicators.inflationRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">Инфляция</div>
            <div className="text-xs text-gray-500 mt-1">
              Темп роста цен
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {(indicators.profitRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">Норма прибыли</div>
            <div className="text-xs text-gray-500 mt-1">
              Средняя норма прибыли
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {(indicators.surplusValueRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">Норма прибавочной стоимости</div>
            <div className="text-xs text-gray-500 mt-1">
              Марксистский показатель
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className={`text-3xl font-bold ${indicators.concentrationIndex > 0.7 ? 'text-red-600' : 'text-green-600'}`}>
              {(indicators.concentrationIndex * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">Концентрация капитала</div>
            <div className="text-xs text-gray-500 mt-1">
              Уровень монополизации
            </div>
          </div>
        </div>
      </div>

      {/* Циклические процессы */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Экономические циклы</h2>
          <p className="text-sm text-gray-600">Анализ кризисных циклов</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Текущая фаза</h3>
              <span className={`text-xl font-bold ${getCrisisPhaseColor(indicators.crisisCycle.phase)}`}>
                {getCrisisPhaseLabel(indicators.crisisCycle.phase)}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Длительность:</span>
                <span className="text-sm font-medium">{indicators.crisisCycle.duration} месяцев</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Серьезность:</span>
                <span className={`text-sm font-medium ${indicators.crisisCycle.severity > 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                  {(indicators.crisisCycle.severity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Риск кризиса:</span>
                <span className={`text-sm font-medium ${marketState.crisisRisk > 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                  {(marketState.crisisRisk * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Триггеры кризиса</h3>
            <div className="space-y-2">
              {indicators.crisisCycle.triggers.length > 0 ? (
                indicators.crisisCycle.triggers.map((trigger, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">{trigger}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Активных триггеров нет</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Рыночное состояние */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Рыночное состояние</h2>
          <p className="text-sm text-gray-600">Анализ спроса и предложения</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">
              {marketState.totalSupply.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-2">Общее предложение</div>
            <div className="text-xs text-gray-500 mt-1">
              Объем производства
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">
              {marketState.totalDemand.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-2">Общий спрос</div>
            <div className="text-xs text-gray-500 mt-1">
              Потребительский спрос
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">
              ${marketState.averagePrice}
            </div>
            <div className="text-sm text-gray-600 mt-2">Средняя цена</div>
            <div className="text-xs text-gray-500 mt-1">
              Рыночная цена
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className={`text-3xl font-bold ${marketState.competition > 0.7 ? 'text-green-600' : 'text-red-600'}`}>
              {(marketState.competition * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">Конкуренция</div>
            <div className="text-xs text-gray-500 mt-1">
              Уровень конкуренции
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className={`text-3xl font-bold ${marketState.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {marketState.growthRate > 0 ? '+' : ''}{(marketState.growthRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">Темпы роста</div>
            <div className="text-xs text-gray-500 mt-1">
              Экономический рост
            </div>
          </div>
        </div>
      </div>

      {/* Анализ и рекомендации */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Анализ и рекомендации</h2>
          <p className="text-sm text-gray-600">Основанные на марксистском анализе</p>
        </div>
        
        <div className="space-y-4">
          {indicators.concentrationIndex > 0.7 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">⚠️ Высокая концентрация капитала</h3>
              <p className="text-sm text-red-700">
                Уровень концентрации капитала превышает 70%. Это приводит к монополизации рынка,
                подавлению конкуренции и усилению эксплуатации. Рекомендуется антимонопольное регулирование.
              </p>
            </div>
          )}
          
          {indicators.unemploymentRate > 0.1 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-medium text-orange-800 mb-2">⚠️ Высокая безработица</h3>
              <p className="text-sm text-orange-700">
                Уровень безработицы превышает 10%. Это создает резервную армию труда,
                что позволяет капиталистам снижать заработную плату. Рекомендуется создавать новые предприятия.
              </p>
            </div>
          )}
          
          {indicators.profitRate < 0.1 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">⚠️ Падение нормы прибыли</h3>
              <p className="text-sm text-yellow-700">
                Норма прибыли ниже 10%. Это свидетельствует о законе тенденции нормы прибыли к падению.
                Рекомендуется повышать производительность труда или искать новые рынки.
              </p>
            </div>
          )}
          
          {marketState.crisisRisk > 0.7 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">🚨 Высокий риск кризиса</h3>
              <p className="text-sm text-red-700">
                Риск экономического кризиса превышает 70%. Приготовьтесь к возможному кризису перепроизводства.
                Рекомендуется диверсифицировать производство и создавать запасы.
              </p>
            </div>
          )}
          
          {indicators.concentrationIndex <= 0.7 && indicators.unemploymentRate <= 0.1 && indicators.profitRate >= 0.1 && marketState.crisisRisk <= 0.7 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">✅ Стабильное состояние</h3>
              <p className="text-sm text-green-700">
                Экономика находится в стабильном состоянии. Основные показатели в норме.
                Продолжайте развивать производство и следите за изменениями индикаторов.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
