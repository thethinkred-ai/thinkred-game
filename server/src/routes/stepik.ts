import { Router, Request } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { StepikService } from '../services/stepikService';
import { UserModel } from '../models/UserModel';
import { getStepikCourseId } from '../utils/stepikConfig';

const router = Router();
const stepikService = new StepikService();
const userModel = new UserModel();

function getInternalUserId(req: Request): number {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('Authentication required', 401);
  }
  return userId;
}

function getStepikIdForUser(internalUserId: number): number {
  const user = userModel.findById(internalUserId);
  if (!user?.stepik_id) {
    throw createError('User not linked to Stepik', 400);
  }
  return user.stepik_id;
}

// Get user's Stepik profile
router.get('/profile', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);

  const tokens = await stepikService.getUserTokens(internalUserId);
  if (!tokens) {
    throw createError('User not authenticated with Stepik', 401);
  }

  const response = await stepikService.getApiClient().get('/stepics/1', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  res.json(response.data.users[0]);
}));

// Get configured course with structure
router.get('/course', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const courseId = parseInt(req.query.courseId as string, 10) || getStepikCourseId();
  const completedLessons = await stepikService.getCompletedLessons(internalUserId);
  const structure = await stepikService.getCourseStructure(internalUserId, courseId || undefined);

  res.json({
    courseId,
    completedLessons,
    ...structure,
  });
}));

// Get user's courses
router.get('/courses', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const stepikId = getStepikIdForUser(internalUserId);
  const tokens = await stepikService.getUserTokens(internalUserId);
  if (!tokens) {
    throw createError('User not authenticated with Stepik', 401);
  }

  const response = await stepikService.getApiClient().get('/courses', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    params: { owner: stepikId },
  });

  res.json(response.data.courses);
}));

router.get('/courses/:courseId', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const tokens = await stepikService.getUserTokens(internalUserId);
  if (!tokens) {
    throw createError('User not authenticated with Stepik', 401);
  }

  const response = await stepikService.getApiClient().get(`/courses/${req.params.courseId}`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  res.json(response.data.courses[0]);
}));

router.get('/courses/:courseId/sections', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const tokens = await stepikService.getUserTokens(internalUserId);
  if (!tokens) {
    throw createError('User not authenticated with Stepik', 401);
  }

  const response = await stepikService.getApiClient().get('/sections', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    params: { course: req.params.courseId },
  });

  res.json(response.data.sections);
}));

router.get('/sections/:sectionId/lessons', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const tokens = await stepikService.getUserTokens(internalUserId);
  if (!tokens) {
    throw createError('User not authenticated with Stepik', 401);
  }

  const unitsResponse = await stepikService.getApiClient().get('/units', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    params: { section: req.params.sectionId },
  });

  const lessonIds = unitsResponse.data.units.map((unit: { lesson: number }) => unit.lesson);
  if (lessonIds.length === 0) {
    res.json([]);
    return;
  }

  const lessonsResponse = await stepikService.getApiClient().get('/lessons', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    params: { ids: lessonIds.join(',') },
  });

  res.json(lessonsResponse.data.lessons);
}));

router.get('/lessons/:lessonId/steps', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const tokens = await stepikService.getUserTokens(internalUserId);
  if (!tokens) {
    throw createError('User not authenticated with Stepik', 401);
  }

  const lessonResponse = await stepikService.getApiClient().get(`/lessons/${req.params.lessonId}`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const stepsResponse = await stepikService.getApiClient().get('/steps', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    params: { lesson: req.params.lessonId },
  });

  res.json({
    lesson: lessonResponse.data.lessons[0],
    steps: stepsResponse.data.steps,
  });
}));

router.get('/courses/:courseId/progress', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const courseId = parseInt(req.params.courseId, 10);
  const progress = await stepikService.getProgress(internalUserId, courseId);
  const completedLessons = await stepikService.getCompletedLessons(internalUserId);
  res.json({ progress, completedLessons });
}));

router.get('/completed-lessons', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const completedLessons = await stepikService.getCompletedLessons(internalUserId);
  res.json({ completedLessons });
}));

router.post('/steps/:stepId/attempts', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const { answer } = req.body;
  if (!answer) {
    throw createError('Answer is required', 400);
  }

  const tokens = await stepikService.getUserTokens(internalUserId);
  if (!tokens) {
    throw createError('User not authenticated with Stepik', 401);
  }

  const response = await stepikService.getApiClient().post('/attempts', {
    step: req.params.stepId,
    session: tokens.access_token,
    answer,
  }, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  res.json(response.data);
}));

router.get('/steps/:stepId/submissions', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const stepikId = getStepikIdForUser(internalUserId);
  const tokens = await stepikService.getUserTokens(internalUserId);
  if (!tokens) {
    throw createError('User not authenticated with Stepik', 401);
  }

  const response = await stepikService.getApiClient().get('/submissions', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    params: {
      step: req.params.stepId,
      user: stepikId,
      order: '-datetime',
    },
  });

  res.json(response.data.submissions);
}));

router.post('/sync-progress', asyncHandler(async (req, res) => {
  const internalUserId = getInternalUserId(req);
  const { gameProgress } = req.body;
  if (!gameProgress) {
    throw createError('Game progress is required', 400);
  }

  await stepikService.updateProgress(internalUserId, gameProgress);
  res.json({ message: 'Progress synced successfully' });
}));

export { router as stepikRoutes };
