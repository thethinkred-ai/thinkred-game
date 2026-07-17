import { StepikService } from '../services/stepikService';

describe('StepikService', () => {
  const service = new StepikService();

  describe('isEnterpriseUnlocked', () => {
    it('returns true when no unlock conditions', () => {
      expect(service.isEnterpriseUnlocked([], ['lesson_1'])).toBe(true);
    });

    it('returns true when all required lessons completed', () => {
      expect(service.isEnterpriseUnlocked(['lesson_1', 'lesson_2'], ['lesson_1', 'lesson_2', 'lesson_3'])).toBe(true);
    });

    it('returns false when a required lesson is missing', () => {
      expect(service.isEnterpriseUnlocked(['lesson_3', 'lesson_5'], ['lesson_1'])).toBe(false);
    });
  });
});
