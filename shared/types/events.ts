export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  period: HistoricalPeriod;
  year: number;
  choices: EventChoice[];
  consequences: EventConsequence[];
  prerequisites: string[];
  weight: number;
}

export interface EventChoice {
  id: string;
  text: string;
  description: string;
  requiredKnowledge: string[]; // Stepik lesson IDs
  economicImpact: EventEconomicImpact;
  socialImpact: SocialImpact;
  politicalImpact: PoliticalImpact;
}

export interface EventConsequence {
  choiceId: string;
  immediate: ConsequenceEffect[];
  longTerm: ConsequenceEffect[];
  probability: number;
}

export interface ConsequenceEffect {
  type: 'economic' | 'social' | 'political' | 'technological';
  target: string;
  value: number;
  duration: number;
}

export interface EventEconomicImpact {
  gdpChange: number;
  unemploymentChange: number;
  profitRateChange: number;
  concentrationChange: number;
  crisisRiskChange: number;
}

export interface SocialImpact {
  classConsciousness: Record<string, number>;
  workerSatisfaction: number;
  socialStability: number;
  educationLevel: number;
}

export interface PoliticalImpact {
  governmentSupport: number;
  revolutionaryPotential: number;
  reformMovement: number;
  repressionLevel: number;
}

export type EventType = 
  | 'economic_crisis'
  | 'technological_breakthrough'
  | 'social_movement'
  | 'political_change'
  | 'war'
  | 'market_change'
  | 'labor_conflict'
  | 'peasant_revolt'
  | 'land_enclosure'
  | 'crop_failure'
  | 'factory_conditions'
  | 'luddite_rebellion'
  | 'urbanization'
  | 'trust_busting'
  | 'stock_crash'
  | 'trade_wars'
  | 'automation_shock'
  | 'green_movement'
  | 'financial_crisis'
  | 'nationalization'
  | 'worker_cooperative';

export type HistoricalPeriod = 
  | 'feudalism'
  | 'early_capitalism'
  | 'industrial_revolution'
  | 'monopoly_capitalism'
  | 'imperialism'
  | 'modern_capitalism'
  | 'socialism_transition'
  | 'communism';

export interface EventHistory {
  eventId: string;
  choiceId: string;
  timestamp: number;
  actualConsequences: ConsequenceEffect[];
}

export interface EventChain {
  id: string;
  name: string;
  events: string[];
  triggerConditions: string[];
  completionRewards: string[];
}
