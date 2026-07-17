import { EnterpriseDecision, GameEvent } from '../../../shared/types';
import { EventModel } from '../models/EventModel';
import { GAME_EVENTS } from '../../../shared/constants/game';
import { getEventChoices, buildGameEventFromRow } from '../utils/eventTemplates';
import { EnterpriseModel, EnterpriseData } from '../models/EnterpriseModel';
import { EconomicModelEngine } from './economicModel';
import { UserModel } from '../models/UserModel';
import { Enterprise } from '../../../shared/types';

const EVENT_PROBABILITIES: Record<string, number> = {
  economic_crisis: GAME_EVENTS.ECONOMIC_CRISIS.baseProbability,
  labor_conflict: GAME_EVENTS.LABOR_MOVEMENT.baseProbability,
  technological_breakthrough: GAME_EVENTS.TECHNOLOGICAL_BREAKTHROUGH.baseProbability,
  market_change: GAME_EVENTS.MARKET_CHANGE.baseProbability,
  peasant_revolt: GAME_EVENTS.PEASANT_REVOLT.baseProbability,
  land_enclosure: GAME_EVENTS.LAND_ENCLOSURE.baseProbability,
  crop_failure: GAME_EVENTS.CROP_FAILURE.baseProbability,
  factory_conditions: GAME_EVENTS.FACTORY_CONDITIONS.baseProbability,
  luddite_rebellion: GAME_EVENTS.LUDDITE_REBELLION.baseProbability,
  urbanization: GAME_EVENTS.URBANIZATION.baseProbability,
  trust_busting: GAME_EVENTS.TRUST_BUSTING.baseProbability,
  stock_crash: GAME_EVENTS.STOCK_CRASH.baseProbability,
  trade_wars: GAME_EVENTS.TRADE_WARS.baseProbability,
  automation_shock: GAME_EVENTS.AUTOMATION_SHOCK.baseProbability,
  green_movement: GAME_EVENTS.GREEN_MOVEMENT.baseProbability,
  financial_crisis: GAME_EVENTS.FINANCIAL_CRISIS.baseProbability,
  nationalization: GAME_EVENTS.NATIONALIZATION.baseProbability,
  worker_cooperative: GAME_EVENTS.WORKER_COOPERATIVE.baseProbability,
  political_change: GAME_EVENTS.POLITICAL_CHANGE?.baseProbability ?? 0.1,
  war: GAME_EVENTS.WAR?.baseProbability ?? 0.05,
  social_movement: GAME_EVENTS.SOCIAL_MOVEMENT?.baseProbability ?? 0.1,
};

