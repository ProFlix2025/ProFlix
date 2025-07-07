# ProFlix - Premium Course Platform

A Netflix-style video platform for industry professionals to share and monetize premium courses.

## Features

- **Creator Course Marketplace**: Vetted creators can upload and sell courses ($10-$1000)
- **2-Minute Free Previews**: Users can preview courses before purchasing
- **Secure Payments**: Stripe and PayPal integration with 80/20 revenue split
- **Content Organization**: 40+ categories with subcategories
- **User Favorites**: Save and share favorite courses
- **Creator Dashboard**: Analytics, earnings, and payout tracking

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, PostgreSQL, Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Payments**: Stripe, PayPal
- **Database**: Neon PostgreSQL (serverless)

## Environment Variables

Required for production:

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your_session_secret
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
REPL_ID=your_repl_id
REPLIT_DOMAINS=your-domain.replit.app
```

## Getting Started

1. Clone and set environment variables
2. Run `npm install`
3. Run `npm run db:push` to setup database
4. Run `npm run dev` to start development server

## Production Deployment

The app is configured for Replit Deployments with:

- Security headers and CSP
- Error boundaries and logging
- Health check endpoint at `/health`
- File upload validation
- Rate limiting

## API Documentation

### Core Endpoints

- `GET /api/videos` - List all videos
- `GET /api/categories` - List all categories  
- `POST /api/videos` - Upload new video (creators only)
- `POST /api/create-payment-intent` - Stripe payment
- `POST /api/paypal/order` - PayPal payment

### Authentication

- `GET /api/login` - Start auth flow
- `GET /api/logout` - End session
- `GET /api/auth/user` - Current user info

## Content Guidelines

- Videos: MP4, MOV, AVI (max 500MB)
- Thumbnails: JPEG, PNG, WebP (max 5MB)
- Courses: $10-$1000 price range
- Creator applications required

## Support

Email: support@proflix.app