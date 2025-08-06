"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useUser from '@/hooks/useUser'

interface Groupe {
  id: number
  nom: string
  effectif: number
  type: 'LOCAL' | 'EN_LIGNE' | 'HYBRIDE'
  niveauId: number
}

interface Niveau {
  id: number
  nom: string
  session: {
    id: number
    nom: string
  }
}

export default function EditGroupePage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const params = useParams()
  const groupeId = params.id as string

  const [groupe, setGroupe] = useState<Groupe | null>(null)
  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [loadingGroupe, setLoadingGroupe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchGroupe = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/groupes/${groupeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setGroupe(data.groupe)
        } else {
          setError('Groupe non trouvé')
        }
      } catch (err) {
        setError('Erreur réseau')
      } finally {
        setLoadingGroupe(false)
      }
    }

    const fetchNiveaux = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/niveaux', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setNiveaux(data.niveaux || [])
        }
      } catch (err) {
        setError('Erreur réseau')
      }
    }

    if (user?.role === 'ADMIN') {
      fetchGroupe()
      fetchNiveaux()
    }
  }, [user, loading, router, groupeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (groupe) {
      setGroupe({
        ...groupe,
        [e.target.name]: e.target.name === 'effectif' || e.target.name === 'niveauId' 
          ? parseInt(e.target.value) 
          : e.target.value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupe) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/groupes/${groupeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupe),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess('Groupe modifié avec succès !')
        setTimeout(() => router.push('/groupes'), 1500)
      } else {
        setError(data.error || 'Erreur lors de la modification')
      }
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingGroupe) return <div>Chargement...</div>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Modifier le groupe</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        {groupe && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={groupe.nom}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="effectif" className="block text-sm font-medium text-gray-700">Effectif</label>
                <input
                  type="number"
                  id="effectif"
                  name="effectif"
                  value={groupe.effectif}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  id="type"
                  name="type"
                  value={groupe.type}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="LOCAL">Local</option>
                  <option value="EN_LIGNE">En ligne</option>
                  <option value="HYBRIDE">Hybride</option>
                </select>
              </div>

              <div>
                <label htmlFor="niveauId" className="block text-sm font-medium text-gray-700">Niveau</label>
                <select
                  id="niveauId"
                  name="niveauId"
                  value={groupe.niveauId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {niveaux.map((niveau) => (
                    <option key={niveau.id} value={niveau.id}>
                      {niveau.nom} ({niveau.session.nom})
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
        )}
      </div>
    </div>
  )
}