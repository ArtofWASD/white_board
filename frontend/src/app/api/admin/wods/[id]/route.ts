import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    const { id } = await params;
    const body = await request.json();

    if (!authorization) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/wods/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
       return NextResponse.json({ message: 'Error from backend' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating wod' }, { status: 500 });
  }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const headersList = await headers();
      const authorization = headersList.get('authorization');
      const { id } = await params;
  
      if (!authorization) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const response = await fetch(`${backendUrl}/wods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authorization,
        },
      });
  
      if (!response.ok) {
         return NextResponse.json({ message: 'Error from backend' }, { status: response.status });
      }
  
      return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
      return NextResponse.json({ message: 'Error deleting wod' }, { status: 500 });
    }
  }
