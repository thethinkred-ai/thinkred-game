/**
 * Stepik course 288774 — «Капитал» Маркса (ThinkRed)
 * https://stepik.org/course/288774/syllabus
 *
 * Run `node scripts/fetch-stepik-course.mjs` with OAuth to refresh IDs/titles
 * from the live course into shared/data/course-288774.json
 */

export const STEPIK_COURSE_ID_DEFAULT = 288774;

/** Thematic labels aligned with ThinkRed «Капитал» (28 уроков) until live fetch replaces them */
export const LESSON_DEFINITIONS: Array<{ key: string; title: string; chapter?: string }> = [
  { key: 'lesson_01', title: 'Введение в курс «Капитал»', chapter: 'Введение' },
  { key: 'lesson_02', title: 'Метод и структура «Капитала»', chapter: 'Введение' },
  { key: 'lesson_03', title: 'Товар. Потребительная стоимость', chapter: 'Т. I гл. 1' },
  { key: 'lesson_04', title: 'Меновая стоимость', chapter: 'Т. I гл. 1' },
  { key: 'lesson_05', title: 'Две формы меновой стоимости', chapter: 'Т. I гл. 1' },
  { key: 'lesson_06', title: 'Фетишизм товара', chapter: 'Т. I гл. 1' },
  { key: 'lesson_07', title: 'Процесс обмена', chapter: 'Т. I гл. 2–3' },
  { key: 'lesson_08', title: 'Деньги как мера стоимости', chapter: 'Т. I гл. 3' },
  { key: 'lesson_09', title: 'Деньги как средство обращения', chapter: 'Т. I гл. 3' },
  { key: 'lesson_10', title: 'Превращение денег в капитал', chapter: 'Т. I гл. 4' },
  { key: 'lesson_11', title: 'Рабочая сила как товар', chapter: 'Т. I гл. 6' },
  { key: 'lesson_12', title: 'Процесс производства прибавочной стоимости', chapter: 'Т. I гл. 7' },
  { key: 'lesson_13', title: 'Постоянный и переменный капитал', chapter: 'Т. I гл. 8' },
  { key: 'lesson_14', title: 'Норма прибавочной стоимости', chapter: 'Т. I гл. 9' },
  { key: 'lesson_15', title: 'Рабочий день', chapter: 'Т. I гл. 10' },
  { key: 'lesson_16', title: 'Норма и масса прибавочной стоимости', chapter: 'Т. I гл. 11' },
  { key: 'lesson_17', title: 'Относительная прибавочная стоимость', chapter: 'Т. I гл. 12' },
  { key: 'lesson_18', title: 'Кооперация и разделение труда', chapter: 'Т. I гл. 13–14' },
  { key: 'lesson_19', title: 'Мануфактура', chapter: 'Т. I гл. 14' },
  { key: 'lesson_20', title: 'Машинное производство', chapter: 'Т. I гл. 15' },
  { key: 'lesson_21', title: 'Производительность труда и прибавочная стоимость', chapter: 'Т. I гл. 16' },
  { key: 'lesson_22', title: 'Превращение прибавочной стоимости в капитал', chapter: 'Т. I гл. 24' },
  { key: 'lesson_23', title: 'Накопление капитала', chapter: 'Т. I гл. 24' },
  { key: 'lesson_24', title: 'Примитивное накопление', chapter: 'Т. I гл. 26' },
  { key: 'lesson_25', title: 'Исторический тезис о частной собственности', chapter: 'Т. I гл. 26' },
  { key: 'lesson_26', title: 'Генesis капиталистического землевладения', chapter: 'Т. I гл. 27' },
  { key: 'lesson_27', title: 'Современная колонизация', chapter: 'Т. I гл. 33' },
  { key: 'lesson_28', title: 'Синтез: политэкономия в игре ThinkRed', chapter: 'Заключение' },
];

export const ALL_LESSON_KEYS = LESSON_DEFINITIONS.map((l) => l.key);

export const LESSON_LABELS: Record<string, string> = Object.fromEntries(
  LESSON_DEFINITIONS.map((l) => [l.key, l.title])
);

export const LESSON_CHAPTERS: Record<string, string> = Object.fromEntries(
  LESSON_DEFINITIONS.filter((l) => l.chapter).map((l) => [l.key, l.chapter!])
);

/** Game unlock tiers mapped to Capital progression */
export const LESSON_UNLOCK_TIERS = {
  basic_enterprises: ['lesson_03', 'lesson_04', 'lesson_05'],
  trade_and_money: ['lesson_07', 'lesson_08', 'lesson_09'],
  surplus_value: ['lesson_11', 'lesson_12', 'lesson_13'],
  manufacture: ['lesson_18', 'lesson_19'],
  machinery: ['lesson_20', 'lesson_21'],
  accumulation: ['lesson_22', 'lesson_23', 'lesson_24'],
  imperialism: ['lesson_26', 'lesson_27'],
  synthesis: ['lesson_28'],
} as const;

export function getLessonLabel(key: string): string {
  return LESSON_LABELS[key] ?? key.replace('_', ' ');
}

export function getLessonUrl(stepikLessonId: number): string {
  return `https://stepik.org/lesson/${stepikLessonId}`;
}

export function getDefaultLessonMap(): Record<string, number> {
  return Object.fromEntries(ALL_LESSON_KEYS.map((key) => [key, 0]));
}
