import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        book: {
          select: {
            title: true,
            author: true,
            coverUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, bookId, activityType, content } = await request.json()

    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'userId and activityType are required' },
        { status: 400 }
      )
    }

    const activity = await prisma.activity.create({
      data: {
        userId,
        bookId,
        activityType,
        content,
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        book: {
          select: {
            title: true,
            author: true,
            coverUrl: true,
          },
        },
      },
    })

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}

