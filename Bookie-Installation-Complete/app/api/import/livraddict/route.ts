import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Function to fetch book metadata from Google Books API with multiple strategies
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
    const cleanTitle = book.title.split(',')[0].split(':')[0].trim(); // Get main title before subtitle
    strategies.push(`intitle:"${cleanTitle}"`);

    // Try each strategy until we get a result
    for (const searchQuery of strategies) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=3&langRestrict=fr`
        );

        if (!response.ok) continue;

        const data = await response.json();
        if (!data.items || data.items.length === 0) continue;

        // Find the best match
        for (const item of data.items) {
          const volumeInfo = item.volumeInfo;

          // Check if this is a good match
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
      } catch (strategyError) {
        console.error(`Strategy "${searchQuery}" failed:`, strategyError);
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching Google Books metadata:', error);
    return null;
  }
}

// Parse CSV from Livraddict export with proper UTF-8 encoding
function parseLivraddictCSV(text: string): any[] {
  // Fix common UTF-8 encoding issues in Livraddict exports
  // Livraddict exports are often in Windows-1252 (CP1252) encoding
  // These are the actual byte sequences that appear when CP1252 is read as UTF-8
  const fixedText = text
    // Lowercase accented characters
    .replace(/Ã©/g, 'é')   // é (e acute)
    .replace(/Ã¨/g, 'è')   // è (e grave)
    .replace(/Ãª/g, 'ê')   // ê (e circumflex)
    .replace(/Ã«/g, 'ë')   // ë (e diaeresis)
    .replace(/Ã /g, 'à')   // à (a grave)
    .replace(/Ã¢/g, 'â')   // â (a circumflex)
    .replace(/Ã´/g, 'ô')   // ô (o circumflex)
    .replace(/Ã¹/g, 'ù')   // ù (u grave)
    .replace(/Ã»/g, 'û')   // û (u circumflex)
    .replace(/Ã®/g, 'î')   // î (i circumflex)
    .replace(/Ã¯/g, 'ï')   // ï (i diaeresis)
    .replace(/Ã§/g, 'ç')   // ç (c cedilla)
    .replace(/Å\u0093/g, 'œ') // œ (oe ligature)
    // Uppercase accented characters
    .replace(/Ã\u0089/g, 'É')   // É (E acute)
    .replace(/Ã\u0088/g, 'È')   // È (E grave)
    .replace(/Ã\u008A/g, 'Ê')   // Ê (E circumflex)
    .replace(/Ã\u0080/g, 'À')   // À (A grave)
    .replace(/Ã\u0082/g, 'Â')   // Â (A circumflex)
    .replace(/Ã\u0094/g, 'Ô')   // Ô (O circumflex)
    .replace(/Ã\u0099/g, 'Ù')   // Ù (U grave)
    .replace(/Ã\u009B/g, 'Û')   // Û (U circumflex)
    .replace(/Ã\u008E/g, 'Î')   // Î (I circumflex)
    .replace(/Ã\u0087/g, 'Ç')   // Ç (C cedilla)
    .replace(/Å\u0092/g, 'Œ')   // Œ (OE ligature)
    // Fallback for single � character (replacement character)
    .replace(/�/g, 'e');  // Generic fallback

  const lines = fixedText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Auto-detect delimiter (comma, semicolon, or tab)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const books: any[] = [];

  console.log('Detected delimiter:', delimiter);
  console.log('Headers:', headers);

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
      } else if (char === delimiter && !inQuotes) {
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

    // Check if book has a title in any of the possible columns
    // Note: headers are already lowercase, so check lowercase keys
    const hasTitle = Object.keys(book).some(key =>
      (key === 'titre' || key === 'title' || key === 'titre vf' || key === 'titre vo') &&
      book[key] &&
      book[key].trim()
    );

    if (hasTitle) {
      books.push(book);
    }
  }

  console.log('Parsed books:', books.length);
  if (books.length > 0) {
    console.log('First book sample:', books[0]);
  }
  return books;
}

// Map Livraddict fields to our schema
function mapLivraddictBook(livraddictBook: any): any {
  // Common Livraddict field names (case-insensitive matching)
  const getField = (possibleNames: string[]) => {
    for (const name of possibleNames) {
      for (const key in livraddictBook) {
        if (key.toLowerCase() === name.toLowerCase()) {
          const value = livraddictBook[key];
          return value ? String(value).trim() : '';
        }
      }
    }
    return '';
  };

  // Try to get title from multiple possible columns
  let title = getField(['titre', 'title', 'nom', 'name']);
  if (!title) {
    title = getField(['titre vf', 'titre vo']);
  }

  const author = getField(['auteur', 'author', 'auteur(s)', 'auteurs', 'authors']);

  // Clean ISBN - avoid scientific notation
  let isbn = getField(['isbn', 'isbn13', 'isbn10']);
  if (isbn) {
    // Remove all non-digit characters except X (for ISBN-10)
    isbn = isbn.replace(/[^0-9X]/gi, '');
    // If it's too short or too long, it's probably invalid
    if (isbn.length < 10 || isbn.length > 13) {
      isbn = null;
    }
  }

  const publisher = getField(['editeur', 'publisher', 'éditeur']);
  const pages = getField(['pages', 'nb_pages', 'nombre_pages', 'nombre de pages', 'page_count']);
  const year = getField(['annee', 'année', 'year', 'date_publication', 'publication_year', 'ann�e', 'annee']);

  // Try multiple rating columns
  let rating = getField(['note', 'rating', 'notation', 'score']);
  if (!rating) {
    rating = getField(['note personnelle (/20)', 'note personnelle', 'moyenne (/20)']);
  }

  const status = getField(['statut', 'status', 'etat', 'état']);
  const bookType = getField(['type de livre', 'type_livre', 'format']);
  const dateRead = getField(['date_lecture', 'date_read', 'lu_le', 'read_date', 'date de lecture']);
  const datePurchase = getField(['date_achat', "date d'achat", 'date achat', 'purchase_date']);
  const review = getField(['critique', 'review', 'avis', 'commentaire', 'comment', 'commentaires']);
  const notes = getField(['notes', 'note_perso', 'remarques', 'note personnelle']);
  const language = getField(['langue', 'language', 'lang']);
  const collection = getField(['collection', 'série', 'serie', 'saga']);

  // Try multiple genre columns
  let genres = getField(['genre', 'genres', 'categorie', 'catégorie', 'categories']);
  if (!genres) {
    const genre1 = getField(['genre 1']);
    const genre2 = getField(['genre 2']);
    genres = [genre1, genre2].filter(g => g).join(', ');
  }

  console.log('Field extraction:', { title, author, isbn, status, bookType, dateRead, rating, review: review ? `${review.substring(0, 50)}...` : 'NO REVIEW' });
  console.log('Mapped book:', {
    title: title && title.trim() ? title : 'Titre inconnu',
    author: author && author.trim() ? author : 'Auteur inconnu',
    genres: genres,
    hasReview: !!review,
  });

  // Map status - if there's a read date, the book is read
  let mappedStatus = 'to_read';
  if (dateRead && dateRead.trim()) {
    mappedStatus = 'read';
  } else if (status) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('lu') || statusLower.includes('read') || statusLower.includes('terminé')) {
      mappedStatus = 'read';
    } else if (statusLower.includes('cours') || statusLower.includes('reading') || statusLower.includes('en cours')) {
      mappedStatus = 'reading';
    } else if (statusLower.includes('pal') || statusLower.includes('pile')) {
      mappedStatus = 'pal';
    } else if (statusLower.includes('souhait') || statusLower.includes('wish')) {
      mappedStatus = 'wishlist';
    }
  }

  // Parse rating (Livraddict uses 0-20 scale like us)
  let parsedRating = null;
  if (rating) {
    const ratingNum = parseFloat(rating.replace(',', '.'));
    if (!isNaN(ratingNum)) {
      parsedRating = Math.min(20, Math.max(0, ratingNum));
    }
  }

  // Parse genres
  let genreArray: string[] = [];
  if (genres) {
    genreArray = genres.split(/[,;\/]/).map((g: string) => g.trim()).filter((g: string) => g);
  }

  return {
    title: title && title.trim() ? title : 'Titre inconnu',
    author: author && author.trim() ? author : 'Auteur inconnu',
    isbn: isbn && isbn.trim() ? isbn : null,
    publisher: publisher && publisher.trim() ? publisher : null,
    pages: pages && pages.trim() ? parseInt(pages) : null,
    year: year && year.trim() ? parseInt(year) : null,
    rating: parsedRating,
    status: mappedStatus,
    dateRead: dateRead && dateRead.trim() ? dateRead : null,
    datePurchase: datePurchase && datePurchase.trim() ? datePurchase : null,
    review: review && review.trim() ? review : null,
    notes: notes && notes.trim() ? notes : null,
    genres: genreArray,
    language: language && language.trim() ? language : null,
    collection: collection && collection.trim() ? collection : null,
    bookType: bookType && bookType.trim() ? bookType : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

    // Get file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const text = await file.text();
    const livraddictBooks = parseLivraddictCSV(text);

    if (livraddictBooks.length === 0) {
      return NextResponse.json({ error: 'Aucun livre trouvé dans le fichier' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    let duplicates = 0;
    const errors: string[] = [];

    for (const livraddictBook of livraddictBooks) {
      try {
        const mappedBook = mapLivraddictBook(livraddictBook);

        console.log('Mapped book:', mappedBook);

        if (!mappedBook.title || mappedBook.title === 'Titre inconnu') {
          console.log('Skipping book with no title:', livraddictBook);
          skipped++;
          continue;
        }

        // Create or find book
        let book = await prisma.book.findFirst({
          where: {
            OR: [
              ...(mappedBook.isbn ? [{ isbn: mappedBook.isbn }] : []),
              {
                AND: [
                  { title: mappedBook.title },
                  { author: mappedBook.author },
                ],
              },
            ],
          },
        });

        if (!book) {
          // Create the book first
          book = await prisma.book.create({
            data: {
              title: mappedBook.title,
              author: mappedBook.author,
              isbn: mappedBook.isbn,
              publisher: mappedBook.publisher,
              publicationYear: mappedBook.year,
              pages: mappedBook.pages,
              genres: mappedBook.genres.length > 0 ? mappedBook.genres.join(', ') : null,
              language: 'fr',
            },
          });

          // Try to fetch metadata from Google Books API
          const metadata = await fetchGoogleBooksMetadata({
            isbn: mappedBook.isbn,
            title: mappedBook.title,
            author: mappedBook.author,
          });

          if (metadata) {
            // Update book with fetched metadata
            const updateData: any = {};

            if (metadata.coverUrl) {
              updateData.coverUrl = metadata.coverUrl;
            }
            if (metadata.description) {
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
              book = await prisma.book.update({
                where: { id: book.id },
                data: updateData,
              });
            }
          }
        }

        // Check if user already has this book
        const existingUserBook = await prisma.userBook.findFirst({
          where: {
            userId: decoded.userId,
            bookId: book.id,
          },
        });

        if (existingUserBook) {
          console.log('Skipping duplicate book:', mappedBook.title, 'by', mappedBook.author);
          duplicates++;
          skipped++;
          continue;
        }

        // Parse dates - Livraddict format: DD/MM/YYYY HH:MM
        let parsedDateRead = null;
        if (mappedBook.dateRead) {
          try {
            // Try to parse Livraddict date format: "09/01/2024 09:50"
            const dateMatch = mappedBook.dateRead.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (dateMatch) {
              const [, day, month, year] = dateMatch;
              parsedDateRead = new Date(`${year}-${month}-${day}`);
              if (isNaN(parsedDateRead.getTime())) {
                parsedDateRead = null;
              }
            }
          } catch {
            parsedDateRead = null;
          }
        }

        // Build notes with all additional information from Livraddict
        let combinedNotes = '';
        if (mappedBook.notes) {
          combinedNotes += mappedBook.notes;
        }
        if (mappedBook.bookType) {
          combinedNotes += (combinedNotes ? '\n\n' : '') + `Type: ${mappedBook.bookType}`;
        }
        if (mappedBook.collection) {
          combinedNotes += (combinedNotes ? '\n' : '') + `Collection: ${mappedBook.collection}`;
        }
        if (mappedBook.language) {
          combinedNotes += (combinedNotes ? '\n' : '') + `Langue: ${mappedBook.language}`;
        }
        if (mappedBook.datePurchase) {
          combinedNotes += (combinedNotes ? '\n' : '') + `Date d'achat: ${mappedBook.datePurchase}`;
        }

        // Add to user's library with ALL information
        await prisma.userBook.create({
          data: {
            userId: decoded.userId,
            bookId: book.id,
            status: mappedBook.status,
            rating: mappedBook.rating,
            review: mappedBook.review,
            notes: combinedNotes || null,
            dateRead: parsedDateRead,
            manualOverride: mappedBook.rating ? true : false, // Mark as manually rated if rating exists
          },
        });

        imported++;
      } catch (error) {
        console.error('Error importing book:', livraddictBook, error);
        errors.push(`${livraddictBook.titre || livraddictBook.title || 'Unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skipped++;
      }
    }

    // Note: Book covers will need to be fetched separately via Google Books API
    // This can be done by clicking "Update from Google Books" on each book

    console.log(`Import summary: ${imported} imported, ${duplicates} duplicates, ${skipped - duplicates} errors, ${livraddictBooks.length} total`);

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      duplicates,
      errors: skipped - duplicates,
      total: livraddictBooks.length,
      errorMessages: errors.slice(0, 10),
      message: `${imported} livres importés, ${duplicates} doublons ignorés, ${skipped - duplicates} erreurs. Les couvertures seront récupérées automatiquement.`,
    });
  } catch (error) {
    console.error('Import Livraddict error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import' },
      { status: 500 }
    );
  }
}

