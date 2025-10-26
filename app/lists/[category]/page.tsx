'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Star } from 'lucide-react';

const LISTS = {
  classics: {
    title: '📚 Classiques Incontournables',
    description: 'Les grands classiques de la littérature mondiale',
    books: [
      { title: '1984', author: 'George Orwell', year: 1949 },
      { title: 'Orgueil et Préjugés', author: 'Jane Austen', year: 1813 },
      { title: 'Le Comte de Monte-Cristo', author: 'Alexandre Dumas', year: 1844 },
      { title: 'Les Misérables', author: 'Victor Hugo', year: 1862 },
      { title: 'Crime et Châtiment', author: 'Fiodor Dostoïevski', year: 1866 },
      { title: 'Madame Bovary', author: 'Gustave Flaubert', year: 1857 },
    ],
  },
  contemporary: {
    title: '✨ Contemporains à Découvrir',
    description: 'Les pépites de la littérature contemporaine',
    books: [
      { title: 'L\'Élégance du hérisson', author: 'Muriel Barbery', year: 2006 },
      { title: 'La Vérité sur l\'affaire Harry Quebert', author: 'Joël Dicker', year: 2012 },
      { title: 'Trois jours et une vie', author: 'Pierre Lemaitre', year: 2016 },
      { title: 'La Tresse', author: 'Laetitia Colombani', year: 2017 },
      { title: 'Chanson douce', author: 'Leïla Slimani', year: 2016 },
      { title: 'Les Gratitudes', author: 'Delphine de Vigan', year: 2019 },
    ],
  },
  bestsellers: {
    title: '🔥 Best-sellers du Moment',
    description: 'Les livres les plus populaires actuellement',
    books: [
      { title: 'Harry Potter à l\'école des sorciers', author: 'J.K. Rowling', year: 1997 },
      { title: 'Le Seigneur des Anneaux', author: 'J.R.R. Tolkien', year: 1954 },
      { title: 'Hunger Games', author: 'Suzanne Collins', year: 2008 },
      { title: 'Twilight', author: 'Stephenie Meyer', year: 2005 },
      { title: 'Da Vinci Code', author: 'Dan Brown', year: 2003 },
      { title: 'Cinquante nuances de Grey', author: 'E.L. James', year: 2011 },
    ],
  },
  'hidden-gems': {
    title: '💎 Pépites Méconnues',
    description: 'Des trésors littéraires à découvrir',
    books: [
      { title: 'La Horde du Contrevent', author: 'Alain Damasio', year: 2004 },
      { title: 'Le Passe-miroir', author: 'Christelle Dabos', year: 2013 },
      { title: 'La Passe-miroir', author: 'Christelle Dabos', year: 2013 },
      { title: 'Les Furtifs', author: 'Alain Damasio', year: 2019 },
      { title: 'Gagner la guerre', author: 'Jean-Philippe Jaworski', year: 2009 },
      { title: 'La Horde du Contrevent', author: 'Alain Damasio', year: 2004 },
    ],
  },
};

type Category = keyof typeof LISTS;

export default function ListPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params);
  const category = resolvedParams.category as Category;
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const list = LISTS[category];

  useEffect(() => {
    if (list) {
      searchBooksInCatalog();
    }
  }, [category]);

  const searchBooksInCatalog = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        list.books.map(async (book) => {
          const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
              book.title + ' ' + book.author
            )}&maxResults=1`
          );
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const item = data.items[0];
            return {
              id: item.id,
              title: item.volumeInfo.title,
              authors: item.volumeInfo.authors || [book.author],
              description: item.volumeInfo.description,
              coverUrl: item.volumeInfo.imageLinks?.thumbnail,
              year: book.year,
            };
          }
          return {
            title: book.title,
            authors: [book.author],
            year: book.year,
          };
        })
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!list) {
    return (
      <div className="min-h-screen bg-wood-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-heading font-bold text-wood-900 mb-4">
            Liste non trouvée
          </h1>
          <Link href="/discover" className="text-purple-600 hover:text-purple-700">
            ← Retour à la découverte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wood-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          href="/discover"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la découverte
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-wood-900 mb-2">
            {list.title}
          </h1>
          <p className="text-wood-600 text-lg">{list.description}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-wood-700">Chargement des livres...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((book, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {book.coverUrl && (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-wood-900 mb-2">
                    {book.title}
                  </h3>
                  <p className="text-wood-600 mb-2">
                    {book.authors?.join(', ')}
                  </p>
                  {book.year && (
                    <p className="text-sm text-wood-500 mb-4">
                      Publié en {book.year}
                    </p>
                  )}
                  {book.description && (
                    <p className="text-sm text-wood-700 line-clamp-3 mb-4">
                      {book.description}
                    </p>
                  )}
                  {book.id && (
                    <Link
                      href={`/book/${book.id}`}
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Voir les détails
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && searchResults.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun livre trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

