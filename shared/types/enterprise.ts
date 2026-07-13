export interface Enterprise {
  id: string;
  name: string;
  type: EnterpriseType;
  level: number;
  workers: number;
  wageRate: number;
  production: number;
  costs: EnterpriseCosts;
  revenue: number;
  profit: number;
  surplusValue: number;
  technology: number;
  location: string;
  owner: string;
  established: number;
}

export interface EnterpriseCosts {
  labor: number;
  materials: number;
  overhead: number;
  depreciation: number;
}

export type EnterpriseType = 
  | 'manufactory' 
  | 'factory' 
  | 'shop' 
  | 'farm' 
  | 'mine' 
  | 'research_center';

export interface EnterpriseConfig {
  type: EnterpriseType;
  baseCost: number;
  baseProduction: number;
  workerCapacity: number;
  technologyMultiplier: number;
  unlockConditions: string[];
}

export interface EnterpriseDecision {
  enterpriseId: string;
  type: 'wage_change' | 'investment' | 'production_change' | 'technology_upgrade';
  value: number;
  timestamp: number;
  expectedImpact: EconomicImpact;
}

export interface EconomicImpact {
  profitChange: number;
  surplusValueChange: number;
  workerSatisfactionChange: number;
  marketShareChange: number;
  technologyChange: number;
}
