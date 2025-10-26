'use client'

import { useState } from 'react'
import { Search, BookOpen, Plus, Loader2, Check } from 'lucide-react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  authors: string[]
  publishedDate: string | null
  description: string | null
  pageCount: number | null
  coverUrl: string | null
  isbn: string | null
}

export default function QuickAddPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [addingBookId, setAddingBookId] = useState<string | null>(null)
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set())

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setLoading(true)
    setSearched(true)
    setBooks([])

    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (response.ok) {
        setBooks(data.books || [])
      } else {
        console.error('Error searching books:', data.error)
        setBooks([])
      }
    } catch (error) {
      console.error('Error searching books:', error)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddBook = async (book: Book) => {
    setAddingBookId(book.id)

    try {
      // Add book directly to user's library
      // The API will create the book if it doesn't exist
      const userBookResponse = await fetch('/api/user-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bookId: book.id,
          title: book.title,
          author: book.authors.join(', '),
          coverUrl: book.coverUrl,
          status: 'to_read',
        }),
      })

      if (!userBookResponse.ok) {
        const errorData = await userBookResponse.json()
        throw new Error(errorData.error || 'Failed to add book to library')
      }

      // Mark as added
      setAddedBooks(prev => new Set(prev).add(book.id))
    } catch (error) {
      console.error('Error adding book:', error)
      alert('Erreur lors de l\'ajout du livre')
    } finally {
      setAddingBookId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Search className="h-8 w-8 text-purple-600" />
          Ajout Rapide de Livre
        </h1>
        <p className="text-gray-600">
          Recherchez un livre par son titre et ajoutez-le rapidement à votre bibliothèque
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
              placeholder="Entrez le titre du livre (ex: 1984, Harry Potter, Le Petit Prince...)"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              autoFocus
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
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Recherche en cours...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && searched && books.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun livre trouvé</h3>
          <p className="text-gray-600">
            Essayez avec un autre titre ou vérifiez l'orthographe
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && books.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {books.length} {books.length === 1 ? 'résultat trouvé' : 'résultats trouvés'}
          </h2>

          {books.map((book) => {
            const isAdded = addedBooks.has(book.id)
            const isAdding = addingBookId === book.id

            return (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 flex gap-4"
              >
                {/* Book Cover */}
                <div className="shrink-0">
                  <div className="w-24 h-36 rounded-lg overflow-hidden shadow-md">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-purple-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  {book.authors && book.authors.length > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      par {book.authors.join(', ')}
                    </p>
                  )}
                  {book.description && (
                    <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                      {book.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {book.publishedDate && (
                      <span>📅 {new Date(book.publishedDate).getFullYear()}</span>
                    )}
                    {book.pageCount && (
                      <span>📖 {book.pageCount} pages</span>
                    )}
                    {book.isbn && (
                      <span>🔢 ISBN: {book.isbn}</span>
                    )}
                  </div>
                </div>

                {/* Add Button */}
                <div className="shrink-0 flex items-center">
                  {isAdded ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <Link
                        href="/bibliomania"
                        className="text-xs text-green-600 hover:text-green-700 underline"
                      >
                        Voir dans ma bibliothèque
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddBook(book)}
                      disabled={isAdding}
                      className="flex flex-col items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdding ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Plus className="h-6 w-6" />
                      )}
                      <span className="text-xs font-medium">
                        {isAdding ? 'Ajout...' : 'Ajouter'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
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
                <strong>Tapez le titre</strong> du livre que vous souhaitez ajouter
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">📚</span>
              <span>
                <strong>Parcourez les résultats</strong> et trouvez le bon livre
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">➕</span>
              <span>
                <strong>Cliquez sur "Ajouter"</strong> pour l'ajouter à votre bibliothèque
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <span>
                <strong>C'est fait !</strong> Le livre est maintenant dans votre bibliothèque
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

