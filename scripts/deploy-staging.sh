#!/bin/bash

# Deploy to Staging Environment
echo "🚀 Deploying to Staging Environment..."

# Set environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging

# Copy staging environment variables
cp .env.staging .env.local

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests (if you have them)
echo "🧪 Running tests..."
# npm run test

# Build the application
echo "🔨 Building application..."
npm run build:staging

# Deploy to staging server (example with rsync)
echo "📤 Deploying to staging server..."
# rsync -avz --delete .next/ user@staging-server:/var/www/invoice-app/
# rsync -avz --delete public/ user@staging-server:/var/www/invoice-app/public/

# Or deploy to cloud provider (example with Vercel)
# npx vercel --prod --env .env.staging

echo "✅ Staging deployment completed!"
echo "🌐 Staging URL: https://staging.yourcompany.com"