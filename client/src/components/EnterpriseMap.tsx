import React, { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Enterprise } from '../../../shared/types';
import { apiService } from '../services/api';

interface EnterpriseMapEntry extends Enterprise {
  ownerName: string;
}

const PERIOD_LABELS: Record<string, { label: string; era: string; color: string }> = {
  feudalism: { label: 'Феодализм', era: 'XV–XVIII вв.', color: 'amber' },
  early_capitalism: { label: 'Ранний капитализм', era: 'XVIII–XIX вв.', color: 'orange' },
  industrial_revolution: { label: 'Промышленная революция', era: 'XIX в.', color: 'blue' },
  monopoly_capitalism: { label: 'Монополистический капитализм', era: 'Начало XX в.', color: 'purple' },
  imperialism: { label: 'Империализм', era: 'XX в.', color: 'red' },
  modern_capitalism: { label: 'Современный капитализм', era: 'XX–XXI вв.', color: 'cyan' },
  socialism_transition: { label: 'Переход к социализму', era: 'Будущее', color: 'emerald' },
  communism: { label: 'Коммунизм', era: 'Коммунистическое общество', color: 'rose' },
};

const PERIOD_ORDER = [
  'feudalism', 'early_capitalism', 'industrial_revolution',
  'monopoly_capitalism', 'imperialism', 'modern_capitalism',
  'socialism_transition', 'communism',
];

const TYPE_LABELS: Record<string, string> = {
  manufactory: 'Мануфактура',
  factory: 'Фабрика',
  shop: 'Магазин',
  farm: 'Ферма',
  mine: 'Шахта',
  research_center: 'Исслед. центр',
};

export const EnterpriseMap: React.FC = () => {
  const { gameState, loading } = useGame();
  const [enterprises, setEnterprises] = useState<EnterpriseMapEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    loadMap();
  }, []);

  const loadMap = async () => {
    setMapLoading(true);
    try {
      const data = await apiService.getEnterpriseMap();
      setEnterprises(data);
    } catch {
      setEnterprises([]);
    } finally {
      setMapLoading(false);
    }
  };

  const filtered = selectedPeriod
    ? enterprises.filter((e) => e.period === selectedPeriod)
    : enterprises;

  const grouped = PERIOD_ORDER.reduce((acc, period) => {
    acc[period] = enterprises.filter((e) => e.period === period);
    return acc;
  }, {} as Record<string, EnterpriseMapEntry[]>);

  const totalByPeriod = PERIOD_ORDER.map((p) => ({
    period: p,
    count: grouped[p].length,
  }));

  const isCurrentPeriod = (period: string) => period === gameState.currentPeriod;

  if (loading || mapLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Карта предприятий</h1>
          <p className="text-slate-400">Все предприятия всех игроков по историческим эпохам</p>
        </div>
        <div className="text-sm text-slate-500">
          Всего: {enterprises.length} предприятий
        </div>
      </div>

      {/* Статистика по эпохам */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Предприятия по эпохам</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 px-4 pb-4">
          {totalByPeriod.map(({ period, count }) => {
            const info = PERIOD_LABELS[period];
            const isSelected = selectedPeriod === period;
            const isCurrent = isCurrentPeriod(period);
            return (
              <button
                key={period}
                onClick={() => setSelectedPeriod(isSelected ? null : period)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? `border-${info.color}-500/50 bg-${info.color}-500/10`
                    : isCurrent
                      ? 'border-slate-600 bg-slate-800/60'
                      : 'border-slate-800/40 bg-slate-950/20 hover:border-slate-700/60'
                }`}
              >
                <div className={`text-2xl font-bold ${
                  isSelected ? `text-${info.color}-400` : isCurrent ? 'text-slate-100' : 'text-slate-400'
                }`}>
                  {count}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                  {info.label}
                </div>
                {isCurrent && (
                  <div className="text-[9px] text-amber-500 mt-1 font-bold">ТЕКУЩАЯ</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Карта */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {selectedPeriod ? PERIOD_LABELS[selectedPeriod]?.label || selectedPeriod : 'Все эпохи'}
          </h2>
          {selectedPeriod && (
            <button
              onClick={() => setSelectedPeriod(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Сбросить фильтр
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-slate-500">🗺️</span>
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">Нет предприятий</h3>
            <p className="text-sm text-slate-500">
              {selectedPeriod
                ? `В эпоху «${PERIOD_LABELS[selectedPeriod]?.label}» ещё нет предприятий`
                : 'Пока ни один игрок не создал предприятие'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 px-4 pb-4">
            {(selectedPeriod ? [selectedPeriod] : PERIOD_ORDER.filter((p) => grouped[p].length > 0)).map((period) => {
              const info = PERIOD_LABELS[period];
              const periodEnterprises = grouped[period];
              if (periodEnterprises.length === 0) return null;

              return (
                <div key={period}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-sm font-bold text-${info.color}-400`}>{info.label}</span>
                    <span className="text-xs text-slate-600">{info.era}</span>
                    <span className="text-xs text-slate-500">· {periodEnterprises.length} предприятий</span>
                    {isCurrentPeriod(period) && (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        ТЕКУЩАЯ
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {periodEnterprises.map((enterprise) => {
                      const isOwn = String(enterprise.owner) === String(gameState.enterprises[0]?.owner);
                      return (
                        <div
                          key={enterprise.id}
                          className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${
                            isOwn
                              ? 'border-amber-500/30 bg-amber-950/10'
                              : 'border-slate-800/40 bg-slate-950/20'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-slate-100 text-sm">{enterprise.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-${info.color}-500/10 text-${info.color}-400 border border-${info.color}-500/20`}>
                                  {TYPE_LABELS[enterprise.type] || enterprise.type}
                                </span>
                                {isOwn && (
                                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                    ВАШЕ
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-bold ${enterprise.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ${enterprise.profit.toLocaleString()}
                              </div>
                              <div className="text-[9px] text-slate-500">прибыль</div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-slate-500 mb-2">
                            📍 {enterprise.location || 'Не указано'}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-900/30 p-1.5 rounded border border-slate-800/30">
                              <div className="text-xs font-bold text-slate-200">{enterprise.workers}</div>
                              <div className="text-[9px] text-slate-500">рабочих</div>
                            </div>
                            <div className="bg-slate-900/30 p-1.5 rounded border border-slate-800/30">
                              <div className="text-xs font-bold text-slate-200">{enterprise.production}</div>
                              <div className="text-[9px] text-slate-500">продукция</div>
                            </div>
                            <div className="bg-slate-900/30 p-1.5 rounded border border-slate-800/30">
                              <div className="text-xs font-bold text-slate-200">${enterprise.wageRate}</div>
                              <div className="text-[9px] text-slate-500">зарплата</div>
                            </div>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-slate-800/30 text-[10px] text-slate-500 flex justify-between">
                            <span>Владелец: <span className="text-slate-300">{enterprise.ownerName}</span></span>
                            <span>Ур. {enterprise.level}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
