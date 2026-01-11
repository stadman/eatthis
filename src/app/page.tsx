'use client'

import { useState, useEffect } from 'react'
import { IngredientSelector } from '@/components/ingredient-selector'
import { RecipeList } from '@/components/recipe-list'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Search } from 'lucide-react'
import { RecipeSearchResult, Ingredient } from '@/lib/types'
import { toast } from 'sonner'

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
      .catch(err => {
        console.error(err)
        toast.error('Failed to load ingredients')
      })
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
      toast.error('Failed to search recipes')
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

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (data.recipe) {
        // Add generated recipe to results
        setRecipes(prev => [{
          ...data.recipe,
          match_count: selectedIngredients.length,
          total_ingredients: selectedIngredients.length,
          match_percentage: 100,
          missing_ingredients: []
        }, ...prev])
        toast.success('New recipe generated!')
      }
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate recipe')
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
            What&apos;s in your kitchen?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the ingredients you have on hand, and we&apos;ll show you delicious recipes you can make right now.
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
