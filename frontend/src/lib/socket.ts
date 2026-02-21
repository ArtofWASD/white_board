import { io, Socket } from "socket.io-client"

let socket: Socket | null = null
let connectionPromise: Promise<Socket> | null = null
let connectionResolver: ((s: Socket) => void) | null = null
let activeConnections = 0

export const initializeSocket = (userId: string) => {
  activeConnections++

  if (socket?.connected) {
    if (socket.id) {
      socket.emit("joinUserRoom", userId)
    }
    return socket
  }

  if (!socket) {
    // In production, NEXT_PUBLIC_API_URL should point to the public backend URL 
    // or we use the current host (empty string)
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || ""
    socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    socket.on("connect", () => {
      socket?.emit("joinUserRoom", userId)
    })

    socket.on("disconnect", (reason) => {
      // Socket disconnected
    })
  }

  // Resolve waiting consumers
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

  if (activeConnections === 0) {
    if (socket) {
      socket.disconnect()
      socket = null
    }
    // Reset promise for next connection
    connectionPromise = null
    connectionResolver = null
  }
}
