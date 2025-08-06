import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { baseUsername } = await request.json()

    if (!baseUsername) {
      return NextResponse.json({ error: 'Username de base requis' }, { status: 400 })
    }

    const suggestions = []
    const existingUsernames = new Set()

    // Récupérer tous les usernames existants qui commencent par la base
    const existingUsers = await prisma.user.findMany({
      where: {
        username: {
          startsWith: baseUsername.toLowerCase()
        }
      },
      select: { username: true }
    })

    existingUsers.forEach(user => existingUsernames.add(user.username))

    // Générer des suggestions
    const base = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    // Suggestions de base
    if (!existingUsernames.has(base)) {
      suggestions.push(base)
    }

    // Suggestions avec nombres
    for (let i = 1; i <= 10; i++) {
      const suggestion = `${base}${i}`
      if (!existingUsernames.has(suggestion)) {
        suggestions.push(suggestion)
      }
    }

    // Suggestions avec des variations
    const variations = [
      `${base}_official`,
      `${base}_${new Date().getFullYear()}`,
      `${base}_user`,
      `the_${base}`,
      `${base}123`
    ]

    variations.forEach(variation => {
      if (!existingUsernames.has(variation) && suggestions.length < 8) {
        suggestions.push(variation)
      }
    })

    return NextResponse.json({
      suggestions: suggestions.slice(0, 8)
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la génération des suggestions' },
      { status: 500 }
    )
  }
}