export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} минут назад`;
  if (diffHours < 24) return `${diffHours} часов назад`;
  if (diffDays < 7) return `${diffDays} дней назад`;
  
  return formatDate(target);
};

export const getEnterpriseTypeLabel = (type: string): string => {
  const labels = {
    manufactory: 'Мануфактура',
    factory: 'Фабрика',
    shop: 'Магазин',
    farm: 'Ферма',
    mine: 'Шахта',
    research_center: 'Исслед. центр',
  };
  return labels[type as keyof typeof labels] || type;
};

export const getEnterpriseTypeIcon = (type: string): string => {
  const icons = {
    manufactory: '🏭',
    factory: '🏗️',
    shop: '🏪',
    farm: '🌾',
    mine: '⛏️',
    research_center: '🔬',
  };
  return icons[type as keyof typeof icons] || '🏢';
};

export const getEventTypeLabel = (type: string): string => {
  const labels = {
    economic_crisis: 'Экономический кризис',
    technological_breakthrough: 'Технологический прорыв',
    social_movement: 'Социальное движение',
    political_change: 'Политические изменения',
    war: 'Война',
    market_change: 'Рыночные изменения',
    labor_conflict: 'Рабочий конфликт',
  };
  return labels[type as keyof typeof labels] || type;
};

export const getEventTypeColor = (type: string): string => {
  const colors = {
    economic_crisis: 'bg-red-100 text-red-800',
    technological_breakthrough: 'bg-green-100 text-green-800',
    social_movement: 'bg-blue-100 text-blue-800',
    political_change: 'bg-purple-100 text-purple-800',
    war: 'bg-red-100 text-red-800',
    market_change: 'bg-yellow-100 text-yellow-800',
    labor_conflict: 'bg-orange-100 text-orange-800',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getHistoricalPeriodLabel = (period: string): string => {
  const labels = {
    feudalism: 'Феодализм',
    early_capitalism: 'Ранний капитализм',
    industrial_revolution: 'Промышленная революция',
    monopoly_capitalism: 'Монополистический капитализм',
    modern_capitalism: 'Современный капитализм',
    socialism_transition: 'Переход к социализму',
    communism: 'Коммунизм',
  };
  return labels[period as keyof typeof labels] || period;
};

export const getCrisisPhaseLabel = (phase: string): string => {
  const labels = {
    expansion: 'Экспансия',
    boom: 'Бум',
    crisis: 'Кризис',
    depression: 'Депрессия',
    recovery: 'Восстановление',
  };
  return labels[phase as keyof typeof labels] || phase;
};

export const getCrisisPhaseColor = (phase: string): string => {
  const colors = {
    expansion: 'text-green-600',
    boom: 'text-blue-600',
    crisis: 'text-red-600',
    depression: 'text-gray-600',
    recovery: 'text-yellow-600',
  };
  return colors[phase as keyof typeof colors] || 'text-gray-600';
};

export const getStatusColor = (value: number, thresholds: { good: number; warning: number }): string => {
  if (value >= thresholds.good) return 'text-green-600';
  if (value >= thresholds.warning) return 'text-yellow-600';
  return 'text-red-600';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
