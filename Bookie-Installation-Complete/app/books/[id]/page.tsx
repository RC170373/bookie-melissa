'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookOpen, Star, Calendar, ArrowLeft, Save, Plus, Trash2, Quote, MessageSquare, Clock } from 'lucide-react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  coverUrl?: string
  description?: string
  publishedDate?: string
  pageCount?: number
  categories?: string[]
  rating?: number
}

interface UserBook {
  id: string
  status: string
  rating: number | null
  notes: string | null
  review: string | null
  favoriteQuotes: string | null
  dateRead: string | null
  plannedReadDate: string | null
}

export default function BookCardPage() {
  const params = useParams()
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [userBook, setUserBook] = useState<UserBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [status, setStatus] = useState('to_read')
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [review, setReview] = useState('')
  const [quotes, setQuotes] = useState<string[]>([])
  const [newQuote, setNewQuote] = useState('')
  const [dateRead, setDateRead] = useState('')
  const [plannedReadDate, setPlannedReadDate] = useState('')

  useEffect(() => {
    fetchBookData()
  }, [params.id])

  const fetchBookData = async () => {
    try {
      // First, try to fetch from our local database
      const localBookResponse = await fetch(`/api/books/${params.id}`, {
        credentials: 'include',
      })

      if (localBookResponse.ok) {
        const localBookData = await localBookResponse.json()
        const localBook = localBookData.book

        setBook({
          id: localBook.id,
          title: localBook.title,
          author: localBook.author,
          coverUrl: localBook.coverUrl,
          description: localBook.description,
          publishedDate: localBook.publicationYear ? `${localBook.publicationYear}-01-01` : undefined,
          pageCount: localBook.pages,
          categories: localBook.genres ? localBook.genres.split(',').map((g: string) => g.trim()) : undefined,
          rating: undefined, // Local books don't have Google ratings
        })
      } else {
        // Fallback to Google Books API for books added via search
        const bookResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${params.id}`)
        if (bookResponse.ok) {
          const bookData = await bookResponse.json()
          const volumeInfo = bookData.volumeInfo

          setBook({
            id: bookData.id,
            title: volumeInfo.title,
            author: volumeInfo.authors?.[0] || 'Auteur inconnu',
            coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
            description: volumeInfo.description,
            publishedDate: volumeInfo.publishedDate,
            pageCount: volumeInfo.pageCount,
            categories: volumeInfo.categories,
            rating: volumeInfo.averageRating,
          })
        }
      }

      const userBookResponse = await fetch(`/api/user-books/${params.id}`, {
        credentials: 'include',
      })

      if (userBookResponse.ok) {
        const data = await userBookResponse.json()
        if (data.userBook) {
          setUserBook(data.userBook)
          setStatus(data.userBook.status || 'to_read')
          setRating(data.userBook.rating || 0)
          setNotes(data.userBook.notes || '')
          setReview(data.userBook.review || '')
          setQuotes(data.userBook.favoriteQuotes ? JSON.parse(data.userBook.favoriteQuotes) : [])
          setDateRead(data.userBook.dateRead ? new Date(data.userBook.dateRead).toISOString().split('T')[0] : '')
          setPlannedReadDate(data.userBook.plannedReadDate ? new Date(data.userBook.plannedReadDate).toISOString().split('T')[0] : '')
        }
      }
    } catch (error) {
      console.error('Error fetching book data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!book) return

    setSaving(true)
    try {
      const payload = {
        bookId: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        status,
        rating: rating > 0 ? rating : null,
        notes: notes.trim() || null,
        review: review.trim() || null,
        favoriteQuotes: quotes.length > 0 ? JSON.stringify(quotes) : null,
        dateRead: dateRead || null,
        plannedReadDate: plannedReadDate || null,
      }

      const response = await fetch('/api/user-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save')

      alert('✅ Livre sauvegardé avec succès !')
      fetchBookData()
    } catch (error) {
      console.error('Error saving book:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addQuote = () => {
    if (newQuote.trim()) {
      setQuotes([...quotes, newQuote.trim()])
      setNewQuote('')
    }
  }

  const removeQuote = (index: number) => {
    setQuotes(quotes.filter((_, i) => i !== index))
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-wood-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-wood-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-wood-900 mb-2">Livre non trouvé</h2>
          <Link href="/bibliomania" className="text-purple-600 hover:underline">
            Retour à la bibliothèque
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-wood-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-wood-700 hover:text-purple-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="paper-texture rounded-2xl p-6 shadow-xl sticky top-24">
              <div className="aspect-2/3 mb-6 rounded-lg overflow-hidden shadow-lg">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <BookOpen className="h-24 w-24 text-white" />
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-wood-900 mb-2">{book.title}</h1>
              <p className="text-lg text-wood-700 mb-4">{book.author}</p>

              {book.publishedDate && (
                <div className="flex items-center text-sm text-wood-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(book.publishedDate).getFullYear()}</span>
                </div>
              )}

              {book.pageCount && (
                <div className="flex items-center text-sm text-wood-600 mb-2">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>{book.pageCount} pages</span>
                </div>
              )}

              {book.rating && (
                <div className="flex items-center text-sm text-wood-600 mb-4">
                  <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                  <span>{book.rating}/5 (Google Books)</span>
                </div>
              )}

              {book.categories && book.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {book.categories.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {book.description && (
                <div className="mt-6 pt-6 border-t border-wood-200">
                  <h3 className="font-bold text-wood-900 mb-2">Description</h3>
                  <p className="text-sm text-wood-700 line-clamp-6">{book.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="paper-texture rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-3 text-purple-600" />
                Statut de lecture
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="book-status" className="block text-sm font-medium text-wood-700 mb-2">Statut</label>
                  <select id="book-status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition">
                    <option value="to_read">À lire</option>
                    <option value="reading">En cours</option>
                    <option value="read">Lu</option>
                    <option value="wishlist">Liste de souhaits</option>
                    <option value="pal">PAL</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="date-read" className="flex items-center text-sm font-medium text-wood-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date de lecture
                  </label>
                  <input id="date-read" type="date" value={dateRead} onChange={(e) => setDateRead(e.target.value)} className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition" />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="planned-read-date" className="flex items-center text-sm font-medium text-wood-700 mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    Lecture planifiée pour
                  </label>
                  <input id="planned-read-date" type="date" value={plannedReadDate} onChange={(e) => setPlannedReadDate(e.target.value)} className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition" />
                </div>
              </div>
            </div>

            <div className="paper-texture rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <Star className="h-6 w-6 mr-3 text-purple-600" />
                Ma notation
              </h2>

              <div className="flex flex-wrap gap-2">
                {[...Array(20)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className={`w-10 h-10 rounded-lg font-bold transition ${
                      i < rating
                        ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-wood-100 text-wood-400 hover:bg-wood-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <p className="text-sm text-wood-600 mt-4">Note actuelle : {rating > 0 ? `${rating}/20` : 'Non noté'}</p>
            </div>

            <div className="paper-texture rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <MessageSquare className="h-6 w-6 mr-3 text-purple-600" />
                Notes personnelles
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez vos notes personnelles sur ce livre..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
              />
            </div>

            <div className="paper-texture rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <MessageSquare className="h-6 w-6 mr-3 text-purple-600" />
                Ma critique
              </h2>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Écrivez votre critique complète du livre..."
                rows={8}
                className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
              />
            </div>

            <div className="paper-texture rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <Quote className="h-6 w-6 mr-3 text-purple-600" />
                Citations préférées
              </h2>

              <div className="space-y-4 mb-6">
                {quotes.map((quote, index) => (
                  <div key={index} className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg relative group">
                    <p className="text-wood-800 italic pr-8">&ldquo;{quote}&rdquo;</p>
                    <button
                      type="button"
                      onClick={() => removeQuote(index)}
                      className="absolute top-4 right-4 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition"
                      title="Supprimer cette citation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addQuote()}
                  placeholder="Ajoutez une citation..."
                  className="flex-1 px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                />
                <button
                  type="button"
                  onClick={addQuote}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

