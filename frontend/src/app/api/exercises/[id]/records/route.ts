import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const exerciseId = id;

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/exercises/${exerciseId}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error creating exercise record:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise record' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const exerciseId = id;

  try {
    const response = await fetch(`${BACKEND_URL}/exercises/${exerciseId}/records`);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching exercise records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise records' },
      { status: 500 }
    );
  }
}
