# Livraddict - Local Database Setup Guide

## ✅ Migration Complete: Supabase → Local SQLite Database

The Livraddict application has been successfully migrated from Supabase to a local SQLite database using Prisma ORM.

## What Changed

### Database
- **Before**: Supabase (PostgreSQL cloud database)
- **After**: SQLite (local file-based database at `./prisma/dev.db`)

### Authentication
- **Before**: Supabase Auth
- **After**: JWT-based authentication with bcryptjs password hashing

### Data Access
- **Before**: Supabase client library
- **After**: Prisma ORM + Next.js API routes

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
The `.env` and `.env.local` files are already configured:
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Run Database Migrations
```bash
npx prisma migrate dev
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Schema

The SQLite database includes the following tables:
- **User** - User accounts with email, password, username
- **Profile** - User profiles with bio, location, website
- **Book** - Book catalog with title, author, ISBN, genres, etc.
- **UserBook** - User's library entries with status (reading, read, to_read, wishlist, pal) and ratings
- **Review** - Book reviews and ratings
- **ForumCategory** - Forum categories
- **ForumTopic** - Forum discussion topics
- **ForumPost** - Forum posts/replies
- **List** - Custom book lists
- **ListItem** - Items in custom lists
- **Friendship** - User friendships
- **Activity** - User activity feed

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user

### Books
- `GET /api/books` - List books (with optional search)
- `POST /api/books` - Create new book (authenticated)

### User Library
- `GET /api/user-books` - Get user's library (with optional status filter)
- `POST /api/user-books` - Add book to library (authenticated)
- `PATCH /api/user-books/[id]` - Update book in library (authenticated)
- `DELETE /api/user-books/[id]` - Remove book from library (authenticated)

### Lists
- `GET /api/lists` - Get all lists
- `POST /api/lists` - Create new list (authenticated)

### Activities
- `GET /api/activities` - Get activity feed
- `POST /api/activities` - Create activity (authenticated)

## Features

✅ **User Authentication**
- Registration with email, password, username
- Login with JWT tokens
- Secure password hashing with bcryptjs
- HttpOnly cookies for token storage

✅ **Virtual Library (Bibliomania)**
- Add books to library
- Track reading status (reading, read, to_read, wishlist, pal)
- Rate books (0-20 scale, Livraddict compatible)
- Add personal notes

✅ **Book Catalog**
- Browse and search books
- View book details
- Add new books to catalog

✅ **Import/Export**
- Export library to Excel (.xlsx)
- Import books from Excel files
- 100% compatible with Livraddict export format

✅ **Community Features**
- Forum for discussions
- Custom book lists
- Book club
- Activity feed

## Database File Location

The SQLite database file is stored at:
```
./prisma/dev.db
```

This file is created automatically when you run migrations. It's a single file that contains all your data.

## Backup & Restore

To backup your database:
```bash
cp prisma/dev.db prisma/dev.db.backup
```

To restore from backup:
```bash
cp prisma/dev.db.backup prisma/dev.db
```

## Troubleshooting

### Database Lock Error
If you get a "database is locked" error, make sure only one instance of the dev server is running:
```bash
pkill -f "next dev"
npm run dev
```

### Reset Database
To reset the database and start fresh:
```bash
rm prisma/dev.db
npx prisma migrate dev
```

### View Database
To inspect the database directly:
```bash
npx prisma studio
```

This opens a web interface to view and edit your data.

## Production Deployment

For production, consider:
1. Using PostgreSQL instead of SQLite
2. Changing JWT_SECRET to a strong random value
3. Setting up proper environment variables
4. Using a process manager like PM2
5. Setting up SSL/HTTPS

## Support

For issues or questions, check:
- `README.md` - Project overview
- `QUICK_START.md` - Quick reference
- `SETUP_GUIDE.md` - Detailed setup instructions

