import { Router } from 'express';
import { AuthRequest, requireRole } from '../middleware/auth';
import { supabase } from '../utils/supabase';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get all tasks (with filtering)
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { difficulty, category, page = 1, limit = 20 } = req.query;

    // TODO: Implement when tasks table is created
    // For now, return empty array
    res.json({
      tasks: [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        pages: 0
      },
      message: 'Tasks feature coming soon'
    });
  } catch (error) {
    next(error);
  }
});

// Get task by ID
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Implement when tasks table is created
    throw createError('Task not found', 404);
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Create task
router.post('/', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    // TODO: Implement when tasks table is created
    const taskData = req.body;

    // Placeholder response
    res.status(201).json({
      message: 'Task creation feature coming soon',
      data: taskData
    });
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Update task
router.put('/:id', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // TODO: Implement when tasks table is created
    throw createError('Task update feature coming soon', 501);
  } catch (error) {
    next(error);
  }
});

// Submit solution to task
router.post('/:id/submit', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { code, language } = req.body;
    const userId = req.user!.id;

    // TODO: Implement when task_submissions table is created
    // This would involve:
    // 1. Save submission
    // 2. Run code against test cases
    // 3. Evaluate result
    // 4. Update user progress

    res.json({
      message: 'Task submission feature coming soon',
      submission: {
        task_id: id,
        user_id: userId,
        code,
        language,
        status: 'pending'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's submissions for a task
router.get('/:id/submissions', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // TODO: Implement when task_submissions table is created
    res.json({
      submissions: [],
      message: 'Submissions feature coming soon'
    });
  } catch (error) {
    next(error);
  }
});

// Get user's progress on tasks
router.get('/progress', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // TODO: Implement when user_progress table is created
    res.json({
      progress: {
        total_solved: 0,
        total_attempted: 0,
        by_difficulty: {},
        recent_activity: []
      },
      message: 'Progress tracking feature coming soon'
    });
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Get task statistics
router.get('/:id/stats', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Implement when task_submissions table is created
    res.json({
      stats: {
        total_submissions: 0,
        success_rate: 0,
        average_attempts: 0,
        popular_languages: []
      },
      message: 'Task statistics feature coming soon'
    });
  } catch (error) {
    next(error);
  }
});

export default router;