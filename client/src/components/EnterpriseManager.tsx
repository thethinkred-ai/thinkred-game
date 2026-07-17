import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Enterprise, EnterpriseType } from '../../../shared/types';
import { LessonGateBadge } from './stepik/LessonGateBadge';
import { EnterpriseDetailPanel } from './enterprises/EnterpriseDetailPanel';

export const EnterpriseManager: React.FC = () => {
  const { gameState, loading, error, createEnterprise, deleteEnterprise, updateEnterprise, makeDecision } = useGame();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Ошибка загрузки данных: {error}</p>
      </div>
    );
  }

  const handleCreateEnterprise = async (data: { name: string; type: string; location: string }) => {
    try {
      await createEnterprise(data);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create enterprise:', error);
    }
  };

  const handleUpdateEnterprise = async (id: string, updates: Partial<Enterprise>) => {
    try {
      await updateEnterprise(id, updates);
      setEditingEnterprise(null);
    } catch (error) {
      console.error('Failed to update enterprise:', error);
    }
  };

  const handleDeleteEnterprise = async (id: string, name: string) => {
    if (window.confirm(`Удалить предприятие «${name}»? Это действие нельзя отменить.`)) {
      try {
        await deleteEnterprise(id);
      } catch (error) {
        console.error('Failed to delete enterprise:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Предприятия</h1>
          <p className="text-slate-400">Управление вашей экономической империей</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          Создать предприятие
        </button>
      </div>

      {/* Форма создания предприятия */}
      {showCreateForm && (
        <CreateEnterpriseForm
          onSubmit={handleCreateEnterprise}
          onCancel={() => setShowCreateForm(false)}
          availableTypes={gameState.availableEnterpriseTypes}
          completedLessons={gameState.completedLessons}
        />
      )}

      {/* Форма редактирования предприятия */}
      {editingEnterprise && (
        <EnterpriseDetailPanel
          key={editingEnterprise.id}
          enterprise={editingEnterprise}
          onSubmit={(updates) => handleUpdateEnterprise(editingEnterprise.id, updates)}
          onDecision={(decision) => makeDecision(editingEnterprise.id, decision)}
          onClose={() => setEditingEnterprise(null)}
        />
      )}

      {/* Список предприятий */}
      {gameState.enterprises.length === 0 ? (
          <div className="card text-center">
          <div className="py-12">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-slate-500 text-3xl">🏭</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Нет предприятий</h3>
            <p className="text-slate-400 mb-4">
              Создайте ваше первое предприятие, чтобы начать строить экономическую империю
            </p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              Создать предприятие
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gameState.enterprises.map((enterprise) => (
            <EnterpriseCard
              key={enterprise.id}
              enterprise={enterprise}
              onEdit={() => setEditingEnterprise(enterprise)}
              onDelete={() => handleDeleteEnterprise(enterprise.id, enterprise.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CreateEnterpriseFormProps {
  onSubmit: (data: { name: string; type: string; location: string }) => void;
  onCancel: () => void;
  availableTypes: Array<{ type: string; unlocked: boolean; requiredLessons: string[] }>;
  completedLessons: string[];
}

const TYPE_LABELS: Record<string, string> = {
  manufactory: 'Мануфактура',
  factory: 'Фабрика',
  shop: 'Магазин',
  farm: 'Ферма',
  mine: 'Шахта',
  research_center: 'Исследовательский центр',
};

const CreateEnterpriseForm: React.FC<CreateEnterpriseFormProps> = ({
  onSubmit,
  onCancel,
  availableTypes,
  completedLessons,
}) => {
  const unlockedTypes = availableTypes.filter((t) => t.unlocked);
  const defaultType = (unlockedTypes[0]?.type ?? 'manufactory') as EnterpriseType;

  const [formData, setFormData] = useState({
    name: '',
    type: defaultType,
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Создание предприятия</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Название предприятия</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: Текстильная мануфактура №1"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Тип предприятия</label>
          <select
            className="form-select"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as EnterpriseType })}
            required
          >
            {(availableTypes.length > 0 ? availableTypes : Object.keys(TYPE_LABELS).map((type) => ({
              type,
              unlocked: true,
              requiredLessons: [],
            }))).map((t) => (
              <option key={t.type} value={t.type} disabled={!t.unlocked}>
                {TYPE_LABELS[t.type] || t.type}{!t.unlocked ? ' (заблокировано)' : ''}
              </option>
            ))}
          </select>
          {availableTypes
            .filter((t) => t.type === formData.type && !t.unlocked)
            .map((t) => (
              <LessonGateBadge
                key={t.type}
                requiredLessons={t.requiredLessons}
                completedLessons={completedLessons}
              />
            ))}
        </div>

        <div className="form-group">
          <label className="form-label">Расположение</label>
          <input
            type="text"
            className="form-input"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Например: Манчестер"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="btn btn-primary">
            Создать
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

interface EnterpriseCardProps {
  enterprise: Enterprise;
  onEdit: () => void;
  onDelete: () => void;
}

const EnterpriseCard: React.FC<EnterpriseCardProps> = ({ enterprise, onEdit, onDelete }) => {
  const getEnterpriseTypeLabel = (type: EnterpriseType) => {
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

  const getEnterpriseTypeColor = (type: EnterpriseType) => {
    const colors = {
      manufactory: 'bg-blue-500/10 text-blue-400',
      factory: 'bg-green-500/10 text-green-400',
      shop: 'bg-yellow-500/10 text-yellow-400',
      farm: 'bg-orange-500/10 text-orange-400',
      mine: 'bg-gray-500/10 text-gray-400',
      research_center: 'bg-purple-500/10 text-purple-400',
    };
    return colors[type as keyof typeof colors] || 'bg-slate-700/40 text-slate-400';
  };

  const profitMargin = enterprise.revenue > 0 ? (enterprise.profit / enterprise.revenue) * 100 : 0;

  return (
    <div className="enterprise-card">
      <div className="enterprise-header">
        <div>
          <h3 className="enterprise-title">{enterprise.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`enterprise-type ${getEnterpriseTypeColor(enterprise.type)}`}>
              {getEnterpriseTypeLabel(enterprise.type)}
            </span>
            <span className="text-sm text-slate-500">
              Уровень {enterprise.level}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            📍 {enterprise.location} • Основан в {enterprise.established}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${enterprise.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${enterprise.profit.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">прибыль</p>
          <p className="text-xs text-slate-500 mt-1">
            Маржа: {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>
      
      <div className="enterprise-metrics">
        <div className="enterprise-metric">
          <div className="enterprise-metric-value">{enterprise.workers}</div>
          <div className="enterprise-metric-label">Рабочие</div>
        </div>
        <div className="enterprise-metric">
          <div className="enterprise-metric-value">{enterprise.production}</div>
          <div className="enterprise-metric-label">Производство</div>
        </div>
        <div className="enterprise-metric">
          <div className="enterprise-metric-value">${enterprise.wageRate}</div>
          <div className="enterprise-metric-label">Зарплата</div>
        </div>
        <div className="enterprise-metric">
          <div className="enterprise-metric-value">${enterprise.surplusValue}</div>
          <div className="enterprise-metric-label">Приб. стоимость</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-500">
            <div>Технология: {enterprise.technology.toFixed(1)}</div>
            <div>Доход: ${enterprise.revenue.toLocaleString()}</div>
            <div>Издержки: ${enterprise.costs.labor + enterprise.costs.materials + enterprise.costs.overhead + enterprise.costs.depreciation}</div>
          </div>
          <button 
            onClick={onEdit}
            className="btn btn-secondary text-sm"
          >
            Управлять
          </button>
          <button 
            onClick={onDelete}
            className="text-sm px-3 py-1.5 rounded-lg border border-red-800/40 text-red-400 hover:bg-red-950/20 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};
