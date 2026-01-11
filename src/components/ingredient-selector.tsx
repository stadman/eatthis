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
