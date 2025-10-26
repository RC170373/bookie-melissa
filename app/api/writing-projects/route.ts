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

    const projects = await prisma.writingProject.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get writing projects error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
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

    const { title, description, targetWords } = body;

    if (!title || !targetWords) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const project = await prisma.writingProject.create({
      data: {
        userId: decoded.userId,
        title,
        description: description || null,
        targetWords: parseInt(targetWords),
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Create writing project error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}

