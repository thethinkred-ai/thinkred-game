import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { StepikService } from '../services/stepikService';
import { UserModel } from '../models/UserModel';
import { logger } from '../utils/logger';

const router = Router();
const stepikService = new StepikService();
const userModel = new UserModel();

// Stepik OAuth login
router.get('/stepik', asyncHandler(async (req, res) => {
  const { redirect_uri } = req.query;
  
  if (!redirect_uri) {
    throw createError('Redirect URI is required', 400);
  }

  let authUrl: string;
  try {
    authUrl = stepikService.getAuthUrl(redirect_uri as string);
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
  const { code } = req.query;

  if (!code) {
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=missing_code`);
    return;
  }

  try {
    const stepikUser = await stepikService.authenticate(code as string);
    const dbUser = userModel.findOrCreateByStepik(stepikUser);
    userModel.updateLastLogin(dbUser.id);
    const token = stepikService.generateToken({ ...dbUser, id: dbUser.id } as any);
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/callback?token=${token}`);
  } catch (error) {
    logger.error('Stepik authentication error:', error);
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
}));

// Stepik OAuth callback (legacy path)
router.get('/stepik/callback', asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    throw createError('Authorization code is required', 400);
  }

  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  try {
    const stepikUser = await stepikService.authenticate(code as string);
    const dbUser = userModel.findOrCreateByStepik(stepikUser);
    userModel.updateLastLogin(dbUser.id);
    const token = stepikService.generateToken({ ...dbUser, id: dbUser.id } as any);
    
    res.redirect(`${frontendUrl}/callback?token=${token}`);
  } catch (error) {
    logger.error('Stepik authentication error:', error);
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
}));

// Demo / dev login — issues a token for a test user without Stepik
router.get('/dev-login', asyncHandler(async (req, res) => {
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

  const token = stepikService.generateToken({ ...demoUser, id: dbUser.id } as any);
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/callback?token=${token}`);
}));

// Verify token and get user info
router.get('/verify', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw createError('Token is required', 401);
  }

  try {
    const decoded = stepikService.verifyToken(token);
    const dbUser = userModel.findByStepikId(decoded.id) || userModel.findById(decoded.id);
    
    const user = dbUser ? {
      id: dbUser.id,
      email: dbUser.email,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      is_active: true,
      level: String(dbUser.level),
      join_date: dbUser.created_at,
      last_login: dbUser.last_login,
      city: '',
      country: '',
    } : decoded;

    res.json({ user, valid: true });
  } catch (error) {
    throw createError('Invalid token', 401);
  }
}));

// Logout
router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    stepikService.revokeToken(token);
  }
  
  res.json({ message: 'Logged out successfully' });
}));

export { router as authRoutes };
