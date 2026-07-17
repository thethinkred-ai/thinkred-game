import { Enterprise, EconomicIndicators, MarketState, CrisisCycle } from '../../../shared/types';
import { GAME_CONSTANTS } from '../../../shared/constants/game';

export class EconomicModelEngine {
  /**
   * Surplus value = revenue - necessary labor costs (wages).
   * Marxist concept: the value workers produce beyond what they are paid.
   */
  calculateSurplusValue(enterprise: Enterprise): number {
    const laborCost = enterprise.wageRate * enterprise.workers;
    return Math.max(0, enterprise.revenue - laborCost);
  }

  /**
   * Profit rate = profit / total capital invested.
   * Normalized to 0-1 range (percentage).
   */
  calculateProfitRate(enterprise: Enterprise): number {
    const totalCapital =
      enterprise.costs.materials +
      enterprise.costs.overhead +
      enterprise.costs.depreciation +
      enterprise.costs.labor;
    if (totalCapital <= 0) return 0;
    return Math.min(1, Math.max(-1, enterprise.profit / totalCapital));
  }

  /**
   * Demand follows power-law elasticity: higher price → lower demand.
   */
  calculateDemand(_product: string, price: number): number {
    const baseDemand = 1000;
    const elasticity = GAME_CONSTANTS.MARKET_ELASTICITY;
    return Math.max(0, baseDemand * Math.pow(price / 100, -elasticity));
  }

  /**
   * Dynamic market simulation based on actual enterprise data.
   * Aggregates all user enterprises to compute market state.
   */
  simulateMarket(enterprises?: Enterprise[]): MarketState {
    if (!enterprises || enterprises.length === 0) {
      return {
        totalSupply: 0,
        totalDemand: 1000,
        averagePrice: 100,
        competition: 0.5,
        growthRate: 0.02,
        crisisRisk: 0.1,
      };
    }

    const totalProduction = enterprises.reduce((s, e) => s + e.production, 0);
    const totalRevenue = enterprises.reduce((s, e) => s + e.revenue, 0);
    const avgPrice = enterprises.length > 0
      ? totalRevenue / Math.max(1, totalProduction)
      : 100;

    // Demand scales with production capacity and price
    const baseDemand = enterprises.length * 500;
    const priceFactor = Math.pow(100 / Math.max(1, avgPrice), 0.5);
    const totalDemand = baseDemand * priceFactor;

    // Supply/demand ratio drives competition
    const supplyDemandRatio = totalProduction / Math.max(1, totalDemand);
    const competition = Math.min(1, Math.max(0, 1 - Math.abs(supplyDemandRatio - 1)));

    // Growth rate: positive if demand > supply, negative if overproduction
    const growthRate = Math.max(-0.1, Math.min(0.15, (totalDemand - totalProduction) / Math.max(1, totalDemand) * 0.3));

    // Crisis risk increases with overproduction and concentration
    const overproductionRisk = Math.max(0, (totalProduction - totalDemand) / Math.max(1, totalDemand));
    const profitPressure = enterprises.some(e => e.profit < 0) ? 0.2 : 0;
    const crisisRisk = Math.min(1, 0.1 + overproductionRisk * 0.5 + profitPressure);

    return {
      totalSupply: Math.round(totalProduction),
      totalDemand: Math.round(totalDemand),
      averagePrice: Math.round(avgPrice * 100) / 100,
      competition: Math.round(competition * 100) / 100,
      growthRate: Math.round(growthRate * 1000) / 1000,
      crisisRisk: Math.round(crisisRisk * 100) / 100,
    };
  }

  /**
   * Get market price for a given enterprise type.
   */
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

  /**
   * Calculate comprehensive economic indicators from user enterprises.
   */
  calculateIndicators(enterprises: Enterprise[]): EconomicIndicators {
    if (enterprises.length === 0) {
      return {
        gdp: 0,
        unemploymentRate: 0.1,
        inflationRate: 0.02,
        profitRate: 0,
        surplusValueRate: 0.3,
        concentrationIndex: 0.3,
        crisisCycle: {
          phase: 'expansion',
          duration: 12,
          severity: 0.3,
          triggers: [],
        },
      };
    }

    const totalWorkers = enterprises.reduce((s, e) => s + e.workers, 0);
    const totalRevenue = enterprises.reduce((s, e) => s + e.revenue, 0);
    const totalSurplus = enterprises.reduce((s, e) => s + e.surplusValue, 0);
    const totalLabor = enterprises.reduce((s, e) => s + e.costs.labor, 0);

    // Average profit rate across enterprises (clamped to realistic range)
    const profitRates = enterprises.map(e => this.calculateProfitRate(e));
    const avgProfitRate = profitRates.length > 0
      ? profitRates.reduce((s, r) => s + r, 0) / profitRates.length
      : 0;

    // Surplus value rate = surplus / variable capital (labor costs)
    // This is the Marxist rate of exploitation
    const surplusValueRate = totalLabor > 0
      ? Math.min(2, totalSurplus / totalLabor)
      : 0.3;

    // GDP approximation from enterprise output
    const gdp = totalRevenue * 10;

    // Unemployment inversely proportional to workers employed
    const laborForce = 10000; // baseline labor force
    const unemploymentRate = Math.max(0, Math.min(1, (laborForce - totalWorkers) / laborForce));

    // Inflation: driven by demand-pull and cost-push
    const marketState = this.simulateMarket(enterprises);
    const demandPressure = marketState.totalDemand > marketState.totalSupply ? 0.02 : -0.01;
    const inflationRate = 0.02 + demandPressure;

    // Concentration: increases with fewer, larger enterprises
    const maxProduction = Math.max(...enterprises.map(e => e.revenue));
    const concentrationIndex = enterprises.length > 1
      ? Math.min(1, maxProduction / Math.max(1, totalRevenue) * enterprises.length / 2)
      : enterprises.length === 1 ? 0.8 : 0.3;

    // Crisis cycle phase determination
    const crisisCycle = this.determineCrisisPhase(marketState, avgProfitRate, concentrationIndex);

    return {
      gdp: Math.round(gdp),
      unemploymentRate: Math.round(unemploymentRate * 1000) / 1000,
      inflationRate: Math.round(inflationRate * 1000) / 1000,
      profitRate: Math.round(avgProfitRate * 1000) / 1000,
      surplusValueRate: Math.round(surplusValueRate * 1000) / 1000,
      concentrationIndex: Math.round(concentrationIndex * 100) / 100,
      crisisCycle,
    };
  }

