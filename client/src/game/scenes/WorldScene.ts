import Phaser from 'phaser';
import {
  ENTERPRISE_COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  PERIOD_BACKGROUNDS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../config/gameConfig';
import { resolveLocationCoords } from '../utils/locationCoords';
import { createEnterpriseBuilding, ENTERPRISE_TYPE_ICONS } from '../utils/enterpriseGraphics';
import { Enterprise, HistoricalPeriod } from '../../../../shared/types';

export interface MapEnterprise {
  id: string;
  name: string;
  type: string;
  location: string;
  profit: number;
  workers: number;
  level: number;
  x: number;
  y: number;
}

export interface WorldSceneData {
  period: HistoricalPeriod;
  enterprises: Enterprise[];
  lockedTypes: string[];
  onEnterpriseClick?: (id: string) => void;
  onBuildClick?: () => void;
}

export class WorldScene extends Phaser.Scene {
  private enterprises: MapEnterprise[] = [];
  private period: HistoricalPeriod = 'feudalism';
  private lockedTypes: string[] = [];
  private onEnterpriseClick?: (id: string) => void;
  private onBuildClick?: () => void;

  private backgroundLayer!: Phaser.GameObjects.Container;
  private gridLayer!: Phaser.GameObjects.Container;
  private enterpriseLayer!: Phaser.GameObjects.Container;
  private lockedLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;

  private backgroundRect!: Phaser.GameObjects.Rectangle;
  private periodLabel!: Phaser.GameObjects.Text;
  private hintLabel!: Phaser.GameObjects.Text;

  private isPanning = false;
  private panStart = { x: 0, y: 0, scrollX: 0, scrollY: 0 };

  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data: WorldSceneData) {
    this.applyData(data);
  }

  create() {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    this.backgroundLayer = this.add.container(0, 0);
    this.gridLayer = this.add.container(0, 0);
    this.enterpriseLayer = this.add.container(0, 0);
    this.lockedLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

    this.backgroundLayer.setDepth(0);
    this.gridLayer.setDepth(1);
    this.enterpriseLayer.setDepth(5);
    this.lockedLayer.setDepth(3);
    this.uiLayer.setDepth(20);

    this.drawBackground();
    this.drawGrid();
    this.drawBuildButton();
    this.drawMapHint();
    this.setupCameraControls();
    this.renderEnterprises();
    this.renderLockedSlots();
  }

  syncData(data: WorldSceneData) {
    this.applyData(data);

    if (!this.scene.isActive() || !this.backgroundLayer) return;

    this.updateBackground();
    this.drawGrid();
    this.renderEnterprises();
    this.renderLockedSlots();
  }

  private applyData(data: WorldSceneData) {
    this.period = data.period;
    this.lockedTypes = data.lockedTypes;
    this.onEnterpriseClick = data.onEnterpriseClick;
    this.onBuildClick = data.onBuildClick;

    this.enterprises = data.enterprises.map((e, i) => {
      const coords = resolveLocationCoords(e.location, i);
      return {
        id: e.id,
        name: e.name,
        type: e.type,
        location: e.location,
        profit: e.profit,
        workers: e.workers,
        level: e.level,
        x: coords.x,
        y: coords.y,
      };
    });
  }

  private drawBackground() {
    const color = PERIOD_BACKGROUNDS[this.period] ?? 0x0f172a;
    this.backgroundRect = this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, color);
    this.periodLabel = this.add.text(16, 16, this.getPeriodLabel(), {
      fontSize: '13px',
      color: '#cbd5e1',
      backgroundColor: '#0f172acc',
      padding: { x: 8, y: 4 },
    });

    this.backgroundLayer.add([this.backgroundRect, this.periodLabel]);
  }

  private updateBackground() {
    if (!this.backgroundRect) return;
    const color = PERIOD_BACKGROUNDS[this.period] ?? 0x0f172a;
    this.backgroundRect.setFillStyle(color);
    this.periodLabel.setText(this.getPeriodLabel());
  }

  private getPeriodLabel(): string {
    const labels: Record<string, string> = {
      feudalism: 'Феодализм',
      early_capitalism: 'Ранний капитализм',
      industrial_revolution: 'Пром. революция',
      monopoly_capitalism: 'Монополии',
      imperialism: 'Империализм',
      modern_capitalism: 'Современность',
      socialism_transition: 'Переход к социализму',
      communism: 'Коммунизм',
    };
    return labels[this.period] ?? this.period;
  }

  private drawGrid() {
    this.gridLayer.removeAll(true);
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xffffff, 0.04);

    for (let x = 0; x <= WORLD_WIDTH; x += 50) {
      graphics.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 50) {
      graphics.lineBetween(0, y, WORLD_WIDTH, y);
    }

    this.drawLocationMarkers(graphics);
    this.gridLayer.add(graphics);
  }

  private drawLocationMarkers(graphics: Phaser.GameObjects.Graphics) {
    const used = new Map<string, { x: number; y: number; label: string }>();
    this.enterprises.forEach((e) => {
      const key = e.location.trim().toLowerCase();
      if (!used.has(key)) {
        used.set(key, { x: e.x, y: e.y, label: resolveLocationCoords(e.location).label });
      }
    });

    used.forEach(({ x, y, label }) => {
      graphics.lineStyle(1, 0xfbbf24, 0.25);
      graphics.strokeCircle(x, y + 40, 28);
      const text = this.add.text(x, y + 52, label.slice(0, 14), {
        fontSize: '10px',
        color: '#94a3b8',
      });
      text.setOrigin(0.5, 0);
      this.gridLayer.add(text);
    });
  }

  private drawBuildButton() {
    this.uiLayer.removeAll(true);

    const screenBtn = this.add.container(GAME_WIDTH - 90, 36);
    const bg = this.add
      .rectangle(0, 0, 140, 36, 0xdc2626)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(-50, -8, 'Построить', { fontSize: '14px', color: '#fff' });
    screenBtn.add([bg, label]);
    bg.on('pointerdown', () => this.onBuildClick?.());

    const zoomOut = this.add
      .text(GAME_WIDTH - 160, 12, '−', { fontSize: '20px', color: '#e2e8f0', backgroundColor: '#1e293b' })
      .setPadding(8, 4)
      .setInteractive({ useHandCursor: true });
    const zoomIn = this.add
      .text(GAME_WIDTH - 120, 12, '+', { fontSize: '20px', color: '#e2e8f0', backgroundColor: '#1e293b' })
      .setPadding(8, 4)
      .setInteractive({ useHandCursor: true });

    zoomOut.on('pointerdown', () => this.adjustZoom(-0.15));
    zoomIn.on('pointerdown', () => this.adjustZoom(0.15));

    this.uiLayer.add([screenBtn, zoomOut, zoomIn]);
    this.uiLayer.setScrollFactor(0);
  }

  private drawMapHint() {
    this.hintLabel = this.add.text(16, GAME_HEIGHT - 32, 'Колёсико — масштаб • Перетаскивание — перемещение', {
      fontSize: '11px',
      color: '#64748b',
      backgroundColor: '#0f172a99',
      padding: { x: 6, y: 3 },
    });
    this.hintLabel.setScrollFactor(0);
    this.hintLabel.setDepth(25);
  }

  private setupCameraControls() {
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], _dx: number, _dy: number, _dz: number, deltaZ: number) => {
      const next = Phaser.Math.Clamp(this.cameras.main.zoom - deltaZ * 0.001, 0.45, 1.8);
      this.cameras.main.setZoom(next);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (currentlyOver.length > 0) return;
      if (pointer.y > GAME_HEIGHT - 48 && pointer.x < 420) return;
      if (pointer.y < 56 && pointer.x > GAME_WIDTH - 180) return;

      this.isPanning = true;
      this.panStart = {
        x: pointer.x,
        y: pointer.y,
        scrollX: this.cameras.main.scrollX,
        scrollY: this.cameras.main.scrollY,
      };
    });

    this.input.on('pointerup', () => {
      this.isPanning = false;
    });

    this.input.on('pointerupoutside', () => {
      this.isPanning = false;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPanning || !pointer.isDown) return;
      const zoom = this.cameras.main.zoom;
      const dx = (pointer.x - this.panStart.x) / zoom;
      const dy = (pointer.y - this.panStart.y) / zoom;
      this.cameras.main.scrollX = this.panStart.scrollX - dx;
      this.cameras.main.scrollY = this.panStart.scrollY - dy;
    });
  }

  private adjustZoom(delta: number) {
    const next = Phaser.Math.Clamp(this.cameras.main.zoom + delta, 0.45, 1.8);
    this.cameras.main.setZoom(next);
  }

  private renderEnterprises() {
    if (!this.enterpriseLayer) return;
    this.enterpriseLayer.removeAll(true);

    this.enterprises.forEach((ent) => {
      const container = this.add.container(ent.x, ent.y);
      const building = createEnterpriseBuilding(this, ent.type, ent.profit >= 0);
      building.setInteractive(
        new Phaser.Geom.Rectangle(-44, -42, 88, 70),
        Phaser.Geom.Rectangle.Contains
      );
      this.input.setDraggable(building, false);

      const icon = this.add.text(-8, -52, ENTERPRISE_TYPE_ICONS[ent.type] ?? '🏢', {
        fontSize: '14px',
      });
      const label = this.add.text(-40, -58, ent.name.slice(0, 14), {
        fontSize: '11px',
        color: '#e2e8f0',
        backgroundColor: '#0f172a99',
        padding: { x: 4, y: 2 },
      });
      const stats = this.add.text(-35, 28, `👷${ent.workers} Lv${ent.level}`, {
        fontSize: '10px',
        color: '#94a3b8',
      });

      container.add([building, icon, label, stats]);

      building.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.isPanning = false;
        this.tweens.add({
          targets: container,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 80,
          yoyo: true,
        });
        this.onEnterpriseClick?.(ent.id);
      });

      building.on('pointerover', () => building.setScale(1.05));
      building.on('pointerout', () => building.setScale(1));

      this.enterpriseLayer.add(container);
    });
  }

  private renderLockedSlots() {
    if (!this.lockedLayer) return;
    this.lockedLayer.removeAll(true);

    const anchor = this.enterprises.length > 0
      ? this.enterprises[this.enterprises.length - 1]
      : { x: 400, y: 400 };

    this.lockedTypes.slice(0, 3).forEach((type, i) => {
      const container = this.add.container(anchor.x + 120 + i * 90, anchor.y + 60);
      const ghost = this.add.rectangle(0, 0, 56, 42, ENTERPRISE_COLORS[type] ?? 0x64748b, 0.15);
      ghost.setStrokeStyle(1, 0xfbbf24, 0.5);
      const lock = this.add.text(-8, -10, '🔒', { fontSize: '16px' });
      const typeLabel = this.add.text(-24, 26, type.slice(0, 8), { fontSize: '9px', color: '#64748b' });
      container.add([ghost, lock, typeLabel]);
      this.lockedLayer.add(container);
    });
  }
}
