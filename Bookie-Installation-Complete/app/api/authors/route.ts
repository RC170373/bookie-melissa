import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get all books and group by author
    const books = await prisma.book.findMany({
      select: {
        author: true,
      },
    })

    // Create a map to count books per author
    const authorMap = new Map<string, number>()
    books.forEach(book => {
      const count = authorMap.get(book.author) || 0
      authorMap.set(book.author, count + 1)
    })

    // Convert to array and sort alphabetically
    const authors = Array.from(authorMap.entries())
      .map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'), // Generate ID from name
        name,
        bio: null,
        photoUrl: null,
        birthDate: null,
        nationality: null,
        website: null,
        _count: {
          books: count,
        },
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ authors })
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { name, bio, photoUrl, birthDate, nationality, website } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Author name is required' },
        { status: 400 }
      )
    }

    const author = await prisma.author.create({
      data: {
        name,
        bio,
        photoUrl,
        birthDate: birthDate ? new Date(birthDate) : null,
        nationality,
        website,
      },
    })

    return NextResponse.json({ author }, { status: 201 })
  } catch (error) {
    console.error('Error creating author:', error)
    return NextResponse.json(
      { error: 'Failed to create author' },
      { status: 500 }
    )
  }
}

