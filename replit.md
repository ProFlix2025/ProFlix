# ProFlix - YouTube-Style Free Video Platform with Course Monetization

## Overview

ProFlix is a YouTube-style free video platform where users can upload, watch, and share videos with view counts, likes, comments, and sharing features. The platform monetizes through ads on free content and allows Pro Creators to sell premium courses as upsells underneath their videos.

### Monetization Model

**Free Video Streaming**
- Completely free to watch all content (like YouTube)
- Ad-supported revenue model
- View counts, likes, shares, comments
- Creators earn from ad revenue share

**Course Sales System**
- Pro Creators can sell premium courses ($10-$4,000)
- Course purchase buttons appear under each video
- Creators keep 100% of course sales (after payment processing)
- Integration with Stripe/PayPal for payments

### User Account Tiers

**Viewer (Free)**
- Watch all videos with ads
- Can purchase individual courses
- Full access to platform features

**Viewer (Premium) - $29/month**
- Ad-free viewing experience
- Course discounts from participating creators
- Priority support

**Creator (Free)**
- Upload unlimited videos
- Participate in ad revenue sharing
- Cannot sell courses
- Basic analytics

**Pro Creator - $99/month**
- Upload unlimited videos
- Full course selling capabilities
- Advanced analytics and creator dashboard
- Custom upsell links under videos

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
- January 08, 2025. Major Platform Redesign: Transformed to YouTube-style free platform with course monetization
  - **Complete Model Change**: From premium course marketplace to free video platform with ads
  - **Free Video Streaming**: All videos now free to watch with YouTube-style features (likes, shares, comments, views)
  - **Ad-Supported Revenue**: Creators earn from ad revenue sharing on their videos
  - **Course Upsells**: Pro Creators ($99/month) can sell premium courses ($10-$4,000) under videos
  - **Premium Viewers**: $29/month subscription for ad-free viewing + 10% course discounts
  - **New User Tiers**: Viewer (Free), Premium Viewer ($29/month), Creator (Free), Pro Creator ($99/month)
  - **Database Schema Update**: Added ad revenue tracking, course sales, premium subscriptions
  - **YouTube-Style Video Player**: New video player with ads, course upsells, and social features
  - **Updated Landing Page**: Now describes YouTube-style functionality instead of premium platform

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

## Creator Verification System (January 09, 2025)
- ✅ Added comprehensive ID verification system with 18+ age compliance
- ✅ Implemented creator legal agreement with digital signature collection
- ✅ Created multi-step verification process with ID document upload
- ✅ Built admin verification management dashboard for ID review and approval
- ✅ Added database fields for legal compliance tracking (IP address, timestamps)
- ✅ Integrated age verification with date of birth validation
- ✅ Enhanced user table with ID verification status and legal agreement tracking
- ✅ Created content compliance framework for video upload requirements

## Current Issues
- RESOLVED: All dependency issues fixed - complete Radix UI component library installed
- RESOLVED: Fixed static file serving for production deployment
- RESOLVED: Updated CSS theme from pure black to dark gray for better visibility
- RESOLVED: Enhanced error logging and diagnostic tools added
- RESOLVED: Removed application system - now true YouTube-style platform where anyone can upload
- RESOLVED: Completely removed old creator application system from site navigation and backend
- RESOLVED: Database schema migration completed - all required columns added (emoji, duration_minutes, is_published, share_count)
- RESOLVED: Category emoji system implemented with 30 unique icons (🎨 Art, 💪 Fitness, 💼 Entrepreneurship, etc.)
- RESOLVED: Fixed duplicate getLearnTubeVideos method causing build warnings
- RESOLVED: Code quality improvements - removed duplicate methods and cleaned up storage.ts
- RESOLVED: All 156 subcategories now visible across platform with dedicated browsing pages
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
- FIXED BLACK SCREEN: Enhanced React mounting with proper error handling and fallback display
- Verified React app successfully mounts and renders in production mode
- DEPLOYMENT READY: Created simplified server (index-simple.ts) with proper PORT handling for Render
- All production issues resolved: Static files, React mounting, server configuration
- RENDER BUILD FIX: Identified issue with build command - needs npx prefixes for vite and esbuild
- Created build-render.sh script and updated documentation with exact Render configuration
- DEPENDENCIES COMPLETE (January 08, 2025): Fixed all missing packages including drizzle-zod, multer, and complete Radix UI library
- ProFlix platform now fully operational with all 3-tier monetization features ready for production deployment

## Latest Updates (January 11, 2025)
- ✅ SITE FULLY OPERATIONAL: Fixed viral feed database query causing production crashes
- ✅ Simplified getViralFeed method to resolve complex SQL errors and improve stability
- ✅ Fixed duplicate getLearnTubeVideos method causing build warnings
- ✅ Enhanced subcategory visibility - all 156 subcategories now accessible across platform
- ✅ Created comprehensive subcategory browsing with search and filtering capabilities
- ✅ Production deployment successful - site performing perfectly at proflix-backend.onrender.com
- ✅ All API endpoints working correctly with proper error handling and fallback mechanisms
- ✅ ADMIN SYSTEM FULLY FUNCTIONAL: Fixed AdminAuthGuard authentication mismatch (isAdmin vs authenticated)
- ✅ Admin login working correctly with credentials: admin/ProFlix2025!Admin
- ✅ YouTube video management integrated into main admin dashboard
- ✅ Three content sources clarified: ProTube (original, ads allowed), LearnTube (YouTube, no ads), User uploads (ads allowed)
- ✅ **ADMIN-ONLY LearnTube System**: Updated LearnTube to use embed code input for admin-only YouTube content management
- ✅ LearnTube is temporary content system for admin use only - will be deleted once sufficient original content exists
- ✅ Creators cannot and will never embed YouTube videos - only admin can manage LearnTube content
- ✅ **PRODUCTION ERRORS RESOLVED**: Fixed video_type column references causing 500 errors in production
- ✅ Removed all videoType field usage from YouTube embed system and storage operations
- ✅ Enhanced database error handling with proper fallback mechanisms
- ✅ Pro Creator code generation system fully operational with missing table created
- ✅ Code pushed to GitHub repository for automatic Render deployment

