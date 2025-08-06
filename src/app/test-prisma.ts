import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  try {
    console.log('Test de Prisma...')
    console.log('Prisma client initialisé')
    console.log('Modèle Session:', prisma.session)
    
    // Tester la création d'une session
    const session = await prisma.session.create({
      data: {
        nom: 'Test depuis Prisma',
        dateDebut: new Date(),
        dateFin: new Date(new Date().setDate(new Date().getDate() + 7)),
        etat: 'EN_COURS',
      },
    })
    
    console.log('Session créée avec succès:', session)
    
    // Tester la lecture des sessions
    const sessions = await prisma.session.findMany()
    console.log('Sessions trouvées:', sessions.length)
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()