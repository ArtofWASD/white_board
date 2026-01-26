import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function PATCH(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const key = params.key;
    const body = await request.json();

    const response = await fetch(`${backendUrl}/settings/${key}`, {
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
    return NextResponse.json({ message: 'Error updating setting' }, { status: 500 });
  }
}
