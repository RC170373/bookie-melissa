'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Star, MessageSquare, BookOpen, User } from 'lucide-react'
import Link from 'next/link'

interface Activity {
  id: string
  userId: string
  bookId: string | null
  activityType: string
  content: string | null
  createdAt: string
  user: {
    username: string
    avatar: string | null
  }
  book: {
    title: string
    author: string
    coverUrl: string | null
  } | null
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch activities')

      const { activities } = await response.json()
      setActivities(activities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <MessageSquare className="h-5 w-5 text-blue-600" />
      case 'rating':
        return <Star className="h-5 w-5 text-yellow-600" />
      case 'book_added':
        return <BookOpen className="h-5 w-5 text-green-600" />
      default:
        return <User className="h-5 w-5 text-gray-600" />
    }
  }

  const getActivityText = (activity: Activity) => {
    const username = activity.user?.username || 'Un utilisateur'
    const bookTitle = activity.book?.title || 'un livre'

    switch (activity.activityType) {
      case 'review':
        return (
          <>
            <Link href={`/profile/${activity.userId}`} className="font-semibold hover:text-indigo-600">
              {username}
            </Link>
            {' a chroniqué et commenté '}
            <Link href={`/books/${activity.bookId}`} className="font-semibold hover:text-indigo-600">
              {bookTitle}
            </Link>
          </>
        )
      case 'rating':
        return (
          <>
            <Link href={`/profile/${activity.userId}`} className="font-semibold hover:text-indigo-600">
              {username}
            </Link>
            {' a noté '}
            <Link href={`/books/${activity.bookId}`} className="font-semibold hover:text-indigo-600">
              {bookTitle}
            </Link>
          </>
        )
      case 'book_added':
        return (
          <>
            <Link href={`/profile/${activity.userId}`} className="font-semibold hover:text-indigo-600">
              {username}
            </Link>
            {' a ajouté '}
            <Link href={`/books/${activity.bookId}`} className="font-semibold hover:text-indigo-600">
              {bookTitle}
            </Link>
            {' à sa bibliothèque'}
          </>
        )
      default:
        return activity.content || 'Activité'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune activité récente</p>
        <p className="text-sm text-gray-500 mt-2">
          Soyez le premier à partager vos lectures !
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
          <div className="flex items-start space-x-4">
            <div className="shrink-0">
              {activity.user?.avatar ? (
                <img
                  src={activity.user.avatar}
                  alt={activity.user.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getActivityIcon(activity.activityType)}
                <p className="text-sm text-gray-900">
                  {getActivityText(activity)}
                </p>
              </div>

              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>

              {activity.content && (
                <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {activity.content.length > 200
                    ? `${activity.content.substring(0, 200)}...`
                    : activity.content}
                </div>
              )}
            </div>

            {activity.book?.coverUrl && (
              <div className="shrink-0">
                <img
                  src={activity.book.coverUrl}
                  alt={activity.book.title}
                  className="w-16 h-24 object-cover rounded shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

