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

    // Basic password validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
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

    // Register user
    const result = await cavosAuth.signUp(email, password, orgSecret);

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      data: {
        email: result.data.email,
        wallet_address: result.data.wallet.address,
        network: result.data.wallet.network || network || "sepolia",
        created_at: result.data.created_at,
      },
    });

  } catch (error: any) {
    console.error("Sign up error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Registration failed",
      },
      { status: 400 }
    );
  }
}