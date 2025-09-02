import { NextRequest, NextResponse } from "next/server";
import { CavosAuth } from "cavos-service-sdk";

export async function POST(request: NextRequest) {
  try {
    const { email, password, network } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Get environment variables
    const appId = process.env.NEXT_PUBLIC_CAVOS_APP_ID;
    const orgSecret = process.env.CAVOS_ORG_SECRET;

    if (!appId || !orgSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error",
        },
        { status: 500 }
      );
    }

    // Initialize CavosAuth instance
    const cavosAuth = new CavosAuth(network || "sepolia", appId);

    // Sign in user
    const result = await cavosAuth.signIn(email, password, orgSecret);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      access_token: result.data.authData.accessToken,
      wallet_address: result.data.wallet.address,
      email: result.data.email,
      network: result.data.wallet.network || network || "sepolia",
    });

  } catch (error: any) {
    console.error("Sign in error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Login failed",
      },
      { status: 400 }
    );
  }
}