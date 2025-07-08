# ProFlix Render Deployment Guide

## Backend-Only Deployment for Render

Since you're deploying to Render, you'll need to modify the package.json build script for backend-only deployment.

### Required Package.json Changes

**Before deploying to Render, update your package.json scripts section:**

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

**Key Change:** Remove `vite build &&` from the build script - Render will only build the backend.

### Render Deployment Steps

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up and connect your GitHub account

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your ProFlix GitHub repository
   - Choose your branch (usually `main`)

3. **Configure Build Settings**
   - **Name**: `proflix`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Environment Variables**
   Add these in Render dashboard:
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   ```

5. **Custom Domain Setup**
   - In Render dashboard, go to "Settings" → "Custom Domains"
   - Add `proflix.app`
   - Configure DNS in Namecheap:
     - **Type**: CNAME
     - **Host**: @
     - **Value**: your-app-name.onrender.com

### Important Notes

- **Backend-only**: This deployment serves the React app from the Express server
- **Static files**: All frontend assets are served by Express
- **Database**: Continue using your existing Neon Database
- **SSL**: Render provides free SSL certificates
- **Cost**: Free tier available with limitations

### Troubleshooting

If the build fails:
1. Check that package.json has the correct build script (backend-only)
2. Ensure all environment variables are set
3. Verify database connection string is correct
4. Check Render build logs for specific errors

### Performance Optimization

- Render automatically handles scaling
- Free tier sleeps after 15 minutes of inactivity
- Paid plans ($7/month) keep your app always running

This setup will resolve the Replit Auth issue and give you full control over your domain.