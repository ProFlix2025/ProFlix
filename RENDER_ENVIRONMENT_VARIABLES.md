# RENDER ENVIRONMENT VARIABLES - COMPLETE SETUP

## Required Environment Variables for ProFlix

### Database Configuration
```
DATABASE_URL=postgresql://neondb_owner:npg_pER4a7qJwZQG@ep-soft-sea-adzrs31i-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Session Management
```
SESSION_SECRET=your-super-secret-session-key-here-change-this
```

### Stripe Payment Processing
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
```

### PayPal Payment Processing (Optional)
```
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

## How to Set These in Render

1. Go to https://dashboard.render.com
2. Click your ProFlix service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable above (Name = left side, Value = right side)
6. Click "Save Changes"

## Critical Notes
- DATABASE_URL must be exactly as shown (no quotes, no psql prefix)
- SESSION_SECRET should be a long random string
- Get Stripe keys from https://dashboard.stripe.com/apikeys
- PayPal keys are optional but recommended for payment flexibility

## After Setting Variables
Your service will automatically redeploy and should work perfectly.