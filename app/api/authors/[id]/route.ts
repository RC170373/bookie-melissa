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
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    language?: string
    averageRating?: number
    ratingsCount?: number
    seriesInfo?: {
      bookDisplayNumber?: string
      volumeSeries?: Array<{
        seriesId: string
        seriesBookType: string
        orderNumber: number
      }>
    }
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Decode the author name from the ID - remove the counter suffix
    const authorNameWithCounter = decodeURIComponent(id.replace(/-/g, ' '))
    // Remove the last part if it's a number (the counter we added)
    const parts = authorNameWithCounter.split(' ')
    const lastPart = parts[parts.length - 1]
    const authorName = !isNaN(Number(lastPart)) ? parts.slice(0, -1).join(' ') : authorNameWithCounter

    // Fetch ALL books by this author (multiple requests if needed)
    const allItems: GoogleBooksVolume[] = []
    // Google Books API returns max 10 items per request regardless of maxResults parameter
    const maxResultsPerRequest = 10
    let startIndex = 0
    let hasMore = true
    let consecutiveEmptyResults = 0

    // Get API key from environment (optional but recommended for better results)
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || ''
    const apiKeyParam = apiKey ? `&key=${apiKey}` : ''

    // Fetch up to 500 books (50 requests max) to get complete bibliographies
    // Google Books API returns max 10 items per request, so we need to paginate
    while (hasMore && allItems.length < 500 && consecutiveEmptyResults < 5) {
      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=inauthor:"${encodeURIComponent(authorName)}"&maxResults=${maxResultsPerRequest}&startIndex=${startIndex}${apiKeyParam}`

      console.log(`Fetching books for ${authorName}, startIndex: ${startIndex}, current total: ${allItems.length}`)

      const response = await fetch(googleBooksUrl)
      const data = await response.json()

      console.log(`Received ${data.items?.length || 0} items, totalItems: ${data.totalItems}`)

      if (!data.items || data.items.length === 0) {
        consecutiveEmptyResults++
        console.log(`No items received (attempt ${consecutiveEmptyResults}/5)`)
        if (consecutiveEmptyResults >= 5) {
          console.log('No more items after 5 attempts, stopping')
          hasMore = false
          break
        }
      } else {
        consecutiveEmptyResults = 0
        allItems.push(...data.items)
      }

      // Increment by the actual number of results we expect (10)
      startIndex += maxResultsPerRequest

      // Stop if we've made too many requests (500 books = 50 requests)
      if (startIndex >= 500) {
        console.log('Reached maximum pagination limit (500 items)')
        hasMore = false
      }
    }

    console.log(`Total items fetched: ${allItems.length}`)

    if (allItems.length === 0) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }

    // Extract author info and books
    let authorInfo = {
      id,
      name: '',
      bio: '',
      photoUrl: null as string | null,
    }

    const booksMap = new Map<string, Book>()
    const seriesMap = new Map<string, Book[]>()

    // Process all items - since we searched for this specific author, all results should be relevant
    allItems.forEach((item: GoogleBooksVolume) => {
      const authors = item.volumeInfo.authors || []

      // Set author info from first book
      if (!authorInfo.name && authors.length > 0) {
        // Use the first author that matches our search
        const matchingAuthor = authors.find(a =>
          a.toLowerCase().includes(authorName.toLowerCase()) ||
          authorName.toLowerCase().includes(a.toLowerCase())
        ) || authors[0]

        authorInfo.name = matchingAuthor
        authorInfo.bio = item.volumeInfo.description || ''
        authorInfo.photoUrl = item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null
      }

      // Extract book info - include all books from the search results
      const book: Book = {
        id: item.id,
        title: item.volumeInfo.title,
        subtitle: item.volumeInfo.subtitle || null,
        publishedDate: item.volumeInfo.publishedDate || null,
        description: item.volumeInfo.description || null,
        pageCount: item.volumeInfo.pageCount || null,
        coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
        categories: item.volumeInfo.categories || [],
        rating: item.volumeInfo.averageRating || null,
        ratingsCount: item.volumeInfo.ratingsCount || null,
        series: null,
        seriesOrder: null,
      }

      // Check for series information
      if (item.volumeInfo.seriesInfo?.volumeSeries && item.volumeInfo.seriesInfo.volumeSeries.length > 0) {
        const seriesInfo = item.volumeInfo.seriesInfo.volumeSeries[0]
        book.series = seriesInfo.seriesId
        book.seriesOrder = seriesInfo.orderNumber

        // Add to series map
        if (!seriesMap.has(seriesInfo.seriesId)) {
          seriesMap.set(seriesInfo.seriesId, [])
        }
        seriesMap.get(seriesInfo.seriesId)!.push(book)
      }

      // Add to books map (avoid duplicates)
      if (!booksMap.has(item.id)) {
        booksMap.set(item.id, book)
      }
    })

    // Convert books map to array and sort by publication date (newest first)
    const books = Array.from(booksMap.values()).sort((a, b) => {
      if (!a.publishedDate) return 1
      if (!b.publishedDate) return -1
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    })

    // Convert series map to array
    const series: Series[] = Array.from(seriesMap.entries()).map(([name, seriesBooks]) => ({
      name,
      books: seriesBooks.sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0)),
    }))

    return NextResponse.json({
      author: authorInfo,
      books,
      series,
      totalBooks: books.length,
    })
  } catch (error) {
    console.error('Error fetching author details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch author details' },
      { status: 500 }
    )
  }
}

