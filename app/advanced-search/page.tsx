'use client';

import { useState } from 'react';
import { Search, Filter, Save, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function AdvancedSearchPage() {
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    genre: '',
    minRating: '',
    maxRating: '',
    minPages: '',
    maxPages: '',
    status: '',
    tags: '',
    yearFrom: '',
    yearTo: '',
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/search/advanced?${queryParams}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFilter = async () => {
    const name = prompt('Nom du filtre sauvegardé :');
    if (!name) return;

    try {
      await fetch('/api/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, filters }),
      });
      alert('Filtre sauvegardé !');
    } catch (error) {
      console.error('Save filter error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-wood-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-wood-900 mb-2">
            🔍 Recherche Avancée
          </h1>
          <p className="text-wood-600">
            Trouvez exactement ce que vous cherchez avec des filtres puissants
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-wood-900 flex items-center space-x-2">
              <Filter className="h-6 w-6" />
              <span>Filtres</span>
            </h2>
            <button
              type="button"
              onClick={saveFilter}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
            >
              <Save className="h-5 w-5" />
              <span>Sauvegarder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Rechercher par titre..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">
                Auteur
              </label>
              <input
                type="text"
                value={filters.author}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Nom de l'auteur..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">
                Genre
              </label>
              <input
                type="text"
                value={filters.genre}
                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Genre..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">
                Note minimale
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="0-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">
                Note maximale
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={filters.maxRating}
                onChange={(e) => setFilters({ ...filters, maxRating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="0-20"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-wood-700 mb-1">
                Statut
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tous</option>
                <option value="read">Lu</option>
                <option value="reading">En cours</option>
                <option value="to_read">À lire</option>
                <option value="wishlist">Liste de souhaits</option>
                <option value="pal">PAL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">
                Pages min
              </label>
              <input
                type="number"
                value={filters.minPages}
                onChange={(e) => setFilters({ ...filters, minPages: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">
                Pages max
              </label>
              <input
                type="number"
                value={filters.maxPages}
                onChange={(e) => setFilters({ ...filters, maxPages: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={filters.tags}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="tag1, tag2..."
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="w-full md:w-auto bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-wood-900 mb-6">
            Résultats ({results.length})
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun résultat. Essayez d'autres filtres.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((book: any) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <h3 className="font-bold text-wood-900 mb-1">{book.title}</h3>
                  <p className="text-sm text-wood-600 mb-2">{book.authors?.join(', ')}</p>
                  {book.rating && (
                    <div className="text-sm text-purple-600 font-medium">
                      ⭐ {book.rating}/20
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
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

