import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';
import { StepikUser, GameProgress, StepikProgress } from '../../../shared/types';
import { STEPIK_CONFIG } from '../../../shared/constants/game';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export class StepikService {
  private apiClient: AxiosInstance;
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || '';
    
    if (!this.jwtSecret || this.jwtSecret === 'your-secret-key' || this.jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
      logger.warn('WARNING: JWT_SECRET is not set or using default value. Set a secure JWT_SECRET in server/.env');
    }
    
    this.apiClient = axios.create({
      baseURL: STEPIK_CONFIG.API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for Stepik API
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

  getAuthUrl(_redirectUri?: string): string {
    const clientId = process.env.STEPIK_CLIENT_ID || STEPIK_CONFIG.CLIENT_ID;
    if (!clientId) {
      throw new Error('STEPIK_CLIENT_ID is not configured in server/.env');
    }
    // Always use the configured redirect URI so it matches what is registered
    // on Stepik, regardless of the origin the frontend was opened from.
    const redirectUri = process.env.STEPIK_REDIRECT_URI || STEPIK_CONFIG.REDIRECT_URI;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: STEPIK_CONFIG.SCOPES.join(' '),
    });

    return `${STEPIK_CONFIG.OAUTH_URL}/authorize/?${params.toString()}`;
  }

  async authenticate(code: string): Promise<StepikUser> {
    try {
      const clientId = process.env.STEPIK_CLIENT_ID || STEPIK_CONFIG.CLIENT_ID;
      const clientSecret = process.env.STEPIK_CLIENT_SECRET || STEPIK_CONFIG.CLIENT_SECRET;
      const redirectUri = process.env.STEPIK_REDIRECT_URI || STEPIK_CONFIG.REDIRECT_URI;

      // Exchange code for access token (OAuth token endpoint, form-encoded, Basic auth)
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      });

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

      const { access_token, refresh_token } = tokenResponse.data;

      // Get user info
      const userResponse = await this.apiClient.get('/stepics/1', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const user: StepikUser = userResponse.data.users[0];
      
      // Stepik may not return email for some OAuth scopes
      if (!user.email) {
        user.email = `stepik_${user.id}@thinkred.local`;
        logger.info(`Email not provided by Stepik, using fallback: ${user.email}`);
      }
      if (!user.first_name) {
        user.first_name = 'Пользователь';
      }
      if (!user.last_name) {
        user.last_name = String(user.id);
      }
      
      // Store tokens for future use
      await this.storeUserTokens(user.id, access_token, refresh_token);

      return user;
    } catch (error) {
      logger.error('Stepik authentication error:', error);
      throw createError('Failed to authenticate with Stepik', 401);
    }
  }

  async getProgress(userId: number): Promise<StepikProgress> {
    try {
      const tokens = await this.getUserTokens(userId);
      if (!tokens) {
        throw createError('User tokens not found', 401);
      }

      const response = await this.apiClient.get('/progresses', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
        params: {
          user: userId,
        },
      });

      return response.data.progresses[0] || null;
    } catch (error) {
      logger.error('Error getting Stepik progress:', error);
      throw createError('Failed to get progress from Stepik', 500);
    }
  }

  async updateProgress(userId: number, gameProgress: GameProgress): Promise<void> {
    try {
      // Store game progress in local database
      // This would typically save to PostgreSQL
      logger.info(`Updating game progress for user ${userId}:`, gameProgress);
      
      // Optionally sync with Stepik if needed
      // This could update custom Stepik progress fields
    } catch (error) {
      logger.error('Error updating game progress:', error);
      throw createError('Failed to update game progress', 500);
    }
  }

  async checkLessonAccess(userId: number, lessonId: number): Promise<boolean> {
    try {
      const tokens = await this.getUserTokens(userId);
      if (!tokens) {
        return false;
      }

      const response = await this.apiClient.get(`/lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      // Check if user has access to the lesson
      // This would typically check enrollment or course access
      return response.data.is_public || true;
    } catch (error) {
      logger.error('Error checking lesson access:', error);
      return false;
    }
  }

  generateToken(user: StepikUser): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: `${user.first_name} ${user.last_name}` 
      },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): StepikUser {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return {
        id: decoded.userId,
        email: decoded.email,
        first_name: decoded.name.split(' ')[0],
        last_name: decoded.name.split(' ')[1] || '',
        is_active: true,
        level: '',
        join_date: new Date().toISOString(),
        last_login: new Date().toISOString(),
        city: '',
        country: '',
      };
    } catch (error) {
      throw createError('Invalid token', 401);
    }
  }

  revokeToken(token: string): void {
    try {
      const decoded = jwt.decode(token) as any;
      // Remove token from storage
      // This would typically remove from database or Redis
      logger.info(`Token revoked for user ${decoded.userId}`);
    } catch (error) {
      logger.error('Error revoking token:', error);
    }
  }

  private async storeUserTokens(userId: number, accessToken: string, refreshToken: string): Promise<void> {
    // Store tokens in database or Redis
    // This is a placeholder for actual implementation
    logger.info(`Storing tokens for user ${userId}`);
  }

  public async getUserTokens(userId: number): Promise<{ access_token: string; refresh_token: string } | null> {
    // Retrieve tokens from database or Redis
    // This is a placeholder for actual implementation
    logger.info(`Retrieving tokens for user ${userId}`);
    return null;
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const response = await this.apiClient.post('/oauth2/token/', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: STEPIK_CONFIG.CLIENT_ID,
        client_secret: STEPIK_CONFIG.CLIENT_SECRET,
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw createError('Failed to refresh token', 401);
    }
  }
}
