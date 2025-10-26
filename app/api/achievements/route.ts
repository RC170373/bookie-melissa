import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { checkAchievements, calculateUserLevel } from '@/lib/achievements';

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { requirement: 'asc' }],
    });

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: decoded.userId },
      include: { achievement: true },
    });

    // Calculate total points
    const totalPoints = userAchievements.reduce((sum, ua) => sum + (ua.achievement?.points || 0), 0);

    // Calculate user level
    let levelInfo;
    try {
      levelInfo = calculateUserLevel(totalPoints);
    } catch (error) {
      levelInfo = { level: 1, name: 'Débutant', minPoints: 0, maxPoints: 100, progress: 0 };
    }

    // Get user stats for checking new achievements
    const userBooks = await prisma.userBook.findMany({
      where: { userId: decoded.userId },
      include: { book: true },
    });

    const readBooks = userBooks.filter(ub => ub.status === 'read');
    const genresRead = [...new Set(readBooks.flatMap(ub => {
      if (!ub.book.genres) return [];
      return typeof ub.book.genres === 'string'
        ? ub.book.genres.split(',').map(g => g.trim()).filter(g => g)
        : ub.book.genres;
    }))];
    const languagesRead = [...new Set(readBooks.map(ub => ub.book.language).filter(Boolean))];
    
    // Calculate streak
    const sortedDates = readBooks
      .filter(ub => ub.dateRead)
      .map(ub => new Date(ub.dateRead!))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let checkDate = new Date(sortedDates[0]);
      checkDate.setHours(0, 0, 0, 0);
      
      if (checkDate.getTime() === today.getTime() || checkDate.getTime() === today.getTime() - 86400000) {
        currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          prevDate.setHours(0, 0, 0, 0);
          const currDate = new Date(sortedDates[i]);
          currDate.setHours(0, 0, 0, 0);
          
          const dayDiff = (prevDate.getTime() - currDate.getTime()) / 86400000;
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Map achievements with unlock status
    const achievementsWithStatus = allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt || null,
        progress: userAchievement?.progress || 0,
      };
    });

    return NextResponse.json({
      achievements: achievementsWithStatus,
      totalPoints,
      level: levelInfo,
      stats: {
        booksRead: readBooks.length,
        totalBooks: userBooks.length,
        currentStreak,
        genresRead: genresRead.length,
        languagesRead: languagesRead.length,
      },
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

    // Check and unlock new achievements
    const userBooks = await prisma.userBook.findMany({
      where: { userId: decoded.userId },
      include: { book: true },
    });

    const readBooks = userBooks.filter(ub => ub.status === 'read');
    const ratedBooks = userBooks.filter(ub => ub.rating !== null);
    const perfectRatings = userBooks.filter(ub => ub.rating === 20);

    // Calculate stats
    const genresRead = [...new Set(readBooks.flatMap(ub => {
      if (!ub.book.genres) return [];
      return typeof ub.book.genres === 'string'
        ? ub.book.genres.split(',').map(g => g.trim()).filter(g => g)
        : ub.book.genres;
    }))];
    const languagesRead = [...new Set(readBooks.map(ub => ub.book.language).filter((lang): lang is string => lang !== null))];
    const countriesRead: string[] = []; // Would need author nationality data

    // Calculate streak (same as above)
    const sortedDates = readBooks
      .filter(ub => ub.dateRead)
      .map(ub => new Date(ub.dateRead!))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let checkDate = new Date(sortedDates[0]);
      checkDate.setHours(0, 0, 0, 0);
      
      if (checkDate.getTime() === today.getTime() || checkDate.getTime() === today.getTime() - 86400000) {
        currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          prevDate.setHours(0, 0, 0, 0);
          const currDate = new Date(sortedDates[i]);
          currDate.setHours(0, 0, 0, 0);
          
          const dayDiff = (prevDate.getTime() - currDate.getTime()) / 86400000;
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate fast reads and monthly reads
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyReads = readBooks.filter(ub => ub.dateRead && new Date(ub.dateRead) >= thirtyDaysAgo).length;

    const fastReads = readBooks.filter(ub => {
      if (!ub.dateRead || !ub.book.pages || ub.book.pages < 300) return false;
      const readDate = new Date(ub.dateRead);
      const addedDate = new Date(ub.createdAt);
      const daysDiff = (readDate.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 3;
    }).length;

    const unlockedKeys = checkAchievements({
      booksRead: readBooks.length,
      totalBooks: userBooks.length,
      currentStreak,
      genresRead,
      languagesRead,
      countriesRead,
      booksRated: ratedBooks.length,
      perfectRatings: perfectRatings.length,
      fastReads,
      monthlyReads,
    });

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany();

    // Get existing user achievements
    const existingAchievements = await prisma.userAchievement.findMany({
      where: { userId: decoded.userId },
    });

    const existingKeys = new Set(existingAchievements.map(ua => {
      const achievement = allAchievements.find(a => a.id === ua.achievementId);
      return achievement?.key;
    }));

    // Unlock new achievements
    const newlyUnlocked = [];
    for (const key of unlockedKeys) {
      if (!existingKeys.has(key)) {
        const achievement = allAchievements.find(a => a.key === key);
        if (achievement) {
          await prisma.userAchievement.create({
            data: {
              userId: decoded.userId,
              achievementId: achievement.id,
              progress: achievement.requirement,
            },
          });
          newlyUnlocked.push(achievement);
        }
      }
    }

    return NextResponse.json({
      success: true,
      newlyUnlocked,
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des achievements' },
      { status: 500 }
    );
  }
}

