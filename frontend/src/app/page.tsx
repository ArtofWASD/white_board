import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import type { ContentBlock } from "@/lib/api/admin"
import NewsFeed, { NewsItem } from "@/components/marketing/NewsFeed"
import HeroActions from "@/components/marketing/HeroActions"

async function getLandingBlocks(): Promise<ContentBlock[]> {
  try {
    const url = `${process.env.BACKEND_URL || "http://localhost:3001"}/content-blocks/public?location=LANDING`
    console.log("Fetching landing blocks from:", url)

    const res = await fetch(url, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.error("Fetch failed with status:", res.status, res.statusText)
      return []
    }

    const json = await res.json()
    console.log("Fetched blocks count:", json.length)
    return json
  } catch (error) {
    console.error("Error fetching landing blocks:", error)
    return []
  }
}

async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const url = `${process.env.BACKEND_URL || "http://localhost:3001"}/news?limit=3`
    const res = await fetch(url, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return await res.json()
  } catch (error) {
    console.error("Error fetching news:", error)
    return []
  }
}

export default async function LandingPage() {
  const [blocks, news] = await Promise.all([getLandingBlocks(), getLatestNews()])
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-48 overflow-hidden flex items-center min-h-[80vh]">
          {/* Main Background Image */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Main_banner.jpg"
              alt="Фоновое изображение"
              className="w-full h-full object-cover object-top opacity-50"
            />
            {/* Light overlay to make text readable */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 pt-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
                Ваш зал. Ваша команда. <span className="text-gray-900">Ваша доска.</span>
              </h1>
              <p className="text-xl text-gray-900 font-medium mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
                Цифровое пространство для атлетов и тренеров. Отслеживайте прогресс,
                соревнуйтесь в лидербордах и планируйте тренировки.
              </p>
              <HeroActions />
            </div>
          </div>

          {/* Abstract Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none mix-blend-overlay">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl"></div>
          </div>
        </section>

        <NewsFeed news={news} />

        {/* Dynamic Features Grid */}
        {blocks.length > 0
          ? blocks.map((block, index) => (
              <section
                key={block.id}
                className={`py-20 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                <div className="container mx-auto px-4">
                  <div
                    className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12 max-w-6xl mx-auto`}>
                    <div className="flex-1 space-y-6">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {block.title}
                      </h2>
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
                    <div
                      className={`flex-1 min-h-[300px] w-full rounded-2xl p-8 flex items-center justify-center text-center overflow-hidden relative ${block.imageUrl ? "" : "bg-gray-50 border border-gray-100 shadow-sm"}`}>
                      {block.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            block.imageUrl.startsWith("http")
                              ? block.imageUrl
                              : `${process.env.NEXT_PUBLIC_API_URL || ""}${block.imageUrl}`
                          }
                          alt={block.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <p className="text-gray-400 text-lg italic">
                          {block.description || "Нет изображения"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ))
          : null}
      </main>

      <Footer />
    </div>
  )
}
