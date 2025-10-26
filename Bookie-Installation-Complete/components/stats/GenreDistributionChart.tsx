'use client';

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface UserBook {
  book: {
    genres: string | string[] | null;
  };
  status: string;
}

export default function GenreDistributionChart({ books }: { books: UserBook[] }) {
  const chartData = useMemo(() => {
    const readBooks = books.filter(b => b.status === 'read');
    const genreCounts: { [key: string]: number } = {};

    readBooks.forEach(ub => {
      if (ub.book.genres) {
        // Handle both string (comma-separated) and array formats
        const genresArray = typeof ub.book.genres === 'string'
          ? ub.book.genres.split(',').map(g => g.trim()).filter(g => g)
          : ub.book.genres;

        genresArray.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    // Sort and take top 8 genres
    const sortedGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    const labels = sortedGenres.map(([genre]) => genre);
    const data = sortedGenres.map(([, count]) => count);

    const colors = [
      'rgba(147, 51, 234, 0.8)',   // Purple
      'rgba(219, 39, 119, 0.8)',   // Pink
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Amber
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Violet
      'rgba(236, 72, 153, 0.8)',   // Fuchsia
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  }, [books]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} livres (${percentage}%)`;
          }
        }
      },
    },
  };

  if (chartData.labels.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-wood-500">
        <p>Aucune donnée de genre disponible</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

