import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
// GET : Lister toutes les inscriptions
export async function GET() {
  try {
    const inscriptions = await prisma.inscription.findMany({
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
      orderBy: { dateInscription: 'desc' },
    })

    return NextResponse.json({ inscriptions })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des inscriptions' },
      { status: 500 }
    )
  }
}

// POST : Créer une inscription
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupeId, eleveId, etatFrais } = body

    if (!groupeId || !eleveId) {
      return NextResponse.json(
        { error: 'Le groupe et l\'étudiant sont requis' },
        { status: 400 }
      )
    }

    // Générer un matricule basé sur le groupe
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

    if (!groupe) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }

    const eleve = await prisma.student.findUnique({
      where: { id: parseInt(eleveId) },
    })

    if (!eleve) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      )
    }

    // Générer le matricule : SESSION-NIVEAU-GROUPE-ELEVEID
    const matricule = `${groupe.niveau.session.nom.substring(0, 3).toUpperCase()}-${groupe.niveau.nom.substring(0, 3).toUpperCase()}-${groupe.nom.substring(0, 3).toUpperCase()}-${eleveId.toString().padStart(3, '0')}`

    const inscription = await prisma.inscription.create({
      data: {
        groupeId: parseInt(groupeId),
        eleveId: parseInt(eleveId),
        matricule,
        etatFrais: etatFrais || 'NON_PAYE',
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
      { error: 'Erreur lors de la création de l\'inscription' },
      { status: 500 }
    )
  }
}