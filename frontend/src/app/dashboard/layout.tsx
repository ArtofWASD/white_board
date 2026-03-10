"use client"

import React, { useEffect } from "react"
import { useTeamStore } from "../../lib/store/useTeamStore"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useRouter } from "next/navigation"
import Header from "../../components/layout/Header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, verifyUser } = useAuthStore()
  const { fetchTeams } = useTeamStore()
  const router = useRouter()

  // Socket initialization is handled in Header component which is part of this layout.
  // Redundant initialization here can lead to connection flickering.

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user) {
      fetchTeams()
      verifyUser()
    }
  }, [isAuthenticated, router, isLoading, fetchTeams, verifyUser])

  if (!isAuthenticated || !user) {
    return null // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-grow container mx-auto p-2 sm:p-4 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  )
}
