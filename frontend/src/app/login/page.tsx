import { Suspense } from "react"
import LoginForm from "./LoginForm"

/**
 * Server Component — читает NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY
 * из runtime process.env и передаёт его в клиентский LoginForm как проп.
 */
export default function LoginPage() {
  const captchaKey = process.env.NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY || ""

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          Загрузка...
        </div>
      }>
      <LoginForm captchaKey={captchaKey} />
    </Suspense>
  )
}
