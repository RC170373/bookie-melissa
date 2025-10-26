'use client'

import { useEffect, useState } from 'react'
import { BookOpen, TrendingUp, Award, Calendar, Clock, Star, BarChart3, Target, PieChart as PieChartIcon } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'

interface ReadingStats {
  totalBooksRead: number
  totalPagesRead: number
  totalReadingTime: number
  averageRating: number | null
  favoriteGenre: string | null
  booksThisYear: number
  booksThisMonth: number
  currentStreak: number
  longestStreak: number
}

interface GenreStats {
  genre: string
  count: number
  percentage: number
  [key: string]: string | number
}

interface MonthlyStats {
  month: string
  booksRead: number
}

interface RatingData {
  title: string
  rating: number
  pages: number
  dateRead: string
}

interface AuthorRanking {
  author: string
  averageRating: number
  booksRead: number
  books: string[]
}

interface GenreRanking {
  genre: string
  averageRating: number
  booksRead: number
}

interface CountryData {
  country: string
  count: number
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<ReadingStats | null>(null)
  const [genreStats, setGenreStats] = useState<GenreStats[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [ratingData, setRatingData] = useState<RatingData[]>([])
  const [authorRankings, setAuthorRankings] = useState<AuthorRanking[]>([])
  const [genreRankings, setGenreRankings] = useState<GenreRanking[]>([])
  const [countryData, setCountryData] = useState<CountryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
    fetchRatingData()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics', {
        credentials: 'include',
      })
      const data = await response.json()
      setStats(data.stats)
      setGenreStats(data.genreStats || [])
      setMonthlyStats(data.monthlyStats || [])
      setAuthorRankings(data.authorRankings || [])
      setGenreRankings(data.genreRankings || [])
      setCountryData(data.countryData || [])
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRatingData = async () => {
    try {
      const response = await fetch('/api/user-books?status=read', {
        credentials: 'include',
      })
      const data = await response.json()

      const ratings = data.userBooks
        .filter((ub: any) => ub.rating && ub.book)
        .map((ub: any, index: number) => ({
          title: ub.book.title,
          rating: ub.rating,
          pages: ub.book.pages || 300,
          dateRead: ub.dateRead || new Date().toISOString(),
          index: index + 1,
        }))

      setRatingData(ratings)
    } catch (error) {
      console.error('Error fetching rating data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-library-pattern py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-purple-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="paper-texture rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      icon: BookOpen,
      label: 'Livres lus',
      value: stats?.totalBooksRead || 0,
      color: 'purple',
    },
    {
      icon: TrendingUp,
      label: 'Pages lues',
      value: stats?.totalPagesRead?.toLocaleString() || 0,
      color: 'pink',
    },
    {
      icon: Clock,
      label: 'Temps de lecture',
      value: `${Math.floor((stats?.totalReadingTime || 0) / 60)}h`,
      color: 'purple',
    },
    {
      icon: Star,
      label: 'Note moyenne',
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : 'N/A',
      color: 'pink',
    },
    {
      icon: Calendar,
      label: 'Livres cette année',
      value: stats?.booksThisYear || 0,
      color: 'purple',
    },
    {
      icon: Target,
      label: 'Livres ce mois',
      value: stats?.booksThisMonth || 0,
      color: 'pink',
    },
    {
      icon: Award,
      label: 'Série actuelle',
      value: `${stats?.currentStreak || 0} jours`,
      color: 'purple',
    },
    {
      icon: BarChart3,
      label: 'Plus longue série',
      value: `${stats?.longestStreak || 0} jours`,
      color: 'pink',
    },
  ]

  return (
    <div className="min-h-screen bg-library-pattern py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-2">
            Statistiques de lecture
          </h1>
          <p className="text-wood-700 text-lg">
            Suivez votre parcours de lecture et vos réussites
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={index}
                className="paper-texture rounded-lg p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.color === 'purple' ? 'bg-purple-100' : 'bg-pink-100'}`}>
                    <Icon className={`h-6 w-6 ${card.color === 'purple' ? 'text-purple-700' : 'text-pink-700'}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-wood-900 mb-1">
                  {card.value}
                </div>
                <div className="text-sm text-wood-600 font-medium">
                  {card.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Reading Performance Radar */}
        {stats && (
          <div className="paper-texture rounded-lg p-6 shadow-md mb-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
              <Target className="h-6 w-6 mr-3 text-purple-700" />
              Performance de lecture
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart
                data={[
                  {
                    metric: 'Livres lus',
                    value: Math.min((stats.totalBooksRead / 100) * 100, 100),
                  },
                  {
                    metric: 'Pages lues',
                    value: Math.min((stats.totalPagesRead / 10000) * 100, 100),
                  },
                  {
                    metric: 'Note moyenne',
                    value: (stats.averageRating || 0) * 5,
                  },
                  {
                    metric: 'Cette année',
                    value: Math.min((stats.booksThisYear / 50) * 100, 100),
                  },
                  {
                    metric: 'Ce mois',
                    value: Math.min((stats.booksThisMonth / 10) * 100, 100),
                  },
                  {
                    metric: 'Série actuelle',
                    value: Math.min((stats.currentStreak / 30) * 100, 100),
                  },
                ]}
              >
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#9333ea"
                  fill="#db2777"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Favorite Genre */}
        {stats?.favoriteGenre && (
          <div className="paper-texture rounded-lg p-6 shadow-md mb-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-wood-900 mb-4 flex items-center">
              <Award className="h-6 w-6 mr-3 text-purple-700" />
              Genre préféré
            </h2>
            <div className="text-4xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              {stats.favoriteGenre}
            </div>
          </div>
        )}

        {/* Genre Distribution - Pie Chart & Bar Chart */}
        {genreStats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart */}
            <div className="paper-texture rounded-lg p-6 shadow-md border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <PieChartIcon className="h-6 w-6 mr-3 text-purple-700" />
                Répartition par genre
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genreStats}
                    dataKey="count"
                    nameKey="genre"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ genre, percentage }: any) => `${genre} (${percentage.toFixed(0)}%)`}
                  >
                    {genreStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#9333ea', '#db2777', '#7e22ce', '#be185d', '#a855f7', '#ec4899'][index % 6]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="paper-texture rounded-lg p-6 shadow-md border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <BarChart3 className="h-6 w-6 mr-3 text-pink-700" />
                Livres par genre
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={genreStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="genre" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#db2777" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Monthly Reading Activity - Line & Area Charts */}
        {monthlyStats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Line Chart */}
            <div className="paper-texture rounded-lg p-6 shadow-md border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-purple-700" />
                Évolution mensuelle
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="booksRead"
                    stroke="#9333ea"
                    strokeWidth={3}
                    dot={{ fill: '#db2777', r: 6 }}
                    activeDot={{ r: 8 }}
                    name="Livres lus"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart */}
            <div className="paper-texture rounded-lg p-6 shadow-md border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-3 text-pink-700" />
                Activité de lecture
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="booksRead"
                    stroke="#db2777"
                    strokeWidth={2}
                    fill="url(#colorArea)"
                    name="Livres lus"
                  />
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#db2777" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#db2777" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Rating Scatter Plot */}
        {ratingData.length > 0 && (
          <div className="paper-texture rounded-lg p-6 shadow-md mb-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
              <Star className="h-6 w-6 mr-3 text-purple-700" />
              Nuage de points - Notations
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="index"
                  name="Livre"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Livres lus', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                  type="number"
                  dataKey="rating"
                  name="Note"
                  domain={[0, 20]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Note /20', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis type="number" dataKey="pages" range={[50, 400]} name="Pages" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-purple-200">
                          <p className="font-bold text-wood-900 mb-2">{data.title}</p>
                          <p className="text-sm text-wood-700">Note: {data.rating}/20</p>
                          <p className="text-sm text-wood-700">Pages: {data.pages}</p>
                          <p className="text-xs text-wood-500 mt-1">
                            Lu le: {new Date(data.dateRead).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Scatter
                  name="Livres notés"
                  data={ratingData}
                  fill="#9333ea"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-sm text-wood-600 mt-4 text-center">
              La taille des points représente le nombre de pages du livre
            </p>
          </div>
        )}

        {/* Author Rankings */}
        {authorRankings.length > 0 && (
          <div className="paper-texture rounded-lg p-6 shadow-lg border-2 border-purple-200 mb-8">
            <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
              <Award className="h-6 w-6 mr-3 text-purple-700" />
              Classement des auteurs par notation
            </h2>
            <div className="space-y-3">
              {authorRankings.slice(0, 10).map((author, index) => (
                <div
                  key={author.author}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-purple-50 transition"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-wood-900 truncate">{author.author}</h3>
                      <p className="text-sm text-wood-600">
                        {author.booksRead} {author.booksRead === 1 ? 'livre lu' : 'livres lus'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xl font-bold text-purple-700">
                      {author.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-wood-600">/20</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genre Rankings */}
        {genreRankings.length > 0 && (
          <div className="paper-texture rounded-lg p-6 shadow-lg border-2 border-pink-200 mb-8">
            <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-pink-700" />
              Classement des genres par notation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {genreRankings.slice(0, 10).map((genre, index) => (
                <div
                  key={genre.genre}
                  className="flex items-center justify-between p-4 rounded-lg bg-pink-50 hover:bg-pink-100 transition"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-linear-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-wood-900 truncate">{genre.genre}</h3>
                      <p className="text-xs text-wood-600">
                        {genre.booksRead} {genre.booksRead === 1 ? 'livre' : 'livres'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-bold text-pink-700">
                      {genre.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* World Map of Authors */}
        {countryData.length > 0 && (
          <div className="paper-texture rounded-lg p-6 shadow-lg border-2 border-blue-200 mb-8">
            <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-blue-700" />
              Carte du monde des auteurs lus
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {countryData
                .sort((a, b) => b.count - a.count)
                .map((country) => {
                  // Calculate color intensity based on count
                  const maxCount = Math.max(...countryData.map((c) => c.count))
                  const intensity = (country.count / maxCount) * 100
                  const bgColor = intensity > 75 ? 'bg-blue-700' : intensity > 50 ? 'bg-blue-500' : intensity > 25 ? 'bg-blue-300' : 'bg-blue-100'
                  const textColor = intensity > 50 ? 'text-white' : 'text-wood-900'

                  return (
                    <div
                      key={country.country}
                      className={`${bgColor} ${textColor} rounded-lg p-4 shadow-md hover:shadow-lg transition`}
                    >
                      <h3 className="font-bold text-lg mb-1">{country.country}</h3>
                      <p className="text-sm opacity-90">
                        {country.count} {country.count === 1 ? 'auteur' : 'auteurs'}
                      </p>
                    </div>
                  )
                })}
            </div>
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-wood-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                <span>1-25%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-300 rounded"></div>
                <span>26-50%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>51-75%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-700 rounded"></div>
                <span>76-100%</span>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!stats || stats.totalBooksRead === 0 ? (
          <div className="paper-texture rounded-lg p-12 text-center border-2 border-purple-200">
            <BookOpen className="h-16 w-16 text-wood-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wood-700 mb-2">
              Aucune donnée de lecture pour le moment
            </h3>
            <p className="text-wood-600 mb-6">
              Commencez à ajouter des livres à votre bibliothèque pour voir vos statistiques
            </p>
            <a
              href="/bibliomania"
              className="inline-block bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md font-medium"
            >
              Aller à ma bibliothèque
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )
}

