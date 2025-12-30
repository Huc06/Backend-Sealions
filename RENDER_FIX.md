# Fix Database Connection trên Render

## Lỗi hiện tại

```
PrismaClientInitializationError: Can't reach database server at 
aws-1-ap-southeast-1.pooler.supabase.com:6543
```

## Cách fix nhanh

### Bước 1: Check Environment Variables trong Render

1. Vào **Render Dashboard** → **Your Service** → **Environment**
2. Verify các variables sau:

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Bước 2: Fix Password Special Characters

Nếu password có special characters (`+`, `&`, `@`, `#`, etc.), cần **URL encode**:

**Example:**
- Password: `Gh+hegy&vG9G*J+`
- Encoded: `Gh%2Bhegy%26vG9G%2AJ%2B`

**URL Encoding:**
- `+` → `%2B`
- `&` → `%26`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `*` → `%2A`
- `=` → `%3D`

### Bước 3: Try Direct Connection

Nếu pooler (port 6543) không work, dùng direct connection (port 5432):

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Bước 4: Check Supabase Database

1. Vào **Supabase Dashboard** → **Settings** → **Database**
2. Check:
   - Database không bị **pause** (free tier có thể pause sau 1 week inactive)
   - **Connection Pooling** đang enabled
   - **IP Allowlist** không block Render IPs

### Bước 5: Verify Connection String Format

**Correct format:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:[PORT]/postgres?[OPTIONS]
```

**Check:**
- `[PROJECT_REF]` - Your Supabase project reference
- `[PASSWORD]` - Database password (URL encoded nếu có special chars)
- `[HOST]` - `aws-1-ap-southeast-1.pooler.supabase.com` hoặc direct host
- `[PORT]` - `6543` (pooler) hoặc `5432` (direct)

## Quick Test

Sau khi update environment variables, **restart service** trong Render:

1. Render Dashboard → **Manual Deploy** → **Clear build cache & deploy**
2. Hoặc click **Restart** button

## Alternative: Use Connection String từ Supabase

1. Supabase Dashboard → **Settings** → **Database**
2. Copy **Connection string** (Session pooler)
3. Paste vào `DATABASE_URL` trong Render
4. Copy **Connection string** (Direct connection)
5. Paste vào `DIRECT_URL` trong Render

## Verify Fix

Check logs sau khi restart:
- ✅ Should see: `Application is running on: http://0.0.0.0:3000`
- ❌ Should NOT see: `Can't reach database server`

## Still Not Working?

1. **Check Supabase Database Status:**
   - Database có bị pause không?
   - Free tier có hết quota không?

2. **Try Different Connection:**
   - Switch từ pooler (6543) → direct (5432)
   - Hoặc ngược lại

3. **Check Network:**
   - Render có thể access Supabase không?
   - Firewall rules?

4. **Verify Credentials:**
   - Password đúng chưa?
   - Project reference đúng chưa?

