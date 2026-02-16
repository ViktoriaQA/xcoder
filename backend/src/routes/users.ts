import { Router } from 'express';
import { AuthRequest, requireRole } from '../middleware/auth';
import { supabase } from '../utils/supabase';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get current user profile
router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw createError('Profile not found', 404);
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { nickname, avatar_url } = req.body;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        nickname,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw createError('Failed to update profile', 500);
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

// Get user role
router.get('/role', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { data: roleData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw createError('Role not found', 404);
    }

    res.json({ role: roleData.role });
  } catch (error) {
    next(error);
  }
});

// Admin: Get all users (paginated)
router.get('/', requireRole(['admin']), async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const { data: users, error, count } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles!inner(role)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw createError('Failed to fetch users', 500);
    }

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Update user role
router.put('/:userId/role', requireRole(['admin']), async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'trainer', 'admin'].includes(role)) {
      throw createError('Invalid role', 400);
    }

    const { data: roleData, error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role })
      .select()
      .single();

    if (error) {
      throw createError('Failed to update role', 500);
    }

    res.json({ role: roleData });
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Get students
router.get('/students', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    const { data: students, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles!inner(role)
      `)
      .eq('user_roles.role', 'student');

    if (error) {
      throw createError('Failed to fetch students', 500);
    }

    res.json({ students });
  } catch (error) {
    next(error);
  }
});

export default router;