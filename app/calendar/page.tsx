'use client'

import { useEffect, useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'

interface UserBook {
  id: string
  status: string
  plannedReadDate: string | null
  dateRead: string | null
  book: {
    id: string
    title: string
    author: string
    coverUrl: string | null
    pages: number | null
  }
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  books: UserBook[]
}

export default function CalendarPage() {
  const [user, setUser] = useState<any>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [userBooks, setUserBooks] = useState<UserBook[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        fetchUserBooks()
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setLoading(false)
    }
  }

  const fetchUserBooks = async () => {
    try {
      const response = await fetch('/api/user-books', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        // Filter books with planned dates or read dates
        const booksWithDates = data.userBooks.filter(
          (ub: UserBook) => ub.plannedReadDate || ub.dateRead
        )
        setUserBooks(booksWithDates)
      }
    } catch (error) {
      console.error('Error fetching user books:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    const startingDayOfWeek = firstDay.getDay()
    const days: CalendarDay[] = []

    // Add previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date,
        isCurrentMonth: false,
        books: getBooksForDate(date),
      })
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        books: getBooksForDate(date),
      })
    }

    // Add next month days to complete the grid
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        books: getBooksForDate(date),
      })
    }

    return days
  }

  const getBooksForDate = (date: Date): UserBook[] => {
    const dateStr = date.toISOString().split('T')[0]
    return userBooks.filter((ub) => {
      const plannedDate = ub.plannedReadDate ? new Date(ub.plannedReadDate).toISOString().split('T')[0] : null
      const readDate = ub.dateRead ? new Date(ub.dateRead).toISOString().split('T')[0] : null
      return plannedDate === dateStr || readDate === dateStr
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const calendarDays = generateCalendarDays()

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connectez-vous pour accéder à votre calendrier de lecture
          </h2>
          <p className="text-gray-600 mb-6">
            Planifiez vos lectures et suivez votre progression
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/login"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendrier de Lecture</h1>
        <p className="text-gray-600">
          Visualisez vos lectures planifiées et terminées
        </p>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-purple-50 rounded-lg transition"
            type="button"
            title="Mois précédent"
          >
            <ChevronLeft className="h-6 w-6 text-purple-600" />
          </button>

          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{monthName}</h2>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
              type="button"
            >
              Aujourd&apos;hui
            </button>
          </div>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-purple-50 rounded-lg transition"
            type="button"
            title="Mois suivant"
          >
            <ChevronRight className="h-6 w-6 text-purple-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => day.books.length > 0 && setSelectedDay(day)}
              type="button"
              className={`
                min-h-[100px] p-2 border rounded-lg transition-all
                ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
                ${isToday(day.date) ? 'border-purple-500 border-2 bg-purple-50' : 'border-gray-200'}
                ${day.books.length > 0 ? 'hover:shadow-lg cursor-pointer' : 'cursor-default'}
              `}
            >
              <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>
              {day.books.length > 0 && (
                <div className="space-y-1">
                  {day.books.slice(0, 2).map((book) => (
                    <div
                      key={book.id}
                      className={`text-xs p-1 rounded truncate ${
                        book.dateRead
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                      title={book.book.title}
                    >
                      {book.book.title.length > 15
                        ? book.book.title.substring(0, 15) + '...'
                        : book.book.title}
                    </div>
                  ))}
                  {day.books.length > 2 && (
                    <div className="text-xs text-purple-600 font-medium">
                      +{day.books.length - 2} autre{day.books.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-gray-700">Lecture planifiée</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-gray-700">Livre terminé</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-50 border-2 border-purple-500 rounded"></div>
            <span className="text-gray-700">Aujourd&apos;hui</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {selectedDay.date.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                  type="button"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {selectedDay.books.map((userBook) => (
                <Link
                  key={userBook.id}
                  href={`/books/${userBook.book.id}`}
                  className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-lg transition"
                >
                  {userBook.book.coverUrl ? (
                    <img
                      src={userBook.book.coverUrl}
                      alt={userBook.book.title}
                      className="w-20 h-28 object-cover rounded shadow"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-linear-to-br from-purple-400 to-pink-400 rounded shadow flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{userBook.book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{userBook.book.author}</p>

                    <div className="flex items-center space-x-4 text-sm">
                      {userBook.dateRead && (
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          ✓ Terminé
                        </span>
                      )}
                      {userBook.plannedReadDate && !userBook.dateRead && (
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          <Clock className="h-3 w-3 mr-1" />
                          Planifié
                        </span>
                      )}
                      {userBook.book.pages && (
                        <span className="text-gray-500">{userBook.book.pages} pages</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

