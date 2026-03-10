import { io, Socket } from "socket.io-client"

let socket: Socket | null = null
let connectionPromise: Promise<Socket> | null = null
let connectionResolver: ((s: Socket) => void) | null = null
let activeConnections = 0
let disconnectTimeout: NodeJS.Timeout | null = null

export const initializeSocket = (userId: string) => {
  activeConnections++

  // Если был запланирован дисконнект, отменяем его
  if (disconnectTimeout) {
    clearTimeout(disconnectTimeout)
    disconnectTimeout = null
  }

  if (socket?.connected) {
    if (socket.id) {
      socket.emit("joinUserRoom", userId)
    }
    return socket
  }

  if (!socket) {
    // ... (rest of initializeSocket logic remains similar)
    let socketUrl = process.env.NEXT_PUBLIC_API_URL || ""

    // Dynamic resolution logic...
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        socketUrl = `https://api.${hostname}`
      } else if (socketUrl) {
        try {
          const url = new URL(socketUrl)
          socketUrl = url.origin
        } catch {}
      }
    } else if (socketUrl) {
      try {
        const url = new URL(socketUrl)
        socketUrl = url.origin
      } catch {}
    }

    socket = io(socketUrl, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    socket.on("connect", () => {
      socket?.emit("joinUserRoom", userId)
    })

    socket.on("disconnect", (_reason) => {
      // Socket disconnected
    })
  }

  if (connectionResolver && socket) {
    connectionResolver(socket)
    connectionResolver = null
  }

  return socket
}

export const getSocket = () => socket

export const waitForSocket = async (): Promise<Socket> => {
  if (socket) return socket

  if (!connectionPromise) {
    connectionPromise = new Promise((resolve) => {
      connectionResolver = resolve
    })
  }

  return connectionPromise
}

export const disconnectSocket = () => {
  if (activeConnections > 0) {
    activeConnections--
  }

  // Используем небольшую задержку перед реальным отключением.
  // Это предотвращает ошибку "WebSocket is closed before the connection is established"
  // при быстром перемонтировании компонентов в React Dev Mode или при навигации.
  if (activeConnections === 0 && socket) {
    if (disconnectTimeout) clearTimeout(disconnectTimeout)

    disconnectTimeout = setTimeout(() => {
      if (activeConnections === 0 && socket) {
        socket.disconnect()
        socket = null
        connectionPromise = null
        connectionResolver = null
      }
      disconnectTimeout = null
    }, 1000)
  }
}
