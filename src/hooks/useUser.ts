"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  nom: string
  username: string
  mail: string
  role: string
}

export default function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      // Vérifie que localStorage est disponible (côté client uniquement)
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()

        if (res.ok) {
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des infos utilisateur', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  return { user, loading }
}