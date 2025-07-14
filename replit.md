# Replit.md

## Overview

This is a modern full-stack web application built with a React frontend and Express.js backend. The project appears to be an audio transcription service that allows users to upload audio files and convert them to text using AI-powered transcription. The application uses TypeScript throughout and implements modern UI components with shadcn/ui.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Language: Thai/English bilingual interface preferred.

## Recent Issues & Solutions

### OpenAI API Rate Limiting (Latest)
- Issue: Users experiencing HTTP 429 "Too Many Requests" errors
- Solution: Added comprehensive error handling with specific Thai error messages
- User guidance: Wait 1-2 minutes between requests if rate limited
- File size limit: 25MB maximum for audio files

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
- **Client-side Audio Transcription**: Direct API integration with OpenAI Whisper and Google Gemini
- **Multi-Provider Support**: Users can choose between OpenAI and Gemini with their own API keys
- **API Key Validation**: Real-time validation of API keys before use
- **Automatic Language Detection**: Intelligent detection of Thai, English, Japanese, Chinese, and more
- **Audio Playback**: Built-in audio player for uploaded files and transcription history
- **Theme Support**: Dark/light mode toggle with persistent preferences
- **File Upload**: Drag-and-drop audio file upload with validation (MP3, WAV, M4A)
- **Transcription History**: Local storage-based history tracking with audio playback
- **Real-time Progress**: Progress indicators for transcription processing
- **Luxurious UI**: Premium styling with gradients, animations, and Thai/English interface

## Data Flow

1. **API Configuration**: Users select provider (OpenAI/Gemini) and validate their API keys
2. **File Upload**: Audio files are validated client-side for type and size restrictions
3. **Client-side Transcription**: Direct API calls to OpenAI Whisper or Google Gemini APIs
4. **Language Detection**: Automatic detection of spoken language using pattern matching
5. **Audio Processing**: File conversion to playable URLs with duration calculation
6. **Result Storage**: Transcription results stored locally with history tracking
7. **State Management**: React state management for real-time UI updates

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
- OpenAI Whisper API for high-accuracy audio transcription
- Google Gemini API for alternative transcription with multimodal capabilities
- Client-side integration without server-side API key storage
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