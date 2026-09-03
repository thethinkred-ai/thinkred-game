import fs from 'fs';
import path from 'path';
import {
  ALL_LESSON_KEYS,
  STEPIK_COURSE_ID_DEFAULT,
  getDefaultLessonMap,
} from '../../../shared/constants/stepikLessons';

const COURSE_DATA_PATH = path.join(__dirname, '../../../shared/data/course-288774.json');

export function getStepikCourseId(): number {
  const envId = process.env.STEPIK_COURSE_ID;
  if (envId) return parseInt(envId, 10);
  return STEPIK_COURSE_ID_DEFAULT;
}

export function isStepikConfigured(): boolean {
  return getStepikCourseId() > 0;
}

function loadCourseDataFromFile(): Record<string, number> | null {
  try {
    if (!fs.existsSync(COURSE_DATA_PATH)) return null;
    const raw = JSON.parse(fs.readFileSync(COURSE_DATA_PATH, 'utf8'));
    if (raw.lessonMap && typeof raw.lessonMap === 'object') {
      return raw.lessonMap as Record<string, number>;
    }
  } catch {
    // ignore
  }
  return null;
}

export function getStepikLessonMap(): Record<string, number> {
  if (!isStepikConfigured()) {
    return {};
  }

  const defaults = getDefaultLessonMap();
  const fromFile = loadCourseDataFromFile();

  if (process.env.STEPIK_LESSON_MAP) {
    try {
      return { ...defaults, ...(fromFile ?? {}), ...JSON.parse(process.env.STEPIK_LESSON_MAP) };
    } catch {
      return fromFile ? { ...defaults, ...fromFile } : defaults;
    }
  }

  return fromFile ? { ...defaults, ...fromFile } : defaults;
}

export function getLessonKeyForId(lessonId: number, lessonMap?: Record<string, number>): string | undefined {
  const map = lessonMap ?? getStepikLessonMap();
  return Object.entries(map).find(([, id]) => id === lessonId)?.[0];
}

export function getStepikIdForKey(lessonKey: string): number | undefined {
  const id = getStepikLessonMap()[lessonKey];
  return id && id > 0 ? id : undefined;
}

/** Map legacy lesson_1..lesson_8 keys to new lesson_01..lesson_28 */
export const LEGACY_LESSON_ALIASES: Record<string, string> = {
  lesson_1: 'lesson_03',
  lesson_2: 'lesson_07',
  lesson_3: 'lesson_18',
  lesson_4: 'lesson_10',
  lesson_5: 'lesson_20',
  lesson_6: 'lesson_22',
  lesson_7: 'lesson_26',
  lesson_8: 'lesson_28',
};

export function normalizeLessonKey(key: string): string {
  return LEGACY_LESSON_ALIASES[key] ?? key;
}

export function normalizeCompletedLessons(lessons: string[]): string[] {
  const normalized = new Set<string>();
  for (const key of lessons) {
    normalized.add(normalizeLessonKey(key));
  }
  return [...normalized];
}
