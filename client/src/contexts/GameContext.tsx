import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Enterprise,
  GameEvent,
  EconomicIndicators,
  MarketState,
  HistoricalPeriod,
} from '../../../shared/types';
import { apiService } from '../services/api';
import { wsService } from '../services/websocket';

export interface AvailableEnterpriseType {
  type: string;
  baseCost: number;
  baseProduction: number;
  workerCapacity: number;
  technologyMultiplier: number;
  unlockConditions: readonly string[];
  unlocked: boolean;
  requiredLessons: string[];
}

export interface PeriodAdvancementCondition {
  label: string;
  met: boolean;
  current: string;
  required: string;
}

export interface PeriodStatus {
  currentPeriod: HistoricalPeriod;
  nextPeriod: HistoricalPeriod | null;
  canAdvance: boolean;
  conditions: PeriodAdvancementCondition[];
  overallProgress: number;
}

interface GameContextType {
  gameState: {
    currentPeriod: HistoricalPeriod;
    level: number;
    experience: number;
    enterprises: Enterprise[];
    currentEvents: GameEvent[];
    economicIndicators: EconomicIndicators | null;
    marketState: MarketState | null;
    unlockedFeatures: string[];
    completedLessons: string[];
    availableEnterpriseTypes: AvailableEnterpriseType[];
    achievements: string[];
  };
  periodStatus: PeriodStatus | null;
  loading: boolean;
  error: string | null;
  refreshGameState: () => Promise<void>;
  createEnterprise: (data: { name: string; type: string; location: string }) => Promise<Enterprise>;
  deleteEnterprise: (id: string) => Promise<void>;
  updateEnterprise: (id: string, updates: Partial<Enterprise>) => Promise<Enterprise>;
  makeDecision: (enterpriseId: string, decision: { type: string; value: number }) => Promise<void>;
  respondToEvent: (eventId: string, choiceId: string) => Promise<void>;
  advancePeriod: () => Promise<{ advanced: boolean; newPeriod: HistoricalPeriod | null; message: string }>;
  syncProgress: () => Promise<void>;
  cooldown: { remainingMs: number; canAct: boolean };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

const defaultGameState = {
  currentPeriod: 'feudalism' as HistoricalPeriod,
  level: 1,
  experience: 0,
  enterprises: [] as Enterprise[],
  currentEvents: [] as GameEvent[],
  economicIndicators: null,
  marketState: null,
  unlockedFeatures: ['basic_enterprises'],
  completedLessons: [] as string[],
  availableEnterpriseTypes: [] as AvailableEnterpriseType[],
  achievements: [] as string[],
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState(defaultGameState);
  const [periodStatus, setPeriodStatus] = useState<PeriodStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<{ remainingMs: number; canAct: boolean }>({ remainingMs: 0, canAct: true });

  const syncProgress = useCallback(async () => {
    try {
      const progress = await apiService.getProgress();
      await apiService.syncProgress(progress);
    } catch {
      // sync is best-effort
    }
  }, []);

  const refreshCooldown = useCallback(async () => {
    try {
      const data = await apiService.getDecisionCooldown();
      setCooldown(data);
    } catch {
      // cooldown is optional
    }
  }, []);

  const refreshPeriodStatus = useCallback(async () => {
    try {
      const status = await apiService.getPeriodStatus();
      setPeriodStatus(status);
    } catch {
      // period status is optional
    }
  }, []);

  const refreshGameState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getGameState();
      setGameState({
        currentPeriod: data.currentPeriod,
        level: data.level,
        experience: data.experience,
        enterprises: data.enterprises,
        currentEvents: data.currentEvents,
        economicIndicators: data.economicIndicators,
        marketState: data.marketState,
        unlockedFeatures: data.unlockedFeatures,
        completedLessons: data.completedLessons ?? [],
        availableEnterpriseTypes: data.availableEnterpriseTypes ?? [],
        achievements: data.achievements ?? [],
      });
      await refreshPeriodStatus();
      await refreshCooldown();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [refreshPeriodStatus, refreshCooldown]);

  useEffect(() => {
    refreshGameState();
    wsService.connect();

    const handleGameUpdate = () => refreshGameState();
    wsService.on('game_update', handleGameUpdate);
    wsService.on('*', (data) => {
      if (data.type === 'event' || data.type === 'crisis') {
        refreshGameState();
      }
    });

    return () => {
      wsService.off('game_update', handleGameUpdate);
      wsService.disconnect();
    };
  }, [refreshGameState]);

  const createEnterprise = async (data: { name: string; type: string; location: string }): Promise<Enterprise> => {
    try {
      const enterprise = await apiService.createEnterprise(data);
      await refreshGameState();
      await syncProgress();
      return enterprise;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteEnterprise = async (id: string): Promise<void> => {
    try {
      await apiService.deleteEnterprise(id);
      setGameState((prev) => ({
        ...prev,
        enterprises: prev.enterprises.filter((e) => e.id !== id),
      }));
      await syncProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateEnterprise = async (id: string, updates: Partial<Enterprise>): Promise<Enterprise> => {
    try {
      const updatedEnterprise = await apiService.updateEnterprise(id, updates);
      setGameState((prev) => ({
        ...prev,
        enterprises: prev.enterprises.map((e) => (e.id === id ? updatedEnterprise : e)),
      }));
      return updatedEnterprise;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const makeDecision = async (enterpriseId: string, decision: { type: string; value: number }): Promise<void> => {
    try {
      await apiService.makeDecision(enterpriseId, decision);
      await refreshGameState();
      await syncProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const respondToEvent = async (eventId: string, choiceId: string): Promise<void> => {
    try {
      await apiService.respondToEvent(eventId, choiceId);
      await refreshGameState();
      await syncProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const advancePeriod = useCallback(async () => {
    try {
      const result = await apiService.advancePeriod();
      if (result.advanced) {
        await refreshGameState();
      } else {
        await refreshPeriodStatus();
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { advanced: false, newPeriod: null, message };
    }
  }, [refreshGameState, refreshPeriodStatus]);

  const value: GameContextType = {
    gameState,
    periodStatus,
    loading,
    error,
    refreshGameState,
    createEnterprise,
    deleteEnterprise,
    updateEnterprise,
    makeDecision,
    respondToEvent,
    advancePeriod,
    syncProgress,
    cooldown,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
