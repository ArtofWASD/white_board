import { NextResponse } from 'next/server';

// Create a new event
export async function POST(request: Request) {
  try {
    const { userId, title, eventDate, description, exerciseType } = await request.json();
    
    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || 'http://backend:3001';
    const response = await fetch(`${backendUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, title, eventDate, description, exerciseType }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json({
        event: data,
        message: 'Событие успешно создано'
      });
    } else {
      return NextResponse.json(
        { message: data.message || 'Ошибка при создании события' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { message: 'Произошла ошибка при создании события' },
      { status: 500 }
    );
  }
}

// Get events by user ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || 'http://backend:3001';
    const response = await fetch(`${backendUrl}/events/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { message: data.message || 'Ошибка при получении событий' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { message: 'Произошла ошибка при получении событий' },
      { status: 500 }
    );
  }
}