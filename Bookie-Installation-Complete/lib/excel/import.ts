import * as XLSX from 'xlsx'

export interface ImportedBook {
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

export interface ImportResult {
  success: boolean
  books: ImportedBook[]
  errors: ImportError[]
  warnings: string[]
}

export interface ImportError {
  row: number
  field: string
  value: string
  message: string
}

/**
 * Parse Excel file and extract book data
 * Compatible with Livraddict export format
 */
export async function parseExcelFile(file: File): Promise<ImportResult> {
  const errors: ImportError[] = []
  const warnings: string[] = []
  const books: ImportedBook[] = []

  try {
    // Read file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    // Get the first sheet (should be 'Bibliomania')
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return {
        success: false,
        books: [],
        errors: [
          {
            row: 0,
            field: 'file',
            value: '',
            message: 'No sheets found in Excel file',
          },
        ],
        warnings: [],
      }
    }

    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Validate and transform data
    data.forEach((row: any, index: number) => {
      const rowNum = index + 2 // +2 because of header and 1-based indexing

      // Validate required fields
      if (!row.title || !row.title.toString().trim()) {
        errors.push({
          row: rowNum,
          field: 'title',
          value: row.title || '',
          message: 'Title is required',
        })
        return
      }

      if (!row.author || !row.author.toString().trim()) {
        errors.push({
          row: rowNum,
          field: 'author',
          value: row.author || '',
          message: 'Author is required',
        })
        return
      }

      // Validate status
      const validStatuses = ['reading', 'read', 'to_read', 'wishlist', 'pal']
      const status = (row.status || 'to_read').toString().toLowerCase().trim()
      if (!validStatuses.includes(status)) {
        errors.push({
          row: rowNum,
          field: 'status',
          value: row.status || '',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        })
        return
      }

      // Validate rating if provided
      let rating: number | undefined
      if (row.rating !== undefined && row.rating !== null && row.rating !== '') {
        const ratingNum = parseFloat(row.rating)
        if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 20) {
          errors.push({
            row: rowNum,
            field: 'rating',
            value: row.rating.toString(),
            message: 'Rating must be a number between 0 and 20',
          })
          return
        }
        rating = ratingNum
      }

      // Validate pages if provided
      let pages: number | undefined
      if (row.pages !== undefined && row.pages !== null && row.pages !== '') {
        const pagesNum = parseInt(row.pages)
        if (isNaN(pagesNum) || pagesNum < 0) {
          errors.push({
            row: rowNum,
            field: 'pages',
            value: row.pages.toString(),
            message: 'Pages must be a positive number',
          })
          return
        }
        pages = pagesNum
      }

      // Validate publication year if provided
      let publication_year: number | undefined
      if (
        row.publication_year !== undefined &&
        row.publication_year !== null &&
        row.publication_year !== ''
      ) {
        const yearNum = parseInt(row.publication_year)
        if (isNaN(yearNum) || yearNum < 1000 || yearNum > new Date().getFullYear() + 1) {
          warnings.push(
            `Row ${rowNum}: Publication year "${row.publication_year}" seems invalid (expected between 1000 and ${new Date().getFullYear() + 1})`
          )
        } else {
          publication_year = yearNum
        }
      }

      // Parse genres
      let genres: string[] | undefined
      if (row.genres && row.genres.toString().trim()) {
        genres = row.genres
          .toString()
          .split(';')
          .map((g: string) => g.trim())
          .filter((g: string) => g)
      }

      // Create book object
      const book: ImportedBook = {
        title: row.title.toString().trim(),
        author: row.author.toString().trim(),
        isbn: row.isbn ? row.isbn.toString().trim() : undefined,
        publisher: row.publisher ? row.publisher.toString().trim() : undefined,
        publication_year,
        pages,
        language: row.language ? row.language.toString().trim() : undefined,
        genres: genres ? genres.join('; ') : undefined,
        status: status as 'reading' | 'read' | 'to_read' | 'wishlist' | 'pal',
        rating,
        notes: row.notes ? row.notes.toString().trim() : undefined,
        date_added: row.date_added ? row.date_added.toString().trim() : undefined,
        date_read: row.date_read ? row.date_read.toString().trim() : undefined,
      }

      books.push(book)
    })

    return {
      success: errors.length === 0,
      books,
      errors,
      warnings,
    }
  } catch (error) {
    return {
      success: false,
      books: [],
      errors: [
        {
          row: 0,
          field: 'file',
          value: '',
          message: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      warnings: [],
    }
  }
}

/**
 * Validate import data before saving
 */
export function validateImportData(books: ImportedBook[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (books.length === 0) {
    errors.push('No books to import')
  }

  if (books.length > 10000) {
    errors.push('Too many books to import (maximum 10,000)')
  }

  // Check for duplicates
  const titles = new Set<string>()
  books.forEach((book) => {
    const key = `${book.title}|${book.author}`
    if (titles.has(key)) {
      errors.push(`Duplicate book found: "${book.title}" by ${book.author}`)
    }
    titles.add(key)
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

