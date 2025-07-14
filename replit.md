# Replit.md

## Overview

This is a modern full-stack web application built with a React frontend and Express.js backend. The project appears to be an audio transcription service that allows users to upload audio files and convert them to text using AI-powered transcription. The application uses TypeScript throughout and implements modern UI components with shadcn/ui.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state

## Key Components

### Frontend Architecture
- **Build Tool**: Vite with React plugin and TypeScript support
- **Component Library**: shadcn/ui providing comprehensive UI components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for API data fetching and caching
- **Routing**: React Router for client-side navigation
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution in development

### Database Schema
- Uses PostgreSQL as the primary database
- Drizzle ORM provides type-safe database operations
- Current schema includes a users table with id, username, and password fields
- Migrations are managed through Drizzle Kit

### Key Application Features
- **Audio Transcription**: Core functionality for uploading and processing audio files
- **API Key Management**: Component for managing transcription service API keys
- **Theme Support**: Dark/light mode toggle with persistent preferences
- **File Upload**: Drag-and-drop audio file upload with validation
- **Transcription History**: Local storage-based history tracking
- **Real-time Progress**: Progress indicators for transcription processing

## Data Flow

1. **User Authentication**: Basic user system with username/password storage
2. **File Upload**: Audio files are validated client-side and processed
3. **API Integration**: External transcription service integration via API keys
4. **Result Storage**: Transcription results stored locally with history tracking
5. **State Management**: TanStack Query manages server state and caching

## External Dependencies

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography

### Development Tools
- Vite for fast development and building
- TypeScript for type safety
- ESBuild for backend bundling

### Database and ORM
- Neon Database serverless PostgreSQL
- Drizzle ORM for database operations
- Drizzle Kit for migrations

### External Services
- Audio transcription API (configurable via API key)
- Replit-specific development tools and banner

## Deployment Strategy

The application is configured for deployment on Replit with:

- **Development**: `npm run dev` starts the TypeScript server with hot reload
- **Build**: `npm run build` creates production builds for both frontend and backend
- **Production**: `npm start` runs the compiled server
- **Database**: Uses Neon Database with connection via DATABASE_URL environment variable

The build process:
1. Frontend builds to `dist/public` using Vite
2. Backend compiles to `dist/index.js` using ESBuild
3. Static files are served by Express in production
4. Database migrations are applied via `npm run db:push`

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string for Neon Database
- Node.js environment with ES modules support
- Optional: API keys for transcription services

The architecture prioritizes developer experience with hot reload, type safety, and modern tooling while maintaining production readiness with proper build processes and database management.