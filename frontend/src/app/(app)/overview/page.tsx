"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/")
  }, [router])

  return null
}

/* 
// OLD OVERVIEW CODE COMMENTED OUT
import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Footer from "@/components/layout/Footer"

export default function Home() {
  const [hoveredSection, setHoveredSection] = useState<"knowledge" | "calendar" | null>(null)

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col md:flex-row h-screen">
        <Link
          href="/knowledge"
          className={`transition-all duration-300 ease-in-out p-8 flex flex-col justify-center relative ${
            hoveredSection === "knowledge"
              ? "md:w-3/5 z-20"
              : hoveredSection === "calendar"
                ? "md:w-2/5"
                : "md:w-1/2"
          } bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer w-full h-1/2 md:h-full overflow-hidden`}
          onMouseEnter={() => setHoveredSection("knowledge")}
          onMouseLeave={() => setHoveredSection(null)}>
          <div
            className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${
              hoveredSection === "knowledge" ? "opacity-30" : "opacity-0"
            }`}>
            <Image src="/blog.png" alt="Knowledge Base" fill className="object-cover" />
          </div>

          <div className="max-w-2xl mx-auto w-full text-center relative z-10">
            <h1
              className={`text-4xl font-bold mb-6 transition-all duration-300 ${
                hoveredSection === "knowledge" ? "text-5xl" : ""
              } text-gray-800`}>
              Тренды и Тренировки
            </h1>
            <p className="text-xl text-gray-600">
              Актуальные тренды и эффективные тренировки
            </p>
          </div>
        </Link>

        <Link
          href="/calendar"
          className={`transition-all duration-300 ease-in-out p-8 flex flex-col justify-center relative ${
            hoveredSection === "calendar"
              ? "md:w-3/5 z-20"
              : hoveredSection === "knowledge"
                ? "md:w-2/5"
                : "md:w-1/2"
          } bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer w-full h-1/2 md:h-full overflow-hidden`}
          onMouseEnter={() => setHoveredSection("calendar")}
          onMouseLeave={() => setHoveredSection(null)}>
          <div
            className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${
              hoveredSection === "calendar" ? "opacity-30" : "opacity-0"
            }`}>
            <Image src="/calendar.png" alt="Calendar" fill className="object-cover" />
          </div>

          <div className="max-w-2xl mx-auto w-full text-center relative z-10">
            <h1
              className={`text-4xl font-bold mb-6 transition-all duration-300 ${
                hoveredSection === "calendar" ? "text-5xl" : ""
              } text-gray-800`}>
              Календарь
            </h1>
            <p className="text-xl text-gray-600">Планируйте свои тренировки</p>
          </div>
        </Link>
      </main>
      <Footer />
    </div>
  )
}
*/
