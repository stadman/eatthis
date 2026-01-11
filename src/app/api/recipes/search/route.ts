import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { RecipeSearchResult } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { ingredients } = await request.json()

  if (!ingredients || ingredients.length === 0) {
    return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 })
  }

  const supabase = createAdminClient()

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
    const requiredIngredients = recipeIngredients.filter((ri: { is_optional: boolean }) => !ri.is_optional)

    let matchCount = 0
    const missingIngredients: string[] = []

    requiredIngredients.forEach((ri: { ingredient_name: string }) => {
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
