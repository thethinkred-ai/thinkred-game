export interface MapLocation {
  x: number;
  y: number;
  label: string;
}

/** Предопределённые точки на карте (координаты в мировом пространстве Phaser) */
export const MAP_LOCATIONS: Record<string, MapLocation> = {
  manchester: { x: 420, y: 380, label: 'Манчестер' },
  manchester_ru: { x: 420, y: 380, label: 'Манчестер' },
  london: { x: 520, y: 340, label: 'Лондон' },
  birmingham: { x: 480, y: 420, label: 'Бирмингем' },
  liverpool: { x: 380, y: 320, label: 'Ливерпуль' },
  moscow: { x: 920, y: 360, label: 'Москва' },
  petersburg: { x: 880, y: 280, label: 'Петербург' },
  berlin: { x: 680, y: 400, label: 'Берлин' },
  paris: { x: 560, y: 480, label: 'Париж' },
  lyons: { x: 600, y: 520, label: 'Лион' },
  new_york: { x: 280, y: 440, label: 'Нью-Йорк' },
  chicago: { x: 220, y: 380, label: 'Чикаго' },
  detroit: { x: 260, y: 340, label: 'Детройт' },
  tokyo: { x: 1280, y: 420, label: 'Токио' },
  osaka: { x: 1240, y: 480, label: 'Осака' },
};

const ALIASES: Record<string, string> = {
  'манчестер': 'manchester',
  'лондон': 'london',
  'ливерпуль': 'liverpool',
  'москва': 'moscow',
  'петербург': 'petersburg',
  'санкт-петербург': 'petersburg',
  'берлин': 'berlin',
  'париж': 'paris',
  'лон': 'lyons',
  'нью-йорк': 'new_york',
  'чикаго': 'chicago',
  'детройт': 'detroit',
  'токио': 'tokyo',
  'осака': 'osaka',
};

function normalizeKey(location: string): string {
  return location.trim().toLowerCase().replace(/\s+/g, '_');
}

function hashLocation(location: string): { x: number; y: number } {
  let hash = 0;
  for (let i = 0; i < location.length; i++) {
    hash = (hash << 5) - hash + location.charCodeAt(i);
    hash |= 0;
  }
  const col = Math.abs(hash) % 10;
  const row = Math.abs(hash >> 8) % 6;
  return {
    x: 180 + col * 130,
    y: 180 + row * 110,
  };
}

export function resolveLocationCoords(location: string, fallbackIndex = 0): { x: number; y: number; label: string } {
  if (!location.trim()) {
    return { x: 200 + (fallbackIndex % 5) * 140, y: 250 + Math.floor(fallbackIndex / 5) * 120, label: 'Не указано' };
  }

  const key = normalizeKey(location);
  const aliasKey = ALIASES[key.replace(/-/g, '_')] ?? key;
  const predefined = MAP_LOCATIONS[aliasKey];

  if (predefined) {
    return predefined;
  }

  for (const loc of Object.values(MAP_LOCATIONS)) {
    if (loc.label.toLowerCase() === location.trim().toLowerCase()) {
      return loc;
    }
  }

  const hashed = hashLocation(location);
  return { ...hashed, label: location.trim() };
}

export function getMapLocationOptions(): MapLocation[] {
  const seen = new Set<string>();
  return Object.values(MAP_LOCATIONS).filter((loc) => {
    if (seen.has(loc.label)) return false;
    seen.add(loc.label);
    return true;
  });
}
