'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, BookOpen, User as UserIcon, Loader2 } from 'lucide-react'

interface Author {
  id: string
  name: string
  bio: string | null
  photoUrl: string | null
  birthDate: string | null
  nationality: string | null
  website: string | null
  bookCount: number
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const searchAuthors = async (query: string) => {
    if (!query.trim()) {
      setAuthors([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/authors/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setAuthors(data.authors || [])
    } catch (error) {
      console.error('Error searching authors:', error)
      setAuthors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchAuthors(searchQuery)
  }

  return (
    <div className="min-h-screen bg-library-pattern py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-2">
            Auteurs
          </h1>
          <p className="text-wood-700 text-lg">
            Recherchez des auteurs célèbres et découvrez leurs œuvres
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-wood-500" />
            <input
              type="text"
              placeholder="Rechercher un auteur (ex: Stephen King, J.K. Rowling, Victor Hugo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-3 paper-texture border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 text-wood-900 placeholder-wood-500"
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Recherche...</span>
                </>
              ) : (
                <span>Rechercher</span>
              )}
            </button>
          </div>
        </form>

        {/* Authors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="paper-texture rounded-lg p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-purple-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-purple-200 rounded mb-2"></div>
                    <div className="h-4 bg-purple-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-purple-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-wood-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wood-700 mb-2">
              Recherchez un auteur
            </h3>
            <p className="text-wood-600 mb-4">
              Entrez le nom d'un auteur pour découvrir sa biographie et ses œuvres
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['Stephen King', 'J.K. Rowling', 'Victor Hugo', 'Agatha Christie'].map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSearchQuery(name)
                    searchAuthors(name)
                  }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-16">
            <UserIcon className="h-16 w-16 text-wood-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wood-700 mb-2">
              Aucun auteur trouvé
            </h3>
            <p className="text-wood-600">
              Essayez un autre terme de recherche
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <Link
                key={author.id}
                href={`/authors/${author.id}`}
                className="paper-texture rounded-lg p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-300 group cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  {/* Author Photo */}
                  <div className="shrink-0">
                    {author.photoUrl ? (
                      <img
                        src={author.photoUrl}
                        alt={author.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-purple-200 group-hover:border-purple-400 transition"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-purple-200 group-hover:border-purple-400 transition">
                        <UserIcon className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Author Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-wood-900 mb-1 group-hover:text-purple-700 transition">
                      {author.name}
                    </h3>

                    {author.nationality && (
                      <p className="text-sm text-wood-600 mb-2">
                        {author.nationality}
                      </p>
                    )}

                    {author.bookCount > 0 && (
                      <div className="flex items-center text-sm text-wood-700 mb-2">
                        <BookOpen className="h-4 w-4 mr-1 text-purple-600" />
                        <span>{author.bookCount} {author.bookCount === 1 ? 'livre' : 'livres'}</span>
                      </div>
                    )}

                    {author.bio && (
                      <p className="text-sm text-wood-600 mt-2 line-clamp-3">
                        {author.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

