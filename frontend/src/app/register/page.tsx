import { Suspense } from "react"
import RegisterForm from "./RegisterForm"

/**
 * Server Component — читает NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY
 * из runtime process.env и передаёт его в клиентский RegisterForm как проп.
 */
export default function RegisterPage() {
  // Bracket notation обходит статическую подстановку Next.js при сборке.
  const captchaKey = process.env["NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY"] || ""

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          Загрузка...
        </div>
      }>
      <RegisterForm captchaKey={captchaKey} />
    </Suspense>
  )
}
