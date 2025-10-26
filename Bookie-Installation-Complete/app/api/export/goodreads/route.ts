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

    // Get user's books
    const userBooks = await prisma.userBook.findMany({
      where: { userId: decoded.userId },
      include: {
        book: true,
      },
    });

    // Convert to Goodreads CSV format
    const csvLines = [
      'Book Id,Title,Author,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Average Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Owned Copies'
    ];

    userBooks.forEach((ub, index) => {
      const book = ub.book;
      const rating = ub.rating ? (ub.rating / 2).toFixed(1) : ''; // Convert 0-20 to 0-10
      const shelf = ub.status === 'read' ? 'read' : ub.status === 'reading' ? 'currently-reading' : 'to-read';
      const dateRead = ub.dateRead ? new Date(ub.dateRead).toISOString().split('T')[0] : '';
      const dateAdded = new Date(ub.createdAt).toISOString().split('T')[0];
      
      const line = [
        index + 1, // Book Id
        `"${book.title.replace(/"/g, '""')}"`, // Title
        `"${book.authors.join(', ').replace(/"/g, '""')}"`, // Author
        `"${book.authors.join(', ').replace(/"/g, '""')}"`, // Author l-f
        '', // Additional Authors
        book.isbn || '', // ISBN
        book.isbn13 || '', // ISBN13
        rating, // My Rating
        '', // Average Rating
        book.publisher || '', // Publisher
        '', // Binding
        book.pageCount || '', // Number of Pages
        book.publishedDate ? new Date(book.publishedDate).getFullYear() : '', // Year Published
        book.publishedDate ? new Date(book.publishedDate).getFullYear() : '', // Original Publication Year
        dateRead, // Date Read
        dateAdded, // Date Added
        book.genres.join(', '), // Bookshelves
        '', // Bookshelves with positions
        shelf, // Exclusive Shelf
        `"${(ub.review || '').replace(/"/g, '""')}"`, // My Review
        '', // Spoiler
        `"${(ub.notes || '').replace(/"/g, '""')}"`, // Private Notes
        ub.status === 'read' ? '1' : '0', // Read Count
        '0', // Owned Copies
      ].join(',');
      
      csvLines.push(line);
    });

    const csv = csvLines.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="goodreads_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export Goodreads error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}

