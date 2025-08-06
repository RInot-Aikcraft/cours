"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useUser from '@/hooks/useUser'
import Image from 'next/image'
import Link from 'next/link'

interface Student {
  id: number
  nom: string
  prenom: string
  dateNaissance: string
  adresse: string
  cin: string
  statut: string
  photo?: string
  userId: number
  user: {
    username: string
    mail: string
    role: string
  }
}

export default function StudentDetailPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [loadingStudent, setLoadingStudent] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setStudent(data)
        } else {
          router.push('/students')
        }
      } catch (err) {
        console.error('Erreur réseau', err)
        router.push('/students')
      } finally {
        setLoadingStudent(false)
      }
    }

    if (user) fetchStudent()
  }, [user, loading, router, studentId])

  if (loading || loadingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Élève non trouvé</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Fiche élève : {student.nom} {student.prenom}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Consultez et gérez les informations de cet élève.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/students/edit/${student.id}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700"
              >
                Modifier
              </Link>
              <Link
                href="/students"
                className="bg-gray-600 text-white px-4 py-2 rounded shadow-sm hover:bg-gray-700"
              >
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            {/* Photo et informations principales */}
            <div className="flex items-center space-x-8 mb-8">
              <div className="flex-shrink-0">
                {student.photo ? (
                  <Image
                    src={student.photo}
                    alt={`${student.nom} ${student.prenom}`}
                    width={192}
                    height={192}
                    className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-6xl text-gray-500">
                      {student.nom.charAt(0)}{student.prenom.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
                    <dl className="space-y-2">
                      <div className="flex">
                        <dt className="w-32 text-sm font-medium text-gray-500">Nom :</dt>
                        <dd className="text-sm text-gray-900">{student.nom}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-32 text-sm font-medium text-gray-500">Prénom :</dt>
                        <dd className="text-sm text-gray-900">{student.prenom}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-32 text-sm font-medium text-gray-500">Date de naissance :</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(student.dateNaissance).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </dd>
                      </div>
                      <div className="flex">
                        <dt className="w-32 text-sm font-medium text-gray-500">CIN :</dt>
                        <dd className="text-sm text-gray-900">{student.cin}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-32 text-sm font-medium text-gray-500">Statut :</dt>
                        <dd className="text-sm text-gray-900">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.statut === 'ETUDIANT' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {student.statut}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Coordonnées</h3>
                    <dl className="space-y-2">
                      <div className="flex">
                        <dt className="w-32 text-sm font-medium text-gray-500">Adresse :</dt>
                        <dd className="text-sm text-gray-900">{student.adresse}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-32 text-sm font-medium text-gray-500">Email :</dt>
                        <dd className="text-sm text-gray-900">{student.user.mail}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-32 text-sm font-medium text-gray-500">Nom d'utilisateur :</dt>
                        <dd className="text-sm text-gray-900">{student.user.username}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-32 text-sm font-medium text-gray-500">Rôle :</dt>
                        <dd className="text-sm text-gray-900">{student.user.role}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Section supplémentaire */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations complémentaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Date d'inscription</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(student.createdAt).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">ID Utilisateur</dt>
                  <dd className="mt-1 text-sm text-gray-900">#{student.userId}</dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">ID Élève</dt>
                  <dd className="mt-1 text-sm text-gray-900">#{student.id}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}