  /**
   * Determine the current phase of the economic crisis cycle.
   * Based on Marxist crisis theory: expansion → boom → crisis → depression → recovery.
   */
  private determineCrisisPhase(
    market: MarketState,
    profitRate: number,
    concentration: number
  ): CrisisCycle {
    const triggers: string[] = [];

    if (market.crisisRisk > GAME_CONSTANTS.CRISIS_THRESHOLD) {
      triggers.push('high_crisis_risk');
    }
    if (concentration > GAME_CONSTANTS.CONCENTRATION_THRESHOLD) {
      triggers.push('capital_concentration');
    }
    if (profitRate < 0.05) {
      triggers.push('falling_profit_rate');
    }
    if (market.totalSupply > market.totalDemand * 1.2) {
      triggers.push('overproduction');
    }

    // Phase determination
    if (market.crisisRisk > 0.7 && profitRate < 0.05) {
      return { phase: 'crisis', duration: 6, severity: market.crisisRisk, triggers };
    }
    if (market.crisisRisk > 0.5) {
      return { phase: 'depression', duration: 8, severity: market.crisisRisk * 0.7, triggers };
    }
    if (profitRate > 0.2 && market.growthRate > 0.05) {
      return { phase: 'boom', duration: 10, severity: 0.2, triggers };
    }
    if (market.growthRate > 0) {
      return { phase: 'expansion', duration: 12, severity: 0.3, triggers };
    }
    return { phase: 'recovery', duration: 8, severity: 0.4, triggers };
  }

  /**
   * Calculate the impact of an enterprise decision.
   */
  calculateDecisionImpact(
    enterprise: Enterprise,
    decisionType: string,
    value: number
  ): {
    profitChange: number;
    surplusValueChange: number;
    workerSatisfactionChange: number;
    marketShareChange: number;
    technologyChange: number;
  } {
    const marketPrice = this.getMarketPrice(enterprise.type);

    switch (decisionType) {
      case 'wage_change': {
        const oldWage = enterprise.wageRate;
        const wageDelta = value - oldWage;
        // Higher wages → lower profit, higher worker satisfaction
        const profitChange = -wageDelta * enterprise.workers * 0.01;
        const satisfactionChange = wageDelta > 0 ? wageDelta / oldWage * 10 : wageDelta / oldWage * 15;
        return {
          profitChange: Math.round(profitChange * 100) / 100,
          surplusValueChange: Math.round(-wageDelta * enterprise.workers * 0.01 * 100) / 100,
          workerSatisfactionChange: Math.round(satisfactionChange * 100) / 100,
          marketShareChange: 0,
          technologyChange: 0,
        };
      }
      case 'investment': {
        // Investment increases technology and production capacity
        const techBoost = value * 0.0001;
        const prodBoost = value * 0.01;
        const revenueGain = prodBoost * marketPrice;
        return {
          profitChange: Math.round((revenueGain - value * 0.1) * 100) / 100,
          surplusValueChange: Math.round(revenueGain * 0.3 * 100) / 100,
          workerSatisfactionChange: Math.round(techBoost * 5 * 100) / 100,
          marketShareChange: Math.round(prodBoost * 0.001 * 100) / 100,
          technologyChange: Math.round(techBoost * 100) / 100,
        };
      }
      case 'production_change': {
        const prodDelta = value - enterprise.production;
        const revenueChange = prodDelta * marketPrice;
        const costChange = Math.abs(prodDelta) * 0.5;
        return {
          profitChange: Math.round((revenueChange - costChange) * 100) / 100,
          surplusValueChange: Math.round(revenueChange * 0.3 * 100) / 100,
          workerSatisfactionChange: prodDelta > 0 ? -2 : 1,
          marketShareChange: Math.round(prodDelta * 0.001 * 100) / 100,
          technologyChange: 0,
        };
      }
      case 'technology_upgrade': {
        const techDelta = value;
        const efficiencyGain = techDelta * enterprise.production * 0.05;
        return {
          profitChange: Math.round(efficiencyGain * marketPrice * 100) / 100,
          surplusValueChange: Math.round(efficiencyGain * marketPrice * 0.4 * 100) / 100,
          workerSatisfactionChange: Math.round(techDelta * 2 * 100) / 100,
          marketShareChange: Math.round(efficiencyGain * 0.002 * 100) / 100,
          technologyChange: Math.round(techDelta * 100) / 100,
        };
      }
      default:
        return { profitChange: 0, surplusValueChange: 0, workerSatisfactionChange: 0, marketShareChange: 0, technologyChange: 0 };
    }
  }
}
