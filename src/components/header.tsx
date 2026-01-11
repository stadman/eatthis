import Link from 'next/link'
import { UtensilsCrossed } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            Eat<span className="text-orange-500">This</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
