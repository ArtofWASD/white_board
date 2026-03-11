import React, { useState } from "react"
import { cn } from "../../lib/utils"

interface UserLike {
  name: string
  lastName?: string | null
  avatarUrl?: string | null
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: UserLike | null
  size?: "sm" | "md" | "lg" | "xl" | "xxl" | "icon"
  src?: string | null
  alt?: string
  fallback?: React.ReactNode
}

/**
 * Parses the full image URL.
 * Prepends NEXT_PUBLIC_API_URL to relative paths (like /uploads/...)
 */
export const getFullImageUrl = (url?: string | null): string => {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url
  }
  
  // Возвращаем относительный путь как есть. Браузер сам подставит текущий домен,
  // а Next.js благодаря rewrites проксирует запрос на бэкенд.
  // Это решает проблему на PWA, когда NEXT_PUBLIC_API_URL (например, localhost)
  // недоступен с телефона.
  return url.startsWith("/") ? url : `/${url}`
}

/**
 * Returns initials from a user object (up to 2 characters).
 */
export const getUserInitials = (user?: UserLike | null): string => {
  if (!user || !user.name) return "?"
  
  const first = user.name.charAt(0).toUpperCase()
  const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : ""
  
  return `${first}${last}`
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, user, size = "md", src, alt, fallback, ...props }, ref) => {
    const [imageError, setImageError] = useState(false)
    
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      icon: "w-10 h-10 text-sm", // matching generic buttons
      lg: "w-12 h-12 text-base",
      xl: "w-16 h-16 text-xl",
      xxl: "w-24 h-24 sm:w-32 sm:h-32 text-4xl sm:text-5xl"
    }
    
    const resolvedSrc = src || user?.avatarUrl
    const fullSrc = getFullImageUrl(resolvedSrc)
    const showImage = fullSrc && !imageError
    
    // Determine the initials to show if fallback is needed
    const defaultFallback = fallback || getUserInitials(user)
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full items-center justify-center bg-blue-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-white font-bold",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fullSrc}
            alt={alt || user?.name || "Avatar"}
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{defaultFallback}</span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export default Avatar
