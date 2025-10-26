'use client'

import { useEffect, useState } from 'react'
import { Trophy, Target, BookOpen, Calendar, CheckCircle, Circle, Plus, X } from 'lucide-react'

interface Challenge {
  id: string
  name: string
  description: string | null
  type: string
  target: number
  startDate: string
  endDate: string
  isActive: boolean
  userChallenge?: {
    progress: number
    completed: boolean
  }
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'books_count',
    target: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges', {
        credentials: 'include',
      })
      const { challenges } = await response.json()
      setChallenges(challenges || [])
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const joinChallenge = async (challengeId: string) => {
    try {
      await fetch('/api/challenges/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
        credentials: 'include',
      })
      fetchChallenges()
    } catch (error) {
      console.error('Error joining challenge:', error)
    }
  }

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({
          name: '',
          description: '',
          type: 'books_count',
          target: '',
          startDate: '',
          endDate: '',
        })
        fetchChallenges()
      }
    } catch (error) {
      console.error('Error creating challenge:', error)
    }
  }

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'books_count':
        return BookOpen
      case 'pages_count':
        return Target
      default:
        return Trophy
    }
  }

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'books_count':
        return 'Livres'
      case 'pages_count':
        return 'Pages'
      case 'genres':
        return 'Genres'
      case 'authors':
        return 'Auteurs'
      default:
        return 'Personnalisé'
    }
  }

  const getProgressPercentage = (challenge: Challenge) => {
    if (!challenge.userChallenge) return 0
    return Math.min((challenge.userChallenge.progress / challenge.target) * 100, 100)
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-library-pattern py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-2">
              Défis de lecture
            </h1>
            <p className="text-wood-700 text-lg">
              Fixez-vous des objectifs et suivez vos réussites
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md font-medium flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Créer un défi
          </button>
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="paper-texture rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-purple-200 rounded mb-4"></div>
                <div className="h-4 bg-purple-200 rounded mb-2"></div>
                <div className="h-4 bg-purple-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="paper-texture rounded-lg p-12 text-center border-2 border-purple-200">
            <Trophy className="h-16 w-16 text-wood-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wood-700 mb-2">
              Aucun défi pour le moment
            </h3>
            <p className="text-wood-600 mb-6">
              Créez votre premier défi de lecture pour commencer
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md font-medium"
            >
              Créer un défi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => {
              const Icon = getChallengeIcon(challenge.type)
              const progress = getProgressPercentage(challenge)
              const daysRemaining = getDaysRemaining(challenge.endDate)
              const isJoined = !!challenge.userChallenge
              const isCompleted = challenge.userChallenge?.completed

              return (
                <div
                  key={challenge.id}
                  className={`paper-texture rounded-lg p-6 shadow-md hover:shadow-xl transition-all border-2 ${
                    isCompleted
                      ? 'border-green-400 bg-green-50'
                      : isJoined
                      ? 'border-purple-300'
                      : 'border-transparent hover:border-purple-200'
                  }`}
                >
                  {/* Challenge Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-purple-100'}`}>
                      <Icon className={`h-6 w-6 ${isCompleted ? 'text-green-700' : 'text-purple-700'}`} />
                    </div>
                    {isCompleted && (
                      <div className="flex items-center text-green-700 font-medium text-sm">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        Terminé
                      </div>
                    )}
                  </div>

                  {/* Challenge Info */}
                  <h3 className="text-xl font-bold text-wood-900 mb-2">
                    {challenge.name}
                  </h3>
                  {challenge.description && (
                    <p className="text-sm text-wood-600 mb-4">
                      {challenge.description}
                    </p>
                  )}

                  {/* Challenge Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-wood-700">
                      <Target className="h-4 w-4 mr-2 text-purple-600" />
                      <span>
                        {challenge.target} {getChallengeTypeLabel(challenge.type)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-wood-700">
                      <Calendar className="h-4 w-4 mr-2 text-pink-600" />
                      <span>
                        {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Terminé'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isJoined && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-wood-700">Progression</span>
                        <span className="text-sm font-bold text-purple-700">
                          {challenge.userChallenge?.progress || 0} / {challenge.target}
                        </span>
                      </div>
                      <div className="w-full bg-wood-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? 'bg-linear-to-r from-green-500 to-green-600'
                              : 'bg-linear-to-r from-purple-600 to-pink-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {!isJoined && challenge.isActive && daysRemaining > 0 && (
                    <button
                      type="button"
                      onClick={() => joinChallenge(challenge.id)}
                      className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md font-medium"
                    >
                      Rejoindre le défi
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="paper-texture rounded-lg max-w-md w-full p-6 shadow-2xl border-2 border-purple-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-wood-900">Créer un défi</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-wood-600 hover:text-wood-900 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Nom du défi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-wood-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Lire 50 livres en 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-wood-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Décrivez votre défi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Type de défi *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-wood-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="books_count">Nombre de livres</option>
                  <option value="pages_count">Nombre de pages</option>
                  <option value="genres">Genres différents</option>
                  <option value="authors">Auteurs différents</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Objectif *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-4 py-2 border border-wood-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: 50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-wood-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-2">
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-wood-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-wood-300 text-wood-700 rounded-lg hover:bg-wood-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md font-medium"
                >
                  Créer le défi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

