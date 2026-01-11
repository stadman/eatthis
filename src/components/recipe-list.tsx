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
          Try selecting different ingredients or click &quot;Generate New Recipe with AI&quot;
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
