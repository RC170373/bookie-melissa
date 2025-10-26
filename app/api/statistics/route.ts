import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get or create reading stats
    let stats = await prisma.readingStats.findUnique({
      where: { userId: payload.userId },
    })

    if (!stats) {
      stats = await prisma.readingStats.create({
        data: { userId: payload.userId },
      })
    }

    // Get user books for additional calculations
    const userBooks = await prisma.userBook.findMany({
      where: {
        userId: payload.userId,
        status: 'read',
      },
      include: {
        book: {
          select: {
            pages: true,
            genres: true,
            author: true,
            title: true,
          },
        },
      },
    })

    // Calculate genre statistics
    const genreMap = new Map<string, number>()
    userBooks.forEach((ub) => {
      if (ub.book.genres) {
        const genres = ub.book.genres.split(',').map((g) => g.trim())
        genres.forEach((genre) => {
          genreMap.set(genre, (genreMap.get(genre) || 0) + 1)
        })
      }
    })

    const totalBooks = userBooks.length
    const genreStats = Array.from(genreMap.entries())
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: (count / totalBooks) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate monthly statistics (last 12 months)
    const now = new Date()
    const monthlyStats = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const booksInMonth = userBooks.filter((ub) => {
        const readDate = ub.dateRead ? new Date(ub.dateRead) : ub.updatedAt
        return readDate >= date && readDate < nextMonth
      }).length

      monthlyStats.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        booksRead: booksInMonth,
      })
    }

    // Update stats if needed
    const totalPagesRead = userBooks.reduce(
      (sum, ub) => sum + (ub.book.pages || 0),
      0
    )
    const ratings = userBooks.filter((ub) => ub.rating !== null).map((ub) => ub.rating!)
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null

    const favoriteGenre = genreStats.length > 0 ? genreStats[0].genre : null

    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const booksThisYear = userBooks.filter((ub) => {
      const readDate = ub.dateRead ? new Date(ub.dateRead) : ub.updatedAt
      return readDate.getFullYear() === currentYear
    }).length

    const booksThisMonth = userBooks.filter((ub) => {
      const readDate = ub.dateRead ? new Date(ub.dateRead) : ub.updatedAt
      return (
        readDate.getFullYear() === currentYear &&
        readDate.getMonth() === currentMonth
      )
    }).length

    // Update the stats record
    await prisma.readingStats.update({
      where: { userId: payload.userId },
      data: {
        totalBooksRead: totalBooks,
        totalPagesRead,
        averageRating,
        favoriteGenre,
        booksThisYear,
        booksThisMonth,
      },
    })

    // Fetch updated stats
    const updatedStats = await prisma.readingStats.findUnique({
      where: { userId: payload.userId },
    })

    // Calculate author ratings (average rating per author)
    const authorRatingsMap = new Map<string, { total: number; count: number; books: string[] }>()
    userBooks.forEach((ub) => {
      if (ub.rating && ub.book) {
        const author = ub.book.author || 'Unknown'
        if (!authorRatingsMap.has(author)) {
          authorRatingsMap.set(author, { total: 0, count: 0, books: [] })
        }
        const authorData = authorRatingsMap.get(author)!
        authorData.total += ub.rating
        authorData.count += 1
        authorData.books.push(ub.book.title)
      }
    })

    const authorRankings = Array.from(authorRatingsMap.entries())
      .map(([author, data]) => ({
        author,
        averageRating: data.total / data.count,
        booksRead: data.count,
        books: data.books,
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 20)

    // Calculate genre ratings (average rating per genre)
    const genreRatingsMap = new Map<string, { total: number; count: number }>()
    userBooks.forEach((ub) => {
      if (ub.rating && ub.book.genres) {
        const genres = ub.book.genres.split(',').map((g) => g.trim())
        genres.forEach((genre) => {
          if (!genreRatingsMap.has(genre)) {
            genreRatingsMap.set(genre, { total: 0, count: 0 })
          }
          const genreData = genreRatingsMap.get(genre)!
          genreData.total += ub.rating!
          genreData.count += 1
        })
      }
    })

    const genreRankings = Array.from(genreRatingsMap.entries())
      .map(([genre, data]) => ({
        genre,
        averageRating: data.total / data.count,
        booksRead: data.count,
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 20)

    // Get author nationalities for world map (we'll need to fetch this from authors)
    const authorsRead = await prisma.author.findMany({
      where: {
        books: {
          some: {
            userBooks: {
              some: {
                userId: payload.userId,
                status: 'read',
              },
            },
          },
        },
      },
      select: {
        name: true,
        nationality: true,
      },
    })

    // Count authors by country
    const countryMap = new Map<string, number>()
    authorsRead.forEach((author) => {
      if (author.nationality) {
        const country = author.nationality
        countryMap.set(country, (countryMap.get(country) || 0) + 1)
      }
    })

    const countryData = Array.from(countryMap.entries()).map(([country, count]) => ({
      country,
      count,
    }))

    return NextResponse.json({
      stats: updatedStats,
      genreStats,
      monthlyStats,
      authorRankings,
      genreRankings,
      countryData,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

