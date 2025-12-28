# Notely Backend API

A powerful and flexible backend API for Notely - a modern note-taking application built with NestJS, Prisma, and PostgreSQL. This backend provides comprehensive features for user management, page organization, and rich content blocks with drag-and-drop functionality.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)

## ✨ Features

### 1. User Management
- ✅ **Supabase Authentication**: Email/password authentication managed by Supabase
- ✅ **Auto User Sync**: Automatically syncs Supabase users to local database
- ✅ Profile management (update name and avatar)
- ✅ **Email Verification**: Built-in email confirmation support
- ✅ **Secure Token Validation**: Direct token verification with Supabase API

### 2. Page Management
- ✅ Create unlimited pages
- ✅ Edit page titles
- ✅ Delete pages (with cascade deletion of blocks)
- ✅ List all user pages
- ✅ Automatic sorting by last updated

### 3. Block Content Management
- ✅ **Text Blocks**: Rich text with formatting (bold, italic, underline)
- ✅ **Heading Blocks**: Three levels (H1, H2, H3)
- ✅ **Checklist Blocks**: Interactive todo lists with checkable items
- ✅ **Image Blocks**: Images from URLs with captions
- ✅ **File Blocks**: Upload files directly (images, videos, PDFs, documents)
- ✅ **Drag & Drop**: Reorder blocks with position management
- ✅ **Auto-save**: All changes saved to database
- ✅ CRUD operations for all block types

### 4. File Upload & Storage
- ✅ **Cloudinary Integration**: Upload files directly to Cloudinary
- ✅ **Multiple File Types**: Support for images, videos, PDFs, documents
- ✅ **File Optimization**: Automatic image optimization and format conversion
- ✅ **Secure Storage**: Files stored securely in Cloudinary
- ✅ **File Management**: Upload, delete, and manage files via API

### 5. Security Features
- ✅ **Supabase Auth**: Enterprise-grade authentication
- ✅ **Token Validation**: Direct verification with Supabase API
- ✅ User data isolation
- ✅ Access control (users can only access their own data)
- ✅ CORS configuration
- ✅ Input validation
- ✅ **Email Verification**: Optional email confirmation

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/) v6
- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Validation**: class-validator, class-transformer
- **Package Manager**: pnpm

## 🔐 Authentication with Supabase

This backend uses **Supabase Auth** for authentication. Here's how it works:

### How It Works

1. **Client-Side**: Users sign up/login via Supabase client
   ```javascript
   // Frontend example
   const { data, error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'password123'
   });
   ```

2. **Token**: Supabase returns an access token (JWT)
   ```javascript
   const token = data.session.access_token;
   ```

3. **API Requests**: Frontend sends token in Authorization header
   ```javascript
   fetch('http://localhost:3000/profile', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   ```

4. **Backend Validation**: Custom guard verifies token with Supabase API
   - Token is validated directly with Supabase (no JWT secret needed)
   - User is automatically synced to local database
   - Request proceeds with authenticated user

### User Sync

When a user first accesses the API:
- Supabase user is automatically created in local database
- User metadata (name, avatar) is synced
- Subsequent requests use local database user

## 🏗 Architecture

The application follows NestJS modular architecture with clear separation of concerns:

```
src/
├── auth/              # Authentication & authorization
├── profile/           # User profile management
├── pages/             # Page CRUD operations
├── blocks/            # Block content management
├── prisma/            # Database service
└── main.ts           # Application entry point
```

### Database Schema

```prisma
User
├── id: String (UUID from Supabase)
├── email: String (unique)
├── name: String?
├── avatar: String?
└── pages: Page[]

Page
├── id: String (CUID)
├── title: String
├── userId: String
├── blocks: Block[]
└── timestamps

Block
├── id: String (CUID)
├── type: BlockType (TEXT | HEADING | CHECKLIST | IMAGE | FILE)
├── content: Json
├── position: Int
├── pageId: String
└── timestamps
```

## 🚀 Description

