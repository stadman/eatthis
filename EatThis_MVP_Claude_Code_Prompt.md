# EatThis MVP - Claude Code Initialization Prompt

Copy and paste this entire prompt into Claude Code to initialize your project.

---

## PROMPT START

I'm building **EatThis**, a recipe discovery app where users input ingredients they have on hand and get recipe suggestions. This is an MVP for friends/family testing via web browser.

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel (already connected to repo)
- **AI:** Claude API (for recipe generation)

### Current State
- Git repository exists and is connected to Vercel
- Starting fresh on features

---

## PHASE 1: Project Setup

### 1.1 Initialize shadcn/ui

First, let's set up shadcn/ui with a clean, modern design:

```bash
npx shadcn@latest init
```

When prompted, use these settings:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

Then install the components we'll need:

```bash
npx shadcn@latest add button input card badge checkbox command dialog scroll-area separator skeleton toast
```

### 1.2 Environment Variables

Create/update `.env.local` with these placeholders (I'll fill in the values):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Also create `.env.example` with the same structure (no values) for documentation.

### 1.3 Install Dependencies

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk lucide-react
```

---

## PHASE 2: Supabase Database Setup

### 2.1 Supabase Project Creation Instructions

**STOP HERE AND PROMPT ME:**
"Please create a new Supabase project at https://supabase.com/dashboard and provide me with:
1. Project URL (Settings → API → Project URL)
2. Anon/Public key (Settings → API → anon public)
3. Service Role key (Settings → API → service_role - keep this secret!)

Once you have these, I'll continue with the database schema setup."

### 2.2 Database Schema

After I provide Supabase credentials, run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- ============================================
-- EatThis MVP Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- INGREDIENTS TABLE
-- Master list of ingredients with categories
-- ============================================
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    -- Categories: proteins, dairy, produce, grains, pantry, spices, condiments, frozen, other
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);

-- ============================================
-- RECIPES TABLE
-- Stores generated and curated recipes
-- ============================================
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructions JSONB NOT NULL, -- Array of step strings
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER,
    servings INTEGER DEFAULT 4,
    difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
    cuisine VARCHAR(50),
    meal_type VARCHAR(50), -- breakfast, lunch, dinner, snack, dessert
    calories_per_serving INTEGER,
    protein_grams DECIMAL(5,1),
    carbs_grams DECIMAL(5,1),
    fat_grams DECIMAL(5,1),
    is_ai_generated BOOLEAN DEFAULT false,
    image_url TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RECIPE_INGREDIENTS TABLE
-- Junction table linking recipes to ingredients
-- ============================================
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
    ingredient_name VARCHAR(100) NOT NULL, -- Denormalized for flexibility
    quantity VARCHAR(50),
    unit VARCHAR(30),
    notes VARCHAR(200), -- e.g., "diced", "optional", "to taste"
    is_optional BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);

-- ============================================
-- USER_PANTRY TABLE (Session-based for MVP)
-- Temporary storage of user's available ingredients
-- ============================================
CREATE TABLE user_pantry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) NOT NULL, -- Browser session identifier
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_pantry_session ON user_pantry(session_id);

-- ============================================
-- SEARCH_HISTORY TABLE
-- Track searches for analytics and improvements
-- ============================================
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100),
    ingredients_searched TEXT[], -- Array of ingredient names
    recipes_returned INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SEED DATA: Common Ingredients
-- ============================================
INSERT INTO ingredients (name, category) VALUES
-- Proteins
('chicken breast', 'proteins'),
('chicken thighs', 'proteins'),
('ground beef', 'proteins'),
('ground turkey', 'proteins'),
('bacon', 'proteins'),
('eggs', 'proteins'),
('salmon', 'proteins'),
('shrimp', 'proteins'),
('tofu', 'proteins'),
('pork chops', 'proteins'),
('sausage', 'proteins'),
('ham', 'proteins'),
('tuna', 'proteins'),
('steak', 'proteins'),

-- Dairy
('milk', 'dairy'),
('butter', 'dairy'),
('cheddar cheese', 'dairy'),
('mozzarella cheese', 'dairy'),
('parmesan cheese', 'dairy'),
('cream cheese', 'dairy'),
('sour cream', 'dairy'),
('heavy cream', 'dairy'),
('greek yogurt', 'dairy'),
('feta cheese', 'dairy'),

-- Produce
('onion', 'produce'),
('garlic', 'produce'),
('tomatoes', 'produce'),
('potatoes', 'produce'),
('carrots', 'produce'),
('celery', 'produce'),
('bell peppers', 'produce'),
('broccoli', 'produce'),
('spinach', 'produce'),
('lettuce', 'produce'),
('mushrooms', 'produce'),
('zucchini', 'produce'),
('cucumber', 'produce'),
('avocado', 'produce'),
('lemon', 'produce'),
('lime', 'produce'),
('ginger', 'produce'),
('jalapeño', 'produce'),
('green onions', 'produce'),
('cilantro', 'produce'),
('basil', 'produce'),
('corn', 'produce'),
('green beans', 'produce'),
('asparagus', 'produce'),
('cabbage', 'produce'),

-- Grains & Carbs
('rice', 'grains'),
('pasta', 'grains'),
('bread', 'grains'),
('flour', 'grains'),
('tortillas', 'grains'),
('oats', 'grains'),
('quinoa', 'grains'),
('breadcrumbs', 'grains'),
('noodles', 'grains'),

-- Pantry Staples
('olive oil', 'pantry'),
('vegetable oil', 'pantry'),
('chicken broth', 'pantry'),
('beef broth', 'pantry'),
('canned tomatoes', 'pantry'),
('tomato paste', 'pantry'),
('tomato sauce', 'pantry'),
('coconut milk', 'pantry'),
('black beans', 'pantry'),
('chickpeas', 'pantry'),
('kidney beans', 'pantry'),
('peanut butter', 'pantry'),
('honey', 'pantry'),
('maple syrup', 'pantry'),
('vinegar', 'pantry'),
('balsamic vinegar', 'pantry'),
('apple cider vinegar', 'pantry'),
('sugar', 'pantry'),
('brown sugar', 'pantry'),

-- Spices & Seasonings
('salt', 'spices'),
('black pepper', 'spices'),
('paprika', 'spices'),
('cumin', 'spices'),
('chili powder', 'spices'),
('oregano', 'spices'),
('thyme', 'spices'),
('rosemary', 'spices'),
('cinnamon', 'spices'),
('garlic powder', 'spices'),
('onion powder', 'spices'),
('italian seasoning', 'spices'),
('red pepper flakes', 'spices'),
('bay leaves', 'spices'),
('nutmeg', 'spices'),
('turmeric', 'spices'),
('curry powder', 'spices'),
('cajun seasoning', 'spices'),

-- Condiments & Sauces
('soy sauce', 'condiments'),
('worcestershire sauce', 'condiments'),
('hot sauce', 'condiments'),
('ketchup', 'condiments'),
('mustard', 'condiments'),
('mayonnaise', 'condiments'),
('sriracha', 'condiments'),
('salsa', 'condiments'),
('bbq sauce', 'condiments'),
('fish sauce', 'condiments'),
('sesame oil', 'condiments'),
('ranch dressing', 'condiments'),

-- Frozen
('frozen peas', 'frozen'),
('frozen corn', 'frozen'),
('frozen mixed vegetables', 'frozen'),
('frozen berries', 'frozen');

-- ============================================
-- SEED DATA: Sample Recipes
-- ============================================
INSERT INTO recipes (title, description, instructions, prep_time_minutes, cook_time_minutes, total_time_minutes, servings, difficulty, cuisine, meal_type, calories_per_serving, protein_grams, carbs_grams, fat_grams) VALUES
(
    'Classic Chicken Stir Fry',
    'A quick and healthy stir fry with tender chicken and crisp vegetables',
    '["Cut chicken breast into bite-sized pieces and season with salt and pepper", "Heat vegetable oil in a large skillet or wok over high heat", "Add chicken and cook until golden, about 5-6 minutes. Remove and set aside", "Add more oil if needed, then add bell peppers, broccoli, and carrots", "Stir fry vegetables for 3-4 minutes until crisp-tender", "Return chicken to the pan", "Mix soy sauce, garlic, and ginger, pour over the stir fry", "Toss everything together and cook 1-2 more minutes", "Serve hot over rice"]',
    15, 15, 30, 4, 'easy', 'Asian', 'dinner', 320, 28, 18, 12
),
(
    'Creamy Garlic Pasta',
    'Rich and creamy pasta with a garlicky parmesan sauce',
    '["Cook pasta according to package directions, reserve 1 cup pasta water", "In a large skillet, melt butter over medium heat", "Add minced garlic and cook until fragrant, about 1 minute", "Pour in heavy cream and bring to a simmer", "Add parmesan cheese and stir until melted and smooth", "Season with salt, pepper, and a pinch of nutmeg", "Add drained pasta and toss to coat", "Add pasta water as needed to reach desired consistency", "Garnish with fresh parsley and extra parmesan"]',
    10, 20, 30, 4, 'easy', 'Italian', 'dinner', 520, 15, 48, 30
),
(
    'Simple Egg Fried Rice',
    'Restaurant-style fried rice you can make at home in minutes',
    '["Use day-old cold rice for best results, or spread fresh rice on a baking sheet to cool", "Beat eggs with a pinch of salt", "Heat vegetable oil in a wok or large skillet over high heat", "Add beaten eggs and scramble quickly, then remove and set aside", "Add more oil, then add rice and stir fry for 3-4 minutes", "Push rice to one side, add garlic and green onions to the empty side", "Mix everything together", "Add soy sauce and sesame oil, toss to combine", "Return scrambled eggs to the pan and mix through", "Season with salt and white pepper to taste"]',
    10, 10, 20, 4, 'easy', 'Asian', 'dinner', 280, 9, 42, 8
),
(
    'One-Pan Lemon Herb Chicken',
    'Juicy chicken thighs roasted with potatoes and herbs',
    '["Preheat oven to 425°F (220°C)", "Cut potatoes into 1-inch chunks", "In a large bowl, toss potatoes with olive oil, salt, pepper, and thyme", "Spread potatoes in a single layer on a baking sheet", "Season chicken thighs with salt, pepper, garlic powder, and paprika", "Place chicken on top of potatoes", "Squeeze lemon juice over everything and add lemon slices", "Roast for 35-40 minutes until chicken is cooked through (165°F internal)", "Let rest 5 minutes before serving", "Garnish with fresh herbs"]',
    15, 40, 55, 4, 'easy', 'American', 'dinner', 450, 32, 28, 24
),
(
    'Quick Black Bean Tacos',
    'Flavorful vegetarian tacos ready in under 20 minutes',
    '["Drain and rinse black beans", "Heat olive oil in a skillet over medium heat", "Add diced onion and cook until softened, about 3 minutes", "Add black beans, cumin, chili powder, and garlic powder", "Mash some beans with a fork for texture, leave others whole", "Add a splash of water and simmer 5 minutes", "Season with salt and lime juice", "Warm tortillas in a dry skillet or microwave", "Assemble tacos with bean mixture", "Top with salsa, cheese, sour cream, and cilantro"]',
    10, 10, 20, 4, 'easy', 'Mexican', 'dinner', 340, 14, 52, 8
);

-- Link recipes to ingredients
-- Chicken Stir Fry
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, display_order)
SELECT r.id, ing.name, ing.qty, ing.unit, ing.ord
FROM recipes r,
(VALUES 
    ('chicken breast', '1', 'lb', 1),
    ('bell peppers', '2', 'medium', 2),
    ('broccoli', '2', 'cups', 3),
    ('carrots', '2', 'medium', 4),
    ('soy sauce', '3', 'tbsp', 5),
    ('garlic', '3', 'cloves', 6),
    ('ginger', '1', 'tbsp', 7),
    ('vegetable oil', '2', 'tbsp', 8),
    ('rice', '2', 'cups', 9)
) AS ing(name, qty, unit, ord)
WHERE r.title = 'Classic Chicken Stir Fry';

-- Creamy Garlic Pasta
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, display_order)
SELECT r.id, ing.name, ing.qty, ing.unit, ing.ord
FROM recipes r,
(VALUES 
    ('pasta', '1', 'lb', 1),
    ('butter', '4', 'tbsp', 2),
    ('garlic', '4', 'cloves', 3),
    ('heavy cream', '1', 'cup', 4),
    ('parmesan cheese', '1', 'cup', 5),
    ('salt', '', 'to taste', 6),
    ('black pepper', '', 'to taste', 7)
) AS ing(name, qty, unit, ord)
WHERE r.title = 'Creamy Garlic Pasta';

-- Egg Fried Rice
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, display_order)
SELECT r.id, ing.name, ing.qty, ing.unit, ing.ord
FROM recipes r,
(VALUES 
    ('rice', '4', 'cups cooked', 1),
    ('eggs', '3', 'large', 2),
    ('vegetable oil', '3', 'tbsp', 3),
    ('soy sauce', '2', 'tbsp', 4),
    ('sesame oil', '1', 'tsp', 5),
    ('garlic', '2', 'cloves', 6),
    ('green onions', '3', 'stalks', 7),
    ('salt', '', 'to taste', 8)
) AS ing(name, qty, unit, ord)
WHERE r.title = 'Simple Egg Fried Rice';

-- Lemon Herb Chicken
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, display_order)
SELECT r.id, ing.name, ing.qty, ing.unit, ing.ord
FROM recipes r,
(VALUES 
    ('chicken thighs', '4', 'pieces', 1),
    ('potatoes', '1.5', 'lbs', 2),
    ('olive oil', '3', 'tbsp', 3),
    ('lemon', '1', 'large', 4),
    ('thyme', '1', 'tsp dried', 5),
    ('garlic powder', '1', 'tsp', 6),
    ('paprika', '1', 'tsp', 7),
    ('salt', '', 'to taste', 8),
    ('black pepper', '', 'to taste', 9)
) AS ing(name, qty, unit, ord)
WHERE r.title = 'One-Pan Lemon Herb Chicken';

-- Black Bean Tacos
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, display_order)
SELECT r.id, ing.name, ing.qty, ing.unit, ing.ord
FROM recipes r,
(VALUES 
    ('black beans', '2', 'cans', 1),
    ('onion', '1', 'medium', 2),
    ('olive oil', '1', 'tbsp', 3),
    ('cumin', '1', 'tsp', 4),
    ('chili powder', '1', 'tsp', 5),
    ('garlic powder', '0.5', 'tsp', 6),
    ('lime', '1', 'juiced', 7),
    ('tortillas', '8', 'small', 8),
    ('salsa', '', 'for serving', 9),
    ('cheddar cheese', '', 'for serving', 10),
    ('sour cream', '', 'for serving', 11),
    ('cilantro', '', 'for serving', 12)
) AS ing(name, qty, unit, ord)
WHERE r.title = 'Quick Black Bean Tacos';

-- Update ingredient_id in recipe_ingredients where we have matches
UPDATE recipe_ingredients ri
SET ingredient_id = i.id
FROM ingredients i
WHERE LOWER(ri.ingredient_name) = LOWER(i.name);

-- ============================================
-- ROW LEVEL SECURITY (Disabled for MVP)
-- ============================================
-- For MVP without auth, we'll keep RLS disabled
-- Enable these when you add authentication later

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pantry ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access for MVP
CREATE POLICY "Public read access" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public read access" ON recipes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Public access" ON user_pantry FOR ALL USING (true);
CREATE POLICY "Public access" ON search_history FOR ALL USING (true);

-- Grant permissions
GRANT SELECT ON ingredients TO anon;
GRANT SELECT ON recipes TO anon;
GRANT SELECT ON recipe_ingredients TO anon;
GRANT ALL ON user_pantry TO anon;
GRANT ALL ON search_history TO anon;
```

---

## PHASE 3: Application Code Structure

Create the following file structure:

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main landing/search page
│   ├── globals.css
│   ├── api/
│   │   ├── ingredients/
│   │   │   └── route.ts            # GET ingredients list
│   │   ├── recipes/
│   │   │   ├── route.ts            # GET recipes, POST new recipe
│   │   │   └── search/
│   │   │       └── route.ts        # POST search by ingredients
│   │   └── generate/
│   │       └── route.ts            # POST AI recipe generation
│   └── recipe/
│       └── [id]/
│           └── page.tsx            # Individual recipe view
├── components/
│   ├── ui/                         # shadcn components (auto-generated)
│   ├── ingredient-selector.tsx     # Main ingredient picker
│   ├── ingredient-chip.tsx         # Individual ingredient tag
│   ├── recipe-card.tsx             # Recipe preview card
│   ├── recipe-list.tsx             # Grid of recipe cards
│   ├── recipe-detail.tsx           # Full recipe view
│   ├── search-results.tsx          # Results container
│   ├── category-filter.tsx         # Filter by ingredient category
│   └── header.tsx                  # App header
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── claude.ts                   # Claude API client
│   ├── utils.ts                    # Utility functions
│   └── types.ts                    # TypeScript types
└── hooks/
    ├── use-ingredients.ts          # Fetch ingredients
    ├── use-recipes.ts              # Recipe search
    └── use-session.ts              # Session management
```

---

## PHASE 4: Core Implementation

### 4.1 Supabase Client (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for API routes)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 4.2 TypeScript Types (`src/lib/types.ts`)

```typescript
export interface Ingredient {
  id: string
  name: string
  category: string
}

export interface RecipeIngredient {
  id: string
  ingredient_name: string
  quantity: string | null
  unit: string | null
  notes: string | null
  is_optional: boolean
}

export interface Recipe {
  id: string
  title: string
  description: string | null
  instructions: string[]
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  total_time_minutes: number | null
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string | null
  meal_type: string | null
  calories_per_serving: number | null
  protein_grams: number | null
  carbs_grams: number | null
  fat_grams: number | null
  is_ai_generated: boolean
  image_url: string | null
  recipe_ingredients?: RecipeIngredient[]
}

export interface RecipeSearchResult extends Recipe {
  match_count: number
  total_ingredients: number
  match_percentage: number
  missing_ingredients: string[]
}

export type IngredientCategory = 
  | 'proteins'
  | 'dairy'
  | 'produce'
  | 'grains'
  | 'pantry'
  | 'spices'
  | 'condiments'
  | 'frozen'
  | 'other'

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  proteins: '🥩 Proteins',
  dairy: '🧀 Dairy',
  produce: '🥬 Produce',
  grains: '🌾 Grains & Carbs',
  pantry: '🥫 Pantry Staples',
  spices: '🧂 Spices',
  condiments: '🍯 Condiments',
  frozen: '🧊 Frozen',
  other: '📦 Other'
}

