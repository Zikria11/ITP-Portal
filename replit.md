# VIS Program Portal - Replit Configuration

## Overview

This is a centralized web portal for the Volunteer in Service (VIS) Program with Islamabad Traffic Police. The application provides attendance management, scheduling, and highlights management to replace manual paperwork and WhatsApp-based communication with a professional digital platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Session Storage**: PostgreSQL table for user sessions
- **File Organization**: Shared schema definitions between client and server
- **Migration System**: Drizzle Kit for database schema migrations

## Key Components

### Database Schema
1. **Users Table**: Stores Replit Auth user information (id, email, names, profile image)
2. **Students Table**: Student profiles with registration numbers, batches, and approval status
3. **Admins Table**: Admin user profiles linked to the users table
4. **Attendance Table**: Daily attendance records linked to students and dates
5. **Highlights Table**: Daily program highlights with rich text descriptions
6. **Schedule Table**: Event scheduling with dates, times, and locations
7. **Sessions Table**: Express session storage for authentication

### Authentication & Authorization
- **Primary Authentication**: Replit Auth with OIDC integration
- **User Roles**: Admin and Student roles with different permissions
- **Student Registration**: Public registration with admin approval workflow
- **Session Management**: Secure session cookies with PostgreSQL storage

### Core Features
1. **Dashboard**: Overview with stats, today's schedule, and recent highlights
2. **Attendance Management**: Mark and view attendance with date filtering
3. **Student Management**: Admin tools for student approval and management
4. **Highlights System**: Create and archive daily program highlights
5. **Schedule Management**: Create and view program schedules
6. **Admin Management**: Admin user creation and management tools

## Data Flow

### Authentication Flow
1. User attempts to access protected route
2. Replit Auth middleware validates session
3. User information retrieved from database
4. Role-based access control applied based on admin/student status

### Attendance Flow
1. Admin selects date for attendance marking
2. System retrieves all approved students
3. Admin marks attendance status (present/absent)
4. Attendance records stored with student ID and date
5. Historical attendance can be viewed and filtered

### Student Registration Flow
1. Public user submits registration form
2. Student record created with "pending" status
3. Admin reviews and approves/rejects registration
4. Approved students gain access to student features

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router

### Authentication Dependencies
- **openid-client**: OIDC authentication with Replit
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for server
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Development Environment
- **Server Command**: `npm run dev` starts development server with tsx
- **Database**: Drizzle Kit manages schema and migrations
- **Hot Reload**: Vite provides fast refresh for frontend changes
- **Error Handling**: Replit-specific error overlay for development

### Production Build
- **Build Process**: Vite builds frontend, esbuild bundles server
- **Output Structure**: 
  - Frontend assets → `dist/public`
  - Server bundle → `dist/index.js`
- **Start Command**: `npm start` runs production server
- **Environment**: NODE_ENV=production for optimized builds

### Database Management
- **Schema Definition**: Single source of truth in `shared/schema.ts`
- **Migrations**: `npm run db:push` applies schema changes
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Session Store**: Automated session table management

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Secure session encryption key
- **REPL_ID**: Replit-specific authentication identifier
- **ISSUER_URL**: OIDC provider URL for authentication