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

    const response = await fetch(`${backendUrl}/organization/admin/all`, {
      headers: {
        'Authorization': authorization,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
        // Forward backend error or generic error
       return NextResponse.json({ message: 'Error from backend' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching organizations' }, { status: 500 });
  }
}
