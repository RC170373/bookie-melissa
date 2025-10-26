import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, books, authors
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.length < 2) {
      return NextResponse.json({
        books: [],
        authors: [],
        total: 0,
      })
    }

    const searchQuery = query.toLowerCase()

    let books: any[] = []
    let authors: any[] = []

    // Search books (SQLite doesn't support case-insensitive contains, so we filter in memory)
    if (type === 'all' || type === 'books') {
      const allBooks = await prisma.book.findMany({
        include: {
          authorDetail: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
            },
          },
          saga: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Filter in memory for case-insensitive search
      books = allBooks
        .filter(book =>
          book.title?.toLowerCase().includes(searchQuery) ||
          book.author?.toLowerCase().includes(searchQuery) ||
          book.isbn?.toLowerCase().includes(searchQuery) ||
          book.genres?.toLowerCase().includes(searchQuery) ||
          book.publisher?.toLowerCase().includes(searchQuery)
        )
        .slice(0, limit)
    }

    // Search authors (filter in memory for SQLite compatibility)
    if (type === 'all' || type === 'authors') {
      const allAuthors = await prisma.author.findMany({
        include: {
          _count: {
            select: { books: true },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })

      // Filter in memory for case-insensitive search
      authors = allAuthors
        .filter(author =>
          author.name?.toLowerCase().includes(searchQuery) ||
          author.nationality?.toLowerCase().includes(searchQuery) ||
          author.bio?.toLowerCase().includes(searchQuery)
        )
        .slice(0, limit)
    }

    return NextResponse.json({
      books,
      authors,
      total: books.length + authors.length,
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      {
        error: 'Search failed',
        books: [],
        authors: [],
        total: 0,
      },
      { status: 500 }
    )
  }
}

