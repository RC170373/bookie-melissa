import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Enhanced metadata fetching with multiple strategies
async function fetchGoogleBooksMetadata(book: { isbn: string | null; title: string; author: string }) {
  try {
    const strategies = [];

    // Strategy 1: Try ISBN first (most accurate)
    if (book.isbn && book.isbn.length >= 10) {
      strategies.push(`isbn:${book.isbn}`);
    }

    // Strategy 2: Title + Author (exact)
    strategies.push(`intitle:"${book.title}"+inauthor:"${book.author}"`);

    // Strategy 3: Title + Author (fuzzy)
    strategies.push(`intitle:${book.title}+inauthor:${book.author}`);

    // Strategy 4: Just title (last resort)
    const cleanTitle = book.title.split(',')[0].split(':')[0].trim();
    strategies.push(`intitle:"${cleanTitle}"`);

    // Try each strategy
    for (const searchQuery of strategies) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=3&langRestrict=fr`
        );

        if (!response.ok) continue;

        const data = await response.json();
        if (!data.items || data.items.length === 0) continue;

        // Find best match
        for (const item of data.items) {
          const volumeInfo = item.volumeInfo;

          const titleMatch = volumeInfo.title?.toLowerCase().includes(cleanTitle.toLowerCase());
          const authorMatch = volumeInfo.authors?.some((a: string) =>
            a.toLowerCase().includes(book.author.toLowerCase()) ||
            book.author.toLowerCase().includes(a.toLowerCase())
          );

          if (titleMatch || authorMatch || book.isbn) {
            return {
              coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') ||
                        volumeInfo.imageLinks?.smallThumbnail?.replace('http://', 'https://') || null,
              description: volumeInfo.description || null,
              pageCount: volumeInfo.pageCount || null,
              publishedDate: volumeInfo.publishedDate || null,
            };
          }
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Get all books without covers
    const booksWithoutCovers = await prisma.book.findMany({
      where: {
        OR: [
          { coverUrl: null },
          { description: null },
        ],
      },
      take: 100, // Process 100 books at a time
    });

    console.log(`Updating metadata for ${booksWithoutCovers.length} books...`);

    let updated = 0;
    let failed = 0;

    for (const book of booksWithoutCovers) {
      try {
        const metadata = await fetchGoogleBooksMetadata({
          isbn: book.isbn,
          title: book.title,
          author: book.author,
        });

        if (metadata) {
          const updateData: any = {};

          if (metadata.coverUrl && !book.coverUrl) {
            updateData.coverUrl = metadata.coverUrl;
          }
          if (metadata.description && !book.description) {
            updateData.description = metadata.description;
          }
          if (metadata.pageCount && !book.pages) {
            updateData.pages = metadata.pageCount;
          }
          if (metadata.publishedDate && !book.publicationYear) {
            const year = parseInt(metadata.publishedDate.substring(0, 4));
            if (!isNaN(year)) {
              updateData.publicationYear = year;
            }
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.book.update({
              where: { id: book.id },
              data: updateData,
            });
            console.log(`✓ Updated: ${book.title}`);
            updated++;
          }
        } else {
          console.log(`✗ No metadata found: ${book.title}`);
          failed++;
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error updating book ${book.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      failed,
      total: booksWithoutCovers.length,
      message: `${updated} couvertures mises à jour, ${failed} échecs sur ${booksWithoutCovers.length} livres.`,
    });
  } catch (error) {
    console.error('Update metadata error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des métadonnées' },
      { status: 500 }
    );
  }
}

