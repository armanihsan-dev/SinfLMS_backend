
# SinfLMS - Modern Online Learning Platform

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-white.svg)](https://www.fastify.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**A robust, scalable backend for a comprehensive online learning platform with course management, real-time progress tracking, and social features.**

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [API](#api-documentation) • [Architecture](#architecture)

</div>

---

## About SinfLMS

SinfLMS is a comprehensive online learning and education platform designed to connect instructors with learners worldwide. It's a full-featured LMS (Learning Management System) that enables educators to create and manage courses, while students can enroll, learn, track progress, and earn certificates. The platform emphasizes community engagement through course reviews, wishlists, and peer learning.

Built with modern web technologies, SinfLMS provides a seamless learning experience with real-time progress tracking, interactive quizzes, and data-driven insights for both students and instructors.

---

## Overview

SinfLMS is a production-ready backend service that powers a modern online learning platform. It provides a complete ecosystem for course creation, student enrollment, progress tracking, and interactive learning with real-time analytics and notifications.

**Key Highlights:**

- **High-Performance** REST API built with Fastify
- **Enterprise-Grade Security** with OAuth 2.0 integration
- **Real-Time Analytics** tracking student progress and course engagement
- **Scalable Architecture** using PostgreSQL and Redis
- **Mobile-First** API design with comprehensive error handling
- **Type-Safe** codebase with full TypeScript support
- **Database Migrations** with Drizzle ORM for version control

---

## Features

### Core Learning Features

- **Course Management** - Create, update, and manage courses with rich metadata
- **Structured Learning Path** - Organize courses into sections and lessons
- **Progress Tracking** - Real-time tracking of student progress through lessons
- **Interactive Quizzes** - Create and manage quizzes with multiple question types
- **Certificates** - Issue certificates upon course completion
- **Reviews & Ratings** - Students can review and rate courses

### User Management

- **Multi-Auth Support** - Email/password, Google OAuth, GitHub OAuth
- **Role-Based Access Control** - Support for students, instructors, and admins
- **User Profiles** - Comprehensive user data with preferences
- **Session Management** - Secure session handling with Redis
- **Activity Tracking** - Audit logs and user activity history

### Learning Experience

- **Wishlists** - Save courses for later
- **Notifications** - Real-time notifications for course updates
- **Course Recommendations** - Categorized course discovery
- **Search & Filter** - Advanced search with tags and categories
- **Enrollment Management** - Track and manage course enrollments

### Analytics & Insights

- **Course Analytics** - Track course views and engagement metrics
- **Student Progress** - Detailed progress analytics for each course
- **Performance Metrics** - Quiz completion rates and scores
- **User Behavior** - Track user interactions and learning patterns

### Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Protect against abuse and brute force attacks
- **CORS Protection** - Configured cross-origin request handling
- **Security Headers** - Helmet.js for XSS, CSRF, and clickjacking protection
- **Password Hashing** - Industry-standard bcrypt encryption
- **Secure Cookies** - HttpOnly, Secure, and SameSite cookie flags
- **Request Validation** - Zod schema validation for all inputs

---

## Tech Stack

### Backend Framework

- **[Fastify](https://www.fastify.io/)** (v5.11.3) - High-performance web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### Database & ORM

- **[PostgreSQL](https://www.postgresql.org/)** via [Neon Serverless](https://neon.tech/) - Production database
- **[Drizzle ORM](https://orm.drizzle.team/)** (v0.45.2) - Type-safe database access
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Database migrations and schema management

### Caching & Sessions

- **[Redis](https://redis.io/)** via [ioredis](https://github.com/luin/ioredis) - Session and cache store
- **[Fastify Redis](https://github.com/fastify/fastify-redis)** - Redis integration

### Authentication & Authorization

- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Password hashing
- **[Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)** - Google OAuth
- **[Custom OAuth Services]** - GitHub OAuth integration

### API Documentation & Validation

- **[Fastify Swagger](https://github.com/fastify/fastify-swagger)** - OpenAPI documentation
- **[Swagger UI](https://github.com/fastify/fastify-swagger-ui)** - Interactive API docs
- **[Zod](https://zod.dev/)** (v4.4.3) - Runtime schema validation
- **[Zod to JSON Schema](https://github.com/StefanTerdell/zod-to-json-schema)** - Schema conversion

### Middleware & Security

- **[Fastify CORS](https://github.com/fastify/fastify-cors)** - Cross-origin request handling
- **[Fastify Helmet](https://github.com/fastify/fastify-helmet)** - Security headers
- **[Fastify Rate Limit](https://github.com/fastify/fastify-rate-limit)** - DDoS protection
- **[Fastify Cookie](https://github.com/fastify/fastify-cookie)** - Cookie handling
- **[Fastify Compress](https://github.com/fastify/fastify-compress)** - Response compression

### Logging & Monitoring

- **[Pino](https://getpino.io/)** (v10.3.1) - High-performance logger
- **[Pino Pretty](https://github.com/pinojs/pino-pretty)** - Pretty-print logs

### Development Tools

- **[TSX](https://tsx.is/)** - TypeScript execution
- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

---

## Quick Start

### Prerequisites

- **Node.js** 18+ with npm or yarn
- **PostgreSQL** 15+ (or [Neon](https://neon.tech/) for serverless)
- **Redis** 6+ (for session management and caching)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd techify/Backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/techify

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-here
COOKIE_SECRET=your-cookie-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

4. **Setup Database**

```bash
# Generate migrations
npm run db:gen

# Run migrations
npm run db:mig
```

5. **Start Development Server**

```bash
npm run dev
```

The server will start on `http://localhost:5000` and API docs will be available at `/documentation`

---

## Database Schema

### Entity Relationship Diagram

```
Users (Students/Instructors)
├── Enrollments (user -> course)
├── Lesson Progress (track user progress)
├── Reviews (user -> course)
├── Wishlists (user -> course)
├── Certificates (issued to users)
└── Notifications (sent to users)

Courses
├── Instructor (references Users)
├── Categories
├── Tags
├── Sections
│   └── Lessons
│       ├── Quizzes
│       │   └── Questions
│       └── Lesson Progress (track completion)
├── Enrollments (user enrollment)
├── Reviews
└── Analytics
    └── Course Views
```

### Core Tables

| Table               | Purpose                       | Key Fields                                        |
| ------------------- | ----------------------------- | ------------------------------------------------- |
| **users**           | User authentication & profile | id, email, username, role, isActive               |
| **courses**         | Course information            | id, title, description, slug, price, instructorId |
| **sections**        | Course structure              | id, title, courseId, order                        |
| **lessons**         | Learning content              | id, title, sectionId, content, videoUrl           |
| **enrollments**     | User-Course relationship      | id, userId, courseId, enrolledAt, completedAt     |
| **lesson_progress** | User progress tracking        | id, enrollmentId, lessonId, completed, progress   |
| **quizzes**         | Assessment items              | id, lessonId, title, totalQuestions               |
| **questions**       | Quiz questions                | id, quizId, text, type, options                   |
| **reviews**         | User feedback                 | id, userId, courseId, rating, comment             |
| **certificates**    | Completion certificates       | id, userId, courseId, issuedAt                    |
| **wishlists**       | Saved courses                 | id, userId, courseId, addedAt                     |
| **notifications**   | User notifications            | id, userId, type, message, isRead                 |
| **course_views**    | Analytics tracking            | id, courseId, userId, viewedAt                    |
| **categories**      | Course organization           | id, name, description                             |
| **tags**            | Course tagging                | id, name, slug                                    |

---

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Interactive Documentation

Access Swagger UI for complete API documentation:

```
http://localhost:5000/documentation
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "role": "student"
  }
}
```

#### OAuth Login (Google)

```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "google_id_token"
}
```

#### OAuth Callback (GitHub)

```http
GET /api/auth/github/callback?code=github_code
```

### Protected Endpoints

Include JWT token in Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Example: Get Current User

```http
GET /api/auth/me
Authorization: Bearer <jwt_token>

Response:
{
  "id": "user-id",
  "email": "user@example.com",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "profilePicture": "https://...",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Error Handling

Consistent error responses across all endpoints:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error: Invalid email format",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/auth/register"
}
```

---

## Architecture

### Project Structure

```
src/
├── app.ts                    # Fastify app builder
├── server.ts                 # Server entry point
├── config/
│   ├── database.ts          # Database configuration
│   ├── env.ts               # Environment validation
│   └── redis.ts             # Redis configuration
├── controllers/
│   ├── auth.controller.ts   # Authentication logic
│   └── ...
├── routes/
│   ├── index.ts             # Route aggregation
│   ├── Authentication.routes.ts
│   └── ...
├── services/
│   ├── github.service.ts    # GitHub OAuth service
│   ├── google.service.ts    # Google OAuth service
│   ├── session.service.ts   # Session management
│   └── ...
├── middleware/
│   └── auth.middleware.ts   # Authentication middleware
├── db/
│   ├── schema/              # Drizzle schema definitions
│   │   ├── users.schema.ts
│   │   ├── courses.schema.ts
│   │   ├── enrollments.schema.ts
│   │   └── ...
│   ├── migrations/          # SQL migrations
│   └── schemas/             # Zod validation schemas
├── utils/
│   ├── error-handler.ts     # Centralized error handling
│   ├── logger.ts            # Logging configuration
│   ├── handle-request.ts    # Request wrapper
│   └── zod-to-fastify.ts    # Schema conversion
├── types/
│   └── fastify.d.ts         # Type declarations
└── validators/              # Input validators
```

### Request Flow

```
Request
   ↓
CORS & Helmet (Security)
   ↓
Rate Limiter
   ↓
Compression
   ↓
Route Handler
   ↓
Authentication Middleware (if protected)
   ↓
Zod Validation
   ↓
Controller Logic
   ↓
Database Query (Drizzle)
   ↓
Error Handler (if error)
   ↓
Pino Logger
   ↓
Response
```

### Data Flow

```
Client Request
   ↓
Validation (Zod Schema)
   ↓
Controller (Business Logic)
   ↓
Database Layer (Drizzle ORM)
   ↓
PostgreSQL
   ↓
Cache Layer (Redis)
   ↓
Response Formatting
   ↓
Client Response
```

---

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run dev:watch       # Watch mode with auto-restart

# Production
npm run build           # Compile TypeScript to JavaScript
npm run start           # Run compiled server
npm run start:prod      # Run in production mode

# Database
npm run db:gen          # Generate new migrations
npm run db:mig          # Run pending migrations

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run test            # Run tests with Vitest
```

### Making Changes

1. **Adding a New Route**
   - Create controller in `src/controllers/`
   - Create route file in `src/routes/`
   - Define validation schema in `src/db/schemas/`
   - Register route in `src/routes/index.ts`

2. **Adding Database Tables**
   - Create schema in `src/db/schema/`
   - Export in `src/db/schema/index.ts`
   - Generate migration: `npm run db:gen`
   - Review migration in `src/db/migrations/`
   - Run migration: `npm run db:mig`

3. **Adding Middleware**
   - Create in `src/middleware/`
   - Register in `src/app.ts` before routes

---

## Performance & Optimization

### Built-in Optimizations

- **Compression** - Gzip/Deflate response compression
- **Redis Caching** - Session and data caching
- **Connection Pooling** - Database connection management
- **Request Deduplication** - Prevent duplicate requests
- **Rate Limiting** - Prevent abuse and DDoS
- **Database Indexing** - Optimized query performance

### Monitoring

Access logs with Pino:

```bash
npm run dev 2>&1 | grep "error"  # Filter errors only
```

---

## Security

### Implemented Security Measures

- **HTTPS Ready** - Works with SSL/TLS in production
- **CORS Configured** - Whitelist approved origins
- **Helmet.js** - HTTP security headers
- **Rate Limiting** - 100 requests per 15 minutes
- **CSRF Protection** - SameSite cookies
- **XSS Protection** - Content Security Policy
- **Password Security** - Bcrypt hashing (salt rounds: 10)
- **JWT Validation** - Secure token verification
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Parameterized queries via Drizzle

### Environment Variables

Never commit `.env` files. Use `.env.example` for reference:

```bash
git add .env.example
git add .gitignore  # Include .env
```

---

## Deployment

### Environment Setup

```bash
NODE_ENV=production
LOG_LEVEL=error
# Use production database URL
# Use production Redis
# Generate strong JWT and COOKIE secrets
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Cloud Platforms

- **Vercel/Netlify** - Not recommended (serverless, use serverless functions)
- **Railway** - Recommended (simple deployment)
- **Heroku** - Works well (with Procfile)
- **AWS EC2** - Full control
- **DigitalOcean App Platform** - Recommended
- **Render** - Recommended

### Database Hosting

- **Neon** - Serverless PostgreSQL (recommended for this setup)
- **Railway** - PostgreSQL included
- **AWS RDS** - Managed PostgreSQL
- **DigitalOcean Managed Databases**

---

## Scaling Strategies

1. **Horizontal Scaling**
   - Load balance multiple instances with Nginx
   - Use Redis for session sharing
   - Separate read replicas for reporting

2. **Vertical Scaling**
   - Increase server resources
   - Optimize database queries
   - Implement caching strategies

3. **Database Optimization**
   - Add indexes on frequently queried fields
   - Archive old analytics data
   - Use materialized views for reports

4. **Caching Strategy**
   - Cache course listings (invalidate on update)
   - Cache user profiles (invalidate on update)
   - Cache quiz questions (invalidate on update)
   - TTL-based expiration (30 minutes default)

---

## Troubleshooting

### Common Issues

**Issue: Redis Connection Failed**

```bash
# Verify Redis is running
redis-cli ping

# Check Redis URL in .env
REDIS_URL=redis://localhost:6379
```

**Issue: Database Migrations Fail**

```bash
# Reset to previous state
npm run db:mig  # Check current state

# Manually fix issues in migration file
npm run db:gen  # Generate fresh migration
```

**Issue: TypeScript Compilation Errors**

```bash
npm run lint
npm run format
npm run build
```

**Issue: JWT Token Expired**

- Generate new token at login
- Implement refresh token strategy
- Store tokens securely in client

---

## API Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Course Name"
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/endpoint"
}
```

---

## Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Guidelines

- Follow existing code style
- Run `npm run format` before committing
- Run `npm run lint` to check for errors
- Write meaningful commit messages
- Add tests for new features

---

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## Support

For support, email support@techify.com or open an issue on GitHub.

---

## Acknowledgments

Built with modern technologies:

- [Fastify](https://www.fastify.io/) - Amazing web framework
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database layer
- [PostgreSQL](https://www.postgresql.org/) - Reliable database
- [Neon](https://neon.tech/) - Serverless PostgreSQL

---

<div align="center">

**[⬆ back to top](#techify---modern-online-learning-platform)**

Made with passion by Techify Team

</div>
