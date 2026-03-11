#!/bin/bash

# TadabburQuran VPS Deployment Script
# This script helps deploy updates to the VPS and avoids common issues

set -e  # Exit on error

echo "🚀 Starting TadabburQuran VPS Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="your-vps-host"  # Replace with your VPS IP or hostname
VPS_USER="root"  # Replace with your VPS username
PROJECT_DIR="/var/www/tadabburquran"

echo -e "${YELLOW}📋 Step 1: Pulling latest changes...${NC}"
git pull origin main

echo -e "${YELLOW}📦 Step 2: Installing dependencies with --legacy-peer-deps flag...${NC}"
npm install --legacy-peer-deps

echo -e "${YELLOW}🔨 Step 3: Building Next.js application...${NC}"
npm run build

echo -e "${YELLOW}📁 Step 4: Copying public folder to standalone build...${NC}"
if [ -d ".next/standalone" ]; then
  cp -r public .next/standalone/
  echo -e "${GREEN}✓ Public folder copied to standalone${NC}"
else
  echo -e "${RED}✗ Standalone build not found. Build may have failed.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Local build complete!${NC}"
echo ""
echo "Next steps to deploy to VPS:"
echo ""
echo "1. SSH into your VPS:"
echo "   ssh $VPS_USER@$VPS_HOST"
echo ""
echo "2. Navigate to project directory:"
echo "   cd $PROJECT_DIR"
echo ""
echo "3. Pull latest changes:"
echo "   git pull origin main"
echo ""
echo "4. Install dependencies:"
echo "   npm install --legacy-peer-deps"
echo ""
echo "5. Build application:"
echo "   npm run build"
echo ""
echo "6. Copy public folder to standalone (CRITICAL for standalone mode):"
echo "   cp -r public .next/standalone/"
echo ""
echo "7. Stop all PM2 processes:"
echo "   pm2 stop all"
echo "   pm2 delete all"
echo ""
echo "8. Kill any remaining node processes on port 3000/3002:"
echo "   pkill -f 'node server.js' || true"
echo "   pkill -f 'next start' || true"
echo "   sudo fuser -k 3000/tcp 2>/dev/null || true"
echo ""
echo "9. Start standalone server on port 3002:"
echo "   cd .next/standalone"
echo "   PORT=3002 pm2 start server.js --name 'tadabburquran'"
echo "   pm2 save"
echo ""
echo "10. Verify deployment:"
echo "    pm2 status"
echo "    curl http://localhost:3002"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT REMINDERS:${NC}"
echo "    - Ensure .env file exists with NEXTAUTH_URL and NEXTAUTH_SECRET"
echo "    - Ensure nginx has client_max_body_size 10M for uploads"
echo "    - Database migrations should be run if schema changed"
echo "    - Always copy public folder to .next/standalone/ after build"
echo ""
