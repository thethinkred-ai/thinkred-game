import { Enterprise, EconomicIndicators, MarketState } from '../../../shared/types';
import { GAME_CONSTANTS } from '../../../shared/constants/game';

export class EconomicModelEngine {
  calculateSurplusValue(enterprise: Enterprise): number {
    const necessaryLaborTime = enterprise.wageRate * enterprise.workers;
    return Math.max(0, enterprise.revenue - necessaryLaborTime);
  }

  calculateProfitRate(enterprise: Enterprise): number {
    const totalCapital = enterprise.costs.materials + enterprise.costs.overhead +
      enterprise.costs.depreciation + enterprise.costs.labor;
    return totalCapital > 0 ? enterprise.profit / totalCapital : 0;
  }

  calculateDemand(_product: string, price: number): number {
    const baseDemand = 1000;
    const elasticity = GAME_CONSTANTS.MARKET_ELASTICITY;
    return Math.max(0, baseDemand * Math.pow(price / 100, -elasticity));
  }

  simulateMarket(): MarketState {
    return {
      totalSupply: 10000,
      totalDemand: 9500,
      averagePrice: 100,
      competition: 0.7,
      growthRate: 0.02,
      crisisRisk: 0.3,
    };
  }

  getMarketPrice(enterpriseType: string): number {
    const basePrices: Record<string, number> = {
      manufactory: 150,
      factory: 120,
      shop: 200,
      farm: 80,
      mine: 100,
      research_center: 300,
    };
    return basePrices[enterpriseType] || 100;
  }

  calculateIndicators(enterprises: Enterprise[]): EconomicIndicators {
    const totalProfit = enterprises.reduce((sum, e) => sum + e.profit, 0);
    const totalWorkers = enterprises.reduce((sum, e) => sum + e.workers, 0);
    const avgProfitRate = enterprises.length > 0
      ? enterprises.reduce((sum, e) => sum + this.calculateProfitRate(e), 0) / enterprises.length
      : 0;

    const totalRevenue = enterprises.reduce((sum, e) => sum + e.revenue, 0);
    const totalSurplus = enterprises.reduce((sum, e) => sum + e.surplusValue, 0);
    const surplusValueRate = totalRevenue > 0 ? totalSurplus / totalRevenue : 0.3;

    return {
      gdp: totalProfit * 10,
      unemploymentRate: Math.max(0, 0.1 - totalWorkers / 10000),
      inflationRate: 0.02,
      profitRate: avgProfitRate,
      surplusValueRate,
      concentrationIndex: enterprises.length > 5 ? 0.6 : 0.3,
      crisisCycle: {
        phase: 'expansion',
        duration: 12,
        severity: 0.3,
        triggers: [],
      },
    };
  }
}
