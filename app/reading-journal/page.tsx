'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Clock, Heart, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ReadingEntry {
  id: string;
  date: string;
  pagesRead: number;
  timeSpent: number;
  mood: string;
  notes: string;
  userBook: {
    book: {
      title: string;
      authors: string[];
    };
  };
}

export default function ReadingJournalPage() {
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPages: 0,
    totalTime: 0,
    avgPagesPerDay: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/reading-entries', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      happy: '😊',
      excited: '😍',
      neutral: '😐',
      sad: '😢',
      bored: '😴',
      inspired: '✨',
    };
    return moods[mood] || '📖';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wood-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-wood-700">Chargement du journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wood-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-wood-900 mb-2">
            📖 Journal de Lecture
          </h1>
          <p className="text-wood-600">
            Suivez votre progression quotidienne et vos sessions de lecture
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-bold text-purple-600">{stats.totalPages}</span>
            </div>
            <p className="text-sm text-wood-600">Pages lues</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold text-blue-600">{Math.round(stats.totalTime / 60)}h</span>
            </div>
            <p className="text-sm text-wood-600">Temps de lecture</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold text-green-600">{stats.avgPagesPerDay}</span>
            </div>
            <p className="text-sm text-wood-600">Pages/jour (moy.)</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-8 w-8 text-red-600" />
              <span className="text-3xl font-bold text-red-600">{stats.currentStreak}</span>
            </div>
            <p className="text-sm text-wood-600">Jours consécutifs</p>
          </div>
        </div>

        {/* Add Entry Button */}
        <div className="mb-6">
          <Link
            href="/reading-journal/new"
            className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle entrée</span>
          </Link>
        </div>

        {/* Entries List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-wood-900 mb-6">Historique</h2>
          
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucune entrée de lecture pour le moment</p>
              <Link
                href="/reading-journal/new"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Créer votre première entrée →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-wood-900">
                        {entry.userBook.book.title}
                      </h3>
                      <p className="text-sm text-wood-600">
                        {entry.userBook.book.authors.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-wood-600">
                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                      </p>
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-wood-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{entry.pagesRead} pages</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{entry.timeSpent} min</span>
                    </div>
                  </div>

                  {entry.notes && (
                    <p className="text-wood-700 text-sm italic border-l-4 border-purple-300 pl-3">
                      {entry.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}

