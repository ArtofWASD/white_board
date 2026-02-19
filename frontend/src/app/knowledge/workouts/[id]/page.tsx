"use client"

import React, { useState, useEffect } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useFeatureFlagStore } from "@/lib/store/useFeatureFlagStore"
import { AddToCalendarModal } from "@/components/dashboard/AddToCalendarModal"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { useToast } from "@/lib/context/ToastContext"
import { RatingStar } from "@/components/ui/RatingStar"
import { logApiError } from "@/lib/logger"

interface WodDetail {
  id: string
  name: string
  description: string
  type: string
  scheme: string
  muscleGroups: string[]
  rating: number
}

const MUSCLE_GROUPS_MAP: Record<string, string> = {
  CHEST: "Грудные мышцы",
  BACK: "Мышцы спины",
  LEGS: "Мышцы ног",
  SHOULDERS: "Плечи",
  ARMS: "Руки",
  CORE: "Мышцы кора",
}

const SCHEME_MAP: Record<string, string> = {
  FOR_TIME: "For Time",
  AMRAP: "AMRAP",
  EMOM: "EMOM",
  TABATA: "Tabata",
  NOT_SPECIFIED: "Other",
}

export default function WodDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [wod, setWod] = useState<WodDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { flags } = useFeatureFlagStore()
  const { user } = useAuthStore()
  const { success, error: toastError } = useToast()
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  useEffect(() => {
    const fetchWod = async () => {
      try {
        const res = await fetch(`/api/wods/${id}`)
        if (res.ok) {
          const data = await res.json()
          setWod(data)
        } else {
          logApiError(`/api/wods/${id}`, new Error("Failed to fetch wod"), {
            status: res.status,
          })
        }
      } catch (error) {
        logApiError(`/api/wods/${id}`, error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchWod()
    }
  }, [id])

  const handleAddToCalendar = async (date: Date) => {
    if (!user || !wod) return

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          title: wod.name,
          description: wod.description,
          eventDate: date.toISOString(),
          exerciseType: "wod",
        }),
      })

      if (response.ok) {
        success("Событие добавлено в календарь")
        setIsCalendarModalOpen(false)
      } else {
        toastError("Не удалось добавить событие")
      }
    } catch (error) {
      toastError("Ошибка при добавлении события")
    }
  }

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center space-x-1">
        <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-lg font-medium text-gray-700">{Math.round(rating)}</span>
      </div>
    )
  }

  if (flags.hideBlogContent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onRightMenuClick={() => {}} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Раздел находится в разработке</h1>
            <Link href="/" className="text-indigo-600 hover:text-indigo-800">
              На главную
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header onRightMenuClick={() => {}} />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!wod) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header onRightMenuClick={() => {}} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Воркаут не найден</h2>
            <Link href="/knowledge/workouts" className="text-indigo-600 hover:text-indigo-800">
              Вернуться к списку
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onRightMenuClick={() => {}} />

      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link
              href="/knowledge/workouts"
              className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Вернуться к воркаутам
            </Link>
          </div>

          <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{wod.name}</h1>
                    {wod.type && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-900 text-white shadow-sm">
                        {wod.type}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    {wod.scheme && (
                      <span className="flex items-center">
                        <span className="font-semibold text-gray-900 mr-1">Схема:</span>
                        {SCHEME_MAP[wod.scheme] || wod.scheme}
                      </span>
                    )}
                  </div>

                  {wod.muscleGroups && wod.muscleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {wod.muscleGroups.map((mg) => (
                        <span
                          key={mg}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {MUSCLE_GROUPS_MAP[mg] || mg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <RatingStar
                    initialRating={wod.rating || 0}
                    id={wod.id}
                    type="workout"
                    size={20}
                  />
                  <button
                    onClick={() => setIsCalendarModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Добавить в календарь
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8">
              <div className="prose prose-indigo max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  Задание
                </h3>
                <div className="whitespace-pre-wrap text-gray-800 font-medium text-lg bg-gray-50 p-6 rounded-xl border border-gray-100">
                  {wod.description}
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />

      <AddToCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onSave={handleAddToCalendar}
        title={wod.name}
        description={wod.description}
      />
    </div>
  )
}
