#!/bin/bash

# Script to run expired subscriptions check
# This script should be called by cron job

# Change to the backend directory
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run the TypeScript script using tsx
echo "🚀 [CRON] Running expired subscriptions check at $(date)"
npx tsx src/scripts/checkExpiredSubscriptions.ts

echo "✅ [CRON] Expired subscriptions check completed at $(date)"
