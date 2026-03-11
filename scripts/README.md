# VPS Deployment Documentation

This directory contains scripts and documentation for deploying and managing TadabburQuran on VPS.

## Quick Start

### First-Time Deployment
```bash
# On your VPS
cd /var/www/tadabburquran
chmod +x scripts/*.sh
./scripts/deploy-vps.sh
```

### Common Commands
```bash
# Check application status
./scripts/vps-quick-commands.sh status

# View logs
./scripts/vps-quick-commands.sh logs

# Restart application
./scripts/vps-quick-commands.sh restart

# Deploy latest changes
./scripts/vps-quick-commands.sh deploy

# Run tests
./scripts/vps-quick-commands.sh test
```

## Files in This Directory

### 1. `deploy-vps.sh`
**Purpose:** Step-by-step deployment guide for first-time setup and updates

**What it does:**
- Pulls latest code from repository
- Installs dependencies with `--legacy-peer-deps` flag
- Builds Next.js application
- Copies `public` folder to standalone build (CRITICAL)
- Provides complete VPS deployment instructions

**When to use:**
- First-time deployment to new VPS
- When setting up a new server
- As a reference for manual deployment steps

**Usage:**
```bash
./scripts/deploy-vps.sh
```

---

### 2. `vps-quick-commands.sh`
**Purpose:** Quick reference script for common VPS management tasks

**Available commands:**

| Command | Description |
|---------|-------------|
| `status` | Check PM2 status, port listening, and HTTP response |
| `logs [n]` | Show PM2 logs (last n lines, default 50) |
| `restart` | Restart application (stop all → start standalone) |
| `build` | Build app and copy public folder to standalone |
| `deploy` | Pull, install, build, and deploy in one command |
| `clean` | Kill all PM2 and node processes |
| `test` | Run comprehensive application tests |
| `nginx` | Nginx management (test|reload|restart|logs) |
| `db` | Database management (connect|backup|migrate) |
| `env` | Check environment variables |

**Usage examples:**
```bash
# Check status
./scripts/vps-quick-commands.sh status

# View last 100 log lines
./scripts/vps-quick-commands.sh logs 100

# Quick restart
./scripts/vps-quick-commands.sh restart

# Full deployment (pull + build + restart)
./scripts/vps-quick-commands.sh deploy

# Reload nginx
./scripts/vps-quick-commands.sh nginx reload

# Connect to database
./scripts/vps-quick-commands.sh db connect

# Check environment variables
./scripts/vps-quick-commands.sh env
```

---

### 3. `VPS-TROUBLESHOOTING.md`
**Purpose:** Comprehensive troubleshooting guide for common VPS issues

**Covers:**
1. 502 Bad Gateway errors
2. Missing build or components
3. Port conflicts (EADDRINUSE)
4. Authentication errors (UntrustedHost)
5. Database schema errors
6. Upload file size limits
7. Uploaded images returning 404
8. Connection refused errors

**When to use:**
- When encountering deployment issues
- Understanding root causes of errors
- Learning about best practices
- Training new developers

**Key sections:**
- Quick reference commands
- Environment variables checklist
- Deployment checklist
- Important notes about standalone mode

---

## Critical Deployment Concepts

### Next.js Standalone Mode

This project uses `output: 'standalone'` in `next.config.js`. This is CRITICAL to understand:

**What it does:**
- Creates an optimized production build
- Reduces node_modules size
- Improves startup time

**What it requires:**
1. **ALWAYS** copy `public` folder to `.next/standalone/` after build
2. Use `.next/standalone/server.js` to run the app (NOT `next start`)
3. Set PORT environment variable when starting

**If you forget to copy public folder:**
- Images will upload successfully but return 404
- Static assets will be inaccessible
- Application will appear broken

**Correct startup command:**
```bash
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
```

