import React, { useEffect, useRef, useState } from 'react';
import type { WorldSceneData } from './scenes/WorldScene';

interface PhaserGameProps {
  sceneData: WorldSceneData;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ sceneData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import('phaser').Game | null>(null);
  const sceneRef = useRef<import('./scenes/WorldScene').WorldScene | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const sceneDataRef = useRef(sceneData);

  sceneDataRef.current = sceneData;

  useEffect(() => {
    let destroyed = false;

    const boot = async () => {
      try {
        const [{ default: Phaser }, { createGameConfig }, { WorldScene }] = await Promise.all([
          import('phaser'),
          import('./config/gameConfig'),
          import('./scenes/WorldScene'),
        ]);

        if (destroyed || !containerRef.current || gameRef.current) return;

        const game = new Phaser.Game(createGameConfig(containerRef.current, WorldScene));
        gameRef.current = game;

        game.events.once('ready', () => {
          if (destroyed) return;
          game.scene.start('WorldScene', sceneDataRef.current);
          sceneRef.current = game.scene.getScene('WorldScene') as import('./scenes/WorldScene').WorldScene;
          setLoading(false);
        });
      } catch (err) {
        if (!destroyed) {
          setLoadError(err instanceof Error ? err.message : 'Не удалось загрузить Phaser');
          setLoading(false);
        }
      }
    };

    boot();

    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current?.scene.isActive()) {
      sceneRef.current.syncData(sceneData);
    } else if (gameRef.current?.scene.isActive('WorldScene')) {
      gameRef.current.scene.start('WorldScene', sceneData);
      sceneRef.current = gameRef.current.scene.getScene('WorldScene') as import('./scenes/WorldScene').WorldScene;
    }
  }, [sceneData]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 border border-red-900/40 rounded-xl">
        Ошибка загрузки карты: {loadError}
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10 rounded-xl">
          <div className="loading-spinner" />
          <span className="ml-3 text-slate-400 text-sm">Загрузка Phaser...</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-slate-800/60 shadow-inner"
        style={{ minHeight: 600 }}
      />
    </div>
  );
};
