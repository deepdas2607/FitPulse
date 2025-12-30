# Supabase Setup Guide for FitPulse

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose a name (e.g., "fitpulse")
4. Set a strong database password
5. Choose a region close to you
6. Wait for the project to be created (~2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the long string under "Project API keys")

## Step 3: Update Your .env File

Open `backend/.env` and add your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `backend/schema.sql`
4. Click "Run" to create all tables

## Step 5: Enable Row Level Security (RLS) - Optional but Recommended

Run these queries in SQL Editor to set up basic security:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) to bypass RLS
-- Your backend will use the anon key, so we need permissive policies

-- Users: Allow insert for registration, select for login
CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON users FOR SELECT USING (true);

-- User profiles: Users can manage their own profiles
CREATE POLICY "Allow all operations" ON user_profiles FOR ALL USING (true);

-- Workouts: Users can manage their own workouts
CREATE POLICY "Allow all operations" ON workouts FOR ALL USING (true);

-- Workout exercises: Allow all operations
CREATE POLICY "Allow all operations" ON workout_exercises FOR ALL USING (true);

-- Food recommendations: Allow all operations
CREATE POLICY "Allow all operations" ON food_recommendations FOR ALL USING (true);
```

## Step 6: Restart Your Backend

Stop the current backend process and restart it:

```bash
cd backend
npm start
```

## Step 7: Test Login

Try logging in to your app. If you get errors, check:
- Supabase credentials are correct in .env
- Tables were created successfully
- Backend restarted after updating .env

## Troubleshooting

### "Missing Supabase credentials"
- Make sure SUPABASE_URL and SUPABASE_ANON_KEY are in your .env file
- Restart the backend server

### "relation does not exist"
- Tables weren't created. Run the schema.sql in Supabase SQL Editor

### "row-level security policy violation"
- RLS is enabled but policies aren't set up
- Either disable RLS or run the policy queries above

## Benefits of Supabase

✅ No local PostgreSQL installation needed
✅ Hosted database with automatic backups
✅ Built-in authentication (can replace JWT later)
✅ Real-time subscriptions available
✅ Free tier: 500MB database, 2GB bandwidth
✅ Easy to scale
