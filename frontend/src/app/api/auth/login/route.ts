import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // In a real application, you would validate credentials against a database
    // For this example, we'll simulate a successful login
    if (email && password) {
      // Simulate database check
      const user = {
        id: '1',
        name: 'Demo User',
        email: email,
        role: 'athlete', // Default role for demo purposes
      };
      
      // In a real app, you would generate a real JWT token
      const token = 'fake-jwt-token-for-demo-purposes';
      
      return NextResponse.json({
        user,
        token,
        message: 'Успешный вход'
      });
    } else {
      return NextResponse.json(
        { message: 'Неверные учетные данные' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Произошла ошибка при входе' },
      { status: 500 }
    );
  }
}