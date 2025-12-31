-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender TEXT,
    weight NUMERIC,
    height NUMERIC,
    activity_level TEXT,
    goals TEXT,
    dietary_preferences TEXT,
    doctor_name TEXT,
    doctor_contact TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INTEGER,
    notes TEXT
);

-- Workout Exercises Table
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER[], -- Helper: storing array of reps or single int? Code implies single int per row usually, but let's check.
    -- Wait, server.js says: INSERT INTO workout_exercises (workout_id, exercise_name, sets, reps, weight_kg) VALUES ($1, $2, $3, $4, $5)
    -- And reps is passed as ex.reps.
    -- If sets is int, reps is likely int (or array if per set).
    -- In ExerciseTracker, we send `reps: [10, 8, 8]`.
    -- So reps should probably be an INTEGER[] (array) or we store summary.
    -- Let's stick to what allows the code to work. server.js passes it purely.
    -- If postgres, arrays are supported.
    weight_kg NUMERIC
);

-- Fix for reps column type based on usage: 
-- In server.js: `ex.reps` comes from frontend. In `ExerciseTracker.tsx`, `reps` is `number[]` (array of numbers).
-- So `reps` column MUST be `INTEGER[]`.
-- `sets` is `number`.

-- Food Recommendations Table
CREATE TABLE IF NOT EXISTS food_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommendation_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
