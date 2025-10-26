'use client';

import { useEffect, useState } from 'react';
import { Trophy, Award, Star, Lock } from 'lucide-react';
import Link from 'next/link';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  requirement: number;
  points: number;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
}

interface LevelInfo {
  level: number;
  title: string;
  nextLevelPoints: number;
  progress: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements);
        setTotalPoints(data.totalPoints);
        setLevelInfo(data.level);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-orange-400 to-orange-600';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reading':
        return '📚';
      case 'streak':
        return '🔥';
      case 'collection':
        return '🏛️';
      case 'speed':
        return '⚡';
      case 'diversity':
        return '🌍';
      default:
        return '🏆';
    }
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-wood-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-wood-700">Chargement des achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wood-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-wood-900 mb-2">
            🏆 Achievements
          </h1>
          <p className="text-wood-600">
            Débloquez des achievements en lisant et explorant de nouveaux livres
          </p>
        </div>

        {/* Level Card */}
        {levelInfo && (
          <div className="bg-linear-to-br from-purple-600 to-pink-600 rounded-xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Trophy className="h-8 w-8" />
                  <h2 className="text-3xl font-bold">Niveau {levelInfo.level}</h2>
                </div>
                <p className="text-2xl font-heading">{levelInfo.title}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{totalPoints}</p>
                <p className="text-sm opacity-90">Points</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-full h-4 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <p className="text-sm mt-2 opacity-90">
              {levelInfo.nextLevelPoints - totalPoints} points jusqu'au niveau suivant
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-wood-900">{unlockedCount}</p>
            <p className="text-sm text-wood-600">Débloqués</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-wood-900">{achievements.length}</p>
            <p className="text-sm text-wood-600">Total</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-wood-900">{totalPoints}</p>
            <p className="text-sm text-wood-600">Points</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mx-auto mb-2">📊</div>
            <p className="text-2xl font-bold text-wood-900">
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </p>
            <p className="text-sm text-wood-600">Progression</p>
          </div>
        </div>

        {/* Achievements by Category */}
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-wood-900 mb-4 flex items-center space-x-2">
              <span className="text-3xl">{getCategoryIcon(category)}</span>
              <span className="capitalize">{category}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-lg shadow-lg p-6 transition-all hover:scale-105 ${
                    achievement.unlocked ? 'border-2 border-green-400' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{achievement.icon}</div>
                    {achievement.unlocked ? (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                        ✓ Débloqué
                      </div>
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-wood-900 mb-1">{achievement.name}</h3>
                  <p className="text-sm text-wood-600 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <div className={`bg-linear-to-r ${getTierColor(achievement.tier)} text-white px-3 py-1 rounded-full text-xs font-bold capitalize`}>
                      {achievement.tier}
                    </div>
                    <div className="text-sm font-bold text-purple-600">
                      +{achievement.points} pts
                    </div>
                  </div>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}

