# Supabase Setup for Eravault Vintage

## 1. Create Supabase Project
Go to https://supabase.com → New Project → Name: `eravault-vintage`

## 2. Create Table
Go to **SQL Editor** and run this:

```sql
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  size TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'B',
  sourcing_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'Sourced',
  sourcing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sold_date DATE,
  notes TEXT,
  listing_link TEXT,
  images TEXT,
  videos TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own items" ON inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON inventory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON inventory
  FOR DELETE USING (auth.uid() = user_id);
```

## 3. Get API Keys
Go to **Settings → API** and copy:
- `Project URL`
- `anon public` key

## 4. Add to Vercel
In Vercel project settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL` = your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
