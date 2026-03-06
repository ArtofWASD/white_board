import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string) {
  if (!html) return ""
  let text = html
  // Multi-pass to handle double/triple encoding and tags inside entities
  for (let i = 0; i < 3; i++) {
    text = text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    // Strip tags revealed by decoding
    text = text.replace(/<[^>]*>?/gm, "")
  }
  return text.trim()
}
