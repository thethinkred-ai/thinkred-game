import Phaser from 'phaser';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 600;
export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 1000;

export const PERIOD_BACKGROUNDS: Record<string, number> = {
  feudalism: 0x2d4a22,
  early_capitalism: 0x3d3a2a,
  industrial_revolution: 0x3a3a3a,
  monopoly_capitalism: 0x2a2a3a,
  imperialism: 0x2a3040,
  modern_capitalism: 0x1a2030,
  socialism_transition: 0x2a3a2a,
  communism: 0x3a2a2a,
};

export const ENTERPRISE_COLORS: Record<string, number> = {
  manufactory: 0x4a90d9,
  factory: 0x50c878,
  shop: 0xf5c542,
  farm: 0xe67e22,
  mine: 0x95a5a6,
  research_center: 0x9b59b6,
};

export function createGameConfig(
  parent: HTMLElement,
  SceneClass: typeof Phaser.Scene
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#0f172a',
    scene: [SceneClass],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      mouse: { preventDefaultWheel: false },
    },
  };
}
