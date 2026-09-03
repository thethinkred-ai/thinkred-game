import Phaser from 'phaser';
import { GAME_HEIGHT } from '../config/gameConfig';
import {
  ENTERPRISE_DOT_COLORS,
  MINIMAP,
  minimapToWorld,
  worldToMinimap,
} from '../utils/spriteAssets';

export class Minimap {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Rectangle;
  private viewportRect!: Phaser.GameObjects.Rectangle;
  private dots: Phaser.GameObjects.Arc[] = [];
  private label!: Phaser.GameObjects.Text;
  private lastEnterpriseKey = '';

  private mx = MINIMAP.x;
  private my = GAME_HEIGHT - MINIMAP.height - MINIMAP.padding;
  private mw = MINIMAP.width;
  private mh = MINIMAP.height;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(30);

    this.bg = this.scene.add.rectangle(
      this.mx + this.mw / 2,
      this.my + this.mh / 2,
      this.mw,
      this.mh,
      0x0f172a,
      0.92
    );
    this.bg.setStrokeStyle(1, 0x475569, 0.8);
    this.bg.setInteractive({ useHandCursor: true });

    this.viewportRect = this.scene.add.rectangle(0, 0, 20, 14, 0x000000, 0);
    this.viewportRect.setStrokeStyle(2, 0xdc2626, 0.9);

    this.label = this.scene.add.text(this.mx + 6, this.my + 4, 'Карта', {
      fontSize: '10px',
      color: '#94a3b8',
    });

    this.container.add([this.bg, this.viewportRect, this.label]);

    this.bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      const world = minimapToWorld(pointer.x, pointer.y, this.mx, this.my, this.mw, this.mh);
      this.scene.cameras.main.centerOn(world.x, world.y);
    });
  }

  update(
    enterprises: Array<{ x: number; y: number; type: string }>,
    camera: Phaser.Cameras.Scene2D.Camera
  ) {
    const key = enterprises.map((e) => `${e.x},${e.y},${e.type}`).join('|');
    if (key !== this.lastEnterpriseKey) {
      this.lastEnterpriseKey = key;
      this.dots.forEach((d) => d.destroy());
      this.dots = [];

      enterprises.forEach((ent) => {
        const p = worldToMinimap(ent.x, ent.y, this.mx, this.my, this.mw, this.mh);
        const dot = this.scene.add.circle(p.x, p.y, 3, ENTERPRISE_DOT_COLORS[ent.type] ?? 0x64748b, 1);
        dot.setScrollFactor(0);
        dot.setDepth(31);
        this.dots.push(dot);
        this.container.add(dot);
      });
    }

    const view = camera.worldView;
    const topLeft = worldToMinimap(view.x, view.y, this.mx, this.my, this.mw, this.mh);
    const bottomRight = worldToMinimap(
      view.x + view.width,
      view.y + view.height,
      this.mx,
      this.my,
      this.mw,
      this.mh
    );

    const vw = Math.max(8, bottomRight.x - topLeft.x);
    const vh = Math.max(6, bottomRight.y - topLeft.y);
    this.viewportRect.setPosition(topLeft.x + vw / 2, topLeft.y + vh / 2);
    this.viewportRect.setSize(vw, vh);
  }

  isPointerOver(pointer: Phaser.Input.Pointer): boolean {
    return (
      pointer.x >= this.mx &&
      pointer.x <= this.mx + this.mw &&
      pointer.y >= this.my &&
      pointer.y <= this.my + this.mh
    );
  }

  destroy() {
    this.dots.forEach((d) => d.destroy());
    this.container?.destroy(true);
  }
}

export class TouchControls {
  private scene: Phaser.Scene;
  private isPanning = false;
  private panStart = { x: 0, y: 0, scrollX: 0, scrollY: 0 };
  private lastPinchDistance = 0;
  private pinchZoom = 1;
  private onPanStart?: () => void;
  private onPanEnd?: () => void;
  private isBlocked?: (pointer: Phaser.Input.Pointer) => boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  configure(options: {
    onPanStart?: () => void;
    onPanEnd?: () => void;
    isBlocked?: (pointer: Phaser.Input.Pointer) => boolean;
  }) {
    this.onPanStart = options.onPanStart;
    this.onPanEnd = options.onPanEnd;
    this.isBlocked = options.isBlocked;
  }

  setup() {
    this.scene.input.addPointer(2);

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (this.isBlocked?.(pointer)) return;
      if (currentlyOver.length > 0) return;

      if (this.scene.input.pointer1.isDown && this.scene.input.pointer2.isDown) {
        this.lastPinchDistance = this.getPinchDistance();
        this.pinchZoom = this.scene.cameras.main.zoom;
        this.isPanning = false;
        return;
      }

      this.isPanning = true;
      this.onPanStart?.();
      this.panStart = {
        x: pointer.x,
        y: pointer.y,
        scrollX: this.scene.cameras.main.scrollX,
        scrollY: this.scene.cameras.main.scrollY,
      };
    });

    this.scene.input.on('pointerup', () => {
      if (!this.scene.input.pointer1.isDown && !this.scene.input.pointer2.isDown) {
        this.isPanning = false;
        this.lastPinchDistance = 0;
        this.onPanEnd?.();
      }
    });

    this.scene.input.on('pointermove', () => {
      const p1 = this.scene.input.pointer1;
      const p2 = this.scene.input.pointer2;

      if (p1.isDown && p2.isDown) {
        const dist = this.getPinchDistance();
        if (this.lastPinchDistance > 0) {
          const ratio = dist / this.lastPinchDistance;
          const next = Phaser.Math.Clamp(this.pinchZoom * ratio, 0.45, 1.8);
          this.scene.cameras.main.setZoom(next);
        }
        return;
      }

      if (!this.isPanning || !p1.isDown) return;

      const zoom = this.scene.cameras.main.zoom;
      const dx = (p1.x - this.panStart.x) / zoom;
      const dy = (p1.y - this.panStart.y) / zoom;
      this.scene.cameras.main.scrollX = this.panStart.scrollX - dx;
      this.scene.cameras.main.scrollY = this.panStart.scrollY - dy;
    });
  }

  get isActivePanning() {
    return this.isPanning;
  }

  stopPanning() {
    this.isPanning = false;
  }

  private getPinchDistance(): number {
    const p1 = this.scene.input.pointer1;
    const p2 = this.scene.input.pointer2;
    return Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
  }
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getMapHintText(): string {
  if (isTouchDevice()) {
    return 'Касание — перемещение • Щипок — масштаб • Тап по зданию — управление';
  }
  return 'Колёсико — масштаб • Перетаскивание — перемещение • Мини-карта — быстрый переход';
}
