import { Router } from 'express';
import { AuthRequest, requireRole } from '../middleware/auth';
import { supabase } from '../utils/supabase';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get all active subscription plans
router.get('/plans', async (req, res, next) => {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      throw createError('Failed to fetch plans', 500);
    }

    res.json({ plans });
  } catch (error) {
    next(error);
  }
});

// Get specific plan
router.get('/plans/:planId', async (req, res, next) => {
  try {
    const { planId } = req.params;

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (error || !plan) {
      throw createError('Plan not found', 404);
    }

    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

// Get current user's subscription status
router.get('/status', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan, subscription_expires_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw createError('Failed to fetch subscription status', 500);
    }

    res.json({
      subscription: {
        status: profile.subscription_status,
        plan: profile.subscription_plan,
        expires_at: profile.subscription_expires_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's payment history
router.get('/payments', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        subscription_plans(name, price_monthly, price_yearly)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw createError('Failed to fetch payment history', 500);
    }

    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

// Create payment record (called after successful LiqPay payment)
router.post('/payments', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { plan_id, amount, currency, liqpay_order_id, liqpay_status } = req.body;

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        plan_id,
        amount,
        currency: currency || 'UAH',
        status: liqpay_status === 'success' ? 'completed' : 'pending',
        liqpay_order_id,
        liqpay_status
      })
      .select()
      .single();

    if (error) {
      throw createError('Failed to create payment record', 500);
    }

    // If payment is successful, update user subscription
    if (liqpay_status === 'success') {
      await updateUserSubscription(userId, plan_id);
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
});

// Admin: Create new subscription plan
router.post('/plans', requireRole(['admin']), async (req: AuthRequest, res, next) => {
  try {
    const { name, description, price_monthly, price_yearly, features, currency } = req.body;

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert({
        name,
        description,
        price_monthly,
        price_yearly,
        currency: currency || 'UAH',
        features: features || []
      })
      .select()
      .single();

    if (error) {
      throw createError('Failed to create plan', 500);
    }

    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

// Admin: Update subscription plan
router.put('/plans/:planId', requireRole(['admin']), async (req: AuthRequest, res, next) => {
  try {
    const { planId } = req.params;
    const updates = req.body;

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      throw createError('Failed to update plan', 500);
    }

    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

// Admin: Deactivate plan
router.delete('/plans/:planId', requireRole(['admin']), async (req: AuthRequest, res, next) => {
  try {
    const { planId } = req.params;

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .update({ is_active: false })
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      throw createError('Failed to deactivate plan', 500);
    }

    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

// Helper function to update user subscription
async function updateUserSubscription(userId: string, planId: string) {
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('name')
    .eq('id', planId)
    .single();

  if (plan) {
    // Set subscription to expire in 30 days (monthly) or 365 days (yearly)
    // This is a simplified version - in production you'd check the payment amount
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Default to monthly

    await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: plan.name,
        subscription_expires_at: expiresAt.toISOString()
      })
      .eq('user_id', userId);
  }
}

export default router;