import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        user: {
          select: {
            username: true,
            mail: true,
            role: true,
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Élève non trouvé' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l’élève' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.student.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ message: 'Élève supprimé avec succès' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l’élève' },
      { status: 500 }
    )
  }
}



export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const nom = formData.get('nom') as string
    const prenom = formData.get('prenom') as string
    const dateNaissance = formData.get('dateNaissance') as string
    const adresse = formData.get('adresse') as string
    const cin = formData.get('cin') as string
    const statut = formData.get('statut') as 'ETUDIANT' | 'EMPLOYER'
    const username = formData.get('username') as string
    const mail = formData.get('mail') as string
    const photo = formData.get('photo') as File | null

    let photoPath = ''

    if (photo && photo.size > 0) {
      console.log('Traitement du fichier:', photo.name, photo.size, photo.type)
      
      // Nettoyer le nom du fichier
      const fileName = `${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      
      // Créer le dossier s'il n'existe pas
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true })
        console.log('Dossier uploads créé')
      }
      
      // Sauvegarder le fichier
      const filePath = path.join(uploadDir, fileName)
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
      console.log('Fichier sauvegardé:', filePath)
      
      // Chemin pour la base de données
      photoPath = `/uploads/${fileName}`
      console.log('Chemin pour la BDD:', photoPath)
    }

    // Mettre à jour l'étudiant
    const student = await prisma.student.update({
      where: { id: parseInt(params.id) },
      data: {
        nom,
        prenom,
        dateNaissance: new Date(dateNaissance),
        adresse,
        cin,
        statut,
        ...(photoPath && { photo: photoPath }),
      },
    })

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        username,
        mail,
      },
    })

    return NextResponse.json({ 
      message: 'Élève modifié avec succès',
      photoPath 
    })
  } catch (error) {
    console.error('Erreur détaillée:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l’élève' },
      { status: 500 }
    )
  }
}