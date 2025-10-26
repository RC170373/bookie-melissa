'use client'

import { useMemo } from 'react'
import { Target, TrendingUp, Calendar } from 'lucide-react'

interface UserBook {
  id: string
  book: {
    pageCount: number
  }
  status: string
  dateRead: string | null
}

interface ReadingGoalsChartProps {
  books: UserBook[]
}

export default function ReadingGoalsChart({ books }: ReadingGoalsChartProps) {
  const goalStats = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // Books read this year
    const booksThisYear = books.filter(b => {
      if (b.status !== 'read' || !b.dateRead) return false
      const date = new Date(b.dateRead)
      return date.getFullYear() === currentYear
    })
    
    // Books read this month
    const booksThisMonth = booksThisYear.filter(b => {
      const date = new Date(b.dateRead!)
      return date.getMonth() === currentMonth
    })
    
    // Pages this year
    const pagesThisYear = booksThisYear.reduce((sum, b) => sum + (b.book.pageCount || 0), 0)
    
    // Calculate projections
    const dayOfYear = Math.floor((now.getTime() - new Date(currentYear, 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const daysInYear = 365
    const projectedBooksYear = Math.round((booksThisYear.length / dayOfYear) * daysInYear)
    
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const projectedBooksMonth = Math.round((booksThisMonth.length / dayOfMonth) * daysInMonth)
    
    // Suggested goals
    const yearGoal = Math.max(projectedBooksYear, 12) // At least 1 book per month
    const monthGoal = Math.max(projectedBooksMonth, 1)
    
    return {
      booksThisYear: booksThisYear.length,
      booksThisMonth: booksThisMonth.length,
      pagesThisYear,
      projectedBooksYear,
      projectedBooksMonth,
      yearGoal,
      monthGoal,
      yearProgress: (booksThisYear.length / yearGoal) * 100,
      monthProgress: (booksThisMonth.length / monthGoal) * 100,
    }
  }, [books])

  return (
    <div className="space-y-6">
      {/* Year Goal */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-wood-900">Objectif Annuel</h4>
          </div>
          <span className="text-sm text-wood-600">
            {goalStats.booksThisYear} / {goalStats.yearGoal} livres
          </span>
        </div>
        
        <div className="h-8 bg-wood-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 flex items-center justify-center"
            style={{ width: `${Math.min(goalStats.yearProgress, 100)}%` }}
          >
            {goalStats.yearProgress > 10 && (
              <span className="text-xs font-medium text-white">
                {Math.round(goalStats.yearProgress)}%
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-wood-600">
          <span>{goalStats.pagesThisYear.toLocaleString()} pages lues</span>
          <span className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Projection: {goalStats.projectedBooksYear} livres</span>
          </span>
        </div>
      </div>

      {/* Month Goal */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-wood-900">Objectif Mensuel</h4>
          </div>
          <span className="text-sm text-wood-600">
            {goalStats.booksThisMonth} / {goalStats.monthGoal} livres
          </span>
        </div>
        
        <div className="h-8 bg-wood-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 flex items-center justify-center"
            style={{ width: `${Math.min(goalStats.monthProgress, 100)}%` }}
          >
            {goalStats.monthProgress > 10 && (
              <span className="text-xs font-medium text-white">
                {Math.round(goalStats.monthProgress)}%
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-wood-600">
          <span>Ce mois-ci</span>
          <span className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Projection: {goalStats.projectedBooksMonth} livres</span>
          </span>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
        <p className="text-sm text-wood-700">
          {goalStats.yearProgress >= 100 ? (
            <span className="font-semibold text-green-700">
              🎉 Félicitations ! Vous avez atteint votre objectif annuel !
            </span>
          ) : goalStats.yearProgress >= 75 ? (
            <span>
              💪 Excellent ! Plus que <strong>{goalStats.yearGoal - goalStats.booksThisYear} livres</strong> pour atteindre votre objectif !
            </span>
          ) : goalStats.yearProgress >= 50 ? (
            <span>
              📚 Bon rythme ! Continuez comme ça pour atteindre <strong>{goalStats.yearGoal} livres</strong> cette année.
            </span>
          ) : (
            <span>
              🚀 Vous êtes sur la bonne voie ! Projection: <strong>{goalStats.projectedBooksYear} livres</strong> cette année.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

