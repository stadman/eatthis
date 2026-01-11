import { createAdminClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Users, Flame, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

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
    .eq('id', id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  const ingredients = recipe.recipe_ingredients?.sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
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
                {ingredients.map((ing: { quantity: string; unit: string; ingredient_name: string; notes: string; is_optional: boolean }, index: number) => (
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
