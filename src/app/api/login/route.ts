import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/database";
import jwt from "jsonwebtoken";

// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ve şifre gereklidir." },
        { status: 400 }
      );
    }

    // Find user
    const user = await userDb.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await userDb.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı." },
        { status: 401 }
      );
    }

    // Generate JWT token
    const secret = process.env.NEXTAUTH_SECRET || "default-secret-key-change-in-production";
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      secret,
      { expiresIn: "7d" }
    );

    // Return token and user info
    // ✅ Response header'larını açıkça belirt - Content-Type ve Cache-Control
    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          teamId: user.teamId,
          teamNumber: user.teamNumber,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Giriş sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
