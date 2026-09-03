import Phaser from 'phaser';
import { ENTERPRISE_COLORS, WORLD_HEIGHT, WORLD_WIDTH } from '../config/gameConfig';
import { createEnterpriseBuilding } from './enterpriseGraphics';

export const ENTERPRISE_SPRITE_TYPES = [
  'manufactory',
  'factory',
  'shop',
  'farm',
  'mine',
  'research_center',
] as const;

export function preloadEnterpriseSprites(scene: Phaser.Scene) {
  const base = import.meta.env.BASE_URL ?? '/';

  for (const type of ENTERPRISE_SPRITE_TYPES) {
    scene.load.image(`building_${type}`, `${base}assets/map/${type}.png`);
  }
  scene.load.image('building_locked', `${base}assets/map/locked.png`);
}

export function ensureEnterpriseTextures(scene: Phaser.Scene) {
  for (const type of ENTERPRISE_SPRITE_TYPES) {
    const key = `building_${type}`;
    if (scene.textures.exists(key)) continue;

    const container = createEnterpriseBuilding(scene, type, true);
    container.setVisible(false);
    const rt = scene.add.renderTexture(0, 0, 96, 84);
    rt.draw(container, 48, 42);
    rt.saveTexture(key);
    container.destroy(true);
    rt.destroy();
  }
}

export function createEnterpriseSprite(scene: Phaser.Scene, type: string, _profitPositive: boolean): Phaser.GameObjects.Sprite {
  ensureEnterpriseTextures(scene);
  const key = scene.textures.exists(`building_${type}`) ? `building_${type}` : `building_manufactory`;
  const sprite = scene.add.sprite(0, 0, key);
  sprite.setOrigin(0.5, 0.85);
  return sprite;
}

export const MINIMAP = {
  x: 12,
  width: 168,
  height: 105,
  padding: 12,
};

export function worldToMinimap(wx: number, wy: number, mx: number, my: number, mw: number, mh: number) {
  return {
    x: mx + (wx / WORLD_WIDTH) * mw,
    y: my + (wy / WORLD_HEIGHT) * mh,
  };
}

export function minimapToWorld(px: number, py: number, mx: number, my: number, mw: number, mh: number) {
  return {
    x: Phaser.Math.Clamp(((px - mx) / mw) * WORLD_WIDTH, 0, WORLD_WIDTH),
    y: Phaser.Math.Clamp(((py - my) / mh) * WORLD_HEIGHT, 0, WORLD_HEIGHT),
  };
}

export const ENTERPRISE_DOT_COLORS: Record<string, number> = ENTERPRISE_COLORS;
