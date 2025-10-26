# Livraddict Clone - Setup Guide

This guide will walk you through setting up the Livraddict clone application from scratch.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier is sufficient)
- Git (optional, for version control)

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Livraddict (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to you
4. Click "Create new project" and wait for it to initialize (this takes a few minutes)

## Step 2: Get Your Supabase Credentials

1. Once your project is created, go to **Project Settings** (gear icon)
2. Click on **API** in the left sidebar
3. You'll see:
   - **Project URL** - Copy this
   - **anon public** - Copy this key
4. Keep these safe - you'll need them in the next step

## Step 3: Configure Environment Variables

1. In the root directory of the project, create a file named `.env.local`
2. Add the following content, replacing with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up the Database Schema

1. In your Supabase project, go to **SQL Editor** (in the left sidebar)
2. Click **New Query**
3. Open the file `supabase-schema.sql` from the project root
4. Copy the entire contents
5. Paste it into the SQL Editor in Supabase
6. Click **Run** to execute all the SQL commands

This will create:
- All necessary tables (profiles, books, reviews, forum, etc.)
- Indexes for performance
- Row Level Security policies
- Default forum categories

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You should see the Livraddict home page
3. Click "S'inscrire" (Register) to create a test account
4. Fill in the registration form and submit
5. You should be redirected to the home page

## Step 8: Add Sample Data (Optional)

To test the application with sample data, you can manually add books through the UI or use the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Click on **Table Editor** in the left sidebar
3. Select the `books` table
4. Click **Insert row** and add some sample books

Example book data:
- **Title**: "Le Seigneur des Anneaux"
- **Author**: "J.R.R. Tolkien"
- **Language**: "fr"
- **Genre**: ["Fantasy", "Adventure"]
- **Description**: "Une épopée fantastique..."

## Troubleshooting

### "Invalid supabaseUrl" Error

**Problem**: You see an error about invalid Supabase URL
**Solution**: 
- Check that your `.env.local` file exists in the root directory
- Verify the URL format: `https://your-project-id.supabase.co`
- Make sure there are no extra spaces or quotes

### "Authentication Error"

**Problem**: Can't sign up or log in
**Solution**:
- Check that your Supabase project is active
- Verify your anon key is correct
- Check the browser console for detailed error messages

### "Database Connection Error"

**Problem**: Can't connect to the database
**Solution**:
- Ensure the database schema has been applied (Step 4)
- Check that your Supabase project is running
- Verify your credentials are correct

### Build Errors

**Problem**: `npm run build` fails
**Solution**:
- Make sure `.env.local` is configured
- Run `npm install` again to ensure all dependencies are installed
- Check for TypeScript errors: `npm run type-check`

## Next Steps

Once you have the application running:

1. **Explore the Features**:
   - Create an account
   - Add books to your library
   - Create reviews and ratings
   - Participate in the forum
   - Create custom lists

2. **Customize the Application**:
   - Update colors and branding in `app/globals.css`
   - Modify the header/footer in `components/Header.tsx` and `components/Footer.tsx`
   - Add more pages and features

3. **Deploy to Production**:
   - See the README.md for deployment instructions

## File Structure Reference

```
Livraddict/
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── bibliomania/page.tsx      # Library management
│   ├── books/page.tsx            # Book catalog
│   ├── forum/page.tsx            # Forum
│   ├── lists/page.tsx            # Custom lists
│   ├── book-club/page.tsx        # Book club
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ActivityFeed.tsx
│   └── FeaturedBooks.tsx
├── lib/                          # Utilities
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts        # Auth middleware
│   └── types/
│       └── database.ts          # TypeScript types
├── .env.local                    # Environment variables (create this)
├── supabase-schema.sql          # Database schema
├── middleware.ts                # Next.js middleware
├── package.json
└── README.md
```

## Support

For issues or questions:
1. Check the README.md for more information
2. Review the Supabase documentation: https://supabase.com/docs
3. Check Next.js documentation: https://nextjs.org/docs

## Security Notes

- Never commit `.env.local` to version control
- Keep your Supabase credentials secret
- Use environment variables for sensitive data
- Review Row Level Security policies before production
- Enable additional authentication providers as needed

Happy reading! 📚

