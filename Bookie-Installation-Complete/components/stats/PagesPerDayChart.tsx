'use client'

import { useMemo } from 'react'

interface UserBook {
  id: string
  book: {
    pageCount: number
  }
  status: string
  dateRead: string | null
}

interface PagesPerDayChartProps {
  books: UserBook[]
}

export default function PagesPerDayChart({ books }: PagesPerDayChartProps) {
  const pagesPerDayData = useMemo(() => {
    const readBooks = books.filter(b => b.status === 'read' && b.dateRead && b.book.pageCount)
    
    // Group by date
    const pagesByDate: { [key: string]: number } = {}
    
    readBooks.forEach(book => {
      if (!book.dateRead) return
      const date = new Date(book.dateRead)
      const dateKey = date.toISOString().split('T')[0]
      
      if (!pagesByDate[dateKey]) {
        pagesByDate[dateKey] = 0
      }
      pagesByDate[dateKey] += book.book.pageCount || 0
    })
    
    // Get last 30 days
    const last30Days: { date: string; pages: number; label: string }[] = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      
      last30Days.push({
        date: dateKey,
        pages: pagesByDate[dateKey] || 0,
        label
      })
    }
    
    const maxPages = Math.max(...last30Days.map(d => d.pages), 1)
    const totalPages = last30Days.reduce((sum, d) => sum + d.pages, 0)
    const avgPages = Math.round(totalPages / 30)
    
    return { last30Days, maxPages, totalPages, avgPages }
  }, [books])

  const { last30Days, maxPages, totalPages, avgPages } = pagesPerDayData

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{totalPages.toLocaleString()}</p>
          <p className="text-sm text-wood-600">Pages (30j)</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-pink-600">{avgPages}</p>
          <p className="text-sm text-wood-600">Moy/jour</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{maxPages}</p>
          <p className="text-sm text-wood-600">Max/jour</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-1">
        {last30Days.map((day, index) => (
          <div key={day.date} className="flex items-center space-x-2">
            {/* Date label (show every 5 days) */}
            <div className="w-16 text-xs text-wood-500 text-right">
              {index % 5 === 0 ? day.label : ''}
            </div>
            
            {/* Bar */}
            <div className="flex-1 h-6 bg-wood-100 rounded-full overflow-hidden relative">
              {day.pages > 0 && (
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${(day.pages / maxPages) * 100}%` }}
                >
                  {day.pages > 50 && (
                    <span className="text-xs font-medium text-white">
                      {day.pages}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Pages count (if bar is too small) */}
            {day.pages > 0 && day.pages <= 50 && (
              <div className="w-12 text-xs text-wood-600 font-medium">
                {day.pages}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

