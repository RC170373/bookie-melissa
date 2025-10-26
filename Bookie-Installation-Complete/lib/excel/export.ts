import * as XLSX from 'xlsx'
import { Database } from '@/lib/types/database'

export interface ExportedBook {
  title: string
  author: string
  isbn?: string
  publisher?: string
  publication_year?: number
  pages?: number
  language?: string
  genres?: string
  status: 'reading' | 'read' | 'to_read' | 'wishlist' | 'pal'
  rating?: number
  notes?: string
  date_added?: string
  date_read?: string
}

/**
 * Export user's library to Excel format
 * Compatible with Livraddict export format
 */
export function exportLibraryToExcel(
  books: (Database['public']['Tables']['user_books']['Row'] & {
    books: Database['public']['Tables']['books']['Row'] | null
  })[],
  username: string
) {
  // Transform data for export
  const exportData: ExportedBook[] = books.map((userBook) => ({
    title: userBook.books?.title || 'Unknown',
    author: userBook.books?.author || 'Unknown',
    isbn: userBook.books?.isbn || undefined,
    publisher: userBook.books?.publisher || undefined,
    publication_year: userBook.books?.publication_year || undefined,
    pages: userBook.books?.pages || undefined,
    language: userBook.books?.language || undefined,
    genres: Array.isArray(userBook.books?.genres)
      ? userBook.books.genres.join('; ')
      : userBook.books?.genres || undefined,
    status: userBook.status as 'reading' | 'read' | 'to_read' | 'wishlist' | 'pal',
    rating: userBook.rating || undefined,
    notes: userBook.notes || undefined,
    date_added: userBook.created_at
      ? new Date(userBook.created_at).toLocaleDateString('fr-FR')
      : undefined,
    date_read: userBook.date_read
      ? new Date(userBook.date_read).toLocaleDateString('fr-FR')
      : undefined,
  }))

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(exportData)

  // Set column widths
  const colWidths = [
    { wch: 30 }, // title
    { wch: 20 }, // author
    { wch: 15 }, // isbn
    { wch: 20 }, // publisher
    { wch: 15 }, // publication_year
    { wch: 10 }, // pages
    { wch: 12 }, // language
    { wch: 25 }, // genres
    { wch: 12 }, // status
    { wch: 8 }, // rating
    { wch: 30 }, // notes
    { wch: 12 }, // date_added
    { wch: 12 }, // date_read
  ]
  ws['!cols'] = colWidths

  // Create workbook with metadata
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Bibliomania')

  // Add metadata sheet
  const metadataWs = XLSX.utils.json_to_sheet([
    {
      'Export Date': new Date().toLocaleDateString('fr-FR'),
      'Export Time': new Date().toLocaleTimeString('fr-FR'),
      'Username': username,
      'Total Books': books.length,
      'Format Version': '1.0',
    },
  ])
  XLSX.utils.book_append_sheet(wb, metadataWs, 'Metadata')

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `Livraddict_${username}_${timestamp}.xlsx`

  // Write file
  XLSX.writeFile(wb, filename)
}

/**
 * Export library statistics
 */
export function getLibraryStats(
  books: (Database['public']['Tables']['user_books']['Row'] & {
    books: Database['public']['Tables']['books']['Row'] | null
  })[]
) {
  const stats = {
    total: books.length,
    reading: books.filter((b) => b.status === 'reading').length,
    read: books.filter((b) => b.status === 'read').length,
    to_read: books.filter((b) => b.status === 'to_read').length,
    wishlist: books.filter((b) => b.status === 'wishlist').length,
    pal: books.filter((b) => b.status === 'pal').length,
    average_rating:
      books.filter((b) => b.rating).length > 0
        ? (
            books
              .filter((b) => b.rating)
              .reduce((sum, b) => sum + (b.rating || 0), 0) /
            books.filter((b) => b.rating).length
          ).toFixed(2)
        : 0,
  }
  return stats
}

