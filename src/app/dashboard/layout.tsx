import { ReactNode } from 'react'
import SidebarProvider from '@/components/SidebarProvider'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
}