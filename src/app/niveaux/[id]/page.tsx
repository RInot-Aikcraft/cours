"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useUser from '@/hooks/useUser'

interface Niveau {
  id: number
  nom: string
  sessionId: number
}

interface Session {
  id: number
  nom: string
}

export default function EditNiveauPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const params = useParams()
  const niveauId = params.id as string

  const [niveau, setNiveau] = useState<Niveau | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingNiveau, setLoadingNiveau] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchNiveau = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/niveaux/${niveauId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setNiveau(data.niveau)
        }
      } catch (err) {
        setError('Erreur réseau')
      } finally {
        setLoadingNiveau(false)
      }
    }

    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setSessions(data.sessions || [])
        }
      } catch (err) {
        setError('Erreur réseau')
      }
    }

    if (user?.role === 'ADMIN') {
      fetchNiveau()
      fetchSessions()
    }
  }, [user, loading, router, niveauId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (niveau) {
      setNiveau({
        ...niveau,
        [e.target.name]: e.target.name === 'sessionId' ? parseInt(e.target.value) : e.target.value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!niveau) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/niveaux/${niveauId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(niveau),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess('Niveau modifié avec succès !')
        setTimeout(() => router.push('/niveaux'), 1500)
      } else {
        setError(data.error || 'Erreur lors de la modification')
      }
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingNiveau) return <div>Chargement...</div>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Modifier le niveau</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        {niveau && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={niveau.nom}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700">Session</label>
                <select
                  id="sessionId"
                  name="sessionId"
                  value={niveau.sessionId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded"
                >
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}