Notely backend is built with [NestJS](https://github.com/nestjs/nest) - a progressive Node.js framework for building efficient and scalable server-side applications.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL (v14 or higher)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend-sealions
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up Supabase Database**

**Bước 1: Tạo Supabase Project**
1. Vào https://supabase.com và tạo project mới
2. Lưu lại **Database Password** và **Project URL**

**Bước 2: Lấy Connection String**
1. Vào **Settings** → **Database**
2. Copy **Connection string** (Session pooler - port 5432)
3. Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-xxx.pooler.supabase.com:5432/postgres`

**Bước 3: Tạo Tables**
Chạy SQL script trong Supabase SQL Editor để tạo tables (xem file `create-tables.sql` hoặc dùng Prisma migrations)

**Bước 4: Cấu hình Cloudinary (cho File Upload)**

1. Tạo tài khoản tại https://cloudinary.com (free tier available)
2. Vào Dashboard → Settings → API Keys
3. Copy các giá trị:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

**Bước 5: Cấu hình `.env`**
```env
# Supabase Database
DATABASE_URL="postgresql://postgres.mhjfgywtpauumlexnxfp:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.mhjfgywtpauumlexnxfp:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase Auth
SUPABASE_URL="https://mhjfgywtpauumlexnxfp.supabase.co"
SUPABASE_KEY="your-anon-key-from-supabase"
SUPABASE_JWT_SECRET="your-jwt-secret-from-supabase"

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Application
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

4. **Set up the database**

**Option A: Using Prisma Migrations (Recommended)**
```bash
# Run database migrations
pnpm run db:migrate
# hoặc: npx prisma migrate dev --name init

# Generate Prisma Client
pnpm run db:generate
# hoặc: npx prisma generate

# Check connection (nếu dùng Supabase)
pnpm run db:check
```

**Option B: Create Tables Manually (If migrations fail)**
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL scripts to create tables:
   - For initial tables: see `prisma/schema.prisma` for schema
   - For sharing & comments: run `create-sharing-comments-tables.sql`
3. Or use Prisma db push:
```bash
npx prisma db push --accept-data-loss
```

**Note:** After creating tables, regenerate Prisma Client:
```bash
npx prisma generate
```

5. **Configure Supabase Authentication**

**Enable Email Provider:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email settings (optional: disable email confirmation for testing)

**Get Supabase Keys:**
1. Go to Settings → API
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_KEY`
   - **JWT Secret** (in JWT Settings) → `SUPABASE_JWT_SECRET`

6. **Start the development server**

```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3000`

### Available Scripts

```bash
# Development
pnpm run start:dev       # Start with hot-reload

# Production
pnpm run build          # Build the project
pnpm run start:prod     # Start in production mode

# Testing
pnpm run test           # Run unit tests
pnpm run test:e2e       # Run end-to-end tests
pnpm run test:cov       # Run tests with coverage

# Database
pnpm run db:studio      # Open Prisma Studio (Database GUI)
pnpm run db:migrate     # Create and run migrations
pnpm run db:generate    # Regenerate Prisma Client
pnpm run db:check       # Check Supabase connection

# Code Quality
pnpm run lint           # Run ESLint
pnpm run format         # Format code with Prettier
```

## 📚 API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick API Overview

**Base URL:** `http://localhost:3000`

### Swagger UI
- URL: `http://localhost:3000/docs`
- Use the `Authorize` button with Supabase access tokens (Bearer)
- Customize path via `SWAGGER_PATH` environment variable

#### Authentication
- `GET /auth/me` - Get current user (syncs with database)
- **Note**: User registration/login is handled by Supabase client-side

#### Profile
- `GET /profile` - Get user profile
- `PATCH /profile` - Update profile

#### Pages
- `POST /pages` - Create page
- `GET /pages` - Get all pages
- `GET /pages/:id` - Get single page
- `PATCH /pages/:id` - Update page
- `DELETE /pages/:id` - Delete page

#### Blocks
- `POST /blocks` - Create block
- `GET /blocks?pageId=:id` - Get page blocks
- `GET /blocks/:id` - Get single block
- `PATCH /blocks/:id` - Update block
- `DELETE /blocks/:id` - Delete block
- `POST /blocks/reorder` - Reorder blocks

#### Storage (File Upload)
- `POST /storage/upload` - Upload a single file (images, videos, PDFs, documents)
- `POST /storage/upload/multiple` - Upload multiple files
- `DELETE /storage/:publicId` - Delete a file from Cloudinary

#### Sharing & Permissions
- `POST /sharing/pages/:pageId/share` - Share a page with another user
- `GET /sharing/pages/shared-with-me` - Get all pages shared with me
- `GET /sharing/pages/shared-by-me` - Get all pages I have shared
- `GET /sharing/pages/:pageId/shares` - Get users who have access to a page
- `PATCH /sharing/pages/:pageId/share/:userId` - Update permission for shared page
- `DELETE /sharing/pages/:pageId/share/:userId` - Unshare a page

#### Comments & Annotations
- `POST /comments/blocks/:blockId` - Create a comment on a block
- `GET /comments/blocks/:blockId` - Get all comments for a block (threaded)
- `GET /comments/:id` - Get comment by ID
- `PATCH /comments/:id` - Update a comment
- `DELETE /comments/:id` - Delete a comment

For detailed request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🧪 Testing

### ✅ Test Results

All API endpoints have been tested and verified working:

**Authentication & Profile:**
- ✅ `GET /profile` - Get user profile
- ✅ `PATCH /profile` - Update profile

**Pages Management:**
- ✅ `GET /pages` - List all pages
- ✅ `POST /pages` - Create page
- ✅ `GET /pages/:id` - Get single page
- ✅ `PATCH /pages/:id` - Update page title

**Blocks Management:**
- ✅ `POST /blocks` (TEXT, HEADING, CHECKLIST, IMAGE, FILE) - All block types working
- ✅ `GET /blocks?pageId=:id` - Get page blocks
- ✅ `PATCH /blocks/:id` - Update block
- ✅ `DELETE /blocks/:id` - Delete block
- ✅ `POST /blocks/reorder` - Drag & drop reordering

**File Upload:**
- ✅ `POST /storage/upload` - Upload single file to Cloudinary
- ✅ `POST /storage/upload/multiple` - Upload multiple files
- ✅ `DELETE /storage/:publicId` - Delete file from Cloudinary

**Sharing & Permissions:**
- ✅ `POST /sharing/pages/:pageId/share` - Share page with user
- ✅ `GET /sharing/pages/shared-with-me` - Get shared pages
- ✅ `GET /sharing/pages/shared-by-me` - Get pages I shared
- ✅ `PATCH /sharing/pages/:pageId/share/:userId` - Update permission
- ✅ `DELETE /sharing/pages/:pageId/share/:userId` - Unshare page

**Comments & Annotations:**
- ✅ `POST /comments/blocks/:blockId` - Create comment
- ✅ `GET /comments/blocks/:blockId` - Get comments (threaded)
- ✅ `PATCH /comments/:id` - Update comment
- ✅ `DELETE /comments/:id` - Delete comment

### Getting Access Token

**Option 1: Create user via Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enable "Auto Confirm User"
4. Create user

**Option 2: Create user via Supabase API**
```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/auth/v1/signup" \
  -H "apikey: YOUR_SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

**Get token:**
```bash
export TOKEN=$(curl -s -X POST "https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: YOUR_SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}' | jq -r '.access_token')
```

### Testing with curl

```bash
# Set token
export TOKEN="your-supabase-access-token"

# Test profile
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/profile

# Create page
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Page"}' \
  http://localhost:3000/pages

# Create text block
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"TEXT","content":{"text":"Hello"},"pageId":"PAGE_ID","position":0}' \
  http://localhost:3000/blocks
```

### Using Test Script

```bash
# Set token first
export TOKEN="your-token"

# Run test script
./test-all-endpoints.sh
```

## 📁 Project Structure

```
backend-sealions/
├── src/
│   ├── auth/                   # Authentication module
│   │   ├── dto/               # Data transfer objects
│   │   ├── guards/            # Auth guards
│   │   ├── strategies/        # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── profile/               # Profile module
│   │   ├── dto/
│   │   ├── profile.controller.ts
│   │   ├── profile.service.ts
│   │   └── profile.module.ts
│   ├── pages/                 # Pages module
│   │   ├── dto/
│   │   ├── pages.controller.ts
│   │   ├── pages.service.ts
│   │   └── pages.module.ts
│   ├── blocks/                # Blocks module
│   │   ├── dto/
│   │   ├── blocks.controller.ts
│   │   ├── blocks.service.ts
│   │   └── blocks.module.ts
│   ├── prisma/                # Prisma service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── test/                      # Test files
├── .env                       # Environment variables
├── API_DOCUMENTATION.md       # API docs
├── TEST_GUIDE.md             # Testing guide
├── api-requests.http         # REST Client requests
└── README.md                 # This file
```

## 🔒 Security Best Practices

This project implements several security measures:

- ✅ **Supabase Auth**: Enterprise-grade authentication with built-in security
- ✅ **Token Validation**: Direct verification with Supabase API (no JWT secret needed)
- ✅ Input validation with class-validator
- ✅ CORS protection
- ✅ SQL injection prevention (Prisma ORM)
- ✅ User data isolation (users can only access their own data)
- ✅ **Email Verification**: Optional email confirmation
- ✅ **Secure Password Policy**: Managed by Supabase

### Additional Recommendations for Production

- Enable HTTPS
- Implement rate limiting
- Add request logging
- Set up monitoring
- Use environment-specific configurations
- Configure Supabase RLS (Row Level Security) policies
- Add API versioning
- Use Supabase service role key only on server-side

## 🚀 Deployment

### Environment Variables for Production

```env
# Supabase Database
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"

# Supabase Auth
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_KEY="your-anon-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Application
PORT=3000
FRONTEND_URL="https://your-frontend-domain.com"
NODE_ENV="production"
```

### Deployment Steps

1. Build the application:
```bash
pnpm run build
```

2. Run database migrations:
```bash
npx prisma migrate deploy
```

3. Start the production server:
```bash
pnpm run start:prod
```

### Deployment Platforms

This application can be deployed to:
- **Railway** (Recommended for PostgreSQL apps)
- **Render**
- **Heroku**
- **AWS** (EC2, ECS, or Lambda)
- **DigitalOcean**
- **Vercel** (with Serverless Postgres)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Hulk Developed with ❤️ for the Notely project.

## 📖 Additional Documentation

- **[TEST_GUIDE_SHARING_COMMENTS.md](./TEST_GUIDE_SHARING_COMMENTS.md)** - Complete step-by-step test guide for Sharing & Comments features
- **[create-sharing-comments-tables.sql](./create-sharing-comments-tables.sql)** - SQL script to create sharing and comments tables

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT.io](https://jwt.io) - JWT debugger
