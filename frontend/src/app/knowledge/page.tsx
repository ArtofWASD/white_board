"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { logApiError } from "../../lib/logger"

// Определение типов для новостей
interface NewsItem {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  content: string
}

// Определение типов для событий и результатов
interface EventResult {
  id: string
  time: string
  dateAdded: string
  username: string
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  results?: EventResult[]
}

// Определение типа для ответа API
interface ApiEvent {
  id: string
  title: string
  eventDate: string
  results?: EventResult[]
}

export default function BlogPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([]) // Для событий левого меню
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [loadingConfig, setLoadingConfig] = useState(true)

  const { isAuthenticated, user } = useAuthStore()

  // Получение событий с бэкенда
  useEffect(() => {
    const fetchEvents = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch(`/api/events?userId=${user.id}`)
          const data: ApiEvent[] = await response.json()

          if (response.ok) {
            // Преобразование данных для соответствия нашему интерфейсу CalendarEvent
            const transformedEvents = data.map((event) => ({
              id: event.id,
              title: event.title,
              date: event.eventDate.split("T")[0], // Форматирование даты как ГГГГ-ММ-ДД
              results: event.results
                ? event.results.map((result) => ({
                    ...result,
                    dateAdded: new Date(result.dateAdded).toLocaleDateString("ru-RU"),
                  }))
                : [],
            }))
            setEvents(transformedEvents)
          }
        } catch (error) {}
      }
    }

    fetchEvents()
    fetchEvents()
  }, [isAuthenticated, user])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/public")
        if (res.ok) {
          const settings = await res.json()
          setShowContent(settings["HIDE_BLOG_CONTENT"] !== true)
        }
      } catch (e) {
        logApiError("/api/settings/public", e)
      } finally {
        setLoadingConfig(false)
      }
    }
    fetchSettings()
  }, [])

  const toggleAuth = () => {
    setShowAuth(!showAuth)
  }

  const handleShowEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleCloseEventModal = () => {
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  // Состояние для новостей и блоков
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [knowledgeBlocks, setKnowledgeBlocks] = useState<any[]>([])

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news?limit=3")
        if (res.ok) {
          const data = await res.json()
          setNewsItems(
            data.map((item: any) => ({
              id: item.id,
              title: item.title,
              excerpt: item.excerpt,
              date: new Date(item.createdAt).toLocaleDateString("ru-RU"),
              readTime: "5 мин чтения", // Заглушка
              content: item.content,
            })),
          )
        }
      } catch (e) {
        logApiError("/api/news?limit=3", e)
      }
    }

    const fetchBlocks = async () => {
      try {
        const res = await fetch("/api/content-blocks/public?location=KNOWLEDGE")
        if (res.ok) {
          setKnowledgeBlocks(await res.json())
        }
      } catch (e) {
        logApiError("/api/content-blocks/public", e)
      }
    }

    if (showContent) {
      fetchNews()
      fetchBlocks()
    }
  }, [showContent])

  return (
    <div className="min-h-screen flex flex-col">
      <Header onRightMenuClick={() => {}} />

      <main className={`flex-grow transition-all duration-300 ease-in-out ml-0`}>
          {/* Сообщение о разработке */}
          {!loadingConfig && !showContent && (
             <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                    Раздел находится в стадии разработки
                  </h1>
                  <div className="mt-8">
                    <Link
                      href="/"
                      className="px-6 py-3 bg-white text-black border border-black font-medium rounded-lg hover:bg-gray-100 transition-colors duration-300">
                      На главную
                    </Link>
                  </div>
                </div>
            </div>
          )}

          {/* Временный контент - Скрытый */}
          <div className={!loadingConfig && showContent ? "" : "hidden"}>

            {/* Секции на всю ширину */}
            {/* Секции на всю ширину */}
            <div className="w-full">
              {knowledgeBlocks.length > 0 ? (
                knowledgeBlocks.map((block, index) => (
                  <section key={block.id} className={`py-20 border-b border-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-slate-50 hover:bg-indigo-50/50'}`}>
                    <div className="max-w-6xl mx-auto px-4">
                        <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                          <div className="flex-1 space-y-6 transition-transform duration-300 ease-in-out hover:scale-105">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 transition-colors">{block.title}</h2>
                            {block.description && (
                              <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {block.description}
                              </p>
                            )}
                            {block.content && (
                              <div className="text-gray-600 leading-relaxed">
                                {block.content}
                              </div>
                            )}
                          </div>
                          <div className={`flex-1 h-[300px] w-full rounded-2xl flex items-center justify-center text-center overflow-hidden relative transition-transform duration-300 ease-in-out hover:scale-105 ${block.imageUrl ? '' : 'bg-blue-50 shadow-inner'}`}>
                            {block.imageUrl ? (
                              <img 
                        src={block.imageUrl.startsWith('http') ? block.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || ''}${block.imageUrl}`} 
                                alt={block.title} 
                                className="absolute inset-0 w-full h-full object-cover" 
                              />
                            ) : (
                              <p className="text-blue-400 font-medium text-lg">{block.title}</p>
                            )}
                          </div>
                        </div>
                    </div>
                  </section>
                ))
              ) : (
                 <div className="py-20 text-center text-gray-500">Загрузка блоков...</div>
              )}
            </div>

            {/* <div className="max-w-4xl mx-auto"> */}
            <div className="max-w-4xl mx-auto mt-16 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {newsItems.map((item) => (
                    <article
                      key={item.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="p-6">
                        <h2 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h2>
                        <p className="text-gray-600 mb-4">{item.excerpt}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{item.date}</span>
                          <span>{item.readTime}</span>
                        </div>
                        <Link
                          href={`/knowledge/news/${item.id}`}
                          className="mt-4 text-indigo-600 font-medium hover:text-indigo-800 transition-colors inline-block">
                          Читать далее →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>


            </div>
             {/* </div> */}
          </div>
      </main>

      <Footer />

      {/* Модальное окно деталей события */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCloseEventModal}></div>
          <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                <button
                  onClick={handleCloseEventModal}
                  className="text-gray-500 hover:text-gray-700">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600">Дата: {selectedEvent.date}</p>
              </div>

              {selectedEvent.results && selectedEvent.results.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Результаты</h3>
                  <ul className="space-y-3">
                    {selectedEvent.results.map((result) => (
                      <li
                        key={result.id}
                        className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{result.time}</span>
                          <span className="text-gray-500 text-sm">
                            {result.dateAdded}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          Добавил: {result.username}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">Нет результатов для этого события</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
