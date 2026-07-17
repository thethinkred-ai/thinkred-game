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
import { StepikService } from './stepikService';
import { PeriodProgressionService } from './periodProgression';
import { buildGameEventFromRow } from '../utils/eventTemplates';
import { getDatabase } from '../database';
import { AchievementModel } from '../models/AchievementModel';
import { SnapshotModel } from '../models/SnapshotModel';
import { DecisionCooldownModel } from '../models/DecisionCooldownModel';
import { ACHIEVEMENTS } from '../../../shared/constants/game';

export function mapEnterprise(row: EnterpriseData): Enterprise {
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
    period: row.created_period,
  };
}

function mapEvent(row: GameEventData): GameEvent {
  return buildGameEventFromRow(row) as GameEvent;
}

export interface EconomicSnapshotSummary {
  totalProfit: number;
  totalWorkers: number;
  avgSurplusValue: number;
  enterpriseCount: number;
}

export class GameService {
  private userModel = new UserModel();
  private enterpriseModel = new EnterpriseModel();
  private eventModel = new EventModel();
  private achievementModel = new AchievementModel();
  private snapshotModel = new SnapshotModel();
  private economicModel = new EconomicModelEngine();
  private eventSystem = new EventSystem();
  private stepikService = new StepikService();
  private periodService = new PeriodProgressionService();
  private cooldownModel = new DecisionCooldownModel();

  private async getCompletedLessons(userId: number): Promise<string[]> {
    return this.stepikService.getCompletedLessons(userId);
  }

  private computeUnlockedFeatures(completedLessons: string[]): string[] {
    const features = new Set<string>(['basic_enterprises']);
    if (completedLessons.some((l) => ['lesson_1', 'lesson_2'].includes(l))) {
      features.add('basic_enterprises');
    }
    if (completedLessons.some((l) => ['lesson_3', 'lesson_4', 'lesson_5'].includes(l))) {
      features.add('advanced_enterprises');
    }
    if (completedLessons.includes('lesson_6')) {
      features.add('research');
    }
    if (completedLessons.includes('lesson_8')) {
      features.add('international_trade');
    }
    return Array.from(features);
  }

  private checkAchievements(userId: number): string[] {
    const user = this.userModel.findById(userId);
    if (!user) return [];

    const enterprises = this.enterpriseModel.findByOwner(userId);
    const periodsReached = new Set(enterprises.map((e) => e.created_period)).size;
    const periodIndex = Object.keys(GAME_CONSTANTS.HISTORICAL_PERIODS).indexOf(user.current_period) + 1;
    const eventsModel = new EventModel();
    const eventsCount = eventsModel.countResolvedByUser(userId);
    const maxProfit = Math.max(0, ...enterprises.map((e) => e.profit));

    const unlocked = this.achievementModel.checkAndUnlock(userId, {
      level: user.level,
      experience: user.experience,
      enterprises: enterprises.length,
      periods: Math.max(periodIndex, periodsReached),
      maxProfit,
      events: eventsCount,
    });

    for (const key of unlocked) {
      const def = ACHIEVEMENTS[key];
      if (def) {
        this.userModel.updateProgress(userId, {
          experience: (this.userModel.findById(userId)?.experience || 0) + def.rewardXp,
        });
        this.applyLevelUp(userId);
        logger.info(`Achievement unlocked: ${def.name} (${key}) for user ${userId}, +${def.rewardXp} XP`);
      }
    }

    return this.achievementModel.findByUser(userId);
  }

  private applyLevelUp(userId: number): { leveledUp: boolean; newLevel: number } {
    const user = this.userModel.findById(userId);
    if (!user) return { leveledUp: false, newLevel: 1 };

    let { level, experience } = user;
    let leveledUp = false;

    while (experience >= level * GAME_CONSTANTS.LEVEL_UP_EXPERIENCE) {
      experience -= level * GAME_CONSTANTS.LEVEL_UP_EXPERIENCE;
      level += 1;
      leveledUp = true;
    }

    if (leveledUp || experience !== user.experience) {
      this.userModel.updateProgress(userId, { level, experience });
    }

    return { leveledUp, newLevel: level };
  }

  private async syncProgressIfNeeded(userId: number, leveledUp: boolean) {
    if (!leveledUp) return;
    const progress = await this.getUserProgress(userId);
    await this.stepikService.updateProgress(userId, progress);
  }

