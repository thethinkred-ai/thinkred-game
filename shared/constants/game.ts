export const GAME_CONSTANTS = {
  // Economic constants
  BASE_WAGE_RATE: 100,
  BASE_PRODUCTION_COST: 50,
  SURPLUS_VALUE_RATE: 0.3,
  PROFIT_MARGIN_MIN: 0.1,
  PROFIT_MARGIN_MAX: 0.5,
  
  // Enterprise constants
  ENTERPRISE_TYPES: {
    manufactory: {
      baseCost: 10000,
      baseProduction: 100,
      workerCapacity: 20,
      technologyMultiplier: 1.0,
      unlockConditions: ['lesson_1']
    },
    factory: {
      baseCost: 50000,
      baseProduction: 500,
      workerCapacity: 100,
      technologyMultiplier: 1.5,
      unlockConditions: ['lesson_3', 'lesson_5']
    },
    shop: {
      baseCost: 5000,
      baseProduction: 50,
      workerCapacity: 5,
      technologyMultiplier: 1.0,
      unlockConditions: ['lesson_2']
    },
    farm: {
      baseCost: 8000,
      baseProduction: 80,
      workerCapacity: 15,
      technologyMultiplier: 0.8,
      unlockConditions: ['lesson_1']
    },
    mine: {
      baseCost: 20000,
      baseProduction: 200,
      workerCapacity: 50,
      technologyMultiplier: 1.2,
      unlockConditions: ['lesson_4']
    },
    research_center: {
      baseCost: 30000,
      baseProduction: 0,
      workerCapacity: 30,
      technologyMultiplier: 2.0,
      unlockConditions: ['lesson_6', 'lesson_8']
    }
  },
  
  // Historical periods
  HISTORICAL_PERIODS: {
    feudalism: {
      startYear: 1500,
      endYear: 1750,
      description: 'Феодализм и ранние формы капитала',
      availableEnterprises: ['manufactory', 'farm'],
      maxEnterpriseLevel: 1,
      technologyLevel: 0.2
    },
    early_capitalism: {
      startYear: 1750,
      endYear: 1850,
      description: 'Ранний капитализм и мануфактуры',
      availableEnterprises: ['manufactory', 'farm', 'shop'],
      maxEnterpriseLevel: 2,
      technologyLevel: 0.4
    },
    industrial_revolution: {
      startYear: 1850,
      endYear: 1900,
      description: 'Промышленная революция',
      availableEnterprises: ['manufactory', 'factory', 'shop', 'farm', 'mine'],
      maxEnterpriseLevel: 3,
      technologyLevel: 0.6
    },
    monopoly_capitalism: {
      startYear: 1900,
      endYear: 1950,
      description: 'Монополистический капитализм',
      availableEnterprises: ['factory', 'shop', 'mine', 'research_center'],
      maxEnterpriseLevel: 4,
      technologyLevel: 0.8
    },
    imperialism: {
      startYear: 1950,
      endYear: 2000,
      description: 'Империализм и глобализация',
      availableEnterprises: ['factory', 'shop', 'mine', 'research_center'],
      maxEnterpriseLevel: 5,
      technologyLevel: 0.9
    },
    modern_capitalism: {
      startYear: 2000,
      endYear: 2025,
      description: 'Современный капитализм',
      availableEnterprises: ['factory', 'shop', 'mine', 'research_center'],
      maxEnterpriseLevel: 6,
      technologyLevel: 1.0
    },
    socialism_transition: {
      startYear: 2025,
      endYear: 2050,
      description: 'Переход к социализму',
      availableEnterprises: ['factory', 'shop', 'mine', 'research_center'],
      maxEnterpriseLevel: 7,
      technologyLevel: 1.2
    },
    communism: {
      startYear: 2050,
      endYear: 2100,
      description: 'Коммунистическое общество',
      availableEnterprises: ['factory', 'shop', 'mine', 'research_center'],
      maxEnterpriseLevel: 10,
      technologyLevel: 1.5
    }
  },
  
  // Game mechanics
  DECISION_COOLDOWN: 86400000, // 24 hours in milliseconds
  MAX_ENTERPRISES_PER_PLAYER: 10,
  EXPERIENCE_PER_DECISION: 10,
  EXPERIENCE_PER_LESSON: 50,
  LEVEL_UP_EXPERIENCE: 100,
  
  // Economic calculations
  MARKET_ELASTICITY: 0.5,
  CRISIS_THRESHOLD: 0.8,
  CONCENTRATION_THRESHOLD: 0.7,
  REVOLUTION_THRESHOLD: 0.9,
  
  // UI constants
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  AUTO_SAVE_INTERVAL: 60000, // 1 minute
  
  // API constants
  API_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  PAGE_SIZE: 20
} as const;

