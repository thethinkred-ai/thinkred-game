export interface TrendInfo {
  percent: number | null;
  label: string;
  positive: boolean | null;
}

export function computePercentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return current > 0 ? 100 : -100;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function formatTrend(percent: number | null, suffix = 'с последнего решения'): TrendInfo {
  if (percent === null) {
    return { percent: null, label: 'Недостаточно данных', positive: null };
  }
  const sign = percent >= 0 ? '+' : '';
  return {
    percent,
    label: `${sign}${percent.toFixed(1)}% ${suffix}`,
    positive: percent > 0 ? true : percent < 0 ? false : null,
  };
}

export interface EconomicSnapshot {
  indicators?: unknown;
  summary?: {
    totalProfit: number;
    totalWorkers: number;
    avgSurplusValue: number;
    enterpriseCount: number;
  };
}

export function parseSnapshot(raw: unknown): EconomicSnapshot {
  if (!raw || typeof raw !== 'object') {
    if (typeof raw === 'object' && raw !== null && 'gdp' in (raw as object)) {
      return { indicators: raw };
    }
    return {};
  }
  const obj = raw as EconomicSnapshot;
  if (obj.summary || obj.indicators) return obj;
  if ('gdp' in obj) return { indicators: obj };
  return obj;
}
