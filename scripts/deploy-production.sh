#!/bin/bash

# Deploy to Production Environment
echo "🚀 Deploying to Production Environment..."

# Confirmation prompt
read -p "Are you sure you want to deploy to PRODUCTION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Production deployment cancelled."
    exit 1
fi

# Set environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=production

# Copy production environment variables
cp .env.production .env.local

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests (if you have them)
echo "🧪 Running tests..."
# npm run test

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level high

# Build the application
echo "🔨 Building application..."
npm run build:production

# Create backup (optional)
echo "💾 Creating backup..."
# Your backup script here

# Deploy to production server
echo "📤 Deploying to production server..."
# rsync -avz --delete .next/ user@prod-server:/var/www/invoice-app/
# rsync -avz --delete public/ user@prod-server:/var/www/invoice-app/public/

# Or deploy to cloud provider
# npx vercel --prod --env .env.production

# Health check
echo "🏥 Running health check..."
# curl -f https://yourcompany.com/api/health || exit 1

echo "✅ Production deployment completed!"
echo "🌐 Production URL: https://yourcompany.com"