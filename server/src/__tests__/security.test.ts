import { StepikService } from '../services/stepikService';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-tests-only';

describe('Security: JWT contains no PII', () => {
  const service = new StepikService();

  it('generateToken payload contains only userId and jti', () => {
    const token = service.generateToken({ id: 42 });
    const decoded = jwt.decode(token) as Record<string, any>;
    expect(decoded.userId).toBe(42);
    expect(decoded.jti).toBeDefined();
    expect(decoded.email).toBeUndefined();
    expect(decoded.name).toBeUndefined();
  });

  it('verifyToken returns userId and jti', () => {
    const token = service.generateToken({ id: 42 });
    const verified = service.verifyToken(token);
    expect(verified.userId).toBe(42);
    expect(verified.jti).toBeDefined();
  });
});

describe('Security: logger sanitizes secrets', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('redacts Authorization header strings', () => {
    logger.error('Request failed', 'Authorization: Bearer eyJ.secret.token');
    expect(spy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Authorization: Bearer [REDACTED]'),
    );
  });

  it('redacts object keys containing secrets', () => {
    logger.error('Request failed', { authorization: 'Bearer abc', body: { foo: 1 } });
    expect(spy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ authorization: '[REDACTED]' }),
    );
  });
});
