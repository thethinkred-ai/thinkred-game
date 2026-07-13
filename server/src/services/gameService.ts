import {
  Enterprise,
  GameEvent,
  EconomicIndicators,
  MarketState,
  GameProgress,
  EnterpriseDecision,
  HistoricalPeriod,
} from '../../../shared/types';
import { GAME_CONSTANTS } from '../../../shared/constants/game';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { UserModel } from '../models/UserModel';
import { EnterpriseModel, EnterpriseData } from '../models/EnterpriseModel';
import { EventModel, GameEventData } from '../models/EventModel';
import { EconomicModelEngine } from './economicModel';
import { EventSystem } from './eventSystem';

function mapEnterprise(row: EnterpriseData): Enterprise {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Enterprise['type'],
    level: row.level,
    workers: row.workers,
    wageRate: row.wage_rate,
    production: row.production,
    costs: {
      labor: row.costs_labor,
      materials: row.costs_materials,
      overhead: row.costs_overhead,
      depreciation: row.costs_depreciation,
    },
    revenue: row.revenue,
    profit: row.profit,
    surplusValue: row.surplus_value,
    technology: row.technology,
    location: row.location,
    owner: String(row.owner_id),
    established: row.established,
  };
}

function mapEvent(row: GameEventData): GameEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.event_type as GameEvent['type'],
    period: row.period as HistoricalPeriod,
    year: row.year,
    choices: [],
    consequences: [],
    prerequisites: [],
    weight: 1,
  };
}

export class GameService {
  private userModel = new UserModel();
  private enterpriseModel = new EnterpriseModel();
  private eventModel = new EventModel();
  private economicModel = new EconomicModelEngine();
  private eventSystem = new EventSystem();

  async getGameState(userId: number) {
    const user = this.userModel.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const enterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
    const activeEvents = this.eventModel.findActiveByUser(userId).map(mapEvent);
    const economicIndicators = this.economicModel.calculateIndicators(enterprises);
    const marketState = this.economicModel.simulateMarket();

    const unlockedFeatures = JSON.parse(user.unlocked_features || '["basic_enterprises"]');

    return {
      currentPeriod: user.current_period as HistoricalPeriod,
      level: user.level,
      experience: user.experience,
      enterprises,
      currentEvents: activeEvents,
      economicIndicators,
      marketState,
      unlockedFeatures,
    };
  }

  async getUserEnterprises(userId: number): Promise<Enterprise[]> {
    return this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
  }

  async createEnterprise(userId: number, data: { name: string; type: string; location: string }): Promise<Enterprise> {
    const enterpriseType = data.type as any;
    const config = GAME_CONSTANTS.ENTERPRISE_TYPES[enterpriseType];

    if (!config) {
      throw createError('Invalid enterprise type', 400);
    }

    const maxEnterprises = GAME_CONSTANTS.MAX_ENTERPRISES_PER_PLAYER;
    const currentCount = this.enterpriseModel.countByOwner(userId);
    if (currentCount >= maxEnterprises) {
      throw createError(`Maximum enterprises limit reached (${maxEnterprises})`, 400);
    }

    const id = Math.random().toString(36).substr(2, 9);
    const currentYear = new Date().getFullYear();

    const enterprise = this.enterpriseModel.create({
      id,
      owner_id: userId,
      name: data.name,
      type: enterpriseType,
      location: data.location,
      production: config.baseProduction,
      costs_materials: config.baseProduction * GAME_CONSTANTS.BASE_PRODUCTION_COST,
      costs_overhead: config.baseCost * 0.1,
      costs_depreciation: config.baseCost * 0.05,
    });

    this.userModel.updateProgress(userId, {
      experience: (this.userModel.findById(userId)?.experience || 0) + GAME_CONSTANTS.EXPERIENCE_PER_DECISION,
    });

    logger.info(`Created enterprise ${enterprise.id} for user ${userId}`);
    return mapEnterprise(enterprise);
  }

  async updateEnterprise(userId: number, enterpriseId: string, updates: any): Promise<Enterprise> {
    const enterprise = this.enterpriseModel.findById(enterpriseId);

    if (!enterprise) {
      throw createError('Enterprise not found', 404);
    }

    if (enterprise.owner_id !== userId) {
      throw createError('Access denied', 403);
    }

    const allowedUpdates: any = {};
    if (updates.wageRate !== undefined) allowedUpdates.wage_rate = updates.wageRate;
    if (updates.workers !== undefined) allowedUpdates.workers = updates.workers;
    if (updates.name !== undefined) allowedUpdates.name = updates.name;

    const updated = this.enterpriseModel.update(enterpriseId, allowedUpdates);
    if (!updated) {
      throw createError('Failed to update enterprise', 500);
    }

    this.recalculateEconomics(updated);

    logger.info(`Updated enterprise ${enterpriseId} for user ${userId}`);
    return mapEnterprise(updated);
  }

