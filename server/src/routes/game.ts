import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';
import { GameService } from '../services/gameService';
import { PeriodProgressionService } from '../services/periodProgression';

const router = Router();
const gameService = new GameService();
const periodService = new PeriodProgressionService();

// Get game state for user
router.get('/state', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const gameState = await gameService.getGameState(userId);
  res.json(gameState);
}));

// Get user's enterprises
router.get('/enterprises', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const enterprises = await gameService.getUserEnterprises(userId);
  res.json(enterprises);
}));

// Create new enterprise
router.post('/enterprises', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { name, type, location } = req.body;
  
  if (!userId || !name || !type || !location) {
    throw createError('Missing required fields', 400);
  }

  const enterprise = await gameService.createEnterprise(userId, {
    name,
    type,
    location,
  });

  res.status(201).json(enterprise);
}));

// Update enterprise
router.put('/enterprises/:id', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const enterpriseId = req.params.id;
  const updates = req.body;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const enterprise = await gameService.updateEnterprise(userId, enterpriseId, updates);
  res.json(enterprise);
}));

// Delete enterprise
router.delete('/enterprises/:id', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const enterpriseId = req.params.id;

  if (!userId) {
    throw createError('User ID is required', 400);
  }

  await gameService.deleteEnterprise(userId, enterpriseId);
  res.json({ success: true });
}));

// Make decision for enterprise
router.post('/enterprises/:id/decisions', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const enterpriseId = req.params.id;
  const { type, value } = req.body;
  
  if (!userId || !type || value === undefined) {
    throw createError('Missing required fields', 400);
  }

  const decision = await gameService.makeDecision(userId, enterpriseId, {
    enterpriseId,
    type,
    value,
    expectedImpact: {
      profitChange: 0,
      surplusValueChange: 0,
      workerSatisfactionChange: 0,
      marketShareChange: 0,
      technologyChange: 0,
    },
    timestamp: Date.now(),
  });

  res.status(201).json(decision);
}));

// Get current events for user
router.get('/events', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const events = await gameService.getCurrentEvents(userId);
  res.json(events);
}));

// Respond to event
router.post('/events/:id/respond', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const eventId = req.params.id;
  const { choiceId } = req.body;
  
  if (!userId || !choiceId) {
    throw createError('Missing required fields', 400);
  }

  const result = await gameService.respondToEvent(userId, eventId, choiceId);
  res.json(result);
}));

// Get economic indicators
router.get('/economy', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const indicators = await gameService.getEconomicIndicators(userId);
  res.json(indicators);
}));

router.get('/economy/history', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('User ID is required', 400);
  }
  const history = await gameService.getEconomicHistory(userId);
  res.json(history);
}));

// Get market state
router.get('/market', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const marketState = await gameService.getMarketState(userId);
  res.json(marketState);
}));

// Get user progress and achievements
router.get('/progress', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const progress = await gameService.getUserProgress(userId);
  res.json(progress);
}));

// Get available enterprise types for user
router.get('/enterprise-types', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const types = await gameService.getAvailableEnterpriseTypes(userId);
  res.json(types);
}));

// Period progression
router.get('/period-status', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const status = periodService.getPeriodStatus(userId);
  if (!status) {
    throw createError('User not found', 404);
  }

  res.json(status);
}));

router.post('/advance-period', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const result = periodService.advancePeriod(userId);
  res.json(result);
}));

// Decision cooldown
router.get('/cooldown', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const cooldown = gameService.getDecisionCooldown(userId);
  res.json(cooldown);
}));

// Events history
router.get('/events/history', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const { EventModel } = await import('../models/EventModel');
  const eventModel = new EventModel();
  const resolved = eventModel.findResolvedByUser(userId);
  res.json(resolved);
}));

// Enterprise map — all enterprises by period (visible to all players)
router.get('/map', asyncHandler(async (req, res) => {
  const { period } = req.query;
  const map = gameService.getEnterpriseMap(period as string | undefined);
  res.json(map);
}));

// Simulate market (admin endpoint)
router.post('/simulate-market', requireAdmin, asyncHandler(async (req, res) => {
  const { rounds = 1 } = req.body;
  
  const results = await gameService.simulateMarket(rounds);
  res.json(results);
}));

export { router as gameRoutes };
