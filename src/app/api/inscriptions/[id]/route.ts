import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET : Récupérer une inscription par son ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inscription = await prisma.inscription.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        groupe: {
          include: {
            niveau: {
              include: {
                session: true,
              },
            },
          },
        },
        eleve: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({ inscription })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'inscription' },
      { status: 500 }
    )
  }
}

// PUT : Modifier une inscription
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { groupeId, eleveId, etatFrais } = body

    if (!groupeId || !eleveId) {
      return NextResponse.json(
        { error: 'Le groupe et l\'étudiant sont requis' },
        { status: 400 }
      )
    }

    // Récupérer l'inscription actuelle pour regénérer le matricule si nécessaire
    const currentInscription = await prisma.inscription.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!currentInscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    // Si le groupe a changé, regénérer le matricule
    let matricule = currentInscription.matricule
    if (currentInscription.groupeId !== parseInt(groupeId)) {
      const groupe = await prisma.groupe.findUnique({
        where: { id: parseInt(groupeId) },
        include: {
          niveau: {
            include: {
              session: true,
            },
          },
        },
      })

      if (groupe) {
        matricule = `${groupe.niveau.session.nom.substring(0, 3).toUpperCase()}-${groupe.niveau.nom.substring(0, 3).toUpperCase()}-${groupe.nom.substring(0, 3).toUpperCase()}-${eleveId.toString().padStart(3, '0')}`
      }
    }

    const inscription = await prisma.inscription.update({
      where: { id: parseInt(params.id) },
      data: {
        groupeId: parseInt(groupeId),
        eleveId: parseInt(eleveId),
        matricule,
        etatFrais: etatFrais || currentInscription.etatFrais,
      },
      include: {
        groupe: {
          include: {
            niveau: {
              include: {
                session: true,
              },
            },
          },
        },
        eleve: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({ inscription })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'inscription' },
      { status: 500 }
    )
  }
}

// DELETE : Supprimer une inscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.inscription.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'inscription' },
      { status: 500 }
    )
  }
}