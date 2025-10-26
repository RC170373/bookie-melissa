import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const userBooks = await prisma.userBook.findMany({
      where: {
        userId: payload.userId,
        ...(status && status !== 'all' ? { status } : {}),
      },
      include: {
        book: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ userBooks }, { status: 200 })
  } catch (error: any) {
    console.error('Get user books error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get user books' },
      { status: 500 }
    )
  }
}

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

    const { bookId, title, author, coverUrl, status, rating, notes, review, favoriteQuotes, dateRead, plannedReadDate } = await request.json()

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Check if book exists in database, if not create it
    let book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book && title && author) {
      // Create book from Google Books data
      book = await prisma.book.create({
        data: {
          id: bookId,
          title,
          author,
          coverUrl,
        },
      })
    }

    // Check if already exists
    const existing = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId: payload.userId,
          bookId,
        },
      },
    })

    if (existing) {
      // Update existing
      const userBook = await prisma.userBook.update({
        where: { id: existing.id },
        data: {
          status: status || existing.status,
          rating,
          notes,
          review,
          favoriteQuotes,
          dateRead: dateRead ? new Date(dateRead) : null,
          plannedReadDate: plannedReadDate ? new Date(plannedReadDate) : null,
        },
        include: {
          book: true,
        },
      })
      return NextResponse.json({ userBook }, { status: 200 })
    }

    const userBook = await prisma.userBook.create({
      data: {
        userId: payload.userId,
        bookId,
        status: status || 'to_read',
        rating,
        notes,
        review,
        favoriteQuotes,
        dateRead: dateRead ? new Date(dateRead) : null,
        plannedReadDate: plannedReadDate ? new Date(plannedReadDate) : null,
      },
      include: {
        book: true,
      },
    })

    return NextResponse.json({ userBook }, { status: 201 })
  } catch (error: any) {
    console.error('Create user book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add book' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const userBookId = searchParams.get('id')

    if (!userBookId) {
      return NextResponse.json(
        { error: 'User book ID is required' },
        { status: 400 }
      )
    }

    // Verify the user book belongs to the user
    const userBook = await prisma.userBook.findUnique({
      where: { id: userBookId },
    })

    if (!userBook) {
      return NextResponse.json(
        { error: 'User book not found' },
        { status: 404 }
      )
    }

    if (userBook.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the user book
    await prisma.userBook.delete({
      where: { id: userBookId },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Delete user book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}

