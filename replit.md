# VR Mental Wellness Sanctuary - Serenity VR

## Overview

Serenity VR is a comprehensive mental wellness application designed for high school and college students experiencing anxiety, stress, or social isolation. The platform provides immersive VR environments, mood tracking, breathing exercises, meditation sessions, and community support features to create a holistic mental wellness experience.

## System Architecture

The application follows a full-stack monorepo architecture with a clear separation between frontend and backend concerns:

**Frontend**: React-based SPA with TypeScript, using Vite for build tooling and TailwindCSS + shadcn/ui for styling
**Backend**: Express.js REST API with TypeScript support
**Database**: PostgreSQL with Drizzle ORM for type-safe database operations
**Authentication**: Replit Auth integration with session management
**Real-time Features**: WebSocket support for community chat and live updates
**3D Graphics**: Three.js for immersive VR environment rendering

## Key Components

### Frontend Architecture
- **Client Directory**: Contains the React application with component-based architecture
- **UI System**: shadcn/ui components for consistent design language
- **State Management**: TanStack Query for server state and local React state for UI
- **Routing**: Wouter for lightweight client-side routing
- **3D Rendering**: Three.js scenes for forest, beach, and mountain environments
- **Mobile-First Design**: Responsive layouts with dedicated mobile navigation

### Backend Architecture
- **Express Server**: RESTful API with middleware for authentication and logging
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe operations
- **Authentication System**: Replit Auth with session storage in PostgreSQL
- **WebSocket Support**: Real-time communication for community features
- **Storage Interface**: Abstracted storage layer for data operations

### Database Schema
- **Users**: Replit Auth user management with profile information
- **Mood Entries**: Daily mood tracking with numerical scales (1-10)
- **Meditation Sessions**: Session tracking with duration and environment data
- **Breathing Exercises**: Guided breathing session records
- **Community Messages**: Anonymous and identified chat messages
- **Achievements & Challenges**: Gamification elements for user engagement
- **Sessions**: Replit Auth session storage

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, creating sessions stored in PostgreSQL
2. **Mood Tracking**: Users input daily mood data through sliders, stored with timestamps
3. **VR Environments**: Three.js renders immersive scenes with session tracking
4. **Community Features**: WebSocket connections enable real-time chat with moderation
5. **Progress Analytics**: Aggregated user data provides insights and trend visualization
6. **API Integration**: External APIs for crisis resources and meditation content

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database using Neon serverless
- **Drizzle ORM**: Type-safe database operations with schema validation
- **Zod**: Runtime type validation for API requests

### Authentication & Sessions
- **Replit Auth**: OAuth-based authentication system
- **express-session**: Session management with PostgreSQL storage
- **connect-pg-simple**: PostgreSQL session store

### Frontend Libraries
- **React**: UI framework with hooks and functional components
- **TanStack Query**: Server state management and caching
- **Three.js**: 3D graphics rendering for VR environments
- **Wouter**: Lightweight routing solution
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Radix-based component library

### Development Tools
- **Vite**: Build tool with HMR and TypeScript support
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Production bundling for server code

## Deployment Strategy

The application is designed for Replit deployment with the following considerations:

1. **Development Mode**: Vite dev server with HMR for rapid development
2. **Production Build**: Static assets served from Express with optimized bundles
3. **Database**: Neon PostgreSQL for serverless database hosting
4. **Environment Variables**: DATABASE_URL, SESSION_SECRET, and Replit-specific vars
5. **Asset Management**: Static file serving through Express middleware
6. **WebSocket Support**: Integrated with HTTP server for real-time features

The build process creates production-ready bundles for both client and server code, with the Express server serving the React application and API endpoints from a single deployment.

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```