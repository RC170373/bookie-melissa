'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { BookOpen, Plus, Lock, Globe } from 'lucide-react'
import Link from 'next/link'

interface List {
  id: string
  name: string
  description: string | null
  createdAt: string
  user: {
    username: string
  }
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const client = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { user } = await client.auth.getUser()
    setUser(user)
    fetchLists()
  }

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch lists')

      const { lists } = await response.json()
      setLists(lists || [])
    } catch (error) {
      console.error('Error fetching lists:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Listes de livres</h1>
            <p className="text-gray-600">
              Découvrez les listes créées par la communauté
            </p>
          </div>
          {user && (
            <Link
              href="/lists/create"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Créer une liste</span>
            </Link>
          )}
        </div>
      </div>

      {/* Lists Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune liste pour le moment
          </h3>
          <p className="text-gray-600 mb-6">
            Soyez le premier à créer une liste !
          </p>
          {user && (
            <Link
              href="/lists/create"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Créer une liste</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {list.name}
                </h3>
              </div>
              
              {list.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {list.description}
                </p>
              )}
              
              <p className="text-xs text-gray-500">
                Par {list.user?.username || 'Anonyme'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

