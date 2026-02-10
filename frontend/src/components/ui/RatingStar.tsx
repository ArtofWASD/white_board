"use client"

import React, { useState } from "react"
import { logApiError } from "../../lib/logger"
import { Star } from "lucide-react"

interface RatingStarProps {
  initialRating: number
  id: string
  type: "workout" | "exercise"
  size?: number
}

export const RatingStar = ({ initialRating, id, type, size = 16 }: RatingStarProps) => {
  const [rating, setRating] = useState(initialRating)
  const [userRating, setUserRating] = useState<number>(0) // 0, 1, or -1 (though we only support +1 logic for now based on request "increase by 1")
  // Request says: "User can increase by 1. Second click decreases by 1 (back to original)."
  // So state toggles between 0 (original) and 1 (liked).

  const handleRate = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newDelta = userRating === 0 ? 1 : -1
    const newRating = rating + newDelta

    // Optimistic update
    setRating(newRating)
    setUserRating(userRating === 0 ? 1 : 0)

    try {
      const endpoint =
        type === "workout" ? `/api/wods/${id}/rate` : `/api/content-exercises/${id}/rate`

      await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ delta: newDelta }),
      })
    } catch (error) {
      const apiType = type === "workout" ? "wods" : "content-exercises"
      logApiError(`/api/${apiType}/${id}/rate`, error)
      // Revert on error
      setRating(rating)
      setUserRating(userRating)
    }
  }

  return (
    <div
      onClick={handleRate}
      className="flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity"
      title="Rate this content">
      <Star
        className={`w-${size / 4} h-${size / 4} ${userRating > 0 ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
        size={size}
      />
      <span className="text-gray-600 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}
