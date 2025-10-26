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
  book: {
    pageCount: number;
  };
  dateRead: string | null;
  createdAt: string;
  status: string;
}

export default function ReadingSpeedChart({ books }: { books: UserBook[] }) {
  const chartData = useMemo(() => {
    const readBooks = books.filter(b => b.status === 'read' && b.dateRead && b.book.pageCount > 0);
    
    // Calculate reading time (days between createdAt and dateRead)
    const speedData = readBooks.map(book => {
      const startDate = new Date(book.createdAt);
      const endDate = new Date(book.dateRead!);
      const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const pagesPerDay = Math.round(book.book.pageCount / days);
      
      return {
        pages: book.book.pageCount,
        days,
        pagesPerDay,
      };
    });

    // Group by page ranges
    const ranges = [
      { label: '0-200', min: 0, max: 200 },
      { label: '201-400', min: 201, max: 400 },
      { label: '401-600', min: 401, max: 600 },
      { label: '601+', min: 601, max: Infinity },
    ];

    const averages = ranges.map(range => {
      const booksInRange = speedData.filter(
        b => b.pages >= range.min && b.pages <= range.max
      );
      
      if (booksInRange.length === 0) return 0;
      
      const avgPagesPerDay = booksInRange.reduce((sum, b) => sum + b.pagesPerDay, 0) / booksInRange.length;
      return Math.round(avgPagesPerDay);
    });

    return {
      labels: ranges.map(r => `${r.label} pages`),
      datasets: [
        {
          label: 'Pages par jour',
          data: averages,
          backgroundColor: 'rgba(249, 115, 22, 0.8)',
          borderColor: 'rgb(249, 115, 22)',
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
            return `${context.parsed.y} pages/jour en moyenne`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pages par jour',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}

