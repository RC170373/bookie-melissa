import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Count user books
    const userBooksCount = await prisma.userBook.count({
      where: {
        userId: decoded.userId,
      },
    });

    // Count total books in database
    const totalBooksCount = await prisma.book.count();

    return NextResponse.json({
      userBooks: userBooksCount,
      totalBooks: totalBooksCount,
    });
  } catch (error) {
    console.error('Count books error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du comptage' },
      { status: 500 }
    );
  }
}

