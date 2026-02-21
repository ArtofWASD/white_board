"use client"

import React, { useState, useEffect } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useFeatureFlagStore } from "@/lib/store/useFeatureFlagStore"
import { RatingStar } from "@/components/ui/RatingStar"
import { logApiError } from "@/lib/logger"

interface ExerciseDetail {
  id: string
  name: string
  description?: string
  videoUrl?: string
  muscleGroups?: string[]
  rating?: number
}

const MUSCLE_GROUPS_MAP: Record<string, string> = {
  CHEST: "Грудные мышцы",
  BACK: "Мышцы спины",
  LEGS: "Мышцы ног",
  SHOULDERS: "Плечи",
  ARMS: "Руки",
  CORE: "Мышцы кора",
}

export default function ExerciseDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { flags } = useFeatureFlagStore()

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const res = await fetch(`/api/content-exercises/${id}`)
        if (res.ok) {
          const data = await res.json()
          setExercise(data)
        } else {
          logApiError(
            `/api/content-exercises/${id}`,
            new Error("Failed to fetch exercise"),
          )
          // router.push('/blog/exercises');
        }
      } catch (error) {
        logApiError(`/api/content-exercises/${id}`, error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchExercise()
    }
  }, [id, router])

  useEffect(() => {
    if (exercise) {
      document.title = `${exercise.name} - Whiteboard`
    }
  }, [exercise])

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

  if (!exercise) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header onRightMenuClick={() => {}} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Упражнение не найдено
            </h2>
            <Link
              href="/knowledge/exercises"
              className="text-indigo-600 hover:text-indigo-800">
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
              href="/knowledge/exercises"
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
              Вернуться к упражнениям
            </Link>
          </div>

          <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {exercise.name}
                  </h1>
                  {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exercise.muscleGroups.map((mg) => (
                        <span
                          key={mg}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {MUSCLE_GROUPS_MAP[mg] || mg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <RatingStar
                    initialRating={exercise.rating || 0}
                    id={exercise.id}
                    type="exercise"
                    size={20}
                  />
                </div>
              </div>
            </div>

            {/* Video Section */}
            {exercise.videoUrl && (
              <div className="aspect-w-16 aspect-h-9 bg-gray-900">
                <iframe
                  src={exercise.videoUrl.replace("watch?v=", "embed/")}
                  title={exercise.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full min-h-[400px]"></iframe>
              </div>
            )}

            {/* Content Section */}
            <div className="p-6 md:p-8">
              <div className="prose prose-indigo max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Описание</h3>
                <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">
                  {exercise.description || "Описание отсутствует."}
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
