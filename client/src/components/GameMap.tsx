import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { PhaserGame } from '../game/PhaserGame';
import { EnterpriseDetailPanel } from './enterprises/EnterpriseDetailPanel';
import { getMapLocationOptions } from '../game/utils/locationCoords';
import { getEnterpriseTypeLabel } from '../utils/format';

export const GameMap: React.FC = () => {
  const { gameState, loading, error, createEnterprise, updateEnterprise, makeDecision } = useGame();
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEnterprise, setNewEnterprise] = useState({
    name: '',
    type: 'manufactory',
    location: getMapLocationOptions()[0]?.label ?? 'Манчестер',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
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

  const selectedEnterprise = selectedEnterpriseId
    ? gameState.enterprises.find((e) => e.id === selectedEnterpriseId) ?? null
    : null;

  const lockedTypes = gameState.availableEnterpriseTypes
    .filter((t) => !t.unlocked)
    .map((t) => t.type);

  const locationOptions = getMapLocationOptions();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEnterprise(newEnterprise);
      setShowCreateForm(false);
      setNewEnterprise({
        name: '',
        type: 'manufactory',
        location: locationOptions[0]?.label ?? 'Манчестер',
      });
    } catch {
      // error shown in context
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Карта предприятий</h1>
          <p className="text-slate-400">
            2D-карта с pan/zoom — предприятия размещаются по локации
          </p>
        </div>
        <button className="btn btn-primary text-sm" onClick={() => setShowCreateForm(true)}>
          Построить на карте
        </button>
      </div>

      <PhaserGame
        sceneData={{
          period: gameState.currentPeriod,
          enterprises: gameState.enterprises,
          lockedTypes,
          onEnterpriseClick: (id) => {
            setSelectedEnterpriseId(id);
            setShowCreateForm(false);
          },
          onBuildClick: () => {
            setShowCreateForm(true);
            setSelectedEnterpriseId(null);
          },
        }}
      />

      {selectedEnterprise && (
        <EnterpriseDetailPanel
          key={selectedEnterprise.id + selectedEnterprise.profit}
          enterprise={selectedEnterprise}
          onSubmit={async (updates) => {
            await updateEnterprise(selectedEnterprise.id, updates);
          }}
          onDecision={async (decision) => {
            await makeDecision(selectedEnterprise.id, decision);
          }}
          onClose={() => setSelectedEnterpriseId(null)}
        />
      )}

      {showCreateForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Новое предприятие на карте</h2>
          </div>
          <form onSubmit={handleCreate} className="space-y-4 px-4 pb-4">
            <div className="form-group">
              <label className="form-label">Название</label>
              <input
                className="form-input"
                placeholder="Например: Текстильная мануфактура №1"
                value={newEnterprise.name}
                onChange={(e) => setNewEnterprise({ ...newEnterprise, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Тип</label>
              <select
                className="form-select"
                value={newEnterprise.type}
                onChange={(e) => setNewEnterprise({ ...newEnterprise, type: e.target.value })}
              >
                {gameState.availableEnterpriseTypes
                  .filter((t) => t.unlocked)
                  .map((t) => (
                    <option key={t.type} value={t.type}>
                      {getEnterpriseTypeLabel(t.type)}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Локация на карте</label>
              <input
                className="form-input"
                list="map-locations"
                value={newEnterprise.location}
                onChange={(e) => setNewEnterprise({ ...newEnterprise, location: e.target.value })}
                placeholder="Манчестер, Москва, Нью-Йорк..."
                required
              />
              <datalist id="map-locations">
                {locationOptions.map((loc) => (
                  <option key={loc.label} value={loc.label} />
                ))}
              </datalist>
              <p className="text-xs text-slate-500 mt-1">
                Предприятие появится в точке, соответствующей локации
              </p>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Создать</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
