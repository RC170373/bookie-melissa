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
    const challenges = await prisma.userChallenge.findMany({
      where: { userId: decoded.userId },
      include: {
        challenge: true,
      },
    });

    // Get user's lists
    const lists = await prisma.list.findMany({
      where: { userId: decoded.userId },
      include: {
        items: {
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
          author: ub.book.author,
          isbn: ub.book.isbn,
          publisher: ub.book.publisher,
          publicationYear: ub.book.publicationYear,
          description: ub.book.description,
          pages: ub.book.pages,
          genres: ub.book.genres,
          language: ub.book.language,
          coverUrl: ub.book.coverUrl,
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
        name: c.challenge.name,
        description: c.challenge.description,
        type: c.challenge.type,
        target: c.challenge.target,
        progress: c.progress,
        startDate: c.challenge.startDate,
        endDate: c.challenge.endDate,
        completed: c.completed,
      })),
      lists: lists.map(l => ({
        name: l.name,
        description: l.description,
        createdAt: l.createdAt,
        books: l.items.map(item => ({
          title: item.book.title,
          author: item.book.author,
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

