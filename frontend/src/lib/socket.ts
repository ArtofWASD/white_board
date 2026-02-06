import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = (token: string, userId: string) => {
  if (socket?.connected) return socket

  socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
    auth: { token },
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
