import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Enterprise,
  GameEvent,
  EconomicIndicators,
  MarketState,
  HistoricalPeriod,
} from '../../../shared/types';
import { apiService } from '../services/api';

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
  };
  loading: boolean;
  error: string | null;
  refreshGameState: () => Promise<void>;
  createEnterprise: (data: { name: string; type: string; location: string }) => Promise<Enterprise>;
  updateEnterprise: (id: string, updates: Partial<Enterprise>) => Promise<Enterprise>;
  makeDecision: (enterpriseId: string, decision: { type: string; value: number }) => Promise<void>;
  respondToEvent: (eventId: string, choiceId: string) => Promise<void>;
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
  currentPeriod: 'early_capitalism' as HistoricalPeriod,
  level: 1,
  experience: 0,
  enterprises: [] as Enterprise[],
  currentEvents: [] as GameEvent[],
  economicIndicators: null,
  marketState: null,
  unlockedFeatures: ['basic_enterprises'],
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState(defaultGameState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshGameState();
  }, []);

  const refreshGameState = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getGameState();
      setGameState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createEnterprise = async (data: { name: string; type: string; location: string }): Promise<Enterprise> => {
    try {
      const enterprise = await apiService.createEnterprise(data);
      setGameState(prev => ({
        ...prev,
        enterprises: [...prev.enterprises, enterprise],
      }));
      return enterprise;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateEnterprise = async (id: string, updates: Partial<Enterprise>): Promise<Enterprise> => {
    try {
      const updatedEnterprise = await apiService.updateEnterprise(id, updates);
      setGameState(prev => ({
        ...prev,
        enterprises: prev.enterprises.map(e =>
          e.id === id ? updatedEnterprise : e
        ),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const respondToEvent = async (eventId: string, choiceId: string): Promise<void> => {
    try {
      await apiService.respondToEvent(eventId, choiceId);
      await refreshGameState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const value: GameContextType = {
    gameState,
    loading,
    error,
    refreshGameState,
    createEnterprise,
    updateEnterprise,
    makeDecision,
    respondToEvent,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
