'use client'

import { useState } from 'react'
import { Download, Upload, AlertCircle, CheckCircle, Loader, FileJson, FileSpreadsheet, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { exportLibraryToExcel, getLibraryStats } from '@/lib/excel/export'
import { parseExcelFile, validateImportData } from '@/lib/excel/import'

export default function ImportExportPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [importProgress, setImportProgress] = useState<string>('')
  const [stats, setStats] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

  const client = createClient()

  const handleExport = async () => {
    try {
      setLoading(true)
      setMessage(null)

      // Get current user
      const { user } = await client.auth.getUser()
      if (!user) {
        setMessage({ type: 'error', text: 'Vous devez être connecté pour exporter' })
        return
      }

      // Get user's books
      const response = await fetch('/api/user-books', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch books')

      const { userBooks } = await response.json()

      if (!userBooks || userBooks.length === 0) {
        setMessage({ type: 'error', text: 'Aucun livre à exporter' })
        return
      }

      // Export to Excel
      exportLibraryToExcel(userBooks, user.username || 'library')

      // Get stats
      const libraryStats = getLibraryStats(userBooks)
      setStats(libraryStats)

      setMessage({
        type: 'success',
        text: `${userBooks.length} livres exportés avec succès vers Excel !`,
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)
      setMessage(null)
      setImportProgress('Analyse du fichier...')

      const file = event.target.files?.[0]
      if (!file) return

      // Get current user
      const { user } = await client.auth.getUser()
      if (!user) {
        setMessage({ type: 'error', text: 'Vous devez être connecté pour importer' })
        return
      }

      // Parse Excel file
      const result = await parseExcelFile(file)

      if (!result.success && result.errors.length > 0) {
        const errorText = result.errors.map((e) => `Row ${e.row}: ${e.message}`).join('\n')
        setMessage({ type: 'error', text: `Import validation failed:\n${errorText}` })
        return
      }

      // Validate data
      const validation = validateImportData(result.books)
      if (!validation.valid) {
        setMessage({ type: 'error', text: `Validation failed:\n${validation.errors.join('\n')}` })
        return
      }

      setImportProgress(`Processing ${result.books.length} books...`)

      // Import books
      let imported = 0
      let skipped = 0

      for (const book of result.books) {
        try {
          // Create book via API
          const bookResponse = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: book.title,
              author: book.author,
              isbn: book.isbn,
              publisher: book.publisher,
              publicationYear: book.publication_year,
              pages: book.pages,
              language: book.language || 'fr',
              genres: book.genres,
            }),
            credentials: 'include',
          })

          if (!bookResponse.ok) {
            skipped++
            continue
          }

          const { book: newBook } = await bookResponse.json()

          // Add to user's library
          const userBookResponse = await fetch('/api/user-books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookId: newBook.id,
              status: book.status,
              rating: book.rating,
              notes: book.notes,
            }),
            credentials: 'include',
          })

          if (!userBookResponse.ok) {
            skipped++
          } else {
            imported++
          }

          setImportProgress(`Traitement de ${result.books.length} livres... (${imported + skipped}/${result.books.length})`)
        } catch (error) {
          console.error(`Failed to import book: ${book.title}`, error)
          skipped++
        }
      }

      setMessage({
        type: 'success',
        text: `Import terminé ! ${imported} livres importés, ${skipped} ignorés.`,
      })
      setImportProgress('')

      // Reset file input
      event.target.value = ''
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Échec de l'import : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      })
      setImportProgress('')
    } finally {
      setLoading(false)
    }
  }

  const handleGoodreadsImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)
      setMessage(null)
      setImportProgress('Analyse du fichier Goodreads...')

      const file = event.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/goodreads', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de l\'import' })
        return
      }

      setMessage({
        type: 'success',
        text: `Import Goodreads terminé ! ${result.imported} livres importés, ${result.skipped} ignorés sur ${result.total} total.`,
      })
      setImportProgress('')

      // Reset file input
      event.target.value = ''
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Échec de l'import Goodreads : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      })
      setImportProgress('')
    } finally {
      setLoading(false)
    }
  }

  const handleLivraddictImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)
      setMessage(null)
      setImportProgress('Analyse du fichier Livraddict...')

      const file = event.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/livraddict', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de l\'import' })
        return
      }

      setMessage({
        type: 'success',
        text: `Import Livraddict terminé ! ${result.imported} livres importés, ${result.skipped} ignorés sur ${result.total} total.`,
      })
      setImportProgress('')

      // Reset file input
      event.target.value = ''
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Échec de l'import Livraddict : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      })
      setImportProgress('')
    } finally {
      setLoading(false)
    }
  }

  const handleExportGoodreads = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const response = await fetch('/api/export/goodreads', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `goodreads_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({
        type: 'success',
        text: 'Export Goodreads CSV réussi !',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Échec de l'export : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportJSON = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const response = await fetch('/api/export/json', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookie_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({
        type: 'success',
        text: 'Sauvegarde JSON créée avec succès !',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Échec de la sauvegarde : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('⚠️ ATTENTION: Voulez-vous vraiment supprimer TOUS vos livres? Cette action est irréversible!')) {
      return
    }

    if (!confirm('Êtes-vous ABSOLUMENT SÛR? Tous vos livres, notes et évaluations seront supprimés!')) {
      return
    }

    try {
      setDeleting(true)
      setMessage(null)

      const response = await fetch('/api/books/delete-all', {
        method: 'POST',
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de la suppression' })
        return
      }

      setMessage({
        type: 'success',
        text: result.message || `${result.deletedUserBooks} livres supprimés`,
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Échec de la suppression : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-4">Importer / Exporter la bibliothèque</h1>
        <p className="text-xl text-wood-700">
          Gérez votre bibliothèque Bookie en important et exportant vos livres au format Excel
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p
              className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              } whitespace-pre-wrap`}
            >
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {importProgress && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center space-x-3">
          <Loader className="h-5 w-5 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-blue-800">{importProgress}</p>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-wood-600">Total de livres</p>
            <p className="text-2xl font-bold text-wood-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-wood-600">En cours</p>
            <p className="text-2xl font-bold text-blue-600">{stats.reading}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-wood-600">Lus</p>
            <p className="text-2xl font-bold text-green-600">{stats.read}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-wood-600">À lire</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.to_read}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-wood-600">Liste de souhaits</p>
            <p className="text-2xl font-bold text-purple-600">{stats.wishlist}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-wood-600">Note moyenne</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.average_rating}/20</p>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Download className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Exporter votre bibliothèque</h2>
        </div>
        <p className="text-wood-700 mb-6">
          Téléchargez toute votre bibliothèque dans différents formats
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={handleExport}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Export...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-5 w-5" />
                <span>Excel (.xlsx)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportGoodreads}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Export...</span>
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                <span>Goodreads CSV</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Export...</span>
              </>
            ) : (
              <>
                <FileJson className="h-5 w-5" />
                <span>Sauvegarde JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Upload className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Importer votre bibliothèque</h2>
        </div>
        <p className="text-wood-700 mb-6">
          Importez des livres depuis différents formats
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              disabled={loading}
              className="hidden"
            />
            <span className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full cursor-pointer">
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Import...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Importer Excel</span>
                </>
              )}
            </span>
          </label>

          <label className="block">
            <input
              type="file"
              accept=".csv"
              onChange={handleGoodreadsImport}
              disabled={loading}
              className="hidden"
            />
            <span className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full cursor-pointer">
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Import...</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5" />
                  <span>Importer Goodreads CSV</span>
                </>
              )}
            </span>
          </label>

          <label className="block">
            <input
              type="file"
              accept=".csv"
              onChange={handleLivraddictImport}
              disabled={loading}
              className="hidden"
            />
            <span className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full cursor-pointer">
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Import...</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5" />
                  <span>Importer Livraddict CSV</span>
                </>
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Format Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-8">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Format Excel</h3>
        <p className="text-blue-800 mb-4">
          Le fichier Excel doit contenir les colonnes suivantes :
        </p>
        <ul className="list-disc list-inside text-blue-800 space-y-2 mb-4">
          <li>
            <strong>title</strong> (requis) - Titre du livre
          </li>
          <li>
            <strong>author</strong> (requis) - Auteur du livre
          </li>
          <li>
            <strong>isbn</strong> (optionnel) - Numéro ISBN
          </li>
          <li>
            <strong>publisher</strong> (optionnel) - Nom de l'éditeur
          </li>
          <li>
            <strong>publication_year</strong> (optionnel) - Année de publication
          </li>
          <li>
            <strong>pages</strong> (optionnel) - Nombre de pages
          </li>
          <li>
            <strong>language</strong> (optionnel) - Code de langue (ex: 'fr', 'en')
          </li>
          <li>
            <strong>genres</strong> (optionnel) - Genres séparés par des points-virgules
          </li>
          <li>
            <strong>status</strong> (requis) - Un parmi: reading, read, to_read, wishlist, pal
          </li>
          <li>
            <strong>rating</strong> (optionnel) - Note de 0 à 20
          </li>
          <li>
            <strong>notes</strong> (optionnel) - Notes personnelles
          </li>
          <li>
            <strong>date_added</strong> (optionnel) - Date d'ajout (tout format)
          </li>
          <li>
            <strong>date_read</strong> (optionnel) - Date de lecture (tout format)
          </li>
        </ul>
        <p className="text-blue-800">
          <strong>Astuce :</strong> Exportez d'abord votre bibliothèque pour voir le format exact, puis modifiez selon vos besoins.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-lg border-2 border-red-300 p-8 mt-8">
        <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Zone Dangereuse
        </h3>
        <p className="text-red-800 mb-4">
          Cette action supprimera TOUS vos livres, notes, évaluations et données de lecture. Cette action est <strong>irréversible</strong>.
        </p>
        <button
          type="button"
          onClick={handleDeleteAll}
          disabled={deleting || loading}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {deleting ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Suppression en cours...</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5" />
              <span>Supprimer tous mes livres</span>
            </>
          )}
        </button>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/bibliomania" className="text-purple-600 hover:text-purple-700 font-medium">
          ← Retour à la bibliothèque
        </Link>
      </div>
    </div>
  )
}

