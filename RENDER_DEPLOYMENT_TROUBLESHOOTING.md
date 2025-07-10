# 🚨 Render Deployment Troubleshooting Guide

## Critical DATABASE_URL Fix

### Problem Identified
Your DATABASE_URL is being read as:
```
psql%20'postgresql://neondb_owner:...@ep-soft-sea...neon.tech/neondb?...'
```
The `%20` and surrounding `'` indicate it was URL-encoded or quoted incorrectly.

### ✅ IMMEDIATE FIX REQUIRED

**Step 1: Fix DATABASE_URL in Render Dashboard**

1. Go to your Render dashboard
2. Open your ProFlix service → Environment Variables
3. Find `DATABASE_URL` 
4. Replace it with the correct format (NO quotes, NO encoding):

```
postgresql://neondb_owner:npg_pER4a7qJwZQG@ep-soft-sea-adzrs31i-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**❌ WRONG (your current one):**
```
psql%20'postgresql://...'
```

**✅ CORRECT:**
```
postgresql://...
```

### Step 2: Environment Variables Checklist

Ensure these are set in Render dashboard:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_pER4a7qJwZQG@ep-soft-sea-adzrs31i-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | ✅ YES |
| `SESSION_SECRET` | Any 32+ character random string | ✅ YES |
| `NODE_ENV` | `production` | ✅ YES |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | ⚠️ Optional |
| `VITE_STRIPE_PUBLIC_KEY` | Your Stripe public key | ⚠️ Optional |

### Step 3: Build Script Update

The build script has been updated to use the latest drizzle-kit syntax:
```bash
npx drizzle-kit push
```

### Step 4: Redeploy and Monitor

1. **Redeploy** your app from Render dashboard
2. **Watch the logs** — you should see:
   ```
   ✅ Connected to database
   ✅ Setup complete
   ✅ ProFlix server successfully running on port XXXX
   ```

## Expected Success Logs

When deployment is successful, you should see:
```
🚀 Building ProFlix for production...
📦 Installing dependencies...
🗄️ Pushing database schema...
🔨 Building application...
✅ Build completed successfully!
Starting ProFlix server...
✅ Stripe initialized
✅ Connected to database
✅ ProFlix server successfully running on port 10000
```

## Common Issues & Solutions

### Issue 1: Database Connection Failed
**Symptom:** `Error: connection terminated`
**Solution:** 
- Verify DATABASE_URL has no quotes or encoding
- Check that Neon database is active (not paused)
- Ensure SSL mode is included in connection string

### Issue 2: Build Fails on drizzle-kit
**Symptom:** `drizzle-kit: command not found`
**Solution:** 
- The build script uses `npx drizzle-kit push` which is correct
- Ensure `drizzle-kit` is in dependencies (already included)

### Issue 3: Static Files Not Served
**Symptom:** React app shows blank page
**Solution:**
- Build process creates `dist/public/` directory
- Server serves static files from correct path in production

### Issue 4: Health Check Fails
**Symptom:** Render shows service unhealthy
**Solution:**
- Health endpoint is at `/health`
- Should return: `{"status":"healthy","timestamp":"...","environment":"production"}`

## Testing Your Deployment

After fixing DATABASE_URL and redeploying:

1. **Health Check:** Visit `https://your-app.onrender.com/health`
2. **Homepage:** Visit `https://your-app.onrender.com/`
3. **Database:** Check that categories load (should see 30 categories)
4. **Admin:** Try accessing `/admin-dashboard` (may need auth)

## Contact Support

If issues persist after fixing DATABASE_URL:
1. Check Render deployment logs for specific errors
2. Verify all environment variables are set correctly
3. Ensure build completes successfully before troubleshooting runtime issues

**Most Common Fix:** 90% of deployment issues are resolved by correctly setting the DATABASE_URL without quotes or encoding.