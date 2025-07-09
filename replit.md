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
- 10% discount on all course purchases
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

## Current Issues
- RESOLVED: All dependency issues fixed - complete Radix UI component library installed
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
- FIXED BLACK SCREEN: Enhanced React mounting with proper error handling and fallback display
- Verified React app successfully mounts and renders in production mode
- DEPLOYMENT READY: Created simplified server (index-simple.ts) with proper PORT handling for Render
- All production issues resolved: Static files, React mounting, server configuration
- RENDER BUILD FIX: Identified issue with build command - needs npx prefixes for vite and esbuild
- Created build-render.sh script and updated documentation with exact Render configuration
- DEPENDENCIES COMPLETE (January 08, 2025): Fixed all missing packages including drizzle-zod, multer, and complete Radix UI library
- ProFlix platform now fully operational with all 3-tier monetization features ready for production deployment