function mapEnterpriseLocal(row: EnterpriseData): Enterprise {
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

interface GameSnapshot {
  enterprises: any[];
  indicators: {
    concentrationIndex: number;
    unemploymentRate: number;
    profitRate: number;
    crisisCycle: { phase: string; severity: number };
  };
  currentPeriod: string;
}

const EVENT_TITLES: Record<string, { title: string; description: string }> = {
  economic_crisis: {
    title: 'Экономический кризис',
    description: 'Начался экономический кризис перепроизводства. Необходимо принять решение.',
  },
  labor_conflict: {
    title: 'Рабочий конфликт',
    description: 'Рабочие требуют повышения заработной платы и улучшения условий труда.',
  },
  technological_breakthrough: {
    title: 'Технологический прорыв',
    description: 'Появилась возможность внедрить революционную технологию, способную изменить производство.',
  },
  market_change: {
    title: 'Рыночные изменения',
    description: 'Рыночная ситуация изменилась — спрос растёт или падает, конкуренты меняют стратегии.',
  },
  peasant_revolt: {
    title: 'Крестьянское восстание',
    description: 'Недовольство крестьян гнётом феодалов переросло в открытое восстание. Ваши земли и урожай под угрозой.',
  },
  land_enclosure: {
    title: 'Огораживание земель',
    description: 'Крупные землевладельцы начинают огораживать общинные земли, лишая крестьян доступа к пастбищам и лесам.',
  },
  crop_failure: {
    title: 'Неурожай',
    description: 'Суровая погода и вредители уничтожили значительную часть урожая. Голод и рост цен на продовольствие неизбежны.',
  },
  factory_conditions: {
    title: 'Условия труда на фабриках',
    description: 'Рабочие жалуются на непосильные условия труда: 16-часовой рабочий день, детский труд, антисанитария.',
  },
  luddite_rebellion: {
    title: 'Восстание луддитов',
    description: 'Рабочие, потерявшие работу из-за автоматизации, начали крушить машины и оборудование на фабриках.',
  },
  urbanization: {
    title: 'Урбанизация',
    description: 'Поток крестьян устремляется в города в поисках работы. Это создаёт как возможности, так и социальное напряжение.',
  },
  trust_busting: {
    title: 'Антимонопольное регулирование',
    description: 'Государство начинает антимонопольную кампанию, направленную против крупных корпораций и трестов.',
  },
  stock_crash: {
    title: 'Биржевой крах',
    description: 'Паника на фондовых рынках привела к обвалу котировок и банкротству многих финансовых институтов.',
  },
  trade_wars: {
    title: 'Торговые войны',
    description: 'Страны вводят заградительные пошлины и торговые барьеры, международная торговля резко сокращается.',
  },
  automation_shock: {
    title: 'Автоматизация производства',
    description: 'Новые технологии автоматизации угрожают массовыми увольнениями, но обещают рост производительности.',
  },
  green_movement: {
    title: 'Экологическое движение',
    description: 'Общественность требует сокращения вредных выбросов и перехода к экологически чистому производству.',
  },
  financial_crisis: {
    title: 'Финансовый кризис',
    description: 'Пузырь на финансовых рынках лопнул. Кредиты заморожены, ценные бумаги обесценились, банки требуют выплат.',
  },
  nationalization: {
    title: 'Национализация промышленности',
    description: 'Новое правительство объявляет о национализации ключевых отраслей промышленности.',
  },
  worker_cooperative: {
    title: 'Рабочее самоуправление',
    description: 'Рабочие вашего предприятия предлагают создать производственный кооператив с коллективным управлением.',
  },
  political_change: {
    title: 'Политические изменения',
    description: 'Политическая ситуация в стране меняется. Новые законы и реформы могут существенно повлиять на экономику.',
  },
  war: {
    title: 'Война',
    description: 'Начался военный конфликт. Экономика переводится на военные рельсы, ресурсы перераспределяются.',
  },
  social_movement: {
    title: 'Общественное движение',
    description: 'Массовое общественное движение набирает силу, требуя социальных и экономических преобразований.',
  },
};

export class EventSystem {
  private eventModel = new EventModel();
  private enterpriseModel = new EnterpriseModel();
  private economicModel = new EconomicModelEngine();
  private userModel = new UserModel();

  async checkForEvents(userId: number, _decision: EnterpriseDecision): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const enterprises = this.enterpriseModel.findByOwner(userId).map(mapEnterpriseLocal);
    const user = this.userModel.findById(userId);

    const snapshot: GameSnapshot = {
      enterprises,
      indicators: this.economicModel.calculateIndicators(enterprises),
      currentPeriod: user?.current_period ?? 'feudalism',
    };

    const triggeredTypes = this.evaluateTriggers(snapshot);

    for (const eventType of triggeredTypes) {
      const prob = this.getEventProbability(eventType);
      if (Math.random() < prob) {
        const event = this.createEvent(userId, eventType, snapshot);
        if (event) {
          events.push(event);
        }
      }
    }

    return events;
  }

  private evaluateTriggers(snapshot: GameSnapshot): string[] {
    const triggered: string[] = [];
    const { indicators, enterprises } = snapshot;

    const avgWage =
      enterprises.length > 0
        ? enterprises.reduce((sum: number, e: any) => sum + (e.wageRate || 100), 0) / enterprises.length
        : 100;
    const totalProduction = enterprises.reduce((sum: number, e: any) => sum + (e.production || 0), 0);
    const avgTech =
      enterprises.length > 0
        ? enterprises.reduce((sum: number, e: any) => sum + (e.technology || 1), 0) / enterprises.length
        : 1;
    const period = snapshot.currentPeriod;

    // --- Existing: economic_crisis ---
    const crisisTriggers = GAME_EVENTS.ECONOMIC_CRISIS.triggers;
    if (
      crisisTriggers.includes('high_concentration') && indicators.concentrationIndex > 0.7 ||
      crisisTriggers.includes('overproduction') && indicators.crisisCycle.phase === 'crisis' ||
      crisisTriggers.includes('low_wages') && avgWage < 80
    ) {
      triggered.push('economic_crisis');
    }

    // --- Existing: labor_conflict ---
    const laborTriggers = GAME_EVENTS.LABOR_MOVEMENT.triggers;
    if (
      laborTriggers.includes('low_wages') && avgWage < 70 ||
      laborTriggers.includes('poor_conditions') && indicators.unemploymentRate > 0.15 ||
      laborTriggers.includes('high_consciousness') && indicators.concentrationIndex > 0.6
    ) {
      triggered.push('labor_conflict');
    }

    // --- Existing: technological_breakthrough ---
    const techTriggers = GAME_EVENTS.TECHNOLOGICAL_BREAKTHROUGH.triggers;
    if (
      techTriggers.includes('research_investment') && avgTech > 1.5 ||
      techTriggers.includes('high_education') && enterprises.some((e: any) => e.type === 'research_center')
    ) {
      triggered.push('technological_breakthrough');
    }

    // --- Existing: market_change ---
    const marketTriggers = GAME_EVENTS.MARKET_CHANGE.triggers;
    if (
      marketTriggers.includes('competition') && indicators.concentrationIndex > 0.5 ||
      marketTriggers.includes('demand_shift') && indicators.profitRate < 0.05 ||
      marketTriggers.includes('innovation') && avgTech > 1.2
    ) {
      triggered.push('market_change');
    }

    // --- peasant_revolt (feudalism) ---
    if (period === 'feudalism' && avgWage < 60) {
      triggered.push('peasant_revolt');
    }

    // --- land_enclosure (feudalism → early_capitalism) ---
    if ((period === 'feudalism' || period === 'early_capitalism') && enterprises.length >= 2) {
      triggered.push('land_enclosure');
    }

    // --- crop_failure (feudalism) ---
    if (period === 'feudalism' && enterprises.some((e: any) => e.type === 'farm')) {
      triggered.push('crop_failure');
    }

    // --- factory_conditions (industrial_revolution) ---
    if (period === 'industrial_revolution' && avgWage < 80 && enterprises.some((e: any) => e.type === 'factory')) {
      triggered.push('factory_conditions');
    }

    // --- luddite_rebellion (industrial_revolution) ---
    if (period === 'industrial_revolution' && avgTech > 1.3 && indicators.unemploymentRate > 0.12) {
      triggered.push('luddite_rebellion');
    }

    // --- urbanization (industrial_revolution → monopoly_capitalism) ---
    if ((period === 'industrial_revolution' || period === 'monopoly_capitalism') && enterprises.length >= 3) {
      triggered.push('urbanization');
    }

    // --- trust_busting (monopoly_capitalism → imperialism) ---
    if ((period === 'monopoly_capitalism' || period === 'imperialism') && indicators.concentrationIndex > 0.7) {
      triggered.push('trust_busting');
    }

    // --- stock_crash (monopoly_capitalism → modern_capitalism) ---
    if ((period === 'monopoly_capitalism' || period === 'imperialism' || period === 'modern_capitalism') && enterprises.some((e: any) => e.profit > 50000)) {
      triggered.push('stock_crash');
    }

    // --- trade_wars (imperialism → modern_capitalism) ---
    if ((period === 'imperialism' || period === 'modern_capitalism') && enterprises.length >= 4) {
      triggered.push('trade_wars');
    }

    // --- automation_shock (modern_capitalism) ---
    if (period === 'modern_capitalism' && avgTech > 2.0 && indicators.unemploymentRate > 0.15) {
      triggered.push('automation_shock');
    }

    // --- green_movement (modern_capitalism → socialism_transition) ---
    if ((period === 'modern_capitalism' || period === 'socialism_transition') && totalProduction > 5000) {
      triggered.push('green_movement');
    }

    // --- financial_crisis (modern_capitalism) ---
    if (period === 'modern_capitalism' && indicators.crisisCycle.phase === 'boom') {
      triggered.push('financial_crisis');
    }

    // --- nationalization (socialism_transition → communism) ---
    if ((period === 'socialism_transition' || period === 'communism') && indicators.concentrationIndex > 0.5) {
      triggered.push('nationalization');
    }

    // --- worker_cooperative (socialism_transition → communism) ---
    if ((period === 'socialism_transition' || period === 'communism') && avgWage < 90) {
      triggered.push('worker_cooperative');
    }

    // --- political_change (any period after early capitalism) ---
    if ((period === 'monopoly_capitalism' || period === 'imperialism' || period === 'modern_capitalism') && indicators.concentrationIndex > 0.6) {
      triggered.push('political_change');
    }

    // --- war (imperialism → modern_capitalism) ---
    if ((period === 'imperialism' || period === 'modern_capitalism') && enterprises.some((e: any) => e.technology > 2.0)) {
      triggered.push('war');
    }

    // --- social_movement (industrial_revolution → modern_capitalism) ---
    if ((period === 'industrial_revolution' || period === 'monopoly_capitalism' || period === 'modern_capitalism') && avgWage < 75 && indicators.unemploymentRate > 0.1) {
      triggered.push('social_movement');
    }

    return triggered;
  }

  private getEventProbability(eventType: string): number {
    return EVENT_PROBABILITIES[eventType] ?? 0.1;
  }

  private createEvent(userId: number, eventType: string, snapshot: GameSnapshot): GameEvent | null {
    const meta = EVENT_TITLES[eventType];
    if (!meta) return null;

    const choices = getEventChoices(eventType);
    if (choices.length === 0) return null;

    const event = this.eventModel.create({
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      event_type: eventType,
      title: meta.title,
      description: meta.description,
      period: snapshot.currentPeriod,
      year: new Date().getFullYear(),
      choices_json: JSON.stringify(choices),
    });

    return buildGameEventFromRow(event) as GameEvent;
  }
}