export const CATEGORY_ORDER: IngredientCategory[] = [
  'proteins',
  'dairy', 
  'produce',
  'grains',
  'pantry',
  'spices',
  'condiments',
  'frozen',
  'other'
]
```

### 4.3 Main Page (`src/app/page.tsx`)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { IngredientSelector } from '@/components/ingredient-selector'
import { RecipeList } from '@/components/recipe-list'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Search } from 'lucide-react'
import { Recipe, RecipeSearchResult, Ingredient } from '@/lib/types'

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [recipes, setRecipes] = useState<RecipeSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Fetch available ingredients on mount
  useEffect(() => {
    fetch('/api/ingredients')
      .then(res => res.json())
      .then(data => setIngredients(data))
      .catch(console.error)
  }, [])

  const handleSearch = async () => {
    if (selectedIngredients.length === 0) return
    
    setIsSearching(true)
    setHasSearched(true)
    
    try {
      const res = await fetch('/api/recipes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: selectedIngredients })
      })
      const data = await res.json()
      setRecipes(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) return
    
    setIsGenerating(true)
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: selectedIngredients })
      })
      const data = await res.json()
      
      if (data.recipe) {
        // Add generated recipe to results
        setRecipes(prev => [{
          ...data.recipe,
          match_count: selectedIngredients.length,
          total_ingredients: selectedIngredients.length,
          match_percentage: 100,
          missing_ingredients: []
        }, ...prev])
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            What's in your kitchen?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the ingredients you have on hand, and we'll show you delicious recipes you can make right now.
          </p>
        </div>

        {/* Ingredient Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <IngredientSelector
            ingredients={ingredients}
            selected={selectedIngredients}
            onChange={setSelectedIngredients}
          />
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
            <Button
              onClick={handleSearch}
              disabled={selectedIngredients.length === 0 || isSearching}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSearching ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Search className="mr-2 h-5 w-5" />
              )}
              Find Recipes ({selectedIngredients.length} ingredients)
            </Button>
            
            <Button
              onClick={handleGenerate}
              disabled={selectedIngredients.length < 3 || isGenerating}
              size="lg"
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Generate New Recipe with AI
            </Button>
            
            {selectedIngredients.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedIngredients([])
                  setRecipes([])
                  setHasSearched(false)
                }}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <RecipeList 
            recipes={recipes} 
            isLoading={isSearching}
            selectedIngredients={selectedIngredients}
          />
        )}
      </main>
    </div>
  )
}
```

