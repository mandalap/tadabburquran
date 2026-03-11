#!/bin/bash

# TadabburQuran VPS Quick Commands
# Common commands for VPS management and troubleshooting

case "$1" in
  status)
    echo "=== PM2 Status ==="
    pm2 status
    echo ""
    echo "=== Port 3002 Status ==="
    ss -tlnp | grep :3002 || echo "Port 3002 not listening"
    echo ""
    echo "=== HTTP Test ==="
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3002
    ;;

  logs)
    if [ -z "$2" ]; then
      pm2 logs tadabburquran --lines 50
    else
      pm2 logs tadabburquran --lines "$2"
    fi
    ;;

  restart)
    echo "Stopping all PM2 processes..."
    pm2 stop all
    pm2 delete all

    echo "Killing any remaining node processes..."
    pkill -f "node server.js" || true
    pkill -f "next start" || true

    echo "Starting standalone server on port 3002..."
    cd .next/standalone
    PORT=3002 pm2 start server.js --name "tadabburquran"
    pm2 save

    echo "✓ Restart complete!"
    pm2 status
    ;;

  build)
    echo "=== Building Next.js Application ==="
    npm run build

    if [ $? -eq 0 ]; then
      echo "✓ Build successful!"

      echo "Copying public folder to standalone..."
      cp -r public .next/standalone/

      echo "✓ Public folder copied!"
      echo ""
      echo "To apply changes, run: ./vps-quick-commands.sh restart"
    else
      echo "✗ Build failed!"
      exit 1
    fi
    ;;

  deploy)
    echo "=== Deploying Latest Changes ==="
    echo "Pulling latest code..."
    git pull origin main

    echo "Installing dependencies..."
    npm install --legacy-peer-deps

    echo "Building application..."
    npm run build

    if [ $? -eq 0 ]; then
      echo "Copying public folder to standalone..."
      cp -r public .next/standalone/

      echo "Restarting PM2..."
      pm2 stop all
      pm2 delete all
      cd .next/standalone
      PORT=3002 pm2 start server.js --name "tadabburquran"
      pm2 save

      echo "✓ Deployment complete!"
      pm2 status
    else
      echo "✗ Build failed! Deployment aborted."
      exit 1
    fi
    ;;

  clean)
    echo "=== Cleaning PM2 Processes ==="
    pm2 stop all
    pm2 delete all

    echo "Killing node processes..."
    pkill -f "node server.js" || true
    pkill -f "next start" || true

    echo "Killing port 3000..."
    sudo fuser -k 3000/tcp 2>/dev/null || true
    sudo fuser -k 3002/tcp 2>/dev/null || true

    echo "✓ Cleanup complete!"
    ;;

  test)
    echo "=== Testing Application ==="
    echo ""
    echo "1. PM2 Status:"
    pm2 status | grep tadabburquran || echo "  ✗ App not running"
    echo ""
    echo "2. Port Listening:"
    ss -tlnp | grep :3002 && echo "  ✓ Port 3002 listening" || echo "  ✗ Port 3002 not listening"
    echo ""
    echo "3. HTTP Response:"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002)
    if [ "$HTTP_CODE" = "200" ]; then
      echo "  ✓ HTTP $HTTP_CODE - OK"
    else
      echo "  ✗ HTTP $HTTP_CODE - Failed"
    fi
    echo ""
    echo "4. Recent Errors:"
    pm2 logs tadabburquran --lines 20 --err
    ;;

  nginx)
    echo "=== Nginx Commands ==="
    case "$2" in
      test)
        sudo nginx -t
        ;;
      reload)
        sudo nginx -t && sudo systemctl reload nginx
        echo "✓ Nginx reloaded"
        ;;
      restart)
        sudo nginx -t && sudo systemctl restart nginx
        echo "✓ Nginx restarted"
        ;;
      error-log)
        sudo tail -f /var/log/nginx/error.log
        ;;
      access-log)
        sudo tail -f /var/log/nginx/access.log
        ;;
      *)
        echo "Usage: $0 nginx {test|reload|restart|error-log|access-log}"
        ;;
    esac
    ;;

  db)
    echo "=== Database Commands ==="
    case "$2" in
      connect)
        psql -U tadabburquran -d tadabburquran_db -h localhost
        ;;
      backup)
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        pg_dump -U tadabburquran -h localhost tadabburquran_db > "$BACKUP_FILE"
        echo "✓ Backup saved to $BACKUP_FILE"
        ;;
      migrate)
        echo "Running database migrations..."
        for migration in db/migrations/*.sql; do
          if [ -f "$migration" ]; then
            echo "Running $migration..."
            psql -U tadabburquran -d tadabburquran_db -h localhost -f "$migration"
          fi
        done
        echo "✓ Migrations complete"
        ;;
      *)
        echo "Usage: $0 db {connect|backup|migrate}"
        ;;
    esac
    ;;

  env)
    echo "=== Environment Check ==="
    echo ""
    echo "NODE_ENV: $NODE_ENV"
    echo "PORT: $PORT"
    echo "DATABASE_URL: ${DATABASE_URL:+Set (hidden)}"
    echo "NEXTAUTH_URL: $NEXTAUTH_URL"
    echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:+Set (hidden)}"
    echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:+Set (hidden)}"
    echo "GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:+Set (hidden)}"
    echo ""
    echo ".env file exists: $([ -f .env ] && echo 'Yes' || echo 'No')"
    echo ".next/standalone/public exists: $([ -d .next/standalone/public ] && echo 'Yes' || echo 'No')"
    ;;

  *)
    echo "TadabburQuran VPS Quick Commands"
    echo ""
    echo "Usage: $0 {command}"
    echo ""
    echo "Available commands:"
    echo "  status        - Check application status"
    echo "  logs [lines]  - Show PM2 logs (default: 50 lines)"
    echo "  restart       - Restart application"
    echo "  build         - Build and copy public folder"
    echo "  deploy        - Pull, build, and deploy"
    echo "  clean         - Kill all PM2 processes and node processes"
    echo "  test          - Run application tests"
    echo "  nginx         - Nginx commands (test|reload|restart|error-log|access-log)"
    echo "  db            - Database commands (connect|backup|migrate)"
    echo "  env           - Check environment variables"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 logs 100"
    echo "  $0 restart"
    echo "  $0 deploy"
    echo "  $0 nginx reload"
    echo "  $0 db connect"
    echo ""
    ;;
esac
