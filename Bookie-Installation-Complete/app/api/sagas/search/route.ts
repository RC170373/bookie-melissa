import { NextRequest, NextResponse } from 'next/server'

interface GoogleBooksVolume {
  id: string
  volumeInfo: {
    title: string
    subtitle?: string
    authors?: string[]
    publishedDate?: string
    description?: string
    pageCount?: number
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    categories?: string[]
    averageRating?: number
    ratingsCount?: number
  }
}

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || ''
    const apiKeyParam = apiKey ? `&key=${apiKey}` : ''

    // Search for books in the series
    const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=40${apiKeyParam}`

    const response = await fetch(searchUrl)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ series: [] }, { status: 200 })
    }

    // Group books by series
    const seriesMap = new Map<string, Book[]>()

    for (const item of data.items as GoogleBooksVolume[]) {
      const volumeInfo = item.volumeInfo

      // Try to extract series information from title
      const seriesMatch = extractSeriesInfo(volumeInfo.title, volumeInfo.subtitle)

      if (seriesMatch) {
        const book: Book = {
          id: item.id,
          title: volumeInfo.title,
          subtitle: volumeInfo.subtitle || null,
          publishedDate: volumeInfo.publishedDate || null,
          description: volumeInfo.description || null,
          pageCount: volumeInfo.pageCount || null,
          coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
          seriesOrder: seriesMatch.order,
        }

        if (!seriesMap.has(seriesMatch.seriesName)) {
          seriesMap.set(seriesMatch.seriesName, [])
        }

        seriesMap.get(seriesMatch.seriesName)!.push(book)
      }
    }

    // Convert map to array and sort books within each series
    const series: Series[] = Array.from(seriesMap.entries()).map(([name, books]) => ({
      name,
      books: books.sort((a, b) => {
        // Sort by series order if available
        if (a.seriesOrder !== null && b.seriesOrder !== null) {
          return a.seriesOrder - b.seriesOrder
        }
        // Otherwise sort by publication date
        if (a.publishedDate && b.publishedDate) {
          return new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime()
        }
        return 0
      }),
    }))

    // Sort series by number of books (descending)
    series.sort((a, b) => b.books.length - a.books.length)

    return NextResponse.json({ series }, { status: 200 })
  } catch (error) {
    console.error('Error searching sagas:', error)
    return NextResponse.json(
      { error: 'Failed to search sagas' },
      { status: 500 }
    )
  }
}

function extractSeriesInfo(title: string, subtitle?: string): { seriesName: string; order: number | null } | null {
  const fullTitle = subtitle ? `${title} ${subtitle}` : title

  // Common patterns for series
  const patterns = [
    // "Harry Potter and the Philosopher's Stone (Book 1)"
    /^(.+?)\s*\((?:Book|Volume|Vol\.?|Tome)\s*(\d+)\)/i,
    // "The Hunger Games: Book 1"
    /^(.+?):\s*(?:Book|Volume|Vol\.?|Tome)\s*(\d+)/i,
    // "Book 1: The Fellowship of the Ring"
    /^(?:Book|Volume|Vol\.?|Tome)\s*(\d+):\s*(.+)/i,
    // "Harry Potter, tome 1"
    /^(.+?),\s*(?:tome|book|volume|vol\.?)\s*(\d+)/i,
    // Extract series name from common patterns
    /^(Harry Potter|The Lord of the Rings|The Hunger Games|Twilight|A Song of Ice and Fire|Game of Thrones)/i,
  ]

  for (const pattern of patterns) {
    const match = fullTitle.match(pattern)
    if (match) {
      if (match.length === 3) {
        // Pattern with series name and order
        const seriesName = match[1].trim()
        const order = parseInt(match[2])
        return { seriesName, order: isNaN(order) ? null : order }
      } else if (match.length === 2) {
        // Pattern with just series name
        const seriesName = match[1].trim()
        // Try to extract order from the full title
        const orderMatch = fullTitle.match(/(\d+)/)
        const order = orderMatch ? parseInt(orderMatch[1]) : null
        return { seriesName, order }
      }
    }
  }

  // If no pattern matches, check if the title contains common series keywords
  if (
    fullTitle.match(/\b(series|saga|trilogy|cycle|chronicles|collection)\b/i) ||
    fullTitle.match(/\b(tome|book|volume|vol\.?)\s*\d+/i)
  ) {
    // Extract the main part of the title (before the first colon or dash)
    const mainTitle = fullTitle.split(/[:\-–—]/)[0].trim()
    const orderMatch = fullTitle.match(/(\d+)/)
    const order = orderMatch ? parseInt(orderMatch[1]) : null

    return { seriesName: mainTitle, order }
  }

  return null
}

