import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { GameEvent, EventChoice } from '../../../shared/types';

export const EventPanel: React.FC = () => {
  const { gameState, loading, error, respondToEvent } = useGame();
  const [respondingToEvent, setRespondingToEvent] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Failed to respond to event:', error);
    } finally {
      setRespondingToEvent(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">События</h1>
          <p className="text-gray-600">Исторические события и ваши решения</p>
        </div>
      </div>

      {gameState.currentEvents.length === 0 ? (
        <div className="card text-center">
          <div className="py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-3xl">📰</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет активных событий</h3>
            <p className="text-gray-600">
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
            />
          ))}
        </div>
      )}

      {/* История событий */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">История решений</h2>
          <p className="text-sm text-gray-600">Ваши предыдущие решения и их последствия</p>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <p>История событий будет доступна после принятия первых решений</p>
        </div>
      </div>
    </div>
  );
};

interface EventCardProps {
  event: GameEvent;
  onRespond: (eventId: string, choiceId: string) => void;
  isResponding: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRespond, isResponding }) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleChoice = () => {
    if (selectedChoice) {
      onRespond(event.id, selectedChoice);
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      economic_crisis: 'Экономический кризис',
      technological_breakthrough: 'Технологический прорыв',
      social_movement: 'Социальное движение',
      political_change: 'Политические изменения',
      war: 'Война',
      market_change: 'Рыночные изменения',
      labor_conflict: 'Рабочий конфликт',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      economic_crisis: 'bg-red-100 text-red-800',
      technological_breakthrough: 'bg-green-100 text-green-800',
      social_movement: 'bg-blue-100 text-blue-800',
      political_change: 'bg-purple-100 text-purple-800',
      war: 'bg-red-100 text-red-800',
      market_change: 'bg-yellow-100 text-yellow-800',
      labor_conflict: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <div>
          <h3 className="event-title">{event.title}</h3>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`event-type ${getEventTypeColor(event.type)}`}>
              {getEventTypeLabel(event.type)}
            </span>
            <span className="text-sm text-gray-500">
              {event.year} год • {event.period}
            </span>
          </div>
        </div>
      </div>

      <div className="event-description">
        <p>{event.description}</p>
      </div>

      {event.prerequisites.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Требования:</strong> {event.prerequisites.join(', ')}
          </p>
        </div>
      )}

      <div className="event-choices">
        <h4 className="font-medium text-gray-900 mb-3">Ваши варианты:</h4>
        <div className="space-y-3">
          {event.choices.map((choice: EventChoice) => (
            <div key={choice.id} className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`choice-${event.id}`}
                  value={choice.id}
                  checked={selectedChoice === choice.id}
                  onChange={(e) => setSelectedChoice(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">
                    {choice.text}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {choice.description}
                  </div>
                  
                  {choice.requiredKnowledge.length > 0 && (
                    <div className="text-xs text-blue-600 mb-2">
                      <strong>Требуемые знания:</strong> {choice.requiredKnowledge.join(', ')}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-700">Экономика</div>
                      <div className="text-gray-600">
                        ВВП: {choice.economicImpact.gdpChange > 0 ? '+' : ''}{choice.economicImpact.gdpChange}%
                      </div>
                      <div className="text-gray-600">
                        Прибыль: {choice.economicImpact.profitRateChange > 0 ? '+' : ''}{choice.economicImpact.profitRateChange}%
                      </div>
                    </div>
                    
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-700">Общество</div>
                      <div className="text-gray-600">
                        Удовлетворенность: {choice.socialImpact.workerSatisfaction > 0 ? '+' : ''}{choice.socialImpact.workerSatisfaction}
                      </div>
                      <div className="text-gray-600">
                        Стабильность: {choice.socialImpact.socialStability > 0 ? '+' : ''}{choice.socialImpact.socialStability}
                      </div>
                    </div>
                    
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-700">Политика</div>
                      <div className="text-gray-600">
                        Поддержка: {choice.politicalImpact.governmentSupport > 0 ? '+' : ''}{choice.politicalImpact.governmentSupport}
                      </div>
                      <div className="text-gray-600">
                        Революционный потенциал: {choice.politicalImpact.revolutionaryPotential > 0 ? '+' : ''}{choice.politicalImpact.revolutionaryPotential}
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-4 flex space-x-4">
          <button
            onClick={handleChoice}
            disabled={!selectedChoice || isResponding}
            className="btn btn-primary"
          >
            {isResponding ? 'Обработка...' : 'Принять решение'}
          </button>
        </div>
      </div>
    </div>
  );
};
