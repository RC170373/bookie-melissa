'use client';

import { useEffect, useState } from 'react';
import { Globe, Shuffle, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DiscoverPage() {
  const [randomBook, setRandomBook] = useState<any>(null);
  const [trendingBooks, setTrendingBooks] = useState<any[]>([]);
  const [countriesRead, setCountriesRead] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscoveryData();
  }, []);

  const fetchDiscoveryData = async () => {
    try {
      const response = await fetch('/api/discover', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTrendingBooks(data.trending || []);
        setCountriesRead(data.countries || []);
      }
    } catch (error) {
      console.error('Error fetching discovery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomBook = async () => {
    try {
      const response = await fetch('/api/discover/random', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setRandomBook(data.book);
      }
    } catch (error) {
      console.error('Error getting random book:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wood-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-wood-700">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wood-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-wood-900 mb-2">
            🌍 Découverte
          </h1>
          <p className="text-wood-600">
            Explorez de nouveaux horizons littéraires
          </p>
        </div>

        {/* Reading Roulette */}
        <div className="bg-linear-to-br from-purple-600 to-pink-600 rounded-xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Shuffle className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Roulette de Lecture</h2>
          </div>
          <p className="mb-6 opacity-90">
            Laissez le hasard choisir votre prochaine lecture !
          </p>

          {randomBook ? (
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-4">
              <h3 className="text-2xl font-bold mb-2">{randomBook.title}</h3>
              <p className="text-lg opacity-90 mb-4">{randomBook.authors?.join(', ')}</p>
              {randomBook.description && (
                <p className="text-sm opacity-80 line-clamp-3">{randomBook.description}</p>
              )}
              <Link
                href={`/book/${randomBook.id}`}
                className="inline-block mt-4 bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-purple-50 transition"
              >
                Voir le livre →
              </Link>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur rounded-lg p-12 text-center mb-4">
              <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-80" />
              <p className="text-lg opacity-90">Cliquez sur le bouton pour découvrir un livre au hasard</p>
            </div>
          )}

          <button
            type="button"
            onClick={getRandomBook}
            className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition flex items-center justify-center space-x-2"
          >
            <Shuffle className="h-5 w-5" />
            <span>Lancer la roulette</span>
          </button>
        </div>

        {/* World Map */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-wood-900">Carte du Monde Littéraire</h2>
          </div>

          <p className="text-wood-600 mb-6">
            Pays explorés à travers vos lectures : <strong>{countriesRead.length}</strong>
          </p>

          {countriesRead.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {countriesRead.map((country: any) => (
                <div
                  key={country.name}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="text-3xl mb-2">{country.flag || '🌍'}</div>
                  <h3 className="font-bold text-wood-900">{country.name}</h3>
                  <p className="text-sm text-wood-600">{country.count} livre(s)</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Commencez à lire des livres d'auteurs de différents pays pour remplir votre carte !
              </p>
            </div>
          )}
        </div>

        {/* Trending Books */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <h2 className="text-3xl font-bold text-wood-900">Tendances</h2>
          </div>

          {trendingBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingBooks.map((book: any, index: number) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl font-bold text-purple-600">#{index + 1}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-wood-900 mb-1">{book.title}</h3>
                      <p className="text-sm text-wood-600 mb-2">{book.authors?.join(', ')}</p>
                      {book.avgRating && (
                        <div className="text-sm text-purple-600 font-medium">
                          ⭐ {book.avgRating}/20
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune tendance pour le moment</p>
            </div>
          )}
        </div>

        {/* Curated Lists */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-wood-900 mb-6">Listes Curées</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/lists/classics"
              className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 hover:shadow-md transition"
            >
              <h3 className="text-xl font-bold text-wood-900 mb-2">📚 Classiques Incontournables</h3>
              <p className="text-wood-600">Les grands classiques de la littérature mondiale</p>
            </Link>

            <Link
              href="/lists/contemporary"
              className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-md transition"
            >
              <h3 className="text-xl font-bold text-wood-900 mb-2">✨ Contemporains à Découvrir</h3>
              <p className="text-wood-600">Les pépites de la littérature contemporaine</p>
            </Link>

            <Link
              href="/lists/bestsellers"
              className="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 hover:shadow-md transition"
            >
              <h3 className="text-xl font-bold text-wood-900 mb-2">🔥 Best-sellers du Moment</h3>
              <p className="text-wood-600">Les livres les plus populaires actuellement</p>
            </Link>

            <Link
              href="/lists/hidden-gems"
              className="border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 hover:shadow-md transition"
            >
              <h3 className="text-xl font-bold text-wood-900 mb-2">💎 Pépites Méconnues</h3>
              <p className="text-wood-600">Des trésors littéraires à découvrir</p>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}

