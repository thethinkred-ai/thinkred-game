import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Enterprise, EnterpriseType } from '../../../shared/types';

export const EnterpriseManager: React.FC = () => {
  const { gameState, loading, error, createEnterprise, updateEnterprise } = useGame();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Предприятия</h1>
          <p className="text-gray-600">Управление вашей экономической империей</p>
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
        />
      )}

      {/* Форма редактирования предприятия */}
      {editingEnterprise && (
        <EditEnterpriseForm
          enterprise={editingEnterprise}
          onSubmit={(updates) => handleUpdateEnterprise(editingEnterprise.id, updates)}
          onCancel={() => setEditingEnterprise(null)}
        />
      )}

      {/* Список предприятий */}
      {gameState.enterprises.length === 0 ? (
        <div className="card text-center">
          <div className="py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-3xl">🏭</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет предприятий</h3>
            <p className="text-gray-600 mb-4">
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
}

const CreateEnterpriseForm: React.FC<CreateEnterpriseFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'manufactory' as EnterpriseType,
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
            <option value="manufactory">Мануфактура</option>
            <option value="factory">Фабрика</option>
            <option value="shop">Магазин</option>
            <option value="farm">Ферма</option>
            <option value="mine">Шахта</option>
            <option value="research_center">Исследовательский центр</option>
          </select>
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

interface EditEnterpriseFormProps {
  enterprise: Enterprise;
  onSubmit: (updates: Partial<Enterprise>) => void;
  onCancel: () => void;
}

const EditEnterpriseForm: React.FC<EditEnterpriseFormProps> = ({ enterprise, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    wageRate: enterprise.wageRate,
    workers: enterprise.workers,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Редактирование предприятия: {enterprise.name}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <p className="text-xs text-gray-500 mt-1">
            Текущая: ${enterprise.wageRate}
          </p>
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
          <p className="text-xs text-gray-500 mt-1">
            Текущее: {enterprise.workers}
          </p>
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="btn btn-primary">
            Сохранить
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
}

const EnterpriseCard: React.FC<EnterpriseCardProps> = ({ enterprise, onEdit }) => {
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
      manufactory: 'bg-blue-100 text-blue-800',
      factory: 'bg-green-100 text-green-800',
      shop: 'bg-yellow-100 text-yellow-800',
      farm: 'bg-orange-100 text-orange-800',
      mine: 'bg-gray-100 text-gray-800',
      research_center: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
            <span className="text-sm text-gray-500">
              Уровень {enterprise.level}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            📍 {enterprise.location} • Основан в {enterprise.established}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${enterprise.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${enterprise.profit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">прибыль</p>
          <p className="text-xs text-gray-500 mt-1">
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

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
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
        </div>
      </div>
    </div>
  );
};
