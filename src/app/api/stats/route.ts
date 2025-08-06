import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userCount = await prisma.user.count()
    const newUserCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    })

    const stats = [
      {
        title: 'Total utilisateurs',
        value: userCount,
        description: '+12% depuis le mois dernier',
        icon: '👥',
      },
      {
        title: 'Nouveaux cette semaine',
        value: newUserCount,
        description: '+5% depuis la semaine dernière',
        icon: '📈',
      },
    ]

    return NextResponse.json({ stats })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}