  async makeDecision(userId: number, enterpriseId: string, decision: EnterpriseDecision): Promise<any> {
    const enterprise = this.enterpriseModel.findById(enterpriseId);

    if (!enterprise) {
      throw createError('Enterprise not found', 404);
    }

    if (enterprise.owner_id !== userId) {
      throw createError('Access denied', 403);
    }

    const result = { ...decision.expectedImpact };

    switch (decision.type) {
      case 'wage_change':
        this.enterpriseModel.update(enterpriseId, { wage_rate: decision.value });
        break;
      case 'investment':
        this.enterpriseModel.update(enterpriseId, {
          technology: enterprise.technology + decision.value * 0.1,
          production: enterprise.production * (1 + decision.value * 0.05),
        });
        break;
      case 'production_change':
        this.enterpriseModel.update(enterpriseId, { production: decision.value });
        break;
      case 'technology_upgrade':
        this.enterpriseModel.update(enterpriseId, {
          technology: enterprise.technology + decision.value,
          production: enterprise.production * (1 + decision.value * 0.1),
        });
        break;
    }

    const updated = this.enterpriseModel.findById(enterpriseId)!;
    this.recalculateEconomics(updated);

    this.userModel.updateProgress(userId, {
      experience: (this.userModel.findById(userId)?.experience || 0) + GAME_CONSTANTS.EXPERIENCE_PER_DECISION,
    });

    const triggeredEvents = await this.eventSystem.checkForEvents(userId, decision);

    return { decision, result, triggeredEvents };
  }

  async getCurrentEvents(userId: number): Promise<GameEvent[]> {
    return this.eventModel.findActiveByUser(userId).map(mapEvent);
  }

  async respondToEvent(userId: number, eventId: string, choiceId: string): Promise<any> {
    const event = this.eventModel.findById(eventId);
    if (!event) {
      throw createError('Event not found', 404);
    }

    this.eventModel.resolve(eventId, choiceId);

    this.userModel.updateProgress(userId, {
      experience: (this.userModel.findById(userId)?.experience || 0) + GAME_CONSTANTS.EXPERIENCE_PER_DECISION,
    });

    return { eventId, choiceId, resolved: true };
  }

  async getEconomicIndicators(userId: number): Promise<EconomicIndicators> {
    const enterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
    return this.economicModel.calculateIndicators(enterprises);
  }

  async getMarketState(userId: number): Promise<MarketState> {
    return this.economicModel.simulateMarket();
  }

  async getUserProgress(userId: number): Promise<GameProgress> {
    const user = this.userModel.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const enterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
    const unlockedFeatures = JSON.parse(user.unlocked_features || '["basic_enterprises"]');

    return {
      userId,
      stepikProgress: {
        completedLessons: [],
        completedSteps: [],
        currentLesson: 1,
        totalScore: 0,
      },
      gameProgress: {
        currentPeriod: user.current_period,
        unlockedFeatures,
        enterprises: enterprises.map(e => e.id),
        decisions: [],
        achievements: [],
        level: user.level,
        experience: user.experience,
      },
      economicUnderstanding: {
        concepts: {},
        practicalSkills: {},
        criticalThinking: 0,
      },
    };
  }

  async getAvailableEnterpriseTypes(userId: number): Promise<any> {
    const user = this.userModel.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const currentPeriod = user.current_period as keyof typeof GAME_CONSTANTS.HISTORICAL_PERIODS;
    const periodConfig = GAME_CONSTANTS.HISTORICAL_PERIODS[currentPeriod];

    if (!periodConfig) {
      return [];
    }

    return periodConfig.availableEnterprises.map(type => ({
      type,
      ...GAME_CONSTANTS.ENTERPRISE_TYPES[type as keyof typeof GAME_CONSTANTS.ENTERPRISE_TYPES],
    }));
  }

  async simulateMarket(rounds: number): Promise<any> {
    const results = [];
    for (let i = 0; i < rounds; i++) {
      results.push({
        round: i + 1,
        marketState: this.economicModel.simulateMarket(),
        timestamp: Date.now(),
      });
    }
    return results;
  }

  private recalculateEconomics(enterprise: EnterpriseData) {
    const labor = enterprise.workers * enterprise.wage_rate;
    const marketPrice = this.economicModel.getMarketPrice(enterprise.type);
    const revenue = enterprise.production * marketPrice;
    const totalCosts = labor + enterprise.costs_materials + enterprise.costs_overhead + enterprise.costs_depreciation;
    const profit = revenue - totalCosts;
    const surplusValue = Math.max(0, revenue - labor);

    this.enterpriseModel.update(enterprise.id, {
      costs_labor: labor,
      revenue,
      profit,
      surplus_value: surplusValue,
    });
  }
}
