# ProFlix - Professional Video Course Platform

ProFlix is an exclusive paid course platform for industry professionals, featuring Netflix-style browsing, secure payments, and creator monetization.

## 🚀 Features

- **Premium Course Marketplace**: Creators sell video courses ($10-$1000) with 80/20 revenue split
- **Netflix-Style Interface**: Professional browsing experience with categories and search
- **2-Minute Free Previews**: Secure preview system with purchase prompts
- **Saved Card + PIN**: Quick purchase system for returning customers
- **Dual Payment Processing**: Stripe and PayPal integration
- **Creator Dashboard**: Analytics, earnings tracking, and content management
- **Public Browsing**: No authentication required for browsing, only for purchases

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, Drizzle ORM
- **Database**: PostgreSQL (Neon Database)
- **Authentication**: Replit Auth with OpenID Connect
- **Payments**: Stripe, PayPal
- **Hosting**: Ready for Railway, Vercel, or custom deployment

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/proflix.git
cd proflix

# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to:
- Railway (Recommended)
- Vercel
- DigitalOcean
- Custom hosting

## 📋 Environment Variables

```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
REPLIT_DOMAINS=your_domain.com
```

## 🎯 Key Routes

- `/` - Landing page for non-authenticated users, home for authenticated
- `/apply` - Creator pre-application form
- `/category/:slug` - Browse videos by category
- `/video/:id` - Video player with preview/purchase system
- `/creator-dashboard` - Creator analytics and content management
- `/favorites` - User's saved content

## 💳 Payment Flow

1. **Browse**: Public access to video catalog and previews
2. **Preview**: 2-minute free preview for all courses
3. **Purchase**: Secure checkout with Stripe/PayPal
4. **Access**: Instant access to full course content

## 🔐 Security Features

- Secure session management
- Environment validation
- Rate limiting
- CORS protection
- Input sanitization

## 📱 Future Plans

- Mobile applications (iOS/Android)
- Advanced analytics
- Live streaming capabilities
- Community features

## 🤝 Contributing

This is a proprietary platform. Contact the development team for contribution guidelines.

## 📄 License

Private/Proprietary - All rights reserved.

---

**ProFlix** - Empowering Professional Education