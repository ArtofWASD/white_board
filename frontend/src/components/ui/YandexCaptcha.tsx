"use client"

/**
 * Обёртка над официальным @yandex/smart-captcha.
 *
 * Принимает sitekey как проп (передаётся из серверного компонента).
 * В dev-режиме без ключа показывает чекбокс-заглушку.
 */

import React, {
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
  /** Клиентский ключ SmartCaptcha (передаётся из серверного компонента) */
  sitekey: string
  /** Вызывается с токеном при успешном прохождении капчи */
  onSuccess: (token: string) => void
  /** Вызывается когда токен истёк */
  onExpire?: () => void
  /** Вызывается при ошибке загрузки капчи */
  onError?: () => void
  className?: string
}

const DEV_BYPASS = process.env.NEXT_PUBLIC_CAPTCHA_DEV_BYPASS === "true"

const YandexCaptcha = forwardRef<YandexCaptchaRef, YandexCaptchaProps>(
  ({ sitekey, onSuccess, onExpire, onError, className }, ref) => {
    const [resetKey, setResetKey] = useState(0)

    useImperativeHandle(ref, () => ({
      reset: () => setResetKey((k) => k + 1),
    }))

    // Dev-bypass: чекбокс вместо капчи
    if (DEV_BYPASS || (process.env.NODE_ENV === "development" && !sitekey)) {
      return <DevBypassCheckbox onSuccess={onSuccess} resetRef={ref} />
    }

    // Ключ не найден — не блокируем форму
    if (!sitekey) {
      // Автоматически разблокируем форму
      if (typeof window !== "undefined") {
        setTimeout(() => onSuccess("no-captcha-configured"), 0)
      }
      return null
    }

    return (
      <div className={className}>
        <SmartCaptcha
          key={resetKey}
          sitekey={sitekey}
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
