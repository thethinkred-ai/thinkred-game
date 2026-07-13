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
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  PAGE_SIZE: 20
} as const;

export const STEPIK_CONFIG = {
  CLIENT_ID: typeof process !== 'undefined' ? process.env.STEPIK_CLIENT_ID || '' : '',
  CLIENT_SECRET: typeof process !== 'undefined' ? process.env.STEPIK_CLIENT_SECRET || '' : '',
  REDIRECT_URI: typeof process !== 'undefined' ? process.env.STEPIK_REDIRECT_URI || 'http://localhost:3000/auth/callback' : 'http://localhost:3000/auth/callback',
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
  }
} as const;
