import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

    // Get trending books (most read recently)
    const trending = await prisma.userBook.groupBy({
      by: ['bookId'],
      where: {
        status: 'read',
        dateRead: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _count: {
        bookId: true,
      },
      orderBy: {
        _count: {
          bookId: 'desc',
        },
      },
      take: 10,
    });

    const trendingBookIds = trending.map(t => t.bookId);
    const trendingBooks = await prisma.book.findMany({
      where: { id: { in: trendingBookIds } },
      take: 6,
    });

    // Get countries from user's books
    const userBooks = await prisma.userBook.findMany({
      where: { userId: decoded.userId },
      include: { book: true },
    });

    const countriesMap = new Map<string, number>();
    userBooks.forEach(ub => {
      // This would need author nationality data
      // For now, we'll use a placeholder
      const country = 'France'; // Would come from author data
      countriesMap.set(country, (countriesMap.get(country) || 0) + 1);
    });

    const countries = Array.from(countriesMap.entries()).map(([name, count]) => ({
      name,
      count,
      flag: '🇫🇷', // Would be dynamic based on country
    }));

    return NextResponse.json({
      trending: trendingBooks,
      countries,
    });
  } catch (error) {
    console.error('Discover error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

