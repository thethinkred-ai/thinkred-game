import { EconomicModelEngine } from '../services/economicModel';
import { Enterprise } from '../../../shared/types';

describe('EconomicModelEngine', () => {
  const engine = new EconomicModelEngine();

  const sampleEnterprise: Enterprise = {
    id: '1',
    name: 'Test Factory',
    type: 'factory',
    level: 1,
    workers: 50,
    wageRate: 100,
    production: 500,
    costs: { labor: 5000, materials: 2000, overhead: 1000, depreciation: 500 },
    revenue: 25000,
    profit: 16500,
    surplusValue: 20000,
    technology: 1.5,
    location: 'Test',
    owner: '1',
    established: 2024,
    period: 'early_capitalism',
  };

  it('calculates economic indicators for enterprises', () => {
    const indicators = engine.calculateIndicators([sampleEnterprise]);
    expect(indicators.gdp).toBeGreaterThan(0);
    expect(indicators.profitRate).toBeGreaterThanOrEqual(0);
  });

  it('simulates market state', () => {
    const market = engine.simulateMarket([sampleEnterprise]);
    expect(market.totalSupply).toBeGreaterThan(0);
    expect(market.crisisRisk).toBeGreaterThanOrEqual(0);
  });

  it('calculates decision impact for wage change', () => {
    const impact = engine.calculateDecisionImpact(sampleEnterprise, 'wage_change', 120);
    expect(impact).toBeDefined();
  });
});
