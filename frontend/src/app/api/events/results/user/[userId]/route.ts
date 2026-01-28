import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    const response = await fetch(`${BACKEND_URL}/events/results/user/${userId}`, {
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
        { message: data.message || 'Ошибка при получении результатов' },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Произошла ошибка при получении результатов' },
      { status: 500 }
    );
  }
}
