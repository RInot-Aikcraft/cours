import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET : Lister tous les niveaux
export async function GET() {
  try {
    const niveaux = await prisma.niveau.findMany({
      include: {
        session: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ niveaux })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des niveaux' },
      { status: 500 }
    )
  }
}

// POST : Créer un niveau
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nom, sessionId } = body

    if (!nom || !sessionId) {
      return NextResponse.json(
        { error: 'Le nom et la session sont requis' },
        { status: 400 }
      )
    }

    const niveau = await prisma.niveau.create({
      data: {
        nom,
        sessionId: parseInt(sessionId),
      },
      include: {
        session: true,
      },
    })

    return NextResponse.json({ niveau })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création du niveau' },
      { status: 500 }
    )
  }
}