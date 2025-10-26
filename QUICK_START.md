# Quick Start - Livraddict Clone

Get up and running in 5 minutes!

## TL;DR

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your Supabase credentials
echo 'NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key' > .env.local

# 3. Run the dev server
npm run dev

# 4. Open http://localhost:3000
```

## Detailed Steps

### 1. Get Supabase Credentials (2 minutes)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Settings > API
4. Copy your **Project URL** and **anon public key**

### 2. Configure Environment (1 minute)

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### 3. Set Up Database (1 minute)

1. In Supabase, go to SQL Editor
2. Create a new query
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and run it

### 4. Start Development (1 minute)

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and start exploring!

## What You Get

✅ User authentication (sign up, login)
✅ Virtual library (Bibliomania)
✅ Book catalog with search
✅ Forum with categories
✅ Activity feed
✅ Book club section
✅ Custom lists
✅ Responsive design

## First Steps

1. **Register** - Create a test account
2. **Add Books** - Go to Bibliomania and add books to your library
3. **Explore** - Check out the forum, lists, and book club
4. **Customize** - Update colors, add your branding

## Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid supabaseUrl" | Check `.env.local` exists and has correct URL |
| Can't sign up | Verify Supabase project is active |
| Database errors | Run the SQL schema in Supabase SQL Editor |
| Build fails | Delete `.next` folder and run `npm run build` again |

## Next Steps

- Read `SETUP_GUIDE.md` for detailed setup instructions
- Check `README.md` for feature documentation
- Explore the code in `app/` and `components/` directories
- Deploy to Vercel or your preferred hosting

## Need Help?

1. Check SETUP_GUIDE.md for troubleshooting
2. Review Supabase docs: https://supabase.com/docs
3. Check Next.js docs: https://nextjs.org/docs

Happy coding! 🚀

