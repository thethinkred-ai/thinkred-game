import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { StepikService } from '../services/stepikService';
import { logger } from '../utils/logger';

const router = Router();
const stepikService = new StepikService();

// Get user's Stepik profile
router.get('/profile', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  try {
    const tokens = await stepikService.getUserTokens(userId);
    if (!tokens) {
      throw createError('User not authenticated with Stepik', 401);
    }

    const response = await stepikService['apiClient'].get('/stepics/1', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const profile = response.data.users[0];
    res.json(profile);
  } catch (error) {
    logger.error('Error getting Stepik profile:', error);
    throw createError('Failed to get Stepik profile', 500);
  }
}));

// Get user's courses
router.get('/courses', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  try {
    const tokens = await stepikService.getUserTokens(userId);
    if (!tokens) {
      throw createError('User not authenticated with Stepik', 401);
    }

    const response = await stepikService['apiClient'].get('/courses', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
      params: {
        owner: userId,
      },
    });

    res.json(response.data.courses);
  } catch (error) {
    logger.error('Error getting Stepik courses:', error);
    throw createError('Failed to get Stepik courses', 500);
  }
}));

// Get course details
router.get('/courses/:courseId', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  const courseId = req.params.courseId;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  try {
    const tokens = await stepikService.getUserTokens(userId);
    if (!tokens) {
      throw createError('User not authenticated with Stepik', 401);
    }

    const response = await stepikService['apiClient'].get(`/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    res.json(response.data.courses[0]);
  } catch (error) {
    logger.error('Error getting course details:', error);
    throw createError('Failed to get course details', 500);
  }
}));

// Get course sections
router.get('/courses/:courseId/sections', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  const courseId = req.params.courseId;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  try {
    const tokens = await stepikService.getUserTokens(userId);
    if (!tokens) {
      throw createError('User not authenticated with Stepik', 401);
    }

    const response = await stepikService['apiClient'].get('/sections', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
      params: {
        course: courseId,
      },
    });

    res.json(response.data.sections);
  } catch (error) {
    logger.error('Error getting course sections:', error);
    throw createError('Failed to get course sections', 500);
  }
}));

// Get lessons in section
router.get('/sections/:sectionId/lessons', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  const sectionId = req.params.sectionId;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  try {
    const tokens = await stepikService.getUserTokens(userId);
    if (!tokens) {
      throw createError('User not authenticated with Stepik', 401);
    }

    const response = await stepikService['apiClient'].get('/units', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
      params: {
        section: sectionId,
      },
    });

    // Get lessons for each unit
    const lessonIds = response.data.units.map((unit: any) => unit.lesson);
    const lessonsResponse = await stepikService['apiClient'].get('/lessons', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
      params: {
        ids: lessonIds.join(','),
      },
    });

    res.json(lessonsResponse.data.lessons);
  } catch (error) {
    logger.error('Error getting lessons:', error);
    throw createError('Failed to get lessons', 500);
  }
}));

// Get steps in lesson
router.get('/lessons/:lessonId/steps', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  const lessonId = req.params.lessonId;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  try {
    const tokens = await stepikService.getUserTokens(userId);
    if (!tokens) {
      throw createError('User not authenticated with Stepik', 401);
    }

    const response = await stepikService['apiClient'].get(`/lessons/${lessonId}`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const lesson = response.data.lessons[0];
    const stepsResponse = await stepikService['apiClient'].get('/steps', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
      params: {
        lesson: lessonId,
      },
    });

    res.json({
      lesson,
      steps: stepsResponse.data.steps,
    });
  } catch (error) {
    logger.error('Error getting steps:', error);
    throw createError('Failed to get steps', 500);
  }
}));

// Get user progress for course
router.get('/courses/:courseId/progress', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  const courseId = req.params.courseId;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  try {
    const progress = await stepikService.getProgress(userId);
    res.json(progress);
  } catch (error) {
    logger.error('Error getting course progress:', error);
    throw createError('Failed to get course progress', 500);
  }
}));

// Submit step attempt
router.post('/steps/:stepId/attempts', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  const stepId = req.params.stepId;
  const { answer } = req.body;
  
  if (!userId || !answer) {
    throw createError('User ID and answer are required', 400);
  }

  try {
    const tokens = await stepikService.getUserTokens(userId);
    if (!tokens) {
      throw createError('User not authenticated with Stepik', 401);
    }

    const response = await stepikService['apiClient'].post(`/attempts`, {
      step: stepId,
      session: tokens.access_token,
      answer,
    }, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    logger.error('Error submitting attempt:', error);
    throw createError('Failed to submit attempt', 500);
  }
}));

// Get step submissions
router.get('/steps/:stepId/submissions', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  const stepId = req.params.stepId;
  
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  try {
    const tokens = await stepikService.getUserTokens(userId);
    if (!tokens) {
      throw createError('User not authenticated with Stepik', 401);
    }

    const response = await stepikService['apiClient'].get('/submissions', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
      params: {
        step: stepId,
        user: userId,
        order: '-datetime',
      },
    });

    res.json(response.data.submissions);
  } catch (error) {
    logger.error('Error getting submissions:', error);
    throw createError('Failed to get submissions', 500);
  }
}));

// Sync game progress with Stepik
router.post('/sync-progress', asyncHandler(async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'] as string);
  const { gameProgress } = req.body;
  
  if (!userId || !gameProgress) {
    throw createError('User ID and game progress are required', 400);
  }

  try {
    await stepikService.updateProgress(userId, gameProgress);
    res.json({ message: 'Progress synced successfully' });
  } catch (error) {
    logger.error('Error syncing progress:', error);
    throw createError('Failed to sync progress', 500);
  }
}));

export { router as stepikRoutes };
