import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


// GET : Lister tous les groupes
export async function GET() {
  try {
    const groupes = await prisma.groupe.findMany({
      include: {
        niveau: {
          include: {
            session: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ groupes })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des groupes' },
      { status: 500 }
    )
  }
}

// POST : Créer un groupe
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nom, effectif, type, niveauId } = body

    if (!nom || !effectif || !niveauId) {
      return NextResponse.json(
        { error: 'Le nom, l\'effectif et le niveau sont requis' },
        { status: 400 }
      )
    }

    const groupe = await prisma.groupe.create({
      data: {
        nom,
        effectif: parseInt(effectif),
        type,
        niveauId: parseInt(niveauId),
      },
      include: {
        niveau: {
          include: {
            session: true,
          },
        },
      },
    })

    return NextResponse.json({ groupe })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création du groupe' },
      { status: 500 }
    )
  }
}