### 4.4 Ingredient Selector Component (`src/components/ingredient-selector.tsx`)

```typescript
'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X } from 'lucide-react'
import { Ingredient, CATEGORY_LABELS, CATEGORY_ORDER, IngredientCategory } from '@/lib/types'

interface IngredientSelectorProps {
  ingredients: Ingredient[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function IngredientSelector({ ingredients, selected, onChange }: IngredientSelectorProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<IngredientCategory | 'all'>('all')

  // Group ingredients by category
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {}
    
    ingredients.forEach(ing => {
      if (!groups[ing.category]) {
        groups[ing.category] = []
      }
      groups[ing.category].push(ing)
    })
    
    // Sort each group alphabetically
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name))
    })
    
    return groups
  }, [ingredients])

  // Filter ingredients based on search and category
  const filteredIngredients = useMemo(() => {
    let filtered = ingredients
    
    if (search) {
      filtered = filtered.filter(ing => 
        ing.name.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(ing => ing.category === activeCategory)
    }
    
    return filtered
  }, [ingredients, search, activeCategory])

  const toggleIngredient = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name))
    } else {
      onChange([...selected, name])
    }
  }

  const removeIngredient = (name: string) => {
    onChange(selected.filter(s => s !== name))
  }

  return (
    <div className="space-y-4">
      {/* Selected Ingredients */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          {selected.map(name => (
            <Badge
              key={name}
              variant="secondary"
              className="pl-3 pr-1 py-1.5 text-sm bg-orange-100 text-orange-800 hover:bg-orange-200"
            >
              {name}
              <button
                onClick={() => removeIngredient(name)}
                className="ml-2 p-0.5 rounded-full hover:bg-orange-300"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setActiveCategory('all')}
        >
          All
        </Badge>
        {CATEGORY_ORDER.map(cat => (
          <Badge
            key={cat}
            variant={activeCategory === cat ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </Badge>
        ))}
      </div>

      {/* Ingredient Grid */}
      <ScrollArea className="h-64 rounded-md border p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {filteredIngredients.map(ing => (
            <label
              key={ing.id}
              className={`
                flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
                ${selected.includes(ing.name) 
                  ? 'bg-orange-100 border-orange-300' 
                  : 'hover:bg-gray-50 border-transparent'
                }
                border
              `}
            >
              <Checkbox
                checked={selected.includes(ing.name)}
                onCheckedChange={() => toggleIngredient(ing.name)}
              />
              <span className="text-sm truncate">{ing.name}</span>
            </label>
          ))}
        </div>
        
        {filteredIngredients.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No ingredients found. Try a different search.
          </p>
        )}
      </ScrollArea>
    </div>
  )
}
```