**Incorrect (don't do this):**
```bash
# ❌ Wrong - Don't use next start
pm2 start "npm start" --name "tadabburquran"

# ❌ Wrong - Don't start from project root
pm2 start server.js --name "tadabburquran"
```

---

### Port Configuration

- **Development:** Port 3000
- **Production:** Port 3002
- **Nginx proxies to:** http://localhost:3002

Why port 3002?
- Avoids conflicts with default Next.js port (3000)
- Common convention for production Next.js apps
- Separates development from production environments

---

### PM2 Process Management

**Best practices:**
- Always use meaningful names: `--name "tadabburquran"`
- Save configuration: `pm2 save`
- Setup startup script: `pm2 startup`
- Monitor with logs: `pm2 logs tadabburquran`

**Starting application:**
```bash
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
pm2 save
```

**Checking status:**
```bash
pm2 status
pm2 logs tadabburquran
pm2 monit
```

**Restarting:**
```bash
pm2 restart tadabburquran
# Or full restart
pm2 stop all && pm2 delete all
# Then start fresh
```

---

### Environment Variables

**Required in `.env` file:**

```env
NODE_ENV=production
PORT=3002

# Database
DATABASE_URL=postgresql://tadabburquran:password@localhost:5432/tadabburquran_db

# NextAuth
NEXTAUTH_URL=https://tadabburquran.id
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Common issues:**
- Missing `NEXTAUTH_URL` → UntrustedHost error
- Missing `NEXTAUTH_SECRET` → Authentication failures
- Wrong `DATABASE_URL` → Database connection errors

---

## Typical Deployment Workflow

### Initial Setup (First Time)

1. **Clone repository:**
```bash
git clone <your-repo-url> /var/www/tadabburquran
cd /var/www/tadabburquran
```

2. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```

3. **Setup environment:**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

4. **Setup database:**
```bash
# Create database and user
sudo -u postgres psql -c "CREATE USER tadabburquran WITH PASSWORD 'your-password';"
sudo -u postgres psql -c "CREATE DATABASE tadabburquran_db OWNER tadabburquran;"

# Run schema and migrations
psql -U tadabburquran -d tadabburquran_db -h localhost -f db/schema.sql
psql -U tadabburquran -d tadabburquran_db -h localhost -f db/add_user_profile_fields.sql
# ... run all migrations
```

5. **Build application:**
```bash
npm run build
cp -r public .next/standalone/
```

6. **Configure nginx:**
```bash
sudo nano /etc/nginx/sites-available/tadabburquran
```

Add `client_max_body_size 10M;` for uploads.

7. **Start application:**
```bash
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
pm2 save
pm2 startup
```

8. **Test deployment:**
```bash
./scripts/vps-quick-commands.sh test
```

---

### Update Deployment (Pulling Changes)

**Option 1: Quick deploy (automated)**
```bash
./scripts/vps-quick-commands.sh deploy
```

**Option 2: Manual steps**
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install --legacy-peer-deps

# Build
npm run build

# Copy public folder to standalone
cp -r public .next/standalone/

# Restart
pm2 stop all
pm2 delete all
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
pm2 save
```

---

### Emergency Recovery

**If website is down:**
```bash
# Check status
./scripts/vps-quick-commands.sh status

# View logs
./scripts/vps-quick-commands.sh logs

# Restart
./scripts/vps-quick-commands.sh restart
```

**If rebuild is needed:**
```bash
# Clean everything
./scripts/vps-quick-commands.sh clean

# Rebuild
npm run build
cp -r public .next/standalone/

# Start fresh
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
pm2 save
```

---

## Common Issues and Quick Fixes

### Issue: 502 Bad Gateway
**Fix:** Application not running. Start it:
```bash
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
```

### Issue: Images return 404
**Fix:** Public folder not in standalone. Copy it:
```bash
cp -r public .next/standalone/
pm2 restart tadabburquran
```

### Issue: Port already in use
**Fix:** Kill processes and restart:
```bash
./scripts/vps-quick-commands.sh clean
./scripts/vps-quick-commands.sh restart
```

### Issue: Authentication error
**Fix:** Check `.env` has `NEXTAUTH_URL` and `NEXTAUTH_SECRET`, then rebuild:
```bash
npm run build
cp -r public .next/standalone/
pm2 restart tadabburquran
```

### Issue: Upload fails with 413
**Fix:** Increase nginx upload limit:
```bash
sudo nano /etc/nginx/sites-available/tadabburquran
# Add: client_max_body_size 10M;
sudo nginx -t
sudo systemctl reload nginx
```

---

## Maintenance Tasks

### Daily/Weekly
- Check PM2 status: `pm2 status`
- Monitor logs: `pm2 logs tadabburquran`
- Check disk space: `df -h`

### Monthly
- Database backup: `./scripts/vps-quick-commands.sh db backup`
- Update dependencies: `npm update`
- Security updates: `sudo apt update && sudo apt upgrade`

### As Needed
- Review and rotate logs
- Monitor performance metrics
- Check SSL certificate expiry
- Review nginx access logs for unusual activity

---

## Getting Help

If you encounter issues not covered here:

1. **Check logs first:**
   ```bash
   pm2 logs tadabburquran
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Use the troubleshooting guide:**
   ```bash
   cat VPS-TROUBLESHOOTING.md
   ```

3. **Verify environment:**
   ```bash
   ./scripts/vps-quick-commands.sh env
   ```

4. **Run diagnostics:**
   ```bash
   ./scripts/vps-quick-commands.sh test
   ```

---

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

Last updated: March 2025

For questions or issues, refer to `VPS-TROUBLESHOOTING.md` or check the project repository.
