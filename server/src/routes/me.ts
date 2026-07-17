import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { UserModel } from '../models/UserModel';

const router = Router();
const userModel = new UserModel();

// Export user's personal data (GDPR / 152-FЗ)
router.get('/export', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const data = userModel.exportData(userId);
  res.json(data);
}));

// Delete account and all associated data
router.delete('/', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  userModel.deleteById(userId);
  res.clearCookie('auth_token', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ message: 'Account and data deleted' });
}));

export { router as meRoutes };
