import { NextRequest, NextResponse } from 'next/server'
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

    // Get user's reading preferences from their library
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // For now, we'll use Google Books API to get recommendations
    // based on user's favorite genres and authors
    
    // Get user's favorite genres and authors from their reading history
    // This is a simplified version - in production, you'd want more sophisticated recommendation logic
    
    // For demonstration, let's fetch some popular recent books
    const currentYear = new Date().getFullYear()
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&maxResults=${limit}&langRestrict=fr`
    
    const response = await fetch(googleBooksUrl)
    const data = await response.json()

    const recommendations = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.[0] || 'Unknown',
      coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
      description: item.volumeInfo.description || null,
      publishedDate: item.volumeInfo.publishedDate || null,
      categories: item.volumeInfo.categories || [],
      rating: item.volumeInfo.averageRating || null,
    }))

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