  private buildEnterpriseSummary(enterprises: Enterprise[]): EconomicSnapshotSummary {
    const totalProfit = enterprises.reduce((sum, e) => sum + e.profit, 0);
    const totalWorkers = enterprises.reduce((sum, e) => sum + e.workers, 0);
    const avgSurplusValue =
      enterprises.length > 0
        ? enterprises.reduce((sum, e) => sum + e.surplusValue, 0) / enterprises.length
        : 0;
    return {
      totalProfit,
      totalWorkers,
      avgSurplusValue,
      enterpriseCount: enterprises.length,
    };
  }

  private saveEconomicSnapshot(userId: number, indicators: EconomicIndicators, enterprises: Enterprise[]) {
    const payload = {
      indicators,
      summary: this.buildEnterpriseSummary(enterprises),
    };
    this.snapshotModel.save(userId, JSON.stringify(payload));
  }

  async getGameState(userId: number) {
    const user = this.userModel.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const completedLessons = await this.getCompletedLessons(userId);
    const unlockedFeatures = this.computeUnlockedFeatures(completedLessons);
    this.userModel.updateProgress(userId, {
      unlocked_features: JSON.stringify(unlockedFeatures),
    });

    const userData = user;
    let enterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);

    if (enterprises.length === 0 && (userData?.level ?? 1) <= 1) {
      enterprises = [await this.seedInitialEnterprise(userId)];
    }

    const activeEvents = this.eventModel.findActiveByUser(userId).map(mapEvent);
    const economicIndicators = this.economicModel.calculateIndicators(enterprises);
    const marketState = this.economicModel.simulateMarket(enterprises);
    const availableEnterpriseTypes = await this.getAvailableEnterpriseTypes(userId);

    this.checkAchievements(userId);