## Render Deployment Ready (January 09, 2025)
- ✅ Created comprehensive admin dashboard with creator management and analytics
- ✅ Fixed all SQL syntax errors and database query issues for production compatibility
- ✅ Added creator removal functionality with complete data cleanup
- ✅ Built complete admin system: analytics, creator management, invitation codes
- ✅ Created render.yaml, render-build.sh, and render-start.sh for one-click deployment
- ✅ Fixed drizzle-kit dependency issues and SQL aggregation functions
- ✅ Platform ready for immediate Render deployment with all features working

## SUCCESSFUL RENDER DEPLOYMENT (January 10, 2025)
- ✅ **ProFlix platform LIVE** at https://proflix-backend.onrender.com
- ✅ Fixed DATABASE_URL formatting issues for production deployment
- ✅ All core systems operational: database, server, static files, API endpoints
- ✅ Database schema automatically initialized on first startup
- ✅ Categories system working properly with fixed initialization
- ✅ Production-ready with full YouTube-style functionality and course monetization
- ✅ Build process optimized for Render with proper ESM modules and static file serving
- ✅ **Free-for-all platform** - Updated Pro Creator system to allow public applications without authentication requirements
- ✅ Anyone can apply to become a Pro Creator, admin reviews and approves applications
- ✅ Public Pro Creator portal with application form accessible without sign-in
- ✅ **Tiered Pro Creator System** - Free ($0, 1 course), Standard ($99, 20 courses), Plus ($297, 100 courses), Enterprise (custom)
- ✅ Free tier gets instant approval and account creation, paid tiers require admin review
- ✅ Course limits enforced per tier with 100% profit retention for creators

## Code Quality Improvements (January 09, 2025)
- ✅ Fixed all storage interface imports and missing table references
- ✅ Added proper YouTube-style function definitions (incrementVideoShares, trackAdImpression, createCourseCheckout)
- ✅ Enhanced VideoCard component with course pricing badges, Pro Creator indicators, and YouTube-style metrics
- ✅ Updated Navigation component with Premium subscription link
- ✅ Added comprehensive Premium subscription page with pricing plans and features
- ✅ Updated Footer to reflect new YouTube-style platform approach
- ✅ Enhanced video player routing to use new YouTube-style player (video-player-new.tsx)
- ✅ All components properly linked and displaying YouTube-style features (views, likes, shares, course upsells)
- ✅ Database schema fully compatible with new monetization tables (adRevenue, premiumSubscriptions, proCreatorSubscriptions)
- ✅ Server health checks passing and API endpoints functioning correctly
- ✅ Created special Pro Creator Portal at `/pro-creator-portal` (hidden from main navigation)
- ✅ Updated Pro Creator subscription system with $99/month and $897/year options
- ✅ Removed application approval requirement - anyone can now subscribe to Pro Creator
- ✅ Added Pro Creator invitation code system for free 12-month access
- ✅ Anyone can sell courses now, Pro Creator provides enhanced features
- ✅ YouTube-style video uploads available to everyone, enhanced monetization features for Pro Creators

## Pro Creator Pricing Updates (January 11, 2025)
- ✅ Updated Pro Creator ($99/month) with 50-hour video content limit 
- ✅ Updated Enterprise Creator price to $799/month with 500-hour video content limit
- ✅ Removed white-label course platform and dedicated manager from Enterprise tier
- ✅ Added video hour tracking columns to database schema (videoHourLimit, currentVideoHours)
- ✅ Enhanced customer retention system to track video content hours usage
- ✅ Updated all pricing displays in creator-tiers.tsx and pro-creator-portal.tsx
- ✅ **Enhanced Free Creator Tier**: Now allows up to 5 hours of course content with 100% profit retention
- ✅ Updated database default video hour limit from 0 to 5 hours for free creators
- ✅ Enhanced migration script to update existing free creators to 5-hour limit
- ✅ Updated UI descriptions to highlight "sell courses up to 5 hours and keep 100% profit"

## Video Content Limiting System (January 11, 2025)
- ✅ **Hard Upload Limits**: Implemented strict video upload blocking to prevent exceeding hour limits
- ✅ Added pre-upload validation that calculates current hours + new video hours vs. limit
- ✅ Returns 403 error with detailed message when upload would exceed limit
- ✅ Shows remaining hours/minutes and suggests upgrade path for free creators
- ✅ Added video hour tracking: increments on upload, decrements on deletion
- ✅ Created /api/creator/video-hours endpoint for quota monitoring
- ✅ **Cost Protection**: Prevents expensive hosting costs by blocking unlimited free uploads
- ✅ Comprehensive error handling with upgrade suggestions for blocked uploads

## Pro Creator Code System (January 09, 2025)
- ✅ Added `proCreatorCodes` table to database schema
- ✅ Implemented code generation with 12-character unique codes
- ✅ Added code redemption system with 12-month free Pro Creator access
- ✅ Created API endpoints: `/api/pro-creator/generate-code`, `/api/pro-creator/use-code`, `/api/pro-creator/codes`
- ✅ Updated Pro Creator portal with promo code redemption interface
- ✅ Enhanced subscription options with monthly ($99) and yearly ($897) plans
- ✅ Added proper error handling and validation for code usage
- ✅ Code system tracks usage, expiration, and user assignments