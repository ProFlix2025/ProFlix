# How to Fix Categories on Render - Step by Step

## Current Status
- Local development: ✅ Categories working (Art, Fitness, etc.)
- Production Render: ❌ Categories failing ("Failed to fetch categories")

## Root Cause
Database tables don't exist on production server.

## Fix Steps

### 1. Update Build Command on Render
1. Go to https://dashboard.render.com
2. Find your ProFlix service
3. Go to Settings
4. Change "Build Command" from:
   ```
   npm install && npm run build
   ```
   To:
   ```
   npm install && npm run db:push && npm run build
   ```

### 2. Redeploy
1. Click "Manual Deploy" > "Deploy latest commit"
2. Wait for build to complete
3. The `npm run db:push` will create database tables

### 3. Verify Fix
After deployment, check:
- https://proflix-backend.onrender.com/api/categories
- Should return JSON array with 10 categories instead of error

## What This Does
- `npm run db:push` creates PostgreSQL tables using Drizzle ORM
- Categories, subcategories, users, videos tables will be created
- Your ProFlix 3-tier video platform will be fully functional

## Expected Result
Categories will load:
```json
[
  {"id":1,"name":"Art","slug":"art","description":"Creative arts..."},
  {"id":2,"name":"Fitness","slug":"fitness","description":"Health..."},
  {"id":3,"name":"Entrepreneurship","slug":"entrepreneurship"...},
  // ... 7 more categories
]
```

## If Build Command Change Doesn't Work
Alternative: Connect to Render shell and run:
```bash
npm run db:push
```