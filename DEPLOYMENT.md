# ProFlix Deployment Guide

## Render Deployment Configuration

### Build Command
```bash
npm install && npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

### Start Command
```bash
node dist/index.js
```

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production`
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal client secret

### Build Output Structure
```
dist/
├── public/
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js
│       └── index-[hash].css
└── index.js (server bundle)
```

### Features Included
- 3-tier video monetization system
- Stripe payment processing
- PayPal integration
- Creator dashboard
- Video streaming and purchase system
- User authentication
- Category management
- Responsive design

### Deployment Steps
1. Set build command in Render dashboard
2. Set start command in Render dashboard
3. Configure all environment variables
4. Deploy with "Clear Build Cache" option