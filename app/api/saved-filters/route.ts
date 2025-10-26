import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

    const filters = await prisma.savedFilter.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ filters });
  } catch (error) {
    console.error('Get saved filters error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des filtres' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const body = await request.json();

    const { name, filters } = body;

    if (!name || !filters) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const savedFilter = await prisma.savedFilter.create({
      data: {
        userId: decoded.userId,
        name,
        filters: JSON.stringify(filters),
      },
    });

    return NextResponse.json({ success: true, filter: savedFilter });
  } catch (error) {
    console.error('Save filter error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du filtre' },
      { status: 500 }
    );
  }
}

