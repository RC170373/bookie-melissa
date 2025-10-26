'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Calendar, Star, Loader2, Library, Info } from 'lucide-react'

interface Book {
  id: string
  title: string
  subtitle: string | null
  publishedDate: string | null
  description: string | null
  pageCount: number | null
  coverUrl: string | null
  categories: string[]
  rating: number | null
  ratingsCount: number | null
  series: string | null
  seriesOrder: number | null
}

interface Series {
  name: string
  books: Book[]
}

interface Author {
  id: string
  name: string
  bio: string
  photoUrl: string | null
  birthDate: string | null
  nationality: string | null
  website: string | null
}

export default function AuthorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [totalBooks, setTotalBooks] = useState(0)
  const [enriching, setEnriching] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAuthorDetails()
    }
  }, [params.id])

  const fetchAuthorDetails = async () => {
    try {
      const response = await fetch(`/api/authors/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setAuthor(data.author)
        setBooks(data.books)
        setSeries(data.series || [])
        setTotalBooks(data.totalBooks)

        // Auto-enrich author info if missing
        if (!data.author.bio || !data.author.photoUrl || !data.author.nationality) {
          enrichAuthorInfo(data.author.name)
        }
      } else {
        console.error('Error fetching author:', data.error)
      }
    } catch (error) {
      console.error('Error fetching author details:', error)
    } finally {
      setLoading(false)
    }
  }

  const enrichAuthorInfo = async (authorName: string) => {
    setEnriching(true)
    try {
      const response = await fetch('/api/authors/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName }),
      })

      if (response.ok) {
        const data = await response.json()
        setAuthor(data.author)
      }
    } catch (error) {
      console.error('Error enriching author info:', error)
    } finally {
      setEnriching(false)
    }
  }

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-library-pattern flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-wood-700 text-lg">Chargement des informations de l'auteur...</p>
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-library-pattern flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-wood-900 mb-4">Auteur non trouvé</h2>
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-library-pattern py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-wood-700 hover:text-purple-700 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour à la recherche</span>
        </button>

        <div className="paper-texture rounded-lg p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="shrink-0">
              {author.photoUrl ? (
                <img
                  src={author.photoUrl}
                  alt={author.name}
                  className="w-48 h-48 rounded-lg object-cover border-4 border-purple-200 shadow-lg"
                />
              ) : (
                <div className="w-48 h-48 rounded-lg bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-purple-200 shadow-lg">
                  <BookOpen className="h-24 w-24 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-4">
                {author.name}
              </h1>
              
              <div className="space-y-3 mb-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-wood-700">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">{totalBooks} {totalBooks === 1 ? 'livre' : 'livres'}</span>
                  </div>
                  {series.length > 0 && (
                    <div className="flex items-center gap-2 text-wood-700">
                      <Library className="h-5 w-5 text-pink-600" />
                      <span className="font-semibold">{series.length} {series.length === 1 ? 'série' : 'séries'}</span>
                    </div>
                  )}
                  {author.nationality && (
                    <div className="flex items-center gap-2 text-wood-700">
                      <span className="text-2xl">🌍</span>
                      <span className="font-semibold">{author.nationality}</span>
                    </div>
                  )}
                  {author.birthDate && (
                    <div className="flex items-center gap-2 text-wood-700">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">
                        {new Date(author.birthDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {calculateAge(author.birthDate) && ` (${calculateAge(author.birthDate)} ans)`}
                      </span>
                    </div>
                  )}
                </div>

                {author.website && (
                  <div className="flex items-center gap-2">
                    <a
                      href={author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline text-sm"
                    >
                      🔗 Site officiel
                    </a>
                  </div>
                )}

                {enriching && (
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enrichissement des informations...</span>
                  </div>
                )}

                {totalBooks >= 40 && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-amber-800">
                      <p className="font-medium">Bibliographie limitée</p>
                      <p className="text-xs mt-1">
                        L'API Google Books gratuite limite les résultats. Pour voir la bibliographie complète,
                        configurez une clé API (voir <span className="font-mono">GOOGLE_BOOKS_API_SETUP.md</span>).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {author.bio && (
                <div className="prose max-w-none">
                  <p className="text-wood-700 leading-relaxed">{author.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {series.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-wood-900 mb-6 flex items-center gap-3">
              <Library className="h-8 w-8 text-pink-600" />
              Collections et Séries
            </h2>
            
            <div className="space-y-8">
              {series.map((s) => (
                <div key={s.name} className="paper-texture rounded-lg p-6 shadow-md">
                  <h3 className="text-2xl font-bold text-purple-700 mb-4">{s.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {s.books.map((book) => (
                      <Link
                        key={book.id}
                        href={`/books/${book.id}`}
                        className="group"
                      >
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
                          {book.seriesOrder && (
                            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                              #{book.seriesOrder}
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-wood-900 line-clamp-2 group-hover:text-purple-700 transition">
                          {book.title}
                        </h4>
                        {book.publishedDate && (
                          <p className="text-xs text-wood-600 mt-1">
                            {new Date(book.publishedDate).getFullYear()}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-3xl font-bold text-wood-900 mb-6 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-purple-600" />
            Bibliographie Complète
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="paper-texture rounded-lg p-4 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-300 group"
              >
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="relative w-24 h-36 rounded-lg overflow-hidden shadow-md">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-purple-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-wood-900 mb-1 group-hover:text-purple-700 transition line-clamp-2">
                      {book.title}
                    </h3>
                    
                    {book.subtitle && (
                      <p className="text-sm text-wood-600 mb-2 line-clamp-1">{book.subtitle}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-wood-600 mb-2">
                      {book.publishedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(book.publishedDate).getFullYear()}</span>
                        </div>
                      )}
                      {book.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{book.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {book.description && (
                      <p className="text-xs text-wood-600 line-clamp-2">{book.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
