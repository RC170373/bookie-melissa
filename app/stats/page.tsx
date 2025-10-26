'use client';

import { useEffect, useState } from 'react';
import { BarChart, TrendingUp, PieChart, Calendar, Clock, BookOpen, User, Star, Target } from 'lucide-react';
import ReadingHeatmap from '@/components/stats/ReadingHeatmap';
import BooksPerMonthChart from '@/components/stats/BooksPerMonthChart';
import GenreDistributionChart from '@/components/stats/GenreDistributionChart';
import ReadingSpeedChart from '@/components/stats/ReadingSpeedChart';
import YearComparisonChart from '@/components/stats/YearComparisonChart';
import PagesPerDayChart from '@/components/stats/PagesPerDayChart';
import AuthorStatsChart from '@/components/stats/AuthorStatsChart';
import RatingDistributionChart from '@/components/stats/RatingDistributionChart';
import ReadingGoalsChart from '@/components/stats/ReadingGoalsChart';

interface UserBook {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    authors: string[];
    pageCount: number;
    pages: number;
    genres: string[];
  };
  status: string;
  rating: number | null;
  dateRead: string | null;
  createdAt: string;
}

export default function StatsPage() {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksRead: 0,
    totalPages: 0,
    averageRating: 0,
    readingStreak: 0,
    booksThisYear: 0,
    booksThisMonth: 0,
    averagePagesPerDay: 0,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/user-books?status=all');
      if (response.ok) {
        const data = await response.json();
        setBooks(data.userBooks || []);
        calculateStats(data.userBooks || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userBooks: UserBook[]) => {
    const readBooks = userBooks.filter(ub => ub.status === 'read');
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    const booksThisYear = readBooks.filter(ub => {
      if (!ub.dateRead) return false;
      return new Date(ub.dateRead).getFullYear() === thisYear;
    }).length;

    const booksThisMonth = readBooks.filter(ub => {
      if (!ub.dateRead) return false;
      const date = new Date(ub.dateRead);
      return date.getFullYear() === thisYear && date.getMonth() === thisMonth;
    }).length;

    const totalPages = readBooks.reduce((sum, ub) => sum + (ub.book.pageCount || 0), 0);
    
    const ratedBooks = readBooks.filter(ub => ub.rating !== null);
    const averageRating = ratedBooks.length > 0
      ? ratedBooks.reduce((sum, ub) => sum + (ub.rating || 0), 0) / ratedBooks.length
      : 0;

    // Calculate reading streak
    const sortedDates = readBooks
      .filter(ub => ub.dateRead)
      .map(ub => new Date(ub.dateRead!))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        date.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak || (i === 0 && diffDays <= 1)) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Average pages per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBooks = readBooks.filter(ub => {
      if (!ub.dateRead) return false;
      return new Date(ub.dateRead) >= thirtyDaysAgo;
    });
    
    const recentPages = recentBooks.reduce((sum, ub) => sum + (ub.book.pageCount || 0), 0);
    const averagePagesPerDay = Math.round(recentPages / 30);

    setStats({
      totalBooks: userBooks.length,
      booksRead: readBooks.length,
      totalPages,
      averageRating: Math.round(averageRating * 10) / 10,
      readingStreak: streak,
      booksThisYear,
      booksThisMonth,
      averagePagesPerDay,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wood-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-wood-700">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wood-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-wood-900 mb-2">
            📊 Statistiques de Lecture
          </h1>
          <p className="text-wood-600 font-body">
            Analysez vos habitudes de lecture et suivez votre progression
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Livres Lus"
            value={stats.booksRead}
            subtitle={`sur ${stats.totalBooks} total`}
            color="purple"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Pages Lues"
            value={stats.totalPages.toLocaleString()}
            subtitle={`${stats.averagePagesPerDay} pages/jour`}
            color="pink"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            title="Cette Année"
            value={stats.booksThisYear}
            subtitle={`${stats.booksThisMonth} ce mois-ci`}
            color="green"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            title="Série de Lecture"
            value={`${stats.readingStreak} jours`}
            subtitle={stats.averageRating > 0 ? `Note moy: ${stats.averageRating}/20` : 'Pas de notes'}
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Books Per Month */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-heading font-semibold text-wood-900">
                Livres par Mois
              </h2>
            </div>
            <BooksPerMonthChart books={books} />
          </div>

          {/* Genre Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200">
            <div className="flex items-center space-x-2 mb-4">
              <PieChart className="h-5 w-5 text-pink-600" />
              <h2 className="text-xl font-heading font-semibold text-wood-900">
                Distribution des Genres
              </h2>
            </div>
            <GenreDistributionChart books={books} />
          </div>
        </div>

        {/* Reading Heatmap */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-heading font-semibold text-wood-900">
              Calendrier de Lecture (365 jours)
            </h2>
          </div>
          <ReadingHeatmap books={books} />
        </div>

        {/* Additional Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Reading Speed */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-heading font-semibold text-wood-900">
                Vitesse de Lecture
              </h2>
            </div>
            <ReadingSpeedChart books={books} />
          </div>

          {/* Year Comparison */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-heading font-semibold text-wood-900">
                Comparaison Annuelle
              </h2>
            </div>
            <YearComparisonChart books={books} />
          </div>
        </div>

        {/* Pages Per Day Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-heading font-semibold text-wood-900">
              Pages Lues par Jour (30 derniers jours)
            </h2>
          </div>
          <PagesPerDayChart books={books} />
        </div>

        {/* Additional Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Author Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-heading font-semibold text-wood-900">
                Top Auteurs
              </h2>
            </div>
            <AuthorStatsChart books={books} />
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-yellow-600" />
              <h2 className="text-xl font-heading font-semibold text-wood-900">
                Distribution des Notes
              </h2>
            </div>
            <RatingDistributionChart books={books} />
          </div>

          {/* Reading Goals */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-heading font-semibold text-wood-900">
                Objectifs de Lecture
              </h2>
            </div>
            <ReadingGoalsChart books={books} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'purple' | 'pink' | 'green' | 'orange';
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-wood-200 hover:shadow-xl transition-shadow">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-wood-600 mb-1">{title}</h3>
      <p className="text-3xl font-heading font-bold text-wood-900 mb-1">{value}</p>
      <p className="text-sm text-wood-500">{subtitle}</p>
    </div>
  );
}

