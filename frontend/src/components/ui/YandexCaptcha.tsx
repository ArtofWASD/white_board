"use client"

/**
 * Компонент Яндекс SmartCaptcha.
 *
 * Переменные окружения:
 *   NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY  — ключ от Яндекс SmartCaptcha
 *   NEXT_PUBLIC_CAPTCHA_DEV_BYPASS=true    — заменяет капчу на чекбокс (для dev)
 *
 * Получить ключ: https://smartcaptcha.yandexcloud.net/
 */

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useId,
  useState,
} from "react"

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

// Глобальный тип для Yandex SmartCaptcha
declare global {
  interface Window {
    smartCaptcha?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string
          callback: (token: string) => void
          expired_callback?: () => void
          error_callback?: () => void
          hl?: string
        },
      ) => number
      reset: (id: number) => void
      destroy: (id: number) => void
    }
  }
}

const CAPTCHA_SCRIPT_ID = "yandex-smartcaptcha-script"
const SITE_KEY = process.env.NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY || ""
const DEV_BYPASS =
  process.env.NEXT_PUBLIC_CAPTCHA_DEV_BYPASS === "true" ||
  (process.env.NODE_ENV === "development" && !SITE_KEY)

const YandexCaptcha = forwardRef<YandexCaptchaRef, YandexCaptchaProps>(
  ({ onSuccess, onExpire, onError, className }, ref) => {
    const containerId = `captcha-${useId().replace(/:/g, "")}`
    const widgetIdRef = useRef<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current !== null && window.smartCaptcha) {
          window.smartCaptcha.reset(widgetIdRef.current)
        }
      },
    }))

    useEffect(() => {
      if (!SITE_KEY && !DEV_BYPASS) {
        console.warn("[YandexCaptcha] NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY не задан.")
        return
      }
      if (DEV_BYPASS) return // dev-чекбокс обрабатывается отдельно

      const initWidget = () => {
        if (!containerRef.current || !window.smartCaptcha) return
        // Не дублировать виджет
        if (widgetIdRef.current !== null) return

        widgetIdRef.current = window.smartCaptcha.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: onSuccess,
          expired_callback: onExpire,
          error_callback: onError,
          hl: "ru",
        })
      }

      // Если скрипт уже загружен
      if (window.smartCaptcha) {
        initWidget()
        return
      }

      // Добавляем скрипт один раз
      if (!document.getElementById(CAPTCHA_SCRIPT_ID)) {
        const script = document.createElement("script")
        script.id = CAPTCHA_SCRIPT_ID
        script.src = "https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=onYandexCaptchaLoad"
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }

      // Колбэк onload из window (Yandex дёргает его после загрузки)
      ;(window as any).onYandexCaptchaLoad = () => {
        initWidget()
      }

      // Если между рендерами уже загрузился, инициализируем сразу
      const interval = setInterval(() => {
        if (window.smartCaptcha) {
          clearInterval(interval)
          initWidget()
        }
      }, 100)

      return () => {
        clearInterval(interval)
        if (widgetIdRef.current !== null && window.smartCaptcha) {
          window.smartCaptcha.destroy(widgetIdRef.current)
          widgetIdRef.current = null
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!SITE_KEY && !DEV_BYPASS) {
      return null // В prod без ключа — ничего не рендерим
    }

    // ── Dev-bypass: простой чекбокс вместо капчи ──────────────────────────────
    if (DEV_BYPASS) {
      return <DevBypassCheckbox onSuccess={onSuccess} resetRef={ref} />
    }

    return (
      <div id={containerId} ref={containerRef} className={className} />
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
