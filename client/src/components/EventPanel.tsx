import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { GameEvent, EventChoice } from '../../../shared/types';
import { apiService } from '../services/api';
import { getEventTypeLabel, formatDateTime } from '../utils/format';

interface ResolvedEventRow {
  id: string;
  event_type: string;
  title: string;
  description: string;
  period: string;
  year: number;
  choice_id: string | null;
  resolved_at: string | null;
  choices_json: string | null;
}

export const EventPanel: React.FC = () => {
  const { gameState, loading, error, respondToEvent } = useGame();
  const [respondingToEvent, setRespondingToEvent] = useState<string | null>(null);
  const [eventHistory, setEventHistory] = useState<ResolvedEventRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const rows = await apiService.getEventsHistory();
      setEventHistory(rows);
    } catch {
      setEventHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [gameState.currentEvents.length]);

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

  const handleRespondToEvent = async (eventId: string, choiceId: string) => {
    try {
      setRespondingToEvent(eventId);
      await respondToEvent(eventId, choiceId);
      await loadHistory();
    } catch (err) {
      console.error('Failed to respond to event:', err);
    } finally {
      setRespondingToEvent(null);
    }
  };

  const getChoiceLabel = (row: ResolvedEventRow): string => {
    if (!row.choice_id || !row.choices_json) return row.choice_id ?? '—';
    try {
      const choices = JSON.parse(row.choices_json) as EventChoice[];
      return choices.find((c) => c.id === row.choice_id)?.text ?? row.choice_id;
    } catch {
      return row.choice_id;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">События</h1>
          <p className="text-slate-400">Исторические события и ваши решения</p>
        </div>
      </div>

      {gameState.currentEvents.length === 0 ? (
        <div className="card text-center">
          <div className="py-12">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-slate-500 text-3xl">📰</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Нет активных событий</h3>
            <p className="text-slate-400">
              В настоящее время нет событий, требующих вашего внимания
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {gameState.currentEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRespond={handleRespondToEvent}
              isResponding={respondingToEvent === event.id}
              completedLessons={gameState.completedLessons}
            />
          ))}
        </div>
      )}

      {/* История событий */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">История решений</h2>
          <p className="text-sm text-slate-400">Ваши предыдущие решения и их последствия</p>
        </div>
        
        {historyLoading ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner" />
          </div>
        ) : eventHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>История событий будет доступна после принятия первых решений</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {eventHistory.map((row) => (
              <div key={row.id} className="px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {getEventTypeLabel(row.event_type)}
                    </span>
                    <span className="text-xs text-slate-500">{row.period}</span>
                  </div>
                  <h3 className="font-medium text-slate-200">{row.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">Решение: {getChoiceLabel(row)}</p>
                </div>
                <div className="text-xs text-slate-500 shrink-0">
                  {row.resolved_at ? formatDateTime(row.resolved_at) : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface EventCardProps {
  event: GameEvent;
  onRespond: (eventId: string, choiceId: string) => void;
  isResponding: boolean;
  completedLessons: string[];
}

const EventCard: React.FC<EventCardProps> = ({ event, onRespond, isResponding, completedLessons }) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleChoice = () => {
    if (selectedChoice) {
      onRespond(event.id, selectedChoice);
    }
  };

  const isChoiceLocked = (choice: EventChoice) =>
    choice.requiredKnowledge.some((lesson) => !completedLessons.includes(lesson));

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      economic_crisis: 'bg-red-500/10 text-red-400 border-red-500/20',
      technological_breakthrough: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      social_movement: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      political_change: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      war: 'bg-red-500/10 text-red-400 border-red-500/20',
      market_change: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      labor_conflict: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
    return colors[type] ?? 'bg-slate-800/40 text-slate-400 border-slate-700/30';
  };

  return (
    <div className="card border-slate-800/60">
      <div className="card-header">
        <div>
          <h3 className="text-lg font-bold text-slate-100">{event.title}</h3>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getEventTypeColor(event.type)}`}>
              {getEventTypeLabel(event.type)}
            </span>
            <span className="text-sm text-slate-500">
              {event.year} год • {event.period}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-2">
        <p className="text-slate-400">{event.description}</p>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <h4 className="font-medium text-slate-200">Ваши варианты:</h4>
        {event.choices.map((choice: EventChoice) => {
          const locked = isChoiceLocked(choice);
          return (
            <div
              key={choice.id}
              className={`border rounded-lg p-4 ${
                locked ? 'border-slate-800/40 opacity-60' : 'border-slate-700/50 hover:border-red-500/30'
              }`}
            >
              <label className={`flex items-start space-x-3 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="radio"
                  name={`choice-${event.id}`}
                  value={choice.id}
                  checked={selectedChoice === choice.id}
                  onChange={(e) => setSelectedChoice(e.target.value)}
                  disabled={locked}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-200 mb-1">{choice.text}</div>
                  <div className="text-sm text-slate-400 mb-2">{choice.description}</div>
                  
                  {choice.requiredKnowledge.length > 0 && (
                    <div className={`text-xs mb-2 ${locked ? 'text-red-400' : 'text-blue-400'}`}>
                      {locked
                        ? `Требуется урок: ${choice.requiredKnowledge.join(', ')}`
                        : `Знания: ${choice.requiredKnowledge.join(', ')}`}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-800/40">
                      <div className="font-medium text-slate-300">Экономика</div>
                      <div className="text-slate-500">ВВП: {choice.economicImpact.gdpChange > 0 ? '+' : ''}{choice.economicImpact.gdpChange}%</div>
                    </div>
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-800/40">
                      <div className="font-medium text-slate-300">Общество</div>
                      <div className="text-slate-500">Удовлетворённость: {choice.socialImpact.workerSatisfaction > 0 ? '+' : ''}{choice.socialImpact.workerSatisfaction}</div>
                    </div>
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-800/40">
                      <div className="font-medium text-slate-300">Политика</div>
                      <div className="text-slate-500">Рев. потенциал: {choice.politicalImpact.revolutionaryPotential > 0 ? '+' : ''}{choice.politicalImpact.revolutionaryPotential}</div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          );
        })}

        <button
          onClick={handleChoice}
          disabled={!selectedChoice || isResponding}
          className="btn btn-primary"
        >
          {isResponding ? 'Обработка...' : 'Принять решение'}
        </button>
      </div>
    </div>
  );
};
