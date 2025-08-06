"use client"


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/hooks/useUser'


interface Role {
  id: string
  name: string
}

const ROLES: Role[] = [
  { id: 'ADMIN', name: 'Administrateur' },
  { id: 'ENSEIGNANT', name: 'Enseignant' },
  { id: 'ELEVE', name: 'Élève' },
  { id: 'ADMINISTRATION', name: 'Administration' },
]

export default function CreateUserPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    nom: '',
    username: '',
    mail: '',
    contact: '',
    password: '',
    role: 'ELEVE',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Utilisateur créé avec succès!')
        setFormData({
          nom: '',
          username: '',
          mail: '',
          contact: '',
          password: '',
          role: 'ELEVE',
        })
      } else {
        setError(data.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError('Erreur réseau ou serveur')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Créer un nouvel utilisateur</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
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
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="mail" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="mail"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded"
              >
                {ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Créer l'utilisateur
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}