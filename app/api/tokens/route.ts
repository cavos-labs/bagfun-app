import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorAddress = searchParams.get('creator_address');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    // Get the bagfun-web API URL and key from environment variables
    const bagfunWebApiUrl = process.env.BAGFUN_WEB_API_URL || 'http://localhost:3000';
    const apiKey = process.env.BAGFUN_WEB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      limit,
      offset,
    });

    if (creatorAddress) {
      queryParams.append('creator_address', creatorAddress);
    }

    // Forward the request to bagfun-web API
    const response = await fetch(`${bagfunWebApiUrl}/api/tokens?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

    const result = await response.json();

    // Forward the response status and body
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}