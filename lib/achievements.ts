export interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'reading' | 'streak' | 'collection' | 'speed' | 'diversity';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  points: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Reading Achievements
  {
    key: 'first_book',
    name: 'Premier Pas',
    description: 'Lire votre premier livre',
    icon: '📖',
    category: 'reading',
    tier: 'bronze',
    requirement: 1,
    points: 10,
  },
  {
    key: '10_books',
    name: 'Lecteur Débutant',
    description: 'Lire 10 livres',
    icon: '📚',
    category: 'reading',
    tier: 'bronze',
    requirement: 10,
    points: 50,
  },
  {
    key: '50_books',
    name: 'Lecteur Passionné',
    description: 'Lire 50 livres',
    icon: '📕',
    category: 'reading',
    tier: 'silver',
    requirement: 50,
    points: 200,
  },
  {
    key: '100_books',
    name: 'Bibliophile',
    description: 'Lire 100 livres',
    icon: '📗',
    category: 'reading',
    tier: 'gold',
    requirement: 100,
    points: 500,
  },
  {
    key: '500_books',
    name: 'Maître Lecteur',
    description: 'Lire 500 livres',
    icon: '📘',
    category: 'reading',
    tier: 'platinum',
    requirement: 500,
    points: 2000,
  },

  // Streak Achievements
  {
    key: 'streak_7',
    name: 'Semaine de Lecture',
    description: 'Lire pendant 7 jours consécutifs',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
    requirement: 7,
    points: 30,
  },
  {
    key: 'streak_30',
    name: 'Mois de Lecture',
    description: 'Lire pendant 30 jours consécutifs',
    icon: '🌟',
    category: 'streak',
    tier: 'silver',
    requirement: 30,
    points: 150,
  },
  {
    key: 'streak_100',
    name: 'Lecteur Assidu',
    description: 'Lire pendant 100 jours consécutifs',
    icon: '⭐',
    category: 'streak',
    tier: 'gold',
    requirement: 100,
    points: 500,
  },
  {
    key: 'streak_365',
    name: 'Année de Lecture',
    description: 'Lire pendant 365 jours consécutifs',
    icon: '💫',
    category: 'streak',
    tier: 'platinum',
    requirement: 365,
    points: 2000,
  },

  // Collection Achievements
  {
    key: 'library_100',
    name: 'Petite Bibliothèque',
    description: 'Avoir 100 livres dans votre bibliothèque',
    icon: '🏛️',
    category: 'collection',
    tier: 'bronze',
    requirement: 100,
    points: 50,
  },
  {
    key: 'library_500',
    name: 'Grande Bibliothèque',
    description: 'Avoir 500 livres dans votre bibliothèque',
    icon: '🏰',
    category: 'collection',
    tier: 'silver',
    requirement: 500,
    points: 200,
  },
  {
    key: 'library_1000',
    name: 'Bibliothèque Royale',
    description: 'Avoir 1000 livres dans votre bibliothèque',
    icon: '👑',
    category: 'collection',
    tier: 'gold',
    requirement: 1000,
    points: 500,
  },

  // Speed Achievements
  {
    key: 'speed_reader',
    name: 'Lecteur Rapide',
    description: 'Lire un livre de 300+ pages en moins de 3 jours',
    icon: '⚡',
    category: 'speed',
    tier: 'silver',
    requirement: 1,
    points: 100,
  },
  {
    key: 'marathon_reader',
    name: 'Marathon de Lecture',
    description: 'Lire 5 livres en un mois',
    icon: '🏃',
    category: 'speed',
    tier: 'gold',
    requirement: 5,
    points: 200,
  },

  // Diversity Achievements
  {
    key: 'genre_explorer',
    name: 'Explorateur de Genres',
    description: 'Lire des livres de 5 genres différents',
    icon: '🌍',
    category: 'diversity',
    tier: 'bronze',
    requirement: 5,
    points: 50,
  },
  {
    key: 'genre_master',
    name: 'Maître des Genres',
    description: 'Lire des livres de 10 genres différents',
    icon: '🌎',
    category: 'diversity',
    tier: 'silver',
    requirement: 10,
    points: 150,
  },
  {
    key: 'polyglot_reader',
    name: 'Lecteur Polyglotte',
    description: 'Lire des livres en 3 langues différentes',
    icon: '🗣️',
    category: 'diversity',
    tier: 'gold',
    requirement: 3,
    points: 200,
  },
  {
    key: 'world_reader',
    name: 'Lecteur Mondial',
    description: 'Lire des auteurs de 10 pays différents',
    icon: '🌐',
    category: 'diversity',
    tier: 'gold',
    requirement: 10,
    points: 300,
  },

  // Rating Achievements
  {
    key: 'critic',
    name: 'Critique Littéraire',
    description: 'Noter 50 livres',
    icon: '⭐',
    category: 'reading',
    tier: 'silver',
    requirement: 50,
    points: 100,
  },
  {
    key: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Donner une note de 20/20 à un livre',
    icon: '💯',
    category: 'reading',
    tier: 'bronze',
    requirement: 1,
    points: 20,
  },
];

