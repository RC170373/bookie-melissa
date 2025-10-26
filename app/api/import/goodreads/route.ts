import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface GoodreadsBook {
  'Book Id': string;
  'Title': string;
  'Author': string;
  'ISBN': string;
  'ISBN13': string;
  'My Rating': string;
  'Publisher': string;
  'Number of Pages': string;
  'Year Published': string;
  'Date Read': string;
  'Date Added': string;
  'Bookshelves': string;
  'Exclusive Shelf': string;
  'My Review': string;
  'Private Notes': string;
}

function parseCSV(text: string): GoodreadsBook[] {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const books: GoodreadsBook[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        if (inQuotes && lines[i][j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const book: any = {};
    headers.forEach((header, index) => {
      book[header] = values[index] || '';
    });
    
    books.push(book as GoodreadsBook);
  }
  
  return books;
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

    // Get CSV content
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const text = await file.text();
    const books = parseCSV(text);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const goodreadsBook of books) {
      try {
        if (!goodreadsBook.Title || !goodreadsBook.Author) {
          skipped++;
          continue;
        }

        // Convert Goodreads shelf to our status
        let status = 'to_read';
        if (goodreadsBook['Exclusive Shelf'] === 'read') status = 'read';
        else if (goodreadsBook['Exclusive Shelf'] === 'currently-reading') status = 'reading';

        // Convert rating from 0-10 to 0-20
        const rating = goodreadsBook['My Rating'] ? parseFloat(goodreadsBook['My Rating']) * 2 : null;

        // Parse dates
        const dateRead = goodreadsBook['Date Read'] ? new Date(goodreadsBook['Date Read']) : null;
        const dateAdded = goodreadsBook['Date Added'] ? new Date(goodreadsBook['Date Added']) : new Date();

        // Parse genres from bookshelves
        const genres = goodreadsBook.Bookshelves
          ? goodreadsBook.Bookshelves.split(',').map(g => g.trim()).filter(g => g)
          : [];

        // Create or find book
        let book = await prisma.book.findFirst({
          where: {
            OR: [
              { isbn: goodreadsBook.ISBN || undefined },
              { isbn13: goodreadsBook.ISBN13 || undefined },
              {
                AND: [
                  { title: goodreadsBook.Title },
                  { authors: { has: goodreadsBook.Author } },
                ],
              },
            ],
          },
        });

        if (!book) {
          book = await prisma.book.create({
            data: {
              title: goodreadsBook.Title,
              authors: [goodreadsBook.Author],
              isbn: goodreadsBook.ISBN || null,
              isbn13: goodreadsBook.ISBN13 || null,
              publisher: goodreadsBook.Publisher || null,
              publishedDate: goodreadsBook['Year Published']
                ? new Date(`${goodreadsBook['Year Published']}-01-01`)
                : null,
              pageCount: goodreadsBook['Number of Pages']
                ? parseInt(goodreadsBook['Number of Pages'])
                : null,
              genres: genres,
              language: 'en',
            },
          });
        }

        // Check if user already has this book
        const existingUserBook = await prisma.userBook.findFirst({
          where: {
            userId: decoded.userId,
            bookId: book.id,
          },
        });

        if (existingUserBook) {
          skipped++;
          continue;
        }

        // Add to user's library
        await prisma.userBook.create({
          data: {
            userId: decoded.userId,
            bookId: book.id,
            status,
            rating,
            review: goodreadsBook['My Review'] || null,
            notes: goodreadsBook['Private Notes'] || null,
            dateRead,
            createdAt: dateAdded,
          },
        });

        imported++;
      } catch (error) {
        console.error('Error importing book:', goodreadsBook.Title, error);
        errors.push(`${goodreadsBook.Title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: books.length,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error) {
    console.error('Import Goodreads error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import' },
      { status: 500 }
    );
  }
}

