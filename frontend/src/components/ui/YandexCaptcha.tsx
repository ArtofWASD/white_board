"use client"

/**
 * Обёртка над официальным @yandex/smart-captcha.
 *
 * Переменные окружения:
 *   NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY  — клиентский ключ SmartCaptcha
 *   NEXT_PUBLIC_CAPTCHA_DEV_BYPASS=true    — заменяет капчу на чекбокс (для dev)
 *
 * Ключ читается из build-time env (если передан через --build-arg)
 * или фетчится из /api/config в рантайме (Dokploy env → Next.js server route).
 */

import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react"
import { SmartCaptcha } from "@yandex/smart-captcha"

export interface YandexCaptchaRef {
  /** Сбросить виджет (после неудачной отправки формы) */
  reset: () => void
}

interface YandexCaptchaProps {
  /** Вызывается с токеном при успешном прохождении капчи */
  onSuccess: (token: string) => void
  /** Вызывается когда токен истёк */
  onExpire?: () => void
  /** Вызывается при ошибке загрузки капчи */
  onError?: () => void
  className?: string
}

// Ключ встроенный при сборке (пуст если Dokploy не передал как build-arg)
const BUILD_TIME_KEY = process.env.NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY || ""
const DEV_BYPASS =
  process.env.NEXT_PUBLIC_CAPTCHA_DEV_BYPASS === "true" ||
  (process.env.NODE_ENV === "development" && !BUILD_TIME_KEY)

const YandexCaptcha = forwardRef<YandexCaptchaRef, YandexCaptchaProps>(
  ({ onSuccess, onExpire, onError, className }, ref) => {
    const [siteKey, setSiteKey] = useState(BUILD_TIME_KEY)
    const [keyLoading, setKeyLoading] = useState(!BUILD_TIME_KEY && !DEV_BYPASS)
    // Счётчик для принудительного пересоздания SmartCaptcha (reset)
    const [resetKey, setResetKey] = useState(0)

    useImperativeHandle(ref, () => ({
      reset: () => setResetKey((k) => k + 1),
    }))

    // Если build-time ключ пуст — фетчим из /api/config (runtime env контейнера)
    useEffect(() => {
      if (BUILD_TIME_KEY || DEV_BYPASS) return

      fetch("/api/config")
        .then((r) => r.json())
        .then((data: { captchaClientKey?: string }) => {
          const key = data.captchaClientKey || ""
          setSiteKey(key)
          setKeyLoading(false)
          if (!key) {
            console.warn("[YandexCaptcha] Ключ не найден ни в build-time, ни в runtime.")
            onSuccess("no-captcha-configured")
          }
        })
        .catch(() => {
          setKeyLoading(false)
          onSuccess("no-captcha-configured")
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Пока подгружаем ключ — показываем скелетон
    if (keyLoading) {
      return (
        <div className="h-[80px] w-[300px] rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      )
    }

    // Ключ не найден — ничего не рендерим (форма уже разблокирована через onSuccess)
    if (!siteKey && !DEV_BYPASS) {
      return null
    }

    // Dev-bypass: простой чекбокс вместо капчи
    if (DEV_BYPASS) {
      return <DevBypassCheckbox onSuccess={onSuccess} resetRef={ref} />
    }

    return (
      <div className={className}>
        <SmartCaptcha
          key={resetKey}
          sitekey={siteKey}
          onSuccess={onSuccess}
          onTokenExpired={onExpire}
          onNetworkError={onError}
          language="ru"
        />
      </div>
    )
  },
)

// ── Dev-bypass component ───────────────────────────────────────────────────
function DevBypassCheckbox({
  onSuccess,
  resetRef,
}: {
  onSuccess: (token: string) => void
  resetRef: React.ForwardedRef<YandexCaptchaRef>
}) {
  const [checked, setChecked] = useState(false)

  useImperativeHandle(resetRef, () => ({
    reset: () => setChecked(false),
  }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked)
    if (e.target.checked) {
      onSuccess("dev-bypass-token")
    }
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted-foreground border border-dashed border-amber-400 rounded-lg px-4 py-3 bg-amber-50 dark:bg-amber-900/10">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="w-4 h-4 accent-primary"
      />
      <span>
        <span className="font-medium text-amber-700 dark:text-amber-400">[DEV]</span>{" "}
        Я не робот
      </span>
    </label>
  )
}

YandexCaptcha.displayName = "YandexCaptcha"
export default YandexCaptcha
