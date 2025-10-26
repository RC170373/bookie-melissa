'use client'

import { useEffect, useState } from 'react'
import { Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  coverUrl: string | null
  genres: string | null
}

export function FeaturedBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedBooks()
  }, [])

  const fetchFeaturedBooks = async () => {
    try {
      const response = await fetch('/api/books?limit=5', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch books')

      const { books } = await response.json()
      setBooks(books || [])
    } catch (error) {
      console.error('Error fetching featured books:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
          Livres populaires
        </h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-12 h-16 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
        Livres populaires
      </h3>
      
      {books.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Aucun livre pour le moment
        </p>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex space-x-3 hover:bg-gray-50 p-2 rounded transition"
            >
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded shadow-sm"
                />
              ) : (
                <div className="w-12 h-16 bg-linear-to-br from-indigo-400 to-purple-400 rounded shadow-sm flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {book.title}
                </h4>
                <p className="text-xs text-gray-600 truncate">{book.author}</p>
                {book.genre && book.genre.length > 0 && (
                  <p className="text-xs text-indigo-600 mt-1">
                    {book.genre[0]}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/bibliomania"
        className="block mt-4 text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Voir ma bibliothèque →
      </Link>
    </div>
  )
}

