'use client';

import { useMemo } from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserBook {
  dateRead: string | null;
  status: string;
}

export default function ReadingHeatmap({ books }: { books: UserBook[] }) {
  const heatmapData = useMemo(() => {
    const readBooks = books.filter(b => b.status === 'read' && b.dateRead);
    const today = new Date();
    const startDate = subDays(today, 364); // Last 365 days

    // Count books per day
    const dateCounts: { [key: string]: number } = {};
    readBooks.forEach(book => {
      if (book.dateRead) {
        const dateKey = format(new Date(book.dateRead), 'yyyy-MM-dd');
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
      }
    });

    // Create grid data (weeks x days)
    const weeks: Array<Array<{ date: Date; count: number }>> = [];
    let currentDate = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday

    while (currentDate <= today) {
      const week: Array<{ date: Date; count: number }> = [];
      for (let i = 0; i < 7; i++) {
        const date = addDays(currentDate, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        week.push({
          date,
          count: dateCounts[dateKey] || 0,
        });
      }
      weeks.push(week);
      currentDate = addDays(currentDate, 7);
    }

    return weeks;
  }, [books]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-wood-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    if (count === 3) return 'bg-green-600';
    return 'bg-green-800';
  };

  const maxCount = Math.max(...heatmapData.flat().map(d => d.count));

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-2 ml-8">
          {heatmapData.filter((_, i) => i % 4 === 0).map((week, i) => (
            <div key={i} className="text-xs text-wood-600 w-[60px]">
              {format(week[0].date, 'MMM', { locale: fr })}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col justify-around text-xs text-wood-600 pr-2">
            <div>Lun</div>
            <div>Mer</div>
            <div>Ven</div>
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getColor(day.count)} hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer`}
                    title={`${format(day.date, 'dd MMM yyyy', { locale: fr })}: ${day.count} livre${day.count > 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end mt-4 space-x-2 text-xs text-wood-600">
          <span>Moins</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-wood-100" />
            <div className="w-3 h-3 rounded-sm bg-green-200" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-600" />
            <div className="w-3 h-3 rounded-sm bg-green-800" />
          </div>
          <span>Plus</span>
        </div>

        {/* Stats */}
        <div className="mt-4 text-sm text-wood-600">
          <p>
            Maximum : <span className="font-semibold text-wood-900">{maxCount}</span> livre{maxCount > 1 ? 's' : ''} en une journée
          </p>
        </div>
      </div>
    </div>
  );
}

