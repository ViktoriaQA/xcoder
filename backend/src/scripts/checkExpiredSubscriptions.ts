import dotenv from 'dotenv';
import path from 'path';
import { supabase } from '../utils/supabase';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface ExpiredSubscription {
  id: string;
  user_id: string;
  subscription_plan: string;
  subscription_expires_at: string;
}

async function checkExpiredSubscriptions(): Promise<void> {
  try {
    console.log('🔍 [CRON] Starting expired subscriptions check...');
    
    const now = new Date().toISOString();
    
    // Find all active subscriptions that have expired
    const { data: expiredSubscriptions, error } = await supabase
      .from('profiles')
      .select('id, user_id, subscription_plan, subscription_expires_at')
      .eq('subscription_status', 'active')
      .lt('subscription_expires_at', now);

    if (error) {
      console.error('❌ [CRON] Error fetching expired subscriptions:', error);
      throw error;
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('✅ [CRON] No expired subscriptions found');
      return;
    }

    console.log(`📊 [CRON] Found ${expiredSubscriptions.length} expired subscriptions`);

    // Update each expired subscription to inactive
    for (const subscription of expiredSubscriptions as ExpiredSubscription[]) {
      console.log(`🔄 [CRON] Updating subscription for user ${subscription.user_id}`);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', subscription.user_id);

      if (updateError) {
        console.error(`❌ [CRON] Failed to update subscription for user ${subscription.user_id}:`, updateError);
      } else {
        console.log(`✅ [CRON] Successfully updated subscription for user ${subscription.user_id} from active to inactive`);
      }
    }

    console.log('🎉 [CRON] Expired subscriptions check completed successfully');
  } catch (error) {
    console.error('💥 [CRON] Critical error in expired subscriptions check:', error);
    process.exit(1);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  checkExpiredSubscriptions()
    .then(() => {
      console.log('✅ [CRON] Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [CRON] Script failed:', error);
      process.exit(1);
    });
}

export { checkExpiredSubscriptions };
