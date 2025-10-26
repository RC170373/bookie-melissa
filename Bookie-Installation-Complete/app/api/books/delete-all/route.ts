import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Delete all user books first (foreign key constraint)
    const deletedUserBooks = await prisma.userBook.deleteMany({
      where: {
        userId: decoded.userId,
      },
    });

    // Then delete all books (optional - only if you want to clean the entire database)
    // For now, we'll just delete user books to allow reimport
    
    return NextResponse.json({
      success: true,
      deletedUserBooks: deletedUserBooks.count,
      message: `${deletedUserBooks.count} livres supprimés de votre bibliothèque`,
    });
  } catch (error) {
    console.error('Delete all books error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

