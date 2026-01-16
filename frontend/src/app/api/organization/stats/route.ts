import { NextResponse } from 'next/server';

import { cookies } from "next/headers"

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Helper function to get token from localStorage (we'll get it from cookies in the request)
async function getToken(request: Request) {
  // Try to get token from Authorization header first
  const authHeader =
    request.headers.get("Authorization") || request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader
  }

  // Fallback to cookies
  const cookieStore = await cookies()
  const token = cookieStore.get("token")
  return token ? `Bearer ${token.value}` : null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trainerId = searchParams.get('trainerId');

  if (!trainerId) {
    return NextResponse.json({ error: 'Trainer ID is required' }, { status: 400 });
  }

  try {
    // Get token from request
    const authHeader = await getToken(request)

    const response = await fetch(`${BACKEND_URL}/organization/stats/${trainerId}`, {
        cache: 'no-store',
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
    });
    
    // Check if the response body is empty or invalid JSON
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        if (response.ok) {
            return NextResponse.json(data);
        } else {

            return NextResponse.json(data, { status: response.status });
        }
    } catch (e) {

        return NextResponse.json({ error: 'Invalid response from backend' }, { status: 500 });
    }

  } catch (error) {

    return NextResponse.json(
      { error: 'Failed to fetch organization stats' },
      { status: 500 }
    );
  }
}
