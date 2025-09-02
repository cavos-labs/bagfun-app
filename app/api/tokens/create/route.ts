import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the bagfun-web API URL and key from environment variables
    const bagfunWebApiUrl = process.env.BAGFUN_WEB_API_URL || 'http://localhost:3000';
    const apiKey = process.env.BAGFUN_WEB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    // Forward the request to bagfun-web API
    const response = await fetch(`${bagfunWebApiUrl}/api/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    // Forward the response status and body
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}