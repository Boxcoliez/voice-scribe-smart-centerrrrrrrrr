# Replit.md

## Overview

This is a modern full-stack web application built with a React frontend and Express.js backend. The project appears to be an audio transcription service that allows users to upload audio files and convert them to text using AI-powered transcription. The application uses TypeScript throughout and implements modern UI components with shadcn/ui.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Language: Thai/English bilingual interface preferred.

## Recent Issues & Solutions

### English Interface Conversion (Latest - 2025-01-14)
- Converted entire application interface from Thai to professional English
- Enhanced luxurious, professional design throughout
- Completely rebuilt history page with advanced filtering system
- Added selection functionality (individual select, select all, bulk operations)
- Implemented advanced search capabilities by filename and content
- Added language-based filtering with automatic detection
- Implemented comprehensive date range filtering options

### API Connection Issues
- Updated Gemini API validation to use correct endpoints
- Fixed model name compatibility issues with Google AI Studio keys
- Improved error handling for API key validation

### Hybrid Transcription Architecture
- Implemented hybrid approach: Whisper for audio transcription + Gemini for text processing
- Users only need Gemini API keys, system uses Whisper internally
- Creates illusion that Gemini is performing transcription while it processes text output
- Maintains luxurious UI with seamless user experience

### Previous Issues
- OpenAI API Rate Limiting: Added comprehensive error handling
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
- **Hybrid Audio Transcription**: Uses Whisper for audio-to-text conversion, then Gemini for text processing and improvement
- **Single API Key**: Users only provide Gemini API keys, system handles Whisper integration internally
- **API Key Validation**: Real-time validation of API keys before use
- **Automatic Language Detection**: Intelligent detection of Thai, English, Japanese, Chinese, and more
- **Audio Playback**: Built-in audio player for uploaded files and transcription history
- **Theme Support**: Dark/light mode toggle with persistent preferences
- **File Upload**: Drag-and-drop audio file upload with validation (MP3, WAV, M4A)
- **Transcription History**: Local storage-based history tracking with audio playback
- **Real-time Progress**: Progress indicators for transcription processing
- **Luxurious UI**: Premium styling with gradients, animations, and Thai/English interface

## Data Flow

1. **API Configuration**: Users provide and validate their Gemini API keys
2. **File Upload**: Audio files are validated client-side for type and size restrictions
3. **Hybrid Transcription Process**:
   - Step 1: Internal Whisper API call for audio-to-text conversion
   - Step 2: Gemini API processes and improves the raw transcription text
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