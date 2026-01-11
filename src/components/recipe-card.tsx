import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Flame, Sparkles } from 'lucide-react'
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
          {recipe.match_percentage}% match - {recipe.match_count}/{recipe.total_ingredients} ingredients
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
