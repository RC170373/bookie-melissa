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

    // Get user's unread books
    const unreadBooks = await prisma.userBook.findMany({
      where: {
        userId: decoded.userId,
        status: { in: ['to_read', 'wishlist', 'pal'] },
      },
      include: { book: true },
    });

    if (unreadBooks.length === 0) {
      // If no unread books, get a random book from the database
      const totalBooks = await prisma.book.count();
      const randomIndex = Math.floor(Math.random() * totalBooks);
      
      const randomBook = await prisma.book.findMany({
        skip: randomIndex,
        take: 1,
      });

      return NextResponse.json({ book: randomBook[0] || null });
    }

    // Pick a random unread book
    const randomIndex = Math.floor(Math.random() * unreadBooks.length);
    const randomUserBook = unreadBooks[randomIndex];

    return NextResponse.json({ book: randomUserBook.book });
  } catch (error) {
    console.error('Random book error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sélection aléatoire' },
      { status: 500 }
    );
  }
}

