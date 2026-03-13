import { NextResponse } from "next/server"

/**
 * GET /api/config
 * Возвращает публичные конфиги, которые неизвестны на этапе сборки Docker.
 * Next.js читает process.env из runtime-окружения контейнера (Dokploy env).
 */
export async function GET() {
  return NextResponse.json({
    captchaClientKey: process.env.NEXT_PUBLIC_YANDEX_CAPTCHA_CLIENT_KEY || "",
  })
}
