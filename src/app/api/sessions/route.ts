import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant ou invalide' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, JWT_SECRET)

    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Erreur détaillée:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant ou invalide' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, JWT_SECRET)

    const { nom, dateDebut, dateFin, etat } = await request.json()
    console.log('Données reçues:', { nom, dateDebut, dateFin, etat })

    const session = await prisma.session.create({
      data: {
        nom,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        etat,
      },
    })

    console.log('Session créée:', session)
    return NextResponse.json(
      { message: 'Session créée avec succès', session },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur détaillée:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
}