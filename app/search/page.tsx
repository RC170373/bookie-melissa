'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, BookOpen, User, Filter } from 'lucide-react'
import { debounce } from '@/lib/utils'

interface SearchResult {
  books: any[]
  authors: any[]
  total: number
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | 'books' | 'authors'>('all')
  const [results, setResults] = useState<SearchResult>({ books: [], authors: [], total: 0 })
  const [loading, setLoading] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchType: string) => {
      if (searchQuery.length < 2) {
        setResults({ books: [], authors: [], total: 0 })
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
          { credentials: 'include' }
        )
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    if (query) {
      setLoading(true)
      debouncedSearch(query, type)
    } else {
      setResults({ books: [], authors: [], total: 0 })
    }
  }, [query, type, debouncedSearch])

  return (
    <div className="min-h-screen bg-library-pattern py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-2">
            Recherche
          </h1>
          <p className="text-wood-700 text-lg">
            Trouvez des livres et des auteurs instantanément
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-wood-500" />
            <input
              type="text"
              placeholder="Rechercher des livres, auteurs, éditeurs, ISBN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 paper-texture border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 text-wood-900 placeholder-wood-500 text-lg"
              autoFocus
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center space-x-2 mb-8">
          <button
            type="button"
            onClick={() => setType('all')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              type === 'all'
                ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'paper-texture text-wood-800 hover:bg-purple-50 border-2 border-purple-200'
            }`}
          >
            Tout
          </button>
          <button
            type="button"
            onClick={() => setType('books')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              type === 'books'
                ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'paper-texture text-wood-800 hover:bg-purple-50 border-2 border-purple-200'
            }`}
          >
            Livres
          </button>
          <button
            type="button"
            onClick={() => setType('authors')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              type === 'authors'
                ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'paper-texture text-wood-800 hover:bg-purple-50 border-2 border-purple-200'
            }`}
          >
            Auteurs
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-700"></div>
            <p className="text-wood-600 mt-4">Recherche en cours...</p>
          </div>
        ) : query.length < 2 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-wood-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wood-700 mb-2">
              Commencez à taper pour rechercher
            </h3>
            <p className="text-wood-600">
              Recherchez des livres par titre, auteur, ISBN ou genre
            </p>
          </div>
        ) : results.total === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-wood-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wood-700 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-wood-600">
              Essayez d'autres mots-clés ou vérifiez l'orthographe
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Authors Results */}
            {results.authors && results.authors.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-wood-900 mb-4 flex items-center">
                  <User className="h-6 w-6 mr-3 text-purple-700" />
                  Auteurs ({results.authors.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.authors.map((author: any) => (
                    <Link
                      key={author.id}
                      href={`/authors/${author.id}`}
                      className="paper-texture rounded-lg p-4 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-300 flex items-center space-x-4"
                    >
                      {author.photoUrl ? (
                        <img
                          src={author.photoUrl}
                          alt={author.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <User className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-wood-900 truncate">{author.name}</h3>
                        <p className="text-sm text-wood-600">
                          {author._count.books} {author._count.books === 1 ? 'book' : 'books'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Books Results */}
            {results.books && results.books.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-wood-900 mb-4 flex items-center">
                  <BookOpen className="h-6 w-6 mr-3 text-pink-700" />
                  Livres ({results.books.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {results.books.map((book: any) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="group"
                    >
                      <div className="relative aspect-2/3 mb-3 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center p-4">
                            <BookOpen className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-wood-900 group-hover:text-purple-700 transition line-clamp-2 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-sm text-wood-600 truncate">{book.author}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

