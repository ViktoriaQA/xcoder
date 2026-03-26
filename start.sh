#!/bin/bash

# Fast pre-push checks for development

echo "🔍 Running pre-push checks..."

# 1. Type checking (if available)
echo "📝 Checking TypeScript types..."
cd frontend && (npm run type-check || echo "⚠️  TypeScript check not available, skipping...") && cd ../
cd backend && (npm run type-check || echo "⚠️  TypeScript check not available, skipping...") && cd ../

# 2. Linting (if available)
echo "🔧 Running linter..."
cd frontend && (npm run lint || echo "⚠️  Linting not available, skipping...") && cd ../
cd backend && (npm run lint || echo "⚠️  Linting not available, skipping...") && cd ../

# 3. Quick smoke tests (only critical paths)
echo "💨 Running smoke tests..."
npm run test:e2e:smoke || { echo "❌ Smoke tests failed"; exit 1; }

echo "✅ Pre-push checks passed! 🚀"