'use client'

import { useMemo } from 'react'
import { Star } from 'lucide-react'

interface UserBook {
  id: string
  book: {
    title: string
  }
  status: string
  rating: number | null
}

interface RatingDistributionChartProps {
  books: UserBook[]
}

export default function RatingDistributionChart({ books }: RatingDistributionChartProps) {
  const ratingStats = useMemo(() => {
    const readBooks = books.filter(b => b.status === 'read' && b.rating !== null)
    
    // Group by rating ranges (0-5, 6-10, 11-15, 16-20)
    const ranges = [
      { label: '0-5', min: 0, max: 5, count: 0, color: 'bg-red-500' },
      { label: '6-10', min: 6, max: 10, count: 0, color: 'bg-orange-500' },
      { label: '11-15', min: 11, max: 15, count: 0, color: 'bg-yellow-500' },
      { label: '16-20', min: 16, max: 20, count: 0, color: 'bg-green-500' },
    ]
    
    readBooks.forEach(book => {
      const rating = book.rating || 0
      const range = ranges.find(r => rating >= r.min && rating <= r.max)
      if (range) range.count++
    })
    
    const maxCount = Math.max(...ranges.map(r => r.count), 1)
    const totalRated = readBooks.length
    const avgRating = totalRated > 0
      ? readBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / totalRated
      : 0
    
    return { ranges, maxCount, totalRated, avgRating }
  }, [books])

  const { ranges, maxCount, totalRated, avgRating } = ratingStats

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <p className="text-2xl font-bold text-wood-900">
              {avgRating.toFixed(1)}
            </p>
            <span className="text-sm text-wood-500">/20</span>
          </div>
          <p className="text-sm text-wood-600">Note moyenne</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{totalRated}</p>
          <p className="text-sm text-wood-600">Livres notés</p>
        </div>
      </div>

      {/* Distribution */}
      <div className="space-y-4">
        {ranges.map((range) => (
          <div key={range.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-wood-700">{range.label}</span>
              <span className="text-sm text-wood-600">
                {range.count} {range.count === 1 ? 'livre' : 'livres'}
                {totalRated > 0 && (
                  <span className="text-wood-400 ml-1">
                    ({Math.round((range.count / totalRated) * 100)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="h-8 bg-wood-100 rounded-full overflow-hidden">
              {range.count > 0 && (
                <div
                  className={`h-full ${range.color} transition-all duration-300 flex items-center justify-center`}
                  style={{ width: `${(range.count / maxCount) * 100}%` }}
                >
                  {range.count > 0 && (
                    <span className="text-xs font-medium text-white">
                      {range.count}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Best rated books */}
      {totalRated > 0 && (
        <div className="mt-6 pt-6 border-t border-wood-200">
          <h4 className="text-sm font-semibold text-wood-700 mb-3">
            📚 Meilleurs livres
          </h4>
          <div className="space-y-2">
            {books
              .filter(b => b.status === 'read' && b.rating !== null)
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 5)
              .map((book) => (
                <div key={book.id} className="flex items-center justify-between text-sm">
                  <span className="text-wood-700 truncate flex-1 mr-2">
                    {book.book.title}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-wood-900">{book.rating}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

