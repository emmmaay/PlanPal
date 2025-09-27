# YCT ND1 Computer Science Educational Platform

## Overview
A comprehensive, modern, student-centered web application that combines course management, engagement, notifications, gamification, and a global anonymous space. Built with React, Express, TypeScript, and Supabase.

## Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: 
  - Frontend: Vercel
  - Backend: Ubuntu Cloud Server
  - Database: Supabase (multiple instances)

### Database Architecture
The application uses a **decentralized database approach**:

1. **Main Database** (Creator's Supabase)
   - User management and authentication
   - Course registry and metadata
   - Global notifications and settings
   - Role-based permissions
   - Global pinned posts and badges

2. **Course-Specific Databases** (Course Rep's Supabase)
   - Course posts (assignments, announcements)
   - Comments and reactions
   - Assignment tracking
   - Course leaderboards and statistics

### User Hierarchy
1. **Creator** (Ultimate Admin) - Cannot be removed, full system control
2. **Top Admins** (Executives) - Global platform management
3. **Course Admins** - Course-specific management
4. **Users** - Students and regular users

## Features

### Core Sections
1. **Dashboard** - Overview of courses, assignments, notifications, badges
2. **Courses** - Course management, assignments, discussions
3. **Discussions** - Open discussion area with identity shown
4. **Anonymous Hub** - Global anonymous posting (toggleable by admins)
5. **Pinned Posts** - Admin-controlled announcements
6. **Admin Panel** - User and course management

### Key Features
- Real-time notifications
- Gamification (badges, leaderboard)
- Multi-course support with independent databases
- Anonymous posting with admin controls
- File uploads (images, videos, documents)
- Assignment tracking and deadlines
- Responsive design with dark/light themes

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── auth.ts            # Authentication middleware
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   └── supabase.ts        # Supabase client configuration
├── shared/                 # Shared TypeScript types and schemas
├── sql/                    # Database setup scripts
│   ├── main-database-setup.sql       # Main database schema
│   └── course-database-setup.sql     # Course database schema
└── package.json           # Dependencies and scripts
```

## Development Guidelines

### Code Standards
- TypeScript throughout the application
- Zod schemas for data validation
- TanStack Query for data fetching
- Shadcn/ui for consistent UI components
- Tailwind CSS for styling

### Security
- Row Level Security (RLS) on all database tables
- Service role access for course databases
- JWT-based authentication
- Input validation with Zod schemas

## Recent Changes
- Complete database schema implementation
- Authentication system with hierarchical roles
- Multi-database course management system
- Real-time notifications and updates
- Comprehensive UI with dark mode support

## User Preferences
- Clean, modern interface design
- Mobile-first responsive approach
- Comprehensive error handling
- No placeholder/mock data in production
- Focus on reliability and user experience

## Next Steps
1. Configure Supabase credentials
2. Deploy to production environments
3. Set up course rep onboarding process
4. Implement media upload functionality
5. Add comprehensive testing suite

## Development Notes
- Uses in-memory storage for development
- Supabase integration for production
- Deployment ready for Vercel + Ubuntu Cloud
- Complete SQL scripts provided for database setup