export const STEPIK_CONFIG = {
  CLIENT_ID: typeof process !== 'undefined' ? process.env.STEPIK_CLIENT_ID || '' : '',
  CLIENT_SECRET: typeof process !== 'undefined' ? process.env.STEPIK_CLIENT_SECRET || '' : '',
  REDIRECT_URI: typeof process !== 'undefined' ? process.env.STEPIK_REDIRECT_URI || 'http://localhost:3000/auth/stepik/callback' : 'http://localhost:3000/auth/stepik/callback',
  BASE_URL: 'https://stepik.org',
  API_URL: 'https://stepik.org/api',
  OAUTH_URL: 'https://stepik.org/oauth2',
  SCOPES: ['read', 'write']
} as const;

export const GAME_EVENTS = {
  ECONOMIC_CRISIS: {
    baseProbability: 0.1,
    triggers: ['high_concentration', 'low_wages', 'overproduction'],
    effects: ['unemployment_increase', 'profit_decrease', 'social_unrest']
  },
  TECHNOLOGICAL_BREAKTHROUGH: {
    baseProbability: 0.05,
    triggers: ['research_investment', 'high_education'],
    effects: ['productivity_increase', 'cost_decrease', 'new_markets']
  },
  LABOR_MOVEMENT: {
    baseProbability: 0.15,
    triggers: ['low_wages', 'poor_conditions', 'high_consciousness'],
    effects: ['wage_increase', 'better_conditions', 'organization_growth']
  },
  MARKET_CHANGE: {
    baseProbability: 0.2,
    triggers: ['competition', 'innovation', 'demand_shift'],
    effects: ['price_change', 'market_share_shift', 'profit_change']
  },
  PEASANT_REVOLT: {
    baseProbability: 0.12,
    triggers: ['feudalism', 'low_wages', 'crop_failure'],
    effects: ['production_loss', 'social_unrest', 'wage_change']
  },
  LAND_ENCLOSURE: {
    baseProbability: 0.1,
    triggers: ['feudalism', 'early_capitalism', 'high_wages'],
    effects: ['production_change', 'unemployment_increase', 'social_unrest']
  },
  CROP_FAILURE: {
    baseProbability: 0.08,
    triggers: ['feudalism', 'farming_focus'],
    effects: ['production_loss', 'famine', 'social_unrest']
  },
  FACTORY_CONDITIONS: {
    baseProbability: 0.15,
    triggers: ['industrial_revolution', 'high_production', 'low_wages'],
    effects: ['worker_satisfaction_decrease', 'social_unrest', 'profit_change']
  },
  LUDDITE_REBELLION: {
    baseProbability: 0.08,
    triggers: ['industrial_revolution', 'high_technology', 'high_unemployment'],
    effects: ['production_loss', 'technology_loss', 'social_unrest']
  },
  URBANIZATION: {
    baseProbability: 0.1,
    triggers: ['industrial_revolution', 'monopoly_capitalism', 'many_enterprises'],
    effects: ['production_increase', 'demand_increase', 'social_strain']
  },
  TRUST_BUSTING: {
    baseProbability: 0.1,
    triggers: ['monopoly_capitalism', 'imperialism', 'high_concentration'],
    effects: ['production_decrease', 'competition_increase', 'profit_decrease']
  },
  STOCK_CRASH: {
    baseProbability: 0.06,
    triggers: ['monopoly_capitalism', 'imperialism', 'modern_capitalism', 'high_profit'],
    effects: ['profit_decrease', 'crisis_risk_increase', 'unemployment']
  },
  TRADE_WARS: {
    baseProbability: 0.08,
    triggers: ['imperialism', 'modern_capitalism', 'high_trade'],
    effects: ['profit_decrease', 'production_change', 'market_change']
  },
  AUTOMATION_SHOCK: {
    baseProbability: 0.12,
    triggers: ['modern_capitalism', 'high_technology', 'high_unemployment'],
    effects: ['unemployment_increase', 'production_increase', 'social_unrest']
  },
  GREEN_MOVEMENT: {
    baseProbability: 0.1,
    triggers: ['modern_capitalism', 'socialism_transition', 'high_production'],
    effects: ['profit_decrease', 'cost_increase', 'social_change']
  },
  FINANCIAL_CRISIS: {
    baseProbability: 0.08,
    triggers: ['modern_capitalism', 'high_debt', 'speculation'],
    effects: ['profit_decrease', 'crisis', 'government_bailout']
  },
  NATIONALIZATION: {
    baseProbability: 0.12,
    triggers: ['socialism_transition', 'communism', 'high_concentration'],
    effects: ['ownership_change', 'production_change', 'profit_decrease']
  },
  WORKER_COOPERATIVE: {
    baseProbability: 0.1,
    triggers: ['socialism_transition', 'communism', 'low_satisfaction'],
    effects: ['satisfaction_increase', 'production_change', 'profit_change']
  },
  POLITICAL_CHANGE: {
    baseProbability: 0.1,
    triggers: ['monopoly_capitalism', 'imperialism', 'high_concentration'],
    effects: ['government_change', 'policy_reform', 'profit_change']
  },
  WAR: {
    baseProbability: 0.05,
    triggers: ['imperialism', 'modern_capitalism', 'high_technology'],
    effects: ['production_loss', 'resource_redistribution', 'market_disruption']
  },
  SOCIAL_MOVEMENT: {
    baseProbability: 0.1,
    triggers: ['industrial_revolution', 'monopoly_capitalism', 'low_wages', 'high_unemployment'],
    effects: ['social_unrest', 'wage_change', 'policy_reform']
  }
} as const;

