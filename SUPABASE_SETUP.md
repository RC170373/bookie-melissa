# Supabase Setup Instructions

## Step 1: Create a Supabase Account

1. Go to https://supabase.com
2. Click "Sign Up" or "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email

## Step 2: Create a New Project

1. Click "New Project" or "Create a new project"
2. Fill in the project details:
   - **Name**: `livraddict` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to you (e.g., `eu-west-1` for Europe)
3. Click "Create new project"
4. Wait for the project to initialize (2-3 minutes)

## Step 3: Get Your Credentials

Once your project is created:

1. Go to **Project Settings** (gear icon in the left sidebar)
2. Click on **API** in the left menu
3. You'll see:
   - **Project URL** - Copy this (looks like: `https://xxxxx.supabase.co`)
   - **anon public** - Copy this key (long string starting with `eyJ...`)

## Step 4: Configure .env.local

1. Open the `.env.local` file in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwfQ.xxxxx
```

## Step 5: Set Up Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for all queries to complete

You should see green checkmarks for all queries.

## Step 6: Verify Setup

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - profiles
   - books
   - user_books
   - reviews
   - forum_categories
   - forum_topics
   - forum_posts
   - lists
   - list_items
   - friendships
   - activities

If all tables are there, you're ready to go!

## Troubleshooting

### "Invalid supabaseUrl" Error
- Check that your URL is correct (should start with `https://`)
- Make sure there are no extra spaces
- Verify the URL format: `https://project-id.supabase.co`

### "Authentication Error"
- Verify your anon key is correct
- Check that your Supabase project is active
- Try refreshing the page

### "Database Connection Error"
- Ensure the schema has been applied
- Check that all tables exist in Table Editor
- Verify your credentials are correct

### Tables Not Showing
- Go to SQL Editor
- Run the schema again
- Check for error messages in the output

## Next Steps

Once setup is complete:
1. Run `npm install`
2. Run `npm run dev`
3. Visit http://localhost:3000
4. Create a test account
5. Start using the app!

## Support

If you encounter issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the error messages carefully
3. Check the browser console (F12) for details
4. Try clearing browser cache and reloading

## Security Notes

- Never share your `.env.local` file
- Never commit `.env.local` to version control
- Keep your database password safe
- The anon key is public (it's meant to be)
- Use Row Level Security (RLS) for data protection (already configured)

---

**You're all set! Proceed to run the application.**