export function calculateUserLevel(totalPoints: number): {
  level: number;
  title: string;
  nextLevelPoints: number;
  progress: number;
} {
  const levels = [
    { level: 1, title: 'Débutant', points: 0 },
    { level: 2, title: 'Lecteur Occasionnel', points: 100 },
    { level: 3, title: 'Lecteur Régulier', points: 300 },
    { level: 4, title: 'Lecteur Passionné', points: 600 },
    { level: 5, title: 'Bibliophile', points: 1000 },
    { level: 6, title: 'Érudit', points: 1500 },
    { level: 7, title: 'Maître Lecteur', points: 2500 },
    { level: 8, title: 'Grand Maître', points: 4000 },
    { level: 9, title: 'Sage Littéraire', points: 6000 },
    { level: 10, title: 'Légende Bibliophile', points: 10000 },
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = 0; i < levels.length; i++) {
    if (totalPoints >= levels[i].points) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
    } else {
      break;
    }
  }

  const progress = nextLevel
    ? ((totalPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100
    : 100;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelPoints: nextLevel.points,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

export function checkAchievements(userStats: {
  booksRead: number;
  totalBooks: number;
  currentStreak: number;
  genresRead: string[];
  languagesRead: string[];
  countriesRead: string[];
  booksRated: number;
  perfectRatings: number;
  fastReads: number;
  monthlyReads: number;
}): string[] {
  const unlockedKeys: string[] = [];

  ACHIEVEMENTS.forEach((achievement) => {
    let unlocked = false;

    switch (achievement.key) {
      case 'first_book':
      case '10_books':
      case '50_books':
      case '100_books':
      case '500_books':
        unlocked = userStats.booksRead >= achievement.requirement;
        break;

      case 'streak_7':
      case 'streak_30':
      case 'streak_100':
      case 'streak_365':
        unlocked = userStats.currentStreak >= achievement.requirement;
        break;

      case 'library_100':
      case 'library_500':
      case 'library_1000':
        unlocked = userStats.totalBooks >= achievement.requirement;
        break;

      case 'speed_reader':
        unlocked = userStats.fastReads >= achievement.requirement;
        break;

      case 'marathon_reader':
        unlocked = userStats.monthlyReads >= achievement.requirement;
        break;

      case 'genre_explorer':
      case 'genre_master':
        unlocked = userStats.genresRead.length >= achievement.requirement;
        break;

      case 'polyglot_reader':
        unlocked = userStats.languagesRead.length >= achievement.requirement;
        break;

      case 'world_reader':
        unlocked = userStats.countriesRead.length >= achievement.requirement;
        break;

      case 'critic':
        unlocked = userStats.booksRated >= achievement.requirement;
        break;

      case 'perfectionist':
        unlocked = userStats.perfectRatings >= achievement.requirement;
        break;
    }

    if (unlocked) {
      unlockedKeys.push(achievement.key);
    }
  });

  return unlockedKeys;
}

