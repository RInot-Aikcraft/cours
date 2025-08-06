"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/hooks/useUser'
import Link from 'next/link'

interface SessionFormData {
  nom: string
  dateDebut: string
  dateFin: string
  etat: string
}

export default function CreateSessionPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  
  const [formData, setFormData] = useState<SessionFormData>({
    nom: '',
    dateDebut: '',
    dateFin: '',
    etat: 'EN_COURS'
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [user, loading, router])

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
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSuccess('Session créée avec succès!')
        setTimeout(() => {
          router.push('/sessions')
        }, 1500)
      } else {
        setError(data.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError('Erreur réseau ou serveur')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Créer une nouvelle session</h1>
        
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
                <option value="EN_COURS">En cours</option>
                <option value="TERMINEE">Terminée</option>
                <option value="ANNULEE">Annulée</option>
                <option value="REPORTER">Reportée</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Création...' : 'Créer la session'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}