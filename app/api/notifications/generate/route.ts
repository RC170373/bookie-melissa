import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Generate smart notifications for the user
 * - Upcoming planned reads (books with plannedReadDate in the next 7 days)
 * - Recommendations based on favorite genres
 * - Reading streak reminders
 * - Achievement notifications
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = payload.userId
    const notifications: any[] = []

    // 1. Check for upcoming planned reads (next 7 days)
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const upcomingBooks = await prisma.userBook.findMany({
      where: {
        userId,
        plannedReadDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
        status: {
          not: 'read',
        },
      },
      include: {
        book: true,
      },
      orderBy: {
        plannedReadDate: 'asc',
      },
      take: 3,
    })

    for (const userBook of upcomingBooks) {
      const daysUntil = Math.ceil(
        (new Date(userBook.plannedReadDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      const notification = await prisma.notification.create({
        data: {
          userId,
          type: 'upcoming_read',
          title: 'Lecture planifiée bientôt',
          message: `"${userBook.book.title}" est prévu ${
            daysUntil === 0
              ? "aujourd'hui"
              : daysUntil === 1
              ? 'demain'
              : `dans ${daysUntil} jours`
          }`,
          bookId: userBook.book.id,
          link: `/books/${userBook.book.id}`,
        },
      })

      notifications.push(notification)
    }

    // 2. Check for books in "reading" status for more than 30 days (gentle reminder)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const stalledBooks = await prisma.userBook.findMany({
      where: {
        userId,
        status: 'reading',
        updatedAt: {
          lte: thirtyDaysAgo,
        },
      },
      include: {
        book: true,
      },
      take: 2,
    })

    for (const userBook of stalledBooks) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: 'reminder',
          title: 'Lecture en cours',
          message: `Vous lisez "${userBook.book.title}" depuis un moment. Envie de le terminer ?`,
          bookId: userBook.book.id,
          link: `/books/${userBook.book.id}`,
        },
      })

      notifications.push(notification)
    }

    // 3. Reading achievements
    const stats = await prisma.readingStats.findUnique({
      where: { userId },
    })

    if (stats) {
      // Check for reading streak milestones
      if (stats.currentStreak > 0 && stats.currentStreak % 7 === 0) {
        const notification = await prisma.notification.create({
          data: {
            userId,
            type: 'achievement',
            title: '🔥 Série de lecture !',
            message: `Félicitations ! Vous avez une série de ${stats.currentStreak} jours de lecture consécutifs !`,
            link: '/statistics',
          },
        })

        notifications.push(notification)
      }

      // Check for books read milestones
      if (stats.booksThisYear > 0 && stats.booksThisYear % 10 === 0) {
        const notification = await prisma.notification.create({
          data: {
            userId,
            type: 'achievement',
            title: '📚 Jalon de lecture !',
            message: `Incroyable ! Vous avez lu ${stats.booksThisYear} livres cette année !`,
            link: '/statistics',
          },
        })

        notifications.push(notification)
      }
    }

    // 4. Recommendations based on favorite genre
    if (stats?.favoriteGenre) {
      const favoriteGenreBooks = await prisma.book.findMany({
        where: {
          genres: {
            contains: stats.favoriteGenre,
          },
          userBooks: {
            none: {
              userId,
            },
          },
        },
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (favoriteGenreBooks.length > 0) {
        const randomBook = favoriteGenreBooks[Math.floor(Math.random() * favoriteGenreBooks.length)]

        const notification = await prisma.notification.create({
          data: {
            userId,
            type: 'recommendation',
            title: '⭐ Recommandation pour vous',
            message: `Basé sur votre genre préféré (${stats.favoriteGenre}), vous pourriez aimer "${randomBook.title}" de ${randomBook.author}`,
            bookId: randomBook.id,
            link: `/books/${randomBook.id}`,
          },
        })

        notifications.push(notification)
      }
    }

    // 5. Check for books in wishlist that have been there for a while
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const oldWishlistBooks = await prisma.userBook.findMany({
      where: {
        userId,
        status: 'wishlist',
        createdAt: {
          lte: ninetyDaysAgo,
        },
      },
      include: {
        book: true,
      },
      take: 1,
    })

    for (const userBook of oldWishlistBooks) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: 'reminder',
          title: '💭 Liste de souhaits',
          message: `"${userBook.book.title}" est dans votre liste de souhaits depuis un moment. C'est le moment de le lire ?`,
          bookId: userBook.book.id,
          link: `/books/${userBook.book.id}`,
        },
      })

      notifications.push(notification)
    }

    return NextResponse.json(
      {
        message: `${notifications.length} notification(s) générée(s)`,
        notifications,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error generating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to generate notifications' },
      { status: 500 }
    )
  }
}

