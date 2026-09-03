/**
 * Stepik course 288774 — «Капитал» Маркса (ThinkRed)
 * https://stepik.org/course/288774/syllabus
 *
 * Run `node scripts/fetch-stepik-course.mjs` with OAuth to refresh IDs/titles
 * from the live course into shared/data/course-288774.json
 */

export const STEPIK_COURSE_ID_DEFAULT = 288774;

/** Lesson spine aligned to Thinkred «Капитал» (course 288774).
 * 34 wiki files (6 intro 00a-00f + 28 main) collapse to 28 game keys:
 * intro → prologue (lesson_01/02); main 1..28 → lesson_03..lesson_28 with two
 * merges (урок1+2 → lesson_03, урок27+28 → lesson_28). See docs/episodes-by-lesson.md */
export const LESSON_DEFINITIONS: Array<{ key: string; title: string; chapter?: string }> = [
  { key: 'lesson_01', title: 'Пролог: отчуждённый труд и контекст', chapter: 'Введение' },
  { key: 'lesson_02', title: 'Пролог: собственность — от денег-посредника к коммунизму', chapter: 'Введение' },
  { key: 'lesson_03', title: 'Товар и двойственный характер труда', chapter: 'Т. I гл. 1' },
  { key: 'lesson_04', title: 'Форма стоимости', chapter: 'Т. I гл. 1' },
  { key: 'lesson_05', title: 'Товарный фетишизм', chapter: 'Т. I гл. 1' },
  { key: 'lesson_06', title: 'Процесс обмена', chapter: 'Т. I гл. 2' },
  { key: 'lesson_07', title: 'Деньги, или обращение товаров', chapter: 'Т. I гл. 3' },
  { key: 'lesson_08', title: 'Всеобщая формула капитала', chapter: 'Т. I гл. 4' },
  { key: 'lesson_09', title: 'Противоречие всеобщей формулы', chapter: 'Т. I гл. 4' },
  { key: 'lesson_10', title: 'Рабочая сила как товар', chapter: 'Т. I гл. 4' },
  { key: 'lesson_11', title: 'Процесс труда и процесс увеличения стоимости', chapter: 'Т. I гл. 5' },
  { key: 'lesson_12', title: 'Постоянный и переменный капитал', chapter: 'Т. I гл. 6' },
  { key: 'lesson_13', title: 'Норма прибавочной стоимости', chapter: 'Т. I гл. 7' },
  { key: 'lesson_14', title: 'Рабочий день', chapter: 'Т. I гл. 8' },
  { key: 'lesson_15', title: 'Норма и масса прибавочной стоимости', chapter: 'Т. I гл. 9' },
  { key: 'lesson_16', title: 'Относительная прибавочная стоимость', chapter: 'Т. I гл. 10' },
  { key: 'lesson_17', title: 'Кооперация', chapter: 'Т. I гл. 11' },
  { key: 'lesson_18', title: 'Разделение труда и мануфактура', chapter: 'Т. I гл. 12' },
  { key: 'lesson_19', title: 'Машины и крупная промышленность', chapter: 'Т. I гл. 13' },
  { key: 'lesson_20', title: 'Абсолютная и относительная прибавочная стоимость', chapter: 'Т. I гл. 14' },
  { key: 'lesson_21', title: 'Изменение цены рабочей силы и прибавочной стоимости', chapter: 'Т. I гл. 15' },
  { key: 'lesson_22', title: 'Заработная плата как превращённая форма', chapter: 'Т. I гл. 17' },
  { key: 'lesson_23', title: 'Повременная и сдельная заработная плата', chapter: 'Т. I гл. 18–19' },
  { key: 'lesson_24', title: 'Национальные различия заработной платы', chapter: 'Т. I гл. 20' },
  { key: 'lesson_25', title: 'Простое воспроизводство', chapter: 'Т. I гл. 21' },
  { key: 'lesson_26', title: 'Превращение прибавочной стоимости в капитал', chapter: 'Т. I гл. 22' },
  { key: 'lesson_27', title: 'Всеобщий закон капиталистического накопления', chapter: 'Т. I гл. 23' },
  { key: 'lesson_28', title: 'Первоначальное накопление и теория колонизации', chapter: 'Т. I гл. 24–25' },
];

export const ALL_LESSON_KEYS = LESSON_DEFINITIONS.map((l) => l.key);

export const LESSON_LABELS: Record<string, string> = Object.fromEntries(
  LESSON_DEFINITIONS.map((l) => [l.key, l.title])
);

export const LESSON_CHAPTERS: Record<string, string> = Object.fromEntries(
  LESSON_DEFINITIONS.filter((l) => l.chapter).map((l) => [l.key, l.chapter!])
);

/** Game unlock tiers mapped to Capital progression (canonical lesson_XX keys) */
export const LESSON_UNLOCK_TIERS = {
  basic_enterprises: ['lesson_03', 'lesson_04'],
  trade_and_money: ['lesson_06', 'lesson_07'],
  surplus_value: ['lesson_10', 'lesson_11', 'lesson_12', 'lesson_13'],
  manufacture: ['lesson_17', 'lesson_18'],
  machinery: ['lesson_19', 'lesson_21'],
  accumulation: ['lesson_25', 'lesson_26', 'lesson_27'],
  imperialism: ['lesson_22', 'lesson_23', 'lesson_24'],
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
