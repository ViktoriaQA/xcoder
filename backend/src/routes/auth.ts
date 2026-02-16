import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../utils/supabase';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Verify token endpoint
router.post('/verify', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw createError('Token required', 400);
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw createError('Invalid token', 401);
    }

    // Get user profile and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        profile,
        role: roleData?.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token required', 400);
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data.session) {
      throw createError('Invalid refresh token', 401);
    }

    res.json({
      session: data.session,
      user: data.user
    });
  } catch (error) {
    next(error);
  }
});

export default router;