'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { BookOpen, Plus, Search, Filter, Download, Upload, Star, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import StarRating from '@/components/StarRating'

interface UserBook {
  id: string
  status: string
  rating: number | null
  book: {
    id: string
    title: string
    author: string
    coverUrl: string | null
    genres: string | null
  }
}

export default function BibliomaniaPage() {
  const [userBooks, setUserBooks] = useState<UserBook[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [user, setUser] = useState<any>(null)
  const [ratingModal, setRatingModal] = useState<{ show: boolean; userBook: UserBook | null }>({
    show: false,
    userBook: null,
  })
  const [tempRating, setTempRating] = useState<number>(0)
  const [addBookModal, setAddBookModal] = useState(false)
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    pages: '',
    language: 'fr',
    genres: '',
    description: '',
    coverUrl: '',
    status: 'to_read',
  })
  const [saving, setSaving] = useState(false)
  const [updatingMetadata, setUpdatingMetadata] = useState(false)
  const client = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { user } = await client.auth.getUser()
    setUser(user)
    if (user) {
      fetchUserBooks()
    } else {
      setLoading(false)
    }
  }

  const fetchUserBooks = async () => {
    try {
      const response = await fetch(`/api/user-books?status=${filter}`, {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch books')

      const { userBooks } = await response.json()
      setUserBooks(userBooks || [])
    } catch (error) {
      console.error('Error fetching user books:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserBooks()
    }
  }, [filter, user])

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      reading: 'En cours',
      read: 'Lu',
      to_read: 'À lire',
      wishlist: 'Liste de souhaits',
      pal: 'PAL',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      reading: 'bg-blue-100 text-blue-800',
      read: 'bg-green-100 text-green-800',
      to_read: 'bg-yellow-100 text-yellow-800',
      wishlist: 'bg-purple-100 text-purple-800',
      pal: 'bg-pink-100 text-pink-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const openRatingModal = (userBook: UserBook) => {
    setRatingModal({ show: true, userBook })
    setTempRating(userBook.rating || 0)
  }

  const closeRatingModal = () => {
    setRatingModal({ show: false, userBook: null })
    setTempRating(0)
  }

  const handleRatingSubmit = async () => {
    if (!ratingModal.userBook) return

    try {
      const response = await fetch(`/api/user-books/${ratingModal.userBook.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rating: tempRating }),
      })

      if (!response.ok) throw new Error('Failed to update rating')

      // Update local state
      setUserBooks(prev =>
        prev.map(ub =>
          ub.id === ratingModal.userBook!.id ? { ...ub, rating: tempRating } : ub
        )
      )

      closeRatingModal()
    } catch (error) {
      console.error('Error updating rating:', error)
    }
  }

  const deleteBook = async (userBookId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre de votre bibliothèque ?')) {
      return
    }

    try {
      const response = await fetch(`/api/user-books?id=${userBookId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete book')

      // Update local state
      setUserBooks(userBooks.filter(ub => ub.id !== userBookId))
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Erreur lors de la suppression du livre')
    }
  }

  const handleAddManualBook = async () => {
    if (!newBook.title || !newBook.author) {
      alert('Le titre et l\'auteur sont obligatoires')
      return
    }

    setSaving(true)
    try {
      // First, create the book
      const bookResponse = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newBook.title,
          author: newBook.author,
          isbn: newBook.isbn || null,
          publisher: newBook.publisher || null,
          publicationYear: newBook.publicationYear ? parseInt(newBook.publicationYear) : null,
          pages: newBook.pages ? parseInt(newBook.pages) : null,
          language: newBook.language || 'fr',
          genres: newBook.genres || null,
          description: newBook.description || null,
          coverUrl: newBook.coverUrl || null,
        }),
      })

      if (!bookResponse.ok) {
        throw new Error('Erreur lors de la création du livre')
      }

      const { book } = await bookResponse.json()

      // Then, add it to user's library
      const userBookResponse = await fetch('/api/user-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bookId: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          status: newBook.status,
        }),
      })

      if (!userBookResponse.ok) {
        throw new Error('Erreur lors de l\'ajout à la bibliothèque')
      }

      // Reset form and close modal
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publicationYear: '',
        pages: '',
        language: 'fr',
        genres: '',
        description: '',
        coverUrl: '',
        status: 'to_read',
      })
      setAddBookModal(false)

      // Refresh the library
      fetchUserBooks()
    } catch (error) {
      console.error('Error adding manual book:', error)
      alert('Erreur lors de l\'ajout du livre')
    } finally {
      setSaving(false)
    }
  }

  const updateBooksMetadata = async () => {
    if (!confirm('Voulez-vous mettre à jour les couvertures et métadonnées des livres importés depuis Google Books? Cela peut prendre quelques minutes.')) {
      return
    }

    setUpdatingMetadata(true)
    try {
      const response = await fetch('/api/books/update-metadata', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      const result = await response.json()
      alert(`Mise à jour terminée!\n${result.updated} livres mis à jour\n${result.failed} échecs\n${result.remaining} livres restants`)

      // Refresh the library
      fetchUserBooks()
    } catch (error) {
      console.error('Error updating metadata:', error)
      alert('Erreur lors de la mise à jour des métadonnées')
    } finally {
      setUpdatingMetadata(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connectez-vous pour accéder à votre bibliothèque
          </h2>
          <p className="text-gray-600 mb-6">
            Créez votre bibliothèque virtuelle et gérez tous vos livres en un seul endroit
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/login"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ma Bibliothèque</h1>
            <p className="text-gray-600">
              Gérez votre collection de livres et suivez vos lectures
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAddBookModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Ajouter manuellement</span>
            </button>
            <button
              type="button"
              onClick={updateBooksMetadata}
              disabled={updatingMetadata}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mettre à jour les couvertures et métadonnées depuis Google Books"
            >
              <Upload className="h-5 w-5" />
              <span>{updatingMetadata ? 'Mise à jour...' : 'Mettre à jour métadonnées'}</span>
            </button>
            <Link
              href="/import-export"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Import/Export</span>
            </Link>

          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tous
          </button>
          <button
            type="button"
            onClick={() => setFilter('reading')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'reading'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            En cours
          </button>
          <button
            type="button"
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'read'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Lu
          </button>
          <button
            type="button"
            onClick={() => setFilter('to_read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'to_read'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            À lire
          </button>
          <button
            type="button"
            onClick={() => setFilter('wishlist')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'wishlist'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Liste de souhaits
          </button>
          <button
            type="button"
            onClick={() => setFilter('pal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'pal'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            PAL
          </button>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-2/3 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : userBooks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun livre dans cette catégorie
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez à construire votre bibliothèque en ajoutant des livres
          </p>
          <p className="text-sm text-gray-500">
            Recherchez des livres via la page Auteurs ou utilisez la recherche globale
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {userBooks.map((userBook) => (
            <div key={userBook.id} className="group relative animate-fadeIn">
              <Link
                href={`/books/${userBook.book.id}`}
                className="block"
              >
                <div className="relative aspect-2/3 mb-3 rounded-lg overflow-hidden shadow-lg hover-lift card-interactive">
                  {userBook.book.coverUrl ? (
                    <img
                      src={userBook.book.coverUrl}
                      alt={userBook.book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white animate-float" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`glass px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(userBook.status)} backdrop-blur-md`}>
                      {getStatusLabel(userBook.status)}
                    </span>
                  </div>
                  {userBook.rating && (
                    <div className="absolute bottom-2 left-2 glass px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 bg-black/60 text-white">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{userBook.rating}/20</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-wood-900 line-clamp-2 mb-1">
                  {userBook.book.title}
                </h3>
                <p className="text-xs text-wood-600 line-clamp-1">
                  {userBook.book.author}
                </p>
              </Link>

              {/* Action Buttons */}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    openRatingModal(userBook)
                  }}
                  className="flex-1 px-3 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-1"
                >
                  <Star className="h-3 w-3" />
                  <span>{userBook.rating ? 'Modifier' : 'Noter'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => deleteBook(userBook.id, e)}
                  className="px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center"
                  title="Supprimer de la bibliothèque"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal.show && ratingModal.userBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="glass-purple rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                Noter ce livre
              </h2>
              <button
                type="button"
                onClick={closeRatingModal}
                className="text-wood-500 hover:text-wood-700 transition-all hover:scale-110 p-1 rounded-lg hover:bg-wood-100"
                aria-label="Fermer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-start space-x-4 mb-6">
                {ratingModal.userBook.book.coverUrl ? (
                  <img
                    src={ratingModal.userBook.book.coverUrl}
                    alt={ratingModal.userBook.book.title}
                    className="w-20 h-28 object-cover rounded shadow-md"
                  />
                ) : (
                  <div className="w-20 h-28 bg-linear-to-br from-purple-400 to-pink-400 rounded shadow-md flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-wood-900 mb-1">
                    {ratingModal.userBook.book.title}
                  </h3>
                  <p className="text-sm text-wood-600">
                    {ratingModal.userBook.book.author}
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                <label className="block text-sm font-medium text-wood-800 mb-4">
                  Votre note
                </label>
                <div className="flex justify-center mb-4">
                  <StarRating
                    rating={tempRating}
                    onChange={setTempRating}
                    size="lg"
                    showValue
                  />
                </div>
                <p className="text-xs text-center text-wood-600">
                  Cliquez sur les étoiles pour noter (chaque étoile = 4 points)
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={closeRatingModal}
                className="flex-1 px-4 py-3 border-2 border-purple-300 text-wood-700 rounded-lg hover:bg-purple-50 transition-all hover:scale-105 font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleRatingSubmit}
                className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Book Modal */}
      {addBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Ajouter un livre manuellement</h2>
              <button
                type="button"
                onClick={() => setAddBookModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                title="Fermer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-wood-800 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  placeholder="Le titre du livre"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-wood-800 mb-2">
                  Auteur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  placeholder="Nom de l'auteur"
                  required
                />
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-sm font-medium text-wood-800 mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  placeholder="978-2-1234-5678-9"
                />
              </div>

              {/* Publisher and Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wood-800 mb-2">
                    Éditeur
                  </label>
                  <input
                    type="text"
                    value={newBook.publisher}
                    onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    placeholder="Nom de l'éditeur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-wood-800 mb-2">
                    Année de publication
                  </label>
                  <input
                    type="number"
                    value={newBook.publicationYear}
                    onChange={(e) => setNewBook({ ...newBook, publicationYear: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    placeholder="2024"
                    min="1000"
                    max="2100"
                  />
                </div>
              </div>

              {/* Pages and Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wood-800 mb-2">
                    Nombre de pages
                  </label>
                  <input
                    type="number"
                    value={newBook.pages}
                    onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    placeholder="350"
                    min="1"
                  />
                </div>
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-wood-800 mb-2">
                    Langue
                  </label>
                  <select
                    id="language"
                    value={newBook.language}
                    onChange={(e) => setNewBook({ ...newBook, language: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  >
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                    <option value="de">Allemand</option>
                    <option value="it">Italien</option>
                    <option value="pt">Portugais</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="block text-sm font-medium text-wood-800 mb-2">
                  Genres
                </label>
                <input
                  type="text"
                  value={newBook.genres}
                  onChange={(e) => setNewBook({ ...newBook, genres: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  placeholder="Fiction, Thriller, Science-fiction..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-wood-800 mb-2">
                  Description
                </label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  placeholder="Résumé du livre..."
                  rows={4}
                />
              </div>

              {/* Cover URL */}
              <div>
                <label className="block text-sm font-medium text-wood-800 mb-2">
                  URL de la couverture
                </label>
                <input
                  type="url"
                  value={newBook.coverUrl}
                  onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="book-status" className="block text-sm font-medium text-wood-800 mb-2">
                  Statut dans ma bibliothèque
                </label>
                <select
                  id="book-status"
                  value={newBook.status}
                  onChange={(e) => setNewBook({ ...newBook, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-wood-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                >
                  <option value="to_read">À lire</option>
                  <option value="reading">En cours</option>
                  <option value="read">Lu</option>
                  <option value="wishlist">Liste de souhaits</option>
                  <option value="pal">PAL</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAddBookModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-purple-300 text-wood-700 rounded-lg hover:bg-purple-50 transition-all font-medium"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAddManualBook}
                  disabled={saving || !newBook.title || !newBook.author}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Ajout en cours...' : 'Ajouter le livre'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

