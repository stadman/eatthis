-- ============================================
-- EatThis MVP Database Schema
-- ============================================

-- ============================================
-- INGREDIENTS TABLE
-- Master list of ingredients with categories
-- ============================================
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
