"use client"

import { useEffect } from "react"
import { useFeatureFlagStore } from "../../lib/store/useFeatureFlagStore"

export function ThemeProvider() {
  const { flags } = useFeatureFlagStore()

  useEffect(() => {
    const html = document.documentElement
    if (flags.darkMode) {
      html.classList.add("dark")
      html.classList.remove("light")
    } else {
      html.classList.add("light")
      html.classList.remove("dark")
    }
  }, [flags.darkMode])

  return null
}
