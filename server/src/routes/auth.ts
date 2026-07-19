import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { StepikService } from '../services/stepikService';
import { UserModel } from '../models/UserModel';
import { logger } from '../utils/logger';

const router = Router();
const stepikService = new StepikService();
const userModel = new UserModel();
const isProd = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';

const cookieOptions = (maxAge: number, sameSite: 'strict' | 'lax' = 'strict'): { httpOnly: true; secure: boolean; sameSite: 'strict' | 'lax'; maxAge: number; path: string } => ({
  httpOnly: true,
  secure: isProd,
  sameSite,
  maxAge,
  path: '/',
});

// Stepik OAuth login
router.get('/stepik', asyncHandler(async (req, res) => {
  let authUrl: string;
  try {
    const { state, codeVerifier, codeChallenge } = stepikService.generateOAuthState();
    res.cookie('stepik_state', state, cookieOptions(5 * 60 * 1000, 'lax'));
    res.cookie('stepik_pkce', codeVerifier, cookieOptions(5 * 60 * 1000, 'lax'));
    authUrl = stepikService.getAuthUrl(state, codeChallenge);
  } catch (e: any) {
    if (e.message && e.message.includes('not configured')) {
      res.status(503).json({ error: 'Stepik OAuth not configured. Set STEPIK_CLIENT_ID in server/.env' });
      return;
    }
    throw e;
  }
  res.redirect(authUrl);
}));

// Stepik OAuth callback — registered redirect_uri alias
router.get('/callback', asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies?.stepik_state;
  const codeVerifier = req.cookies?.stepik_pkce;

  if (!code || !state || state !== storedState) {
    res.redirect(`${frontendUrl}/login?error=invalid_state`);
    return;
  }

  res.clearCookie('stepik_state', { path: '/', httpOnly: true, secure: isProd, sameSite: 'lax' });
  res.clearCookie('stepik_pkce', { path: '/', httpOnly: true, secure: isProd, sameSite: 'lax' });

  try {
    const authResult = await stepikService.authenticate(code as string, codeVerifier);
    const dbUser = userModel.findOrCreateByStepik(authResult.stepikUser);
    stepikService.storeUserTokens(
      dbUser.id,
      authResult.stepikUser.id,
      authResult.accessToken,
      authResult.refreshToken,
      authResult.expiresIn
    );
    userModel.updateLastLogin(dbUser.id);
    const token = stepikService.generateToken(dbUser);
    res.cookie('auth_token', token, cookieOptions(7 * 24 * 60 * 60 * 1000));
    res.redirect(`${frontendUrl}/auth/callback`);
  } catch (error) {
    logger.error('Stepik authentication error:', error);
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
}));

// Stepik OAuth callback (legacy path)
router.get('/stepik/callback', asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies?.stepik_state;
  const codeVerifier = req.cookies?.stepik_pkce;

  if (!code || !state || state !== storedState) {
    throw createError('Authorization code or state is invalid', 400);
  }

  res.clearCookie('stepik_state', { path: '/', httpOnly: true, secure: isProd, sameSite: 'lax' });
  res.clearCookie('stepik_pkce', { path: '/', httpOnly: true, secure: isProd, sameSite: 'lax' });

  try {
    const authResult = await stepikService.authenticate(code as string, codeVerifier);
    const dbUser = userModel.findOrCreateByStepik(authResult.stepikUser);
    stepikService.storeUserTokens(
      dbUser.id,
      authResult.stepikUser.id,
      authResult.accessToken,
      authResult.refreshToken,
      authResult.expiresIn
    );
    userModel.updateLastLogin(dbUser.id);
    const token = stepikService.generateToken(dbUser);
    res.cookie('auth_token', token, cookieOptions(7 * 24 * 60 * 60 * 1000));
    res.redirect(`${frontendUrl}/auth/callback`);
  } catch (error) {
    logger.error('Stepik authentication error:', error);
    throw createError('Authentication failed', 401);
  }
}));

// Demo / dev login — issues a token for a test user without Stepik (disabled in production)
router.get('/dev-login', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Demo login is disabled in production' });
    return;
  }

  const demoUser = {
    id: 999999,
    email: 'demo@thinkred.local',
    first_name: 'Демо',
    last_name: 'Игрок',
    is_active: true,
    level: '',
    join_date: new Date().toISOString(),
    last_login: new Date().toISOString(),
    city: '',
    country: '',
  };

  // Find or create demo user in database
  const dbUser = userModel.findOrCreateByStepik({
    id: demoUser.id,
    email: demoUser.email,
    first_name: demoUser.first_name,
    last_name: demoUser.last_name,
  });

  const token = stepikService.generateToken(dbUser);
  res.cookie('auth_token', token, cookieOptions(7 * 24 * 60 * 60 * 1000));
  res.redirect(`${frontendUrl}/auth/callback`);
}));

// Verify token and get user info
router.get('/verify', asyncHandler(async (req, res) => {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw createError('Token is required', 401);
  }

  try {
    const decoded = stepikService.verifyToken(token);
    const dbUser = userModel.findByStepikId(decoded.userId) || userModel.findById(decoded.userId);
    if (!dbUser || !dbUser.is_active) {
      throw createError('User not found or inactive', 401);
    }

    const user = {
      id: dbUser.id,
      email: dbUser.email,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      is_active: dbUser.is_active === 1,
      level: String(dbUser.level),
      join_date: dbUser.created_at,
      last_login: dbUser.last_login,
      city: '',
      country: '',
    };

    res.json({ user, valid: true });
  } catch (error) {
    throw createError('Invalid token', 401);
  }
}));

// Logout
router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace('Bearer ', '');

  res.clearCookie('auth_token', { path: '/', httpOnly: true, secure: isProd, sameSite: 'strict' });

  if (token) {
    stepikService.revokeToken(token);
  }

  res.json({ message: 'Logged out successfully' });
}));

export { router as authRoutes };
