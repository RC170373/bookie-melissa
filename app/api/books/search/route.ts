import { NextRequest, NextResponse } from 'next/server'

interface GoogleBooksVolume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publishedDate?: string
    description?: string
    pageCount?: number
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
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

    // Search for books by title
    const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
      query
    )}&maxResults=20${apiKeyParam}`

    const response = await fetch(searchUrl)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ books: [] }, { status: 200 })
    }

    // Transform the results and remove duplicates
    const seenIds = new Set<string>()
    const books = data.items
      .map((item: GoogleBooksVolume) => {
        const volumeInfo = item.volumeInfo

        // Get ISBN
        let isbn = null
        if (volumeInfo.industryIdentifiers) {
          const isbn13 = volumeInfo.industryIdentifiers.find(
            (id) => id.type === 'ISBN_13'
          )
          const isbn10 = volumeInfo.industryIdentifiers.find(
            (id) => id.type === 'ISBN_10'
          )
          isbn = isbn13?.identifier || isbn10?.identifier || null
        }

        return {
          id: item.id,
          title: volumeInfo.title,
          authors: volumeInfo.authors || [],
          publishedDate: volumeInfo.publishedDate || null,
          description: volumeInfo.description || null,
          pageCount: volumeInfo.pageCount || null,
          coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
          isbn,
        }
      })
      .filter((book) => {
        if (seenIds.has(book.id)) {
          return false
        }
        seenIds.add(book.id)
        return true
      })

    return NextResponse.json({ books }, { status: 200 })
  } catch (error) {
    console.error('Error searching books:', error)
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    )
  }
}

