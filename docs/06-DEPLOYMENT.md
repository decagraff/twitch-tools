# 🚢 Deployment Guide

Production deployment guide for Twitch Tools Web Suite.

---

## Deployment Options

### Recommended Stacks

1. **Vercel (Frontend) + Railway (Backend + DB)**
2. **Netlify (Frontend) + Render (Backend + DB)**
3. **Digital Ocean (Full Stack)**
4. **AWS (Advanced)**

---

## Option 1: Vercel + Railway (Easiest)

### Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**
   - Click "New"
   - Select "Database" → "PostgreSQL"
   - Railway auto-configures `DATABASE_URL`

4. **Configure Environment Variables**
   ```env
   PORT=3000
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<generated_secret>
   ENCRYPTION_KEY=<32_char_key>
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

5. **Configure Build**
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Deploy**
   - Railway auto-deploys on push to main branch

### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure**
   - Root Directory: `client`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_APP_NAME=Twitch Tools Suite
   VITE_APP_VERSION=1.0.0
   ```

5. **Deploy**
   - Click "Deploy"
   - Auto-deploys on push to main

---

## Option 2: Render (Full Stack)

### PostgreSQL Database

1. Create new PostgreSQL instance
2. Copy connection string

### Backend Service

1. **New Web Service**
   - Connect GitHub repo
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

2. **Environment Variables**
   ```env
   DATABASE_URL=<from_render_postgres>
   NODE_ENV=production
   JWT_SECRET=<secret>
   ENCRYPTION_KEY=<key>
   CORS_ORIGIN=<frontend_url>
   ```

### Frontend (Static Site)

1. **New Static Site**
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Environment Variables**
   ```env
   VITE_API_URL=<backend_url>/api
   ```

---

## Pre-Deployment Checklist

### Security

- [ ] Generate secure `JWT_SECRET` (64+ characters)
- [ ] Generate secure `ENCRYPTION_KEY` (exactly 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `CORS_ORIGIN`
- [ ] Use HTTPS for all endpoints
- [ ] Enable rate limiting
- [ ] Review Helmet security headers

### Database

- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Create database backups
- [ ] Set up connection pooling

### Code

- [ ] Remove console.logs
- [ ] Build without errors: `npm run build`
- [ ] Test production build locally
- [ ] Update API URLs in frontend

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Configure logging
- [ ] Set up uptime monitoring

---

## Environment Variables Reference

### Backend (Production)

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Security
JWT_SECRET=<64_char_random_string>
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d
ENCRYPTION_KEY=<32_char_random_string>

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (Production)

```env
VITE_API_URL=https://api.your-domain.com/api
VITE_APP_NAME=Twitch Tools Suite
VITE_APP_VERSION=1.0.0
```

---

## Generate Secure Keys

### JWT Secret (64 characters)

```bash
openssl rand -base64 64
```

### Encryption Key (32 characters)

```bash
openssl rand -base64 32 | cut -c1-32
```

---

## Database Migrations

### In Production

```bash
# Deploy migrations (non-interactive)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

**Important:** Never use `npx prisma migrate dev` in production!

---

## Custom Domain Setup

### Backend

1. Add custom domain in Railway/Render
2. Configure DNS:
   ```
   A Record: api.yourdomain.com → <service_ip>
   ```

### Frontend

1. Add custom domain in Vercel
2. Configure DNS:
   ```
   A Record: @ → 76.76.21.21
   CNAME: www → cname.vercel-dns.com
   ```

---

## SSL/TLS Certificates

- **Vercel:** Auto SSL (Let's Encrypt)
- **Railway:** Auto SSL
- **Render:** Auto SSL
- **Manual:** Use Certbot + Let's Encrypt

---

## Monitoring & Logging

### Recommended Tools

- **Error Tracking:** Sentry
- **Uptime Monitoring:** UptimeRobot
- **Analytics:** Google Analytics
- **Logging:** Logtail, Papertrail

### Setup Sentry (Example)

```bash
npm install @sentry/node @sentry/react
```

Backend:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

Frontend:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});
```

---

## Performance Optimization

### Backend

- Enable compression
- Use connection pooling
- Cache frequent queries (Redis)
- Optimize database indexes

### Frontend

- Code splitting
- Lazy loading routes
- Image optimization
- CDN for static assets

---

## Backup Strategy

### Database Backups

- **Automated:** Daily backups (Railway/Render)
- **Manual:** `pg_dump` weekly

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Code Backups

- GitHub repository
- Tagged releases

---

## Scaling

### Vertical Scaling

Increase server resources:
- More CPU
- More RAM
- Faster database

### Horizontal Scaling

- Load balancer
- Multiple server instances
- Read replicas for database
- Redis caching layer

---

## Troubleshooting

### Build Fails

- Check Node.js version
- Clear build cache
- Verify all dependencies installed

### Database Connection Fails

- Check `DATABASE_URL` format
- Verify database is running
- Check firewall rules

### CORS Errors

- Verify `CORS_ORIGIN` matches frontend URL
- Include protocol (https://)
- Check for trailing slashes

---

## Post-Deployment

1. Test all endpoints
2. Monitor error logs
3. Check performance metrics
4. Set up alerts
5. Create admin account
6. Test full user flow

---

**[⬆ Back to Main README](../README.md)**
