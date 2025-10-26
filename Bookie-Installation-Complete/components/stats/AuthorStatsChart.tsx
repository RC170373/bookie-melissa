'use client'

import { useMemo } from 'react'
import { User } from 'lucide-react'

interface UserBook {
  id: string
  book: {
    author: string
  }
  status: string
}

interface AuthorStatsChartProps {
  books: UserBook[]
}

export default function AuthorStatsChart({ books }: AuthorStatsChartProps) {
  const authorStats = useMemo(() => {
    const readBooks = books.filter(b => b.status === 'read')
    
    // Count books per author
    const authorCounts: { [key: string]: number } = {}
    
    readBooks.forEach(book => {
      const author = book.book.author || 'Auteur inconnu'
      authorCounts[author] = (authorCounts[author] || 0) + 1
    })
    
    // Sort by count and get top 10
    const sortedAuthors = Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([author, count]) => ({ author, count }))
    
    const maxCount = sortedAuthors[0]?.count || 1
    
    return { sortedAuthors, maxCount }
  }, [books])

  const { sortedAuthors, maxCount } = authorStats

  if (sortedAuthors.length === 0) {
    return (
      <div className="text-center py-8 text-wood-500">
        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Aucun auteur pour le moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedAuthors.map((item, index) => (
        <div key={item.author} className="flex items-center space-x-3">
          {/* Rank */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            index === 0 ? 'bg-yellow-100 text-yellow-700' :
            index === 1 ? 'bg-gray-100 text-gray-700' :
            index === 2 ? 'bg-orange-100 text-orange-700' :
            'bg-wood-100 text-wood-600'
          }`}>
            {index + 1}
          </div>
          
          {/* Author name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-wood-900 truncate">
              {item.author}
            </p>
          </div>
          
          {/* Bar */}
          <div className="w-32 h-6 bg-wood-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          
          {/* Count */}
          <div className="w-12 text-right">
            <span className="text-sm font-bold text-wood-900">{item.count}</span>
            <span className="text-xs text-wood-500 ml-1">
              {item.count === 1 ? 'livre' : 'livres'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

