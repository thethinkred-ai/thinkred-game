import { LESSON_EPISODES, getLessonEpisode } from '../utils/lessonEpisodes';
import { ALL_LESSON_KEYS } from '../../../shared/constants/stepikLessons';
import { normalizeLessonKey } from '../utils/stepikConfig';
import { normalizeCompletedLessons } from '../utils/stepikConfig';

const CANONICAL = new Set(ALL_LESSON_KEYS);
const VALID_PERIODS = new Set<string>([
  'feudalism', 'early_capitalism', 'industrial_revolution', 'monopoly_capitalism',
  'imperialism', 'modern_capitalism', 'socialism_transition', 'communism',
]);

describe('lessonEpisodes (кампания по «Капиталу»)', () => {
  it('покрывает все 28 игровых ключей уроков ровно по одному разу', () => {
    const keys = LESSON_EPISODES.map((e) => e.key);
    expect(keys.sort()).toEqual([...ALL_LESSON_KEYS].sort());
    expect(new Set(keys).size).toBe(ALL_LESSON_KEYS.length);
  });

  it('каждый эпизод валиден по структуре', () => {
    for (const ep of LESSON_EPISODES) {
      expect(ep.title.length).toBeGreaterThan(0);
      expect(ep.description.length).toBeGreaterThan(0);
      expect(VALID_PERIODS.has(ep.period)).toBe(true);
      expect(ep.choices.length).toBeGreaterThanOrEqual(2);
      const choiceIds = ep.choices.map((c) => c.id);
      expect(new Set(choiceIds).size).toBe(choiceIds.length);
    }
  });

  it('requiredKnowledge ссылается только на канонические ключи уроков', () => {
    for (const ep of LESSON_EPISODES) {
      for (const c of ep.choices) {
        for (const k of c.requiredKnowledge) {
          expect(normalizeLessonKey(k)).toBe(k); // уже канонический
          expect(CANONICAL.has(k)).toBe(true);
        }
      }
    }
  });

  it('полные пройденные уроки проходят нормализацию без потерь', () => {
    const normalized = normalizeCompletedLessons([...ALL_LESSON_KEYS]);
    expect(new Set(normalized).size).toBe(ALL_LESSON_KEYS.length);
  });

  it('getLessonEpisode ищет по ключу и отдаёт undefined для неизвестного', () => {
    expect(getLessonEpisode('lesson_14')?.key).toBe('lesson_14');
    expect(getLessonEpisode('lesson_99')).toBeUndefined();
  });
});
