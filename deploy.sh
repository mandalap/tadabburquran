#!/bin/bash
set -e  # Stop jika ada error

echo "🚀 Starting deployment..."

# 1. Pull code terbaru
echo "📦 Pulling latest code..."
git pull origin main

# 2. Install dependencies
echo "📥 Installing dependencies..."
npm run build

# 3. Build project
echo "🔨 Building project..."
npm run build

# 4. Copy static files ke standalone (WAJIB!)
echo "📂 Copying static files..."
# Copy public TANPA menimpa folder uploads yang sudah ada
cp -r public/. .next/standalone/public/
# Pastikan folder uploads tidak tertimpa
cp -r .next/static .next/standalone/.next/static
cp .env.local .next/standalone/.env.local

# 5. Fix ownership uploads agar foto tetap bisa diakses
echo "🔐 Fixing permissions..."
sudo chown -R quick:www-data .next/standalone/public/uploads/
sudo chmod -R 775 .next/standalone/public/uploads/

# 6. Restart app
echo "♻️ Restarting app..."
pm2 delete tadabburquran 2>/dev/null || true
PORT=3002 HOSTNAME=127.0.0.1 NODE_ENV=production \
pm2 start node --name "tadabburquran" -- .next/standalone/server.js
pm2 save

echo "✅ Deployment complete!"
