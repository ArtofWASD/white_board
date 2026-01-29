import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/content-exercises`, {
      headers: {
        'Authorization': authorization,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
       return NextResponse.json({ message: 'Error from backend' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching global exercises' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    const body = await request.json();

    if (!authorization) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/content-exercises`, {
      method: 'POST',
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
    return NextResponse.json({ message: 'Error creating global exercise' }, { status: 500 });
  }
}
