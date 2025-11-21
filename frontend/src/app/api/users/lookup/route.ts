import { NextResponse } from "next/server"

interface User {
  id: string
  name: string
  email: string
  role: string
}

// Mock data for users
const users: User[] = [
  { id: "1", name: "John Athlete", email: "john@example.com", role: "athlete" },
  { id: "2", name: "Jane Trainer", email: "jane@example.com", role: "trainer" },
]

// Lookup user by email
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    // In a real implementation, you would:
    // 1. Validate the user is authenticated
    // 2. Look up the user in the database by email

    // Mock implementation
    const user = users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error looking up user:", error)
    return NextResponse.json({ error: "Failed to lookup user" }, { status: 500 })
  }
}
