import React, { useState } from 'react';
import { Enterprise } from '../../../../shared/types';
import { getEnterpriseTypeLabel } from '../../utils/format';

interface EnterpriseDetailPanelProps {
  enterprise: Enterprise;
  onSubmit: (updates: Partial<Enterprise>) => Promise<void> | void;
  onDecision: (decision: { type: string; value: number }) => Promise<void> | void;
  onClose: () => void;
}

export const EnterpriseDetailPanel: React.FC<EnterpriseDetailPanelProps> = ({
  enterprise,
  onSubmit,
  onDecision,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    wageRate: enterprise.wageRate,
    workers: enterprise.workers,
  });
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  const runDecision = async (decision: { type: string; value: number }) => {
    setActing(true);
    try {
      await onDecision(decision);
    } finally {
      setActing(false);
    }
  };

  const profitMargin = enterprise.revenue > 0 ? (enterprise.profit / enterprise.revenue) * 100 : 0;

  return (
    <div className="card border-red-900/30">
      <div className="card-header flex justify-between items-start gap-4">
        <div>
          <h2 className="card-title">{enterprise.name}</h2>
          <p className="text-sm text-slate-400">
            {getEnterpriseTypeLabel(enterprise.type)} • 📍 {enterprise.location}
          </p>
        </div>
        <button type="button" className="btn btn-secondary text-sm shrink-0" onClick={onClose}>
          Закрыть
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pb-4">
        <div className="text-center p-3 bg-slate-950/30 rounded-lg border border-slate-800/40">
          <div className={`text-lg font-bold ${enterprise.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${enterprise.profit.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Прибыль ({profitMargin.toFixed(1)}%)</div>
        </div>
        <div className="text-center p-3 bg-slate-950/30 rounded-lg border border-slate-800/40">
          <div className="text-lg font-bold text-slate-200">{enterprise.workers}</div>
          <div className="text-xs text-slate-500">Рабочие</div>
        </div>
        <div className="text-center p-3 bg-slate-950/30 rounded-lg border border-slate-800/40">
          <div className="text-lg font-bold text-slate-200">{enterprise.production}</div>
          <div className="text-xs text-slate-500">Производство</div>
        </div>
        <div className="text-center p-3 bg-slate-950/30 rounded-lg border border-slate-800/40">
          <div className="text-lg font-bold text-emerald-400">${enterprise.surplusValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Приб. стоимость</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Ставка заработной платы</label>
            <input
              type="number"
              className="form-input"
              value={formData.wageRate}
              onChange={(e) => setFormData({ ...formData, wageRate: Number(e.target.value) })}
              min="50"
              max="500"
              step="10"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Количество рабочих</label>
            <input
              type="number"
              className="form-input"
              value={formData.workers}
              onChange={(e) => setFormData({ ...formData, workers: Number(e.target.value) })}
              min="1"
              max="1000"
              step="1"
            />
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Экономические решения</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-secondary text-sm"
              disabled={acting}
              onClick={() => runDecision({ type: 'investment', value: 1000 })}
            >
              Инвестировать
            </button>
            <button
              type="button"
              className="btn btn-secondary text-sm"
              disabled={acting}
              onClick={() => runDecision({ type: 'technology_upgrade', value: 0.5 })}
            >
              Модернизация
            </button>
            <button
              type="button"
              className="btn btn-secondary text-sm"
              disabled={acting}
              onClick={() => runDecision({ type: 'production_change', value: enterprise.production * 1.1 })}
            >
              +10% производство
            </button>
            <button
              type="button"
              className="btn btn-secondary text-sm"
              disabled={acting}
              onClick={() => runDecision({ type: 'wage_change', value: enterprise.wageRate * 1.05 })}
            >
              +5% зарплата
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
};
