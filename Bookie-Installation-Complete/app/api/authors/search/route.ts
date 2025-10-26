import { NextRequest, NextResponse } from 'next/server'

interface GoogleBooksVolume {
  volumeInfo: {
    authors?: string[]
    description?: string
    imageLinks?: {
      thumbnail?: string
    }
  }
}

interface AuthorInfo {
  id: string
  name: string
  bio: string | null
  photoUrl: string | null
  birthDate: string | null
  nationality: string | null
  website: string | null
  bookCount: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Search for MORE books by this author on Google Books to get complete bibliography
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=inauthor:"${encodeURIComponent(query)}"&maxResults=40&orderBy=relevance`

    const response = await fetch(googleBooksUrl)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ authors: [] })
    }

    // Extract unique authors from the results
    const authorMap = new Map<string, AuthorInfo>()
    let authorIdCounter = 0

    data.items.forEach((item: GoogleBooksVolume) => {
      const authors = item.volumeInfo.authors || []

      authors.forEach((authorName: string) => {
        // Only include authors that match the search query closely
        const normalizedAuthor = authorName.toLowerCase().trim()
        const normalizedQuery = query.toLowerCase().trim()

        if (normalizedAuthor.includes(normalizedQuery) || normalizedQuery.includes(normalizedAuthor)) {
          if (!authorMap.has(authorName)) {
            authorIdCounter++
            const baseId = authorName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            const uniqueId = `${baseId}-${authorIdCounter}`

            authorMap.set(authorName, {
              id: uniqueId,
              name: authorName,
              bio: item.volumeInfo.description || null,
              photoUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
              birthDate: null,
              nationality: null,
              website: null,
              bookCount: 1,
            })
          } else {
            // Increment book count
            const author = authorMap.get(authorName)!
            author.bookCount++

            // Update bio if we don't have one yet
            if (!author.bio && item.volumeInfo.description) {
              author.bio = item.volumeInfo.description
            }

            // Update photo if we don't have one yet
            if (!author.photoUrl && item.volumeInfo.imageLinks?.thumbnail) {
              author.photoUrl = item.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')
            }
          }
        }
      })
    })

    // Convert map to array and sort by book count (descending)
    const authors = Array.from(authorMap.values())
      .sort((a, b) => b.bookCount - a.bookCount)
      .slice(0, 20) // Limit to top 20 authors

    return NextResponse.json({ authors })
  } catch (error) {
    console.error('Error searching authors:', error)
    return NextResponse.json(
      { error: 'Failed to search authors' },
      { status: 500 }
    )
  }
}

