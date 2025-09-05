import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { toBeHex } from '@/lib/utils';

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function withCORS(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellTokenAddress = searchParams.get('sellTokenAddress');
    const buyTokenAddress = searchParams.get('buyTokenAddress');
    const sellAmount = searchParams.get('sellAmount');

    // Validate required parameters
    if (!sellTokenAddress || !buyTokenAddress || !sellAmount) {
      return withCORS(
        NextResponse.json(
          { error: 'Missing required parameters: sellTokenAddress, buyTokenAddress, sellAmount' },
          { status: 400 }
        )
      );
    }

    // Validate sellAmount is a valid number
    const amount = parseFloat(sellAmount);
    if (isNaN(amount) || amount <= 0) {
      return withCORS(
        NextResponse.json(
          { error: 'sellAmount must be a positive number' },
          { status: 400 }
        )
      );
    }

    // Convert amount to wei (multiply by 10^18 for ERC20 tokens with 18 decimals)
    const amountInWei = BigInt(Math.floor(amount * 10**18));
    const amountHex = toBeHex(amountInWei);

    let quotes;
    try {
      quotes = (
        await axios.get(
          `https://starknet.api.avnu.fi/swap/v2/quotes?sellTokenAddress=${sellTokenAddress}&buyTokenAddress=${buyTokenAddress}&sellAmount=${amountHex}&size=1`
        )
      ).data;
    } catch (err: any) {
      console.error("[SWAP] Error fetching quotes from AVNU", err);
      return withCORS(
        NextResponse.json(
          { 
            error: "Swap provider error", 
            details: err.response?.data?.message || err.message 
          }, 
          { status: 502 }
        )
      );
    }

    // Return the quotes response in the expected format
    return withCORS(NextResponse.json({
      quotes: quotes.quotes || quotes, // Handle both formats
      prices: quotes.prices || []
    }, { status: 200 }));
  } catch (error: any) {
    console.error('Unexpected error in quotes API:', error);
    return withCORS(
      NextResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      )
    );
  }
}