### 4.5 Recipe Card Component (`src/components/recipe-card.tsx`)

```typescript
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Flame, ChefHat, Sparkles } from 'lucide-react'
import { RecipeSearchResult } from '@/lib/types'

interface RecipeCardProps {
  recipe: RecipeSearchResult
  selectedIngredients: string[]
}

export function RecipeCard({ recipe, selectedIngredients }: RecipeCardProps) {
  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
        {/* Match Percentage Banner */}
        <div className={`
          px-4 py-2 text-sm font-medium
          ${recipe.match_percentage >= 80 
            ? 'bg-green-500 text-white' 
            : recipe.match_percentage >= 50 
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }
        `}>
          {recipe.match_percentage}% match • {recipe.match_count}/{recipe.total_ingredients} ingredients
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg group-hover:text-orange-600 transition-colors line-clamp-2">
              {recipe.title}
            </CardTitle>
            {recipe.is_ai_generated && (
              <Badge variant="secondary" className="shrink-0 bg-purple-100 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {recipe.description}
          </p>

          {/* Missing Ingredients */}
          {recipe.missing_ingredients.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Missing:</p>
              <div className="flex flex-wrap gap-1">
                {recipe.missing_ingredients.slice(0, 3).map(ing => (
                  <Badge key={ing} variant="outline" className="text-xs">
                    {ing}
                  </Badge>
                ))}
                {recipe.missing_ingredients.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{recipe.missing_ingredients.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {recipe.total_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {recipe.total_time_minutes} min
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {recipe.servings}
              </span>
            )}
            {recipe.calories_per_serving && (
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                {recipe.calories_per_serving} cal
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge className={difficultyColor[recipe.difficulty]}>
              {recipe.difficulty}
            </Badge>
            {recipe.cuisine && (
              <Badge variant="outline">{recipe.cuisine}</Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
```

