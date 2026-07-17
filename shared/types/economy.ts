export interface IEconomicModel {
  calculateSurplusValue(enterprise: any): number;
  calculateProfitRate(enterprise: any): number;
  calculateDemand(product: string, price: number): number;
  simulateMarket(): MarketState;
  calculateClassBalance(): ClassBalance;
}

export interface MarketState {
  totalSupply: number;
  totalDemand: number;
  averagePrice: number;
  competition: number;
  growthRate: number;
  crisisRisk: number;
}

export interface ClassBalance {
  bourgeoisie: ClassData;
  proletariat: ClassData;
  petiteBourgeoisie: ClassData;
  lumpenProletariat: ClassData;
}

export interface ClassData {
  population: number;
  wealth: number;
  income: number;
  satisfaction: number;
  consciousness: number;
  organization: number;
}

export interface EconomicIndicators {
  gdp: number;
  unemploymentRate: number;
  inflationRate: number;
  profitRate: number;
  surplusValueRate: number;
  concentrationIndex: number;
  crisisCycle: CrisisCycle;
}

export interface CrisisCycle {
  phase: 'expansion' | 'boom' | 'crisis' | 'depression' | 'recovery';
  duration: number;
  severity: number;
  triggers: string[];
}

export interface MarketDemand {
  productId: string;
  quantity: number;
  priceElasticity: number;
  incomeElasticity: number;
  marketSaturation: number;
}

export interface Resource {
  id: string;
  name: string;
  type: 'raw' | 'manufactured' | 'luxury' | 'necessity';
  basePrice: number;
  availability: number;
  locations: string[];
}

export interface TradeRelation {
  from: string;
  to: string;
  resource: string;
  quantity: number;
  price: number;
  transportCost: number;
}
