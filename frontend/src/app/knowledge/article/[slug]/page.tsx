"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Header from "../../../../components/layout/Header"
import Footer from "../../../../components/layout/Footer"
import { logApiError } from "../../../../lib/logger"

interface ArticleData {
  id: string
  title: string
  slug: string | null
  description: string | null
  content: string | null
  imageUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  createdAt: string
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return
      
      try {
        setLoading(true)
        // Try fetching by slug first
        let res = await fetch(`/api/content-blocks/by-slug/${slug}`)
        
        // Fallback to fetch by ID if slug not found
        if (!res.ok && slug.length > 20) {
          res = await fetch(`/api/content-blocks/${slug}`)
        }

        if (res.ok) {
          const data = await res.json()
          setArticle(data)
          
          // Set basic SEO
          if (data.seoTitle || data.title) {
             document.title = data.seoTitle || data.title;
          }
          if (data.seoDescription || data.description) {
             let meta = document.querySelector('meta[name="description"]');
             if (!meta) {
                 meta = document.createElement('meta');
                 meta.setAttribute('name', 'description');
                 document.head.appendChild(meta);
             }
             meta.setAttribute('content', data.seoDescription || data.description || '');
          }
        } else {
          setError("Статья не найдена")
        }
      } catch (e) {
        logApiError(`Fetch article ${slug}`, e)
        setError("Ошибка при загрузке статьи")
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onRightMenuClick={() => {}} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-xl text-gray-500">Загрузка...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onRightMenuClick={() => {}} />
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{error || "Статья не найдена"}</h1>
          <Link href="/knowledge" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Вернуться в базу знаний
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onRightMenuClick={() => {}} />

      <main className="flex-grow">
        <article className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          <Link href="/knowledge" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8 transition-colors font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Назад к базе знаний
          </Link>

          {article.imageUrl && (
            <div className="w-full h-[400px] mb-12 rounded-2xl overflow-hidden relative shadow-lg">
              <img
                src={article.imageUrl.startsWith('http') ? article.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || ''}${article.imageUrl}`}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center text-gray-500 mb-10 pb-6 border-b border-gray-100">
              <span className="text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                База знаний
              </span>
              <span className="mx-3">•</span>
              <time dateTime={article.createdAt}>
                {new Date(article.createdAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            {article.description && (
              <div className="text-xl text-gray-700 font-medium mb-8 leading-relaxed border-l-4 border-indigo-500 pl-6 space-y-4">
                {article.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {article.content && (
              <div className="prose prose-lg prose-indigo max-w-none text-gray-600 leading-relaxed space-y-6">
                {article.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
