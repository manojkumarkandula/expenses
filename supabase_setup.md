# Supabase Database Setup Guide

This guide provides the SQL schema required to prepare your Supabase instance for PocketLedger. You can copy and execute this script inside your Supabase project's **SQL Editor**.

---

## 1. Database Schema

Execute the following SQL script to create the tables (`profiles`, `transactions`, and `goals`) with foreign keys, checks, default constraints, and standard index optimizations.

```sql
-- Create custom theme enum if needed, or stick to simple text check
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    currency TEXT NOT NULL DEFAULT '₹',
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    category TEXT, -- e.g. 'Food', 'Travel', etc.
    source TEXT,   -- e.g. 'Freelance', 'Salary', etc.
    title TEXT NOT NULL,
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL CHECK (target_amount >= 0),
    current_amount NUMERIC NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for speed optimization
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
```

---

## 2. Row Level Security (RLS)

Enable Row Level Security (RLS) on all tables to ensure users can only read/write their own budget details.

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Users can view own profiles" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profiles" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Transaction Policies
CREATE POLICY "Users can CRUD own transactions" 
    ON public.transactions FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Goal Policies
CREATE POLICY "Users can CRUD own goals" 
    ON public.goals FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

---

## 3. Auto-Create Profile Trigger

Use this trigger script to automatically copy new users created via Supabase Auth signup into your custom `public.profiles` table:

```sql
-- Trigger to handle auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, currency, theme)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'New Wallet User'),
        new.email,
        '₹',
        'dark'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
