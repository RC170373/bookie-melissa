// Google Books API integration for auto-filling book information

export interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    language?: string
  }
}

export interface BookSearchResult {
  title: string
  author: string
  isbn?: string
  publisher?: string
  publicationYear?: string
  pages?: string
  language?: string
  genres?: string
  description?: string
  coverUrl?: string
}

/**
 * Search for books using Google Books API
 * @param query - Search query (title, author, ISBN, etc.)
 * @returns Array of book results
 */
export async function searchGoogleBooks(query: string): Promise<BookSearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&langRestrict=fr`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books API')
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return []
    }

    return data.items.map((item: GoogleBook) => convertGoogleBookToResult(item))
  } catch (error) {
    console.error('Error searching Google Books:', error)
    return []
  }
}

/**
 * Search for a book by ISBN
 * @param isbn - ISBN number (10 or 13 digits)
 * @returns Book result or null
 */
export async function searchByISBN(isbn: string): Promise<BookSearchResult | null> {
  if (!isbn) return null

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books API')
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    return convertGoogleBookToResult(data.items[0])
  } catch (error) {
    console.error('Error searching by ISBN:', error)
    return null
  }
}

/**
 * Convert Google Books API result to our book format
 */
function convertGoogleBookToResult(googleBook: GoogleBook): BookSearchResult {
  const { volumeInfo } = googleBook

  // Extract ISBN (prefer ISBN-13 over ISBN-10)
  let isbn = ''
  if (volumeInfo.industryIdentifiers) {
    const isbn13 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')
    const isbn10 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')
    isbn = isbn13?.identifier || isbn10?.identifier || ''
  }

  // Extract publication year from date
  let publicationYear = ''
  if (volumeInfo.publishedDate) {
    const year = volumeInfo.publishedDate.split('-')[0]
    if (year && /^\d{4}$/.test(year)) {
      publicationYear = year
    }
  }

  // Get cover image (prefer larger sizes)
  let coverUrl = ''
  if (volumeInfo.imageLinks) {
    // Try to get the largest available image
    coverUrl = volumeInfo.imageLinks.extraLarge ||
               volumeInfo.imageLinks.large ||
               volumeInfo.imageLinks.medium ||
               volumeInfo.imageLinks.thumbnail ||
               volumeInfo.imageLinks.smallThumbnail || ''

    // Upgrade to HTTPS and increase zoom level for better quality
    if (coverUrl) {
      coverUrl = coverUrl.replace('http://', 'https://')
      // Remove zoom parameter and add zoom=1 for better quality
      coverUrl = coverUrl.replace(/&zoom=\d+/, '').replace(/zoom=\d+&?/, '')
      coverUrl = coverUrl + '&zoom=1'
    }
  }

  return {
    title: volumeInfo.title || '',
    author: volumeInfo.authors?.join(', ') || '',
    isbn,
    publisher: volumeInfo.publisher || '',
    publicationYear,
    pages: volumeInfo.pageCount?.toString() || '',
    language: volumeInfo.language || 'fr',
    genres: volumeInfo.categories?.join('; ') || '',
    description: volumeInfo.description || '',
    coverUrl,
  }
}

/**
 * Search for authors using Google Books API
 * @param authorName - Author name to search
 * @returns Array of unique author names
 */
export async function searchAuthors(authorName: string): Promise<string[]> {
  if (!authorName || authorName.length < 2) {
    return []
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(authorName)}&maxResults=20`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books API')
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return []
    }

    // Extract unique author names
    const authors = new Set<string>()
    data.items.forEach((item: GoogleBook) => {
      if (item.volumeInfo.authors) {
        item.volumeInfo.authors.forEach(author => authors.add(author))
      }
    })

    return Array.from(authors).slice(0, 10)
  } catch (error) {
    console.error('Error searching authors:', error)
    return []
  }
}

