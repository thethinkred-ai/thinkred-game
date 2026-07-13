import { EnterpriseDecision, GameEvent } from '../../../shared/types';
import { EventModel } from '../models/EventModel';
import { GAME_EVENTS } from '../../../shared/constants/game';
import { logger } from '../utils/logger';

export class EventSystem {
  private eventModel = new EventModel();

  async checkForEvents(userId: number, _decision: EnterpriseDecision): Promise<GameEvent[]> {
    const events: GameEvent[] = [];

    const crisisProb = GAME_EVENTS.ECONOMIC_CRISIS.baseProbability;
    if (Math.random() < crisisProb) {
      const event = this.eventModel.create({
        id: Math.random().toString(36).substr(2, 9),
        user_id: userId,
        event_type: 'economic_crisis',
        title: 'Экономический кризис',
        description: 'Начался экономический кризис перепроизводства. Необходимо принять решение.',
        period: 'early_capitalism',
        year: new Date().getFullYear(),
      });
      events.push({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.event_type as GameEvent['type'],
        period: event.period as any,
        year: event.year,
        choices: [
          {
            id: 'cut_production',
            text: 'Сократить производство',
            description: 'Уменьшить объемы производства для стабилизации',
            requiredKnowledge: [],
            economicImpact: { gdpChange: -5, unemploymentChange: 3, profitRateChange: 2, concentrationChange: 0, crisisRiskChange: -10 },
            socialImpact: { classConsciousness: {}, workerSatisfaction: -5, socialStability: -3, educationLevel: 0 },
            politicalImpact: { governmentSupport: 0, revolutionaryPotential: 2, reformMovement: 0, repressionLevel: 0 },
          },
          {
            id: 'maintain',
            text: 'Сохранить текущий уровень',
            description: 'Продолжать работать в прежнем режиме',
            requiredKnowledge: [],
            economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: -3, concentrationChange: 0, crisisRiskChange: 5 },
            socialImpact: { classConsciousness: {}, workerSatisfaction: 0, socialStability: 0, educationLevel: 0 },
            politicalImpact: { governmentSupport: 0, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 },
          },
          {
            id: 'diversify',
            text: 'Диверсифицировать производство',
            description: 'Расширить ассортимент продукции',
            requiredKnowledge: [],
            economicImpact: { gdpChange: 3, unemploymentChange: -1, profitRateChange: 1, concentrationChange: -2, crisisRiskChange: -5 },
            socialImpact: { classConsciousness: {}, workerSatisfaction: 2, socialStability: 1, educationLevel: 1 },
            politicalImpact: { governmentSupport: 1, revolutionaryPotential: -1, reformMovement: 0, repressionLevel: 0 },
          },
        ],
        consequences: [],
        prerequisites: [],
        weight: 1,
      });
    }

    const laborProb = GAME_EVENTS.LABOR_MOVEMENT.baseProbability;
    if (Math.random() < laborProb) {
      const event = this.eventModel.create({
        id: Math.random().toString(36).substr(2, 9),
        user_id: userId,
        event_type: 'labor_conflict',
        title: 'Рабочее движение',
        description: 'Рабочие требуют повышения заработной платы и улучшения условий труда.',
        period: 'early_capitalism',
        year: new Date().getFullYear(),
      });
      events.push({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.event_type as GameEvent['type'],
        period: event.period as any,
        year: event.year,
        choices: [
          {
            id: 'raise_wages',
            text: 'Повысить зарплату',
            description: 'Удовлетворить требования рабочих',
            requiredKnowledge: [],
            economicImpact: { gdpChange: 1, unemploymentChange: -1, profitRateChange: -5, concentrationChange: 0, crisisRiskChange: -3 },
            socialImpact: { classConsciousness: {}, workerSatisfaction: 10, socialStability: 5, educationLevel: 0 },
            politicalImpact: { governmentSupport: 2, revolutionaryPotential: -3, reformMovement: 2, repressionLevel: 0 },
          },
          {
            id: 'ignore',
            text: 'Игнорировать требования',
            description: 'Не менять условий труда',
            requiredKnowledge: [],
            economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: 0, concentrationChange: 0, crisisRiskChange: 5 },
            socialImpact: { classConsciousness: {}, workerSatisfaction: -10, socialStability: -5, educationLevel: 0 },
            politicalImpact: { governmentSupport: -2, revolutionaryPotential: 5, reformMovement: -1, repressionLevel: 2 },
          },
        ],
        consequences: [],
        prerequisites: [],
        weight: 1,
      });
    }

    return events;
  }
}