### 4.6 Recipe List Component (`src/components/recipe-list.tsx`)

```typescript
import { RecipeCard } from './recipe-card'
import { Skeleton } from '@/components/ui/skeleton'
import { RecipeSearchResult } from '@/lib/types'
import { ChefHat } from 'lucide-react'

interface RecipeListProps {
  recipes: RecipeSearchResult[]
  isLoading: boolean
  selectedIngredients: string[]
}

export function RecipeList({ recipes, isLoading, selectedIngredients }: RecipeListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16">
        <ChefHat className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No recipes found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try selecting different ingredients or click "Generate New Recipe with AI" 
          to create something custom!
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''} Found
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe}
            selectedIngredients={selectedIngredients}
          />
        ))}
      </div>
    </div>
  )
}
```

### 4.7 API Routes

**`src/app/api/ingredients/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

**`src/app/api/recipes/search/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { RecipeSearchResult } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { ingredients } = await request.json()

  if (!ingredients || ingredients.length === 0) {
    return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 })
  }

  // Normalize ingredient names for matching
  const normalizedIngredients = ingredients.map((i: string) => i.toLowerCase().trim())

  // Get all recipes with their ingredients
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        ingredient_name,
        quantity,
        unit,
        is_optional
      )
    `)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate match scores for each recipe
  const scoredRecipes: RecipeSearchResult[] = recipes.map(recipe => {
    const recipeIngredients = recipe.recipe_ingredients || []
    const requiredIngredients = recipeIngredients.filter((ri: any) => !ri.is_optional)
    
    let matchCount = 0
    const missingIngredients: string[] = []

    requiredIngredients.forEach((ri: any) => {
      const ingredientName = ri.ingredient_name.toLowerCase()
      // Check for partial matches (e.g., "chicken" matches "chicken breast")
      const isMatch = normalizedIngredients.some((selected: string) => 
        ingredientName.includes(selected) || selected.includes(ingredientName)
      )
      
      if (isMatch) {
        matchCount++
      } else {
        missingIngredients.push(ri.ingredient_name)
      }
    })

    const totalIngredients = requiredIngredients.length
    const matchPercentage = totalIngredients > 0 
      ? Math.round((matchCount / totalIngredients) * 100)
      : 0

    return {
      ...recipe,
      instructions: recipe.instructions || [],
      match_count: matchCount,
      total_ingredients: totalIngredients,
      match_percentage: matchPercentage,
      missing_ingredients: missingIngredients
    }
  })

  // Filter and sort: show recipes with at least 30% match, sorted by match %
  const filteredRecipes = scoredRecipes
    .filter(r => r.match_percentage >= 30)
    .sort((a, b) => b.match_percentage - a.match_percentage)

  // Log search for analytics
  await supabase.from('search_history').insert({
    ingredients_searched: ingredients,
    recipes_returned: filteredRecipes.length
  })

  return NextResponse.json(filteredRecipes)
}
```

