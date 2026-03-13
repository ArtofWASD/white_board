"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/store/useAuthStore"

type Status = "loading" | "success" | "error" | "already_verified"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { setUser } = useAuthStore()

  const [status, setStatus] = useState<Status>("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const verify = useCallback(async () => {
    if (!token) {
      setStatus("error")
      setErrorMessage("Токен верификации отсутствует в ссылке.")
      return
    }

    try {
      const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      const data = await res.json()

      if (res.ok) {
        if (data.user) setUser(data.user)
        setStatus("success")
        // Автоматический редирект через 3 сек
        setTimeout(() => router.push("/dashboard"), 3000)
      } else {
        setStatus("error")
        setErrorMessage(data.message || "Не удалось подтвердить email.")
      }
    } catch {
      setStatus("error")
      setErrorMessage("Произошла ошибка. Попробуйте позже.")
    }
  }, [token, router, setUser])

  useEffect(() => {
    verify()
  }, [verify])

  const handleResend = async () => {
    if (!resendEmail) return
    setResendStatus("sending")
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      })
      setResendStatus(res.ok ? "sent" : "error")
    } catch {
      setResendStatus("error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
        {/* Logo */}
        <div className="mb-6">
          <span className="text-2xl font-bold text-white tracking-tight">
            White<span className="text-green-500">board</span>
          </span>
        </div>

        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-zinc-700 border-t-green-500 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">
              Подтверждаем email…
            </h1>
            <p className="text-zinc-400 text-sm">Пожалуйста, подождите.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Email подтверждён!</h1>
            <p className="text-zinc-400 text-sm mb-6">
              Аккаунт активирован. Перенаправляем на дашборд…
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-xl transition-colors"
            >
              Перейти на дашборд
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Ошибка верификации</h1>
            <p className="text-zinc-400 text-sm mb-6">{errorMessage}</p>

            <div className="border-t border-zinc-800 pt-6">
              <p className="text-zinc-500 text-sm mb-3">Отправить ссылку повторно:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Ваш email"
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-green-500 transition-colors"
                />
                <button
                  onClick={handleResend}
                  disabled={resendStatus === "sending" || resendStatus === "sent"}
                  className="bg-green-500 hover:bg-green-400 disabled:bg-zinc-700 disabled:text-zinc-400 text-black font-semibold px-4 rounded-xl transition-colors text-sm whitespace-nowrap"
                >
                  {resendStatus === "sending" ? "…" : resendStatus === "sent" ? "Отправлено" : "Отправить"}
                </button>
              </div>
              {resendStatus === "sent" && (
                <p className="text-green-500 text-xs mt-2">Проверьте почту — письмо отправлено.</p>
              )}
              {resendStatus === "error" && (
                <p className="text-red-400 text-xs mt-2">Не удалось отправить. Попробуйте позже.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-12 h-12 rounded-full border-4 border-zinc-700 border-t-green-500 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
