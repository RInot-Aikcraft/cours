"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useUser from '@/hooks/useUser'
import Link from 'next/link'

interface Session {
  id: number
  nom: string
  dateDebut: string
  dateFin: string
  etat: string
}

const ETATS = [
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
  { value: 'ANNULEE', label: 'Annulée' },
  { value: 'REPORTER', label: 'Reportée' },
]

export default function EditSessionPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [formData, setFormData] = useState<Session>({
    id: 0,
    nom: '',
    dateDebut: '',
    dateFin: '',
    etat: '',
  })
  const [loadingSession, setLoadingSession] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setFormData({
            id: data.session.id,
            nom: data.session.nom,
            dateDebut: new Date(data.session.dateDebut).toISOString().split('T')[0],
            dateFin: new Date(data.session.dateFin).toISOString().split('T')[0],
            etat: data.session.etat,
          })
        } else {
          setError('Session non trouvée')
        }
      } catch (err) {
        setError('Erreur réseau')
      } finally {
        setLoadingSession(false)
      }
    }

    if (user?.role === 'ADMIN') fetchSession()
  }, [user, loading, router, sessionId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Session modifiée avec succès!')
        setTimeout(() => {
          router.push('/sessions')
        }, 1500)
      } else {
        setError(data.error || 'Erreur lors de la modification')
      }
    } catch (err) {
      setError('Erreur réseau ou serveur')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Modifier la session</h1>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom de la session</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700">Date de début</label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700">Date de fin</label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="etat" className="block text-sm font-medium text-gray-700">État</label>
              <select
                id="etat"
                name="etat"
                value={formData.etat}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded"
              >
                {ETATS.map((etat) => (
                  <option key={etat.value} value={etat.value}>
                    {etat.label}
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
                {isSubmitting ? 'Modification...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}