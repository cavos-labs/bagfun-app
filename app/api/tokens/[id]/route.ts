import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    // Get the bagfun-web API URL and key from environment variables
    const bagfunWebApiUrl = process.env.BAGFUN_WEB_API_URL || 'https://bbag.fun';
    const apiKey = process.env.BAGFUN_WEB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    console.log('Fetching token details for ID:', id, 'from:', `${bagfunWebApiUrl}/api/tokens/${id}`);
    
    // Forward the request to bagfun-web API
    const response = await fetch(`${bagfunWebApiUrl}/api/tokens/${id}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch token: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Successfully fetched token details');
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching token details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token details' },
      { status: 500 }
    );
  }
}