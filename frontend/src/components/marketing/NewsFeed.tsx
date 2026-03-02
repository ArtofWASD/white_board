"use client"

import { motion, Variants } from "framer-motion"
import AnimatedLink from "@/components/ui/AnimatedLink"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { useRouter } from "next/navigation"

export interface NewsItem {
  id: string
  title: string
  content: string
  excerpt?: string
  imageUrl?: string
  createdAt: string
}

interface NewsFeedProps {
  news: NewsItem[]
}

export default function NewsFeed({ news }: NewsFeedProps) {
  const router = useRouter()

  if (!news || news.length === 0) return null

  // We need exactly up to 3 news for the bento grid
  const displayNews = news.slice(0, 3)
  const mainNews = displayNews[0]
  const secondaryNews = displayNews.slice(1)

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: ru })
    } catch {
      return dateString
    }
  }

  const getImageUrl = (url?: string) => {
    if (!url) return null
    if (url.startsWith("http")) return url
    return `${process.env.NEXT_PUBLIC_API_URL || ""}${url}`
  }

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              Новости
            </h2>
          </div>
          <div className="hidden md:block">
            <AnimatedLink
              href="/login"
              className="flex items-center gap-2 group text-black hover:text-gray-700 transition-colors font-medium">
              Все новости
            </AnimatedLink>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 md:h-[600px]">
          {/* Main News Card */}
          {mainNews && (
            <motion.div
              onClick={() => router.push("/knowledge")}
              variants={itemVariants}
              className="md:col-span-2 md:row-span-2 relative rounded-[2rem] overflow-hidden group cursor-pointer bg-gray-50 flex flex-col justify-end min-h-[400px] md:min-h-0">
              <div className="absolute inset-0 z-0">
                {mainNews.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getImageUrl(mainNews.imageUrl)!}
                    alt={mainNews.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-90" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              <div className="relative z-10 p-8 md:p-12 w-full h-full flex flex-col">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-blue-200 transition-colors">
                  {mainNews.title}
                </h3>
                {mainNews.excerpt && (
                  <p className="text-gray-200 text-lg line-clamp-2 md:line-clamp-3 max-w-2xl mb-4">
                    {mainNews.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium self-end mt-auto">
                  <CalendarIcon className="w-4 h-4" />
                  {formatDate(mainNews.createdAt)}
                </div>
              </div>
            </motion.div>
          )}

          {/* Secondary News Cards */}
          {secondaryNews.map((newsItem, index) => (
            <motion.div
              key={newsItem.id}
              onClick={() => router.push("/knowledge")}
              variants={itemVariants}
              className="md:col-span-1 md:row-span-1 relative rounded-[2rem] overflow-hidden group cursor-pointer bg-gray-100 flex flex-col justify-end min-h-[300px]">
              <div className="absolute inset-0 z-0">
                {newsItem.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getImageUrl(newsItem.imageUrl)!}
                    alt={newsItem.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`w-full h-full opacity-80 ${index === 0 ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-gradient-to-br from-teal-400 to-emerald-500"}`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              <div className="relative z-10 p-6 w-full h-full flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-blue-200 transition-colors line-clamp-3">
                  {newsItem.title}
                </h3>
                <div className="flex items-center gap-2 text-white/60 text-xs font-medium self-end mt-auto">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {formatDate(newsItem.createdAt)}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="md:hidden mt-8 flex justify-center">
          <AnimatedLink
            href="/login"
            className="flex items-center gap-2 group text-black hover:text-gray-700 transition-colors font-medium">
            Все новости
          </AnimatedLink>
        </div>
      </div>
    </section>
  )
}
