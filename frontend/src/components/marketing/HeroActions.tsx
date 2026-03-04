"use client"

import React, { useEffect, useState } from "react"
import Button from "@/components/ui/Button"
import AnimatedLink from "@/components/ui/AnimatedLink"
import { useAuthStore } from "@/lib/store/useAuthStore"

const HeroActions: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Показываем заглушку до гидратации или пока auth-состояние загружается
  if (!mounted || isLoading) {
    return <div className="h-12" />
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center">
        <Button href="/calendar" variant="static" size="xl">
          Перейти в календарь тренировок
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
      <AnimatedLink href="/register" className="text-gray-900 font-semibold text-lg">
        Начать бесплатно
      </AnimatedLink>
      <AnimatedLink href="/login" className="text-gray-900 font-semibold text-lg">
        Уже есть аккаунт
      </AnimatedLink>
    </div>
  )
}

export default HeroActions
