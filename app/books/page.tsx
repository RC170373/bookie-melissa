'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, BookOpen, Plus } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  coverUrl?: string
  description?: string
  genres?: string[]
  publishedDate?: string
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = books.filter(
        book =>
          book.title.toLowerCase().includes(search.toLowerCase()) ||
          book.author.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredBooks(filtered)
    } else {
      setFilteredBooks(books)
    }
  }, [search, books])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books?limit=100')
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
        setFilteredBooks(data.books || [])
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-library-pattern py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-2">
              Catalogue de livres
            </h1>
            <p className="text-wood-700 text-lg">
              Découvrez et explorez notre collection
            </p>
          </div>
          <Link
            href="/quick-add"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md font-medium flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un livre
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-wood-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-wood-200 rounded-lg focus:outline-none focus:border-purple-400 transition"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-wood-600">Chargement des livres...</p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group paper-texture rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                {/* Cover */}
                <div className="aspect-[2/3] bg-gradient-to-br from-wood-100 to-wood-200 relative overflow-hidden">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-wood-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-wood-900 line-clamp-2 mb-1 group-hover:text-purple-700 transition">
                    {book.title}
                  </h3>
                  <p className="text-sm text-wood-600 line-clamp-1">
                    {book.author}
                  </p>
                  {book.genres && book.genres.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {book.genres.slice(0, 2).map((genre, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-wood-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wood-700 mb-2">
              Aucun livre trouvé
            </h3>
            <p className="text-wood-600 mb-6">
              {search
                ? 'Essayez une autre recherche'
                : 'Commencez par ajouter des livres à votre bibliothèque'}
            </p>
            <Link
              href="/quick-add"
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un livre
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

