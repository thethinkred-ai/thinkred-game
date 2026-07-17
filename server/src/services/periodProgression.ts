import { HistoricalPeriod } from '../../../shared/types';
import { UserModel } from '../models/UserModel';
import { EnterpriseModel } from '../models/EnterpriseModel';
import { EventModel } from '../models/EventModel';
import { logger } from '../utils/logger';

const PERIOD_ORDER: HistoricalPeriod[] = [
  'feudalism',
  'early_capitalism',
  'industrial_revolution',
  'monopoly_capitalism',
  'imperialism',
  'modern_capitalism',
  'socialism_transition',
  'communism',
];

export interface PeriodAdvancementCondition {
  label: string;
  met: boolean;
  current: string;
  required: string;
}

export interface PeriodStatus {
  currentPeriod: HistoricalPeriod;
  nextPeriod: HistoricalPeriod | null;
  canAdvance: boolean;
  conditions: PeriodAdvancementCondition[];
  overallProgress: number;
}

export interface PeriodAdvanceResult {
  advanced: boolean;
  newPeriod: HistoricalPeriod | null;
  message: string;
}

function getPeriodIndex(period: HistoricalPeriod): number {
  return PERIOD_ORDER.indexOf(period);
}

function getNextPeriod(current: HistoricalPeriod): HistoricalPeriod | null {
  const idx = getPeriodIndex(current);
  if (idx < 0 || idx >= PERIOD_ORDER.length - 1) return null;
  return PERIOD_ORDER[idx + 1];
}

export class PeriodProgressionService {
  private userModel = new UserModel();
  private enterpriseModel = new EnterpriseModel();
  private eventModel = new EventModel();

  getPeriodStatus(userId: number): PeriodStatus | null {
    const user = this.userModel.findById(userId);
    if (!user) return null;

    const currentPeriod = user.current_period as HistoricalPeriod;
    const nextPeriod = getNextPeriod(currentPeriod);
    if (!nextPeriod) {
      return {
        currentPeriod,
        nextPeriod: null,
        canAdvance: false,
        conditions: [],
        overallProgress: 1,
      };
    }

    const enterprises = this.enterpriseModel.findByOwner(userId);
    const resolvedEvents = this.eventModel.countResolvedByUser(userId);
    const conditions = this.evaluateConditions(user, enterprises, resolvedEvents, nextPeriod);
    const metCount = conditions.filter((c) => c.met).length;
    const overallProgress = conditions.length > 0 ? metCount / conditions.length : 0;
    const canAdvance = conditions.length > 0 && conditions.every((c) => c.met);

    return {
      currentPeriod,
      nextPeriod,
      canAdvance,
      conditions,
      overallProgress,
    };
  }

  advancePeriod(userId: number): PeriodAdvanceResult {
    const status = this.getPeriodStatus(userId);
    if (!status) {
      return { advanced: false, newPeriod: null, message: 'User not found' };
    }

    if (!status.nextPeriod) {
      return { advanced: false, newPeriod: null, message: 'Already at the final period' };
    }

    if (!status.canAdvance) {
      const unmet = status.conditions.filter((c) => !c.met).map((c) => c.label);
      return {
        advanced: false,
        newPeriod: null,
        message: `Conditions not met: ${unmet.join(', ')}`,
      };
    }

    this.userModel.updateProgress(userId, { current_period: status.nextPeriod });
    logger.info(`User ${userId} advanced to period: ${status.nextPeriod}`);

    return {
      advanced: true,
      newPeriod: status.nextPeriod,
      message: `Добро пожаловать в эпоху: ${this.getPeriodLabel(status.nextPeriod)}!`,
    };
  }

  checkAndAdvancePeriod(userId: number): PeriodAdvanceResult {
    const status = this.getPeriodStatus(userId);
    if (!status || !status.canAdvance || !status.nextPeriod) {
      return { advanced: false, newPeriod: null, message: 'No advancement available' };
    }
    return this.advancePeriod(userId);
  }

