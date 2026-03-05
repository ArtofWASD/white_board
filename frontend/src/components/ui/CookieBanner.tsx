"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Проверяем, было ли уже дано согласие
    const cookieConsent = localStorage.getItem("cookieConsent")
    if (!cookieConsent) {
      // Показываем баннер с небольшой задержкой для лучшего UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined")
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[var(--card)] border-2 border-border rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Текст и ссылки */}
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                    🍪 Мы используем файлы cookie
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Мы используем файлы cookie для улучшения вашего опыта использования
                    сайта, анализа трафика и персонализации контента. Продолжая
                    использовать наш сайт, вы соглашаетесь с нашей{" "}
                    <Link
                      href="/privacy"
                      className="text-foreground font-semibold underline hover:text-muted-foreground transition-colors">
                      Политикой конфиденциальности
                    </Link>{" "}
                    и{" "}
                    <Link
                      href="/terms"
                      className="text-foreground font-semibold underline hover:text-muted-foreground transition-colors">
                      Условиями использования
                    </Link>
                    .
                  </p>
                </div>

                {/* Кнопки */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={handleDecline}
                    className="whitespace-nowrap min-w-[120px] px-6 py-3 text-base font-medium text-foreground bg-[var(--card)] border-2 border-border rounded-lg hover:bg-muted transition-all duration-300">
                    Отклонить
                  </button>
                  <button
                    onClick={handleAccept}
                    className="whitespace-nowrap min-w-[120px] px-6 py-3 text-base font-medium text-primary-foreground bg-primary border-2 border-primary rounded-lg hover:bg-primary/90 transition-all duration-300">
                    Принять
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CookieBanner
