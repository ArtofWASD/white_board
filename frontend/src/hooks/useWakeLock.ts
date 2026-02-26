import { useState, useEffect, useCallback, useRef } from "react"

export const useWakeLock = (isActive: boolean) => {
  const [isSupported, setIsSupported] = useState(false)
  const wakeLockRef = useRef<any>(null)

  useEffect(() => {
    setIsSupported("wakeLock" in navigator)
  }, [])

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return

    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request("screen")
      console.log("Wake Lock acquired")

      wakeLockRef.current.addEventListener("release", () => {
        console.log("Wake Lock released")
      })
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`)
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isActive) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [isActive, requestWakeLock, releaseWakeLock])

  // Re-acquire lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (isActive && document.visibilityState === "visible") {
        await requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isActive, requestWakeLock])

  return { isSupported }
}
