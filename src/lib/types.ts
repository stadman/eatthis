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
  proteins: 'Proteins',
  dairy: 'Dairy',
  produce: 'Produce',
  grains: 'Grains & Carbs',
  pantry: 'Pantry Staples',
  spices: 'Spices',
  condiments: 'Condiments',
  frozen: 'Frozen',
  other: 'Other'
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
