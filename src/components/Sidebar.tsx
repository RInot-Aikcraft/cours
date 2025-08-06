'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SidebarProps {
  userRole: string
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <>
      {/* Bouton pour ouvrir/fermer la sidebar sur mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out bg-gray-800 text-white w-64 z-40`}
      >
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          MonApp
        </div>
        <nav className="mt-6">
          <Link
            href="/dashboard"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            🏠 Tableau de bord
          </Link>
          {userRole === 'ADMIN' && (
            <>
              <Link
                href="/users"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
              >
                👥 Utilisateurs
              </Link>
              <Link
                href="/register"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
              >
                ➕ Créer un utilisateur
              </Link>
            </>
          )}
          <Link
            href="/profile"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            👤 Mon profil
          </Link>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 rounded hover:bg-red-700 transition duration-200"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Overlay pour fermer la sidebar sur mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  )
}