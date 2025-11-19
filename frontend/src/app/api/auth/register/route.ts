import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();
    
    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || 'http://backend:3001';
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json({
        user: data.user,
        token: data.token,
        message: 'Успешная регистрация'
      });
    } else {
      return NextResponse.json(
        { message: data.message || 'Все поля обязательны для заполнения' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Произошла ошибка при регистрации' },
      { status: 500 }
    );
  }
}