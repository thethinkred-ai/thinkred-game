import Phaser from 'phaser';
import { ENTERPRISE_COLORS } from '../config/gameConfig';

export function createEnterpriseBuilding(
  scene: Phaser.Scene,
  type: string,
  profitPositive: boolean
): Phaser.GameObjects.Container {
  const color = ENTERPRISE_COLORS[type] ?? 0x64748b;
  const stroke = profitPositive ? 0x22c55e : 0xef4444;
  const g = scene.add.graphics();

  switch (type) {
    case 'factory':
      g.fillStyle(color, 1);
      g.fillRect(-44, -18, 88, 36);
      g.fillStyle(0x334155, 1);
      g.fillRect(-18, -38, 10, 20);
      g.fillRect(12, -42, 10, 24);
      g.lineStyle(2, stroke, 1);
      g.strokeRect(-44, -18, 88, 36);
      break;
    case 'farm':
      g.fillStyle(color, 1);
      g.fillRect(-36, -8, 72, 28);
      g.fillTriangle(-40, -8, 0, -36, 40, -8);
      g.lineStyle(2, stroke, 1);
      g.strokeRect(-36, -8, 72, 28);
      break;
    case 'mine':
      g.fillStyle(color, 1);
      g.fillTriangle(-40, 20, 0, -30, 40, 20);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(-12, -10, 24, 30);
      g.lineStyle(2, stroke, 1);
      g.strokeTriangle(-40, 20, 0, -30, 40, 20);
      break;
    case 'shop':
      g.fillStyle(color, 1);
      g.fillRect(-28, -12, 56, 24);
      g.fillStyle(0xfef3c7, 0.9);
      g.fillRect(-20, -6, 16, 14);
      g.fillRect(4, -6, 16, 14);
      g.lineStyle(2, stroke, 1);
      g.strokeRect(-28, -12, 56, 24);
      break;
    case 'research_center':
      g.fillStyle(color, 1);
      g.fillRect(-30, -10, 60, 30);
      g.fillCircle(0, -22, 18);
      g.lineStyle(2, stroke, 1);
      g.strokeRect(-30, -10, 60, 30);
      g.strokeCircle(0, -22, 18);
      break;
    case 'manufactory':
    default:
      g.fillStyle(color, 1);
      g.fillRect(-38, -16, 76, 32);
      g.fillStyle(0x475569, 1);
      g.fillRect(20, -28, 8, 12);
      g.lineStyle(2, stroke, 1);
      g.strokeRect(-38, -16, 76, 32);
      break;
  }

  const container = scene.add.container(0, 0, [g]);
  return container;
}

export const ENTERPRISE_TYPE_ICONS: Record<string, string> = {
  manufactory: '🏭',
  factory: '🏗️',
  shop: '🏪',
  farm: '🌾',
  mine: '⛏️',
  research_center: '🔬',
};
