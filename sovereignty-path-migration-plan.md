# Sovereignty Path Migration: Streamlit → Next.js
## Complete Implementation Guide

---

## Table of Contents
1. [Migration Overview](#migration-overview)
2. [Phase 0: Preparation & Setup](#phase-0-preparation--setup)
3. [Phase 1: Backend Migration (Python → FastAPI)](#phase-1-backend-migration)
4. [Phase 2: Database Migration (DuckDB → Supabase)](#phase-2-database-migration)
5. [Phase 3: Frontend Rebuild (Streamlit → Next.js)](#phase-3-frontend-rebuild)
6. [Phase 4: Authentication (Supabase Auth)](#phase-4-authentication)
7. [Phase 5: Payment Integration (Stripe)](#phase-5-payment-integration)
8. [Phase 6: Deployment & Testing](#phase-6-deployment--testing)

---

## Migration Overview

### Current State (Streamlit App)
```
sovereignty-score/              # Separate repository
├── app.py                      # Main Streamlit app
├── database/
│   └── sovereignty.db          # DuckDB database
├── models/
│   ├── scoring.py             # Scoring engine
│   └── paths.py               # 6 path definitions
├── services/
│   ├── bitcoin_api.py         # Bitcoin price integration
│   ├── meal_planner.py        # Meal planning system
│   └── financial_model.py     # Savings projections
└── data/
    ├── expert_knowledge/       # Huberman, Cavaliere, etc.
    └── meal_plans/
```

### Target State (Next.js App)
```
sovereignty-portfolio/
├── app/                        # Next.js frontend
│   ├── (auth)/                # Auth pages (login, signup)
│   ├── app/                   # Main app (protected)
│   │   ├── dashboard/         # Overview
│   │   ├── paths/             # 6 sovereignty paths
│   │   ├── analytics/         # Historical tracking
│   │   ├── bitcoin/           # Portfolio tracking
│   │   └── settings/          # User preferences
│   └── api/
│       ├── sovereignty/       # Proxy to FastAPI
│       └── stripe/            # Payment webhooks
├── api/                       # FastAPI backend
│   ├── main.py               # FastAPI server
│   ├── models/               # Business logic (from Streamlit)
│   ├── routes/               # API endpoints
│   └── services/             # External integrations
└── supabase/
    ├── migrations/            # Database schema
    └── seed.sql              # Sample data
```

---

## Phase 0: Preparation & Setup

### Estimated Time: 2-4 hours

### Step 0.1: Backup Current Streamlit App

```bash
# Navigate to your Streamlit app folder
cd ~/sovereignty-score

# Create a backup branch
git checkout -b pre-migration-backup
git push origin pre-migration-backup

# Tag this version
git tag -a v1.0-streamlit -m "Streamlit app before migration"
git push origin v1.0-streamlit
```

### Step 0.2: Copy Code into Current Repo

```bash
# Navigate to your Next.js repo
cd ~/sovereignty-portfolio

# Create api directory for Python backend
mkdir -p api

# Copy Python files (adjust paths as needed)
cp -r ~/sovereignty-score/models ./api/
cp -r ~/sovereignty-score/services ./api/
cp -r ~/sovereignty-score/data ./api/

# Copy database for reference (will migrate to Supabase later)
mkdir -p database
cp ~/sovereignty-score/database/sovereignty.db ./database/
```

### Step 0.3: Document Current Schema

Create `api/SCHEMA.md` to document your DuckDB schema:

```bash
# In your Streamlit app, export schema
cd ~/sovereignty-score
python -c "
import duckdb
conn = duckdb.connect('database/sovereignty.db')
tables = conn.execute('SHOW TABLES').fetchall()
for table in tables:
    print(f'\n## Table: {table[0]}')
    schema = conn.execute(f'DESCRIBE {table[0]}').fetchall()
    for col in schema:
        print(f'- {col[0]}: {col[1]}')
"
```

Copy this output to `api/SCHEMA.md` for reference.

### Step 0.4: Audit Current Features

Create `FEATURES_AUDIT.md`:

```markdown
# Sovereignty Path - Current Features

## Core Functionality
- [ ] User can select 1 of 6 paths
- [ ] Daily activity logging (checkboxes for activities)
- [ ] Scoring calculation based on path
- [ ] Score display (out of 100 points)
- [ ] Historical score tracking
- [ ] Data persistence

## Path-Specific Features
- [ ] Default Path (balanced)
- [ ] Financial Path (spending, Bitcoin, learning)
- [ ] Mental Resilience Path (meditation, gratitude, learning)
- [ ] Physical Optimization Path (training, nutrition)
- [ ] Spiritual Growth Path (meditation, gratitude, environmental)
- [ ] Planetary Stewardship Path (environmental action)

## Integrations
- [ ] Bitcoin price API
- [ ] Portfolio value calculation
- [ ] Meal planning (2,800-3,200 kcal)
- [ ] Expert knowledge (Huberman, Cavaliere, Pollan, Hyman)

## Data Models
- [ ] User profile
- [ ] Daily entries
- [ ] Path selection
- [ ] Activity definitions
- [ ] Scoring weights per path

## Business Logic
- [ ] Scoring algorithm (JSON-based weights)
- [ ] Path-specific point allocations
- [ ] Activity validation
- [ ] Historical aggregation
```

Check off what currently exists in your Streamlit app.

### Step 0.5: Set Up New Tools

**Create accounts for:**

1. **Supabase** (Database + Auth)
   - Go to https://supabase.com
   - Sign up with GitHub
   - Create new project: "sovereignty-path"
   - Note: Database URL, API keys (we'll use these later)

2. **Stripe** (Payments)
   - Go to https://stripe.com
   - Create account
   - Switch to "Test mode"
   - Note: Publishable key, Secret key

**Install new dependencies:**

```bash
# Navigate to your Next.js repo
cd ~/sovereignty-portfolio

# Frontend dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @stripe/stripe-js stripe
npm install recharts  # For charts/analytics
npm install date-fns  # Date manipulation

# Backend dependencies (Python - create requirements.txt)
# We'll set this up in Phase 1
```

---

## Phase 1: Backend Migration (Python → FastAPI)

### Estimated Time: 8-12 hours

### Step 1.1: Set Up FastAPI Project Structure

```bash
cd ~/sovereignty-portfolio/api

# Create directory structure
mkdir -p routes services models schemas

# Create main FastAPI file
touch main.py

# Create requirements.txt
touch requirements.txt
```

**api/requirements.txt:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
supabase==2.0.0
python-dotenv==1.0.0
requests==2.31.0
pandas==2.1.3
python-multipart==0.0.6
```

**api/main.py (starter):**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Sovereignty Path API")

# CORS configuration (allow Next.js frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://sovereigntytracker.com",  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Sovereignty Path API", "version": "1.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Step 1.2: Migrate Scoring Engine

**Current code location:** `sovereignty-score/models/scoring.py`

**New location:** `api/models/scoring.py`

**Migration steps:**

1. Copy your existing `scoring.py` to `api/models/scoring.py`

2. Create Pydantic models for type safety:

**api/schemas/activity.py:**
```python
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import date

class Activity(BaseModel):
    """Single activity definition"""
    name: str
    default_points: int
    description: Optional[str] = None

class PathWeights(BaseModel):
    """Scoring weights for a specific path"""
    path_name: str
    weights: Dict[str, int]  # activity_name: points
    max_score: int = 100

class DailyEntry(BaseModel):
    """Daily activity log"""
    user_id: str
    date: date
    path: str
    activities: Dict[str, bool]  # activity_name: completed
    score: Optional[int] = None
    
class ScoreResponse(BaseModel):
    """API response for score calculation"""
    score: int
    max_score: int
    percentage: float
    breakdown: Dict[str, int]  # activity: points_earned
```

3. Refactor scoring logic into FastAPI route:

**api/routes/scoring.py:**
```python
from fastapi import APIRouter, HTTPException
from ..schemas.activity import DailyEntry, ScoreResponse
from ..models.scoring import calculate_score, PATH_WEIGHTS

router = APIRouter(prefix="/scoring", tags=["Scoring"])

@router.post("/calculate", response_model=ScoreResponse)
def calculate_daily_score(entry: DailyEntry):
    """
    Calculate sovereignty score for a daily entry
    """
    try:
        # Get path weights
        weights = PATH_WEIGHTS.get(entry.path)
        if not weights:
            raise HTTPException(status_code=400, detail=f"Invalid path: {entry.path}")
        
        # Calculate score
        score, breakdown = calculate_score(entry.activities, weights)
        
        return ScoreResponse(
            score=score,
            max_score=weights['max_score'],
            percentage=round((score / weights['max_score']) * 100, 1),
            breakdown=breakdown
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/paths")
def get_available_paths():
    """Get list of all sovereignty paths"""
    return {
        "paths": list(PATH_WEIGHTS.keys()),
        "count": len(PATH_WEIGHTS)
    }

@router.get("/paths/{path_name}")
def get_path_details(path_name: str):
    """Get activities and weights for a specific path"""
    if path_name not in PATH_WEIGHTS:
        raise HTTPException(status_code=404, detail="Path not found")
    
    return {
        "path": path_name,
        "weights": PATH_WEIGHTS[path_name],
        "max_score": PATH_WEIGHTS[path_name].get('max_score', 100)
    }
```

4. Register routes in main.py:

```python
# api/main.py
from routes import scoring

app.include_router(scoring.router, prefix="/api")
```

### Step 1.3: Migrate Bitcoin Integration

**Current:** `sovereignty-score/services/bitcoin_api.py`
**New:** `api/services/bitcoin.py`

**api/services/bitcoin.py:**
```python
import requests
from typing import Optional
from datetime import datetime, timedelta

class BitcoinService:
    """Handle Bitcoin price and portfolio calculations"""
    
    BASE_URL = "https://api.coinbase.com/v2"
    
    @staticmethod
    def get_current_price() -> Optional[float]:
        """Get current BTC/USD price"""
        try:
            response = requests.get(f"{BitcoinService.BASE_URL}/prices/BTC-USD/spot")
            response.raise_for_status()
            data = response.json()
            return float(data['data']['amount'])
        except Exception as e:
            print(f"Error fetching Bitcoin price: {e}")
            return None
    
    @staticmethod
    def calculate_portfolio_value(btc_amount: float) -> dict:
        """Calculate portfolio value in USD and sats"""
        current_price = BitcoinService.get_current_price()
        if not current_price:
            return {"error": "Unable to fetch current price"}
        
        sats = int(btc_amount * 100_000_000)
        usd_value = btc_amount * current_price
        
        return {
            "btc": btc_amount,
            "sats": sats,
            "usd": round(usd_value, 2),
            "price_per_btc": round(current_price, 2),
            "timestamp": datetime.now().isoformat()
        }
```

**API route:**

**api/routes/bitcoin.py:**
```python
from fastapi import APIRouter, HTTPException
from ..services.bitcoin import BitcoinService

router = APIRouter(prefix="/bitcoin", tags=["Bitcoin"])

@router.get("/price")
def get_bitcoin_price():
    """Get current Bitcoin price"""
    price = BitcoinService.get_current_price()
    if not price:
        raise HTTPException(status_code=503, detail="Unable to fetch price")
    
    return {
        "price_usd": price,
        "timestamp": datetime.now().isoformat()
    }

@router.post("/portfolio")
def calculate_portfolio(btc_amount: float):
    """Calculate portfolio value"""
    if btc_amount < 0:
        raise HTTPException(status_code=400, detail="BTC amount must be positive")
    
    portfolio = BitcoinService.calculate_portfolio_value(btc_amount)
    
    if "error" in portfolio:
        raise HTTPException(status_code=503, detail=portfolio["error"])
    
    return portfolio
```

### Step 1.4: Test FastAPI Locally

```bash
# Install dependencies
cd ~/sovereignty-portfolio/api
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload --port 8000

# In another terminal, test endpoints
curl http://localhost:8000/
curl http://localhost:8000/health
curl http://localhost:8000/api/scoring/paths
curl http://localhost:8000/api/bitcoin/price
```

**Expected responses:**
- `/` → {"message": "Sovereignty Path API", "version": "1.0"}
- `/health` → {"status": "healthy"}
- `/api/scoring/paths` → List of 6 paths
- `/api/bitcoin/price` → Current BTC price

---

## Phase 2: Database Migration (DuckDB → Supabase)

### Estimated Time: 6-8 hours

### Step 2.1: Design Supabase Schema

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  selected_path TEXT DEFAULT 'default',
  btc_holdings DECIMAL(16, 8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily entries
CREATE TABLE daily_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  path TEXT NOT NULL,
  score INTEGER,
  activities JSONB NOT NULL,  -- Store as JSON: {"meditation": true, "exercise": false}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entry_date)  -- One entry per day per user
);

-- Path definitions (reference data)
CREATE TABLE paths (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  weights JSONB NOT NULL,  -- Scoring weights
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity definitions
CREATE TABLE activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  default_points INTEGER DEFAULT 0,
  category TEXT,  -- physical, mental, financial, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, entry_date DESC);
CREATE INDEX idx_daily_entries_date ON daily_entries(entry_date DESC);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see/edit their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own entries"
  ON daily_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON daily_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON daily_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON daily_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 2.2: Seed Initial Data

Create `supabase/seed.sql`:

```sql
-- Insert path definitions
INSERT INTO paths (name, display_name, description, weights, max_score) VALUES
(
  'default',
  'Default (Balanced Path)',
  'Well-rounded approach balancing all domains',
  '{
    "meditation": 10,
    "gratitude": 10,
    "read_or_learned": 10,
    "strength_training": 10,
    "cardio": 10,
    "home_cooked_meals": 5,
    "no_alcohol": 10,
    "no_weed": 10,
    "no_spending": 10,
    "invested_bitcoin": 10,
    "environmental_action": 5
  }'::jsonb,
  100
),
(
  'financial',
  'Financial Path',
  'Focus on minimizing spending and maximizing investment',
  '{
    "meditation": 10,
    "gratitude": 5,
    "read_or_learned": 15,
    "strength_training": 5,
    "cardio": 5,
    "home_cooked_meals": 5,
    "no_alcohol": 10,
    "no_weed": 5,
    "no_spending": 15,
    "invested_bitcoin": 15,
    "environmental_action": 10
  }'::jsonb,
  100
),
(
  'mental_resilience',
  'Mental Resilience Path',
  'Inner strength through meditation, gratitude, and learning',
  '{
    "meditation": 15,
    "gratitude": 15,
    "read_or_learned": 15,
    "strength_training": 10,
    "cardio": 10,
    "home_cooked_meals": 5,
    "no_alcohol": 10,
    "no_weed": 10,
    "no_spending": 5,
    "invested_bitcoin": 0,
    "environmental_action": 5
  }'::jsonb,
  100
),
(
  'physical',
  'Physical Optimization Path',
  'Athletic performance and longevity',
  '{
    "meditation": 5,
    "gratitude": 5,
    "read_or_learned": 5,
    "strength_training": 15,
    "cardio": 15,
    "home_cooked_meals": 8,
    "no_alcohol": 15,
    "no_weed": 15,
    "no_spending": 5,
    "invested_bitcoin": 5,
    "environmental_action": 7
  }'::jsonb,
  100
),
(
  'spiritual',
  'Spiritual Growth Path',
  'Presence, meaning, and environmental consciousness',
  '{
    "meditation": 20,
    "gratitude": 15,
    "read_or_learned": 10,
    "strength_training": 5,
    "cardio": 5,
    "home_cooked_meals": 10,
    "no_alcohol": 10,
    "no_weed": 5,
    "no_spending": 5,
    "invested_bitcoin": 5,
    "environmental_action": 10
  }'::jsonb,
  100
),
(
  'planetary',
  'Planetary Stewardship Path',
  'Environmental responsibility and sustainable living',
  '{
    "meditation": 10,
    "gratitude": 10,
    "read_or_learned": 10,
    "strength_training": 5,
    "cardio": 5,
    "home_cooked_meals": 10,
    "no_alcohol": 5,
    "no_weed": 5,
    "no_spending": 10,
    "invested_bitcoin": 10,
    "environmental_action": 20
  }'::jsonb,
  100
);

-- Insert activity definitions
INSERT INTO activities (name, display_name, description, default_points, category) VALUES
('meditation', 'Meditation', 'Mindfulness practice (10+ minutes)', 10, 'mental'),
('gratitude', 'Gratitude Journaling', 'Write 3 things you''re grateful for', 10, 'mental'),
('read_or_learned', 'Learning', 'Read or learned something new (30+ min)', 10, 'mental'),
('strength_training', 'Strength Training', 'Resistance/weight training session', 10, 'physical'),
('cardio', 'Cardio Exercise', 'Cardiovascular exercise (20+ min)', 10, 'physical'),
('home_cooked_meals', 'Home-Cooked Meal', 'Prepared meal at home (vs eating out)', 5, 'physical'),
('no_alcohol', 'No Alcohol', 'Avoided alcohol today', 10, 'physical'),
('no_weed', 'No Cannabis', 'Avoided cannabis today', 10, 'physical'),
('no_spending', 'No Discretionary Spending', 'No unnecessary purchases', 10, 'financial'),
('invested_bitcoin', 'Invested in Bitcoin', 'Added to Bitcoin holdings', 10, 'financial'),
('environmental_action', 'Environmental Action', 'Took action for the environment', 5, 'planetary');
```

### Step 2.3: Run Migrations in Supabase

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your "sovereignty-path" project

2. **SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"
   - Copy/paste `001_initial_schema.sql`
   - Click "Run"

3. **Verify schema:**
   - Click "Table Editor"
   - You should see: profiles, daily_entries, paths, activities

4. **Seed data:**
   - SQL Editor → New Query
   - Copy/paste `seed.sql`
   - Run
   - Verify: paths table should have 6 rows

### Step 2.4: Migrate Existing Data (If Any)

If you have existing data in DuckDB, create a migration script:

**api/scripts/migrate_duckdb_to_supabase.py:**
```python
import duckdb
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role for migration
)

# Connect to DuckDB
duck_conn = duckdb.connect('../../database/sovereignty.db')

def migrate_entries():
    """Migrate daily entries from DuckDB to Supabase"""
    # Query all entries from DuckDB
    entries = duck_conn.execute("""
        SELECT user_id, entry_date, path, activities, score
        FROM daily_entries
    """).fetchall()
    
    print(f"Found {len(entries)} entries to migrate")
    
    for entry in entries:
        user_id, entry_date, path, activities, score = entry
        
        # Insert into Supabase
        data = {
            "user_id": user_id,
            "entry_date": entry_date.isoformat(),
            "path": path,
            "activities": activities,  # Already JSON
            "score": score
        }
        
        result = supabase.table("daily_entries").insert(data).execute()
        print(f"Migrated entry for {entry_date}")
    
    print("Migration complete!")

if __name__ == "__main__":
    migrate_entries()
```

Run migration:
```bash
cd api/scripts
python migrate_duckdb_to_supabase.py
```

---

## Phase 3: Frontend Rebuild (Streamlit → Next.js)

### Estimated Time: 16-20 hours

This is the largest phase. I'll break it down by feature/page.

### Step 3.1: Project Structure Setup

```bash
cd ~/sovereignty-portfolio

# Create app structure
mkdir -p app/(auth)
mkdir -p app/app/{dashboard,paths,analytics,bitcoin,settings}
mkdir -p app/components/sovereignty
mkdir -p lib
```

### Step 3.2: Supabase Client Setup

**lib/supabase/client.ts:**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// For client components
export const createBrowserClient = () => 
  createClientComponentClient()
```

**lib/supabase/server.ts:**
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// For server components
export const createServerClient = () =>
  createServerComponentClient({ cookies })
```

**Add environment variables to `.env.local`:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# FastAPI Backend
NEXT_PUBLIC_API_URL=http://localhost:8000  # Local dev
# NEXT_PUBLIC_API_URL=https://api.sovereigntytracker.com  # Production
```

### Step 3.3: Authentication Pages

**app/(auth)/login/page.tsx:**
```typescript
"use client"

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/app/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">
          Sovereignty Path
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/signup" className="text-orange-500 hover:text-orange-400">
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
```

**app/(auth)/signup/page.tsx:**
```typescript
"use client"

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Create profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          selected_path: 'default'
        })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      // Success - redirect to onboarding or dashboard
      router.push('/app/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">
          Create Account
        </h1>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
            />
            <p className="text-sm text-slate-400 mt-1">Minimum 6 characters</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-orange-500 hover:text-orange-400">
            Already have an account? Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
```

### Step 3.4: Dashboard Page

**app/app/dashboard/page.tsx:**
```typescript
"use client"

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, TrendingUp, Target, Bitcoin } from 'lucide-react'

interface DailyEntry {
  id: string
  entry_date: string
  score: number
  path: string
}

interface Profile {
  full_name: string
  selected_path: string
  btc_holdings: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    setProfile(profileData)

    // Load recent entries
    const { data: entriesData } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('entry_date', { ascending: false })
      .limit(7)

    setRecentEntries(entriesData || [])

    // Calculate streak
    if (entriesData && entriesData.length > 0) {
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < entriesData.length; i++) {
        const entryDate = new Date(entriesData[i].entry_date)
        entryDate.setHours(0, 0, 0, 0)
        
        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)
        
        if (entryDate.getTime() === expectedDate.getTime()) {
          streak++
        } else {
          break
        }
      }
      
      setCurrentStreak(streak)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  const averageScore = recentEntries.length > 0
    ? Math.round(recentEntries.reduce((sum, e) => sum + (e.score || 0), 0) / recentEntries.length)
    : 0

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-500">Sovereignty Path</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">Welcome, {profile?.full_name}</span>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="text-slate-400 hover:text-slate-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Streak */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400">Current Streak</h3>
              <Calendar className="text-orange-500" size={24} />
            </div>
            <div className="text-4xl font-bold">{currentStreak}</div>
            <div className="text-slate-400 text-sm mt-1">days in a row</div>
          </div>

          {/* Average Score */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400">7-Day Average</h3>
              <TrendingUp className="text-orange-500" size={24} />
            </div>
            <div className="text-4xl font-bold">{averageScore}</div>
            <div className="text-slate-400 text-sm mt-1">out of 100</div>
          </div>

          {/* Selected Path */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400">Current Path</h3>
              <Target className="text-orange-500" size={24} />
            </div>
            <div className="text-2xl font-bold capitalize">
              {profile?.selected_path?.replace('_', ' ')}
            </div>
            <Link href="/app/paths" className="text-orange-500 text-sm mt-1 inline-block hover:text-orange-400">
              Change path →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Entry */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Today's Entry</h2>
            {recentEntries.length > 0 && 
             new Date(recentEntries[0].entry_date).toDateString() === new Date().toDateString() ? (
              <div>
                <p className="text-slate-300 mb-4">Score: {recentEntries[0].score}/100</p>
                <Link 
                  href={`/app/entry?date=${recentEntries[0].entry_date}`}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg inline-block"
                >
                  View Today's Entry
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-slate-400 mb-4">You haven't logged today yet.</p>
                <Link 
                  href="/app/entry"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg inline-block"
                >
                  Log Today's Activities
                </Link>
              </div>
            )}
          </div>

          {/* Recent History */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Recent History</h2>
            {recentEntries.length > 0 ? (
              <div className="space-y-2">
                {recentEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-300">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">{entry.score}/100</span>
                  </div>
                ))}
                <Link 
                  href="/app/analytics"
                  className="text-orange-500 hover:text-orange-400 inline-block mt-4"
                >
                  View full history →
                </Link>
              </div>
            ) : (
              <p className="text-slate-400">No entries yet. Start tracking today!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
```

### Step 3.5: Daily Entry Page (Core Feature)

**app/app/entry/page.tsx:**
```typescript
"use client"

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Circle } from 'lucide-react'

interface Activity {
  name: string
  display_name: string
  description: string
  category: string
}

interface PathWeights {
  [key: string]: number
}

export default function EntryPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [completedActivities, setCompletedActivities] = useState<{[key: string]: boolean}>({})
  const [selectedPath, setSelectedPath] = useState('default')
  const [pathWeights, setPathWeights] = useState<PathWeights>({})
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()

  const entryDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadEntryData()
  }, [entryDate])

  const loadEntryData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    // Load user's selected path
    const { data: profileData } = await supabase
      .from('profiles')
      .select('selected_path')
      .eq('id', session.user.id)
      .single()

    if (profileData) {
      setSelectedPath(profileData.selected_path)
    }

    // Load path weights
    const { data: pathData } = await supabase
      .from('paths')
      .select('weights')
      .eq('name', profileData?.selected_path || 'default')
      .single()

    if (pathData) {
      setPathWeights(pathData.weights)
    }

    // Load activities
    const { data: activitiesData } = await supabase
      .from('activities')
      .select('*')
      .order('category', { ascending: true })

    if (activitiesData) {
      setActivities(activitiesData)
    }

    // Load existing entry for this date (if any)
    const { data: entryData } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('entry_date', entryDate)
      .single()

    if (entryData) {
      setCompletedActivities(entryData.activities)
      setScore(entryData.score)
    }

    setLoading(false)
  }

  const toggleActivity = (activityName: string) => {
    const newActivities = {
      ...completedActivities,
      [activityName]: !completedActivities[activityName]
    }
    setCompletedActivities(newActivities)
    calculateScore(newActivities)
  }

  const calculateScore = (activities: {[key: string]: boolean}) => {
    let totalScore = 0
    
    Object.entries(activities).forEach(([activityName, completed]) => {
      if (completed && pathWeights[activityName]) {
        totalScore += pathWeights[activityName]
      }
    })

    setScore(totalScore)
  }

  const saveEntry = async () => {
    setSaving(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const entryData = {
      user_id: session.user.id,
      entry_date: entryDate,
      path: selectedPath,
      activities: completedActivities,
      score: score
    }

    // Upsert (insert or update)
    const { error } = await supabase
      .from('daily_entries')
      .upsert(entryData, {
        onConflict: 'user_id,entry_date'
      })

    if (error) {
      alert('Error saving entry: ' + error.message)
    } else {
      router.push('/app/dashboard')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  // Group activities by category
  const activityGroups = activities.reduce((groups, activity) => {
    const category = activity.category || 'other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(activity)
    return groups
  }, {} as {[key: string]: Activity[]})

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-orange-500">Daily Entry</h1>
          <p className="text-slate-400">
            {new Date(entryDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Display */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8 text-center">
          <div className="text-6xl font-bold text-orange-500 mb-2">{score}</div>
          <div className="text-slate-400">out of 100 points</div>
          <div className="mt-2 text-sm text-slate-500 capitalize">
            {selectedPath.replace('_', ' ')} Path
          </div>
        </div>

        {/* Activities by Category */}
        <div className="space-y-6">
          {Object.entries(activityGroups).map(([category, categoryActivities]) => (
            <div key={category} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 capitalize text-orange-500">
                {category}
              </h2>
              
              <div className="space-y-3">
                {categoryActivities.map((activity) => (
                  <button
                    key={activity.name}
                    onClick={() => toggleActivity(activity.name)}
                    className="w-full flex items-start gap-4 p-4 rounded-lg bg-slate-900 hover:bg-slate-850 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {completedActivities[activity.name] ? (
                        <CheckCircle className="text-green-500" size={24} />
                      ) : (
                        <Circle className="text-slate-600" size={24} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-200">
                          {activity.display_name}
                        </h3>
                        <span className="text-orange-500 font-bold ml-4">
                          {pathWeights[activity.name] || 0} pts
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/app/dashboard')}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveEntry}
            disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white py-4 rounded-lg font-semibold transition-colors"
          >
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </main>
    </div>
  )
}
```

---

## Phase 4: Authentication (Supabase Auth)

### Estimated Time: 4-6 hours

### Step 4.1: Auth Middleware

**middleware.ts (in project root):**
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect /app routes
  if (req.nextUrl.pathname.startsWith('/app') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect logged-in users away from auth pages
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/app/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/app/:path*', '/login', '/signup'],
}
```

### Step 4.2: Auth Context (Optional but Recommended)

**app/providers/AuthProvider.tsx:**
```typescript
"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Update app/layout.tsx:**
```typescript
import { AuthProvider } from './providers/AuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

## Phase 5: Payment Integration (Stripe)

### Estimated Time: 6-8 hours

### Step 5.1: Stripe Setup

**Install Stripe:**
```bash
npm install @stripe/stripe-js stripe
```

**Create Stripe products** (in Stripe Dashboard):
1. Monthly Plan: $9.99/month
2. Annual Plan: $99/year (save 17%)
3. Lifetime Plan: $999 one-time

Note the Price IDs for each.

### Step 5.2: Pricing Page

**app/pricing/page.tsx:**
```typescript
"use client"

import { Check } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { useAuth } from '../providers/AuthProvider'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const { user } = useAuth()

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Redirect to signup
      window.location.href = '/signup'
      return
    }

    // Create checkout session
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId: user.id,
      }),
    })

    const { sessionId } = await response.json()

    // Redirect to Stripe Checkout
    const stripe = await stripePromise
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId })
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Choose Your Path</h1>
          <p className="text-xl text-slate-400">
            Start measuring your sovereignty today
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h3 className="text-2xl font-bold mb-2">Monthly</h3>
            <div className="text-4xl font-bold mb-6">
              $9.99<span className="text-lg text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>All 6 sovereignty paths</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>Unlimited daily entries</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>Historical tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>Bitcoin integration</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout('price_monthly_id')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold"
            >
              Get Started
            </button>
          </div>

          {/* Annual Plan (Recommended) */}
          <div className="bg-slate-800 rounded-lg p-8 border-2 border-orange-500 relative">
            <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
              BEST VALUE
            </div>
            <h3 className="text-2xl font-bold mb-2">Annual</h3>
            <div className="text-4xl font-bold mb-2">
              $99<span className="text-lg text-slate-400">/year</span>
            </div>
            <div className="text-green-500 text-sm mb-6">Save $20/year</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>Everything in Monthly</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>2 months free</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>Priority support</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout('price_annual_id')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold"
            >
              Get Started
            </button>
          </div>

          {/* Lifetime Plan */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h3 className="text-2xl font-bold mb-2">Lifetime</h3>
            <div className="text-4xl font-bold mb-6">
              $999<span className="text-lg text-slate-400">/once</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>Everything in Annual</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>Lifetime access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>All future features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-500 flex-shrink-0" size={20} />
                <span>VIP support</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout('price_lifetime_id')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold"
            >
              Get Lifetime Access
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Step 5.3: Stripe Checkout API

**app/api/stripe/create-checkout-session/route.ts:**
```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: Request) {
  try {
    const { priceId, userId } = await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: priceId.includes('lifetime') ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
```

### Step 5.4: Stripe Webhook (Handle Successful Payments)

**app/api/stripe/webhook/route.ts:**
```typescript
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Update user's subscription status in Supabase
      const userId = session.client_reference_id || session.metadata?.userId

      if (userId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        console.log(`Subscription activated for user ${userId}`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      // Cancel subscription in Supabase
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', subscription.customer)

      console.log(`Subscription canceled for customer ${subscription.customer}`)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', subscription.customer)

      console.log(`Subscription updated for customer ${subscription.customer}`)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
```

### Step 5.5: Update Database Schema for Subscriptions

Add to Supabase (SQL Editor):

```sql
-- Add subscription fields to profiles table
ALTER TABLE profiles 
ADD COLUMN subscription_status TEXT DEFAULT 'free',
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT;

-- Create index for faster lookups
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
```

---

## Phase 6: Deployment & Testing

### Estimated Time: 4-6 hours

### Step 6.1: Environment Variables Setup

**Update `.env.local` with all required variables:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# FastAPI Backend
NEXT_PUBLIC_API_URL=http://localhost:8000  # Local
# NEXT_PUBLIC_API_URL=https://api.sovereigntytracker.com  # Production

# App URL
NEXT_PUBLIC_URL=http://localhost:3000  # Local
# NEXT_PUBLIC_URL=https://sovereigntytracker.com  # Production
```

**Add same variables to Vercel:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. Redeploy after adding

### Step 6.2: Deploy FastAPI Backend

**Option A: Vercel Serverless Functions**

Create `api/vercel.json`:
```json
{
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

**Option B: Railway (Recommended for FastAPI)**

1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select your `sovereignty-portfolio` repo
5. Railway auto-detects Python
6. Add environment variables
7. Deploy!

**Option C: Render**

1. Go to https://render.com
2. New Web Service
3. Connect GitHub repo
4. Build Command: `pip install -r api/requirements.txt`
5. Start Command: `cd api && uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Deploy!

### Step 6.3: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://sovereigntytracker.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Copy webhook signing secret
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 6.4: Testing Checklist

**Authentication:**
```
[ ] Sign up with new account
[ ] Verify email confirmation works
[ ] Log in with created account
[ ] Profile created in Supabase
[ ] Protected routes redirect to login when not authenticated
[ ] Logout works correctly
```

**Core Features:**
```
[ ] Dashboard loads with correct data
[ ] Can create daily entry
[ ] Activities toggle on/off
[ ] Score calculates correctly
[ ] Entry saves to database
[ ] Historical entries display correctly
[ ] Streak calculation works
```

**Paths:**
```
[ ] Can switch between paths
[ ] Different paths show different point values
[ ] Path selection persists
```

**Bitcoin Integration:**
```
[ ] Bitcoin price fetches correctly
[ ] Portfolio calculation works
[ ] Data displays properly
```

**Payments:**
```
[ ] Pricing page loads
[ ] Checkout redirects to Stripe
[ ] Test payment succeeds (use Stripe test card: 4242 4242 4242 4242)
[ ] Webhook receives event
[ ] Subscription status updates in database
[ ] User can access app after payment
```

**Mobile:**
```
[ ] Site responsive on mobile
[ ] Forms usable on small screens
[ ] Navigation works
[ ] Charts/graphs display correctly
```

---

## Migration Timeline Summary

**Total Estimated Time: 46-68 hours**

Broken down by phase:
- Phase 0: Preparation (2-4 hours)
- Phase 1: Backend Migration (8-12 hours)
- Phase 2: Database Migration (6-8 hours)
- Phase 3: Frontend Rebuild (16-20 hours)
- Phase 4: Authentication (4-6 hours)
- Phase 5: Payment Integration (6-8 hours)
- Phase 6: Deployment & Testing (4-6 hours)

**Recommended Schedule:**

**Week 1:** Phases 0-1 (Setup + Backend)
**Week 2:** Phase 2 (Database)
**Week 3-4:** Phase 3 (Frontend - biggest phase)
**Week 5:** Phases 4-5 (Auth + Payments)
**Week 6:** Phase 6 (Deploy + Test)

---

## Post-Migration Checklist

```
[ ] All Streamlit functionality replicated
[ ] Data successfully migrated
[ ] Authentication working
[ ] Payments processing correctly
[ ] Mobile-responsive
[ ] No critical bugs
[ ] Performance acceptable (< 2s load times)
[ ] SEO metadata configured
[ ] Analytics integrated (optional)
[ ] Error monitoring set up (Sentry, optional)
[ ] Backups configured for Supabase
[ ] Documentation updated
[ ] Old Streamlit app archived
```

---

## Maintenance & Future Features

### After Launch:

**Month 1-2:**
- Monitor user feedback
- Fix bugs
- Optimize performance
- Add missing features users request

**Month 3-6:**
- Analytics dashboard improvements
- Social features (leaderboards, friends)
- Mobile app (React Native)
- API for third-party integrations
- Meal planning expansion
- More expert knowledge integration

**Month 6-12:**
- Community features
- Coaching/premium support tier
- White-label for organizations
- Advanced analytics (ML predictions)
- Habit streaks and gamification

---

## Troubleshooting Guide

### Common Issues:

**Issue: Supabase connection fails**
- Check environment variables are correct
- Verify Supabase URL and keys
- Check RLS policies allow access

**Issue: Stripe webhook not firing**
- Verify webhook URL is correct
- Check webhook signing secret matches
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

**Issue: FastAPI not accessible from Next.js**
- Check CORS configuration in FastAPI
- Verify API URL environment variable
- Check FastAPI is running and accessible

**Issue: Auth redirects not working**
- Check middleware.ts is configured correctly
- Verify Supabase auth helpers installed
- Check protected route patterns in middleware config

**Issue: Database queries slow**
- Add indexes to frequently queried columns
- Check RLS policies aren't too complex
- Consider pagination for large datasets

---

## Additional Resources

**Documentation:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- FastAPI: https://fastapi.tiangolo.com
- Stripe: https://stripe.com/docs

**Tools:**
- Supabase CLI: https://github.com/supabase/cli
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Postman: For API testing

**Community:**
- Next.js Discord
- Supabase Discord
- r/webdev
- r/nextjs

---

## Ready to Start?

**Recommended First Steps:**

1. **Copy Streamlit code into current repo** (Phase 0.2)
2. **Set up Supabase project** (Phase 0.5)
3. **Start with Phase 1** (Backend migration)
4. **Test each phase before moving to next**

This is a big project, but breaking it down makes it manageable. You can work on this incrementally while still running the Streamlit app for yourself.

**Questions to answer before starting:**
- Do you have existing user data to migrate, or starting fresh?
- Do you want to keep Streamlit running while you build Next.js version?
- Any features you want to add/remove during migration?
- Timeline pressure, or can take 6-8 weeks?

Let me know which phase you want to tackle first and I can provide more detailed guidance!