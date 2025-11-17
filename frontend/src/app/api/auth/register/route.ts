import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();
    
    // In a real application, you would:
    // 1. Validate the input data
    // 2. Check if user already exists
    // 3. Hash the password
    // 4. Save user to database
    // 5. Generate JWT token
    
    // For this example, we'll simulate a successful registration
    if (name && email && password && role) {
      // Simulate database save
      const user = {
        id: Date.now().toString(),
        name: name,
        email: email,
        role: role, // Include role in user object
      };
      
      // In a real app, you would generate a real JWT token
      const token = 'fake-jwt-token-for-demo-purposes';
      
      return NextResponse.json({
        user,
        token,
        message: 'Успешная регистрация'
      });
    } else {
      return NextResponse.json(
        { message: 'Все поля обязательны для заполнения' },
        { status: 400 }
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