import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exercises/${userId}`);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Frontend API: Received POST request for exercise');
    console.log(`Frontend API: Forwarding to ${BACKEND_URL}/exercises`);
    
    const response = await fetch(`${BACKEND_URL}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    console.log(`Frontend API: Backend response status: ${response.status}`);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error('Frontend API: Backend returned error:', data);
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
