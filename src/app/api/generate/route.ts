import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// Anthropic SDK - will be used when API key is configured
// import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  const { ingredients } = await request.json()

  if (!ingredients || ingredients.length < 3) {
    return NextResponse.json(
      { error: 'At least 3 ingredients required' },
      { status: 400 }
    )
  }

  // Check if Anthropic API key is configured
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key') {
    return NextResponse.json(
      { error: 'AI recipe generation is not configured yet. Please add your Anthropic API key.' },
      { status: 503 }
    )
  }

  try {
    // Dynamic import of Anthropic SDK
    const Anthropic = (await import('@anthropic-ai/sdk')).default

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

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

    const supabase = createAdminClient()

    // Save to database
    const { data: recipe, error: recipeError } = await supabase
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
      const ingredientRows = recipeData.ingredients.map((ing: { name: string; quantity: string; unit: string; notes: string }, index: number) => ({
        recipe_id: recipe.id,
        ingredient_name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes,
        display_order: index
      }))

      await supabase
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
