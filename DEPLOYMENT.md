# Deployment Guide

## Environment Variables for Production

### Required Variables

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase Auth
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_KEY="your-anon-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Application
PORT=3000
NODE_ENV="production"
FRONTEND_URL="https://your-frontend-domain.com"
```

## Common Deployment Issues

### 1. Database Connection Error (P1001)

**Error:** `Can't reach database server at aws-1-ap-southeast-1.pooler.supabase.com:6543`

**Solutions:**

#### Option A: Check Environment Variables
1. Verify `DATABASE_URL` is set correctly in production
2. Check password is correct (no special characters need URL encoding)
3. Ensure `DIRECT_URL` is also set

#### Option B: Use Direct Connection (Port 5432)
If pooler (port 6543) doesn't work, try direct connection:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

#### Option C: Check Supabase Network Settings
1. Go to Supabase Dashboard → Settings → Database
2. Check "Connection Pooling" settings
3. Verify IP allowlist (if enabled)
4. Check if database is paused (free tier)

#### Option D: URL Encode Special Characters
If password has special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

Example:
```env
# Password: Gh+hegy&vG9G*J+
DATABASE_URL="postgresql://postgres.ref:Gh%2Bhegy%26vG9G%2AJ%2B@host:5432/postgres"
```

### 2. Prisma Client Not Generated

**Error:** `You may have to run prisma generate`

**Solution:**
Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "prebuild": "prisma generate"
  }
}
```

### 3. Build Scripts

For Render/Railway/Vercel, ensure build script includes:

```json
{
  "scripts": {
    "build": "prisma generate && nest build",
    "start": "node dist/src/main.js"
  }
}
```

## Render Deployment

### Build Command
```bash
pnpm install && pnpm prisma generate && pnpm build
```

### Start Command
```bash
pnpm start:prod
```

### Environment Variables
Set all required variables in Render Dashboard → Environment

## Database Migration

After deployment, run migrations:

```bash
# Option 1: Using Prisma Migrate
pnpm prisma migrate deploy

# Option 2: Manual SQL (if migrations fail)
# Run migration.sql in Supabase SQL Editor
```

## Health Check

Add health check endpoint:

```typescript
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date() };
}
```

## Troubleshooting

1. **Check logs** in Render Dashboard
2. **Verify environment variables** are set correctly
3. **Test database connection** from production server
4. **Check Supabase** database is not paused
5. **Verify network** access from production to Supabase

