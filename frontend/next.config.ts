import type { NextConfig } from "next"

import path from "path"
import withPWAInit from "@ducanh2912/next-pwa"
const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.storage.beget.cloud",
      },
      {
        protocol: "https",
        hostname: "*.storage.yandexcloud.net",
      },
      {
        protocol: "https",
        hostname: "*.s3.yandex.net",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
  },
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://slate-backend-lihtfr:3001"
    return [
      {
        source: "/socket.io/:path*",
        destination: `${backendUrl}/socket.io/:path*`,
      },
      {
        // Internal Next.js API routes — NOT proxied to backend
        source: "/api/config",
        destination: "/api/config",
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ]
  },
}

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
})

export default withPWA(nextConfig)
