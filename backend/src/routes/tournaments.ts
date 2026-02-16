import { Router } from 'express';
import { AuthRequest, requireRole } from '../middleware/auth';
import { supabase } from '../utils/supabase';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get all tournaments
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    // TODO: Implement when tournaments table is created
    // For now, return empty array
    res.json({
      tournaments: [],
      message: 'Tournaments feature coming soon'
    });
  } catch (error) {
    next(error);
  }
});

// Get tournament by ID
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Implement when tournaments table is created
    throw createError('Tournament not found', 404);
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Create tournament
router.post('/', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    // TODO: Implement when tournaments table is created
    const tournamentData = req.body;

    // Placeholder response
    res.status(201).json({
      message: 'Tournament creation feature coming soon',
      data: tournamentData
    });
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Update tournament
router.put('/:id', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // TODO: Implement when tournaments table is created
    throw createError('Tournament update feature coming soon', 501);
  } catch (error) {
    next(error);
  }
});

// Join tournament (students only)
router.post('/:id/join', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user is a student
    if (req.user!.role !== 'student') {
      throw createError('Only students can join tournaments', 403);
    }

    // TODO: Implement when tournament_participants table is created
    res.json({
      message: 'Tournament join feature coming soon'
    });
  } catch (error) {
    next(error);
  }
});

// Get tournament leaderboard
router.get('/:id/leaderboard', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Implement when tournament_results table is created
    res.json({
      leaderboard: [],
      message: 'Leaderboard feature coming soon'
    });
  } catch (error) {
    next(error);
  }
});

export default router;