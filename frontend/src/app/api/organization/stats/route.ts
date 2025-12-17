import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trainerId = searchParams.get('trainerId');

  if (!trainerId) {
    return NextResponse.json({ error: 'Trainer ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/organization/stats/${trainerId}`, {
        cache: 'no-store'
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
