'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, TrendingUp, Target, Calendar, Star, Sparkles, Clock, Award } from 'lucide-react'
import WeatherWidget from '@/components/WeatherWidget'

interface ReadingStats {
  totalBooksRead: number
  totalPagesRead: number
  averageRating: number | null
  favoriteGenre: string | null
  booksThisYear: number
  booksThisMonth: number
}

interface UserBook {
  id: string
  status: string
  rating: number | null
  dateRead: Date | null
  plannedReadDate: Date | null
  book: {
    id: string
    title: string
    author: string
    coverUrl: string | null
    genres: string | null
  }
}

interface RecentActivity {
  id: string
  activityType: string
  createdAt: string
  book: {
    title: string
    author: string
    coverUrl: string | null
  } | null
  user: {
    username: string
  }
}

interface Recommendation {
  id: string
  title: string
  author: string
  coverUrl: string | null
  description: string | null
}

interface NewRelease {
  id: string
  title: string
  author: string
  coverUrl: string | null
  publishedDate: string | null
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<ReadingStats | null>(null)
  const [recentBooks, setRecentBooks] = useState<UserBook[]>([])
  const [currentlyReading, setCurrentlyReading] = useState<UserBook[]>([])
  const [plannedBooks, setPlannedBooks] = useState<UserBook[]>([])
  const [topRatedBooks, setTopRatedBooks] = useState<UserBook[]>([])
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [newReleases, setNewReleases] = useState<NewRelease[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        fetchDashboardData()
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch statistics
      const statsRes = await fetch('/api/statistics', { credentials: 'include' })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      }

