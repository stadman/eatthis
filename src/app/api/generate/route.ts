import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { ingredients } = await request.json()

  if (!ingredients || ingredients.length < 3) {
    return NextResponse.json(
      { error: 'At least 3 ingredients required' },
      { status: 400 }
    )
  }

  // Check if Google AI API key is configured
  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json(
      { error: 'AI recipe generation is not configured yet.' },
      { status: 503 }
    )
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonText = text
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    } else {
      // Try to find raw JSON
      const rawJsonMatch = text.match(/\{[\s\S]*\}/)
      if (rawJsonMatch) {
        jsonText = rawJsonMatch[0]
      }
    }

    // Parse JSON from response
    const recipeData = JSON.parse(jsonText)

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
