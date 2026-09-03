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
import {
  createEnterpriseSprite,
  ensureEnterpriseTextures,
  preloadEnterpriseSprites,
} from '../utils/spriteAssets';
import { Enterprise, HistoricalPeriod } from '../../../../shared/types';
import { Minimap, TouchControls, getMapHintText, isTouchDevice } from '../controls/mapControls';

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

  private minimap!: Minimap;
  private touchControls!: TouchControls;

  private lastTapTime = 0;
  private lastTapPos = { x: 0, y: 0 };

  constructor() {
    super({ key: 'WorldScene' });
  }

  preload() {
    preloadEnterpriseSprites(this);
  }

  init(data: WorldSceneData) {
    this.applyData(data);
  }

  create() {
    ensureEnterpriseTextures(this);

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

    this.minimap = new Minimap(this);
    this.minimap.create();

    this.touchControls = new TouchControls(this);
    this.touchControls.configure({
      isBlocked: (pointer) => this.isUiPointer(pointer),
      onPanEnd: () => undefined,
    });
    this.touchControls.setup();

    this.drawBackground();
    this.drawGrid();
    this.drawBuildButton();
    this.drawMapHint();
    this.setupWheelZoom();
    this.setupDoubleTapZoom();
    this.renderEnterprises();
    this.renderLockedSlots();
  }

  update() {
    this.minimap.update(this.enterprises, this.cameras.main);
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

  private isUiPointer(pointer: Phaser.Input.Pointer): boolean {
    if (pointer.y < 56 && pointer.x > GAME_WIDTH - 180) return true;
    if (pointer.y > GAME_HEIGHT - 48 && pointer.x < 440) return true;
    if (this.minimap?.isPointerOver(pointer)) return true;
    return false;
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
    bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.touchControls.stopPanning();
      this.onBuildClick?.();
    });

    const zoomOut = this.add
      .text(GAME_WIDTH - 160, 12, '−', { fontSize: '20px', color: '#e2e8f0', backgroundColor: '#1e293b' })
      .setPadding(8, 4)
      .setInteractive({ useHandCursor: true });
    const zoomIn = this.add
      .text(GAME_WIDTH - 120, 12, '+', { fontSize: '20px', color: '#e2e8f0', backgroundColor: '#1e293b' })
      .setPadding(8, 4)
      .setInteractive({ useHandCursor: true });

    zoomOut.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.adjustZoom(-0.15);
    });
    zoomIn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.adjustZoom(0.15);
    });

    this.uiLayer.add([screenBtn, zoomOut, zoomIn]);
    this.uiLayer.setScrollFactor(0);
  }

  private drawMapHint() {
    if (this.hintLabel) this.hintLabel.destroy();
    this.hintLabel = this.add.text(16, GAME_HEIGHT - 32, getMapHintText(), {
      fontSize: '11px',
      color: '#64748b',
      backgroundColor: '#0f172a99',
      padding: { x: 6, y: 3 },
    });
    this.hintLabel.setScrollFactor(0);
    this.hintLabel.setDepth(25);
  }

  private setupWheelZoom() {
    this.input.on(
      'wheel',
      (
        _pointer: Phaser.Input.Pointer,
        _objects: Phaser.GameObjects.GameObject[],
        _dx: number,
        _dy: number,
        _dz: number,
        deltaZ: number
      ) => {
        const next = Phaser.Math.Clamp(this.cameras.main.zoom - deltaZ * 0.001, 0.45, 1.8);
        this.cameras.main.setZoom(next);
      }
    );
  }

  private setupDoubleTapZoom() {
    if (!isTouchDevice()) return;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (currentlyOver.length > 0 || this.isUiPointer(pointer)) return;
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) return;

      const now = Date.now();
      const dt = now - this.lastTapTime;
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.lastTapPos.x, this.lastTapPos.y);

      if (dt < 320 && dist < 24) {
        const cam = this.cameras.main;
        const world = cam.getWorldPoint(pointer.x, pointer.y);
        const targetZoom = cam.zoom < 1.2 ? 1.5 : 0.8;
        cam.zoomTo(targetZoom, 200);
        cam.pan(world.x, world.y, 200);
        this.lastTapTime = 0;
        return;
      }

      this.lastTapTime = now;
      this.lastTapPos = { x: pointer.x, y: pointer.y };
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

      const statusRing = this.add.circle(0, 2, 28, 0, 0);
      statusRing.setStrokeStyle(2, ent.profit >= 0 ? 0x22c55e : 0xef4444, 0.95);

      const sprite = createEnterpriseSprite(this, ent.type, ent.profit >= 0);
      sprite.setInteractive({ useHandCursor: true, pixelPerfect: false });
      sprite.input!.hitArea = new Phaser.Geom.Rectangle(-24, -40, 48, 48);

      const label = this.add.text(-40, -58, ent.name.slice(0, 14), {
        fontSize: '11px',
        color: '#e2e8f0',
        backgroundColor: '#0f172a99',
        padding: { x: 4, y: 2 },
      });
      const stats = this.add.text(-35, 32, `👷${ent.workers} Lv${ent.level}`, {
        fontSize: '10px',
        color: '#94a3b8',
      });

      container.add([statusRing, sprite, label, stats]);

      sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.touchControls.stopPanning();
        this.tweens.add({
          targets: container,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 80,
          yoyo: true,
        });
        this.onEnterpriseClick?.(ent.id);
      });

      sprite.on('pointerover', () => sprite.setScale(1.08));
      sprite.on('pointerout', () => sprite.setScale(1));

      this.enterpriseLayer.add(container);
    });
  }

  private renderLockedSlots() {
    if (!this.lockedLayer) return;
    this.lockedLayer.removeAll(true);

    const anchor =
      this.enterprises.length > 0
        ? this.enterprises[this.enterprises.length - 1]
        : { x: 400, y: 400 };

    this.lockedTypes.slice(0, 3).forEach((type, i) => {
      const container = this.add.container(anchor.x + 120 + i * 90, anchor.y + 60);
      const ghost = this.add.rectangle(0, 0, 48, 48, ENTERPRISE_COLORS[type] ?? 0x64748b, 0.12);
      ghost.setStrokeStyle(1, 0xfbbf24, 0.5);
      container.add(ghost);

      if (this.textures.exists('building_locked')) {
        const lockSprite = this.add.sprite(0, 0, 'building_locked');
        lockSprite.setAlpha(0.7);
        lockSprite.setScale(0.9);
        container.add(lockSprite);
      } else {
        container.add(this.add.text(-8, -10, '🔒', { fontSize: '16px' }));
      }

      container.add(this.add.text(-24, 28, type.slice(0, 8), { fontSize: '9px', color: '#64748b' }));
      this.lockedLayer.add(container);
    });
  }
}
