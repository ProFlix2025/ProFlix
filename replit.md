# ProFlix - 3-Tier Video Monetization Platform

## Overview

ProFlix is a Netflix-style video platform with a sophisticated 3-tier monetization system that maximizes revenue for both creators and the platform. Creators can monetize through streaming royalties, direct sales, and premium courses while viewers access content through subscriptions or individual purchases.

### 3-Tier Video Model

**1. Streaming Videos (Subscription)**
- $29/month unlimited access (1-month free trial)
- All creators must donate 1 video to streaming library
- 70% of subscription revenue distributed to creators based on watch time
- Platform keeps 30%

**2. Basic Videos (< $99)**
- Direct sales through platform payment processing
- Platform takes 30% commission
- Creator keeps 70%
- Also available to streaming subscribers

**3. Premium Videos ($100-$4,000)**
- High-ticket courses and bundles
- Creators use their own PayPal/Stripe checkout links
- Creator keeps 100% of revenue
- Platform hosts content but takes no commission

### Creator Account Tiers

**Free Creators**
- Up to 5 hours of video uploads
- Can sell basic and premium videos
- Must donate 1 video to streaming

**Pro Creators ($199/month)**
- Up to 500 hours of video uploads
- Full creator dashboard and analytics
- Advanced course building tools
- Priority support

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with Netflix-inspired dark theme
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Multer for handling video and image uploads
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)

### Key Design Patterns
- **Monorepo Structure**: Client, server, and shared code in a single repository
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Component-Based UI**: Reusable UI components with consistent styling
- **API-First Design**: RESTful API with clear separation of concerns

## Key Components

### Authentication System
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-backed sessions
- **User Roles**: Creator and Viewer roles with role-based access control
- **Authorization**: Protected routes and middleware for secure access

### Video Management
- **Upload System**: File upload with validation for video and thumbnail files
- **Storage**: Local file system storage with served static files
- **Metadata**: Title, description, duration, categories, and subcategories
- **View Tracking**: Automatic view count increment on video play

### Content Organization
- **Categories**: Top-level content categories (Art, Fitness, etc.)
- **Subcategories**: Nested organization within categories
- **Search**: Full-text search across video titles and descriptions
- **Browsing**: Netflix-style grid layouts and navigation

### User Interface
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Dark Theme**: Netflix-inspired color scheme with red accents
- **Navigation**: Persistent navigation with user authentication status
- **Video Player**: HTML5 video player with custom controls

## Data Flow

### User Authentication Flow
1. User clicks "Get Started" on landing page
2. Redirected to `/api/login` for Replit Auth
3. OpenID Connect flow with Replit
4. User session created and stored in PostgreSQL
5. User redirected to authenticated areas

### Video Upload Flow
1. Creator navigates to dashboard
2. Form submission with video file, thumbnail, and metadata
3. Multer middleware handles file upload to local storage
4. Database record created with file paths and metadata
5. Video appears in creator's dashboard and public listings

### Content Discovery Flow
1. Homepage displays featured content and categories
2. Users browse by category or search
3. Video grid displays with thumbnail previews
4. Click to navigate to video player page
5. View count incremented on video play

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI Components**: Radix UI primitives, Lucide React icons
- **State Management**: TanStack Query for server state
- **Database**: Drizzle ORM with Neon Database driver
- **Authentication**: Passport.js with OpenID Connect strategy

### Development Tools
- **Build Tools**: Vite, TypeScript, ESBuild
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Development**: Replit-specific plugins and error handling

### File Upload & Storage
- **Multer**: Multipart form data handling
- **File System**: Local storage with Express static middleware
- **Validation**: File type and size restrictions

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with HMR
- **Database**: Neon Database with development connection
- **File Storage**: Local uploads directory
- **Authentication**: Replit Auth development configuration

### Production Build
- **Frontend**: Vite build with optimized bundles
- **Backend**: ESBuild bundling for Node.js deployment
- **Static Assets**: Served by Express in production
- **Database**: Production Neon Database connection

### Environment Configuration
- **Database URL**: PostgreSQL connection string
- **Session Secret**: Secure session encryption key
- **Authentication**: Replit Auth client configuration
- **File Uploads**: Configurable upload directory

## Changelog

Changelog:
- July 06, 2025. Initial setup
- July 07, 2025. Major transformation: Converted from YouTube-style free platform to premium course marketplace
  - Added creator application system with detailed vetting process
  - Implemented subscription tiers: Free (8hrs), Basic $29/month (20hrs), Premium $199/month (100hrs)
  - Added course pricing system ($10-$1000 range) with 80/20 revenue split
  - Integrated Stripe payment processing for course purchases
  - Created course purchase flow with secure payment handling
  - Added creator earnings tracking and purchase history
  - Code cleanup and TypeScript optimization: Fixed all TypeScript errors, improved type safety
  - Enhanced Creator Dashboard with proper API integration for analytics, earnings, and payout history
  - Added PayPal integration routes for alternative payment processing
  - Improved Navigation component with proper user authentication handling
  - Removed subscription system and replaced with Favorites functionality
  - Added video sharing capability with unique share tokens
  - Created dedicated Favorites page with remove and share options
  - Updated database schema with favorites and shared videos tables
  - Implemented complete 2-minute free preview system with paywall overlay and countdown timer
  - Added "FREE PREVIEW" badges to video cards when creators enable preview option
  - Created comprehensive Privacy Policy page (effective January 07, 2025) and added to footer
  - Enhanced video player with preview monitoring and purchase verification functionality

## User Preferences

Preferred communication style: Simple, everyday language.

## Deployment Status

- January 07, 2025: Platform ready for deployment to proflix.app
- January 08, 2025: Removed all Replit dependencies for successful deployment on Render/other platforms
- Production-ready features: Complete payment processing, creator monetization, 2-minute previews
- Security: Added error boundaries, security headers, environment validation
- Public access: Website browsing works without authentication, sign-in only required for purchases
- Authentication: Replaced Replit Auth with platform-agnostic authentication system
- Next steps: Deploy to Render or other hosting platforms without REPLIT_DOMAINS errors

## Current Issues
- RESOLVED: Fixed static file serving for production deployment
- RESOLVED: Updated CSS theme from pure black to dark gray for better visibility
- RESOLVED: Enhanced error logging and diagnostic tools added
- Database: postgresql://neondb_owner:npg_pER4a7qJwZQG@ep-soft-sea-adzrs31i-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

## Recent Fixes (January 08, 2025)
- Removed all REPLIT_DOMAINS environment variable dependencies
- Replaced replitAuth.ts with simpleAuth.ts for production deployment
- Created fallback authentication system that doesn't rely on Replit-specific code
- Server now runs without REPLIT_DOMAINS errors on any hosting platform
- Fixed .replit configuration conflicts (removed autoscale deployment)
- Updated build.sh script for proper Render deployment structure
- Verified static file serving works correctly in production mode
- Fixed server port configuration to use PORT environment variable for Render deployment
- Resolved 502 errors by making server port dynamic (Render compatibility)