"use client"

import React from "react"
import { Star } from "lucide-react"
import { FavoritesSection } from "@/features/workouts/components/FavoritesSection"

export default function FavoritesPage() {
  return (
    <div className="w-full p-1 sm:p-2 lg:p-4">
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        <h1 className="text-3xl font-bold text-foreground">Избранное</h1>
      </div>
      <FavoritesSection />
    </div>
  )
}
