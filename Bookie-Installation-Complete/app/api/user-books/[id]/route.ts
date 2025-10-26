import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const bookId = id

    // Find user book by bookId
    const userBook = await prisma.userBook.findFirst({
      where: {
        userId: payload.userId,
        bookId,
      },
      include: {
        book: true,
      },
    })

    if (!userBook) {
      return NextResponse.json({ userBook: null }, { status: 200 })
    }

    return NextResponse.json({ userBook }, { status: 200 })
  } catch (error: any) {
    console.error('Get user book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get user book' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const { status, rating, notes, review, favoriteQuotes, dateRead, plannedReadDate } = await request.json()

    // Verify ownership
    const userBook = await prisma.userBook.findUnique({
      where: { id },
    })

    if (!userBook || userBook.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const updated = await prisma.userBook.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(rating !== undefined && { rating }),
        ...(notes !== undefined && { notes }),
        ...(review !== undefined && { review }),
        ...(favoriteQuotes !== undefined && { favoriteQuotes }),
        ...(dateRead !== undefined && { dateRead: dateRead ? new Date(dateRead) : null }),
        ...(plannedReadDate !== undefined && { plannedReadDate: plannedReadDate ? new Date(plannedReadDate) : null }),
      },
      include: {
        book: true,
      },
    })

    return NextResponse.json({ userBook: updated }, { status: 200 })
  } catch (error: any) {
    console.error('Update user book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update book' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Verify ownership
    const userBook = await prisma.userBook.findUnique({
      where: { id },
    })

    if (!userBook || userBook.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    await prisma.userBook.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Book removed' }, { status: 200 })
  } catch (error: any) {
    console.error('Delete user book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}

