'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UserBook {
  dateRead: string | null;
  status: string;
}

export default function YearComparisonChart({ books }: { books: UserBook[] }) {
  const chartData = useMemo(() => {
    const readBooks = books.filter(b => b.status === 'read' && b.dateRead);
    
    // Get unique years
    const years = new Set<number>();
    readBooks.forEach(book => {
      if (book.dateRead) {
        years.add(new Date(book.dateRead).getFullYear());
      }
    });

    const sortedYears = Array.from(years).sort((a, b) => a - b).slice(-5); // Last 5 years

    const counts = sortedYears.map(year => {
      return readBooks.filter(book => {
        if (!book.dateRead) return false;
        return new Date(book.dateRead).getFullYear() === year;
      }).length;
    });

    return {
      labels: sortedYears.map(y => y.toString()),
      datasets: [
        {
          label: 'Livres lus',
          data: counts,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  }, [books]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} livre${context.parsed.y > 1 ? 's' : ''}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  if (chartData.labels.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-wood-500">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}