  private evaluateConditions(
    user: any,
    enterprises: any[],
    resolvedEvents: number,
    nextPeriod: HistoricalPeriod
  ): PeriodAdvancementCondition[] {
    const conditions: PeriodAdvancementCondition[] = [];

    const requiredLevel = this.getRequiredLevel(nextPeriod);
    conditions.push({
      label: 'Уровень',
      met: user.level >= requiredLevel,
      current: String(user.level),
      required: `≥ ${requiredLevel}`,
    });

    const requiredEnterprises = this.getRequiredEnterprises(nextPeriod);
    conditions.push({
      label: 'Предприятия',
      met: enterprises.length >= requiredEnterprises,
      current: String(enterprises.length),
      required: `≥ ${requiredEnterprises}`,
    });

    const requiredExperience = this.getRequiredExperience(nextPeriod);
    conditions.push({
      label: 'Опыт',
      met: user.experience >= requiredExperience,
      current: String(user.experience),
      required: `≥ ${requiredExperience}`,
    });

    if (enterprises.length > 0) {
      const avgTech =
        enterprises.reduce((sum: number, e: any) => sum + (e.technology || 1), 0) /
        enterprises.length;
      const requiredTech = this.getRequiredTechnology(nextPeriod);
      conditions.push({
        label: 'Технологии',
        met: avgTech >= requiredTech,
        current: avgTech.toFixed(1),
        required: `≥ ${requiredTech.toFixed(1)}`,
      });
    }

    const requiredEvents = this.getRequiredEvents(nextPeriod);
    if (requiredEvents > 0) {
      conditions.push({
        label: 'Решённые события',
        met: resolvedEvents >= requiredEvents,
        current: String(resolvedEvents),
        required: `≥ ${requiredEvents}`,
      });
    }

    return conditions;
  }

  private getRequiredLevel(period: HistoricalPeriod): number {
    const levels: Record<HistoricalPeriod, number> = {
      feudalism: 0,
      early_capitalism: 2,
      industrial_revolution: 3,
      monopoly_capitalism: 4,
      imperialism: 5,
      modern_capitalism: 6,
      socialism_transition: 7,
      communism: 8,
    };
    return levels[period] || 0;
  }

  private getRequiredEnterprises(period: HistoricalPeriod): number {
    const counts: Record<HistoricalPeriod, number> = {
      feudalism: 0,
      early_capitalism: 1,
      industrial_revolution: 2,
      monopoly_capitalism: 3,
      imperialism: 3,
      modern_capitalism: 4,
      socialism_transition: 5,
      communism: 5,
    };
    return counts[period] || 0;
  }

  private getRequiredExperience(period: HistoricalPeriod): number {
    const xp: Record<HistoricalPeriod, number> = {
      feudalism: 0,
      early_capitalism: 50,
      industrial_revolution: 150,
      monopoly_capitalism: 300,
      imperialism: 500,
      modern_capitalism: 800,
      socialism_transition: 1200,
      communism: 2000,
    };
    return xp[period] || 0;
  }

  private getRequiredTechnology(period: HistoricalPeriod): number {
    const tech: Record<HistoricalPeriod, number> = {
      feudalism: 0,
      early_capitalism: 0.3,
      industrial_revolution: 0.5,
      monopoly_capitalism: 0.7,
      imperialism: 0.8,
      modern_capitalism: 1.0,
      socialism_transition: 1.2,
      communism: 1.5,
    };
    return tech[period] || 0;
  }

  private getRequiredEvents(period: HistoricalPeriod): number {
    const events: Record<HistoricalPeriod, number> = {
      feudalism: 0,
      early_capitalism: 0,
      industrial_revolution: 2,
      monopoly_capitalism: 5,
      imperialism: 8,
      modern_capitalism: 12,
      socialism_transition: 16,
      communism: 20,
    };
    return events[period] || 0;
  }

  private getPeriodLabel(period: HistoricalPeriod): string {
    const labels: Record<HistoricalPeriod, string> = {
      feudalism: 'Феодализм',
      early_capitalism: 'Ранний капитализм',
      industrial_revolution: 'Промышленная революция',
      monopoly_capitalism: 'Монополистический капитализм',
      imperialism: 'Империализм',
      modern_capitalism: 'Современный капитализм',
      socialism_transition: 'Переход к социализму',
      communism: 'Коммунизм',
    };
    return labels[period] || period;
  }
}
