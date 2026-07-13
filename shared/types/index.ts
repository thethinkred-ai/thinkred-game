// Export all types from individual files
export * from './enterprise';
export * from './economy';
export * from './events';
export * from './stepik';

// Re-export commonly used types
export type {
  Enterprise,
  EnterpriseType,
  EnterpriseDecision,
  EconomicImpact
} from './enterprise';

export type {
  IEconomicModel,
  MarketState,
  ClassBalance,
  EconomicIndicators,
  CrisisCycle
} from './economy';

export type {
  GameEvent,
  EventChoice,
  EventConsequence,
  EventEconomicImpact,
  HistoricalPeriod,
  EventType
} from './events';

export type {
  StepikUser,
  StepikCourse,
  StepikLesson,
  StepikStep,
  GameProgress,
  Achievement
} from './stepik';
