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

    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || '';
    const author = searchParams.get('author') || '';
    const genre = searchParams.get('genre') || '';
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const minPages = searchParams.get('minPages');
    const maxPages = searchParams.get('maxPages');
    const status = searchParams.get('status');
    const tags = searchParams.get('tags');

    // Build where clause
    const where: any = {
      userId: decoded.userId,
    };

    if (title) {
      where.book = {
        ...where.book,
        title: { contains: title, mode: 'insensitive' },
      };
    }

    if (author) {
      where.book = {
        ...where.book,
        author: { contains: author, mode: 'insensitive' },
      };
    }

    if (genre) {
      where.book = {
        ...where.book,
        genres: { hasSome: [genre] },
      };
    }

    if (minRating) {
      where.rating = { ...where.rating, gte: parseFloat(minRating) };
    }

    if (maxRating) {
      where.rating = { ...where.rating, lte: parseFloat(maxRating) };
    }

    if (status) {
      where.status = status;
    }

    if (minPages || maxPages) {
      where.book = {
        ...where.book,
        pages: {},
      };
      if (minPages) where.book.pages.gte = parseInt(minPages);
      if (maxPages) where.book.pages.lte = parseInt(maxPages);
    }

    const userBooks = await prisma.userBook.findMany({
      where,
      include: {
        book: true,
      },
      take: 100,
    });

    const results = userBooks.map(ub => ({
      id: ub.book.id,
      title: ub.book.title,
      author: ub.book.author,
      rating: ub.rating,
      status: ub.status,
      pages: ub.book.pages,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}

