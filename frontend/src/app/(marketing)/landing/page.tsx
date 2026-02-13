import Link from "next/link"
import Image from "next/image"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import Button from "@/components/ui/Button"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header
        navItems={[]}
        rightContent={
          <>
            <Button
              href="/login"
              variant="ghost"
              className="text-gray-600 hover:text-black font-medium">
              Войти
            </Button>
            <Button
              href="/register"
              className="bg-black text-white hover:bg-gray-800 font-medium rounded-lg px-4 py-2">
              Регистрация
            </Button>
          </>
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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  href="/register"
                  size="lg"
                  className="w-full sm:w-auto font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Начать бесплатно
                </Button>
                <Button
                  href="/login"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-semibold">
                  Уже есть аккаунт
                </Button>
              </div>
            </div>
          </div>

          {/* Abstract Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Features Grid */}
        {/* Feature Slides */}

        {/* Slide 1: Workouts */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
              {/* Text Content */}
              <div className="flex-1 space-y-6">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-2xl">
                  💪
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Тренировки Дня (WOD)
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Получайте доступ к ежедневным тренировкам. Логируйте результаты,
                  оставляйте заметки и отслеживайте историю своих побед в удобном формате.
                </p>
                <div className="pt-4">
                  <Link
                    href="/register"
                    className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">
                    Начать тренировки <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
              {/* Image/Visual */}
              <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/register_pic_1.jpg"
                  alt="Workouts Feature"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Slide 2: Progress */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 max-w-6xl mx-auto">
              <div className="flex-1 space-y-6">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-2xl">
                  📊
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Ваш Прогресс
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Визуализируйте свой рост. Графики силовых показателей, личные рекорды и
                  история выполнения комплексов всегда под рукой.
                </p>
              </div>
              <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl bg-white p-8 flex items-center justify-center">
                <Image
                  src="/stopwatch.png"
                  alt="Progress Tracking"
                  width={300}
                  height={300}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3: Community */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
              <div className="flex-1 space-y-6">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-2xl">
                  🏆
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Сообщество и Лидерборды
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Соревнуйтесь с друзьями и атлетами вашего зала. Поддерживайте друг друга
                  в комментариях и следите за успехами команды.
                </p>
              </div>
              <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
                <Image
                  src="/leaderboard.png"
                  alt="Community Features"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Slide 4: Teams */}
        <section className="py-20 bg-indigo-50/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 max-w-6xl mx-auto">
              <div className="flex-1 space-y-6">
                <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-2xl">
                  👥
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Команды и Тренеры
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Создавайте свои команды, управляйте атлетами и планируйте тренировочный
                  процесс. Идеально для владельцев залов и тренеров.
                </p>
              </div>
              <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/register_pic_3.jpg"
                  alt="Team Management"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Slide 5: Events */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
              <div className="flex-1 space-y-6">
                <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-2xl">
                  📅
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Мероприятия
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Организовывайте соревнования и челленджи. Удобный календарь событий
                  поможет ничего не пропустить.
                </p>
              </div>
              <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
                <Image
                  src="/calendar.png"
                  alt="Events Calendar"
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
