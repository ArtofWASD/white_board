"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/context/ToastContext"

/**
 * Глобальный слушатель события истечения сессии.
 * Подписывается на кастомное browser-событие `auth:session-expired`,
 * которое диспатчится из apiClient.forceLogout().
 *
 * При срабатывании:
 * 1. Показывает error toast
 * 2. Редиректит на /login — это автоматически закрывает все открытые модалы
 *    и сбрасывает весь локальный UI-стейт (в том числе данные на /calendar).
 *
 * Монтируется один раз в корневом layout внутри ToastProvider.
 */
export function AuthSessionWatcher() {
  const { error } = useToast()
  const router = useRouter()

  useEffect(() => {
    const handleSessionExpired = () => {
      error("Сессия истекла. Пожалуйста, войдите снова.", 5000)
      // Небольшая задержка, чтобы toast успел появиться до навигации
      setTimeout(() => {
        router.push("/login")
      }, 300)
    }

    window.addEventListener("auth:session-expired", handleSessionExpired)
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired)
    }
  }, [error, router])

  return null
}
