# ProFlix Deployment Guide

## Overview
This guide helps you deploy ProFlix to your own domain (proflix.app) using Namecheap hosting.

## Prerequisites
- Namecheap domain (proflix.app)
- Namecheap hosting plan or VPS
- Node.js hosting support
- PostgreSQL database access

## Recommended Deployment Options

### Option 1: Railway (Recommended - Easiest)
**Perfect for Node.js apps with database**
1. Go to railway.app and sign up
2. Connect your GitHub account
3. Deploy from GitHub repository
4. Railway auto-detects Node.js and runs build commands
5. Point your Namecheap domain to Railway
6. Cost: ~$5-20/month

### Option 2: Render (Great for Backend-focused apps)
**Perfect for Node.js with built-in frontend serving**
1. Go to render.com and sign up
2. Create "Web Service" from GitHub
3. Backend-only build (see RENDER_DEPLOYMENT.md)
4. Configure environment variables
5. Point your domain to Render
6. Cost: Free tier available, $7/month for production

### Option 3: Vercel (Great for Full-Stack)
**Excellent for React + API**
1. Go to vercel.com and sign up
2. Import your project from GitHub
3. Configure environment variables
4. Deploy automatically
5. Point your domain to Vercel
6. Cost: Free tier available

### Option 4: DigitalOcean App Platform
**Good balance of control and simplicity**
1. Create DigitalOcean account
2. Use App Platform to deploy
3. Connect GitHub repository
4. Configure domain
5. Cost: ~$5-12/month

## Step-by-Step Deployment with Railway (Recommended)

### 1. Prepare Your Code
Your project is already ready! The build commands are set up correctly.

### 2. Set Up Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your ProFlix repository
5. Railway will automatically detect it's a Node.js app

### 3. Configure Environment Variables
In Railway dashboard, add these environment variables:
```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
REPLIT_DOMAINS=proflix.app
REPL_ID=your_replit_app_id
```

### 4. Configure Your Domain in Namecheap
1. Log into Namecheap account
2. Go to "Domain List" → Click "Manage" next to proflix.app
3. Go to "Advanced DNS" tab
4. Add these records:
   - **Type**: A Record, **Host**: @, **Value**: [Railway IP]
   - **Type**: CNAME, **Host**: www, **Value**: [Railway domain]
5. Railway will provide the exact IP/domain in their dashboard

### 5. Enable Custom Domain in Railway
1. In Railway dashboard, go to your project
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter "proflix.app" and "www.proflix.app"
5. Railway will provide DNS instructions

## Database Setup
- Use Neon Database (current setup) or migrate to hosting provider's PostgreSQL
- Run database migrations: `npm run db:push`

## Next Steps
1. Choose hosting option
2. Configure domain DNS
3. Set up environment variables
4. Deploy application
5. Test functionality

## Support
- Namecheap support for hosting questions
- ProFlix works perfectly on custom domains (no forced authentication)