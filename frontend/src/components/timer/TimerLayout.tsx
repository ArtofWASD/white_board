"use client"

import React from "react"
import Header from "../layout/Header"

export const TimerLayout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
