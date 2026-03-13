"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  /** Email введённый пользователем при регистрации (для отображения) */
  email?: string
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, email }) => {
  const router = useRouter()

  if (!isOpen) return null

  const handleGoToLogin = () => {
    onClose()
    router.push("/login")
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[var(--card)] text-card-foreground rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative overflow-hidden">

          {/* Иконка конверта */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">
            Проверьте вашу почту
          </h2>

          <p className="text-muted-foreground mb-2 leading-relaxed">
            Мы отправили письмо с ссылкой для подтверждения на
          </p>

          {email && (
            <p className="font-semibold text-foreground mb-4 break-all">
              {email}
            </p>
          )}

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Перейдите по ссылке в письме чтобы активировать аккаунт.
            Ссылка действительна&nbsp;24&nbsp;часа.
          </p>

          {/* Подсказка про спам */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 mb-6 text-left">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              💡 Не нашли письмо? Проверьте папку <strong>«Спам»</strong> или{" "}
              <strong>«Нежелательная почта»</strong>.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToLogin}
              className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Перейти к входу
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-2.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              Закрыть
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default SuccessModal
