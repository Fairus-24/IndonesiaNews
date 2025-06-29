# Rest Express - Indonesian News Portal

## Overview

This is a full-stack web application built as an Indonesian news portal. The application allows users to read articles, create accounts, bookmark content, and comment on articles. It features role-based access control with USER, ADMIN, and DEVELOPER roles, providing different levels of functionality based on user permissions.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and build processes
- **Theme**: Custom Indonesian-themed design with red and white color scheme

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Upload**: Multer for handling image uploads
- **Rate Limiting**: Express rate limiting for API protection
- **CORS**: Configured for cross-origin requests

## Key Components

### Database Schema
- **Users**: Stores user information with role-based access (USER, ADMIN, DEVELOPER)
- **Articles**: Main content with categories, authors, and publication status
- **Categories**: Content categorization system
- **Comments**: User comments on articles with approval system
- **Likes**: Article like/unlike functionality
- **Bookmarks**: User bookmark system for saving articles
- **Site Settings**: Global application configuration

### Authentication & Authorization
- **JWT Tokens**: 7-day expiration with user role information
- **Role-based Access**: Three levels of access (USER, ADMIN, DEVELOPER)
- **Middleware**: Protected routes with authentication verification
- **Rate Limiting**: Separate limits for general API and authentication endpoints

### API Structure
- **RESTful Design**: Standard HTTP methods for CRUD operations
- **Authentication Routes**: Register, login, and user profile management
- **Article Management**: CRUD operations with publish/unpublish functionality
- **Comment System**: Moderated comments with approval workflow
- **File Upload**: Image handling for article covers and user avatars

## Data Flow

1. **User Authentication**: Users register/login to receive JWT tokens
2. **Content Browsing**: Users can browse articles by category or search
3. **Content Interaction**: Authenticated users can like, bookmark, and comment
4. **Content Management**: Admins can create, edit, and publish articles
5. **Moderation**: Admins can approve/reject comments and manage users
6. **System Configuration**: Developers can modify site settings

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with custom styling
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date formatting

### Backend Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Security**: bcrypt, CORS, rate limiting
- **File Handling**: Multer for multipart form data

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL with connection pooling
- **File Storage**: Local file system for uploads
- **Environment**: Development-specific configurations

### Production
- **Build Process**: Vite build for frontend, esbuild for backend
- **Asset Serving**: Static file serving for uploaded content
- **Database**: Production PostgreSQL with Drizzle migrations
- **Security**: Rate limiting, CORS, and authentication middleware

### Key Architectural Decisions

1. **Monorepo Structure**: Shared types and schemas between frontend and backend
2. **TypeScript**: Full type safety across the entire application
3. **Drizzle ORM**: Chosen for type safety and PostgreSQL compatibility
4. **JWT Authentication**: Stateless authentication with role-based access
5. **Component-based UI**: Reusable components with consistent styling
6. **Server-side Validation**: Zod schemas for API request validation
7. **File Upload Strategy**: Local storage with configurable upload limits

## Changelog
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.