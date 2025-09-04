import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { txHash: string } }
) {
  try {
    const { txHash } = params;
    
    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    console.log('Fetching transaction details for:', txHash);
    
    const response = await fetch(`https://voyager.online/api/txn/${txHash}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; bag.fun)',
      },
    });

    if (!response.ok) {
      console.error('Voyager API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Voyager API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched transaction details');
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching transaction details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction details' },
      { status: 500 }
    );
  }
}