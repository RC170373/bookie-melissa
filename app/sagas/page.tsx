'use client'

import { useState } from 'react'
import { Search, BookOpen, Library, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  subtitle: string | null
  publishedDate: string | null
  description: string | null
  pageCount: number | null
  coverUrl: string | null
  seriesOrder: number | null
}

interface Series {
  name: string
  books: Book[]
}

export default function SagasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/sagas/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (response.ok) {
        setSeries(data.series || [])
      } else {
        console.error('Error searching sagas:', data.error)
        setSeries([])
      }
    } catch (error) {
      console.error('Error searching sagas:', error)
      setSeries([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Library className="h-8 w-8 text-purple-600" />
          Sagas et Collections
        </h1>
        <p className="text-gray-600">
          Recherchez des séries de livres et découvrez-les dans l'ordre chronologique
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une saga (ex: Harry Potter, Le Seigneur des Anneaux, Hunger Games...)"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Rechercher'
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <p className="text-sm text-gray-600 w-full mb-2">Suggestions populaires :</p>
          {['Harry Potter', 'Le Seigneur des Anneaux', 'Hunger Games', 'Twilight', 'Game of Thrones'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setSearchQuery(suggestion)
                handleSearch({ preventDefault: () => {} } as React.FormEvent)
              }}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition"
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Recherche en cours...</p>
        </div>
      )}

      {/* Results */}
      {!loading && searched && series.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Library className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune saga trouvée</h3>
          <p className="text-gray-600">
            Essayez avec un autre terme de recherche
          </p>
        </div>
      )}

      {!loading && series.length > 0 && (
        <div className="space-y-8">
          {series.map((saga, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Library className="h-6 w-6 text-purple-600" />
                  {saga.name}
                </h2>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold">
                  {saga.books.length} {saga.books.length === 1 ? 'livre' : 'livres'}
                </span>
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {saga.books.map((book, bookIndex) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="group"
                  >
                    <div className="relative">
                      {/* Order Badge */}
                      <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-linear-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                        {book.seriesOrder || bookIndex + 1}
                      </div>

                      {/* Book Cover */}
                      <div className="relative aspect-2/3 mb-2 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-purple-400" />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-purple-600 transition">
                          {book.title}
                        </h3>
                        {book.publishedDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(book.publishedDate).getFullYear()}
                          </p>
                        )}
                        {book.pageCount && (
                          <p className="text-xs text-gray-500">
                            {book.pageCount} pages
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Reading Order Info */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">Ordre de lecture</h4>
                    <p className="text-sm text-purple-700">
                      Les livres sont affichés dans l'ordre chronologique de publication.
                      Le numéro sur chaque couverture indique l'ordre de lecture recommandé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      {!searched && (
        <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-lg p-8 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Comment ça marche ?</h3>
          <div className="space-y-3 text-gray-700">
            <p className="flex items-start gap-3">
              <span className="text-2xl">🔍</span>
              <span>
                <strong>Recherchez</strong> le nom d'une saga ou série de livres que vous souhaitez découvrir
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">📚</span>
              <span>
                <strong>Découvrez</strong> tous les livres de la série dans l'ordre chronologique
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">📖</span>
              <span>
                <strong>Lisez</strong> dans le bon ordre grâce aux numéros affichés sur chaque livre
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <span>
                <strong>Ajoutez</strong> les livres à votre bibliothèque en cliquant dessus
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

