import { NextResponse } from "next/server"

interface Team {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
}

interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: string
}

// Mock data for teams and members
const teams: Team[] = []
const teamMembers: TeamMember[] = []

// Get all teams for a user
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    // In a real implementation, you would:
    // 1. Validate the user is authenticated
    // 2. Check if the requested user ID matches the authenticated user
    // 3. Fetch teams from the database

    // Mock implementation
    // Get all teams where the user is the owner
    const ownedTeams = teams.filter((team) => team.ownerId === userId)

    // Get all teams where the user is a member
    const memberTeams = teamMembers
      .filter((tm) => tm.userId === userId)
      .map((tm) => teams.find((t) => t.id === tm.teamId))
      .filter((team): team is Team => team !== undefined) // Remove undefined values

    // Combine and deduplicate teams
    const userTeams = [...ownedTeams, ...memberTeams].filter(
      (team, index, self) => self.findIndex((t) => t.id === team.id) === index,
    )

    return NextResponse.json(userTeams)
  } catch (error) {
    console.error("Error fetching user teams:", error)
    return NextResponse.json({ error: "Failed to fetch user teams" }, { status: 500 })
  }
}