export const ACHIEVEMENTS: Record<string, {
  name: string;
  description: string;
  icon: string;
  type: 'learning' | 'economic' | 'social' | 'political';
  check: 'level' | 'experience' | 'period' | 'enterprises' | 'profit' | 'events';
  target: number;
  rewardXp: number;
}> = {
  first_enterprise: {
    name: 'Первый шаг',
    description: 'Создайте своё первое предприятие',
    icon: '🏭',
    type: 'economic',
    check: 'enterprises',
    target: 1,
    rewardXp: 20,
  },
  enterprise_collector: {
    name: 'Коллекционер',
    description: 'Создайте предприятие в каждую историческую эпоху',
    icon: '🏛️',
    type: 'economic',
    check: 'period',
    target: 8,
    rewardXp: 100,
  },
  level_5: {
    name: 'Опытный управленец',
    description: 'Достигните 5 уровня',
    icon: '⭐',
    type: 'learning',
    check: 'level',
    target: 5,
    rewardXp: 50,
  },
  level_10: {
    name: 'Магнат',
    description: 'Достигните 10 уровня',
    icon: '👑',
    type: 'learning',
    check: 'level',
    target: 10,
    rewardXp: 200,
  },
  xp_1000: {
    name: 'Тысяча опыта',
    description: 'Накопите 1000 опыта',
    icon: '💎',
    type: 'learning',
    check: 'experience',
    target: 1000,
    rewardXp: 100,
  },
  capitalist: {
    name: 'Капиталист',
    description: 'Перейдите в эпоху капитализма',
    icon: '💰',
    type: 'political',
    check: 'period',
    target: 2,
    rewardXp: 50,
  },
  industrialist: {
    name: 'Промышленник',
    description: 'Перейдите в эпоху промышленной революции',
    icon: '⚙️',
    type: 'economic',
    check: 'period',
    target: 3,
    rewardXp: 100,
  },
  monopolist: {
    name: 'Монополист',
    description: 'Достигните эпохи монополий',
    icon: '🔗',
    type: 'political',
    check: 'period',
    target: 4,
    rewardXp: 150,
  },
  profit_100k: {
    name: 'Первая прибыль',
    description: 'Получите 100 000 прибыли от одного предприятия за ход',
    icon: '📈',
    type: 'economic',
    check: 'profit',
    target: 100000,
    rewardXp: 50,
  },
  events_10: {
    name: 'Кризис-менеджер',
    description: 'Переживите 10 событий',
    icon: '🛡️',
    type: 'social',
    check: 'events',
    target: 10,
    rewardXp: 80,
  },
};