      // Fetch user books
      const booksRes = await fetch('/api/user-books', { credentials: 'include' })
      if (booksRes.ok) {
        const booksData = await booksRes.json()
        const allBooks = booksData.userBooks || []

        // Recent books (last 5 read)
        const read = allBooks
          .filter((ub: UserBook) => ub.status === 'read')
          .sort((a: UserBook, b: UserBook) => {
            const dateA = a.dateRead ? new Date(a.dateRead).getTime() : 0
            const dateB = b.dateRead ? new Date(b.dateRead).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 5)
        setRecentBooks(read)

        // Currently reading
        const reading = allBooks.filter((ub: UserBook) => ub.status === 'reading')
        setCurrentlyReading(reading)

        // Planned books (sorted by planned date)
        const planned = allBooks
          .filter((ub: UserBook) => ub.plannedReadDate)
          .sort((a: UserBook, b: UserBook) => {
            const dateA = a.plannedReadDate ? new Date(a.plannedReadDate).getTime() : 0
            const dateB = b.plannedReadDate ? new Date(b.plannedReadDate).getTime() : 0
            return dateA - dateB
          })
          .slice(0, 5)
        setPlannedBooks(planned)

        // Top rated books (top 3)
        const topRated = allBooks
          .filter((ub: UserBook) => ub.rating !== null && ub.rating > 0)
          .sort((a: UserBook, b: UserBook) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3)
        setTopRatedBooks(topRated)
      }

      // Fetch recent activities
      const activitiesRes = await fetch('/api/activities', { credentials: 'include' })
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData.activities.slice(0, 5))
      }

      // Fetch recommendations
      const recommendationsRes = await fetch('/api/recommendations?limit=6', { credentials: 'include' })
      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json()
        setRecommendations(recommendationsData.recommendations || [])
      }

      // Fetch new releases
      const newReleasesRes = await fetch('/api/new-releases?limit=6', { credentials: 'include' })
      if (newReleasesRes.ok) {
        const newReleasesData = await newReleasesRes.json()
        setNewReleases(newReleasesData.newReleases || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // If not logged in, show login prompt
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-library-pattern flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="paper-texture rounded-2xl shadow-2xl p-8 text-center border-2 border-purple-200">
            <BookOpen className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-4">
              Bienvenue sur Bookie
            </h1>
            <p className="text-wood-700 mb-6">
              Connectez-vous pour accéder à votre tableau de bord personnel
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login"
                className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/register"
                className="border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition-all font-medium"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-library-pattern flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 animate-pulse text-purple-600 mx-auto mb-4" />
          <p className="text-wood-700 text-lg">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-library-pattern py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-2">
            Bonjour, {user?.username} 👋
          </h1>
          <p className="text-wood-700 text-lg">
            Voici votre tableau de bord de lecture
          </p>
        </div>

        {/* Stats Cards with Weather Widget */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-purple-200 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-bold text-purple-700">{stats?.totalBooksRead || 0}</span>
            </div>
            <p className="text-wood-700 font-medium">Livres lus</p>
            <p className="text-sm text-wood-500">{stats?.booksThisYear || 0} cette année</p>
          </div>

          <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-pink-200 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-pink-600" />
              <span className="text-3xl font-bold text-pink-700">{stats?.totalPagesRead || 0}</span>
            </div>
            <p className="text-wood-700 font-medium">Pages lues</p>
            <p className="text-sm text-wood-500">Total cumulé</p>
          </div>

          <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-yellow-200 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-8 w-8 text-yellow-600" />
              <span className="text-3xl font-bold text-yellow-700">
                {stats?.averageRating ? stats.averageRating.toFixed(1) : '-'}
              </span>
            </div>
            <p className="text-wood-700 font-medium">Note moyenne</p>
            <p className="text-sm text-wood-500">Sur 20</p>
          </div>

          <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">{stats?.favoriteGenre || 'N/A'}</span>
            </div>
            <p className="text-wood-700 font-medium">Genre préféré</p>
            <p className="text-sm text-wood-500">Le plus lu</p>
          </div>

          {/* Weather Widget */}
          <WeatherWidget />
        </div>

        {/* Top 3 des livres les mieux notés */}
        {topRatedBooks.length > 0 && (
          <div className="mb-8 paper-texture rounded-xl p-6 shadow-lg border-2 border-yellow-200">
            <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
              <Award className="h-6 w-6 mr-3 text-yellow-600" />
              🏆 Top 3 des livres les mieux notés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topRatedBooks.map((userBook, index) => (
                <Link
                  key={userBook.id}
                  href={`/books/${userBook.book.id}`}
                  className="group relative"
                >
                  <div className="relative">
                    {/* Podium Badge */}
                    <div className="absolute -top-3 -left-3 z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                      {index === 0 && (
                        <div className="w-full h-full bg-linear-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-xl">
                          🥇
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-full h-full bg-linear-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-xl">
                          🥈
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-full h-full bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-xl">
                          🥉
                        </div>
                      )}
                    </div>

                    {/* Book Cover */}
                    <div className="relative aspect-2/3 mb-3 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all">
                      {userBook.book.coverUrl ? (
                        <img
                          src={userBook.book.coverUrl}
                          alt={userBook.book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-yellow-200 to-orange-200 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-yellow-400" />
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="text-center">
                      <h3 className="font-bold text-wood-900 line-clamp-2 mb-1 group-hover:text-yellow-700 transition">
                        {userBook.book.title}
                      </h3>
                      <p className="text-sm text-wood-600 mb-2">{userBook.book.author}</p>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor((userBook.rating || 0) / 4)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-bold text-yellow-700">
                          {userBook.rating}/20
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Currently Reading */}
            {currentlyReading.length > 0 && (
              <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-purple-200">
                <h2 className="text-2xl font-bold text-wood-900 mb-4 flex items-center">
                  <BookOpen className="h-6 w-6 mr-3 text-purple-700" />
                  En cours de lecture
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentlyReading.map((userBook) => (
                    <Link
                      key={userBook.id}
                      href={`/books/${userBook.book.id}`}
                      className="group"
                    >
                      <div className="relative aspect-2/3 mb-2 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition">
                        {userBook.book.coverUrl ? (
                          <img
                            src={userBook.book.coverUrl}
                            alt={userBook.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-wood-900 group-hover:text-purple-700 transition line-clamp-2 text-sm">
                        {userBook.book.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activities */}
            <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-pink-200">
              <h2 className="text-2xl font-bold text-wood-900 mb-4 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-pink-700" />
                Activité récente
              </h2>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-wood-200 last:border-0">
                      <div className="shrink-0">
                        {activity.book?.coverUrl ? (
                          <img
                            src={activity.book.coverUrl}
                            alt={activity.book.title}
                            className="w-12 h-16 object-cover rounded shadow"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-linear-to-br from-purple-400 to-pink-400 rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-wood-900">
                          <span className="font-semibold">{activity.user.username}</span>
                          {' '}
                          {activity.activityType === 'added_book' && 'a ajouté'}
                          {activity.activityType === 'finished_book' && 'a terminé'}
                          {activity.activityType === 'rated_book' && 'a noté'}
                          {' '}
                          <span className="font-medium">{activity.book?.title}</span>
                        </p>
                        <p className="text-xs text-wood-500 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-wood-600 text-center py-4">Aucune activité récente</p>
                )}
              </div>
            </div>


            {/* Recent Books */}
            {recentBooks.length > 0 && (
              <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-blue-200">
                <h2 className="text-2xl font-bold text-wood-900 mb-4 flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-blue-700" />
                  Derniers livres lus
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {recentBooks.map((userBook) => (
                    <Link
                      key={userBook.id}
                      href={`/books/${userBook.book.id}`}
                      className="group"
                    >
                      <div className="relative aspect-2/3 mb-2 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition">
                        {userBook.book.coverUrl ? (
                          <img
                            src={userBook.book.coverUrl}
                            alt={userBook.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-white" />
                          </div>
                        )}
                        {userBook.rating && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-wood-900 px-2 py-1 rounded-full text-xs font-bold shadow">
                            {userBook.rating}/20
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-wood-900 group-hover:text-blue-700 transition line-clamp-2 text-sm">
                        {userBook.book.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-green-200">
                <h2 className="text-2xl font-bold text-wood-900 mb-4 flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-green-700" />
                  Recommandations pour vous
                </h2>
                <p className="text-wood-600 mb-4 text-sm">
                  Basées sur vos lectures et vos genres préférés
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {recommendations.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="group"
                    >
                      <div className="relative aspect-2/3 mb-2 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-green-400 to-blue-400 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-wood-900 group-hover:text-green-700 transition line-clamp-2 text-sm">
                        {book.title}
                      </h3>
                      <p className="text-xs text-wood-600 truncate">{book.author}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Releases */}
            {newReleases.length > 0 && (
              <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-orange-200">
                <h2 className="text-2xl font-bold text-wood-900 mb-4 flex items-center">
                  <Clock className="h-6 w-6 mr-3 text-orange-700" />
                  Dernières nouveautés
                </h2>
                <p className="text-wood-600 mb-4 text-sm">
                  Les dernières sorties littéraires
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {newReleases.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="group"
                    >
                      <div className="relative aspect-2/3 mb-2 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-orange-400 to-red-400 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-white" />
                          </div>
                        )}
                        {book.publishedDate && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
                            Nouveau
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-wood-900 group-hover:text-orange-700 transition line-clamp-2 text-sm">
                        {book.title}
                      </h3>
                      <p className="text-xs text-wood-600 truncate">{book.author}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Planned Readings */}
            {plannedBooks.length > 0 && (
              <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-green-200">
                <h2 className="text-xl font-bold text-wood-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-700" />
                  Lectures planifiées
                </h2>
                <div className="space-y-3">
                  {plannedBooks.map((userBook) => (
                    <Link
                      key={userBook.id}
                      href={`/books/${userBook.book.id}`}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-green-50 transition group"
                    >
                      <div className="shrink-0">
                        {userBook.book.coverUrl ? (
                          <img
                            src={userBook.book.coverUrl}
                            alt={userBook.book.title}
                            className="w-12 h-16 object-cover rounded shadow"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-linear-to-br from-green-400 to-blue-400 rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-wood-900 group-hover:text-green-700 transition line-clamp-2 text-sm">
                          {userBook.book.title}
                        </h3>
                        <p className="text-xs text-wood-600 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {userBook.plannedReadDate && new Date(userBook.plannedReadDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-purple-200">
              <h2 className="text-xl font-bold text-wood-900 mb-4">Actions rapides</h2>
              <div className="space-y-3">
                <Link
                  href="/bibliomania"
                  className="block w-full bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg text-center font-medium"
                >
                  Ma Bibliothèque
                </Link>
                <Link
                  href="/authors"
                  className="block w-full border-2 border-purple-600 text-purple-600 px-4 py-3 rounded-lg hover:bg-purple-50 transition-all text-center font-medium"
                >
                  Rechercher un auteur
                </Link>
                <Link
                  href="/statistics"
                  className="block w-full border-2 border-pink-600 text-pink-600 px-4 py-3 rounded-lg hover:bg-pink-50 transition-all text-center font-medium"
                >
                  Mes statistiques
                </Link>
              </div>
            </div>

            {/* Reading Goal */}
            <div className="paper-texture rounded-xl p-6 shadow-lg border-2 border-yellow-200">
              <h2 className="text-xl font-bold text-wood-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-yellow-700" />
                Objectif de l'année
              </h2>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-700 mb-2">
                  {stats?.booksThisYear || 0}
                </div>
                <p className="text-wood-700 mb-4">livres lus en {new Date().getFullYear()}</p>
                <div className="w-full bg-wood-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-linear-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(((stats?.booksThisYear || 0) / 50) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-wood-600">Objectif: 50 livres</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}