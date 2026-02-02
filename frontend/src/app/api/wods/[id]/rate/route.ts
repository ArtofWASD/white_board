
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function getToken(request: Request) {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  return token ? `Bearer ${token.value}` : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const authHeader = await getToken(request);
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Using the public rate endpoint
    const backendApiUrl = new URL(`${backendUrl}/wods/${id}/rate`);

    const response = await fetch(backendApiUrl.toString(), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error('Backend error updating wod rating:', data);
      return NextResponse.json(
        { message: data.message || 'Failed to update rating' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error updating wod rating:', error);
    return NextResponse.json(
      { error: 'Failed to update rating' },
      { status: 500 }
    );
  }
}