    return {
      currentPeriod: user.current_period as HistoricalPeriod,
      level: user.level,
      experience: user.experience,
      enterprises,
      currentEvents: activeEvents,
      economicIndicators,
      marketState,
      unlockedFeatures,
      completedLessons,
      availableEnterpriseTypes,
      achievements: this.achievementModel.findByUser(userId),
    };
  }

  async getUserEnterprises(userId: number): Promise<Enterprise[]> {
    return this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
  }

  async createEnterprise(userId: number, data: { name: string; type: string; location: string }): Promise<Enterprise> {
    const enterpriseType = data.type as keyof typeof GAME_CONSTANTS.ENTERPRISE_TYPES;
    const config = GAME_CONSTANTS.ENTERPRISE_TYPES[enterpriseType];

    if (!config) {
      throw createError('Invalid enterprise type', 400);
    }

    const completedLessons = await this.getCompletedLessons(userId);
    if (!this.stepikService.isEnterpriseUnlocked(config.unlockConditions, completedLessons)) {
      throw createError(
        `Enterprise type locked. Complete lessons: ${config.unlockConditions.join(', ')}`,
        403
      );
    }

    const user = this.userModel.findById(userId);
    const currentPeriod = user?.current_period as keyof typeof GAME_CONSTANTS.HISTORICAL_PERIODS;
    const periodConfig = GAME_CONSTANTS.HISTORICAL_PERIODS[currentPeriod];
    if (periodConfig && !(periodConfig.availableEnterprises as readonly string[]).includes(enterpriseType)) {
      throw createError('Enterprise type not available in current historical period', 403);
    }

    const periodEnterpriseCount = this.enterpriseModel.countByOwnerAndPeriod(userId, currentPeriod);
    if (periodEnterpriseCount >= 1) {
      throw createError('You can only create one enterprise per historical period. Advance to the next period to create more.', 400);
    }

    const id = Math.random().toString(36).substr(2, 9);

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
      created_period: currentPeriod,
    });

    this.enterpriseModel.update(enterprise.id, {
      workers: Math.floor(config.workerCapacity * 0.5),
      wage_rate: GAME_CONSTANTS.BASE_WAGE_RATE,
    });

    this.recalculateEconomics(this.enterpriseModel.findById(enterprise.id)!);

    this.userModel.updateProgress(userId, {
      experience: (this.userModel.findById(userId)?.experience || 0) + GAME_CONSTANTS.EXPERIENCE_PER_DECISION,
    });
    const { leveledUp } = this.applyLevelUp(userId);
    await this.syncProgressIfNeeded(userId, leveledUp);

    logger.info(`Created enterprise ${enterprise.id} for user ${userId} in period ${currentPeriod}`);

    const allEnterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
    const indicators = this.economicModel.calculateIndicators(allEnterprises);
    this.saveEconomicSnapshot(userId, indicators, allEnterprises);

    await this.periodService.checkAndAdvancePeriod(userId);
    this.checkAchievements(userId);
    return mapEnterprise(enterprise);
  }

  async deleteEnterprise(userId: number, enterpriseId: string): Promise<void> {
    const enterprise = this.enterpriseModel.findById(enterpriseId);

    if (!enterprise) {
      throw createError('Enterprise not found', 404);
    }

    if (enterprise.owner_id !== userId) {
      throw createError('Access denied', 403);
    }

    this.enterpriseModel.delete(enterpriseId);

    this.userModel.updateProgress(userId, {
      experience: (this.userModel.findById(userId)?.experience || 0) + GAME_CONSTANTS.EXPERIENCE_PER_DECISION,
    });
    this.applyLevelUp(userId);

    const allEnterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
    const indicators = this.economicModel.calculateIndicators(allEnterprises);
    this.saveEconomicSnapshot(userId, indicators, allEnterprises);

    logger.info(`Deleted enterprise ${enterpriseId} for user ${userId}`);
  }

  async updateEnterprise(userId: number, enterpriseId: string, updates: Record<string, unknown>): Promise<Enterprise> {
    const enterprise = this.enterpriseModel.findById(enterpriseId);

    if (!enterprise) {
      throw createError('Enterprise not found', 404);
    }

    if (enterprise.owner_id !== userId) {
      throw createError('Access denied', 403);
    }

    const allowedUpdates: Record<string, unknown> = {};
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

  async makeDecision(userId: number, enterpriseId: string, decision: EnterpriseDecision): Promise<unknown> {
    const cooldown = this.cooldownModel.canAct(userId);
    if (!cooldown.allowed) {
      const remainingMin = Math.ceil(cooldown.remainingMs / 60000);
      throw createError(`Решение можно принимать раз в 24 часа. Осталось: ${remainingMin} мин.`, 429);
    }

    const enterprise = this.enterpriseModel.findById(enterpriseId);

    if (!enterprise) {
      throw createError('Enterprise not found', 404);
    }

    if (enterprise.owner_id !== userId) {
      throw createError('Access denied', 403);
    }

    const result = this.economicModel.calculateDecisionImpact(
      mapEnterprise(enterprise),
      decision.type,
      decision.value
    );

    switch (decision.type) {
      case 'wage_change':
        this.enterpriseModel.update(enterpriseId, { wage_rate: decision.value });
        break;
      case 'investment':
        this.enterpriseModel.update(enterpriseId, {
          technology: enterprise.technology + decision.value * 0.1,
          production: enterprise.production + decision.value * 0.5,
        });
        break;
      case 'production_change':
        this.enterpriseModel.update(enterpriseId, { production: decision.value });
        break;
      case 'technology_upgrade':
        this.enterpriseModel.update(enterpriseId, {
          technology: enterprise.technology + decision.value,
          production: enterprise.production + decision.value * 2,
        });
        break;
    }

    const updated = this.enterpriseModel.findById(enterpriseId)!;
    this.recalculateEconomics(updated);

    const db = getDatabase();
    db.run(
      'INSERT INTO decisions (id, user_id, enterprise_id, type, value, result) VALUES (?, ?, ?, ?, ?, ?)',
      [
        Math.random().toString(36).substr(2, 9),
        userId,
        enterpriseId,
        decision.type,
        decision.value,
        JSON.stringify(result),
      ]
    );

    this.userModel.updateProgress(userId, {
      experience: (this.userModel.findById(userId)?.experience || 0) + GAME_CONSTANTS.EXPERIENCE_PER_DECISION,
    });
    const { leveledUp } = this.applyLevelUp(userId);

    const enterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
    const indicators = this.economicModel.calculateIndicators(enterprises);
    this.saveEconomicSnapshot(userId, indicators, enterprises);

    const triggeredEvents = await this.eventSystem.checkForEvents(userId, decision);
    await this.syncProgressIfNeeded(userId, leveledUp);
    await this.periodService.checkAndAdvancePeriod(userId);
    this.checkAchievements(userId);

    return { decision, result, triggeredEvents };
  }

  async getCurrentEvents(userId: number): Promise<GameEvent[]> {
    return this.eventModel.findActiveByUser(userId).map(mapEvent);
  }

  async respondToEvent(userId: number, eventId: string, choiceId: string): Promise<unknown> {
    const cooldown = this.cooldownModel.canAct(userId);
    if (!cooldown.allowed) {
      const remainingMin = Math.ceil(cooldown.remainingMs / 60000);
      throw createError(`Решение можно принимать раз в 24 часа. Осталось: ${remainingMin} мин.`, 429);
    }

    const event = this.eventModel.findById(eventId);
    if (!event) {
      throw createError('Event not found', 404);
    }
    if (event.user_id !== userId) {
      throw createError('Access denied', 403);
    }

    const gameEvent = mapEvent(event);
    const choice = gameEvent.choices.find((c) => c.id === choiceId);
    if (!choice) {
      throw createError('Invalid choice', 400);
    }

    const completedLessons = await this.getCompletedLessons(userId);
    const missingKnowledge = choice.requiredKnowledge.filter((l) => !completedLessons.includes(l));
    if (missingKnowledge.length > 0) {
      throw createError(
        `Complete required lessons first: ${missingKnowledge.join(', ')}`,
        403
      );
    }

    const enterprises = this.enterpriseModel.findByOwner(userId);
    if (enterprises.length > 0) {
      const econImpact = choice.economicImpact;
      const socImpact = choice.socialImpact;
      const polImpact = choice.politicalImpact;

      for (const target of enterprises) {
        const wageAdjust = (econImpact.profitRateChange * -0.5) + (polImpact.repressionLevel * 2);
        this.enterpriseModel.update(target.id, {
          wage_rate: Math.max(50, Math.min(500, target.wage_rate + wageAdjust)),
          production: Math.max(0, target.production * (1 + econImpact.gdpChange / 100)),
          technology: Math.max(0.1, target.technology + (econImpact.gdpChange > 0 ? 0.05 : -0.02)),
        });
        this.recalculateEconomics(this.enterpriseModel.findById(target.id)!);
      }

      this.userModel.updateProgress(userId, {
        experience: (this.userModel.findById(userId)?.experience || 0) +
          Math.round(socImpact.workerSatisfaction > 0 ? socImpact.workerSatisfaction : 0),
      });
    }

    this.eventModel.resolve(eventId, choiceId);

    const db = getDatabase();
    db.run(
      'INSERT INTO decisions (id, user_id, enterprise_id, type, value, result) VALUES (?, ?, ?, ?, ?, ?)',
      [
        Math.random().toString(36).substr(2, 9),
        userId,
        null,
        `event_response:${event.event_type}`,
        0,
        JSON.stringify({ eventId, choiceId, impact: choice.economicImpact }),
      ]
    );

    this.userModel.updateProgress(userId, {
      experience: (this.userModel.findById(userId)?.experience || 0) + GAME_CONSTANTS.EXPERIENCE_PER_DECISION,
    });
    const { leveledUp } = this.applyLevelUp(userId);
    await this.syncProgressIfNeeded(userId, leveledUp);
    await this.periodService.checkAndAdvancePeriod(userId);
    this.checkAchievements(userId);

    return { eventId, choiceId, resolved: true, impact: choice.economicImpact };
  }

  async getEconomicIndicators(userId: number): Promise<EconomicIndicators> {
    const enterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
    return this.economicModel.calculateIndicators(enterprises);
  }

  async getEconomicHistory(userId: number): Promise<Array<{ indicators: EconomicIndicators; summary?: EconomicSnapshotSummary }>> {
    const rows = this.snapshotModel.findHistoryByUser(userId);
    const history: Array<{ indicators: EconomicIndicators; summary?: EconomicSnapshotSummary }> = [];
    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.indicators);
        if (parsed.indicators) {
          history.push({
            indicators: parsed.indicators as EconomicIndicators,
            summary: parsed.summary,
          });
        } else {
          history.push({ indicators: parsed as EconomicIndicators });
        }
      } catch {
        // skip invalid rows
      }
    }
    return history;
  }

  async getMarketState(userId: number): Promise<MarketState> {
    const enterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
    return this.economicModel.simulateMarket(enterprises);
  }

  async getUserProgress(userId: number): Promise<GameProgress> {
    const user = this.userModel.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const enterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterprise);
    const completedLessons = await this.getCompletedLessons(userId);
    const unlockedFeatures = this.computeUnlockedFeatures(completedLessons);
    const stepikProgress = await this.stepikService.getProgress(userId);

    this.checkAchievements(userId);

    return {
      userId,
      stepikProgress: {
        completedLessons,
        completedSteps: [],
        currentLesson: completedLessons.length + 1,
        totalScore: stepikProgress?.score ?? 0,
      },
      gameProgress: {
        currentPeriod: user.current_period,
        unlockedFeatures,
        enterprises: enterprises.map((e) => e.id),
        decisions: [],
        achievements: this.achievementModel.findByUser(userId),
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

  async getAvailableEnterpriseTypes(userId: number) {
    const user = this.userModel.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const completedLessons = await this.getCompletedLessons(userId);
    const currentPeriod = user.current_period as keyof typeof GAME_CONSTANTS.HISTORICAL_PERIODS;
    const periodConfig = GAME_CONSTANTS.HISTORICAL_PERIODS[currentPeriod];

    if (!periodConfig) {
      return [];
    }

    return periodConfig.availableEnterprises.map((type) => {
      const config = GAME_CONSTANTS.ENTERPRISE_TYPES[type as keyof typeof GAME_CONSTANTS.ENTERPRISE_TYPES];
      const unlocked = this.stepikService.isEnterpriseUnlocked(config.unlockConditions, completedLessons);
      return {
        type,
        ...config,
        unlocked,
        requiredLessons: config.unlockConditions,
      };
    });
  }

  async simulateMarket(rounds: number): Promise<unknown[]> {
    const results = [];
    for (let i = 0; i < rounds; i++) {
      results.push({
        round: i + 1,
        marketState: this.economicModel.simulateMarket([]),
        timestamp: Date.now(),
      });
    }
    return results;
  }

  getDecisionCooldown(userId: number): { remainingMs: number; canAct: boolean } {
    const result = this.cooldownModel.canAct(userId);
    return { remainingMs: result.allowed ? 0 : result.remainingMs, canAct: result.allowed };
  }

  getEnterpriseMap(period?: string): Array<Enterprise & { ownerName: string }> {
    if (period) {
      return this.enterpriseModel.findMapByPeriod(period).map((row) => ({
        ...mapEnterprise(row),
        ownerName: row.owner_name,
      }));
    }
    return this.enterpriseModel.findMapAll().map((row) => ({
      ...mapEnterprise(row),
      ownerName: row.owner_name,
    }));
  }

  private async seedInitialEnterprise(userId: number): Promise<Enterprise> {
    const user = this.userModel.findById(userId);
    const period = (user?.current_period ?? 'feudalism') as keyof typeof GAME_CONSTANTS.HISTORICAL_PERIODS;
    const periodConfig = GAME_CONSTANTS.HISTORICAL_PERIODS[period];
    const firstType = periodConfig?.availableEnterprises[0] ?? 'manufactory';
    const config = GAME_CONSTANTS.ENTERPRISE_TYPES[firstType as keyof typeof GAME_CONSTANTS.ENTERPRISE_TYPES];

    const id = Math.random().toString(36).substr(2, 9);
    const location = period === 'feudalism' ? 'Деревня' : period === 'early_capitalism' ? 'Манчестер' : 'Город';

    this.enterpriseModel.create({
      id,
      owner_id: userId,
      name: period === 'feudalism' ? 'Крестьянское хозяйство' : 'Первая мануфактура',
      type: firstType,
      location,
      production: config.baseProduction,
      costs_materials: config.baseProduction * GAME_CONSTANTS.BASE_PRODUCTION_COST,
      costs_overhead: config.baseCost * 0.1,
      costs_depreciation: config.baseCost * 0.05,
      created_period: period,
    });

    this.enterpriseModel.update(id, {
      workers: Math.floor(config.workerCapacity * 0.3),
      wage_rate: GAME_CONSTANTS.BASE_WAGE_RATE,
    });

    this.userModel.updateProgress(userId, {
      experience: (this.userModel.findById(userId)?.experience || 0) + 20,
    });

    this.recalculateEconomics(this.enterpriseModel.findById(id)!);
    logger.info(`Seeded initial enterprise for user ${userId}`);

    return mapEnterprise(this.enterpriseModel.findById(id)!);
  }

  private recalculateEconomics(enterprise: EnterpriseData) {
    const labor = enterprise.workers * enterprise.wage_rate;
    const marketPrice = this.economicModel.getMarketPrice(enterprise.type);

    if (enterprise.workers === 0) {
      this.enterpriseModel.update(enterprise.id, {
        production: 0,
        costs_labor: 0,
        revenue: 0,
        profit: 0,
        surplus_value: 0,
      });
      return;
    }

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
