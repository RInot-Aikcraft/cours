"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useUser from '@/hooks/useUser'

interface Session {
  id: number
  nom: string
  dateDebut: string
  dateFin: string
  etat: string
}

interface Niveau {
  id: number
  nom: string
}

export default function SessionDetailPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [newNiveau, setNewNiveau] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editNom, setEditNom] = useState('')
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
          setSession(data.session)
        }
      } catch (err) {
        setError('Erreur réseau')
      }
    }

    const fetchNiveaux = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/sessions/${sessionId}/niveaux`, {
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
      fetchSession()
      fetchNiveaux()
      setLoadingSession(false)
    }
  }, [user, loading, router, sessionId])

  const handleAddNiveau = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNiveau.trim()) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/sessions/${sessionId}/niveaux`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom: newNiveau }),
      })

      const data = await res.json()
      if (res.ok) {
        setNiveaux([...niveaux, data.niveau])
        setNewNiveau('')
        setSuccess('Niveau ajouté avec succès !')
      } else {
        setError(data.error || "Erreur lors de l'ajout")
      }
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNiveau = async (id: number) => {
    if (!editNom.trim()) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/niveaux/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom: editNom }),
      })

      const data = await res.json()
      if (res.ok) {
        setNiveaux(niveaux.map(n => n.id === id ? data.niveau : n))
        setEditId(null)
        setEditNom('')
        setSuccess('Niveau modifié avec succès !')
      } else {
        setError(data.error || "Erreur lors de la modification")
      }
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNiveau = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/niveaux/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setNiveaux(niveaux.filter(n => n.id !== id))
        setSuccess('Niveau supprimé avec succès !')
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingSession) return <div>Chargement...</div>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Détail de la session</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        {session && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{session.nom}</h2>
            <p><strong>Date de début :</strong> {new Date(session.dateDebut).toLocaleDateString()}</p>
            <p><strong>Date de fin :</strong> {new Date(session.dateFin).toLocaleDateString()}</p>
            <p><strong>État :</strong> {session.etat}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Ajouter un niveau</h3>
          <form onSubmit={handleAddNiveau} className="flex gap-2">
            <input
              type="text"
              placeholder="Nom du niveau"
              value={newNiveau}
              onChange={(e) => setNewNiveau(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Ajouter
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Niveaux associés</h3>
          {niveaux.length === 0 ? (
            <p>Aucun niveau pour cette session.</p>
          ) : (
            <ul>
              {niveaux.map((niveau) => (
                <li key={niveau.id} className="border-b py-2 flex justify-between items-center">
                  {editId === niveau.id ? (
                    <input
                      type="text"
                      value={editNom}
                      onChange={(e) => setEditNom(e.target.value)}
                      className="border px-2 py-1 rounded"
                    />
                  ) : (
                    <span>{niveau.nom}</span>
                  )}
                  <div className="flex gap-2">
                    {editId === niveau.id ? (
                      <>
                        <button
                          onClick={() => handleEditNiveau(niveau.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditId(niveau.id)
                            setEditNom(niveau.nom)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteNiveau(niveau.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}