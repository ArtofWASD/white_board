import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = (userId: string) => {
  if (socket?.connected) return socket

  socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
    withCredentials: true, // Важно! Отправляет cookies автоматически
    transports: ["websocket", "polling"],
  })

  socket.on("connect", () => {
    socket?.emit("joinUserRoom", userId)
  })

  socket.on("disconnect", () => {
    // Socket disconnected
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
