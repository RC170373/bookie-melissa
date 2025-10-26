import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    const books = await prisma.book.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { author: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ books }, { status: 200 })
  } catch (error: any) {
    console.error('Get books error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get books' },
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

    const { title, author, isbn, publisher, publicationYear, pages, language, genres, description, coverUrl } =
      await request.json()

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      )
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        publisher,
        publicationYear,
        pages,
        language,
        genres,
        description,
        coverUrl,
      },
    })

    return NextResponse.json({ book }, { status: 201 })
  } catch (error: any) {
    console.error('Create book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create book' },
      { status: 500 }
    )
  }
}