**`src/app/api/generate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: NextRequest) {
  const { ingredients } = await request.json()

  if (!ingredients || ingredients.length < 3) {
    return NextResponse.json(
      { error: 'At least 3 ingredients required' },
      { status: 400 }
    )
  }

  try {
    const prompt = `You are a professional chef. Create a delicious recipe using these ingredients: ${ingredients.join(', ')}.

You MUST use at least 3 of the listed ingredients as key components. You may add basic pantry staples (salt, pepper, oil, water) if needed.

Return ONLY valid JSON in this exact format, no other text:
{
  "title": "Recipe Name",
  "description": "A brief 1-2 sentence description",
  "instructions": ["Step 1...", "Step 2...", "Step 3..."],
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "total_time_minutes": 45,
  "servings": 4,
  "difficulty": "easy",
  "cuisine": "American",
  "meal_type": "dinner",
  "calories_per_serving": 350,
  "protein_grams": 25,
  "carbs_grams": 30,
  "fat_grams": 15,
  "ingredients": [
    {"name": "ingredient name", "quantity": "1", "unit": "cup", "notes": "diced"}
  ]
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })

    // Extract text content
    const textContent = message.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI')
    }

    // Parse JSON from response
    const recipeData = JSON.parse(textContent.text)

    // Save to database
    const { data: recipe, error: recipeError } = await supabaseAdmin
      .from('recipes')
      .insert({
        title: recipeData.title,
        description: recipeData.description,
        instructions: recipeData.instructions,
        prep_time_minutes: recipeData.prep_time_minutes,
        cook_time_minutes: recipeData.cook_time_minutes,
        total_time_minutes: recipeData.total_time_minutes,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        cuisine: recipeData.cuisine,
        meal_type: recipeData.meal_type,
        calories_per_serving: recipeData.calories_per_serving,
        protein_grams: recipeData.protein_grams,
        carbs_grams: recipeData.carbs_grams,
        fat_grams: recipeData.fat_grams,
        is_ai_generated: true
      })
      .select()
      .single()

    if (recipeError) throw recipeError

    // Save recipe ingredients
    if (recipeData.ingredients && recipe) {
      const ingredientRows = recipeData.ingredients.map((ing: any, index: number) => ({
        recipe_id: recipe.id,
        ingredient_name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes,
        display_order: index
      }))

      await supabaseAdmin
        .from('recipe_ingredients')
        .insert(ingredientRows)
    }

    return NextResponse.json({ recipe })

  } catch (error) {
    console.error('Recipe generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    )
  }
}
```

### 4.8 Recipe Detail Page (`src/app/recipe/[id]/page.tsx`)

```typescript
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Clock, Users, Flame, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function RecipePage({ params }: Props) {
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        ingredient_name,
        quantity,
        unit,
        notes,
        is_optional,
        display_order
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  const ingredients = recipe.recipe_ingredients?.sort(
    (a: any, b: any) => a.display_order - b.display_order
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to search
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
            {recipe.is_ai_generated && (
              <Badge className="bg-purple-100 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>
          
          <p className="text-lg text-gray-600 mb-4">{recipe.description}</p>
          
          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-gray-600">
            {recipe.total_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                {recipe.total_time_minutes} minutes
                {recipe.prep_time_minutes && recipe.cook_time_minutes && (
                  <span className="text-sm text-gray-400 ml-1">
                    ({recipe.prep_time_minutes} prep + {recipe.cook_time_minutes} cook)
                  </span>
                )}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-5 w-5" />
              {recipe.servings} servings
            </span>
            {recipe.calories_per_serving && (
              <span className="flex items-center gap-1">
                <Flame className="h-5 w-5" />
                {recipe.calories_per_serving} cal/serving
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant={
              recipe.difficulty === 'easy' ? 'default' : 
              recipe.difficulty === 'medium' ? 'secondary' : 'destructive'
            }>
              {recipe.difficulty}
            </Badge>
            {recipe.cuisine && <Badge variant="outline">{recipe.cuisine}</Badge>}
            {recipe.meal_type && <Badge variant="outline">{recipe.meal_type}</Badge>}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Ingredients */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {ingredients.map((ing: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0" />
                    <span>
                      {ing.quantity && <strong>{ing.quantity}</strong>}
                      {ing.unit && ` ${ing.unit}`}
                      {' '}{ing.ingredient_name}
                      {ing.notes && (
                        <span className="text-gray-500 text-sm"> ({ing.notes})</span>
                      )}
                      {ing.is_optional && (
                        <Badge variant="outline" className="ml-2 text-xs">optional</Badge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {(recipe.instructions as string[]).map((step: string, index: number) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold shrink-0">
                      {index + 1}
                    </span>
                    <p className="pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Nutrition */}
        {(recipe.protein_grams || recipe.carbs_grams || recipe.fat_grams) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Nutrition per Serving</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {recipe.calories_per_serving || '-'}
                  </p>
                  <p className="text-sm text-gray-500">Calories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {recipe.protein_grams || '-'}g
                  </p>
                  <p className="text-sm text-gray-500">Protein</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {recipe.carbs_grams || '-'}g
                  </p>
                  <p className="text-sm text-gray-500">Carbs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {recipe.fat_grams || '-'}g
                  </p>
                  <p className="text-sm text-gray-500">Fat</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

### 4.9 Header Component (`src/components/header.tsx`)

```typescript
import Link from 'next/link'
import { UtensilsCrossed } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            Eat<span className="text-orange-500">This</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
```

---

## PHASE 5: Final Setup

### 5.1 Update Layout (`src/app/layout.tsx`)

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EatThis - Recipe Discovery from Your Ingredients',
  description: 'Find delicious recipes based on the ingredients you have on hand.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### 5.2 Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

### 5.3 Test Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Push to deploy (Vercel auto-deploys)
git add .
git commit -m "MVP: Ingredient-based recipe search"
git push
```

---

## CHECKLIST SUMMARY

Please execute in this order:

1. [ ] Initialize shadcn/ui and install components
2. [ ] Install npm dependencies (supabase, anthropic-sdk, lucide-react)
3. [ ] **STOP AND ASK ME FOR SUPABASE CREDENTIALS**
4. [ ] Create `.env.local` with credentials
5. [ ] Run the SQL schema in Supabase SQL Editor
6. [ ] Create the file structure and all components
7. [ ] Test locally with `npm run dev`
8. [ ] Add environment variables to Vercel
9. [ ] Deploy with git push

Let me know when you're ready to start, and I'll guide you through each phase. First, let's set up shadcn/ui!

---

## PROMPT END
