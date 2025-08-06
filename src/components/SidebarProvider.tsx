"use client"

import { ReactNode } from 'react'
import useUser from '@/hooks/useUser'
import Sidebar from './Sidebar'

interface SidebarProviderProps {
  children: ReactNode
}

export default function SidebarProvider({ children }: SidebarProviderProps) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {user && <Sidebar userRole={user.role} />}
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  )
}