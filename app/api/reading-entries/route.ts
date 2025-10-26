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

    const entries = await prisma.readingEntry.findMany({
      where: { userId: decoded.userId },
      include: {
        userBook: {
          include: {
            book: {
              select: {
                title: true,
                author: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    // Calculate stats
    const totalPages = entries.reduce((sum, e) => sum + e.pagesRead, 0);
    const totalTime = entries.reduce((sum, e) => sum + e.timeSpent, 0);
    const avgPagesPerDay = entries.length > 0 ? Math.round(totalPages / entries.length) : 0;

    // Calculate streak
    let currentStreak = 0;
    if (entries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sortedDates = entries
        .map(e => {
          const d = new Date(e.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => b - a);

      if (sortedDates.length > 0) {
        const lastEntry = sortedDates[0];
        const daysSinceLastEntry = (today.getTime() - lastEntry) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastEntry <= 1) {
          currentStreak = 1;
          for (let i = 1; i < sortedDates.length; i++) {
            const dayDiff = (sortedDates[i - 1] - sortedDates[i]) / (1000 * 60 * 60 * 24);
            if (dayDiff === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }
    }

    return NextResponse.json({
      entries,
      stats: {
        totalPages,
        totalTime,
        avgPagesPerDay,
        currentStreak,
      },
    });
  } catch (error) {
    console.error('Get reading entries error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entrées' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const body = await request.json();

    const { userBookId, pagesRead, timeSpent, mood, notes } = body;

    if (!userBookId || !pagesRead || !timeSpent) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const entry = await prisma.readingEntry.create({
      data: {
        userId: decoded.userId,
        userBookId,
        pagesRead: parseInt(pagesRead),
        timeSpent: parseInt(timeSpent),
        mood: mood || 'neutral',
        notes: notes || null,
      },
    });

    // Update userBook progress
    const userBook = await prisma.userBook.findUnique({
      where: { id: userBookId },
      include: { book: true },
    });

    if (userBook) {
      const currentPage = (userBook.currentPage || 0) + parseInt(pagesRead);
      const totalReadingTime = (userBook.totalReadingTime || 0) + parseInt(timeSpent);

      await prisma.userBook.update({
        where: { id: userBookId },
        data: {
          currentPage,
          totalReadingTime,
          status: currentPage >= (userBook.book.pages || 0) ? 'read' : 'reading',
        },
      });
    }

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Create reading entry error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'entrée' },
      { status: 500 }
    );
  }
}

