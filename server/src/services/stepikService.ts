import axios, { AxiosInstance } from 'axios';
import * as jwt from 'jsonwebtoken';
import { randomUUID, createHash } from 'crypto';
import { StepikUser, GameProgress, StepikProgress } from '../../../shared/types';
import { STEPIK_CONFIG, GAME_CONSTANTS } from '../../../shared/constants/game';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { StepikTokenModel } from '../models/StepikTokenModel';
import { ProgressLogModel } from '../models/ProgressLogModel';
import { UserModel } from '../models/UserModel';
import { getStepikCourseId, getStepikLessonMap, isStepikConfigured } from '../utils/stepikConfig';

export interface StepikAuthResult {
  stepikUser: StepikUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class StepikService {
  private apiClient: AxiosInstance;
  private tokenModel = new StepikTokenModel();
  private progressLog = new ProgressLogModel();
  private userModel = new UserModel();

  constructor() {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key') {
      logger.warn('WARNING: JWT_SECRET is not set or using default value. Set a secure JWT_SECRET in server/.env');
    }

    this.apiClient = axios.create({
      baseURL: STEPIK_CONFIG.API_URL,
      timeout: GAME_CONSTANTS.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.apiClient.interceptors.request.use(
      (config) => {
        logger.debug(`Stepik API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Stepik API request error:', error);
        return Promise.reject(error);
      }
    );
  }

  generateOAuthState(): { state: string; codeVerifier: string; codeChallenge: string } {
    const state = randomUUID();
    const codeVerifier = randomUUID() + randomUUID();
    const codeChallenge = Buffer.from(
      createHash('sha256').update(codeVerifier).digest()
    )
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return { state, codeVerifier, codeChallenge };
  }

  getAuthUrl(state: string, codeChallenge: string): string {
    const clientId = process.env.STEPIK_CLIENT_ID || STEPIK_CONFIG.CLIENT_ID;
    if (!clientId) {
      throw new Error('STEPIK_CLIENT_ID is not configured in server/.env');
    }
    const redirectUri = process.env.STEPIK_REDIRECT_URI || STEPIK_CONFIG.REDIRECT_URI;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: STEPIK_CONFIG.SCOPES.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${STEPIK_CONFIG.OAUTH_URL}/authorize/?${params.toString()}`;
  }

  async authenticate(code: string, codeVerifier?: string): Promise<StepikAuthResult> {
    try {
      const clientId = process.env.STEPIK_CLIENT_ID || STEPIK_CONFIG.CLIENT_ID;
      const clientSecret = process.env.STEPIK_CLIENT_SECRET || STEPIK_CONFIG.CLIENT_SECRET;
      const redirectUri = process.env.STEPIK_REDIRECT_URI || STEPIK_CONFIG.REDIRECT_URI;

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      });
      if (codeVerifier) {
        body.append('code_verifier', codeVerifier);
      }

      const tokenResponse = await axios.post(
        `${STEPIK_CONFIG.OAUTH_URL}/token/`,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: clientId,
            password: clientSecret,
          },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      const userResponse = await this.apiClient.get('/stepics/1', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const stepikUser: StepikUser = userResponse.data.users[0];

      return {
        stepikUser,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in ?? 3600,
      };
    } catch (error) {
      logger.error('Stepik authentication error:', error);
      throw createError('Failed to authenticate with Stepik', 401);
    }
  }

  storeUserTokens(
    internalUserId: number,
    stepikId: number,
    accessToken: string,
    refreshToken: string,
    expiresIn = 3600
  ): void {
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    this.tokenModel.upsert({
      user_id: internalUserId,
      stepik_id: stepikId,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    });
    logger.info(`Stored Stepik tokens for internal user ${internalUserId}`);
  }

  async getUserTokens(internalUserId: number): Promise<{ access_token: string; refresh_token: string } | null> {
    const row = this.tokenModel.findByUserId(internalUserId);
    if (!row) {
      return null;
    }

    const expiresAt = new Date(row.expires_at).getTime();
    if (Date.now() >= expiresAt - 60_000) {
      try {
        const newAccessToken = await this.refreshAndStore(internalUserId, row.refresh_token);
        return { access_token: newAccessToken, refresh_token: row.refresh_token };
      } catch {
        return null;
      }
    }

    return { access_token: row.access_token, refresh_token: row.refresh_token };
  }

  private async refreshAndStore(internalUserId: number, refreshToken: string): Promise<string> {
    const clientId = process.env.STEPIK_CLIENT_ID || STEPIK_CONFIG.CLIENT_ID;
    const clientSecret = process.env.STEPIK_CLIENT_SECRET || STEPIK_CONFIG.CLIENT_SECRET;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await axios.post(
      `${STEPIK_CONFIG.OAUTH_URL}/token/`,
      body.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: { username: clientId, password: clientSecret },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const row = this.tokenModel.findByUserId(internalUserId);
    if (row) {
      this.storeUserTokens(
        internalUserId,
        row.stepik_id,
        access_token,
        refresh_token ?? refreshToken,
        expires_in ?? 3600
      );
    }

    return access_token;
  }

  private getStepikId(internalUserId: number): number | null {
    const user = this.userModel.findById(internalUserId);
    return user?.stepik_id ?? null;
  }

  async getAccessToken(internalUserId: number): Promise<string | null> {
    const tokens = await this.getUserTokens(internalUserId);
    return tokens?.access_token ?? null;
  }

  async getProgress(internalUserId: number, courseId?: number): Promise<StepikProgress | null> {
    try {
      const accessToken = await this.getAccessToken(internalUserId);
      const stepikId = this.getStepikId(internalUserId);
      if (!accessToken || !stepikId) {
        return null;
      }

      const targetCourseId = courseId || getStepikCourseId();
      const response = await this.apiClient.get('/progresses', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          user: stepikId,
          course: targetCourseId || undefined,
        },
      });

      return response.data.progresses?.[0] ?? null;
    } catch (error) {
      logger.error('Error getting Stepik progress:', error);
      return null;
    }
  }

  async getCompletedLessons(internalUserId: number): Promise<string[]> {
    const devUnlockAll = process.env.DEV_UNLOCK_ALL_LESSONS === 'true';
    if (process.env.NODE_ENV !== 'production' && devUnlockAll) {
      const map = getStepikLessonMap();
      return Object.keys(map).length > 0 ? Object.keys(map) : [];
    }

    if (!isStepikConfigured()) {
      logger.warn('Stepik not configured: set STEPIK_COURSE_ID in server/.env');
      return [];
    }

    if (process.env.NODE_ENV !== 'production') {
      const tokens = await this.getUserTokens(internalUserId);
      if (!tokens) {
        return [];
      }
    }

    const accessToken = await this.getAccessToken(internalUserId);
    const stepikId = this.getStepikId(internalUserId);
    const lessonMap = getStepikLessonMap();
    const lessonIds = Object.values(lessonMap).filter((id) => id > 0);

    if (!accessToken || !stepikId || lessonIds.length === 0) {
      return [];
    }

    const completed: string[] = [];

    try {
      const progress = await this.getProgress(internalUserId);
      if (progress?.is_passed) {
        return Object.keys(lessonMap);
      }

      for (const [lessonKey, lessonId] of Object.entries(lessonMap)) {
        if (lessonId <= 0) continue;

        const lessonResponse = await this.apiClient.get(`/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const lesson = lessonResponse.data.lessons?.[0];
        if (lesson?.progress === 'passed' || lesson?.progress === 'completed') {
          completed.push(lessonKey);
          continue;
        }

        const submissionsResponse = await this.apiClient.get('/submissions', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            user: stepikId,
            lesson: lessonId,
            order: '-datetime',
          },
        });

        const submissions = submissionsResponse.data.submissions ?? [];
        const hasCorrect = submissions.some((s: { status?: string }) => s.status === 'correct');
        if (hasCorrect) {
          completed.push(lessonKey);
        }
      }
    } catch (error) {
      logger.error('Error fetching completed lessons:', error);
    }

    return completed;
  }

  async getCourseStructure(internalUserId: number, courseId?: number) {
    const accessToken = await this.getAccessToken(internalUserId);
    const targetCourseId = courseId || getStepikCourseId();

    if (!accessToken || !targetCourseId) {
      return { course: null, sections: [], lessons: [] };
    }

    const [courseRes, sectionsRes] = await Promise.all([
      this.apiClient.get(`/courses/${targetCourseId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      this.apiClient.get('/sections', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { course: targetCourseId },
      }),
    ]);

    const sections = sectionsRes.data.sections ?? [];
    const lessons: unknown[] = [];

    for (const section of sections) {
      const unitsRes = await this.apiClient.get('/units', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { section: section.id },
      });
      const lessonIds = (unitsRes.data.units ?? []).map((u: { lesson: number }) => u.lesson);
      if (lessonIds.length === 0) continue;

      const lessonsRes = await this.apiClient.get('/lessons', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { ids: lessonIds.join(',') },
      });
      lessons.push(...(lessonsRes.data.lessons ?? []));
    }

    return {
      course: courseRes.data.courses?.[0] ?? null,
      sections,
      lessons,
    };
  }

  isEnterpriseUnlocked(unlockConditions: readonly string[], completedLessons: string[]): boolean {
    if (unlockConditions.length === 0) return true;
    return unlockConditions.every((lesson) => completedLessons.includes(lesson));
  }

  async updateProgress(internalUserId: number, gameProgress: GameProgress): Promise<void> {
    this.progressLog.log(internalUserId, 'game_progress_sync', {
      level: gameProgress.gameProgress.level,
      experience: gameProgress.gameProgress.experience,
      currentPeriod: gameProgress.gameProgress.currentPeriod,
      achievements: gameProgress.gameProgress.achievements,
    });

    logger.info(`Game progress logged for user ${internalUserId}`);

    await this.submitProgressToStepik(internalUserId, gameProgress);
  }

  private async submitProgressToStepik(internalUserId: number, _gameProgress: GameProgress): Promise<void> {
    const accessToken = await this.getAccessToken(internalUserId);
    const courseId = getStepikCourseId();
    if (!accessToken || !courseId) return;

    try {
      await this.apiClient.post(
        '/progresses',
        { progress: { course: courseId, user: internalUserId } },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch {
      // Stepik doesn't support POST /progresses — this is best-effort
    }
  }

  async checkLessonAccess(internalUserId: number, lessonId: number): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken(internalUserId);
      if (!accessToken) {
        return false;
      }

      const response = await this.apiClient.get(`/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data.lessons?.[0]?.is_public ?? false;
    } catch (error) {
      logger.error('Error checking lesson access:', error);
      return false;
    }
  }

  generateToken(user: { id: number }): string {
    const jti = randomUUID();
    return jwt.sign(
      {
        userId: user.id,
        jti,
      },
      process.env.JWT_SECRET || '',
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): { userId: number; jti: string } {
    try {
      const secret = process.env.JWT_SECRET || '';
      const decoded = jwt.verify(token, secret) as { userId: number; jti?: string };
      return {
        userId: decoded.userId,
        jti: decoded.jti || '',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`verifyToken failed: ${message}`);
      throw createError('Invalid token', 401);
    }
  }

  revokeToken(token: string): void {
    try {
      const decoded = jwt.decode(token) as { userId?: number } | null;
      if (decoded?.userId) {
        this.tokenModel.deleteByUserId(decoded.userId);
      }
      logger.info(`Token revoked for user ${decoded?.userId}`);
    } catch (error) {
      logger.error('Error revoking token:', error);
    }
  }

  getApiClient(): AxiosInstance {
    return this.apiClient;
  }
}
