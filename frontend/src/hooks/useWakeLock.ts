import { useState, useEffect, useCallback, useRef } from "react"

export const useWakeLock = (isActive: boolean) => {
  const [isSupported, setIsSupported] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line
    setIsSupported("wakeLock" in navigator)
  }, [])

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      wakeLockRef.current = await (navigator as any).wakeLock.request("screen")
      console.log("Wake Lock acquired")

      wakeLockRef.current.addEventListener("release", () => {
        console.log("Wake Lock released")
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
