# VPS Deployment Troubleshooting Guide

This document contains common issues encountered when deploying TadabburQuran to VPS and their solutions.

## Table of Contents
1. [502 Bad Gateway](#1-502-bad-gateway)
2. [Missing Build or Components](#2-missing-build-or-components)
3. [Port Already In Use (EADDRINUSE)](#3-port-already-in-use-eaddrinuse)
4. [Authentication Errors (UntrustedHost)](#4-authentication-errors-untrustedhost)
5. [Database Schema Errors](#5-database-schema-errors)
6. [Upload File Size Limit (413 Payload Too Large)](#6-upload-file-size-limit-413-payload-too-large)
7. [Uploaded Images Return 404](#7-uploaded-images-return-404)
8. [Website Connection Refused](#8-website-connection-refused)

---

## 1. 502 Bad Gateway

**Symptom:** Website shows "502 Bad Gateway nginx/1.24.0 (Ubuntu)"

**Root Cause:** Next.js application is not running

**Solution:**
```bash
# Check PM2 status
pm2 status

# If app is stopped, check logs
pm2 logs tadabburquran

# If missing build, rebuild
npm run build

# Start application
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
pm2 save
```

**Prevention:** Ensure build completes successfully before starting PM2

---

## 2. Missing Build or Components

**Symptom:** Build fails with "Module not found: Can't resolve '@/components/XXX'"

**Root Cause:** VPS files are out of sync with repository

**Solution:**
```bash
# Reset to clean state
git reset --hard HEAD
git clean -fd
git pull origin main

# Reinstall dependencies
npm install --legacy-peer-deps

# Rebuild
npm run build
```

**Prevention:** Always run `git pull` before building on VPS

---

## 3. Port Already In Use (EADDRINUSE)

**Symptom:** Error "Error: listen EADDRINUSE: address already in use 127.0.0.1:3000"

**Root Cause:** Multiple PM2 processes or other services using the same port

**Solution:**
```bash
# Stop all PM2 processes
pm2 stop all
pm2 delete all

# Kill any remaining node processes
pkill -f "node server.js"
pkill -f "next start"

# Kill process holding the port
sudo fuser -k 3000/tcp

# Start fresh
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
pm2 save
```

**Prevention:** Always use unique port (3002) and ensure only one PM2 process runs

---

## 4. Authentication Errors (UntrustedHost)

**Symptom:** "[auth][error] UntrustedHost: Host must be trusted. URL was: https://tadabburquran.id/api/auth/session"

**Root Cause:** Missing NEXTAUTH_URL or trustHost configuration

**Solution:**

1. Check `.env` file has:
```env
NEXTAUTH_URL=https://tadabburquran.id
NEXTAUTH_SECRET=j60QUROELkAa8HJmzgf6ppXrST1o/SVbdvLlM2EJiBA=
```

2. Check `lib/auth.js` has:
```javascript
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,  // ADD THIS LINE
  providers: [
    // ... rest of config
  ],
});
```

3. Rebuild and restart:
```bash
npm run build
pm2 restart tadabburquran --update-env
```

**Prevention:** Always include NEXTAUTH_URL in production .env file

---

## 5. Database Schema Errors

**Symptom:** "Database query error: error: column "XXX" does not exist"

**Root Cause:** Database schema is incomplete; migration files not run

**Solution:**
```bash
# Drop and recreate database (WARNING: This deletes all data)
sudo -u postgres psql -c "DROP DATABASE IF EXISTS tadabburquran_db;"
sudo -u postgres psql -c "CREATE DATABASE tadabburquran_db OWNER tadabburquran;"

# Run main schema
psql -U tadabburquran -d tadabburquran_db -h localhost -f db/schema.sql

# Run all migrations
psql -U tadabburquran -d tadabburquran_db -h localhost -f db/add_user_profile_fields.sql
psql -U tadabburquran -d tadabburquran_db -h localhost -f db/add_creators_table.sql
psql -U tadabburquran -d tadabburquran_db -h localhost -f db/insert_creators.sql
psql -U tadabburquran -d tadabburquran_db -h localhost -f db/migrations/add_course_slug_index.sql
```

**Prevention:** Run migration files after schema.sql on new database setup

---

## 6. Upload File Size Limit (413 Payload Too Large)

**Symptom:** "client intended to send too large body: 1554482 bytes" when uploading images

**Root Cause:** Nginx default upload limit is 1MB

**Solution:**

1. Edit nginx config:
```bash
sudo nano /etc/nginx/sites-available/tadabburquran
```

2. Add `client_max_body_size` in server block:
```nginx
server {
    server_name tadabburquran.id www.tadabburquran.id;
    client_max_body_size 10M;  # ADD THIS LINE

    location / {
        proxy_pass http://localhost:3002;
        # ... rest of config
    }
}
```

3. Test and reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Prevention:** Set adequate upload limits based on your needs

---

## 7. Uploaded Images Return 404

**Symptom:** Images successfully uploaded but return 404 when accessed

**Root Cause:** Next.js standalone mode does not include `public` folder in build output

**Solution:**
```bash
# After running npm run build, copy public folder to standalone
cp -r public .next/standalone/

# Verify files exist
ls -la .next/standalone/public/uploads/creators/

# Restart PM2
pm2 stop all
pm2 delete all
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
pm2 save
```

**Prevention:** ALWAYS copy `public` folder to `.next/standalone/` after every build

**Why this happens:** In `next.config.js`, when `output: 'standalone'` is set, Next.js creates a minimal build that doesn't automatically include static files from the `public` folder.

---

## 8. Website Connection Refused

**Symptom:** Browser shows "This site can't be reached - ERR_CONNECTION_REFUSED"

**Root Cause:** Application not running or port conflicts

**Solution:**
```bash
# Check if application is running
pm2 status

# Check if port is listening
ss -tlnp | grep :3002

# If not running, start it
cd /var/www/tadabburquran/.next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"

# Check firewall
sudo ufw status
sudo ufw allow 3002/tcp
```

**Prevention:** Ensure PM2 process starts on system reboot:
```bash
pm2 startup
pm2 save
```

---

## Quick Reference: Essential Commands

### Check Application Status
```bash
pm2 status
pm2 logs tadabburquran
curl http://localhost:3002
```

### Restart Application
```bash
pm2 restart tadabburquran
# Or full restart
pm2 stop all
pm2 delete all
cd .next/standalone
PORT=3002 pm2 start server.js --name "tadabburquran"
pm2 save
```

### View Application Logs
```bash
# Real-time logs
pm2 logs tadabburquran

# Logs with lines
pm2 logs tadabburquran --lines 100

# Clear logs
pm2 flush
```

### Check Port Usage
```bash
ss -tlnp | grep :3002
netstat -tlnp | grep :3002
lsof -i :3002
```

### Kill Process on Port
```bash
sudo fuser -k 3000/tcp
sudo fuser -k 3002/tcp
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Commands
```bash
# Connect to database
psql -U tadabburquran -d tadabburquran_db -h localhost

# Run SQL file
psql -U tadabburquran -d tadabburquran_db -h localhost -f db/schema.sql

# Check database size
psql -U tadabburquran -d tadabburquran_db -h localhost -c "\l+"
```

---

## Environment Variables Checklist

Ensure your `.env` file contains:

```env
NODE_ENV=production
PORT=3002
DATABASE_URL=postgresql://tadabburquran:password@localhost:5432/tadabburquran_db
NEXTAUTH_URL=https://tadabburquran.id
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Run `git pull origin main` to get latest changes
- [ ] Run `npm install --legacy-peer-deps` to install dependencies
- [ ] Run `npm run build` to build the application
- [ ] Run `cp -r public .next/standalone/` to copy public folder
- [ ] Verify `.env` file exists with correct values
- [ ] Stop all PM2 processes: `pm2 stop all && pm2 delete all`
- [ ] Start standalone server: `cd .next/standalone && PORT=3002 pm2 start server.js --name "tadabburquran"`
- [ ] Run `pm2 save` to save PM2 configuration
- [ ] Test application locally: `curl http://localhost:3002`
- [ ] Check PM2 status: `pm2 status`
- [ ] Test website in browser: https://tadabburquran.id

---

## Important Notes

### Next.js Standalone Mode
This project uses `output: 'standalone'` in `next.config.js`. This creates an optimized production build but requires:
1. **Always copy `public` folder to `.next/standalone/` after build**
2. **Use `.next/standalone/server.js` to run the application**
3. **Don't use `npm start` or `next start` directly**

### Port Configuration
- Development: Uses port 3000
- Production: Uses port 3002 (to avoid conflicts)
- Nginx proxies to: http://localhost:3002

### PM2 Best Practices
- Always use meaningful names: `pm2 start server.js --name "tadabburquran"`
- Save configuration: `pm2 save`
- Setup startup script: `pm2 startup`
- Monitor logs: `pm2 logs tadabburquran`

### Database Migrations
When adding new database changes:
1. Create migration SQL file in `db/migrations/`
2. Run migration on VPS: `psql -U tadabburquran -d tadabburquran_db -h localhost -f db/migrations/your-migration.sql`
3. Test application thoroughly

---

## Contact & Support

If you encounter issues not covered in this guide:

1. Check PM2 logs: `pm2 logs tadabburquran`
2. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check application logs in the Next.js app
4. Verify all environment variables are set correctly
5. Ensure database schema is up to date
6. Confirm build completed successfully

---

Last updated: March 2025
