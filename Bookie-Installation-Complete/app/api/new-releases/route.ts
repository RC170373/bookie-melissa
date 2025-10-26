import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    // Get current date and date from 3 months ago
    const now = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(now.getMonth() - 3)

    // Format dates for Google Books API (YYYY-MM-DD)
    const startDate = threeMonthsAgo.toISOString().split('T')[0]
    
    // Fetch recent releases from Google Books API
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&maxResults=${limit}&langRestrict=fr`
    
    const response = await fetch(googleBooksUrl)
    const data = await response.json()

    const newReleases = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.[0] || 'Unknown',
      coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
      description: item.volumeInfo.description || null,
      publishedDate: item.volumeInfo.publishedDate || null,
      categories: item.volumeInfo.categories || [],
      rating: item.volumeInfo.averageRating || null,
      pageCount: item.volumeInfo.pageCount || null,
    }))

    return NextResponse.json({ newReleases })
  } catch (error) {
    console.error('Error fetching new releases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch new releases' },
      { status: 500 }
    )
  }
}

