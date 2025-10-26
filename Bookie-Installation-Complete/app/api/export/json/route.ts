import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Get user's books
    const userBooks = await prisma.userBook.findMany({
      where: { userId: decoded.userId },
      include: {
        book: true,
      },
    });

    // Get user's challenges
    const challenges = await prisma.challenge.findMany({
      where: { userId: decoded.userId },
    });

    // Get user's lists
    const lists = await prisma.list.findMany({
      where: { userId: decoded.userId },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    // Create backup object
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        email: user?.email,
        username: user?.username,
        avatar: user?.avatar,
        createdAt: user?.createdAt,
      },
      books: userBooks.map(ub => ({
        book: {
          title: ub.book.title,
          authors: ub.book.authors,
          isbn: ub.book.isbn,
          isbn13: ub.book.isbn13,
          publisher: ub.book.publisher,
          publishedDate: ub.book.publishedDate,
          description: ub.book.description,
          pageCount: ub.book.pageCount,
          categories: ub.book.categories,
          genres: ub.book.genres,
          language: ub.book.language,
          thumbnail: ub.book.thumbnail,
          googleBooksId: ub.book.googleBooksId,
        },
        userBook: {
          status: ub.status,
          rating: ub.rating,
          review: ub.review,
          notes: ub.notes,
          favoriteQuotes: ub.favoriteQuotes,
          dateRead: ub.dateRead,
          dateAdded: ub.createdAt,
          ratingAnswers: ub.ratingAnswers,
          ratingComments: ub.ratingComments,
          aiRating: ub.aiRating,
          manualOverride: ub.manualOverride,
        },
      })),
      challenges: challenges.map(c => ({
        name: c.name,
        description: c.description,
        targetBooks: c.targetBooks,
        currentBooks: c.currentBooks,
        startDate: c.startDate,
        endDate: c.endDate,
        completed: c.completed,
      })),
      lists: lists.map(l => ({
        name: l.name,
        description: l.description,
        isPublic: l.isPublic,
        createdAt: l.createdAt,
        books: l.books.map(lb => ({
          title: lb.book.title,
          authors: lb.book.authors,
        })),
      })),
    };

    const json = JSON.stringify(backup, null, 2);

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="bookie_backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Export JSON error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}

