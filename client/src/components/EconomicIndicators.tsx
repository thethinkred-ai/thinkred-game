import React, { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { EconomicChart } from './charts/EconomicChart';
import { Modal } from './ui/Modal';
import { apiService } from '../services/api';
import { EconomicIndicators as EconomicIndicatorsType } from '../../../shared/types';
import { ECONOMIC_CONCEPTS, EconomicConcept } from '../../../shared/constants/concepts';

function ConceptMetric({
  conceptId,
  label,
  value,
  valueClassName,
  onExplain,
}: {
  conceptId: string;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  onExplain: (concept: EconomicConcept) => void;
}) {
  const concept = ECONOMIC_CONCEPTS[conceptId];
  return (
    <div className="text-center p-6 bg-slate-950/30 border border-slate-800/40 rounded-lg relative">
      <button
        type="button"
        onClick={() => concept && onExplain(concept)}
        className="absolute top-3 right-3 text-slate-500 hover:text-red-400 text-xs"
        title="Объяснить метрику"
        aria-label={`Объяснение: ${label}`}
      >
        ?
      </button>
      <div className={`text-3xl font-bold ${valueClassName ?? 'text-slate-100'}`}>{value}</div>
      <div className="text-sm text-slate-400 mt-2">{label}</div>
    </div>
  );
}

export const EconomicIndicators: React.FC = () => {
  const { gameState, loading, error } = useGame();
  const [history, setHistory] = useState<EconomicIndicatorsType[]>([]);
  const [activeConcept, setActiveConcept] = useState<EconomicConcept | null>(null);

  useEffect(() => {
    apiService.getEconomicHistory()
      .then((rows) => {
        const indicators = rows.map((row: { indicators?: EconomicIndicatorsType } | EconomicIndicatorsType) => {
          if (row && typeof row === 'object' && 'indicators' in row && row.indicators) {
            return row.indicators;
          }
          return row as EconomicIndicatorsType;
        });
        setHistory(indicators);
      })
      .catch(() => setHistory([]));
  }, [gameState.economicIndicators]);

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
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-slate-500 text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">Данные недоступны</h3>
          <p className="text-slate-400">
            Экономические индикаторы будут доступны после создания предприятий
          </p>
        </div>
      </div>
    );
  }

  const chartData = history.length > 0 ? history : [indicators];

  const getCrisisPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      expansion: 'text-emerald-400',
      boom: 'text-blue-400',
      crisis: 'text-red-400',
      depression: 'text-slate-400',
      recovery: 'text-amber-400',
    };
    return colors[phase] ?? 'text-slate-400';
  };

  const getCrisisPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      expansion: 'Экспансия',
      boom: 'Бум',
      crisis: 'Кризис',
      depression: 'Депрессия',
      recovery: 'Восстановление',
    };
    return labels[phase] ?? phase;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Экономические индикаторы</h1>
        <p className="text-slate-400">Анализ состояния экономики и рынка</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Динамика показателей</h2>
          <p className="text-sm text-slate-400">История после принятия решений</p>
        </div>
        <div className="px-4 pb-4">
          <EconomicChart data={chartData} type="line" />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Макроэкономические показатели</h2>
          <p className="text-sm text-slate-400">Нажмите «?» для объяснения категории</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-4">
          <ConceptMetric
            conceptId="gdp"
            label="ВВП"
            value={`$${(indicators.gdp / 1000000).toFixed(1)}M`}
            onExplain={setActiveConcept}
          />
          <ConceptMetric
            conceptId="unemployment"
            label="Безработица"
            value={`${(indicators.unemploymentRate * 100).toFixed(1)}%`}
            valueClassName={indicators.unemploymentRate > 0.1 ? 'text-red-400' : 'text-emerald-400'}
            onExplain={setActiveConcept}
          />
          <ConceptMetric
            conceptId="inflation"
            label="Инфляция"
            value={`${(indicators.inflationRate * 100).toFixed(1)}%`}
            valueClassName={indicators.inflationRate > 0.05 ? 'text-red-400' : 'text-emerald-400'}
            onExplain={setActiveConcept}
          />
          <ConceptMetric
            conceptId="profit_rate"
            label="Норма прибыли"
            value={`${(indicators.profitRate * 100).toFixed(1)}%`}
            valueClassName="text-blue-400"
            onExplain={setActiveConcept}
          />
          <ConceptMetric
            conceptId="surplus_value"
            label="Норма прибавочной стоимости"
            value={`${(indicators.surplusValueRate * 100).toFixed(1)}%`}
            valueClassName="text-purple-400"
            onExplain={setActiveConcept}
          />
          <ConceptMetric
            conceptId="concentration"
            label="Концентрация капитала"
            value={`${(indicators.concentrationIndex * 100).toFixed(1)}%`}
            valueClassName={indicators.concentrationIndex > 0.7 ? 'text-red-400' : 'text-emerald-400'}
            onExplain={setActiveConcept}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Экономические циклы</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-4">
          <div className="p-6 bg-slate-950/30 border border-slate-800/40 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200">Текущая фаза</h3>
              <button
                type="button"
                onClick={() => setActiveConcept(ECONOMIC_CONCEPTS.crisis_cycle)}
                className="text-xs text-slate-500 hover:text-red-400"
              >
                Объяснить цикл
              </button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xl font-bold ${getCrisisPhaseColor(indicators.crisisCycle.phase)}`}>
                {getCrisisPhaseLabel(indicators.crisisCycle.phase)}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Длительность:</span>
                <span className="text-slate-200">{indicators.crisisCycle.duration} мес.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Риск кризиса:</span>
                <span className={marketState.crisisRisk > 0.7 ? 'text-red-400' : 'text-emerald-400'}>
                  {(marketState.crisisRisk * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-950/30 border border-slate-800/40 rounded-lg">
            <EconomicChart data={chartData} type="bar" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Рыночное состояние</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 pb-4">
          <div className="text-center p-4 bg-slate-950/30 rounded-lg">
            <div className="text-xl font-bold text-slate-100">{marketState.totalSupply.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Предложение</div>
          </div>
          <div className="text-center p-4 bg-slate-950/30 rounded-lg">
            <div className="text-xl font-bold text-slate-100">{marketState.totalDemand.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Спрос</div>
          </div>
          <div className="text-center p-4 bg-slate-950/30 rounded-lg">
            <div className="text-xl font-bold text-slate-100">${marketState.averagePrice}</div>
            <div className="text-xs text-slate-500">Средняя цена</div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!activeConcept}
        onClose={() => setActiveConcept(null)}
        title={activeConcept?.title ?? ''}
      >
        {activeConcept && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">{activeConcept.short}</p>
            <p className="text-slate-200 leading-relaxed">{activeConcept.explanation}</p>
            {activeConcept.relatedLessons && activeConcept.relatedLessons.length > 0 && (
              <p className="text-xs text-amber-400">
                Связанные уроки Stepik: {activeConcept.relatedLessons.join(', ')}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
