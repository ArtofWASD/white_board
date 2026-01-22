import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role } = body;
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/users/${id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ message: 'Error updating user role' }, { status: 500 });
  }
}
