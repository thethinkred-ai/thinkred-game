import { PeriodProgressionService } from '../services/periodProgression';
import { UserModel } from '../models/UserModel';
import { EnterpriseModel } from '../models/EnterpriseModel';
import { initDatabase } from '../database';

describe('PeriodProgressionService', () => {
  let service: PeriodProgressionService;
  let userId: number;

  beforeAll(async () => {
    await initDatabase();
  });

  beforeEach(() => {
    service = new PeriodProgressionService();
    const userModel = new UserModel();
    const user = userModel.create({
      stepik_id: 900001 + Math.floor(Math.random() * 100000),
      first_name: 'Test',
      last_name: 'User',
      email: `period_${Date.now()}@test.local`,
    });
    userId = user.id;
  });

  it('returns feudalism as initial period with next early_capitalism', () => {
    const status = service.getPeriodStatus(userId);
    expect(status).not.toBeNull();
    expect(status!.currentPeriod).toBe('feudalism');
    expect(status!.nextPeriod).toBe('early_capitalism');
    expect(status!.canAdvance).toBe(false);
    expect(status!.conditions.length).toBeGreaterThan(0);
  });

  it('allows advancement when level, XP and enterprise requirements are met', () => {
    const userModel = new UserModel();
    userModel.updateProgress(userId, { level: 2, experience: 50 });

    const enterpriseModel = new EnterpriseModel();
    enterpriseModel.create({
      id: 'ent-period-1',
      owner_id: userId,
      name: 'Test Manufactory',
      type: 'manufactory',
      location: 'Moscow',
      production: 100,
      costs_materials: 50,
      costs_overhead: 10,
      costs_depreciation: 5,
      created_period: 'feudalism',
    });

    const status = service.getPeriodStatus(userId);
    expect(status!.canAdvance).toBe(true);

    const result = service.advancePeriod(userId);
    expect(result.advanced).toBe(true);
    expect(result.newPeriod).toBe('early_capitalism');

    const after = service.getPeriodStatus(userId);
    expect(after!.currentPeriod).toBe('early_capitalism');
  });

  it('rejects advancement when conditions are not met', () => {
    const result = service.advancePeriod(userId);
    expect(result.advanced).toBe(false);
    expect(result.newPeriod).toBeNull();
    expect(result.message).toContain('Conditions not met');
  });

  it('reports final period when at communism', () => {
    const userModel = new UserModel();
    userModel.updateProgress(userId, { current_period: 'communism' });

    const status = service.getPeriodStatus(userId);
    expect(status!.nextPeriod).toBeNull();
    expect(status!.canAdvance).toBe(false);
    expect(status!.overallProgress).toBe(1);
  });
});
