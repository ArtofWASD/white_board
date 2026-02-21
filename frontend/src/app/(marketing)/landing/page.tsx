import Link from "next/link"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import AnimatedLink from "@/components/ui/AnimatedLink"
import { ContentBlock } from "@/lib/api/admin"

async function getLandingBlocks(): Promise<ContentBlock[]> {
  try {
    const url = `${process.env.BACKEND_URL || 'http://localhost:3001'}/content-blocks/public?location=LANDING`
    console.log("Fetching landing blocks from:", url)
    
    const res = await fetch(url, {
      next: { revalidate: 60 } // Can re-enable cache now that URL is correct
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

export default async function LandingPage() {
  const blocks = await getLandingBlocks()
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header
        navItems={[]}
        rightContent={
          <div className="flex items-center gap-6">
            <AnimatedLink href="/login">
              Войти
            </AnimatedLink>
            <AnimatedLink href="/register">
              Регистрация
            </AnimatedLink>
          </div>
        }
      />

      {/* Hero Section */}
      <main className="flex-grow pt-20">
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
                Ваш зал. Ваша команда.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Ваша доска.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Цифровое пространство для кроссфит-атлетов и тренеров. Отслеживайте
                прогресс, соревнуйтесь в лидербордах и планируйте тренировки.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <AnimatedLink href="/register" className="text-black text-lg">
                  Начать бесплатно
                </AnimatedLink>
                <AnimatedLink href="/login" className="text-black text-lg">
                  Уже есть аккаунт
                </AnimatedLink>
              </div>
            </div>
          </div>

          {/* Abstract Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Dynamic Features Grid */}
        {blocks.length > 0 ? (
          blocks.map((block, index) => (
            <section key={block.id} className={`py-20 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
              <div className="container mx-auto px-4">
                <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 max-w-6xl mx-auto`}>
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
                  <div className={`flex-1 min-h-[300px] w-full rounded-2xl p-8 flex items-center justify-center text-center overflow-hidden relative ${block.imageUrl ? '' : 'bg-gray-50 border border-gray-100 shadow-sm'}`}>
                    {block.imageUrl ? (
                      <img 
                        src={block.imageUrl.startsWith('http') ? block.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || ''}${block.imageUrl}`} 
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
        ) : (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-500 text-lg">Загрузка контента...</p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
